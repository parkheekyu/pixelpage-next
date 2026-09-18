/**
 * 슬랙 AI 직원 — 워커에서 employee_turn 작업을 처리한다.
 * 직원 정의: agents/employees.json · 기억: dash.agent_memory · 대화: dash.agent_messages · 정기 업무: dash.agent_routines
 */
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

const TEAM = JSON.parse(readFileSync("agents/employees.json", "utf8"));
const EMP = Object.fromEntries(TEAM.employees.map((e) => [e.id, e]));
const byName = (s) => TEAM.employees.find((e) => e.id === s || e.name === s || e.aliases.includes(s)) ?? null;
const MAX_DEPTH = 2;

// ---------- Slack (직원별 봇 토큰) ----------
let BOTS = {}; let botsLoadedAt = 0;
async function loadBots(db) {
  if (Date.now() - botsLoadedAt < 60000) return BOTS;
  const { data } = await db.from("slack_bots").select("employee_id,bot_token,bot_user_id");
  BOTS = Object.fromEntries((data ?? []).filter((b) => b.bot_token).map((b) => [b.employee_id, b])); botsLoadedAt = Date.now();
  return BOTS;
}
async function slackApi(method, body, token) {
  const r = await fetch(`https://slack.com/api/${method}`, { method: "POST", headers: { authorization: `Bearer ${token || process.env.SLACK_BOT_TOKEN}`, "content-type": "application/json; charset=utf-8" }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  return r.json();
}
/** 직원 자신의 봇 계정으로 게시. 자기 앱이 아직 설치 안 됐으면 공용 봇으로 이름을 붙여 게시 */
async function postAs(db, emp, channel, thread_ts, text) {
  const bots = await loadBots(db); const mine = bots[emp.id];
  const base = { channel, ...(thread_ts ? { thread_ts } : {}) };
  const j = mine ? await slackApi("chat.postMessage", { ...base, text }, mine.bot_token)
                 : await slackApi("chat.postMessage", { ...base, text: `*${emp.name} · ${emp.title}*\n${text}` });
  if (!j.ok) throw new Error(`Slack chat.postMessage: ${j.error}`);
  return j;
}
/** 답변 본문에서 동료 이름을 그 직원의 슬랙 멘션으로 바꾼다 ("민준," → "<@U…>,") */
function mentionize(db, text, selfId) {
  return (async () => { const bots = await loadBots(db); let t = text;
    for (const e of TEAM.employees) { if (e.id === selfId || !bots[e.id]?.bot_user_id) continue; t = t.replace(new RegExp(`(^|[\\s(])${e.name}(?=[,아야님 ]|$)`, "gm"), `$1<@${bots[e.id].bot_user_id}>`); }
    return t; })();
}

// ---------- Claude CLI (도구 허용) ----------
function runEmployee(system, prompt, env, { model = "opus", effort = "high", limitMin = 12 } = {}) {
  return new Promise((resolve, reject) => {
    const args = ["-p", "--model", model, "--effort", effort, "--output-format", "text", "--no-session-persistence", "--system-prompt", system,
      "--allowedTools", "Bash(node scripts/dash-data.mjs:*),WebSearch,WebFetch", "--disallowedTools", "Edit,Write,Read,Glob,Grep,Agent,NotebookEdit"];
    const p = spawn("claude", args, { stdio: ["pipe", "pipe", "pipe"], env: { ...process.env, ...env, CLAUDECODE: "" } });
    let out = "", err = "";
    const timer = setTimeout(() => { p.kill("SIGKILL"); reject(new Error(`${limitMin}분 초과로 중단`)); }, limitMin * 60 * 1000);
    p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (err += d));
    p.on("error", (e) => { clearTimeout(timer); reject(e); });
    p.on("close", (code) => { clearTimeout(timer); if (code === 0 && out.trim()) resolve(out.trim()); else reject(new Error(`claude 종료 코드 ${code}: ${err.trim().slice(0, 500) || out.slice(0, 300) || "빈 응답"}`)); });
    p.stdin.end(prompt);
  });
}

const kst = (d = new Date()) => new Date(d.getTime() + 9 * 3600 * 1000);
const fmtTs = (ts) => { const d = kst(new Date(Number(ts) * 1000)); return d.toISOString().slice(5, 16).replace("T", " "); };

/** 답변 본문과 ===META=== JSON 분리 */
function parseOutput(text) {
  const i = text.lastIndexOf("===META===");
  if (i < 0) return { reply: text.trim(), meta: {} };
  let meta = {}; try { const m = text.slice(i + 10).match(/\{[\s\S]*\}/); if (m) meta = JSON.parse(m[0]); } catch {}
  return { reply: text.slice(0, i).trim(), meta };
}

async function resolveProject(db, payload, transcript) {
  if (payload.project_id) { const { data } = await db.from("projects").select("id,name").eq("id", payload.project_id).maybeSingle(); if (data) return data; }
  const { data: integ } = await db.from("project_integrations").select("project_id").eq("slack_channel_id", payload.channel).maybeSingle();
  if (integ?.project_id) { const { data } = await db.from("projects").select("id,name").eq("id", integ.project_id).maybeSingle(); if (data) return data; }
  const { data: all } = await db.from("projects").select("id,name").eq("active", true);
  const hay = [payload.text, ...transcript.map((m) => m.text)].join("\n");
  return (all ?? []).find((p) => hay.includes(p.name)) ?? null;
}

export async function processEmployeeTurn(db, job, { log, model, effort }) {
  const pl = job.payload ?? {};
  const emp = EMP[pl.employee] ?? TEAM.employees.find((e) => e.default);
  const t0 = Date.now();
  const thread = pl.thread_ts ?? null;

  // 대화 맥락: 스레드 전체 + (스레드가 없거나 짧으면) 채널 최근 메시지
  const { data: th } = thread ? await db.from("agent_messages").select("ts,user_name,employee_id,text").eq("channel", pl.channel).or(`thread_ts.eq.${thread},ts.eq.${thread}`).order("ts").limit(60) : { data: [] };
  const { data: recent } = await db.from("agent_messages").select("ts,user_name,employee_id,text,thread_ts").eq("channel", pl.channel).is("thread_ts", null).order("ts", { ascending: false }).limit(12);
  const transcript = (th ?? []);
  const project = await resolveProject(db, pl, transcript);

  // 기억: 이 직원 + 팀 공유, 고객사 무관 + 해당 고객사
  let mq = db.from("agent_memory").select("employee_id,project_id,kind,content,importance,created_at").in("employee_id", [emp.id, "team"]).order("importance", { ascending: false }).order("created_at", { ascending: false }).limit(60);
  mq = project ? mq.or(`project_id.is.null,project_id.eq.${project.id}`) : mq.is("project_id", null);
  const { data: mem } = await mq;
  const { data: routines } = await db.from("agent_routines").select("employee_id,schedule,prompt").eq("employee_id", emp.id).eq("enabled", true);

  const roster = TEAM.employees.map((e) => `- ${e.name} (${e.title})${e.id === emp.id ? " ← 나" : ""}`).join("\n");
  const memText = (mem ?? []).map((m) => `- [${m.kind}${m.project_id ? "·고객사" : ""}·${String(m.created_at).slice(0, 10)}] ${m.content}`).join("\n") || "(아직 없음)";
  const line = (m) => `${fmtTs(m.ts)} ${m.employee_id ? `${EMP[m.employee_id]?.name ?? m.employee_id}(직원)` : m.user_name}: ${m.text}`;
  const thText = transcript.map(line).join("\n");
  const chText = (recent ?? []).reverse().filter((m) => m.ts !== thread).map(line).join("\n");

  const system = `${TEAM.team_rules}\n\n[너의 역할]\n${emp.persona}\n\n[팀원]\n${roster}\n\n[데이터 도구 — Bash 로 실행. 이 명령만 허용된다]\n${readFileSync("scripts/dash-data.mjs", "utf8").split("\n").filter((l) => l.startsWith(" *   node")).map((l) => l.replace(/^ \*\s+/, "")).join("\n")}\n고객사 이름은 --project 에 그대로 쓴다. 숫자를 말하기 전에 반드시 조회한다. 웹 검색(WebSearch/WebFetch)은 리서치 목적일 때만.\n\n[출력 형식]\n먼저 슬랙에 올릴 답변 본문만 쓴다(인사말·자기소개 없이 바로 본론, 슬랙 mrkdwn: *굵게*, • 불릿, 표·헤더·이모지 금지).\n본문 뒤에 반드시 한 줄 '===META===' 를 쓰고 JSON 한 개를 붙인다:\n{"remember":[{"content":"기억할 내용(한 문장, 구체적으로)","kind":"note|decision|preference|todo","importance":1-5,"shared":false}],"handoffs":[{"to":"직원이름","message":"그 직원에게 부탁하는 말"}],"project":"고객사이름 또는 null"}\n- remember: 대표의 결정·선호·지시, 고객사 특이사항, 다음에 이어서 할 일만. 잡담·단순 조회 결과는 남기지 않는다. 없으면 [].\n- handoffs: 다른 직원이 이어서 해야 할 일이 있을 때만. 없으면 [].\n- 팀 전체가 알아야 할 기억은 shared:true.`;

  const who = pl.from_employee ? `${EMP[pl.from_employee]?.name ?? pl.from_employee}(직원)` : pl.routine ? "정기 업무(시스템)" : `${pl.user_name}(대표)`;
  const prompt = [
    `[지금] ${kst().toISOString().slice(0, 16).replace("T", " ")} KST · 채널 ${pl.channel}${pl.channel_type === "im" ? " (대표와의 DM)" : ""}${project ? ` · 이 채널/대화의 고객사: ${project.name}` : " · 고객사 미지정"}`,
    `\n[나의 기억]\n${memText}`,
    routines?.length ? `\n[나의 정기 업무]\n${routines.map((r) => `- ${r.schedule}: ${r.prompt.slice(0, 80)}`).join("\n")}` : "",
    chText ? `\n[채널 최근 대화]\n${chText}` : "",
    thText ? `\n[이 스레드]\n${thText}` : "",
    `\n[지금 답할 메시지] ${who}:\n${pl.text}`,
    pl.routine ? "\n(정기 업무이므로 질문을 되묻지 말고 데이터를 조회해 보고 형태로 작성한다.)" : "",
  ].filter(Boolean).join("\n");

  log(`[직원:${emp.name}] 시작 ${job.id} (${who}: ${String(pl.text).slice(0, 40)}…)`);
  const env = { DASH_SLACK_CHANNEL: pl.channel, DASH_SLACK_THREAD: thread ?? "", DASH_EMPLOYEE: emp.name };
  const raw = await runEmployee(system, prompt, env, { model, effort });
  const { reply, meta } = parseOutput(raw);
  if (!reply) throw new Error("빈 답변");

  const posted = await postAs(db, emp, pl.channel, thread, (await mentionize(db, reply, emp.id)).slice(0, 3900));
  await db.from("agent_messages").upsert({ channel: pl.channel, channel_type: pl.channel_type ?? null, thread_ts: thread && thread !== posted.ts ? thread : null, ts: posted.ts, employee_id: emp.id, user_name: emp.name, project_id: project?.id ?? null, text: reply }, { onConflict: "channel,ts" });
  await db.from("agent_jobs").update({ status: "done", result_text: raw, result_json: meta, finished_at: new Date().toISOString(), project_id: project?.id ?? null }).eq("id", job.id);

  const projId = project?.id ?? (meta.project ? (await db.from("projects").select("id").eq("name", meta.project).maybeSingle()).data?.id ?? null : null);
  const rem = Array.isArray(meta.remember) ? meta.remember.filter((m) => m && typeof m.content === "string" && m.content.trim()).slice(0, 6) : [];
  if (rem.length) await db.from("agent_memory").insert(rem.map((m) => ({ employee_id: m.shared ? "team" : emp.id, project_id: projId, kind: ["note", "decision", "preference", "todo"].includes(m.kind) ? m.kind : "note", content: m.content.trim().slice(0, 500), importance: Math.min(5, Math.max(1, Number(m.importance) || 3)), source: `slack:${pl.channel}/${posted.ts}` })));

  const depth = Number(pl.depth ?? 0);
  const hos = Array.isArray(meta.handoffs) ? meta.handoffs.filter((h) => h && h.to && h.message).slice(0, 2) : [];
  for (const h of hos) {
    const to = byName(String(h.to).trim()); if (!to || to.id === emp.id) continue;
    if (depth >= MAX_DEPTH) { log(`  인계 생략 (깊이 ${depth}): ${emp.name} → ${to.name}`); continue; }
    await db.from("agent_jobs").insert({ project_id: projId, kind: "employee_turn", engine: "claude", payload: { employee: to.id, channel: pl.channel, channel_type: pl.channel_type, thread_ts: thread ?? posted.ts, trigger_ts: posted.ts, text: h.message, from_employee: emp.id, user_name: emp.name, depth: depth + 1, project_id: projId } });
    log(`  인계: ${emp.name} → ${to.name}: ${String(h.message).slice(0, 50)}`);
  }
  log(`[직원:${emp.name}] 완료 ${job.id} (${Math.round((Date.now() - t0) / 1000)}s, 기억 ${rem.length}, 인계 ${hos.length})`);
}

/** 정기 업무: 시간이 되면 employee_turn 등록 (KST, 하루 한 번) */
export async function enqueueRoutines(db, { log }) {
  const now = kst(); const today = now.toISOString().slice(0, 10); const hm = now.toISOString().slice(11, 16); const dow = now.getUTCDay(); // kst 보정된 Date 이므로 UTC getter 사용
  const { data: rs } = await db.from("agent_routines").select("*").eq("enabled", true);
  for (const r of rs ?? []) {
    if (r.last_run_on === today) continue;
    const m = r.schedule.match(/^(daily|weekdays|weekly\s+(sun|mon|tue|wed|thu|fri|sat))\s+(\d{2}:\d{2})$/i); if (!m) continue;
    const time = m[3]; if (hm < time) continue;
    if (m[1].toLowerCase() === "weekdays" && (dow === 0 || dow === 6)) continue;
    if (m[2] && ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].indexOf(m[2].toLowerCase()) !== dow) continue;
    const { data: upd } = await db.from("agent_routines").update({ last_run_on: today }).eq("id", r.id).neq("last_run_on", today).select("id");
    if (!upd?.length && r.last_run_on) continue;
    await db.from("agent_routines").update({ last_run_on: today }).eq("id", r.id);
    await db.from("agent_jobs").insert({ project_id: r.project_id, kind: "employee_turn", engine: "claude", payload: { employee: r.employee_id, channel: r.channel, thread_ts: null, text: r.prompt, routine: true, user_name: "시스템", depth: 0, project_id: r.project_id } });
    log(`정기 업무 등록: ${EMP[r.employee_id]?.name ?? r.employee_id} · ${r.schedule}`);
  }
}

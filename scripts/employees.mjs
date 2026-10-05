/**
 * 슬랙 AI 직원 — 워커에서 employee_turn 작업을 처리한다.
 * 직원 정의: agents/employees.json · 기억: dash.agent_memory · 대화: dash.agent_messages · 정기 업무: dash.agent_routines
 */
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { YES, NO } from "./youtube-watch.mjs";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import os from "node:os";

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
    for (const e of TEAM.employees) { if (e.id === selfId || !bots[e.id]?.bot_user_id) continue; t = t.replace(new RegExp(`(^|[\\s(])${e.name}(?=(아|야|님|,|한테|에게)(?![가-힣]))`, "gm"), `$1<@${bots[e.id].bot_user_id}>`); }
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

async function resolveProject(db, payload, transcript, emp) {
  if (emp?.project && !payload.project_id) { const { data } = await db.from("projects").select("id,name").eq("name", emp.project).maybeSingle(); if (data) { const hay = [payload.text, ...transcript.map((m) => m.text)].join("\n"); const { data: all } = await db.from("projects").select("id,name").eq("active", true); const other = (all ?? []).find((p) => p.name !== emp.project && hay.includes(p.name)); return other ?? data; } }
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
  if (/^U[A-Z0-9]{6,}$/.test(pl.user_name ?? "")) { try { const bots = await loadBots(db); const tok = Object.values(bots)[0]?.bot_token; const j = await slackApi("users.info", { user: pl.user_name }, tok); if (j.ok) { pl.user_name = j.user.real_name ?? j.user.name ?? pl.user_name; await db.from("agent_messages").update({ user_name: pl.user_name }).eq("user_id", pl.user_id).like("user_name", "U%"); } } catch {} }
  const thread = pl.thread_ts ?? null;

  // 대화 맥락: 스레드 전체 + (스레드가 없거나 짧으면) 채널 최근 메시지
  const { data: th } = thread ? await db.from("agent_messages").select("ts,user_name,employee_id,text").eq("channel", pl.channel).or(`thread_ts.eq.${thread},ts.eq.${thread}`).order("ts").limit(60) : { data: [] };
  const { data: recent } = await db.from("agent_messages").select("ts,user_name,employee_id,text,thread_ts").eq("channel", pl.channel).is("thread_ts", null).order("ts", { ascending: false }).limit(12);
  const transcript = (th ?? []);
  const project = await resolveProject(db, pl, transcript, emp);

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

  const system = `${TEAM.team_rules}\n\n[너의 역할]\n${emp.persona}\n\n[팀원]\n${roster}\n\n[데이터 도구 — Bash 로 실행. 이 명령만 허용된다]\n${readFileSync("scripts/dash-data.mjs", "utf8").split("\n").filter((l) => l.startsWith(" *   node")).map((l) => l.replace(/^ \*\s+/, "")).join("\n")}\n고객사 이름은 --project 에 그대로 쓴다. 숫자를 말하기 전에 반드시 조회한다. 웹 검색(WebSearch/WebFetch)은 리서치 목적일 때만.\n\n[출력 형식]\n먼저 슬랙에 올릴 답변 본문만 쓴다. 동료에게 채팅하듯 문장으로, 서식 없이. 인사말·자기소개·마무리 문구 없이 바로 본론.\n본문 뒤에 반드시 한 줄 '===META===' 를 쓰고 JSON 한 개를 붙인다:\n{"remember":[{"content":"기억할 내용(한 문장, 구체적으로)","kind":"note|decision|preference|todo","importance":1-5,"shared":false}],"handoffs":[{"to":"직원이름","message":"그 직원에게 부탁하는 말"}],"project":"고객사이름 또는 null"}\n- remember: 대표의 결정·선호·지시, 고객사 특이사항, 다음에 이어서 할 일만. 잡담·단순 조회 결과는 남기지 않는다. 없으면 [].\n- handoffs: 다른 직원이 이어서 해야 할 일이 있을 때만. 없으면 [].\n- 팀 전체가 알아야 할 기억은 shared:true.`;

  const who = pl.from_employee ? `${EMP[pl.from_employee]?.name ?? pl.from_employee}(직원)` : pl.routine ? "정기 업무(시스템)" : pl.notify ? `${pl.source ?? "시스템"}(자동 알림)` : `${pl.user_name}(대표)`;
  const prompt = [
    `[지금] ${kst().toISOString().slice(0, 16).replace("T", " ")} KST · 채널 ${pl.channel}${pl.channel_type === "im" ? " (대표와의 DM)" : ""}${project ? ` · 이 채널/대화의 고객사: ${project.name}` : " · 고객사 미지정"}`,
    `\n[나의 기억]\n${memText}`,
    routines?.length ? `\n[나의 정기 업무]\n${routines.map((r) => `- ${r.schedule}: ${r.prompt.slice(0, 80)}`).join("\n")}` : "",
    chText ? `\n[채널 최근 대화]\n${chText}` : "",
    thText ? `\n[이 스레드]\n${thText}` : "",
    `\n[지금 답할 메시지] ${who}:\n${pl.text}`,
    pl.routine ? "\n(정기 업무이므로 질문을 되묻지 말고 데이터를 조회해 보고 형태로 작성한다.)" : "",
    pl.notify ? "\n(위는 우리 쪽 자동화 도구가 광고 계정에 실제로 적용한 변경 내용이다. 대표님께 '무엇을 왜 어떻게 바꿨는지' 를 네 말투로 2~3문장으로 전한다. 수치는 알림에 있는 그대로 쓰고, 도구 조회는 필요할 때만. 대표 판단이 필요한 점이 있으면 한 줄로 덧붙인다.)" : "",
  ].filter(Boolean).join("\n");

  // 스레드가 아니라 채널에 바로 "응/아니" 라고 답한 경우: 그 채널의 가장 최근(24시간 내) 미답 질문에 대한 답으로 본다
  let answerThread = thread;
  if (!thread && !pl.from_employee && (YES.test(String(pl.text).trim()) || NO.test(String(pl.text).trim()))) {
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const [{ data: ap }, { data: yv }] = await Promise.all([
      db.from("agent_approvals").select("slack_ts,created_at").eq("slack_channel", pl.channel).eq("status", "pending").gte("created_at", since).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      db.from("yt_videos").select("slack_ts,created_at").eq("slack_channel", pl.channel).eq("status", "asked").gte("created_at", since).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    const cands = [ap, yv].filter((x) => x?.slack_ts).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    if (cands[0]) answerThread = cands[0].slack_ts;
  }
  // 외부 도구의 승인 질문 스레드에 대표가 답했으면 기록 (LLM 없이)
  if (answerThread && !pl.from_employee) {
    const thread = answerThread;
    const { data: ap } = await db.from("agent_approvals").select("*").eq("slack_channel", pl.channel).eq("slack_ts", thread).eq("status", "pending").maybeSingle();
    if (ap) {
      const t = String(pl.text).trim(); const yes = YES.test(t), no = NO.test(t);
      if (yes || no) {
        await db.from("agent_approvals").update({ status: yes ? "approved" : "declined", answer: t, answered_by: pl.user_name, decided_at: new Date().toISOString() }).eq("id", ap.id);
        const msg = yes ? "네, 그렇게 진행할게요." : "알겠어요, 이번엔 안 할게요.";
        const posted = await postAs(db, emp, pl.channel, thread, msg);
        await db.from("agent_messages").upsert({ channel: pl.channel, thread_ts: thread, ts: posted.ts, employee_id: emp.id, user_name: emp.name, project_id: ap.project_id, text: msg }, { onConflict: "channel,ts" });
        await db.from("agent_jobs").update({ status: "done", result_json: { approval: yes ? "approved" : "declined" }, finished_at: new Date().toISOString() }).eq("id", job.id);
        log(`[직원:${emp.name}] 승인 질문 답변: ${yes ? "승인" : "거절"} (${ap.question.slice(0, 40)})`); return;
      }
    }
  }
  // 유튜브 영상 질문 스레드에 대표가 답했으면 승인/거절을 바로 처리 (LLM 없이)
  if (answerThread && !pl.from_employee) {
    const thread = answerThread;
    const { data: yv } = await db.from("yt_videos").select("*").eq("slack_channel", pl.channel).eq("slack_ts", thread).eq("status", "asked").maybeSingle();
    if (yv) {
      const t = String(pl.text).trim();
      const say = async (msg) => { const posted = await postAs(db, emp, pl.channel, thread, msg); await db.from("agent_messages").upsert({ channel: pl.channel, thread_ts: thread, ts: posted.ts, employee_id: emp.id, user_name: emp.name, project_id: yv.project_id, text: msg }, { onConflict: "channel,ts" }); };
      if (YES.test(t)) {
        const { data: vj } = await db.from("agent_jobs").insert({ project_id: yv.project_id, kind: "video_ad", engine: "claude", payload: { video_id: yv.video_id, url: yv.url, title: yv.title, channel_title: yv.channel_title, project_id: yv.project_id, employee: emp.id, channel: pl.channel, thread_ts: thread } }).select("id").single();
        await db.from("yt_videos").update({ status: "approved", decided_at: new Date().toISOString(), job_id: vj?.id ?? null }).eq("video_id", yv.video_id);
        await say("네, 지금 만들게요. 보통 20~40분 걸려요. 끝나면 여기에 올릴게요.");
        await db.from("agent_jobs").update({ status: "done", result_json: { yt: "approved" }, finished_at: new Date().toISOString() }).eq("id", job.id);
        log(`[직원:${emp.name}] 유튜브 광고 승인 → video_ad 등록 (${yv.title})`); return;
      }
      if (NO.test(t)) {
        await db.from("yt_videos").update({ status: "declined", decided_at: new Date().toISOString() }).eq("video_id", yv.video_id);
        await say("알겠어요, 이건 패스할게요.");
        await db.from("agent_jobs").update({ status: "done", result_json: { yt: "declined" }, finished_at: new Date().toISOString() }).eq("id", job.id);
        log(`[직원:${emp.name}] 유튜브 광고 거절 (${yv.title})`); return;
      }
    }
  }
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

const AD_DIR = "/Users/heekyu/광고제작";
// 광고제작 프로젝트에서 허용하는 도구: 파일·셸 작업은 그 프로젝트 안에서만 (permission 은 -p 모드에서 허용 목록 외 자동 거부)
const AD_TOOLS = "Bash,Read,Write,Edit,Glob,Grep,WebFetch";
/** 승인된 유튜브 영상 → 광고제작 프로젝트에서 유튜브-디하클 프리셋으로 편집, 결과를 스레드에 보고 */
export async function processVideoAd(db, job, { log }) {
  const pl = job.payload ?? {}; const emp = EMP[pl.employee] ?? TEAM.employees.find((e) => e.default);
  const { data: proj } = await db.from("projects").select("name,slug").eq("id", pl.project_id).maybeSingle();
  const slug = proj?.slug ?? "beforest";
  await db.from("yt_videos").update({ status: "producing" }).eq("video_id", pl.video_id);
  const t0 = Date.now();
  const prompt = `${proj?.name ?? slug}(${slug}) 광고 소재 제작 요청입니다.\n유튜브 원본: ${pl.url}\n채널: ${pl.channel_title ?? ""} / 제목: ${pl.title ?? ""}\n\n유튜브-디하클 프리셋(youtube_dhc, pipeline/clip_ad.py)으로 편집해 주세요. clients/${slug}/CLAUDE.md 와 references 의 확정 스타일을 그대로 따르고, 결과물은 ~/Desktop/YYMMDD_강사명/ 에 NN숏폼_강사.mp4 + NN정방형_강사.mp4 로 저장합니다. 사람에게 되묻지 말고 판단해서 끝까지 진행하세요.\n완료되면 마지막 줄에 정확히 이 형식으로만 출력하세요:\nOUTPUT_DIR: <결과 폴더 절대경로>\nSUMMARY: <헤드라인과 편집 요약 두 문장>`;
  const desk = path.join(os.homedir(), "Desktop");
  const before = new Set(existsSync(desk) ? readdirSync(desk) : []);
  let out = "";
  try {
    out = await new Promise((resolve, reject) => {
      const p = spawn("claude", ["-p", "--model", "opus", "--effort", "high", "--output-format", "text", "--no-session-persistence", "--allowedTools", AD_TOOLS], { cwd: AD_DIR, stdio: ["pipe", "pipe", "pipe"], env: { ...process.env, CLAUDECODE: "" } });
      let o = "", e = ""; const timer = setTimeout(() => { p.kill("SIGKILL"); reject(new Error("120분 초과로 중단")); }, 120 * 60 * 1000);
      p.stdout.on("data", (d) => (o += d)); p.stderr.on("data", (d) => (e += d)); p.on("error", (x) => { clearTimeout(timer); reject(x); });
      p.on("close", (c) => { clearTimeout(timer); c === 0 && o.trim() ? resolve(o) : reject(new Error(`claude 종료 코드 ${c}: ${(e || o).slice(-400)}`)); });
      p.stdin.end(prompt);
    });
  } catch (e) {
    await db.from("yt_videos").update({ status: "error", error: String(e.message).slice(0, 500) }).eq("video_id", pl.video_id);
    await db.from("agent_jobs").update({ status: "error", error: String(e.message).slice(0, 1000), finished_at: new Date().toISOString() }).eq("id", job.id);
    await postAs(db, emp, pl.channel, pl.thread_ts, `죄송해요, 편집이 중간에 멈췄어요. (${String(e.message).slice(0, 120)}) 다시 시도할까요?`);
    log(`[영상광고] 실패 ${job.id}: ${e.message}`); return;
  }
  let dir = out.match(/OUTPUT_DIR:\s*(.+)/)?.[1]?.trim().replace(/^~/, os.homedir()) ?? "";
  const summary = out.match(/SUMMARY:\s*([\s\S]+)$/)?.[1]?.trim().slice(0, 400) ?? "";
  if (!dir || !existsSync(dir)) { const added = readdirSync(desk).filter((f) => !before.has(f) && /^\d{6}_/.test(f)).map((f) => path.join(desk, f)).sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs); if (added[0]) dir = added[0]; }
  // 이번 작업에서 새로 생긴 파일만 보고 (같은 캠페인 폴더에 이어 쌓는 경우 예전 파일 제외)
  const files = dir && existsSync(dir) ? readdirSync(dir).filter((f) => /\.mp4$/i.test(f) && statSync(path.join(dir, f)).mtimeMs >= t0 - 60000).sort() : [];
  await db.from("yt_videos").update({ status: files.length ? "done" : "error", output_path: dir || null, error: files.length ? null : "결과 파일 없음" }).eq("video_id", pl.video_id);
  await db.from("agent_jobs").update({ status: "done", result_text: out.slice(-4000), finished_at: new Date().toISOString() }).eq("id", job.id);
  const mins = Math.round((Date.now() - t0) / 60000);
  const text = files.length
    ? `다 됐어요 (${mins}분). 바탕화면 ${path.basename(dir)} 폴더에 ${files.length}개 넣었어요.\n${files.slice(0, 12).map((f) => "• " + f).join("\n")}${files.length > 12 ? `\n… 외 ${files.length - 12}개` : ""}${summary ? "\n\n" + summary : ""}`
    : `편집은 끝났는데 결과 파일을 못 찾았어요. 바탕화면을 한번 봐 주세요.${summary ? "\n" + summary : ""}`;
  const posted = await postAs(db, emp, pl.channel, pl.thread_ts, text);
  await db.from("agent_messages").upsert({ channel: pl.channel, thread_ts: pl.thread_ts, ts: posted.ts, employee_id: emp.id, user_name: emp.name, project_id: pl.project_id, text }, { onConflict: "channel,ts" });
  for (const f of files.slice(0, 4)) { try { await uploadFile(db, emp, pl.channel, pl.thread_ts, path.join(dir, f)); } catch (e) { log(`업로드 생략 ${f}: ${e.message}`); break; } }
  log(`[영상광고] 완료 ${job.id} (${mins}분, ${files.length}개)`);
}
async function uploadFile(db, emp, channel, thread_ts, file) {
  const bots = await loadBots(db); const tok = bots[emp.id]?.bot_token; if (!tok) throw new Error("토큰 없음");
  const buf = readFileSync(file); const name = path.basename(file);
  const u = await slackApi("files.getUploadURLExternal", { filename: name, length: buf.length }, tok);
  if (!u.ok) throw new Error(u.error);
  const fd = new FormData(); fd.append("file", new Blob([buf]), name);
  await fetch(u.upload_url, { method: "POST", body: fd });
  const c = await slackApi("files.completeUploadExternal", { files: [{ id: u.file_id, title: name }], channel_id: channel, thread_ts }, tok);
  if (!c.ok) throw new Error(c.error);
}

/** 멘션 없는 메시지: 누가 답할지 맥락으로 판단해 employee_turn 등록 (빠른 모델, 도구 없음) */
export async function processDispatch(db, job, { log }) {
  const pl = job.payload ?? {};
  // 고객사 채널이면 그 고객사 담당자가 답한다 (담당자가 스레드에서 이름을 부른 다른 직원은 그대로 존중)
  const { data: integ0 } = await db.from("project_integrations").select("project_id").eq("slack_channel_id", pl.channel).maybeSingle();
  if (integ0?.project_id) {
    const { data: pj } = await db.from("projects").select("name").eq("id", integ0.project_id).maybeSingle();
    const owner = TEAM.employees.find((e) => e.project && pj && e.project === pj.name);
    const named = TEAM.employees.find((e) => new RegExp(`(^|[\\s,])${e.name}(아|야|님|,|\\s|$)`).test(String(pl.text).slice(0, 20)));
    const pick = named ?? owner;
    if (pick) {
      await db.from("agent_jobs").insert({ project_id: integ0.project_id, kind: "employee_turn", engine: "claude", payload: { ...pl, employee: pick.id, project_id: integ0.project_id } });
      await db.from("agent_jobs").update({ status: "done", result_json: { respond: [pick.id], reason: "project-channel" }, finished_at: new Date().toISOString() }).eq("id", job.id);
      log(`배분(고객사 채널 ${pj?.name}): "${String(pl.text).slice(0, 30)}" → ${pick.name}`); return;
    }
  }
  const thread = pl.thread_ts && pl.thread_ts !== pl.trigger_ts ? pl.thread_ts : null;
  const { data: th } = thread ? await db.from("agent_messages").select("ts,user_name,employee_id,text").eq("channel", pl.channel).or(`thread_ts.eq.${thread},ts.eq.${thread}`).order("ts").limit(30) : { data: [] };
  const { data: recent } = await db.from("agent_messages").select("ts,user_name,employee_id,text").eq("channel", pl.channel).is("thread_ts", null).neq("ts", pl.trigger_ts).order("ts", { ascending: false }).limit(10);
  const line = (m) => `${m.employee_id ? `${EMP[m.employee_id]?.name ?? m.employee_id}(직원)` : m.user_name}: ${String(m.text).slice(0, 200)}`;
  const roster = TEAM.employees.map((e) => `- ${e.id}: ${e.name} (${e.title})`).join("\n");
  const system = `너는 슬랙 채널의 배분 담당이다. 직원은 고객사별 담당자 1명 + 실장이다. 메시지에 고객사 이름이 나오면 그 담당자, 아니면 실장(hana). 대표가 멘션 없이 올린 메시지를 보고 어느 AI 직원이 답해야 하는지 정한다.\n직원:\n${roster}\n규칙\n- 특정 직원 이름을 부르면 그 직원. 업무 영역이 분명하면 그 담당 1명. 두 영역에 걸치면 2명.\n- "모두", "다들", "전원", "각자", "팀" 처럼 전체를 부르거나, 인사·공지·전원 의견 요청이면 6명 전원을 넣는다.\n- 스레드 안이면 그 스레드에서 말하던 직원이 우선.\n- 사람끼리 하는 대화, 단순 반응("ㅇㅋ", "고마워" 등 답이 필요 없는 말)이면 빈 배열.\n- 애매하면 hana.\n출력은 JSON 한 개만: {"respond":["doyun"]}`;
  const prompt = `${(recent ?? []).length ? `[채널 최근]\n${(recent ?? []).reverse().map(line).join("\n")}\n\n` : ""}${(th ?? []).length ? `[이 스레드]\n${(th ?? []).map(line).join("\n")}\n\n` : ""}[메시지] ${pl.user_name}: ${pl.text}`;
  let ids = [];
  try {
    const out = await new Promise((resolve, reject) => {
      const p = spawn("claude", ["-p", "--model", "sonnet", "--output-format", "text", "--no-session-persistence", "--system-prompt", system, "--disallowedTools", "Bash,Edit,Write,Read,Glob,Grep,WebFetch,WebSearch,Agent,NotebookEdit"], { stdio: ["pipe", "pipe", "pipe"], env: { ...process.env, CLAUDECODE: "" } });
      let o = "", e = ""; const t = setTimeout(() => { p.kill("SIGKILL"); reject(new Error("배분 판단 60초 초과")); }, 60000);
      p.stdout.on("data", (d) => (o += d)); p.stderr.on("data", (d) => (e += d)); p.on("error", (x) => { clearTimeout(t); reject(x); });
      p.on("close", (c) => { clearTimeout(t); c === 0 ? resolve(o) : reject(new Error(e.slice(0, 200))); }); p.stdin.end(prompt);
    });
    const m = out.match(/\{[\s\S]*\}/); const j = m ? JSON.parse(m[0]) : {};
    ids = Array.isArray(j.respond) ? j.respond.map((x) => byName(String(x))?.id).filter(Boolean) : [];
  } catch (e) { log(`배분 판단 실패(${e.message}) → 하나`); ids = ["hana"]; }
  ids = [...new Set(ids)];
  for (const id of ids) await db.from("agent_jobs").insert({ project_id: job.project_id ?? null, kind: "employee_turn", engine: "claude", payload: { ...pl, employee: id } });
  await db.from("agent_jobs").update({ status: "done", result_json: { respond: ids }, finished_at: new Date().toISOString() }).eq("id", job.id);
  log(`배분: "${String(pl.text).slice(0, 30)}" → ${ids.map((i) => EMP[i]?.name).join(", ") || "없음"}`);
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

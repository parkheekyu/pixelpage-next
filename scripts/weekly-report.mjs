#!/usr/bin/env node
/**
 * 주간 보고서: 고객사별로 지난주(월~일) 광고·리드·랜딩 숫자를 모아 PDF 한 개로 만들고, 담당 직원 이름으로 고객사 슬랙 채널에 올린다.
 * 매주 월요일 09:00 에 워커가 실행한다 (agents/schedules.json).
 *   node scripts/weekly-report.mjs                    전체 고객사, 슬랙에 올림
 *   node scripts/weekly-report.mjs --project 비포레스트  한 곳만
 *   node scripts/weekly-report.mjs --dry              슬랙에 올리지 않고 PDF 만 만든다 (경로를 출력)
 * 광고 계정은 읽기만 한다. 켜기·끄기·예산 변경은 하지 않는다.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { spawn, execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ""); }
const argv = process.argv.slice(2);
const DRY = argv.includes("--dry"), NO_AI = argv.includes("--no-ai");
const ONLY = argv.includes("--project") ? argv[argv.indexOf("--project") + 1] : null;
const SITE = process.env.WORKER_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://pixelpage.co.kr";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { db: { schema: "dash" }, auth: { persistSession: false } });
const EMPLOYEES = JSON.parse(readFileSync(path.join(ROOT, "agents/employees.json"), "utf8"));
const EMP_LIST = Array.isArray(EMPLOYEES) ? EMPLOYEES : EMPLOYEES.employees;

// ---------- 기간: 지난주 월~일, 그 전주 (한국 시간) ----------
const ymd = (d) => d.toISOString().slice(0, 10);
const kstNow = new Date(Date.now() + 9 * 3600_000);
const dow = (kstNow.getUTCDay() + 6) % 7; // 월=0
const thisMon = new Date(Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate() - dow));
const day = (n) => new Date(thisMon.getTime() + n * 86400_000);
const WEEK = { since: ymd(day(-7)), until: ymd(day(-1)) }, PREV = { since: ymd(day(-14)), until: ymd(day(-8)) };
const md = (s) => `${Number(s.slice(5, 7))}/${Number(s.slice(8, 10))}`;

// ---------- 메타 (읽기 전용) ----------
const FIELDS = "campaign_id,campaign_name,ad_id,ad_name,spend,impressions,reach,frequency,inline_link_clicks,actions,action_values,video_thruplay_watched_actions,video_p100_watched_actions";
async function insights(acct, level, range) {
  const out = []; let url = new URL(`https://graph.facebook.com/v21.0/act_${String(acct).replace(/^act_/, "")}/insights`);
  for (const [k, v] of Object.entries({ level, fields: FIELDS, time_range: JSON.stringify(range), limit: "200", filtering: JSON.stringify([{ field: "spend", operator: "GREATER_THAN", value: "0" }]), access_token: process.env.META_ACCESS_TOKEN })) url.searchParams.set(k, v);
  while (url) {
    const j = await (await fetch(url, { signal: AbortSignal.timeout(60000) })).json();
    if (j.error) throw new Error(`Meta API: ${j.error.message}`);
    out.push(...(j.data ?? [])); url = j.paging?.next ? new URL(j.paging.next) : null;
  }
  return out.map(norm);
}
const num = (v) => Number(v) || 0;
const act = (arr, ...types) => { for (const t of types) { const f = (arr ?? []).find((a) => a.action_type === t); if (f) return num(f.value); } return 0; };
function norm(r) {
  const leads = act(r.actions, "lead", "onsite_conversion.lead_grouped", "offsite_conversion.fb_pixel_lead", "onsite_web_lead", "submit_application");
  const purchases = act(r.actions, "purchase", "offsite_conversion.fb_pixel_purchase", "omni_purchase");
  return { campaign_id: r.campaign_id, campaign: r.campaign_name, ad: r.ad_name, spend: num(r.spend), imp: num(r.impressions), reach: num(r.reach), clicks: num(r.inline_link_clicks), lpv: act(r.actions, "landing_page_view"), leads, purchases,
    revenue: act(r.action_values, "purchase", "offsite_conversion.fb_pixel_purchase", "omni_purchase"), v3: act(r.actions, "video_view"), thru: act(r.video_thruplay_watched_actions, "video_view"), p100: act(r.video_p100_watched_actions, "video_view") };
}
const total = (rows) => rows.reduce((a, r) => { for (const k of ["spend", "imp", "reach", "clicks", "lpv", "leads", "purchases", "revenue", "v3", "thru", "p100"]) a[k] += r[k]; return a; }, { spend: 0, imp: 0, reach: 0, clicks: 0, lpv: 0, leads: 0, purchases: 0, revenue: 0, v3: 0, thru: 0, p100: 0 });
/** 숫자 묶음에서 보고용 지표를 뽑는다 */
function metrics(t, goal) {
  const result = goal === "purchase" ? t.purchases : t.leads;
  return { spend: t.spend, result, cost: result ? t.spend / result : null, ctr: t.imp ? (t.clicks / t.imp) * 100 : null, form: t.clicks ? (result / t.clicks) * 100 : null, cpm: t.imp ? (t.spend / t.imp) * 1000 : null,
    freq: t.reach ? t.imp / t.reach : null, hook: t.v3 && t.imp ? (t.v3 / t.imp) * 100 : null, hold: t.v3 ? (t.thru / t.v3) * 100 : null, roas: goal === "purchase" && t.spend ? (t.revenue / t.spend) * 100 : null, imp: t.imp, clicks: t.clicks, lpv: t.lpv };
}

// ---------- 표시 ----------
const W = (v) => (v == null ? "–" : "₩" + Math.round(v).toLocaleString("ko-KR"));
const N = (v) => (v == null ? "–" : Math.round(v).toLocaleString("ko-KR"));
const P = (v, d = 1) => (v == null ? "–" : v.toFixed(d) + "%");
const esc = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
/** 전주 대비 변화. lowerBetter 면 내려간 것이 좋은 것 */
function delta(cur, prev, lowerBetter = false) {
  if (cur == null || prev == null || !prev) return "";
  const d = ((cur - prev) / prev) * 100; if (Math.abs(d) < 0.5) return `<i class="d flat">변동 없음</i>`;
  const good = lowerBetter ? d < 0 : d > 0;
  return `<i class="d ${good ? "up" : "down"}">${d > 0 ? "▲" : "▼"} ${Math.abs(d).toFixed(0)}%</i>`;
}

// ---------- 해석 (Claude CLI). 실패하면 해석 없이 숫자만 보고한다 ----------
function claude(prompt) {
  return new Promise((resolve, reject) => {
    const p = spawn("claude", ["-p", "--model", "opus", "--output-format", "text", "--no-session-persistence", "--disallowedTools", "Bash,Edit,Write,Read,Glob,Grep,WebFetch,WebSearch,Agent,Task"], { stdio: ["pipe", "pipe", "pipe"], env: { ...process.env, CLAUDECODE: "" } });
    let o = "", e = ""; const timer = setTimeout(() => { p.kill("SIGKILL"); reject(new Error("해석 시간 초과")); }, 5 * 60_000);
    p.stdout.on("data", (d) => (o += d)); p.stderr.on("data", (d) => (e += d)); p.on("error", (x) => { clearTimeout(timer); reject(x); });
    p.on("close", (c) => { clearTimeout(timer); c === 0 && o.trim() ? resolve(o.trim()) : reject(new Error(`claude 종료 코드 ${c}: ${(e || o).slice(-200)}`)); });
    p.stdin.end(prompt);
  });
}
async function commentary(name, goal, data) {
  if (NO_AI) return null;
  const prompt = `너는 광고 대행사의 담당자다. 아래는 고객사 "${name}"의 지난주(${WEEK.since}~${WEEK.until}) 메타 광고 숫자와 그 전주 숫자다. 전환 목표는 ${goal === "purchase" ? "구매" : "리드"}다.
대표에게 올리는 주간 보고서의 해석 부분을 쓴다. 숫자에 근거한 것만 쓰고, 데이터에 없는 것은 지어내지 않는다. 광고 계정을 직접 조작하겠다는 말이나 대표에게 되묻는 질문은 쓰지 않는다.
form 은 링크 클릭 대비 결과 비율(폼 전환율), hook 은 노출 중 3초 이상 본 비율, hold 는 3초 본 사람 중 15초 이상 본 비율, freq 는 빈도다.
아래 JSON 형식으로만 답한다. 다른 글은 쓰지 않는다. 각 항목은 한국어 한 문장, 합쇼체, 60자 안팎.
{"summary":"지난주를 한 문장으로","good":["잘된 점 1~2개"],"bad":["아쉬운 점 1~2개"],"next":["이번 주에 해 볼 것 3개. 구체적인 소재·캠페인 이름을 들어서"]}

${JSON.stringify(data)}`;
  try {
    const raw = await claude(prompt); const j = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
    const arr = (v, n) => (Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()).slice(0, n) : []);
    return { summary: typeof j.summary === "string" ? j.summary : "", good: arr(j.good, 2), bad: arr(j.bad, 2), next: arr(j.next, 3) };
  } catch (e) { console.error(`  해석 생략 (${name}): ${e.message}`); return null; }
}

async function dashText(op, params) {
  const q = new URLSearchParams({ op, ...params });
  const r = await fetch(`${SITE}/api/agent/data?${q}`, { headers: { authorization: `Bearer ${process.env.LEAD_WEBHOOK_SECRET ?? ""}` }, signal: AbortSignal.timeout(60000) });
  return r.ok ? r.text() : "";
}

// ---------- PDF ----------
const CSS = `@page{size:A4;margin:16mm 15mm}*{box-sizing:border-box}body{font-family:"Pretendard","Apple SD Gothic Neo",sans-serif;color:#16181d;font-size:11.5px;line-height:1.55;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
h1{font-size:21px;margin:0 0 2px;letter-spacing:-.02em}h2{font-size:13.5px;margin:20px 0 8px;padding-bottom:5px;border-bottom:1.5px solid #16181d}.meta{color:#6b7280;font-size:11px}
.sum{margin:12px 0 4px;padding:11px 14px;background:#f1f1fb;border-radius:8px;font-size:13px;font-weight:600}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.kpi{border:1px solid #e3e5ea;border-radius:8px;padding:9px 11px}.kpi span{display:block;color:#6b7280;font-size:10.5px}.kpi b{display:block;font-size:17px;letter-spacing:-.02em;margin:1px 0}
.d{font-style:normal;font-size:10.5px}.d.up{color:#0a8f5b}.d.down{color:#d6453d}.d.flat{color:#9aa0aa}
table{width:100%;border-collapse:collapse;font-size:10.5px}th{text-align:right;color:#6b7280;font-weight:500;padding:5px 6px;border-bottom:1px solid #cfd3da;white-space:nowrap}td{text-align:right;padding:6px;border-bottom:1px solid #eceef2;font-variant-numeric:tabular-nums;white-space:nowrap}
th:first-child,td:first-child{text-align:left;white-space:normal;word-break:break-all;width:34%}tr.tot td{font-weight:700;border-top:1.5px solid #16181d;border-bottom:0}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:14px}.box h3{font-size:11.5px;margin:0 0 5px}.box ul,ol{margin:0;padding-left:17px}li{margin:3px 0}
.fn{display:flex;align-items:center;gap:6px;margin-top:4px}.fn div{flex:1;background:#f1f1fb;border-radius:7px;padding:8px 10px}.fn div:last-of-type{background:#5b5bd6;color:#fff}.fn span{display:block;font-size:10px;opacity:.75}.fn b{font-size:15px}.fn em{font-style:normal;font-size:10.5px;color:#6b7280;white-space:nowrap}
.note{color:#6b7280;font-size:10.5px;margin-top:6px}footer{margin-top:22px;color:#9aa0aa;font-size:10px}`;

function buildHtml({ name, emp, goal, cur, prev, campaigns, ads, ai, leadLine, landing }) {
  const rl = goal === "purchase" ? "구매" : "리드", cl = goal === "purchase" ? "CPA" : "리드 단가";
  const kpi = (label, v, d) => `<div class="kpi"><span>${label}</span><b>${v}</b>${d || `<i class="d flat">&nbsp;</i>`}</div>`;
  const row = (label, m, cls = "") => `<tr class="${cls}"><td>${esc(label)}</td><td>${W(m.spend)}</td><td>${N(m.result)}</td><td>${W(m.cost)}</td><td>${P(m.ctr, 2)}</td><td>${P(m.form)}</td><td>${W(m.cpm)}</td><td>${m.freq == null ? "–" : m.freq.toFixed(2)}</td><td>${P(m.hook)}</td><td>${P(m.hold)}</td></tr>`;
  const steps = [["노출", cur.imp], ["링크 클릭", cur.clicks], ...(cur.lpv > 0 && cur.lpv >= cur.result ? [["랜딩 도착", cur.lpv]] : []), [rl, cur.result]];
  const list = (title, items) => (items?.length ? `<div class="box"><h3>${title}</h3><ul>${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : "");
  return `<!doctype html><html lang="ko"><meta charset="utf-8"><style>${CSS}</style><body>
<h1>${esc(name)} 주간 보고</h1><div class="meta">${WEEK.since} ~ ${WEEK.until} (월~일) · 전주 ${md(PREV.since)}~${md(PREV.until)} 대비 · 작성 ${esc(emp.name)} (${esc(emp.title)})</div>
${ai?.summary ? `<div class="sum">${esc(ai.summary)}</div>` : ""}
<h2>지난주 숫자</h2>
<div class="kpis">${kpi("소진액", W(cur.spend), delta(cur.spend, prev.spend))}${kpi(rl, N(cur.result), delta(cur.result, prev.result))}${kpi(cl, W(cur.cost), delta(cur.cost, prev.cost, true))}${goal === "purchase" ? kpi("ROAS", P(cur.roas, 0), delta(cur.roas, prev.roas)) : kpi("폼 전환율", P(cur.form), delta(cur.form, prev.form))}
${kpi("CTR", P(cur.ctr, 2), delta(cur.ctr, prev.ctr))}${kpi("CPM", W(cur.cpm), delta(cur.cpm, prev.cpm, true))}${kpi("빈도", cur.freq == null ? "–" : cur.freq.toFixed(2), delta(cur.freq, prev.freq, true))}${kpi("훅 비율", P(cur.hook), delta(cur.hook, prev.hook))}</div>
<h2>${rl} 퍼널</h2>
<div class="fn">${steps.map(([l, n], i) => `${i ? `<em>${P(steps[i - 1][1] ? (n / steps[i - 1][1]) * 100 : null, n / (steps[i - 1][1] || 1) < 0.1 ? 2 : 1)} →</em>` : ""}<div><span>${l}</span><b>${N(n)}</b></div>`).join("")}</div>
${leadLine ? `<div class="note">리드 시트 기준: ${esc(leadLine)}</div>` : ""}
<h2>캠페인별</h2>
<table><thead><tr><th>캠페인</th><th>소진액</th><th>${rl}</th><th>${cl}</th><th>CTR</th><th>폼 전환율</th><th>CPM</th><th>빈도</th><th>훅</th><th>지속률</th></tr></thead><tbody>${campaigns.map((c) => row(c.name, c.m)).join("")}${row("합계", cur, "tot")}</tbody></table>
<h2>소재별 (소진액 큰 순 ${ads.length}개)</h2>
<table><thead><tr><th>소재</th><th>소진액</th><th>${rl}</th><th>${cl}</th><th>CTR</th><th>폼 전환율</th><th>CPM</th><th>빈도</th><th>훅</th><th>지속률</th></tr></thead><tbody>${ads.map((a) => row(a.name, a.m)).join("")}</tbody></table>
<div class="note">CTR은 링크 클릭 기준, 폼 전환율은 링크 클릭 대비 ${rl}, 훅은 노출 중 3초 이상 본 비율, 지속률은 3초 본 사람 중 15초 이상 본 비율입니다.</div>
${landing ? `<h2>랜딩페이지</h2>${landing}` : ""}
${ai ? `<h2>해석</h2><div class="cols">${list("잘된 점", ai.good)}${list("아쉬운 점", ai.bad)}</div>${ai.next.length ? `<h2>이번 주에 해 볼 것</h2><ol>${ai.next.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>` : ""}` : ""}
<footer>픽셀페이지 · 메타 광고 관리자 수치 기준 · 자동 작성</footer></body></html>`;
}

async function slack(method, body, token) { return (await fetch(`https://slack.com/api/${method}`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json; charset=utf-8" }, body: JSON.stringify(body) })).json(); }
async function uploadPdf(token, channel, file, title, comment) {
  const buf = readFileSync(file), name = path.basename(file);
  const u = await slack("files.getUploadURLExternal", { filename: name, length: buf.length }, token); if (!u.ok) throw new Error(`Slack 업로드 주소: ${u.error}`);
  const fd = new FormData(); fd.append("file", new Blob([buf]), name); await fetch(u.upload_url, { method: "POST", body: fd });
  const c = await slack("files.completeUploadExternal", { files: [{ id: u.file_id, title }], channel_id: channel, initial_comment: comment }, token); if (!c.ok) throw new Error(`Slack 업로드: ${c.error}`);
}

// ---------- 실행 ----------
const { data: projects } = await db.from("projects").select("id,name,slug,landing_url,has_lead_sheet").eq("active", true).order("name");
const { data: integs } = await db.from("project_integrations").select("project_id,meta_ad_account_id,meta_goal,slack_channel_id,ga4_property_id");
const { data: bots } = await db.from("slack_bots").select("employee_id,bot_token");
const outDir = path.join(os.homedir(), "Desktop", "픽셀페이지-주간보고", WEEK.since); mkdirSync(outDir, { recursive: true });
let done = 0;
for (const p of projects ?? []) {
  if (ONLY && p.name !== ONLY && p.slug !== ONLY) continue;
  const integ = (integs ?? []).find((i) => i.project_id === p.id);
  if (!integ?.meta_ad_account_id) { if (ONLY) console.log(`${p.name}: 메타 광고 계정 미연동`); continue; }
  if (!integ.slack_channel_id && !DRY) { if (ONLY) console.log(`${p.name}: 슬랙 채널 미등록`); continue; }
  const goal = integ.meta_goal === "purchase" ? "purchase" : "lead";
  try {
    const [campW, adW, campP] = await Promise.all([insights(integ.meta_ad_account_id, "campaign", WEEK), insights(integ.meta_ad_account_id, "ad", WEEK), insights(integ.meta_ad_account_id, "campaign", PREV)]);
    if (!campW.length) { console.log(`${p.name}: 지난주 소진 없음, 건너뜀`); continue; }
    const cur = metrics(total(campW), goal), prev = metrics(total(campP), goal);
    const campaigns = campW.sort((a, b) => b.spend - a.spend).slice(0, 10).map((c) => ({ name: c.campaign, m: metrics(c, goal) }));
    const ads = adW.sort((a, b) => b.spend - a.spend).slice(0, 10).map((a) => ({ name: a.ad, m: metrics(a, goal) }));
    const emp = EMP_LIST.find((e) => e.project === p.name) ?? EMP_LIST.find((e) => e.id === "doyun") ?? EMP_LIST[0];
    let leadLine = "";
    if (p.has_lead_sheet) { const t = await dashText("leads", { project: p.name, from: WEEK.since, to: WEEK.until, limit: "1" }).catch(() => ""); leadLine = (t.split("\n")[0] ?? "").replace(/^\[[^\]]*\]\s*/, ""); }
    const ai = await commentary(p.name, goal, { week: cur, prev_week: prev, campaigns, ads });
    const html = buildHtml({ name: p.name, emp, goal, cur, prev, campaigns, ads, ai, leadLine, landing: "" });
    const base = path.join(outDir, `${p.name}_주간보고_${WEEK.since}`);
    writeFileSync(`${base}.html`, html);
    execFileSync(CHROME, ["--headless", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${base}.pdf`, `file://${base}.html`], { stdio: "ignore", timeout: 60000 });
    if (!existsSync(`${base}.pdf`)) throw new Error("PDF 생성 실패");
    if (DRY) { console.log(`${p.name}: ${base}.pdf`); done++; continue; }
    const token = (bots ?? []).find((b) => b.employee_id === emp.id)?.bot_token || process.env.SLACK_BOT_TOKEN;
    const rl = goal === "purchase" ? "구매" : "리드";
    const comment = `${md(WEEK.since)}~${md(WEEK.until)} 주간 보고예요.\n소진액 ${W(cur.spend)} · ${rl} ${N(cur.result)}건 · ${goal === "purchase" ? "CPA" : "리드 단가"} ${W(cur.cost)}${ai?.summary ? `\n${ai.summary}` : ""}`;
    await uploadPdf(token, integ.slack_channel_id, `${base}.pdf`, `${p.name} 주간 보고 ${WEEK.since}`, comment);
    console.log(`${p.name}: 슬랙에 올림 (${emp.name})`); done++;
  } catch (e) { console.error(`${p.name}: 실패: ${e.message}`); }
}
console.log(`주간 보고 ${done}건 완료 (${WEEK.since}~${WEEK.until}${DRY ? ", 올리지 않음" : ""})`);

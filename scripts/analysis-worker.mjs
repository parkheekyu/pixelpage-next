/**
 * AI 분석 로컬 워커 — Claude Code CLI(`claude -p`)로 대기열(dash.analysis_jobs)을 처리한다.
 * API 키 없이 Claude 구독으로 분석을 돌리기 위한 방식. 이 컴퓨터가 켜져 있고 워커가 실행 중일 때만 처리된다.
 *
 * 사용법 (프로젝트 루트에서):
 *   node scripts/analysis-worker.mjs --once     # 대기 중인 작업을 모두 처리하고 종료
 *   node scripts/analysis-worker.mjs --watch    # 15초마다 확인하며 계속 실행 (터미널을 켜 두세요)
 * 옵션: --model opus|sonnet (기본 opus) · --effort high|medium|low (기본 high)
 */
import { createClient } from "@supabase/supabase-js";
import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import os, { hostname } from "node:os";
import path from "node:path";
import fs from "node:fs";

if (existsSync(".env.local")) for (const line of readFileSync(".env.local", "utf8").split("\n")) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ""); }
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : d; };
const WATCH = args.includes("--watch"), MODEL = opt("model", "opus"), EFFORT = opt("effort", "high"), WORKER = `${hostname()}#${process.pid}`;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요 (.env.local)"); process.exit(1); }
const db = createClient(url, key, { db: { schema: "dash" }, auth: { autoRefreshToken: false, persistSession: false } });
const log = (...a) => console.log(new Date().toLocaleTimeString("ko-KR", { hour12: false }), ...a);

function runClaude(system, prompt, kind) {
  return new Promise((resolve, reject) => {
    // 시장 리서치는 웹 검색·페이지 읽기 허용, 나머지는 도구 없이 문서만 작성
    const tools = kind === "market" || kind === "research"
      ? ["--allowedTools", "WebSearch,WebFetch", "--disallowedTools", "Bash,Edit,Write,Read,Glob,Grep,Agent,NotebookEdit"]
      : ["--disallowedTools", "Bash,Edit,Write,Read,Glob,Grep,WebFetch,WebSearch,Agent,NotebookEdit"];
    const limitMin = kind === "market" || kind === "research" ? 30 : 15;
    const p = spawn("claude", ["-p", "--model", MODEL, "--effort", EFFORT, "--output-format", "text", "--no-session-persistence", "--system-prompt", system, ...tools], { stdio: ["pipe", "pipe", "pipe"], env: { ...process.env, CLAUDECODE: "" } });
    let out = "", err = "";
    const timer = setTimeout(() => { p.kill("SIGKILL"); reject(new Error(`${limitMin}분 초과로 중단`)); }, limitMin * 60 * 1000);
    p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (err += d));
    p.on("error", (e) => { clearTimeout(timer); reject(e); });
    p.on("close", (code) => { clearTimeout(timer); if (code === 0 && out.trim()) resolve(out.trim()); else reject(new Error(`claude 종료 코드 ${code}: ${err.trim().slice(0, 500) || out.slice(0, 300) || "빈 응답"}`)); });
    p.stdin.end(prompt);
  });
}

// ---------- Codex CLI ----------
function runCodex(system, prompt, { limitMin = 15 } = {}) {
  return new Promise((resolve, reject) => {
    const outFile = path.join(os.tmpdir(), `codex-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`);
    const full = `[지시사항]\n${system}\n\n[작업]\n${prompt}`;
    const p = spawn("codex", ["exec", "--sandbox", "read-only", "--skip-git-repo-check", "-o", outFile, full], { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env } });
    let err = "", out = "";
    const timer = setTimeout(() => { p.kill("SIGKILL"); reject(new Error(`${limitMin}분 초과로 중단`)); }, limitMin * 60 * 1000);
    p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (err += d));
    p.on("error", (e) => { clearTimeout(timer); reject(e); });
    p.on("close", (code) => { clearTimeout(timer); let text = ""; try { text = fs.readFileSync(outFile, "utf8").trim(); fs.unlinkSync(outFile); } catch {} if (code === 0 && text) resolve(text); else reject(new Error(`codex 종료 코드 ${code}: ${(err || out).trim().slice(0, 500) || "빈 응답"}`)); });
  });
}
function extractJson(text) {
  const m = text.match(/\{[\s\S]*\}/); if (!m) throw new Error("JSON 을 찾지 못함");
  return JSON.parse(m[0]);
}

/** 범용 에이전트 작업 (agent_jobs) — 결과를 kind 별로 후처리 */
async function processAgentJob() {
  const { data: job } = await db.from("agent_jobs").select("*").eq("status", "queued").is("claimed_at", null).order("created_at").limit(1).maybeSingle();
  if (!job) return false;
  const { data: claimed } = await db.from("agent_jobs").update({ claimed_at: new Date().toISOString(), worker: WORKER, status: "running" }).eq("id", job.id).is("claimed_at", null).select("id");
  if (!claimed?.length) return true;
  if (job.kind === "creative_proposal") await db.from("proposals").update({ status: "running" }).eq("job_id", job.id);
  log(`[agent:${job.engine}] 시작 ${job.kind} ${job.id} (프롬프트 ${job.prompt.length.toLocaleString()}자)`);
  const t0 = Date.now();
  try {
    const text = job.engine === "codex" ? await runCodex(job.system_prompt, job.prompt) : await runClaude(job.system_prompt, job.prompt, job.kind);
    let json = null; try { json = extractJson(text); } catch {}
    await db.from("agent_jobs").update({ status: "done", result_text: text, result_json: json, finished_at: new Date().toISOString() }).eq("id", job.id);
    if (job.kind === "creative_proposal") {
      if (!json?.variants?.length) throw new Error("제안 JSON 형식 오류: variants 없음");
      const variants = json.variants.map((v, i) => ({ id: v.id || String.fromCharCode(65 + i), angle: v.angle ?? "", format: v.format ?? "", headline: v.headline ?? "", primary_text: v.primary_text ?? "", cta: v.cta ?? "", visual: v.visual ?? "", hook: v.hook ?? "", why: v.why ?? "" }));
      await db.from("proposals").update({ status: "proposed", variants, title: json.title || undefined, brief: undefined }).eq("job_id", job.id);
      // summary 는 brief 에 병합
      const { data: pr } = await db.from("proposals").select("id,brief").eq("job_id", job.id).maybeSingle();
      if (pr) await db.from("proposals").update({ brief: { ...(pr.brief ?? {}), summary: json.summary ?? "" } }).eq("job_id", job.id);
      // 슬랙 게시 (서버가 블록을 만들어 올림)
      if (pr && process.env.LEAD_WEBHOOK_SECRET) {
        const site = process.env.WORKER_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://pixelpage.co.kr";
        try { const r = await fetch(`${site}/api/slack/post-proposal`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${process.env.LEAD_WEBHOOK_SECRET}` }, body: JSON.stringify({ proposal_id: pr.id }) }); const j = await r.json(); log(`슬랙 게시: ${j.ok ? (j.skipped ? "건너뜀 (" + j.skipped + ")" : "완료 " + j.ts) : "실패 " + j.error}`); } catch (e) { log(`슬랙 게시 실패: ${e.message}`); }
      }
    }
    log(`[agent:${job.engine}] 완료 ${job.id} (${Math.round((Date.now() - t0) / 1000)}s)`);
  } catch (e) {
    await db.from("agent_jobs").update({ status: "error", error: String(e.message ?? e).slice(0, 1000), finished_at: new Date().toISOString() }).eq("id", job.id);
    if (job.kind === "creative_proposal") await db.from("proposals").update({ status: "error", error: String(e.message ?? e).slice(0, 500) }).eq("job_id", job.id);
    log(`[agent:${job.engine}] 실패 ${job.id}: ${e.message}`);
  }
  return true;
}

async function processOne() {
  const { data: job } = await db.from("analysis_jobs").select("*").is("claimed_at", null).order("created_at").limit(1).maybeSingle();
  if (!job) return false;
  // 선점 (동시 워커 대비)
  const { data: claimed } = await db.from("analysis_jobs").update({ claimed_at: new Date().toISOString(), worker: WORKER }).eq("analysis_id", job.analysis_id).is("claimed_at", null).select("analysis_id");
  if (!claimed?.length) return true;
  await db.from("analyses").update({ status: "running" }).eq("id", job.analysis_id);
  log(`처리 시작 [${job.kind}] ${job.analysis_id} (프롬프트 ${job.prompt.length.toLocaleString()}자)`);
  const t0 = Date.now();
  try {
    let text = await runClaude(job.system_prompt, job.prompt, job.kind);
    // 문서 제목 앞에 붙은 짧은 작업 메모(예: '파일 쓰기 도구가 없어서…')는 제거
    const h = text.search(/^#\s/m); if (h > 0 && h < 400) text = text.slice(h);
    await db.from("analyses").update({ status: "done", result_md: text, model: `claude-code-cli/${MODEL}`, error: null }).eq("id", job.analysis_id);
    await db.from("analysis_jobs").delete().eq("analysis_id", job.analysis_id);
    log(`완료 ${job.analysis_id} (${Math.round((Date.now() - t0) / 1000)}s, ${text.length.toLocaleString()}자)`);
  } catch (e) {
    await db.from("analyses").update({ status: "error", error: String(e.message ?? e).slice(0, 1000) }).eq("id", job.analysis_id);
    await db.from("analysis_jobs").delete().eq("analysis_id", job.analysis_id);
    log(`실패 ${job.analysis_id}: ${e.message}`);
  }
  return true;
}

// 이전 워커가 죽어 남은 선점(30분 초과)은 해제
await db.from("analysis_jobs").update({ claimed_at: null, worker: null }).lt("claimed_at", new Date(Date.now() - 30 * 60 * 1000).toISOString());
await db.from("agent_jobs").update({ claimed_at: null, worker: null, status: "queued" }).eq("status", "running").lt("claimed_at", new Date(Date.now() - 30 * 60 * 1000).toISOString());
log(`워커 시작 (${WORKER}, model=${MODEL}, effort=${EFFORT}, ${WATCH ? "watch" : "once"})`);
do {
  while ((await processOne()) || (await processAgentJob())) { /* 대기열이 빌 때까지 */ }
  if (WATCH) await new Promise((r) => setTimeout(r, 15000));
} while (WATCH);
log("대기열 비어 있음, 종료");

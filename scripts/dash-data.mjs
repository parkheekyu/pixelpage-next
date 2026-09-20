#!/usr/bin/env node
/**
 * AI 직원이 쓰는 데이터 조회 도구. 대시보드 서버(/api/agent/data)를 호출해 텍스트로 출력한다.
 *   node scripts/dash-data.mjs projects
 *   node scripts/dash-data.mjs project  --project 픽셀페이지
 *   node scripts/dash-data.mjs leads    --project 픽셀페이지 [--from 2026-09-01 --to 2026-09-18] [--view todo|conv|need|drop|dup] [--q 검색] [--limit 50]
 *   node scripts/dash-data.mjs meta     --project 픽셀페이지 [--preset last_7d|last_14d|last_30d|last_90d] [--refresh]
 *   node scripts/dash-data.mjs research --project 픽셀페이지
 *   node scripts/dash-data.mjs analyses --project 픽셀페이지 --kind ads|landing|market
 *   node scripts/dash-data.mjs landing  --project 픽셀페이지
 *   node scripts/dash-data.mjs perplexity --project 픽셀페이지 [--topic "조사할 주제"]   (API 키 있으면 바로 조사, 없으면 붙여넣기용 프롬프트)
 *   node scripts/dash-data.mjs proposals --project 픽셀페이지
 *   node scripts/dash-data.mjs propose  --project 픽셀페이지 [--count 4] [--notes "요청"] [--parent 제안ID] [--formats image_1x1,video_9x16]
 */
import { readFileSync, existsSync } from "node:fs";
if (existsSync(".env.local")) for (const line of readFileSync(".env.local", "utf8").split("\n")) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ""); }
const [op, ...rest] = process.argv.slice(2);
if (!op) { console.log("사용법: node scripts/dash-data.mjs <projects|project|leads|meta|research|analyses|landing|proposals|propose> --project 고객사 …"); process.exit(1); }
const q = new URLSearchParams({ op });
for (let i = 0; i < rest.length; i++) { const a = rest[i]; if (a.startsWith("--")) { const k = a.slice(2); const v = rest[i + 1] && !rest[i + 1].startsWith("--") ? rest[++i] : "1"; q.set(k, v); } }
if (op === "propose") { if (process.env.DASH_SLACK_CHANNEL) q.set("channel", process.env.DASH_SLACK_CHANNEL); if (process.env.DASH_SLACK_THREAD) q.set("thread", process.env.DASH_SLACK_THREAD); if (process.env.DASH_EMPLOYEE) q.set("by", process.env.DASH_EMPLOYEE); }
const site = process.env.WORKER_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://pixelpage.co.kr";
const r = await fetch(`${site}/api/agent/data?${q}`, { headers: { authorization: `Bearer ${process.env.LEAD_WEBHOOK_SECRET ?? ""}` }, signal: AbortSignal.timeout(110000) });
console.log(await r.text());

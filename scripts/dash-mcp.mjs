#!/usr/bin/env node
/**
 * 픽셀페이지 대시보드 MCP 서버 (stdio). AI 가 대시보드 내용을 읽고 고친다. 도구는 src/lib/dash/mcp-core.mjs 에 있다.
 * 이 맥에서만 돈다. .env.local 의 SUPABASE_SERVICE_ROLE_KEY 로 dash 스키마에 직접 접근하므로 권한 제한이 없다(삭제 포함).
 * 광고 계정 조작(켜기·끄기·예산)은 일부러 넣지 않았다. 조회만 된다.
 *   등록: claude mcp add --scope user pixelpage-dash -- node /Users/heekyu/픽셀페이지/pixelpage-next/scripts/dash-mcp.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";
import { createClient } from "@supabase/supabase-js";
import { createMcp } from "../src/lib/dash/mcp-core.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const envFile = join(ROOT, ".env.local");
if (existsSync(envFile)) for (const line of readFileSync(envFile, "utf8").split("\n")) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ""); }
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { db: { schema: "dash" }, auth: { persistSession: false } });
const SITE = process.env.WORKER_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://pixelpage.co.kr";

const handle = createMcp({ db, site: SITE, secret: process.env.LEAD_WEBHOOK_SECRET });
// JSON-RPC over stdio, 한 줄에 메시지 하나
createInterface({ input: process.stdin }).on("line", async (line) => {
  let msg; try { msg = JSON.parse(line); } catch { return; }
  const res = await handle(msg);
  if (res) process.stdout.write(JSON.stringify(res) + "\n");
});

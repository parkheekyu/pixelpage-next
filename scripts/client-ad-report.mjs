#!/usr/bin/env node
/**
 * 고객사 광고 성과 일일 보고: 진행 중인 메타 캠페인별 어제·최근 7일 숫자를 담당 직원 이름으로 고객사 슬랙 채널에 올린다.
 * 매일 12:00 에 워커가 실행한다 (agents/schedules.json). 비포레스트는 메타광고AI 의 일일 점검이 같은 형식으로 보고하므로 여기서는 뺀다.
 *   node scripts/client-ad-report.mjs                     대상 고객사 전부, 슬랙에 올림
 *   node scripts/client-ad-report.mjs --project 짐컴퍼니    한 곳만
 *   node scripts/client-ad-report.mjs --dry               슬랙에 올리지 않고 내용만 출력
 * 대상: 메타 광고 계정과 슬랙 채널이 둘 다 연결된 고객사. 채널이 없으면 건너뛴다 (종합 채널로 새지 않게).
 * 광고 계정은 읽기만 한다. 켜기·끄기·예산 변경은 하지 않고, 조치를 권하지도 않는다.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ""); }
const argv = process.argv.slice(2);
const DRY = argv.includes("--dry");
const ONLY = argv.includes("--project") ? argv[argv.indexOf("--project") + 1] : null;
const SITE = process.env.WORKER_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://pixelpage.co.kr";
/** 다른 곳에서 이미 같은 보고를 하는 고객사 */
const SKIP = ["비포레스트"];
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { db: { schema: "dash" }, auth: { persistSession: false } });

async function graph(p, params) {
  const u = new URL(`https://graph.facebook.com/v21.0/${p}`);
  for (const [k, v] of Object.entries({ ...params, access_token: process.env.META_ACCESS_TOKEN })) u.searchParams.set(k, typeof v === "string" ? v : JSON.stringify(v));
  const j = await (await fetch(u, { signal: AbortSignal.timeout(30000) })).json();
  if (j.error) throw new Error(`Meta: ${j.error.message}`);
  return j;
}
const won = (n) => `${Math.round(n).toLocaleString("ko-KR")}원`;
/** 한 캠페인의 한 기간 숫자 → 두 줄 (비포레스트 보고와 같은 지표·순서) */
function lines(d, goal) {
  const spend = Number(d?.spend ?? 0), imps = Number(d?.impressions ?? 0), clicks = Number(d?.clicks ?? 0);
  const type = goal === "purchase" ? "purchase" : "lead";
  const n = Number((d?.actions ?? []).find((a) => a.action_type === type)?.value ?? 0);
  const word = goal === "purchase" ? "구매" : "리드";
  return [
    `소진액 ${won(spend)} · ${word} ${n}건 · ${word} 단가 ${n ? won(spend / n) : "–"}`,
    `CTR ${imps ? ((clicks / imps) * 100).toFixed(2) : "0.00"}% · 전환율 ${clicks ? ((n / clicks) * 100).toFixed(1) : "0.0"}% · CPM ${imps ? won((spend / imps) * 1000) : "–"}`,
  ];
}

const { data: projects } = await db.from("projects").select("id,name").eq("active", true).order("name");
const { data: integs } = await db.from("project_integrations").select("project_id,meta_ad_account_id,meta_goal,slack_channel_id");
const kst = new Date(Date.now() + 9 * 3600_000);
let sent = 0;
for (const p of projects ?? []) {
  if (ONLY ? p.name !== ONLY : SKIP.includes(p.name)) continue;
  const i = (integs ?? []).find((x) => x.project_id === p.id);
  if (!i?.meta_ad_account_id) { if (ONLY) console.log(`${p.name}: 메타 광고 계정 미연결`); continue; }
  if (!i.slack_channel_id) { console.log(`${p.name}: 슬랙 채널 미연결, 건너뜀`); continue; }
  try {
    const acct = i.meta_ad_account_id.startsWith("act_") ? i.meta_ad_account_id : `act_${i.meta_ad_account_id}`;
    const camps = (await graph(`${acct}/campaigns`, { fields: "name", effective_status: ["ACTIVE"], limit: 100 })).data ?? [];
    const blocks = [];
    for (const c of camps) {
      const F = "spend,impressions,clicks,actions";
      const [y, w] = await Promise.all([graph(`${c.id}/insights`, { fields: F, date_preset: "yesterday" }), graph(`${c.id}/insights`, { fields: F, date_preset: "last_7d" })]);
      const d7 = w.data?.[0];
      if (!Number(d7?.spend ?? 0)) continue; // 최근 7일 소진이 없는 캠페인은 말하지 않는다
      blocks.push([c.name, "어제", ...lines(y.data?.[0], i.meta_goal), "최근 7일", ...lines(d7, i.meta_goal)].join("\n"));
    }
    if (!blocks.length) { console.log(`${p.name}: 보고할 진행 중 캠페인 없음`); continue; }
    const text = `${kst.getUTCMonth() + 1}/${kst.getUTCDate()} 광고 성과예요. (캠페인별 어제 · 최근 7일)\n\n${blocks.join("\n\n")}`;
    console.log(`\n[${p.name}]\n${text}`);
    if (DRY) continue;
    // 담당 직원 계정으로 그대로 게시 (직원이 말을 덧붙이지 않는다)
    const r = await fetch(`${SITE}/api/agent/notify`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${process.env.LEAD_WEBHOOK_SECRET}` }, body: JSON.stringify({ project: p.name, text, mode: "raw", source: "광고 성과 일일 보고" }), signal: AbortSignal.timeout(30000) });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) throw new Error(`슬랙 게시 실패: ${j.error ?? r.status}`);
    sent++;
  } catch (e) { console.log(`${p.name}: 실패: ${e.message}`); process.exitCode = 1; }
}
console.log(`\n완료: ${DRY ? "미게시(dry)" : `${sent}곳 게시`}`);

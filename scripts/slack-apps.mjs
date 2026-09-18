/**
 * 직원별 슬랙 앱 생성/갱신 (Slack App Manifest API).
 *   node scripts/slack-apps.mjs create <앱 설정 토큰 xoxe.xoxp-…>   # 없는 직원 앱을 만들고 자격을 DB(dash.slack_bots)에 저장
 *   node scripts/slack-apps.mjs update <앱 설정 토큰>               # 매니페스트 재적용(권한·이벤트 변경 시)
 *   node scripts/slack-apps.mjs status
 * 앱 설정 토큰: https://api.slack.com/apps → 하단 "Your App Configuration Tokens" → Generate (12시간 유효)
 * 생성 후 설치는 https://pixelpage.co.kr/api/slack/oauth 에서 직원별 클릭.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
if (existsSync(".env.local")) for (const line of readFileSync(".env.local", "utf8").split("\n")) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ""); }
const [cmd, token] = process.argv.slice(2);
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { db: { schema: "dash" }, auth: { persistSession: false } });
const TEAM = JSON.parse(readFileSync("agents/employees.json", "utf8"));
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://pixelpage.co.kr";
const SCOPES = ["chat:write", "chat:write.public", "chat:write.customize", "channels:history", "groups:history", "im:history", "channels:read", "groups:read", "im:read", "users:read", "reactions:write"];

const manifest = (e, displayName) => ({
  display_information: { name: `${e.name} · ${e.title}`.slice(0, 35), description: `픽셀페이지 AI 직원 — ${e.title}`, background_color: "#5b5bd6" },
  features: { bot_user: { display_name: displayName, always_online: true }, app_home: { messages_tab_enabled: true, messages_tab_read_only_enabled: false } },
  oauth_config: { redirect_urls: [`${SITE}/api/slack/oauth`], scopes: { bot: SCOPES } },
  settings: { event_subscriptions: { request_url: `${SITE}/api/slack/events`, bot_events: ["message.channels", "message.groups", "message.im"] }, interactivity: { is_enabled: true, request_url: `${SITE}/api/slack/interactions` }, org_deploy_enabled: false, socket_mode_enabled: false, token_rotation_enabled: false },
});
async function api(method, body) { const r = await fetch(`https://slack.com/api/${method}`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json; charset=utf-8" }, body: JSON.stringify(body) }); return r.json(); }

if (cmd === "status") {
  const { data } = await db.from("slack_bots").select("employee_id,app_id,bot_user_id,installed_at");
  for (const e of TEAM.employees) { const b = (data ?? []).find((x) => x.employee_id === e.id); console.log(`${e.name.padEnd(4)} ${e.title.padEnd(14)} ${b?.app_id ? "앱 " + b.app_id : "앱 없음"}  ${b?.installed_at ? "설치됨 " + b.bot_user_id : "미설치 → " + SITE + "/api/slack/oauth?emp=" + e.id}`); }
  process.exit(0);
}
if (!token || !["create", "update"].includes(cmd)) { console.log("사용법: node scripts/slack-apps.mjs create|update <앱 설정 토큰>  |  status"); process.exit(1); }
const { data: bots } = await db.from("slack_bots").select("*");
for (const e of TEAM.employees) {
  const existing = (bots ?? []).find((b) => b.employee_id === e.id);
  if (cmd === "create") {
    if (existing?.app_id) { console.log(`${e.name}: 이미 있음 (${existing.app_id})`); continue; }
    let j = await api("apps.manifest.create", { manifest: manifest(e, e.name) });
    if (!j.ok) j = await api("apps.manifest.create", { manifest: manifest(e, e.handle ?? e.id) });
    if (!j.ok) { console.log(`${e.name}: 생성 실패 ${j.error} ${JSON.stringify(j.errors ?? "")}`); continue; }
    const c = j.credentials ?? {};
    await db.from("slack_bots").upsert({ employee_id: e.id, app_id: j.app_id, client_id: c.client_id, client_secret: c.client_secret, signing_secret: c.signing_secret, updated_at: new Date().toISOString() });
    console.log(`${e.name}: 생성 ${j.app_id} → 설치: ${SITE}/api/slack/oauth?emp=${e.id}`);
  } else {
    if (!existing?.app_id) { console.log(`${e.name}: 앱 없음`); continue; }
    let j = await api("apps.manifest.update", { app_id: existing.app_id, manifest: manifest(e, e.name) });
    if (!j.ok) j = await api("apps.manifest.update", { app_id: existing.app_id, manifest: manifest(e, e.handle ?? e.id) });
    console.log(`${e.name}: ${j.ok ? "갱신 완료" + (j.permissions_updated ? " (권한 변경 → 재설치 필요: " + SITE + "/api/slack/oauth?emp=" + e.id + ")" : "") : "갱신 실패 " + j.error}`);
  }
}

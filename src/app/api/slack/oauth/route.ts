import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { botFor } from "@/lib/integrations/slack";
import team from "../../../../../agents/employees.json";

const SCOPES = "chat:write,chat:write.public,chat:write.customize,channels:history,groups:history,im:history,channels:read,groups:read,im:read,users:read,reactions:write";
const SITE = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixelpage.co.kr";

/**
 * 직원 슬랙 앱 설치 (원클릭).
 *   GET /api/slack/oauth?emp=doyun          → 슬랙 설치 화면으로 이동
 *   GET /api/slack/oauth?code=…&state=doyun → 토큰 교환 후 dash.slack_bots 에 저장
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const db = createAdminClient();
  const code = sp.get("code"), state = sp.get("state"), emp = sp.get("emp");
  if (code && state) {
    const bot = await botFor(db, state);
    if (!bot?.client_id || !bot.client_secret) return new NextResponse("앱 정보 없음", { status: 400 });
    const r = await fetch("https://slack.com/api/oauth.v2.access", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: bot.client_id, client_secret: bot.client_secret, code, redirect_uri: `${SITE()}/api/slack/oauth` }) });
    const j = (await r.json()) as { ok: boolean; error?: string; access_token?: string; bot_user_id?: string; team?: { id: string; name: string }; app_id?: string };
    if (!j.ok) return new NextResponse(`설치 실패: ${j.error}`, { status: 400 });
    await db.from("slack_bots").update({ bot_token: j.access_token, bot_user_id: j.bot_user_id, team_id: j.team?.id, app_id: j.app_id ?? bot.app_id, installed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("employee_id", state);
    const e = (team.employees as { id: string; name: string; title: string }[]).find((x) => x.id === state);
    return new NextResponse(`<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;padding:40px"><h2>${e?.name ?? state} (${e?.title ?? ""}) 설치 완료</h2><p>슬랙에서 채널에 초대하면 바로 일합니다: <code>/invite @${state}</code></p><p><a href="${SITE()}/api/slack/oauth?list=1">다른 직원 설치하기</a></p></body>`, { headers: { "content-type": "text/html; charset=utf-8" } });
  }
  if (emp) {
    const bot = await botFor(db, emp);
    if (!bot?.client_id) return new NextResponse("앱이 아직 생성되지 않았습니다", { status: 404 });
    const url = `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent(bot.client_id)}&scope=${encodeURIComponent(SCOPES)}&redirect_uri=${encodeURIComponent(`${SITE()}/api/slack/oauth`)}&state=${encodeURIComponent(emp)}`;
    return NextResponse.redirect(url);
  }
  // 설치 현황 목록
  const { data } = await db.from("slack_bots").select("employee_id,client_id,bot_user_id,installed_at");
  const rows = (team.employees as { id: string; name: string; title: string }[]).map((e) => { const b = (data ?? []).find((x) => x.employee_id === e.id); return `<li><b>${e.name}</b> · ${e.title} — ${b?.installed_at ? `설치됨 (${String(b.installed_at).slice(0, 10)})` : b?.client_id ? `<a href="${SITE()}/api/slack/oauth?emp=${e.id}">슬랙에 설치</a>` : "앱 미생성"}</li>`; }).join("");
  return new NextResponse(`<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;padding:40px;line-height:1.8"><h2>픽셀페이지 AI 직원 설치</h2><ul>${rows}</ul></body>`, { headers: { "content-type": "text/html; charset=utf-8" } });
}

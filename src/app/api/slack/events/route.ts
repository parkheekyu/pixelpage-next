import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { botByApp, slack, verifySlack } from "@/lib/integrations/slack";
import team from "../../../../../agents/employees.json";

/**
 * 슬랙 이벤트 (직원별 앱이 같은 URL 을 쓴다. api_app_id 로 어느 직원의 앱인지 구분)
 * - 봇이 있는 채널의 사람 메시지는 한 번만 기록(맥락).
 * - 그 직원이 멘션됐거나, DM 이거나, 그 직원이 참여한 스레드 답글이면 employee_turn 작업 등록.
 */
type Emp = { id: string; name: string; aliases: string[] };
const EMPLOYEES = team.employees as Emp[];

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const body = JSON.parse(raw) as { type: string; challenge?: string; api_app_id?: string; authorizations?: { user_id: string }[]; event?: { type: string; subtype?: string; bot_id?: string; user?: string; text?: string; channel: string; channel_type?: string; ts: string; thread_ts?: string } };
  if (body.type === "url_verification") return NextResponse.json({ challenge: body.challenge });
  const db = createAdminClient();
  const bot = body.api_app_id ? await botByApp(db, body.api_app_id) : null;
  if (!verifySlack(raw, req.headers.get("x-slack-request-timestamp"), req.headers.get("x-slack-signature"), bot?.signing_secret)) return NextResponse.json({ error: "bad signature" }, { status: 401 });
  if (req.headers.get("x-slack-retry-num")) return new NextResponse("", { status: 200 });
  const emp = bot ? EMPLOYEES.find((e) => e.id === bot.employee_id) ?? null : null;
  const ev = body.event;
  const botUser = bot?.bot_user_id ?? body.authorizations?.[0]?.user_id ?? "";
  if (emp && ev?.type === "message" && !ev.bot_id && !ev.subtype && ev.text && ev.user && ev.user !== botUser) {
    const { channel, ts, text, user } = ev; const threadTs = ev.thread_ts; const channelType = ev.channel_type;
    after(async () => {
      const { data: integ } = await db.from("project_integrations").select("project_id").eq("slack_channel_id", channel).maybeSingle();
      const { data: exists } = await db.from("agent_messages").select("id").eq("channel", channel).eq("ts", ts).maybeSingle();
      if (!exists) {
        let userName = user;
        try { const u = await slack<{ user: { real_name?: string; name?: string } }>("users.info", { user }, bot!.bot_token); userName = u.user.real_name ?? u.user.name ?? user; } catch {}
        await db.from("agent_messages").upsert({ channel, channel_type: channelType, thread_ts: threadTs ?? null, ts, user_id: user, user_name: userName, project_id: integ?.project_id ?? null, text }, { onConflict: "channel,ts" });
      }
      const mentioned = !!botUser && text.includes(`<@${botUser}>`);
      const mentionsOther = /<@[A-Z0-9]+>/.test(text.replace(`<@${botUser}>`, ""));
      let mine = mentioned || channelType === "im";
      if (!mine && threadTs && !mentionsOther) {
        // 이 직원이 참여한 스레드의 멘션 없는 답글 → 마지막에 말한 직원이 이어받음
        const { data: last } = await db.from("agent_messages").select("employee_id").eq("channel", channel).eq("thread_ts", threadTs).not("employee_id", "is", null).order("ts", { ascending: false }).limit(1).maybeSingle();
        const { data: root } = await db.from("agent_messages").select("employee_id").eq("channel", channel).eq("ts", threadTs).maybeSingle();
        mine = (last?.employee_id ?? root?.employee_id) === emp.id;
      }
      if (!mine) return;
      const clean = text.replace(/<@[A-Z0-9]+>/g, (m) => (m === `<@${botUser}>` ? "" : m)).trim();
      const { data: u } = await db.from("agent_messages").select("user_name").eq("channel", channel).eq("ts", ts).maybeSingle();
      await db.from("agent_jobs").insert({ project_id: integ?.project_id ?? null, kind: "employee_turn", engine: "claude", payload: { employee: emp.id, channel, channel_type: channelType, thread_ts: threadTs ?? ts, trigger_ts: ts, text: clean, user_id: user, user_name: u?.user_name ?? user, depth: 0 } });
      await slack("reactions.add", { channel, timestamp: ts, name: "eyes" }, bot!.bot_token).catch(() => {});
    });
  }
  return new NextResponse("", { status: 200 });
}

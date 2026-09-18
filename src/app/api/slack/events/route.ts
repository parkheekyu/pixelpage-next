import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slack, verifySlack } from "@/lib/integrations/slack";
import team from "../../../../../agents/employees.json";

/**
 * 슬랙 이벤트 → AI 직원 호출.
 * - 봇이 있는 채널의 사람 메시지는 모두 기록(맥락).
 * - 멘션(@pixelpage-bot), DM, 직원이 참여한 스레드의 답글이면 담당 직원 작업(agent_jobs: employee_turn)을 등록한다.
 *   실제 답변은 로컬 워커가 Claude CLI 로 만들어 같은 스레드에 올린다.
 */
type Emp = { id: string; name: string; title: string; aliases: string[]; default?: boolean };
const EMPLOYEES = team.employees as Emp[];
const DEFAULT = EMPLOYEES.find((e) => e.default) ?? EMPLOYEES[0];

function pickEmployee(text: string): Emp | null {
  const head = text.trim().slice(0, 24);
  for (const e of EMPLOYEES) for (const a of e.aliases) if (new RegExp(`(^|[\\s,@])${a}(님|아|야|씨|,|\\s|$)`).test(head)) return e;
  return null;
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const body = JSON.parse(raw) as { type: string; challenge?: string; authorizations?: { user_id: string }[]; event?: { type: string; subtype?: string; bot_id?: string; user?: string; text?: string; channel: string; channel_type?: string; ts: string; thread_ts?: string } };
  if (body.type === "url_verification") return NextResponse.json({ challenge: body.challenge });
  if (!verifySlack(raw, req.headers.get("x-slack-request-timestamp"), req.headers.get("x-slack-signature"))) return NextResponse.json({ error: "bad signature" }, { status: 401 });
  if (req.headers.get("x-slack-retry-num")) return new NextResponse("", { status: 200 });
  const ev = body.event;
  const botUser = body.authorizations?.[0]?.user_id ?? "";
  if (ev?.type === "message" && !ev.bot_id && !ev.subtype && ev.text && ev.user && ev.user !== botUser) {
    const { channel, ts, text, user } = ev; const threadTs = ev.thread_ts; const channelType = ev.channel_type;
    after(async () => {
      const db = createAdminClient();
      let userName = user;
      try { const u = await slack<{ user: { real_name?: string; name?: string } }>("users.info", { user }); userName = u.user.real_name ?? u.user.name ?? user; } catch {}
      const { data: integ } = await db.from("project_integrations").select("project_id").eq("slack_channel_id", channel).maybeSingle();
      await db.from("agent_messages").upsert({ channel, channel_type: channelType, thread_ts: threadTs ?? null, ts, user_id: user, user_name: userName, project_id: integ?.project_id ?? null, text }, { onConflict: "channel,ts" });

      const mentioned = botUser ? text.includes(`<@${botUser}>`) : false;
      const clean = text.replace(/<@[A-Z0-9]+>/g, "").trim();
      let emp: Emp | null = null;
      if (threadTs) {
        // 직원이 참여한 스레드면 마지막에 말한 직원이 이어받는다 (이름을 부르면 그 직원)
        const { data: last } = await db.from("agent_messages").select("employee_id").eq("channel", channel).eq("thread_ts", threadTs).not("employee_id", "is", null).order("ts", { ascending: false }).limit(1).maybeSingle();
        const { data: root } = await db.from("agent_messages").select("employee_id").eq("channel", channel).eq("ts", threadTs).maybeSingle();
        const owner = last?.employee_id ?? root?.employee_id ?? null;
        if (owner || mentioned || channelType === "im") emp = pickEmployee(clean) ?? EMPLOYEES.find((e) => e.id === owner) ?? DEFAULT;
      } else if (mentioned || channelType === "im") emp = pickEmployee(clean) ?? DEFAULT;
      if (!emp) return;
      await db.from("agent_jobs").insert({ project_id: integ?.project_id ?? null, kind: "employee_turn", engine: "claude", payload: { employee: emp.id, channel, channel_type: channelType, thread_ts: threadTs ?? ts, trigger_ts: ts, text: clean, user_id: user, user_name: userName, depth: 0 } });
      await slack("reactions.add", { channel, timestamp: ts, name: "eyes" }).catch(() => {});
    });
  }
  return new NextResponse("", { status: 200 });
}

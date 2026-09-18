import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slack, verifySlack } from "@/lib/integrations/slack";
import { createProposalJob, type CreativeBrief } from "@/lib/dash/proposals";

/** 슬랙 이벤트: URL 검증 + 제안 스레드의 사람 코멘트 저장. "다시"/"재제안" 포함 시 코멘트 반영 재제안 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const body = JSON.parse(raw) as { type: string; challenge?: string; event?: { type: string; subtype?: string; bot_id?: string; user?: string; text?: string; channel: string; ts: string; thread_ts?: string } };
  if (body.type === "url_verification") return NextResponse.json({ challenge: body.challenge });
  if (!verifySlack(raw, req.headers.get("x-slack-request-timestamp"), req.headers.get("x-slack-signature"))) return NextResponse.json({ error: "bad signature" }, { status: 401 });
  const ev = body.event;
  if (ev?.type === "message" && ev.thread_ts && !ev.bot_id && !ev.subtype && ev.text) {
    const threadTs = ev.thread_ts, text = ev.text, user = ev.user, channel = ev.channel, ts = ev.ts;
    after(async () => {
      const db = createAdminClient();
      const { data: p } = await db.from("proposals").select("id,project_id,brief,engine,status").eq("slack_channel", channel).eq("slack_ts", threadTs).maybeSingle();
      if (!p) return;
      let author = user ?? "slack";
      if (user) { try { const u = await slack<{ user: { real_name?: string; name?: string } }>("users.info", { user }); author = u.user.real_name ?? u.user.name ?? author; } catch {} }
      await db.from("comments").insert({ project_id: p.project_id, proposal_id: p.id, source: "slack", author, author_id: user, text, slack_ts: ts });
      if (/다시|재제안|수정해|바꿔|고쳐/.test(text)) {
        await db.from("proposals").update({ status: "rejected", feedback: text, decided_at: new Date().toISOString() }).eq("id", p.id);
        const b = (p.brief ?? {}) as CreativeBrief;
        await createProposalJob(db, p.project_id, { goal: b.goal, formats: b.formats ?? [], count: b.count ?? 4, notes: b.notes, engine: p.engine }, { parentId: p.id, feedback: text, requestedBy: author });
        await slack("chat.postMessage", { channel, thread_ts: threadTs, text: `🔁 코멘트를 반영해 다시 제안합니다. (1~3분)` });
      } else {
        await slack("reactions.add", { channel, timestamp: ts, name: "eyes" }).catch(() => {});
      }
    });
  }
  return new NextResponse("", { status: 200 });
}

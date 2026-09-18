import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reviseModal, slack, verifySlack } from "@/lib/integrations/slack";
import { createProposalJob, type CreativeBrief } from "@/lib/dash/proposals";
import { refreshProposalMessage } from "@/lib/dash/slack-proposals";

/** 슬랙 버튼·모달 제출. 3초 안에 응답해야 하므로 무거운 작업은 after() */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifySlack(raw, req.headers.get("x-slack-request-timestamp"), req.headers.get("x-slack-signature"))) return NextResponse.json({ error: "bad signature" }, { status: 401 });
  const payload = JSON.parse(new URLSearchParams(raw).get("payload") ?? "{}") as { type: string; user?: { id: string; username?: string; name?: string }; trigger_id?: string; actions?: { action_id: string; value: string }[]; container?: { channel_id?: string; message_ts?: string }; view?: { callback_id: string; private_metadata: string; state: { values: Record<string, Record<string, { value?: string }>> } } };
  const db = createAdminClient();
  const who = payload.user?.name ?? payload.user?.username ?? payload.user?.id ?? "slack";

  if (payload.type === "block_actions" && payload.actions?.[0]) {
    const a = payload.actions[0]; const id = a.value;
    if (a.action_id === "proposal_revise" && payload.trigger_id) {
      await slack("views.open", { trigger_id: payload.trigger_id, view: reviseModal(id, payload.container?.channel_id ?? "", payload.container?.message_ts ?? "") });
      return new NextResponse("", { status: 200 });
    }
    if (a.action_id === "proposal_approve" || a.action_id === "proposal_reject") {
      const status = a.action_id === "proposal_approve" ? "approved" : "rejected";
      after(async () => {
        await db.from("proposals").update({ status, decided_at: new Date().toISOString() }).eq("id", id);
        await db.from("comments").insert({ project_id: (await db.from("proposals").select("project_id").eq("id", id).single()).data?.project_id, proposal_id: id, source: "slack", author: who, author_id: payload.user?.id, text: status === "approved" ? "승인" : "반려" });
        await refreshProposalMessage(db, id);
        if (payload.container?.channel_id && payload.container.message_ts) await slack("chat.postMessage", { channel: payload.container.channel_id, thread_ts: payload.container.message_ts, text: status === "approved" ? `✅ ${who} 님이 승인했습니다. 제작 단계로 넘깁니다.` : `⛔ ${who} 님이 반려했습니다. 스레드에 코멘트를 남기면 봇이 반영해 다시 제안합니다.` });
      });
      return new NextResponse("", { status: 200 });
    }
  }

  if (payload.type === "view_submission" && payload.view?.callback_id === "proposal_revise_submit") {
    const meta = JSON.parse(payload.view.private_metadata || "{}") as { proposalId: string; channel: string; ts: string };
    const fb = payload.view.state.values.fb?.text?.value?.trim() ?? "";
    after(async () => {
      const { data: parent } = await db.from("proposals").select("project_id,brief,engine").eq("id", meta.proposalId).maybeSingle();
      if (!parent) return;
      await db.from("proposals").update({ status: "rejected", feedback: fb, decided_at: new Date().toISOString() }).eq("id", meta.proposalId);
      await db.from("comments").insert({ project_id: parent.project_id, proposal_id: meta.proposalId, source: "slack", author: who, author_id: payload.user?.id, text: fb });
      await refreshProposalMessage(db, meta.proposalId);
      const b = (parent.brief ?? {}) as CreativeBrief;
      await createProposalJob(db, parent.project_id, { goal: b.goal, formats: b.formats ?? [], count: b.count ?? 4, notes: b.notes, engine: parent.engine }, { parentId: meta.proposalId, feedback: fb, requestedBy: who });
      if (meta.channel && meta.ts) await slack("chat.postMessage", { channel: meta.channel, thread_ts: meta.ts, text: `🔁 ${who} 님 코멘트를 반영해 다시 제안합니다: "${fb.slice(0, 200)}"
(1~3분 뒤 이 스레드에 올라옵니다)` });
    });
    return NextResponse.json({ response_action: "clear" });
  }
  return new NextResponse("", { status: 200 });
}

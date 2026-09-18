import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { hasSlack, proposalBlocks, slack } from "@/lib/integrations/slack";
import type { Proposal } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any, any, any>;
const SITE = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixelpage.co.kr";

export async function channelFor(db: AnyClient, projectId: string): Promise<string | null> {
  const { data } = await db.from("project_integrations").select("slack_channel_id").eq("project_id", projectId).maybeSingle();
  return data?.slack_channel_id || process.env.SLACK_DEFAULT_CHANNEL || null;
}

/** 제안을 슬랙에 새 메시지로 게시 (또는 재제안이면 원본 스레드에) */
export async function postProposalToSlack(db: AnyClient, proposalId: string): Promise<{ channel: string; ts: string } | { skipped: string }> {
  if (!hasSlack()) return { skipped: "SLACK_BOT_TOKEN 미설정" };
  const { data: p } = await db.from("proposals").select("*").eq("id", proposalId).maybeSingle();
  if (!p) throw new Error("제안 없음");
  const prop = p as Proposal & { slack_channel: string | null; slack_ts: string | null };
  const channel = await channelFor(db, prop.project_id);
  if (!channel) return { skipped: "슬랙 채널 미설정 (설정 > Slack 또는 SLACK_DEFAULT_CHANNEL)" };
  const { data: proj } = await db.from("projects").select("name").eq("id", prop.project_id).single();
  const blocks = proposalBlocks({ id: prop.id, title: prop.title, summary: (prop.brief as { summary?: string } | null)?.summary, projectName: proj?.name ?? "", engine: prop.engine, variants: prop.variants ?? [], status: prop.status, feedback: prop.feedback, dashboardUrl: `${SITE()}/app/ads/${prop.project_id}` });
  // 재제안이면 원본의 스레드에 답글로
  let thread_ts: string | undefined;
  if (prop.parent_id) { const { data: parent } = await db.from("proposals").select("slack_ts,slack_channel").eq("id", prop.parent_id).maybeSingle(); if (parent?.slack_ts && parent.slack_channel === channel) thread_ts = parent.slack_ts; }
  const r = await slack<{ ts: string; channel: string }>("chat.postMessage", { channel, text: `${proj?.name ?? ""} 소재 제안 — 이런 형식은 어때요?`, blocks, ...(thread_ts ? { thread_ts, reply_broadcast: true } : {}) });
  await db.from("proposals").update({ slack_channel: r.channel, slack_ts: r.ts }).eq("id", prop.id);
  return { channel: r.channel, ts: r.ts };
}

/** 상태 변경 후 슬랙 메시지 갱신 (버튼 제거·상태 표시) */
export async function refreshProposalMessage(db: AnyClient, proposalId: string) {
  if (!hasSlack()) return;
  const { data: p } = await db.from("proposals").select("*").eq("id", proposalId).maybeSingle();
  const prop = p as (Proposal & { slack_channel: string | null; slack_ts: string | null }) | null;
  if (!prop?.slack_ts || !prop.slack_channel) return;
  const { data: proj } = await db.from("projects").select("name").eq("id", prop.project_id).single();
  const blocks = proposalBlocks({ id: prop.id, title: prop.title, summary: (prop.brief as { summary?: string } | null)?.summary, projectName: proj?.name ?? "", engine: prop.engine, variants: prop.variants ?? [], status: prop.status, feedback: prop.feedback, dashboardUrl: `${SITE()}/app/ads/${prop.project_id}` });
  await slack("chat.update", { channel: prop.slack_channel, ts: prop.slack_ts, text: `${proj?.name ?? ""} 소재 제안`, blocks });
}

"use server";

import { revalidatePath } from "next/cache";
import { getSession, requireStaff } from "@/lib/dash/auth";
import type { ActionResult } from "./actions";
import type { Engine, Proposal } from "@/lib/dash/types";
import { createProposalJob, type CreativeBrief } from "@/lib/dash/proposals";

export type { CreativeBrief } from "@/lib/dash/proposals";

/** 소재 제안 요청 → proposals(queued) + agent_jobs. 로컬 워커가 처리 후 슬랙에 게시 */
export async function requestCreativeProposal(projectId: string, brief: CreativeBrief, parentId?: string, feedback?: string): Promise<ActionResult & { id?: string }> {
  try {
    const s = await requireStaff();
    const r = await createProposalJob(s.supabase, projectId, brief, { parentId, feedback, createdBy: s.user.id, requestedBy: s.profile.name ?? s.profile.email });
    revalidatePath(`/app/ads/${projectId}`);
    return { ok: true, id: r.id, message: `요청했습니다. ${r.engine === "codex" ? "Codex" : "Claude"} 봇이 1~3분 안에 제안을 올립니다.` };
  } catch (e) { return { ok: false, error: (e as Error).message }; }
}

export async function decideProposal(projectId: string, id: string, decision: "approved" | "rejected", feedback?: string): Promise<ActionResult> {
  const s = await requireStaff();
  const { error } = await s.supabase.from("proposals").update({ status: decision, feedback: feedback?.trim() || null, decided_by: s.user.id, decided_at: new Date().toISOString() }).eq("id", id).eq("project_id", projectId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/app/ads/${projectId}`);
  return { ok: true };
}

/** 반려 코멘트를 반영해 재제안 */
export async function reviseProposal(projectId: string, id: string, feedback: string): Promise<ActionResult & { id?: string }> {
  const s = await requireStaff();
  const { data: parent } = await s.supabase.from("proposals").select("brief,engine").eq("id", id).eq("project_id", projectId).maybeSingle();
  if (!parent) return { ok: false, error: "제안을 찾을 수 없습니다." };
  await decideProposal(projectId, id, "rejected", feedback);
  const b = (parent.brief ?? {}) as CreativeBrief;
  return requestCreativeProposal(projectId, { goal: b.goal, formats: b.formats ?? [], count: b.count ?? 4, notes: b.notes, engine: parent.engine as Engine }, id, feedback);
}

export async function listProposals(projectId: string): Promise<Proposal[]> {
  const s = await getSession();
  if (!s) return [];
  const { data } = await s.supabase.from("proposals").select("*").eq("project_id", projectId).order("created_at", { ascending: false }).limit(20);
  return (data ?? []) as Proposal[];
}

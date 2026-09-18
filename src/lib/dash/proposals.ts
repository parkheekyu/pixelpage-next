import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Engine, ResearchInput } from "./types";
import { CREATIVE_SYSTEM } from "@/lib/ai/creative";
import { rankWinners, snapshotToText, type MetaAccountSnapshot } from "@/lib/integrations/meta";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any, any, any>;
export interface CreativeBrief { goal?: string; formats: string[]; count: number; notes?: string; engine: Engine }
export const FORMAT_LABEL: Record<string, string> = { image_1x1: "이미지 1:1 (피드)", video_9x16: "세로 영상 9:16 (릴스·스토리)", carousel: "캐러셀" };

async function buildContext(db: AnyClient, projectId: string) {
  const [{ data: p }, { data: integ }, { data: research }, { data: snap }] = await Promise.all([
    db.from("projects").select("name,landing_url,research_input").eq("id", projectId).single(),
    db.from("project_integrations").select("meta_goal").eq("project_id", projectId).maybeSingle(),
    db.from("analyses").select("result_md,created_at").eq("project_id", projectId).eq("kind", "research").eq("status", "done").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    db.from("meta_snapshots").select("data,fetched_at").eq("project_id", projectId).order("fetched_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (!p) throw new Error("프로젝트 없음");
  const goal = integ?.meta_goal === "purchase" ? "purchase" : "lead";
  const r = (p.research_input ?? {}) as ResearchInput;
  const parts = [`[고객사] ${p.name}${p.landing_url ? ` · 랜딩 ${p.landing_url}` : ""}`, `[전환 목표] ${goal === "purchase" ? "구매/매출" : "리드/상담 신청"}`];
  if (r.product) parts.push(`[상품/서비스] ${r.product}`); if (r.target) parts.push(`[타깃] ${r.target}`); if (r.offer) parts.push(`[오퍼] ${r.offer}`); if (r.proof) parts.push(`[보유 증거] ${r.proof}`); if (r.notes) parts.push(`[주의] ${r.notes}`);
  if (research?.result_md) parts.push(`\n[리서치 보고서 (${String(research.created_at).slice(0, 10)})]\n${String(research.result_md).slice(0, 24000)}`);
  if (snap?.data) { const sn = snap.data as MetaAccountSnapshot; const winners = rankWinners(sn, goal, 5); parts.push(`\n[현재 광고 성과 요약 (${sn.date_preset})]\n${snapshotToText({ ...sn, winners }, goal).slice(0, 12000)}`); parts.push(`\n[위너 소재 카피]\n${winners.map((w, i) => `${i + 1}. ${w.name} · ${w.creative?.format ?? "?"}\n제목: ${w.creative?.title ?? "-"}\n본문: ${(w.creative?.body ?? "-").replace(/\s+/g, " ").slice(0, 400)}`).join("\n")}`); }
  else parts.push("\n[현재 광고 성과] 데이터 없음");
  return { name: p.name as string, context: parts.join("\n") };
}

/** 제안 작업 생성: proposals(queued) + agent_jobs. 워커가 처리 후 슬랙에 게시 */
export async function createProposalJob(db: AnyClient, projectId: string, brief: CreativeBrief, opts: { parentId?: string; feedback?: string; createdBy?: string | null; requestedBy?: string }): Promise<{ id: string; engine: Engine; name: string }> {
  const { name, context } = await buildContext(db, projectId);
  const count = Math.min(8, Math.max(2, brief.count || 4));
  const formats = brief.formats.filter((f) => FORMAT_LABEL[f]).length ? brief.formats.filter((f) => FORMAT_LABEL[f]) : ["image_1x1", "video_9x16"];
  const engine: Engine = brief.engine === "claude" ? "claude" : "codex";
  let prev = "";
  if (opts.parentId) {
    const { data: parent } = await db.from("proposals").select("variants,feedback").eq("id", opts.parentId).maybeSingle();
    if (parent?.variants) prev = `\n\n[이전 제안 (반려됨)]\n${JSON.stringify(parent.variants).slice(0, 8000)}\n\n[대표 코멘트 — 최우선 반영]\n${opts.feedback ?? parent.feedback ?? ""}`;
  }
  const prompt = `${context}\n\n[요청]\n포맷: ${formats.map((f) => FORMAT_LABEL[f]).join(", ")}\n개수: ${count}개 (포맷을 골고루)\n${brief.notes ? `추가 요청: ${brief.notes}\n` : ""}${opts.requestedBy ? `요청자: ${opts.requestedBy}\n` : ""}${prev}\n\n위 원칙과 JSON 형식으로 ${count}개의 소재안을 제안해 주세요.`;
  const { data: prop, error } = await db.from("proposals").insert({ project_id: projectId, kind: "creative", status: "queued", engine, title: `${name} 소재 제안`, brief: { goal: brief.goal, formats, count, notes: brief.notes }, parent_id: opts.parentId ?? null, feedback: opts.feedback ?? null, created_by: opts.createdBy ?? null }).select("id").single();
  if (error) throw new Error(error.message);
  const { data: job, error: jerr } = await db.from("agent_jobs").insert({ project_id: projectId, kind: "creative_proposal", engine, system_prompt: CREATIVE_SYSTEM, prompt, created_by: opts.createdBy ?? null }).select("id").single();
  if (jerr) throw new Error(jerr.message);
  await db.from("proposals").update({ job_id: job.id }).eq("id", prop.id);
  return { id: prop.id, engine, name };
}

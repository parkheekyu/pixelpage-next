"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/dash/auth";
import type { ActionResult } from "./actions";
import type { AnalysisKind, ResearchInput } from "@/lib/dash/types";
import { MODEL, runAnalysis } from "@/lib/ai/claude";
import { fetchMetaSnapshot, snapshotToText } from "@/lib/integrations/meta";
import { extractLanding, landingToText } from "@/lib/integrations/landing";
import { ga4Summary } from "@/lib/integrations/ga4";
import { claritySummary } from "@/lib/integrations/clarity";

const PATHS: Record<AnalysisKind, string> = { research: "/app/research", ads: "/app/ads", landing: "/app/landing" };

// ---------- 설정 ----------
export async function saveIntegrations(projectId: string, input: { meta_ad_account_id?: string; ga4_property_id?: string; clarity_project_id?: string; clarity_api_token?: string }): Promise<ActionResult> {
  const s = await requireStaff();
  const clean = (v?: string) => (v ?? "").trim().slice(0, 300) || null;
  const row: Record<string, unknown> = { project_id: projectId, updated_at: new Date().toISOString() };
  if (input.meta_ad_account_id !== undefined) row.meta_ad_account_id = clean(input.meta_ad_account_id)?.replace(/^act_/, "") ?? null;
  if (input.ga4_property_id !== undefined) row.ga4_property_id = clean(input.ga4_property_id)?.replace(/^properties\//, "") ?? null;
  if (input.clarity_project_id !== undefined) row.clarity_project_id = clean(input.clarity_project_id);
  if (input.clarity_api_token !== undefined && input.clarity_api_token !== "") row.clarity_api_token = clean(input.clarity_api_token);
  const { error } = await s.supabase.from("project_integrations").upsert(row, { onConflict: "project_id" });
  if (error) return { ok: false, error: error.message };
  for (const p of Object.values(PATHS)) revalidatePath(`${p}/${projectId}`);
  return { ok: true, message: "저장했습니다." };
}

export async function saveLandingUrl(projectId: string, url: string): Promise<ActionResult> {
  const s = await requireStaff();
  const u = url.trim();
  if (u && !/^https?:\/\/[^\s]+$/i.test(u)) return { ok: false, error: "http(s):// 로 시작하는 주소를 입력해 주세요." };
  const { error } = await s.supabase.from("projects").update({ landing_url: u || null }).eq("id", projectId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/app/landing/${projectId}`);
  return { ok: true, message: "저장했습니다." };
}

export async function saveResearchInput(projectId: string, input: ResearchInput): Promise<ActionResult> {
  const s = await requireStaff();
  const clean: ResearchInput = {};
  for (const k of ["product", "target", "price", "offer", "proof", "competitors", "objections", "notes"] as const) { const v = (input[k] ?? "").trim().slice(0, 4000); if (v) clean[k] = v; }
  const { error } = await s.supabase.from("projects").update({ research_input: clean }).eq("id", projectId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/app/research/${projectId}`);
  return { ok: true, message: "저장했습니다." };
}

export async function deleteAnalysis(projectId: string, id: string): Promise<ActionResult> {
  const s = await requireStaff();
  const { data, error } = await s.supabase.from("analyses").delete().eq("id", id).eq("project_id", projectId).select("kind").maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (data) revalidatePath(`${PATHS[data.kind as AnalysisKind]}/${projectId}`);
  return { ok: true };
}

// ---------- 분석 실행 (직원) ----------
async function execute(kind: AnalysisKind, projectId: string, title: string, input: Record<string, unknown>, buildPrompt: () => Promise<string>): Promise<ActionResult & { id?: string }> {
  const s = await requireStaff();
  const { data: row, error } = await s.supabase.from("analyses").insert({ project_id: projectId, kind, status: "running", title, input, model: MODEL, created_by: s.user.id }).select("id").single();
  if (error) return { ok: false, error: error.message };
  try {
    const prompt = await buildPrompt();
    const r = await runAnalysis(kind, prompt);
    if (r.refusal) throw new Error("모델이 응답을 거부했습니다: " + r.refusal);
    if (!r.text.trim()) throw new Error("빈 응답");
    await s.supabase.from("analyses").update({ status: "done", result_md: r.text, model: r.model, input: { ...input, usage: r.usage, truncated: r.stop_reason === "max_tokens" } }).eq("id", row.id);
    revalidatePath(`${PATHS[kind]}/${projectId}`);
    return { ok: true, id: row.id };
  } catch (e) {
    const msg = (e as Error).message;
    await s.supabase.from("analyses").update({ status: "error", error: msg }).eq("id", row.id);
    revalidatePath(`${PATHS[kind]}/${projectId}`);
    return { ok: false, error: msg };
  }
}

const researchText = (name: string, r: ResearchInput) => [
  `[고객사] ${name}`,
  r.product && `[상품/서비스]\n${r.product}`, r.target && `[타깃 고객]\n${r.target}`, r.price && `[가격/결제]\n${r.price}`, r.offer && `[오퍼]\n${r.offer}`,
  r.proof && `[보유 증거(사례·수치·자격·미디어)]\n${r.proof}`, r.competitors && `[경쟁사/대안]\n${r.competitors}`, r.objections && `[상담에서 실제 듣는 반박·거절 이유]\n${r.objections}`, r.notes && `[기타]\n${r.notes}`,
].filter(Boolean).join("\n\n");

export async function runResearch(projectId: string): Promise<ActionResult & { id?: string }> {
  const s = await requireStaff();
  const { data: p } = await s.supabase.from("projects").select("name,research_input").eq("id", projectId).single();
  if (!p) return { ok: false, error: "프로젝트 없음" };
  const r = (p.research_input ?? {}) as ResearchInput;
  if (!r.product || !r.target) return { ok: false, error: "상품/서비스와 타깃 고객은 입력해 주세요." };
  return execute("research", projectId, `${p.name} 본능분석·반박제거 리서치`, { research_input: r }, async () => `다음 고객사 정보를 바탕으로 리서치 문서를 작성해 주세요.\n\n${researchText(p.name, r)}`);
}

export async function runAdsAnalysis(projectId: string, datePreset = "last_30d"): Promise<ActionResult & { id?: string }> {
  const s = await requireStaff();
  const [{ data: p }, { data: integ }] = await Promise.all([
    s.supabase.from("projects").select("name,research_input,landing_url").eq("id", projectId).single(),
    s.supabase.from("project_integrations").select("meta_ad_account_id").eq("project_id", projectId).maybeSingle(),
  ]);
  if (!p) return { ok: false, error: "프로젝트 없음" };
  if (!integ?.meta_ad_account_id) return { ok: false, error: "Meta 광고 계정 ID를 먼저 설정해 주세요." };
  const preset = ["last_7d", "last_14d", "last_30d", "last_90d", "maximum"].includes(datePreset) ? datePreset : "last_30d";
  return execute("ads", projectId, `${p.name} 광고 분석 (${preset})`, { date_preset: preset, ad_account: integ.meta_ad_account_id }, async () => {
    const snap = await fetchMetaSnapshot(integ.meta_ad_account_id!, preset);
    const r = (p.research_input ?? {}) as ResearchInput;
    const ctx = r.product || r.target ? `\n\n[고객사 리서치 메모]\n${researchText(p.name, r)}` : "";
    return `다음은 고객사 "${p.name}"의 Meta 광고 계정 현황입니다. 위너가 무엇이고 왜 잘되는지, 카피·이미지·영상과 캠페인 구조를 분석하고 개선안을 작성해 주세요.${p.landing_url ? `\n랜딩페이지: ${p.landing_url}` : ""}${ctx}\n\n[광고 계정 데이터]\n${snapshotToText(snap)}`;
  });
}

export async function runLandingAnalysis(projectId: string, opts?: { days?: number }): Promise<ActionResult & { id?: string }> {
  const s = await requireStaff();
  const [{ data: p }, { data: integ }] = await Promise.all([
    s.supabase.from("projects").select("name,research_input,landing_url").eq("id", projectId).single(),
    s.supabase.from("project_integrations").select("ga4_property_id,clarity_api_token").eq("project_id", projectId).maybeSingle(),
  ]);
  if (!p) return { ok: false, error: "프로젝트 없음" };
  if (!p.landing_url) return { ok: false, error: "랜딩페이지 주소를 먼저 설정해 주세요." };
  const days = Math.min(90, Math.max(7, opts?.days ?? 28));
  return execute("landing", projectId, `${p.name} 랜딩페이지 분석`, { landing_url: p.landing_url, days }, async () => {
    const [page, ga, cl] = await Promise.all([
      extractLanding(p.landing_url!),
      integ?.ga4_property_id && process.env.GA4_SERVICE_ACCOUNT_JSON ? ga4Summary(integ.ga4_property_id, days, new URL(p.landing_url!).pathname === "/" ? undefined : new URL(p.landing_url!).pathname).catch((e: Error) => `GA4 조회 실패: ${e.message}`) : Promise.resolve(null),
      integ?.clarity_api_token ? claritySummary(integ.clarity_api_token, 3).catch((e: Error) => `Clarity 조회 실패: ${e.message}`) : Promise.resolve(null),
    ]);
    const r = (p.research_input ?? {}) as ResearchInput;
    const ctx = r.product || r.target ? `\n\n[고객사 리서치 메모]\n${researchText(p.name, r)}` : "";
    const gaText = ga == null ? "GA4 데이터 없음 (연동 미설정)" : typeof ga === "string" ? ga : JSON.stringify(ga, null, 1);
    const clText = cl == null ? "Clarity 데이터 없음 (연동 미설정)" : typeof cl === "string" ? cl : JSON.stringify({ headline: cl.headline, days: cl.days, metrics: Object.fromEntries(Object.entries(cl.metrics).map(([k, v]) => [k, v.slice(0, 12)])) }, null, 1);
    return `고객사 "${p.name}"의 랜딩페이지를 분석하고 개선안을 작성해 주세요.${ctx}\n\n[랜딩페이지 구조·카피]\n${landingToText(page)}\n\n[GA4 최근 ${days}일]\n${gaText}\n\n[Microsoft Clarity 최근 3일]\n${clText}`;
  });
}

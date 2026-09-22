"use server";

import { revalidatePath } from "next/cache";
import { requireStaff, getSession } from "@/lib/dash/auth";
import { loadAnalysis } from "@/lib/dash/analysis-data";
import type { Analysis } from "@/lib/dash/types";
import type { ActionResult } from "./actions";
import type { AnalysisKind, ResearchInput } from "@/lib/dash/types";
import { MODEL, SYSTEM, hasApiKey, runAnalysis } from "@/lib/ai/claude";
import { snapshotToText } from "@/lib/integrations/meta";
import { getMetaSnapshot } from "@/lib/dash/analysis-data";
import { extractLanding, landingToText } from "@/lib/integrations/landing";
import { ga4Summary } from "@/lib/integrations/ga4";
import { claritySummary } from "@/lib/integrations/clarity";
import { hasPerplexity, preResearch } from "@/lib/integrations/perplexity";
import type { CustomField } from "@/lib/dash/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { airtableCreate, airtableReadAll, rowToLeadInput, sheetsAppend, sheetsReadAll } from "@/lib/integrations/leadsync";
import { ingestLead } from "@/lib/dash/ingest";
import type { Lead } from "@/lib/dash/types";
import { randomBytes } from "node:crypto";

const PATHS: Record<AnalysisKind, string> = { research: "/app/research", market: "/app/research", ads: "/app/ads", landing: "/app/landing" };

// ---------- 설정 ----------
export async function saveIntegrations(projectId: string, input: { meta_ad_account_id?: string; meta_goal?: "lead" | "purchase"; ga4_property_id?: string; clarity_project_id?: string; clarity_api_token?: string; google_sheet_id?: string; google_sheet_tab?: string; airtable_base_id?: string; airtable_table?: string; airtable_token?: string; lead_sync_enabled?: boolean; slack_channel_id?: string }): Promise<ActionResult> {
  const s = await requireStaff();
  const clean = (v?: string) => (v ?? "").trim().slice(0, 300) || null;
  const row: Record<string, unknown> = { project_id: projectId, updated_at: new Date().toISOString() };
  if (input.meta_ad_account_id !== undefined) row.meta_ad_account_id = clean(input.meta_ad_account_id)?.replace(/^act_/, "") ?? null;
  if (input.meta_goal !== undefined) row.meta_goal = input.meta_goal === "purchase" ? "purchase" : "lead";
  if (input.ga4_property_id !== undefined) row.ga4_property_id = clean(input.ga4_property_id)?.replace(/^properties\//, "") ?? null;
  if (input.clarity_project_id !== undefined) row.clarity_project_id = clean(input.clarity_project_id);
  if (input.clarity_api_token !== undefined && input.clarity_api_token !== "") row.clarity_api_token = clean(input.clarity_api_token);
  if (input.google_sheet_id !== undefined) { const v = clean(input.google_sheet_id); row.google_sheet_id = v ? (v.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)?.[1] ?? v) : null; }
  if (input.google_sheet_tab !== undefined) row.google_sheet_tab = clean(input.google_sheet_tab);
  if (input.airtable_base_id !== undefined) { const v = clean(input.airtable_base_id); row.airtable_base_id = v ? (v.match(/(app[a-zA-Z0-9]{14})/)?.[1] ?? v) : null; }
  if (input.airtable_table !== undefined) row.airtable_table = clean(input.airtable_table);
  if (input.airtable_token !== undefined && input.airtable_token !== "") row.airtable_token = clean(input.airtable_token);
  if (input.lead_sync_enabled !== undefined) row.lead_sync_enabled = !!input.lead_sync_enabled;
  if (input.slack_channel_id !== undefined) row.slack_channel_id = clean(input.slack_channel_id);
  const { error } = await s.supabase.from("project_integrations").upsert(row, { onConflict: "project_id" });
  if (error) return { ok: false, error: error.message };
  for (const p of Object.values(PATHS)) revalidatePath(`${p}/${projectId}`);
  revalidatePath(`/app/settings/${projectId}`);
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
  for (const k of ["product", "target", "price", "offer", "proof", "competitors", "objections", "notes", "pre_research"] as const) { const v = (input[k] ?? "").trim().slice(0, k === "pre_research" ? 60000 : 4000); if (v) clean[k] = v; }
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
  const direct = hasApiKey();
  const { data: row, error } = await s.supabase.from("analyses").insert({ project_id: projectId, kind, status: direct ? "running" : "queued", title, input, model: direct ? MODEL : "claude-code-cli", created_by: s.user.id }).select("id").single();
  if (error) return { ok: false, error: error.message };
  try {
    const prompt = await buildPrompt();
    if (!direct) {
      // API 키 없음 → 대기열. 로컬 워커(claude -p)가 가져가서 처리
      const { error: jerr } = await s.supabase.from("analysis_jobs").insert({ analysis_id: row.id, project_id: projectId, kind, system_prompt: SYSTEM[kind], prompt });
      if (jerr) throw new Error(jerr.message);
      revalidatePath(`${PATHS[kind]}/${projectId}`);
      return { ok: true, id: row.id, message: "대기열에 등록했습니다. 로컬 분석 워커가 켜져 있으면 1~3분 안에 결과가 표시됩니다." };
    }
    const r = await runAnalysis(kind, prompt);
    if (r.refusal) throw new Error("모델이 응답을 거부했습니다: " + r.refusal);
    if (!r.text.trim()) throw new Error("빈 응답");
    await s.supabase.from("analyses").update({ status: "done", result_md: r.text, model: r.model, input: { ...input, usage: r.usage, truncated: r.stop_reason === "max_tokens" } }).eq("id", row.id);
    revalidatePath(`${PATHS[kind]}/${projectId}`);
    return { ok: true, id: row.id, message: "분석이 완료됐습니다." };
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
  const { data: p } = await s.supabase.from("projects").select("name,research_input,landing_url").eq("id", projectId).single();
  if (!p) return { ok: false, error: "프로젝트 없음" };
  const r = (p.research_input ?? {}) as ResearchInput;
  if (!r.product || !r.target) return { ok: false, error: "상품/서비스와 타깃 고객은 입력해 주세요." };
  const today = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric" });
  return execute("research", projectId, `${p.name} 종합 리서치 보고서`, { research_input: r, perplexity: hasPerplexity() }, async () => {
    // Perplexity 사전 심층 조사 (키가 있을 때만). 실패해도 Claude 자체 검색으로 진행
    let pre = "";
    if (r.pre_research?.trim()) pre = r.pre_research.trim();
    else if (hasPerplexity()) {
      try { pre = await preResearch({ name: p.name, product: r.product!, target: r.target!, competitors: r.competitors, landing_url: p.landing_url }); }
      catch (e) { pre = `(사전 조사 실패: ${(e as Error).message})`; }
    }
    return `오늘은 ${today}입니다. 다음 고객사에 대해 종합 리서치 보고서를 작성해 주세요. 한국 시장 기준입니다.${p.landing_url ? `\n우리 랜딩페이지: ${p.landing_url}` : ""}\n\n${researchText(p.name, r)}${pre ? `\n\n[사전 심층 조사 자료 — 퍼플렉시티 등에서 조사한 결과. 1차 근거로 쓰되 검증·보강할 것. 출처 표기는 자료의 링크·매체명을 그대로 사용]\n${pre}` : "\n\n(사전 조사 자료 없음 — 웹 검색으로 직접 조사할 것)"}`;
  });
}

export async function runMarketResearch(projectId: string): Promise<ActionResult & { id?: string }> {
  const s = await requireStaff();
  const { data: p } = await s.supabase.from("projects").select("name,research_input,landing_url").eq("id", projectId).single();
  if (!p) return { ok: false, error: "프로젝트 없음" };
  const r = (p.research_input ?? {}) as ResearchInput;
  if (!r.product || !r.target) return { ok: false, error: "상품/서비스와 타깃 고객은 입력해 주세요." };
  const today = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric" });
  return execute("market", projectId, `${p.name} 시장 리서치 브리핑`, { research_input: r }, async () =>
    `오늘은 ${today}입니다. 다음 고객사에 대해 웹 검색으로 시장·경쟁사·키워드·광고 레퍼런스를 조사하고 브리핑을 작성해 주세요. 한국 시장 기준입니다.${p.landing_url ? `\n우리 랜딩페이지: ${p.landing_url}` : ""}\n\n${researchText(p.name, r)}\n\n검색은 최소 8회 이상, 경쟁사(입력에 있는 곳 + 검색으로 찾은 상위 3~5곳)와 핵심 키워드 5개 이상을 다뤄 주세요.`);
}

export async function runAdsAnalysis(projectId: string, datePreset = "last_30d"): Promise<ActionResult & { id?: string }> {
  const s = await requireStaff();
  const [{ data: p }, { data: integ }] = await Promise.all([
    s.supabase.from("projects").select("name,research_input,landing_url").eq("id", projectId).single(),
    s.supabase.from("project_integrations").select("meta_ad_account_id,meta_goal").eq("project_id", projectId).maybeSingle(),
  ]);
  if (!p) return { ok: false, error: "프로젝트 없음" };
  if (!integ?.meta_ad_account_id) return { ok: false, error: "Meta 광고 계정 ID를 먼저 설정해 주세요." };
  const goal = (integ.meta_goal === "purchase" ? "purchase" : "lead") as "lead" | "purchase";
  const preset = ["last_7d", "last_14d", "last_30d", "last_90d", "maximum"].includes(datePreset) ? datePreset : "last_30d";
  return execute("ads", projectId, `${p.name} 광고 분석 (${preset})`, { date_preset: preset, ad_account: integ.meta_ad_account_id }, async () => {
    const { snapshot: snap } = await getMetaSnapshot(s.supabase, projectId, integ.meta_ad_account_id!, preset);
    const r = (p.research_input ?? {}) as ResearchInput;
    const ctx = r.product || r.target ? `\n\n[고객사 리서치 메모]\n${researchText(p.name, r)}` : "";
    const goalNote = goal === "purchase" ? "이 캠페인의 목표는 구매(매출)입니다. 위너 판정은 구매 수 → ROAS → CPA 순이며, 리드/CPL 은 참고 지표입니다." : "이 캠페인의 목표는 리드(상담 신청)입니다. 위너 판정은 리드 수 → CPL → CTR 순입니다.";
    return `다음은 고객사 "${p.name}"의 Meta 광고 계정 현황입니다. ${goalNote} 위너가 무엇이고 왜 잘되는지, 카피·이미지·영상과 캠페인 구조를 분석하고 개선안을 작성해 주세요. CPM·빈도·도달·CTR·CPC·랜딩뷰 같은 지표를 근거로 소재 피로, 타깃 협소, 랜딩 문제를 구분해 주세요.${p.landing_url ? `\n랜딩페이지: ${p.landing_url}` : ""}${ctx}\n\n[광고 계정 데이터]\n${snapshotToText(snap, goal)}`;
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

// ---------- 프로젝트 기본 설정 ----------
export async function saveProjectBasic(projectId: string, input: { name?: string; landing_url?: string }): Promise<ActionResult> {
  const s = await requireStaff();
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) { const n = input.name.trim().slice(0, 80); if (!n) return { ok: false, error: "이름을 입력해 주세요." }; patch.name = n; }
  if (input.landing_url !== undefined) { const u = input.landing_url.trim(); if (u && !/^https?:\/\/[^\s]+$/i.test(u)) return { ok: false, error: "http(s):// 로 시작하는 주소를 입력해 주세요." }; patch.landing_url = u || null; }
  const { error } = await s.supabase.from("projects").update(patch).eq("id", projectId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app", "layout");
  return { ok: true, message: "저장했습니다." };
}

export async function regenerateWebhookToken(projectId: string): Promise<ActionResult & { token?: string }> {
  const s = await requireStaff();
  const token = randomBytes(18).toString("hex");
  const { error } = await s.supabase.from("projects").update({ webhook_token: token }).eq("id", projectId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/app/settings/${projectId}`);
  return { ok: true, token, message: "새 토큰을 발급했습니다. 이전 토큰은 더 이상 쓸 수 없습니다." };
}

// ---------- 리드 동기화 (직원): 내보내기(push) / 가져오기(pull) ----------
export async function syncLeads(projectId: string, target: "sheets" | "airtable", direction: "push" | "pull"): Promise<ActionResult> {
  const s = await requireStaff();
  const { data: integ } = await s.supabase.from("project_integrations").select("*").eq("project_id", projectId).maybeSingle();
  if (!integ) return { ok: false, error: "연동 설정이 없습니다." };
  if (target === "sheets" && !integ.google_sheet_id) return { ok: false, error: "구글 시트 ID를 먼저 저장하세요." };
  if (target === "airtable" && !(integ.airtable_token && integ.airtable_base_id && integ.airtable_table)) return { ok: false, error: "에어테이블 토큰·베이스·테이블을 먼저 저장하세요." };
  const tab = integ.google_sheet_tab || "리드";
  try {
    if (direction === "push") {
      const { data: synced } = await s.supabase.from("lead_sync").select("lead_id").eq("target", target);
      const done = new Set((synced ?? []).map((x) => x.lead_id));
      const { data: leads } = await s.supabase.from("leads").select("*").eq("project_id", projectId).order("submitted_at").limit(2000);
      const todo = ((leads ?? []) as Lead[]).filter((l) => !done.has(l.id));
      if (!todo.length) return { ok: true, message: "내보낼 새 리드가 없습니다." };
      if (target === "sheets") {
        const r = await sheetsAppend(integ.google_sheet_id!, tab, todo);
        await s.supabase.from("lead_sync").upsert(todo.map((l, i) => ({ lead_id: l.id, target, external_id: r.startRow ? String(r.startRow + i) : null })));
        return { ok: true, message: `구글 시트로 ${r.appended}건 내보냈습니다.` };
      }
      const r = await airtableCreate(integ.airtable_token!, integ.airtable_base_id!, integ.airtable_table!, todo);
      await s.supabase.from("lead_sync").upsert(todo.map((l) => ({ lead_id: l.id, target, external_id: r.ids[l.id] ?? null })));
      return { ok: true, message: `에어테이블로 ${r.created}건 내보냈습니다.` };
    }
    // pull: 외부 행 중 우리 DB에 없는 연락처만 리드로 추가 (리드ID 있는 행 = 우리가 내보낸 것 → 건너뜀)
    const rows = target === "sheets" ? await sheetsReadAll(integ.google_sheet_id!, tab) : await airtableReadAll(integ.airtable_token!, integ.airtable_base_id!, integ.airtable_table!);
    const admin = createAdminClient();
    const { data: existing } = await admin.from("leads").select("id,phone_norm,status,revenue,custom,converted_on,drop_reason").eq("project_id", projectId);
    const known = new Map((existing ?? []).map((x) => [x.phone_norm as string, x]));
    // 매칭 안 된 열은 프로젝트 사용자 정의 열로 자동 추가해 값을 보존한다
    const { data: proj } = await s.supabase.from("projects").select("custom_fields").eq("id", projectId).single();
    const fields: CustomField[] = [...((proj?.custom_fields ?? []) as CustomField[])];
    const keyFor = (label: string) => { const found = fields.find((f) => f.label === label); if (found) return found.key; if (fields.length >= 30) return null; let h = 0; for (const ch of label) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const key = `s_${h.toString(36)}`; fields.push({ key, label: label.slice(0, 40), type: "text" }); return key; };
    let added = 0, skipped = 0, noPhone = 0, dup = 0, updated = 0, failed = 0, lastErr = ""; const unmatched = new Set<string>();
    for (const row of rows) {
      const li = rowToLeadInput(row.values);
      const norm = li.phone.replace(/[^0-9]/g, "");
      if (li.lead_id) { skipped++; continue; }
      if (!norm) { noPhone++; continue; }
      const custom: Record<string, string> = {};
      for (const [label, v] of Object.entries(li.extra)) { const k = keyFor(label); if (k) custom[k] = v; else unmatched.add(label); }
      const patch: Record<string, unknown> = {};
      if (li.status) patch.status = li.status; else if (li.raw_status) custom[keyFor("상태(원본)") ?? "s_status"] = li.raw_status;
      if (li.memo) patch.memo = li.memo; if (li.assignee) patch.assignee = li.assignee;
      if (li.revenue != null) patch.revenue = li.revenue; if (li.pay_type) patch.pay_type = li.pay_type;
      if (li.converted_on) patch.converted_on = li.converted_on; else if (li.status === "전환" && li.submitted_at) patch.converted_on = li.submitted_at.slice(0, 10);
      if (li.drop_reason) patch.drop_reason = li.drop_reason;
      if (Object.keys(custom).length) patch.custom = custom;
      const prev = known.get(norm);
      if (prev) {
        // 이미 있는 리드: 대시보드에서 아직 손대지 않은 값(신규·매출 0·빈 항목)만 시트 값으로 채운다
        const fill: Record<string, unknown> = {};
        if (patch.status && prev.status === "신규") fill.status = patch.status;
        if (patch.revenue != null && !(Number(prev.revenue) > 0)) fill.revenue = patch.revenue;
        if (patch.converted_on && !prev.converted_on) fill.converted_on = patch.converted_on;
        if (patch.drop_reason && !prev.drop_reason) fill.drop_reason = patch.drop_reason;
        const pc = (prev.custom ?? {}) as Record<string, unknown>; const nc = { ...pc }; let ch = false;
        for (const [k, v] of Object.entries(custom)) if (!pc[k]) { nc[k] = v; ch = true; }
        if (ch) fill.custom = nc;
        if (Object.keys(fill).length) { const { error } = await admin.from("leads").update(fill).eq("id", prev.id); if (error) failed++; else updated++; }
        dup++; continue;
      }
      const r = await ingestLead({ project_id: projectId, name: li.name, phone: li.phone, email: li.email, message: li.message, company: li.company, industry: li.industry, budget: li.budget, utm_source: li.utm_source || target, utm_medium: "import", utm_campaign: li.utm_campaign, utm_content: li.utm_content, landing_id: li.landing_id, submitted_at: li.submitted_at });
      if (!r.ok) { skipped++; continue; }
      known.set(norm, { id: r.id, phone_norm: norm, status: "신규", revenue: 0, custom: {}, converted_on: null, drop_reason: null }); added++;
      await admin.from("lead_sync").upsert({ lead_id: r.id, target, external_id: row.external_id });
      if (Object.keys(patch).length) { const { error } = await admin.from("leads").update(patch).eq("id", r.id); if (error) { failed++; lastErr = error.message; } }
    }
    if (fields.length !== ((proj?.custom_fields ?? []) as CustomField[]).length) await admin.from("projects").update({ custom_fields: fields }).eq("id", projectId);
    const detail = [dup ? `이미 있는 연락처 ${dup}${updated ? ` (그중 ${updated}건은 상태·매출 등 빈 값 채움)` : ""}` : "", noPhone ? `연락처 없음 ${noPhone}` : "", skipped ? `기타 ${skipped}` : "", failed ? `갱신 실패 ${failed}건 (${lastErr.slice(0, 80)})` : ""].filter(Boolean).join(", ");
    revalidatePath(`/app/projects/${projectId}`);
    return { ok: true, message: `${target === "sheets" ? "구글 시트" : "에어테이블"}에서 ${added}건 가져왔습니다.${detail ? ` 건너뜀: ${detail}.` : ""}${rows.length && !rows.some((x) => rowToLeadInput(x.values).phone) ? " 연락처 열을 찾지 못했습니다. 헤더에 '연락처' 또는 '전화번호' 열이 있는지 확인하세요." : ""}` };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** 이력에서 리포트 클릭 시 본문 조회 (RLS: 직원 또는 배정 고객사) */
export async function fetchAnalysis(id: string): Promise<Analysis | null> {
  const s = await getSession();
  if (!s) return null;
  return loadAnalysis(s.supabase, id);
}

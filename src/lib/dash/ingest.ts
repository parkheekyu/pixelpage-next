import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Lead } from "./types";
import { randomUUID } from "node:crypto";
import { sheetsAppend } from "@/lib/integrations/leadsync";
import { sheetConfig } from "./sheet-leads";

/** 웹훅·홈페이지 문의 공용 리드 적재. 연락처(숫자만) 기준 중복은 버리지 않고 표시. */
export interface IngestInput {
  client?: string;           // projects.slug (project_id 가 없을 때)
  project_id?: string;       // 프로젝트별 웹훅 토큰으로 인증된 경우
  name?: string; phone: string; email?: string; message?: string;
  company?: string; industry?: string; budget?: string; services?: string; marketing_status?: string;
  submitted_at?: string;
  utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string; utm_term?: string;
  landing_id?: string; landing_url?: string;
  raw?: unknown;
}

export type IngestResult =
  | { ok: true; id: string; duplicate: boolean; original_lead_id: string | null }
  | { ok: false; status: number; error: string };

export async function ingestLead(input: IngestInput): Promise<IngestResult> {
  const str = (v: unknown) => (v == null ? "" : String(v).trim());
  const client = str(input.client), phone = str(input.phone);
  if ((!client && !input.project_id) || !phone) return { ok: false, status: 400, error: "client(또는 프로젝트 토큰), phone 필수" };
  const phoneNorm = phone.replace(/[^0-9]/g, "");
  if (phoneNorm.length < 9) return { ok: false, status: 400, error: "연락처 형식이 올바르지 않습니다" };

  const admin = createAdminClient();
  const { data: project } = input.project_id
    ? await admin.from("projects").select("id,slug").eq("id", input.project_id).maybeSingle()
    : await admin.from("projects").select("id,slug").eq("slug", client).maybeSingle();
  if (!project) return { ok: false, status: 404, error: `unknown client: ${client || input.project_id}` };
  // 리드는 구글 시트에만 쌓는다. 시트를 연결한 프로젝트는 시트 끝에 한 줄을 추가하고 DB 에는 넣지 않는다.
  const sheet = await sheetConfig(project.id);
  if (sheet) {
    const now = new Date().toISOString();
    const sub = str(input.submitted_at);
    const lead = {
      id: randomUUID(), project_id: project.id, submitted_at: sub && !Number.isNaN(Date.parse(sub)) ? new Date(sub).toISOString() : now,
      name: str(input.name).slice(0, 100) || null, phone: phone.slice(0, 40), phone_norm: phoneNorm, email: str(input.email).slice(0, 200) || null, message: str(input.message).slice(0, 4000) || null,
      company: str(input.company).slice(0, 120) || null, industry: str(input.industry).slice(0, 80) || null, budget: str(input.budget).slice(0, 80) || null, services: null, marketing_status: null,
      utm_source: (str(input.utm_source) || "unknown").toLowerCase().slice(0, 60), utm_medium: null, utm_campaign: str(input.utm_campaign).slice(0, 120) || null, utm_content: str(input.utm_content).slice(0, 120) || null, utm_term: null,
      landing_id: str(input.landing_id).slice(0, 80) || null, landing_url: null, status: "신규", drop_reason: null, assignee: null, first_contact_at: null, consulted_at: null, converted_on: null,
      revenue: 0, pay_type: null, memo: null, custom: {}, manual_order: null, is_duplicate: false, original_lead_id: null, created_at: now, updated_at: now,
    } as Lead;
    try { await sheetsAppend(sheet.sheetId, sheet.tab, [lead]); } catch (e) { return { ok: false, status: 502, error: (e as Error).message }; }
    return { ok: true, id: lead.id, duplicate: false, original_lead_id: null };
  }
  // 시트를 아직 연결하지 않은 자사 프로젝트만 예전처럼 DB 에 받는다 (홈페이지 문의가 사라지지 않도록). 고객사는 시트 연결이 먼저다.
  if (project.slug !== "pixelpage") return { ok: false, status: 409, error: "리드 시트가 연결되지 않았습니다. 설정에서 Google Sheets 를 먼저 연결해 주세요." };

  const { data: original } = await admin
    .from("leads").select("id").eq("project_id", project.id).eq("phone_norm", phoneNorm)
    .order("submitted_at", { ascending: true }).limit(1).maybeSingle();

  const submitted = str(input.submitted_at);
  const landingUrl = str(input.landing_url);
  const landingId = str(input.landing_id) || (landingUrl ? landingUrl.split("?")[0].split("/").filter(Boolean).pop() ?? null : null);

  const row = {
    project_id: project.id,
    submitted_at: submitted && !Number.isNaN(Date.parse(submitted)) ? new Date(submitted).toISOString() : new Date().toISOString(),
    name: str(input.name).slice(0, 100) || null,
    phone: phone.slice(0, 40),
    phone_norm: phoneNorm,
    email: str(input.email).slice(0, 200) || null,
    message: str(input.message).slice(0, 4000) || null,
    company: str(input.company).slice(0, 120) || null,
    industry: str(input.industry).slice(0, 80) || null,
    budget: str(input.budget).slice(0, 80) || null,
    services: str(input.services).slice(0, 300) || null,
    marketing_status: str(input.marketing_status).slice(0, 120) || null,
    utm_source: (str(input.utm_source) || "unknown").toLowerCase().slice(0, 60),
    utm_medium: str(input.utm_medium).slice(0, 60) || null,
    utm_campaign: str(input.utm_campaign).slice(0, 120) || null,
    utm_content: str(input.utm_content).slice(0, 120) || null,
    utm_term: str(input.utm_term).slice(0, 120) || null,
    landing_id: landingId ? landingId.slice(0, 80) : null,
    landing_url: landingUrl.slice(0, 1000) || null,
    status: original ? "드랍" : "신규",
    drop_reason: original ? "중복" : null,
    is_duplicate: !!original,
    original_lead_id: original?.id ?? null,
    raw_payload: input.raw ?? null,
  };
  const { data, error } = await admin.from("leads").insert(row).select("*").single();
  if (error) return { ok: false, status: 500, error: error.message };
  return { ok: true, id: data.id, duplicate: !!original, original_lead_id: original?.id ?? null };
}

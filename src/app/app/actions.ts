"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession, requireSession, requireStaff } from "@/lib/dash/auth";
import { CUSTOM_TYPES, DROPS, PAYS, STATUSES, type CustomField, type LeadPatch } from "@/lib/dash/types";
import { queryLeads, type LeadPage, type LeadQuery } from "@/lib/dash/leads-query";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

// ---------- 인증 ----------
export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/app");
  if (!email || !password) return { ok: false, error: "이메일과 비밀번호를 입력해 주세요." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  redirect(next.startsWith("/app") ? next : "/app");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/app/login");
}

// ---------- 리드 시트 수정 (고객사 + 직원) ----------
export async function updateLead(projectId: string, leadId: string, patch: LeadPatch): Promise<ActionResult> {
  const s = await getSession();
  if (!s) return { ok: false, error: "로그인이 필요합니다." };

  const clean: LeadPatch = {};
  if (patch.status !== undefined) {
    if (!STATUSES.includes(patch.status)) return { ok: false, error: "잘못된 상태값" };
    clean.status = patch.status;
  }
  if (patch.drop_reason !== undefined) {
    if (patch.drop_reason !== null && !DROPS.includes(patch.drop_reason)) return { ok: false, error: "잘못된 드랍 사유" };
    clean.drop_reason = patch.drop_reason;
  }
  if (patch.pay_type !== undefined) {
    if (patch.pay_type !== null && !PAYS.includes(patch.pay_type)) return { ok: false, error: "잘못된 결제구분" };
    clean.pay_type = patch.pay_type;
  }
  if (patch.revenue !== undefined) clean.revenue = Math.max(0, Math.round(Number(patch.revenue) || 0));
  if (patch.converted_on !== undefined) clean.converted_on = patch.converted_on || null;
  if (patch.memo !== undefined) clean.memo = (patch.memo ?? "").slice(0, 2000) || null;
  if (patch.custom !== undefined) {
    const c = cleanCustom(patch.custom);
    if (!c) return { ok: false, error: "사용자 정의 값 형식 오류" };
    clean.custom = c;
  }

  // 상태 전이에 따른 부가 필드 정리 (프로토타입과 동일 규칙)
  if (clean.status && clean.status !== "전환") { clean.revenue = 0; clean.pay_type = null; clean.converted_on = null; }
  if (clean.status && clean.status !== "드랍") clean.drop_reason = null;
  if (clean.status === "전환") {
    clean.pay_type = clean.pay_type ?? "결제확정";
    clean.converted_on = clean.converted_on ?? new Date().toISOString().slice(0, 10);
  }

  // RLS + 트리거가 최종 권한을 검증한다
  const { error } = await s.supabase.from("leads").update(clean).eq("id", leadId).eq("project_id", projectId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/app/projects/${projectId}`);
  return { ok: true };
}

function cleanCustom(v: unknown): Record<string, string | number | null> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const out: Record<string, string | number | null> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (!/^[a-z0-9_]{1,40}$/.test(k)) return null;
    if (val === null || val === "") out[k] = null;
    else if (typeof val === "number" && Number.isFinite(val)) out[k] = val;
    else if (typeof val === "string") out[k] = val.slice(0, 500);
    else return null;
  }
  return out;
}

// ---------- 리드 수동 추가 (직원·배정 고객사) / 삭제 (직원) ----------
export interface NewLeadInput { name: string; phone: string; email?: string; utm_source?: string; message?: string; company?: string }
export async function createLead(projectId: string, input: NewLeadInput): Promise<ActionResult & { id?: string }> {
  const s = await getSession();
  if (!s) return { ok: false, error: "로그인이 필요합니다." };
  const name = (input.name ?? "").trim().slice(0, 100), phone = (input.phone ?? "").trim().slice(0, 40);
  const phoneNorm = phone.replace(/[^0-9]/g, "");
  if (!name || phoneNorm.length < 9) return { ok: false, error: "이름과 연락처(9자리 이상)를 입력해 주세요." };
  const { data: original } = await s.supabase.from("leads").select("id").eq("project_id", projectId).eq("phone_norm", phoneNorm).order("submitted_at", { ascending: true }).limit(1).maybeSingle();
  const { data, error } = await s.supabase.from("leads").insert({
    project_id: projectId, name, phone, phone_norm: phoneNorm,
    email: (input.email ?? "").trim().slice(0, 200) || null,
    message: (input.message ?? "").trim().slice(0, 4000) || null,
    company: (input.company ?? "").trim().slice(0, 120) || null,
    utm_source: ((input.utm_source ?? "").trim().toLowerCase() || "manual").slice(0, 60),
    utm_medium: "manual", landing_id: "manual",
    status: original ? "드랍" : "신규", drop_reason: original ? "중복" : null,
    is_duplicate: !!original, original_lead_id: original?.id ?? null,
  }).select("id").single();
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/app/projects/${projectId}`);
  return { ok: true, id: data.id };
}

export async function deleteLead(projectId: string, leadId: string): Promise<ActionResult> {
  const s = await requireStaff();
  const { error, count } = await s.supabase.from("leads").delete({ count: "exact" }).eq("id", leadId).eq("project_id", projectId);
  if (error) return { ok: false, error: error.message };
  if (!count) return { ok: false, error: "삭제할 리드를 찾지 못했습니다." };
  revalidatePath(`/app/projects/${projectId}`);
  return { ok: true };
}

// ---------- 열 설정 (직원): 사용자 정의 열 + 기본 열 숨김 ----------
export async function updateProjectColumns(projectId: string, input: { custom_fields?: CustomField[]; hidden_columns?: string[] }): Promise<ActionResult> {
  const s = await requireStaff();
  const patch: Record<string, unknown> = {};
  if (input.custom_fields) {
    const seen = new Set<string>();
    const fields: CustomField[] = [];
    for (const f of input.custom_fields.slice(0, 30)) {
      const key = String(f.key ?? "").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 40);
      const label = String(f.label ?? "").trim().slice(0, 40);
      if (!key || !label || seen.has(key) || !CUSTOM_TYPES.includes(f.type)) return { ok: false, error: `열 정의 오류: ${label || key}` };
      seen.add(key);
      const options = f.type === "select" ? (f.options ?? []).map((o) => String(o).trim().slice(0, 60)).filter(Boolean).slice(0, 50) : undefined;
      fields.push({ key, label, type: f.type, ...(options ? { options } : {}) });
    }
    patch.custom_fields = fields;
  }
  if (input.hidden_columns) patch.hidden_columns = [...new Set(input.hidden_columns.map((c) => String(c).slice(0, 40)))].filter((c) => c !== "name").slice(0, 40);
  const { error } = await s.supabase.from("projects").update(patch).eq("id", projectId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/app/projects/${projectId}`);
  return { ok: true };
}

// ---------- 리드 시트 페이지 조회 (RLS가 프로젝트 접근을 거른다) ----------
export async function fetchLeadsPage(projectId: string, query: LeadQuery): Promise<LeadPage | { error: string }> {
  const s = await getSession();
  if (!s) return { error: "로그인이 필요합니다." };
  try {
    return await queryLeads(s.supabase, projectId, query);
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ---------- 직원 전용: 프로젝트 ----------
export async function createProject(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const s = await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
  if (!name || !slug) return { ok: false, error: "이름과 슬러그(영문·숫자·하이픈)를 입력해 주세요." };
  const { error } = await s.supabase.from("projects").insert({ name, slug, is_own: formData.get("is_own") === "on" });
  if (error) return { ok: false, error: error.code === "23505" ? "이미 사용 중인 슬러그입니다." : error.message };
  revalidatePath("/app", "layout");
  return { ok: true, message: `${name} 프로젝트를 만들었습니다.` };
}

export async function setProjectActive(projectId: string, active: boolean): Promise<ActionResult> {
  const s = await requireStaff();
  const { error } = await s.supabase.from("projects").update({ active }).eq("id", projectId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app", "layout");
  return { ok: true };
}

// ---------- 직원 전용: 회원 ----------
export async function inviteUser(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const role = formData.get("role") === "staff" ? "staff" : "client";
  const password = String(formData.get("password") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  if (!email) return { ok: false, error: "이메일을 입력해 주세요." };
  if (password && password.length < 8) return { ok: false, error: "비밀번호는 8자 이상이어야 합니다." };

  let admin;
  try { admin = createAdminClient(); } catch (e) { return { ok: false, error: (e as Error).message }; }

  // 비밀번호를 지정하면 즉시 생성, 아니면 초대 메일 발송
  const created = password
    ? await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name, role } })
    : await admin.auth.admin.inviteUserByEmail(email, { data: { name, role }, redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixelpage.co.kr"}/app/login` });
  if (created.error) return { ok: false, error: created.error.message };
  const userId = created.data.user?.id;
  if (!userId) return { ok: false, error: "사용자 생성 실패" };

  // 트리거가 프로필을 만들지만, 역할/이름은 명시적으로 한 번 더 맞춘다
  await admin.from("profiles").upsert({ id: userId, email, name: name || null, role });
  if (projectId && role === "client") {
    await admin.from("project_members").upsert({ project_id: projectId, user_id: userId });
  }
  revalidatePath("/app/admin/users");
  return { ok: true, message: password ? `${email} 계정을 만들었습니다.` : `${email} 로 초대 메일을 보냈습니다.` };
}

export async function setUserRole(userId: string, role: "staff" | "client"): Promise<ActionResult> {
  const s = await requireStaff();
  if (userId === s.user.id) return { ok: false, error: "자기 자신의 역할은 바꿀 수 없습니다." };
  const { error } = await s.supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/admin/users");
  return { ok: true };
}

export async function setMembership(userId: string, projectId: string, member: boolean): Promise<ActionResult> {
  const s = await requireStaff();
  const q = member
    ? s.supabase.from("project_members").upsert({ project_id: projectId, user_id: userId })
    : s.supabase.from("project_members").delete().eq("project_id", projectId).eq("user_id", userId);
  const { error } = await q;
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/admin/users");
  return { ok: true };
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  const s = await requireStaff();
  if (userId === s.user.id) return { ok: false, error: "자기 자신은 삭제할 수 없습니다." };
  let admin;
  try { admin = createAdminClient(); } catch (e) { return { ok: false, error: (e as Error).message }; }
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/admin/users");
  return { ok: true };
}

// ---------- 직원 전용: 리드 담당자 배정 ----------
export async function setAssignee(projectId: string, leadId: string, assignee: string | null): Promise<ActionResult> {
  const s = await requireStaff();
  const { error } = await s.supabase.from("leads").update({ assignee: assignee || null }).eq("id", leadId).eq("project_id", projectId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/app/projects/${projectId}`);
  return { ok: true };
}

export async function ensureSessionOrRedirect() {
  await requireSession();
}

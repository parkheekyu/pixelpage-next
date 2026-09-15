"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession, requireSession, requireStaff } from "@/lib/dash/auth";
import { DROPS, PAYS, STATUSES, type LeadPatch } from "@/lib/dash/types";

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

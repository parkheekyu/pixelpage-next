"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/dash/auth";
import { PRIORITIES, TASK_STATUSES, type Priority, type TaskStatus, type WorkProjectPatch, type WorkTaskPatch } from "@/lib/dash/types";
import type { ActionResult } from "./actions";

const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const done = () => { revalidatePath("/app/admin", "layout"); return { ok: true } as const; };
const fail = (error: string): ActionResult => ({ ok: false, error });

// ---------- 프로젝트 ----------
function cleanProject(p: WorkProjectPatch): WorkProjectPatch | string {
  const out: WorkProjectPatch = {};
  if (p.name !== undefined) { const v = String(p.name).trim().slice(0, 80); if (!v) return "프로젝트 이름을 입력해 주세요."; out.name = v; }
  if (p.goal !== undefined) out.goal = (p.goal ?? "").trim().slice(0, 500) || null;
  if (p.deadline !== undefined) { if (p.deadline && !isDate(p.deadline)) return "날짜 형식 오류"; out.deadline = p.deadline || null; }
  if (p.client_id !== undefined) out.client_id = p.client_id || null;
  if (p.status !== undefined) { if (p.status !== "active" && p.status !== "done") return "잘못된 상태"; out.status = p.status; }
  return out;
}

export async function createWorkProject(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const s = await requireStaff();
  const str = (k: string) => String(formData.get(k) ?? "");
  const c = cleanProject({ name: str("name"), goal: str("goal"), deadline: str("deadline") || null, client_id: str("client_id") || null });
  if (typeof c === "string") return fail(c);
  const { error } = await s.supabase.from("work_projects").insert(c);
  if (error) return fail(error.message);
  revalidatePath("/app/admin", "layout");
  return { ok: true, message: `${c.name} 프로젝트를 만들었습니다.` };
}

export async function updateWorkProject(id: string, patch: WorkProjectPatch): Promise<ActionResult> {
  const s = await requireStaff();
  const c = cleanProject(patch);
  if (typeof c === "string") return fail(c);
  const { error } = await s.supabase.from("work_projects").update({ ...c, updated_at: new Date().toISOString() }).eq("id", id);
  return error ? fail(error.message) : done();
}

export async function deleteWorkProject(id: string): Promise<ActionResult> {
  const s = await requireStaff();
  const { error } = await s.supabase.from("work_projects").delete().eq("id", id);
  return error ? fail(error.message) : done();
}

// ---------- 마일스톤 ----------
export async function createMilestone(projectId: string, title: string): Promise<ActionResult> {
  const s = await requireStaff();
  const t = title.trim().slice(0, 120);
  if (!t) return fail("마일스톤 이름을 입력해 주세요.");
  const { data: last } = await s.supabase.from("work_milestones").select("position").eq("project_id", projectId).order("position", { ascending: false }).limit(1).maybeSingle();
  const { error } = await s.supabase.from("work_milestones").insert({ project_id: projectId, title: t, position: (last?.position ?? 0) + 1 });
  return error ? fail(error.message) : done();
}

export async function renameMilestone(id: string, title: string): Promise<ActionResult> {
  const s = await requireStaff();
  const t = title.trim().slice(0, 120);
  if (!t) return fail("마일스톤 이름을 입력해 주세요.");
  const { error } = await s.supabase.from("work_milestones").update({ title: t }).eq("id", id);
  return error ? fail(error.message) : done();
}

/** 마일스톤을 지우면 그 안의 할 일은 프로젝트의 '마일스톤 없음' 으로 남는다 */
export async function deleteMilestone(id: string): Promise<ActionResult> {
  const s = await requireStaff();
  const { error } = await s.supabase.from("work_milestones").delete().eq("id", id);
  return error ? fail(error.message) : done();
}

// ---------- 할 일 ----------
// 화면이 먼저 바뀌고 여기서는 저장만 한다. 페이지를 다시 그리지 않아야 입력이 빠르다.
function cleanTask(p: WorkTaskPatch): WorkTaskPatch | string {
  const out: WorkTaskPatch = {};
  if (p.title !== undefined) { const v = String(p.title).trim().slice(0, 200); if (!v) return "할 일을 입력해 주세요."; out.title = v; }
  if (p.deadline !== undefined) { if (p.deadline && !isDate(p.deadline)) return "날짜 형식 오류"; out.deadline = p.deadline || null; }
  if (p.priority !== undefined) { if (!PRIORITIES.includes(p.priority as Priority)) return "잘못된 우선순위"; out.priority = p.priority; }
  if (p.status !== undefined) { if (!TASK_STATUSES.includes(p.status as TaskStatus)) return "잘못된 상태"; out.status = p.status; }
  if (p.hold_reason !== undefined) out.hold_reason = (p.hold_reason ?? "").trim().slice(0, 200) || null;
  for (const k of ["client_id", "project_id", "milestone_id"] as const) if (p[k] !== undefined) out[k] = p[k] || null;
  return out;
}

export async function createTask(input: WorkTaskPatch & { id?: string }): Promise<ActionResult> {
  const s = await requireStaff();
  const c = cleanTask({ ...input, title: input.title ?? "" });
  if (typeof c === "string") return fail(c);
  // 프로젝트에 넣는 할 일은 클라이언트를 프로젝트에서 물려받는다
  if (c.project_id && !c.client_id) {
    const { data: p } = await s.supabase.from("work_projects").select("client_id").eq("id", c.project_id).maybeSingle();
    c.client_id = p?.client_id ?? null;
  }
  const id = input.id && /^[0-9a-f-]{36}$/.test(input.id) ? input.id : undefined;
  const { error } = await s.supabase.from("work_tasks").insert({ ...c, ...(id ? { id } : {}) } as Record<string, unknown>);
  return error ? fail(error.message) : { ok: true };
}

export async function updateTask(id: string, patch: WorkTaskPatch): Promise<ActionResult> {
  const s = await requireStaff();
  const c = cleanTask(patch);
  if (typeof c === "string") return fail(c);
  const extra: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (c.status) { extra.done_at = c.status === "done" ? new Date().toISOString() : null; if (c.status !== "hold") c.hold_reason = null; }
  if (c.project_id !== undefined && c.milestone_id === undefined) c.milestone_id = null; // 프로젝트를 옮기면 마일스톤은 비운다
  const { error } = await s.supabase.from("work_tasks").update({ ...c, ...extra }).eq("id", id);
  return error ? fail(error.message) : { ok: true };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const s = await requireStaff();
  const { error } = await s.supabase.from("work_tasks").delete().eq("id", id);
  return error ? fail(error.message) : { ok: true };
}

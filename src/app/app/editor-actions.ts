"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/dash/auth";
import type { ActionResult } from "./actions";
import type { EditData } from "@/lib/dash/editor-types";

/** 소재 편집기 저장(직원 전용). data 는 브라우저가 편집한 전체 렌더 데이터. */
export async function saveProjectEdit(id: string, data: EditData): Promise<ActionResult> {
  const { user } = await requireStaff();
  if (!data || !Array.isArray(data.scenes)) return { ok: false, error: "데이터 형식 오류" };
  const admin = createAdminClient();
  const { data: row, error } = await admin.from("project_edits").update({ data, edited_at: new Date().toISOString(), updated_by: user.id, updated_at: new Date().toISOString() }).eq("id", id).select("project_id").single();
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/app/presets/${row.project_id}`);
  return { ok: true, message: "저장됨" };
}

export async function resetProjectEdit(id: string): Promise<ActionResult & { data?: EditData }> {
  await requireStaff();
  const admin = createAdminClient();
  const { data: row } = await admin.from("project_edits").select("original, project_id").eq("id", id).maybeSingle();
  if (!row) return { ok: false, error: "없는 소재" };
  const { error } = await admin.from("project_edits").update({ data: row.original, edited_at: null, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, message: "원본으로 되돌림", data: row.original as EditData };
}

/** 렌더 요청 표시 — 광고제작 머신이 `editor_pull.py <slug>/<proj> --render` 로 처리 */
export async function requestRender(id: string): Promise<ActionResult> {
  await requireStaff();
  const admin = createAdminClient();
  const { error } = await admin.from("project_edits").update({ render_requested_at: new Date().toISOString() }).eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true, message: "렌더 요청됨 — 광고제작 머신이 edits 를 받아 렌더합니다" };
}

export async function deleteProjectEdit(id: string): Promise<ActionResult> {
  await requireStaff();
  const admin = createAdminClient();
  const { data: row } = await admin.from("project_edits").select("project_id").eq("id", id).maybeSingle();
  const { error } = await admin.from("project_edits").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (row) revalidatePath(`/app/presets/${row.project_id}`);
  return { ok: true };
}

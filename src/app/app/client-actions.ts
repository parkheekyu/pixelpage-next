"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/dash/auth";
import { CLIENT_CATEGORIES, CLIENT_STATUSES, CONTRACT_TYPES, type ClientCategory, type ClientPatch, type ClientStatus, type ContractType } from "@/lib/dash/types";
import { toAsciiSlug } from "@/lib/slug";
import type { ActionResult } from "./actions";

const PATH = "/app/admin/clients";
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

/** 입력값을 DB 에 넣을 수 있는 형태로 정리. 잘못된 값이면 오류 문구를 돌려준다. */
function clean(patch: ClientPatch): ClientPatch | string {
  const out: ClientPatch = {};
  if (patch.name !== undefined) {
    const name = String(patch.name).trim().slice(0, 80);
    if (!name) return "고객사 이름을 입력해 주세요.";
    out.name = name;
  }
  if (patch.contract_type !== undefined) {
    if (patch.contract_type !== null && !CONTRACT_TYPES.includes(patch.contract_type as ContractType)) return "잘못된 계약 형태";
    out.contract_type = patch.contract_type;
  }
  if (patch.category !== undefined) {
    if (patch.category !== null && !CLIENT_CATEGORIES.includes(patch.category as ClientCategory)) return "잘못된 구분";
    out.category = patch.category;
  }
  if (patch.status !== undefined) {
    if (!CLIENT_STATUSES.includes(patch.status as ClientStatus)) return "잘못된 계약 상태";
    out.status = patch.status;
  }
  for (const k of ["contract_date", "end_date"] as const) {
    if (patch[k] === undefined) continue;
    if (patch[k] && !isDate(patch[k]!)) return "날짜 형식 오류";
    out[k] = patch[k] || null;
  }
  if (patch.revenue_model !== undefined) out.revenue_model = (patch.revenue_model ?? "").trim().slice(0, 500) || null;
  if (patch.memo !== undefined) out.memo = (patch.memo ?? "").trim().slice(0, 2000) || null;
  if (patch.project_id !== undefined) out.project_id = patch.project_id || null;
  return out;
}

/** 클라이언트를 추가하면 고객사(대시보드 프로젝트)도 함께 만들어 잇는다. 사이드바 고객사 목록에 바로 나온다. */
export async function addClient(name: string): Promise<ActionResult> {
  const s = await requireStaff();
  const c = clean({ name });
  if (typeof c === "string") return { ok: false, error: c };
  const base = toAsciiSlug(c.name!.replace(/\(주\)|주식회사/g, "")) || "client";
  let projectId: string | null = null;
  for (const slug of [base, `${base}-${Date.now().toString(36).slice(-4)}`]) {
    const { data, error } = await s.supabase.from("projects").insert({ name: c.name, slug, is_own: false }).select("id").single();
    if (data) { projectId = data.id; break; }
    if (error?.code !== "23505") return { ok: false, error: error?.message ?? "고객사 생성 실패" };
  }
  const { error } = await s.supabase.from("clients").insert({ ...c, project_id: projectId, category: "db" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app", "layout");
  return { ok: true };
}

export async function updateClientRow(id: string, patch: ClientPatch): Promise<ActionResult> {
  const s = await requireStaff();
  const c = clean(patch);
  if (typeof c === "string") return { ok: false, error: c };
  // 종료로 바꾸면 종료일을 오늘로, 다시 진행중으로 돌리면 종료일을 비운다
  if (c.status === "ended" && c.end_date === undefined) c.end_date = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
  if (c.status === "active") c.end_date = null;
  if (c.contract_type === "own") c.category = null;
  const { data: row, error } = await s.supabase.from("clients").update({ ...c, updated_at: new Date().toISOString() }).eq("id", id).select("project_id").maybeSingle();
  if (error) return { ok: false, error: error.code === "23505" ? "이미 다른 클라이언트에 연결된 대시보드 프로젝트입니다." : error.message };
  if (c.contract_type !== undefined && row?.project_id) await s.supabase.from("projects").update({ is_own: c.contract_type === "own" }).eq("id", row.project_id);
  revalidatePath("/app", "layout"); // 사이드바의 구분 표시도 함께 갱신
  return { ok: true };
}

export async function deleteClientRow(id: string): Promise<ActionResult> {
  const s = await requireStaff();
  const { error } = await s.supabase.from("clients").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(PATH);
  return { ok: true };
}

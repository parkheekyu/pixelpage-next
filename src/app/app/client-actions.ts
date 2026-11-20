"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/dash/auth";
import { CLIENT_STATUSES, CONTRACT_TYPES, type ClientPatch, type ClientStatus, type ContractType } from "@/lib/dash/types";
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

export async function createClientRow(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const s = await requireStaff();
  const str = (k: string) => String(formData.get(k) ?? "");
  const c = clean({
    name: str("name"),
    contract_type: (str("contract_type") || null) as ContractType | null,
    status: (str("status") || "active") as ClientStatus,
    contract_date: str("contract_date") || null,
    revenue_model: str("revenue_model"),
    project_id: str("project_id") || null,
  });
  if (typeof c === "string") return { ok: false, error: c };
  const { error } = await s.supabase.from("clients").insert(c);
  if (error) return { ok: false, error: error.code === "23505" ? "이미 다른 클라이언트에 연결된 대시보드 프로젝트입니다." : error.message };
  revalidatePath(PATH);
  return { ok: true, message: `${c.name} 클라이언트를 추가했습니다.` };
}

export async function updateClientRow(id: string, patch: ClientPatch): Promise<ActionResult> {
  const s = await requireStaff();
  const c = clean(patch);
  if (typeof c === "string") return { ok: false, error: c };
  // 종료로 바꾸면 종료일을 오늘로, 다시 진행중으로 돌리면 종료일을 비운다
  if (c.status === "ended" && c.end_date === undefined) c.end_date = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
  if (c.status === "active") c.end_date = null;
  const { error } = await s.supabase.from("clients").update({ ...c, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.code === "23505" ? "이미 다른 클라이언트에 연결된 대시보드 프로젝트입니다." : error.message };
  revalidatePath(PATH);
  return { ok: true };
}

export async function deleteClientRow(id: string): Promise<ActionResult> {
  const s = await requireStaff();
  const { error } = await s.supabase.from("clients").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(PATH);
  return { ok: true };
}

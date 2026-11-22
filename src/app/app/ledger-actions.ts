"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/dash/auth";
import { LEDGER_KINDS, type LedgerInput, type LedgerKind } from "@/lib/dash/ledger";
import type { ActionResult } from "./actions";

const fail = (error: string): ActionResult => ({ ok: false, error });

function clean(p: LedgerInput): LedgerInput | string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date) || Number.isNaN(Date.parse(p.date))) return "날짜를 확인해 주세요.";
  if (!(LEDGER_KINDS as readonly string[]).includes(p.kind)) return "구분을 골라 주세요.";
  const title = String(p.title ?? "").trim().slice(0, 120);
  if (!title) return "내역을 입력해 주세요.";
  const amount = Math.round(Number(p.amount));
  if (!Number.isFinite(amount) || amount < 0 || amount > 1e12) return "금액을 확인해 주세요.";
  return { date: p.date, kind: p.kind as LedgerKind, category: String(p.category ?? "").trim().slice(0, 40) || "기타", method: String(p.method ?? "").trim().slice(0, 40) || null, amount, fixed: !!p.fixed, title, memo: String(p.memo ?? "").trim().slice(0, 300) || null };
}

/** id 가 있으면 고치고, 없으면 새로 넣는다 */
export async function saveLedger(id: string | null, input: LedgerInput): Promise<ActionResult> {
  const s = await requireStaff();
  const c = clean(input);
  if (typeof c === "string") return fail(c);
  const { error } = id
    ? await s.supabase.from("ledger").update({ ...c, updated_at: new Date().toISOString() }).eq("id", id)
    : await s.supabase.from("ledger").insert(c);
  if (error) return fail(error.message);
  revalidatePath("/app/admin/finance");
  return { ok: true };
}

export async function deleteLedger(id: string): Promise<ActionResult> {
  const s = await requireStaff();
  const { error } = await s.supabase.from("ledger").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/app/admin/finance");
  return { ok: true };
}

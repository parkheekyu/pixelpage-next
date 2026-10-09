"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/dash/auth";
import params from "@/lib/dash/preset-params.json";
import type { ActionResult } from "./actions";

/**
 * 프리셋 설정 편집(직원 전용).
 *  - 공용: dash.preset_settings(preset_key) — 광고제작/presets/<key>.json 위에 덮어쓰는 값
 *  - 고객사: dash.client_presets.params — 공용 설정 위에 다시 덮어쓰는 값
 * 광고제작 파이프라인(common.load_preset)이 렌더 때 두 값을 순서대로 병합한다.
 */

type Scalar = number | string | boolean;
const KEYS = params as Record<string, { defaults: Record<string, Scalar> }>;

function clean(presetKey: string, input: Record<string, unknown>): Record<string, Scalar> | null {
  const def = KEYS[presetKey]?.defaults;
  if (!def) return null;
  const out: Record<string, Scalar> = {};
  for (const [k, v] of Object.entries(input)) {
    if (!(k in def)) continue;
    const d = def[k];
    if (typeof d === "number") { const n = Number(v); if (Number.isFinite(n) && n !== d) out[k] = Math.round(n * 10000) / 10000; }
    else if (typeof d === "boolean") { if (typeof v === "boolean" && v !== d) out[k] = v; }
    else if (typeof v === "string" && v.trim() !== d) out[k] = v.trim().slice(0, 300);
  }
  return out;
}

export async function saveSharedPresetParams(presetKey: string, input: Record<string, unknown>): Promise<ActionResult> {
  const { user } = await requireStaff();
  const p = clean(presetKey, input);
  if (!p) return { ok: false, error: "없는 프리셋" };
  const admin = createAdminClient();
  const { error } = await admin.from("preset_settings").upsert({ preset_key: presetKey, params: p, updated_by: user.id, updated_at: new Date().toISOString() }, { onConflict: "preset_key" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/presets"); revalidatePath(`/app/presets/edit/${presetKey}`);
  return { ok: true, message: `${Object.keys(p).length}개 값 저장` };
}

export async function saveClientPresetParams(clientPresetId: string, input: Record<string, unknown>): Promise<ActionResult> {
  await requireStaff();
  const admin = createAdminClient();
  const { data: cp } = await admin.from("client_presets").select("project_id, preset_key").eq("id", clientPresetId).maybeSingle();
  if (!cp) return { ok: false, error: "없는 프리셋" };
  const p = clean(cp.preset_key as string, input);
  if (!p) return { ok: false, error: "없는 프리셋" };
  const { error } = await admin.from("client_presets").update({ params: p, updated_at: new Date().toISOString() }).eq("id", clientPresetId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/app/presets/${cp.project_id}/${clientPresetId}`);
  return { ok: true, message: `${Object.keys(p).length}개 값 저장` };
}

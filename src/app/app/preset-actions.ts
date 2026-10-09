"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/dash/auth";
import presets from "@/lib/dash/presets.json";
import { ASSET_KINDS, PRESET_ASSET_BUCKET, type AssetKind, type PresetAsset } from "@/lib/dash/preset-types";
import type { ActionResult } from "./actions";

/**
 * 고객사 프리셋·에셋 서버 액션 (직원 전용).
 * 파일 자체는 브라우저가 Supabase Storage 서명 업로드 URL 로 직접 PUT 한다(Vercel 본문 4.5MB 한도 회피).
 * 광고제작 파이프라인(pipeline/preset_assets.py)은 service role 로 같은 테이블·버킷에 직접 넣는다.
 */

const KEYS = new Set(presets.items.map((i) => i.key));

export async function createClientPreset(projectId: string, presetKey: string, name?: string): Promise<ActionResult & { id?: string }> {
  const { user } = await requireStaff();
  if (!KEYS.has(presetKey)) return { ok: false, error: "없는 프리셋 키" };
  const item = presets.items.find((i) => i.key === presetKey)!;
  const admin = createAdminClient();
  const { data, error } = await admin.from("client_presets").insert({ project_id: projectId, preset_key: presetKey, name: (name ?? item.name).slice(0, 60), created_by: user.id }).select("id").single();
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/app/presets/${projectId}`);
  return { ok: true, id: data.id as string };
}

export async function createAndOpen(projectId: string, presetKey: string) {
  const r = await createClientPreset(projectId, presetKey);
  if (!r.ok) return r;
  redirect(`/app/presets/${projectId}/${r.id}`);
}

export async function renameClientPreset(id: string, name: string, notes: string | null): Promise<ActionResult> {
  await requireStaff();
  const admin = createAdminClient();
  const { data, error } = await admin.from("client_presets").update({ name: name.trim().slice(0, 60) || "프리셋", notes: notes?.slice(0, 2000) || null, updated_at: new Date().toISOString() }).eq("id", id).select("project_id").single();
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/app/presets/${data.project_id}`); revalidatePath(`/app/presets/${data.project_id}/${id}`);
  return { ok: true };
}

/** 프리셋 삭제 = 에셋 파일까지 삭제 */
export async function deleteClientPreset(id: string): Promise<ActionResult> {
  await requireStaff();
  const admin = createAdminClient();
  const { data: cp } = await admin.from("client_presets").select("project_id").eq("id", id).maybeSingle();
  if (!cp) return { ok: false, error: "없는 프리셋" };
  const { data: assets } = await admin.from("preset_assets").select("path").eq("client_preset_id", id);
  const paths = (assets ?? []).map((a) => a.path as string);
  if (paths.length) await admin.storage.from(PRESET_ASSET_BUCKET).remove(paths);
  const { error } = await admin.from("client_presets").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/app/presets/${cp.project_id}`);
  return { ok: true };
}

function safeName(name: string) {
  const ext = (name.match(/\.([a-z0-9]{1,5})$/i)?.[1] ?? "bin").toLowerCase();
  const base = name.replace(/\.[a-z0-9]{1,5}$/i, "").normalize("NFKD").replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "file";
  return { base, ext };
}

/** 1단계: 서명 업로드 URL 발급. 브라우저가 이 URL 로 PUT 한다. */
export async function getUploadUrl(clientPresetId: string, kind: AssetKind, filename: string, mime: string): Promise<{ ok: true; signedUrl: string; path: string; publicUrl: string } | { ok: false; error: string }> {
  await requireStaff();
  if (!ASSET_KINDS.includes(kind)) return { ok: false, error: "잘못된 종류" };
  const admin = createAdminClient();
  const { data: cp } = await admin.from("client_presets").select("id, project_id, preset_key").eq("id", clientPresetId).maybeSingle();
  if (!cp) return { ok: false, error: "없는 프리셋" };
  const { base, ext } = safeName(filename);
  const path = `${cp.project_id}/${cp.preset_key}/${kind}/${Date.now().toString(36)}-${base}.${ext}`;
  const { data, error } = await admin.storage.from(PRESET_ASSET_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: error?.message ?? "서명 실패" };
  const { data: pub } = admin.storage.from(PRESET_ASSET_BUCKET).getPublicUrl(path);
  void mime;
  return { ok: true, signedUrl: data.signedUrl, path, publicUrl: pub.publicUrl };
}

/** 2단계: 업로드가 끝나면 행 등록 */
export async function registerAsset(clientPresetId: string, input: { kind: AssetKind; label: string; path: string; url: string; mime: string; size: number; meta?: Record<string, unknown> }): Promise<ActionResult & { asset?: PresetAsset }> {
  const { user } = await requireStaff();
  const admin = createAdminClient();
  const { data: cp } = await admin.from("client_presets").select("project_id").eq("id", clientPresetId).maybeSingle();
  if (!cp) return { ok: false, error: "없는 프리셋" };
  const { count } = await admin.from("preset_assets").select("id", { count: "exact", head: true }).eq("client_preset_id", clientPresetId).eq("kind", input.kind);
  const { data, error } = await admin.from("preset_assets").insert({ client_preset_id: clientPresetId, kind: input.kind, label: input.label.slice(0, 120) || null, path: input.path, url: input.url, mime: input.mime || null, size: input.size, source: "upload", meta: input.meta ?? {}, sort: count ?? 0, created_by: user.id }).select("*").single();
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/app/presets/${cp.project_id}/${clientPresetId}`);
  return { ok: true, asset: data as PresetAsset };
}

export async function deleteAsset(assetId: string): Promise<ActionResult> {
  await requireStaff();
  const admin = createAdminClient();
  const { data: a } = await admin.from("preset_assets").select("path, client_preset_id, client_presets(project_id)").eq("id", assetId).maybeSingle();
  if (!a) return { ok: false, error: "없는 에셋" };
  await admin.storage.from(PRESET_ASSET_BUCKET).remove([a.path as string]);
  const { error } = await admin.from("preset_assets").delete().eq("id", assetId);
  if (error) return { ok: false, error: error.message };
  const pid = (a.client_presets as unknown as { project_id: string } | null)?.project_id;
  if (pid) revalidatePath(`/app/presets/${pid}/${a.client_preset_id}`);
  return { ok: true };
}

export async function relabelAsset(assetId: string, label: string): Promise<ActionResult> {
  await requireStaff();
  const admin = createAdminClient();
  const { error } = await admin.from("preset_assets").update({ label: label.trim().slice(0, 120) || null }).eq("id", assetId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

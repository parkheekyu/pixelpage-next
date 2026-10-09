import { redirect } from "next/navigation";
import { requireProject, getUnreadCounts } from "@/lib/dash/auth";
import ProjectNav from "@/components/dash/ProjectNav";
import presets from "@/lib/dash/presets.json";
import params from "@/lib/dash/preset-params.json";
import PresetEditor from "@/components/dash/PresetEditor";
import type { ClientPreset, PresetAsset } from "@/lib/dash/preset-types";

export const dynamic = "force-dynamic";

type Scalar = number | string | boolean;
const PARAMS = params as Record<string, { defaults: Record<string, Scalar> }>;

/** 고객사 프리셋 전용 설정(직원 전용): 공용 설정 위에 덮어쓰는 값. 배경 에셋이 있으면 미리보기 배경으로. */
export default async function ClientPresetSettings({ params: p }: { params: Promise<{ id: string; cp: string }> }) {
  const { id, cp } = await p;
  const { supabase, project, profile } = await requireProject(id);
  if (profile.role !== "staff") redirect(`/app/projects/${id}`);
  const unread = (await getUnreadCounts())[project.id] ?? {};
  const { data: preset } = await supabase.from("client_presets").select("*").eq("id", cp).eq("project_id", project.id).maybeSingle();
  if (!preset) redirect(`/app/presets/${id}`);
  const key = (preset as ClientPreset).preset_key;
  if (!PARAMS[key]) redirect(`/app/presets/${id}/${cp}`);
  const [{ data: shared }, { data: bgAsset }] = await Promise.all([
    supabase.from("preset_settings").select("params").eq("preset_key", key).maybeSingle(),
    supabase.from("preset_assets").select("url, mime").eq("client_preset_id", cp).in("kind", ["bg", "photo"]).order("sort").limit(1).maybeSingle(),
  ]);
  const item = presets.items.find((i) => i.key === key);
  const bg = bgAsset && (bgAsset as PresetAsset).mime?.startsWith("image/") ? (bgAsset as PresetAsset).url : null;
  return (
    <>
      <ProjectNav project={project} isStaff unread={unread} />
      <PresetEditor scope={{ kind: "client", presetKey: key, clientPresetId: cp, projectId: project.id, projectName: project.name }} name={(preset as ClientPreset).name || item?.name || key}
        defaults={PARAMS[key].defaults} shared={((shared?.params as Record<string, Scalar>) ?? {})} current={(preset as ClientPreset).params as Record<string, Scalar>} sampleBase={presets.base} bgUrl={bg} />
    </>
  );
}

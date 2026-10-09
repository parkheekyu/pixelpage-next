import { requireProject, getUnreadCounts } from "@/lib/dash/auth";
import { redirect } from "next/navigation";
import ProjectNav from "@/components/dash/ProjectNav";
import presets from "@/lib/dash/presets.json";
import PresetAssetsClient from "@/components/dash/PresetAssetsClient";
import type { ClientPreset, PresetAsset } from "@/lib/dash/preset-types";

export const dynamic = "force-dynamic";

/** 고객사 프리셋 하나: 에셋을 종류별로 드래그앤드롭으로 넣고 지운다. */
export default async function ClientPresetDetail({ params }: { params: Promise<{ id: string; cp: string }> }) {
  const { id, cp } = await params;
  const { supabase, project, profile } = await requireProject(id);
  if (profile.role !== "staff") redirect(`/app/projects/${id}`);
  const unread = (await getUnreadCounts())[project.id] ?? {};
  const { data: preset } = await supabase.from("client_presets").select("*").eq("id", cp).eq("project_id", project.id).maybeSingle();
  if (!preset) redirect(`/app/presets/${id}`);
  const { data: assets } = await supabase.from("preset_assets").select("*").eq("client_preset_id", cp).order("kind").order("sort").order("created_at");
  const catalog = presets.items.find((i) => i.key === (preset as ClientPreset).preset_key) ?? null;
  return (
    <>
      <ProjectNav project={project} isStaff unread={unread} />
      <PresetAssetsClient project={project} preset={preset as ClientPreset} assets={(assets ?? []) as PresetAsset[]} catalog={catalog} base={presets.base} />
    </>
  );
}

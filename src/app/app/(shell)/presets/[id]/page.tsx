import { requireProject, getUnreadCounts } from "@/lib/dash/auth";
import { redirect } from "next/navigation";
import ProjectNav from "@/components/dash/ProjectNav";
import presets from "@/lib/dash/presets.json";
import ClientPresetsClient from "@/components/dash/ClientPresetsClient";
import type { ClientPreset } from "@/lib/dash/preset-types";

export const dynamic = "force-dynamic";

/** 고객사 프리셋 목록(직원 전용): 공용 프리셋을 이 고객사로 가져오고, 각 프리셋에 에셋을 넣는다. */
export default async function ClientPresetsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, project, profile } = await requireProject(id);
  if (profile.role !== "staff") redirect(`/app/projects/${id}`);
  const unread = (await getUnreadCounts())[project.id] ?? {};
  const { data } = await supabase.from("client_presets").select("*").eq("project_id", project.id).order("created_at", { ascending: false });
  const list = (data ?? []) as ClientPreset[];
  const counts: Record<string, number> = {};
  if (list.length) {
    const { data: rows } = await supabase.from("preset_assets").select("client_preset_id").in("client_preset_id", list.map((c) => c.id));
    for (const r of rows ?? []) counts[r.client_preset_id as string] = (counts[r.client_preset_id as string] ?? 0) + 1;
  }
  return (
    <>
      <ProjectNav project={project} isStaff unread={unread} />
      <ClientPresetsClient project={project} list={list} counts={counts} catalog={presets.items} base={presets.base} />
    </>
  );
}

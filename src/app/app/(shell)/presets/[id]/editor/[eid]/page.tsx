import { redirect } from "next/navigation";
import { requireProject } from "@/lib/dash/auth";
import VideoEditor from "@/components/dash/VideoEditor";
import type { ProjectEdit } from "@/lib/dash/editor-types";

export const dynamic = "force-dynamic";

/** 소재 편집기(직원 전용). 전체 폭을 쓰므로 ProjectNav 없이 자체 헤더. */
export default async function EditorPage({ params }: { params: Promise<{ id: string; eid: string }> }) {
  const { id, eid } = await params;
  const { supabase, project, profile } = await requireProject(id);
  if (profile.role !== "staff") redirect(`/app/projects/${id}`);
  const { data } = await supabase.from("project_edits").select("*").eq("id", eid).eq("project_id", project.id).maybeSingle();
  if (!data) redirect(`/app/presets/${id}`);
  return <VideoEditor edit={data as ProjectEdit} projectId={project.id} projectName={project.name} />;
}

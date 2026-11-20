import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/dash/auth";
import WorkProjectDetail from "@/components/dash/WorkProjectDetail";
import type { Client, WorkMilestone, WorkProject, WorkTask } from "@/lib/dash/types";
import { todayKST } from "@/lib/dash/work";

export const dynamic = "force-dynamic";

export default async function WorkProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { supabase } = await requireStaff();
  const [{ data: project }, { data: milestones }, { data: tasks }, { data: clients }] = await Promise.all([
    supabase.from("work_projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("work_milestones").select("*").eq("project_id", id).order("position"),
    supabase.from("work_tasks").select("*").eq("project_id", id).order("created_at"),
    supabase.from("clients").select("*").order("name"),
  ]);
  if (!project) notFound();
  return <WorkProjectDetail project={project as WorkProject} milestones={(milestones ?? []) as WorkMilestone[]} tasks={(tasks ?? []) as WorkTask[]} clients={(clients ?? []) as Client[]} today={todayKST()} />;
}

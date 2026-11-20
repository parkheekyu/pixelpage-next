import { requireStaff } from "@/lib/dash/auth";
import WorkProjects from "@/components/dash/WorkProjects";
import type { Client, WorkProject, WorkTask } from "@/lib/dash/types";
import { todayKST } from "@/lib/dash/work";

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const { supabase } = await requireStaff();
  const [{ data: projects }, { data: tasks }, { data: clients }] = await Promise.all([
    supabase.from("work_projects").select("*").order("created_at"),
    supabase.from("work_tasks").select("*").not("project_id", "is", null),
    supabase.from("clients").select("*").order("name"),
  ]);
  return <WorkProjects projects={(projects ?? []) as WorkProject[]} tasks={(tasks ?? []) as WorkTask[]} clients={(clients ?? []) as Client[]} today={todayKST()} />;
}

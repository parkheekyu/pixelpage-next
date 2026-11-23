import { requireStaff } from "@/lib/dash/auth";
import TodoClient from "@/components/dash/TodoClient";
import type { WorkMilestone, WorkProject, WorkTask } from "@/lib/dash/types";
import { todayKST } from "@/lib/dash/work";

export const dynamic = "force-dynamic";

/** 업무 관리: 날짜별 할 일 목록. 프로젝트 관리의 업무를 골라 가져온다. */
export default async function TasksPage() {
  const { supabase } = await requireStaff();
  const [{ data: tasks }, { data: projects }, { data: milestones }] = await Promise.all([
    supabase.from("work_tasks").select("*").order("created_at"),
    supabase.from("work_projects").select("*").order("created_at"),
    supabase.from("work_milestones").select("*").order("position"),
  ]);
  return <TodoClient tasks={(tasks ?? []) as WorkTask[]} projects={(projects ?? []) as WorkProject[]} milestones={(milestones ?? []) as WorkMilestone[]} today={todayKST()} />;
}

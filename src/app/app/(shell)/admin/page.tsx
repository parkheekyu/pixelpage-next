import { requireStaff } from "@/lib/dash/auth";
import { OverviewBoard } from "@/components/dash/TodoClient";
import type { Client, WorkProject, WorkTask } from "@/lib/dash/types";
import { todayKST } from "@/lib/dash/work";

export const dynamic = "force-dynamic";

/** 전체 개요: 오늘 할 일과 프로젝트 진행률. (고객사별 광고 성과는 클라이언트 화면 아래로 옮겼다) */
export default async function AdminPage() {
  const { supabase } = await requireStaff();
  const [{ data: tasks }, { data: workProjects }, { data: clients }] = await Promise.all([
    supabase.from("work_tasks").select("*").order("created_at"),
    supabase.from("work_projects").select("*").order("name"),
    supabase.from("clients").select("id,name"),
  ]);
  return <OverviewBoard tasks={(tasks ?? []) as WorkTask[]} projects={(workProjects ?? []) as WorkProject[]} clients={(clients ?? []) as Client[]} today={todayKST()} />;
}

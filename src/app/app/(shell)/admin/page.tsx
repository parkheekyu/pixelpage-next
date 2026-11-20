import { requireStaff, getMyProjects } from "@/lib/dash/auth";
import { loadAllProjectData } from "@/lib/dash/data";
import { agg, slice, sparkPoints } from "@/lib/dash/agg";
import AdminOverview, { type OverviewRow } from "@/components/dash/AdminOverview";
import WorkTaskBoard from "@/components/dash/WorkTasks";
import type { Client, WorkProject, WorkTask } from "@/lib/dash/types";
import { todayKST } from "@/lib/dash/work";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const sp = await searchParams;
  const days = [7, 14, 28].includes(+(sp.days ?? 0)) ? +sp.days! : 28;
  const { supabase } = await requireStaff();
  const projects = await getMyProjects();
  const [data, { data: tasks }, { data: workProjects }, { data: clients }] = await Promise.all([
    loadAllProjectData(supabase, projects, days),
    supabase.from("work_tasks").select("*").order("created_at"),
    supabase.from("work_projects").select("*").order("name"),
    supabase.from("clients").select("*").order("name"),
  ]);
  const rows: OverviewRow[] = data.map((d) => {
    const cur = slice(d.leads, d.spend, days, "all", 0, d.now), prev = slice(d.leads, d.spend, days, "all", 1, d.now);
    return { project: d.project, A: agg(cur.L, cur.S, d.now), P: agg(prev.L, prev.S, d.now), spark: sparkPoints(d.leads, days, d.now) };
  });
  return (
    <>
      <WorkTaskBoard tasks={(tasks ?? []) as WorkTask[]} clients={(clients ?? []) as Client[]} projects={(workProjects ?? []) as WorkProject[]} today={todayKST()} />
      <AdminOverview rows={rows} days={days} />
    </>
  );
}

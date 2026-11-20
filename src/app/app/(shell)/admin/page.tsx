import { Suspense } from "react";
import { requireStaff, getMyProjects } from "@/lib/dash/auth";
import { loadAllProjectData } from "@/lib/dash/data";
import { agg, slice, sparkPoints } from "@/lib/dash/agg";
import AdminOverview, { type OverviewRow } from "@/components/dash/AdminOverview";
import WorkTaskBoard from "@/components/dash/WorkTasks";
import type { Client, WorkProject, WorkTask } from "@/lib/dash/types";
import { todayKST } from "@/lib/dash/work";

export const dynamic = "force-dynamic";

/** 업무 리스트는 가벼워서 먼저 뜨고, 리드 집계가 필요한 고객사 현황은 준비되는 대로 뒤따라 뜬다 */
export default async function AdminPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const sp = await searchParams;
  const days = [7, 14, 28].includes(+(sp.days ?? 0)) ? +sp.days! : 28;
  const { supabase } = await requireStaff();
  const [{ data: tasks }, { data: workProjects }, { data: clients }] = await Promise.all([
    supabase.from("work_tasks").select("*").order("created_at"),
    supabase.from("work_projects").select("*").order("name"),
    supabase.from("clients").select("*").order("name"),
  ]);
  return (
    <>
      <WorkTaskBoard tasks={(tasks ?? []) as WorkTask[]} clients={(clients ?? []) as Client[]} projects={(workProjects ?? []) as WorkProject[]} today={todayKST()} />
      <Suspense key={days} fallback={<div className="card"><div className="hint" style={{ margin: 0 }}>고객사 현황을 불러오는 중…</div></div>}>
        <Overview days={days} />
      </Suspense>
    </>
  );
}

async function Overview({ days }: { days: number }) {
  const { supabase } = await requireStaff();
  const projects = await getMyProjects();
  const data = await loadAllProjectData(supabase, projects, days);
  const rows: OverviewRow[] = data.map((d) => {
    const cur = slice(d.leads, d.spend, days, "all", 0, d.now), prev = slice(d.leads, d.spend, days, "all", 1, d.now);
    return { project: d.project, A: agg(cur.L, cur.S, d.now), P: agg(prev.L, prev.S, d.now), spark: sparkPoints(d.leads, days, d.now) };
  });
  return <AdminOverview rows={rows} days={days} />;
}

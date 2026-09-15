import { requireStaff, getMyProjects } from "@/lib/dash/auth";
import { loadAllProjectData } from "@/lib/dash/data";
import { agg, slice, sparkPoints } from "@/lib/dash/agg";
import AdminOverview, { type OverviewRow } from "@/components/dash/AdminOverview";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const sp = await searchParams;
  const days = [7, 14, 28].includes(+(sp.days ?? 0)) ? +sp.days! : 28;
  const { supabase } = await requireStaff();
  const projects = await getMyProjects();
  const data = await loadAllProjectData(supabase, projects, days);
  const rows: OverviewRow[] = data.map((d) => {
    const cur = slice(d.leads, d.spend, days, "all", 0, d.now), prev = slice(d.leads, d.spend, days, "all", 1, d.now);
    return { project: d.project, A: agg(cur.L, cur.S, d.now), P: agg(prev.L, prev.S, d.now), spark: sparkPoints(d.leads, days, d.now) };
  });
  return <AdminOverview rows={rows} days={days} />;
}

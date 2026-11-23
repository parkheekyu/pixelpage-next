import { Suspense } from "react";
import { requireStaff, getMyProjects } from "@/lib/dash/auth";
import { loadAllProjectData } from "@/lib/dash/data";
import { agg, slice, sparkPoints } from "@/lib/dash/agg";
import AdminOverview, { type OverviewRow } from "@/components/dash/AdminOverview";
import ClientsAdmin from "@/components/dash/ClientsAdmin";
import type { Client } from "@/lib/dash/types";

export const dynamic = "force-dynamic";

/** 클라이언트 목록이 먼저 뜨고, 리드 집계가 필요한 광고 성과는 준비되는 대로 아래에 뜬다 */
export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const sp = await searchParams;
  const days = [7, 14, 28].includes(+(sp.days ?? 0)) ? +sp.days! : 28;
  const { supabase } = await requireStaff();
  const [projects, { data, error }] = await Promise.all([
    getMyProjects(),
    supabase.from("clients").select("*").order("status").order("contract_date", { ascending: false, nullsFirst: false }).order("name"),
  ]);
  return (
    <>
      <ClientsAdmin clients={(data ?? []) as Client[]} projects={projects} loadError={error?.message ?? null} />
      <div style={{ marginTop: 28 }}>
        <Suspense key={days} fallback={<div className="card"><div className="hint" style={{ margin: 0 }}>고객사 광고 성과를 불러오는 중…</div></div>}>
          <Performance days={days} />
        </Suspense>
      </div>
    </>
  );
}

async function Performance({ days }: { days: number }) {
  const { supabase } = await requireStaff();
  const projects = await getMyProjects();
  const data = await loadAllProjectData(supabase, projects, days);
  const rows: OverviewRow[] = data.map((d) => {
    const cur = slice(d.leads, d.spend, days, "all", 0, d.now), prev = slice(d.leads, d.spend, days, "all", 1, d.now);
    return { project: d.project, A: agg(cur.L, cur.S, d.now), P: agg(prev.L, prev.S, d.now), spark: sparkPoints(d.leads, days, d.now) };
  });
  return <AdminOverview rows={rows} days={days} />;
}

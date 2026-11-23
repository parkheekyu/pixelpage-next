import { Suspense } from "react";
import Link from "next/link";
import { requireStaff, getMyProjects } from "@/lib/dash/auth";
import { loadAllProjectData } from "@/lib/dash/data";
import { agg, fmtW, slice, sparkPoints } from "@/lib/dash/agg";
import AdminOverview, { type OverviewRow } from "@/components/dash/AdminOverview";
import { OverviewBoard } from "@/components/dash/TodoClient";
import type { Client, WorkProject, WorkTask } from "@/lib/dash/types";
import { todayKST } from "@/lib/dash/work";

export const dynamic = "force-dynamic";

/** 전체 개요: 오늘 할 일 · 프로젝트 진행률 · 이번 달 돈 흐름 · 고객사 광고 성과를 한 화면에 요약한다.
 *  가벼운 것들이 먼저 뜨고, 리드 집계가 필요한 광고 성과는 준비되는 대로 뒤따라 뜬다. */
export default async function AdminPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const sp = await searchParams;
  const days = [7, 14, 28].includes(+(sp.days ?? 0)) ? +sp.days! : 28;
  const today = todayKST(), month = today.slice(0, 7);
  const nextMonth = new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7), 1)).toISOString().slice(0, 10); // 다음 달 1일
  const { supabase } = await requireStaff();
  const [{ data: tasks }, { data: workProjects }, { data: clients }, { data: ledger }] = await Promise.all([
    supabase.from("work_tasks").select("*").order("created_at"),
    supabase.from("work_projects").select("*").order("name"),
    supabase.from("clients").select("id,name,status"),
    supabase.from("ledger").select("date,kind,amount").gte("date", `${month}-01`).lt("date", nextMonth).limit(1000),
  ]);
  const sum = (kind: string) => (ledger ?? []).filter((r) => r.kind === kind).reduce((a, r) => a + Number(r.amount), 0);
  const income = sum("income"), expense = sum("expense"), net = income - expense;
  const last = (ledger ?? []).reduce((m, r) => (r.date > m ? r.date : m), "");
  const activeClients = (clients ?? []).filter((c) => c.status === "active").length;
  return (
    <>
      <OverviewBoard tasks={(tasks ?? []) as WorkTask[]} projects={(workProjects ?? []) as WorkProject[]} clients={(clients ?? []) as Client[]} today={today} />

      <div className="ov-h"><h2>{+month.slice(5)}월 수입·지출</h2><small>{last ? `${+last.slice(5, 7)}월 ${+last.slice(8, 10)}일까지 기록됨` : "이번 달 기록이 아직 없습니다"}</small><Link href="/app/admin/finance">수입·지출 열기 ›</Link></div>
      <section className="kpis">
        <div className="kpi"><span>수입</span><b>{fmtW(income)}</b></div>
        <div className="kpi"><span>지출</span><b>{fmtW(expense)}</b></div>
        <div className="kpi"><span>남은 돈 (수입 − 지출)</span><b style={{ color: net < 0 ? "var(--bad)" : undefined }}>{fmtW(net)}</b></div>
        <Link className="kpi" href="/app/admin/clients"><span>진행 중 클라이언트</span><b>{activeClients}곳</b></Link>
      </section>

      <div style={{ marginTop: 28 }}>
        <Suspense key={days} fallback={<div className="card"><div className="hint" style={{ margin: 0 }}>고객사 광고 성과를 불러오는 중…</div></div>}>
          <Overview days={days} />
        </Suspense>
      </div>
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

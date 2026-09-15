"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { agg, fmtW, pct, ratio, slice, sparkPoints, type Agg } from "@/lib/dash/agg";
import type { ProjectData } from "@/lib/dash/data";
import { Spark, Tiles, Trend } from "./charts";
import ProjectCreateForm from "./ProjectCreateForm";

type SortKey = "cost" | "leads" | "cpl" | "roas" | "stale";

export default function AdminOverview({ data, now }: { data: ProjectData[]; now: number }) {
  const router = useRouter();
  const [days, setDays] = useState(28);
  const [sortKey, setSortKey] = useState<SortKey>("cost");

  const rows = useMemo(() => {
    const r = data.map((d) => {
      const cur = slice(d.leads, d.spend, days, "all", 0, now), prev = slice(d.leads, d.spend, days, "all", 1, now);
      return { d, A: agg(cur.L, cur.S, now), P: agg(prev.L, prev.S, now) };
    });
    const dir: Record<SortKey, number> = { cpl: 1, cost: -1, leads: -1, roas: -1, stale: -1 };
    return r.sort((a, b) => (a.A[sortKey] - b.A[sortKey]) * dir[sortKey]);
  }, [data, days, sortKey, now]);

  const sum = (pick: (r: (typeof rows)[number]) => Agg): Agg => {
    const t = rows.reduce((acc, r) => { const a = pick(r); for (const k of ["cost", "imps", "clicks", "leads", "contacted", "consulted", "conv", "revenue", "stale"] as const) acc[k] += a[k]; return acc; },
      { cost: 0, imps: 0, clicks: 0, leads: 0, contacted: 0, consulted: 0, conv: 0, revenue: 0, stale: 0, cpl: 0, cpa: 0, roas: 0 });
    return { ...t, cpl: ratio(t.cost, t.leads), cpa: ratio(t.cost, t.conv), roas: ratio(t.revenue, t.cost) };
  };
  const tot = sum((r) => r.A), totP = sum((r) => r.P);

  return (
    <>
      <header className="ph">
        <h1>전체 고객사 <small>{data.length}개사 · 총 광고비 {fmtW(tot.cost)}</small></h1>
        <div className="controls">
          <select value={days} onChange={(e) => setDays(+e.target.value)}>
            <option value={7}>최근 7일</option><option value={14}>최근 14일</option><option value={28}>최근 4주</option>
          </select>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
            <option value="cost">광고비 순</option><option value="leads">리드 순</option><option value="cpl">CPL 낮은 순</option><option value="roas">ROAS 높은 순</option><option value="stale">미처리 많은 순</option>
          </select>
        </div>
      </header>

      <Tiles A={tot} P={totP} keys={["cost", "leads", "cpl", "conv", "revenue", "roas", "stale"]} />

      <div className="card">
        <h2>고객사별 성과</h2>
        <div className="sub">행을 클릭하면 해당 프로젝트로 이동합니다 · 24h 미처리는 상태 업데이트 SLA 위반 건수</div>
        <div className="tbl-wrap">
          <table className="tbl clients-tbl">
            <thead><tr><th>고객사</th><th>광고비</th><th>리드</th><th>CPL</th><th>전환</th><th>전환율</th><th>확정매출</th><th>ROAS</th><th>24h 미처리</th><th>리드 추이</th><th></th></tr></thead>
            <tbody>
              {rows.map(({ d, A, P }) => (
                <tr key={d.project.id} className="row" onClick={() => router.push(`/app/projects/${d.project.id}/report`)}>
                  <td>{d.project.name}{d.project.is_own && <span className="pill" style={{ fontSize: 11.5, marginLeft: 6 }}>자사</span>}</td>
                  <td>{fmtW(A.cost)}</td>
                  <td>{A.leads} <Trend a={A.leads} b={P.leads} /></td>
                  <td>{fmtW(A.cpl)} <Trend a={A.cpl} b={P.cpl} inverse /></td>
                  <td>{A.conv}</td>
                  <td>{pct(A.conv, A.leads)}</td>
                  <td>{fmtW(A.revenue)}</td>
                  <td>{(A.roas * 100).toFixed(0)}%</td>
                  <td><span className={`badge ${A.stale ? "" : "ok"}`}>{A.stale}</span></td>
                  <td><Spark pts={sparkPoints(d.leads, days, now)} /></td>
                  <td onClick={(e) => e.stopPropagation()}><Link className="btn" href={`/app/projects/${d.project.id}`}>시트</Link></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={11} style={{ color: "var(--muted)", textAlign: "left" }}>프로젝트가 없습니다. 아래에서 첫 프로젝트를 만들어 주세요.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h2>새 프로젝트 (고객사)</h2>
        <div className="sub">슬러그는 웹훅 페이로드의 <code>client</code> 값과 같아야 합니다</div>
        <ProjectCreateForm />
      </div>
    </>
  );
}

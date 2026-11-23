"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fmtW, pct, type Agg } from "@/lib/dash/agg";
import { projectHome, type Project } from "@/lib/dash/types";
import { Spark, Trend } from "./charts";
import { ORDER_EVENT, ORDER_KEY, sorted } from "./Sidebar";
import ProjectCreateForm from "./ProjectCreateForm";

export interface OverviewRow { project: Project; A: Agg; P: Agg; spark: number[] }
type SortKey = "menu" | "cost" | "leads" | "cpl" | "roas" | "stale";

export default function AdminOverview({ rows: input, days }: { rows: OverviewRow[]; days: string }) {
  const router = useRouter(), pathname = usePathname();
  const [pending, start] = useTransition();
  const [sortKey, setSortKey] = useState<SortKey>("menu");
  // 왼쪽 메뉴에서 끌어서 정한 고객사 순서 (이 브라우저에 저장된 값)
  const [menuOrder, setMenuOrder] = useState<string[] | undefined>();
  useEffect(() => {
    const read = () => { try { const v = JSON.parse(localStorage.getItem(ORDER_KEY) ?? "{}"); setMenuOrder(Array.isArray(v?.projects) ? v.projects : undefined); } catch {} };
    read();
    window.addEventListener(ORDER_EVENT, read);
    return () => window.removeEventListener(ORDER_EVENT, read);
  }, []);

  const rows = useMemo(() => {
    if (sortKey === "menu") return sorted(input, (r) => r.project.id, menuOrder);
    const dir = { cpl: 1, cost: -1, leads: -1, roas: -1, stale: -1 }[sortKey];
    return [...input].sort((a, b) => (a.A[sortKey] - b.A[sortKey]) * dir);
  }, [input, sortKey, menuOrder]);

  return (
    <div style={{ opacity: pending ? 0.6 : 1, transition: "opacity .15s" }}>
      <header className="ph">
        <h1>고객사 광고 성과 <small>{rows.length}개사</small></h1>
        <div className="controls">
          <select value={days} onChange={(e) => start(() => router.replace(`${pathname}?days=${e.target.value}`, { scroll: false }))}>
            <option value="7">최근 7일</option><option value="14">최근 14일</option><option value="28">최근 4주</option><option value="56">최근 8주</option><option value="month">이번 달</option><option value="prev">지난달</option><option value="max">최대</option>
          </select>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
            <option value="menu">메뉴 순서</option><option value="cost">광고비 순</option><option value="leads">리드 순</option><option value="cpl">CPL 낮은 순</option><option value="roas">ROAS 높은 순</option><option value="stale">미처리 많은 순</option>
          </select>
        </div>
      </header>

      <div className="card">
        <h2>고객사별 성과</h2>
        <div className="sub">행을 클릭하면 해당 프로젝트 리포트로 이동합니다 · 24h 미처리는 상태 업데이트 SLA 위반 건수 · CPL은 Meta가 집계한 결과 수 기준 (괄호 안 숫자)</div>
        <div className="tbl-wrap">
          <table className="tbl clients-tbl">
            <thead><tr><th>고객사</th><th>광고비</th><th>리드</th><th>CPL</th><th>전환</th><th>전환율</th><th>확정매출</th><th>ROAS</th><th>24h 미처리</th><th>리드 추이</th><th></th></tr></thead>
            <tbody>
              {rows.map(({ project: p, A, P, spark }) => (
                <tr key={p.id} className="row" onClick={() => router.push(p.is_own ? `/app/projects/${p.id}/report` : `/app/research/${p.id}`)}>
                  <td>{p.name}{p.is_own && <span className="pill" style={{ fontSize: 11.5, marginLeft: 6 }}>자사</span>}</td>
                  <td>{fmtW(A.cost)}</td>
                  <td>{A.leads} <Trend a={A.leads} b={P.leads} /></td>
                  <td>{fmtW(A.cpl)}{A.metaLeads != null && <small style={{ color: "var(--muted)", marginLeft: 4 }}>({A.metaLeads})</small>} <Trend a={A.cpl} b={P.cpl} inverse /></td>
                  <td>{A.conv}</td>
                  <td>{pct(A.conv, A.leads)}</td>
                  <td>{fmtW(A.revenue)}</td>
                  <td>{(A.roas * 100).toFixed(0)}%</td>
                  <td><span className={`badge ${A.stale ? "" : "ok"}`}>{A.stale}</span></td>
                  <td><Spark pts={spark} /></td>
                  <td onClick={(e) => e.stopPropagation()}><Link className="btn" href={projectHome(p)}>열기</Link></td>
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
    </div>
  );
}

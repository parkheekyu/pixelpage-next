import { Suspense } from "react";
import Link from "next/link";
import { requireProject, getUnreadCounts } from "@/lib/dash/auth";
import { loadProjectData } from "@/lib/dash/data";
import { agg, fmtN, fmtW, type Agg } from "@/lib/dash/agg";
import { FUNNEL_ENDS, type FunnelEnd, type Project } from "@/lib/dash/types";
import { periodDataDays, periodSlices, REPORT_PERIODS, type ReportPeriod } from "@/lib/dash/report";
import ProjectNav from "@/components/dash/ProjectNav";
import FunnelEndSelect from "@/components/dash/FunnelEndSelect";

export const dynamic = "force-dynamic";

const PERIOD_LABEL: Record<ReportPeriod, string> = { "7": "최근 7일", "14": "최근 14일", "28": "최근 4주", "56": "최근 8주", month: "이번 달", prev: "지난달", max: "최대" };

interface Stage { key: string; label: string; n: number; prev: number; unit: string; costLabel: string; cost: number; note?: string }

/** 비율(0~1)을 읽기 좋은 %로. 아주 작은 값은 자릿수를 늘린다. */
const rate = (v: number | null) => (v == null ? "–" : (v * 100).toFixed(v >= 0.1 ? 1 : v >= 0.001 ? 2 : 3) + "%");
const div = (a: number, b: number) => (b > 0 ? a / b : null);

/** 광고 노출부터 전환까지의 단계. 광고 계정이 없으면 리드부터, 리드 원본이 없으면 Meta 가 집계한 결과까지만 보여 준다. */
function stages(A: Agg, P: Agg, visit: boolean): Stage[] {
  const out: Stage[] = [];
  const hasAds = A.imps > 0 || A.cost > 0 || P.imps > 0;
  if (hasAds) {
    out.push({ key: "imps", label: "노출", n: A.imps, prev: P.imps, unit: "회", costLabel: "1,000회당", cost: A.imps ? (A.cost / A.imps) * 1000 : 0 });
    out.push({ key: "clicks", label: "클릭", n: A.clicks, prev: P.clicks, unit: "회", costLabel: "클릭당", cost: A.clicks ? A.cost / A.clicks : 0 });
  }
  const own = A.leads > 0 || P.leads > 0 || A.metaLeads == null;
  const n = own ? A.leads : A.metaLeads ?? 0, p = own ? P.leads : P.metaLeads ?? 0;
  out.push({ key: "leads", label: "리드", n, prev: p, unit: "건", costLabel: "리드당", cost: n ? A.cost / n : 0, note: own ? (A.metaLeads != null ? `접수된 리드 기준 · Meta 집계는 ${fmtN(A.metaLeads)}건` : "접수된 리드 기준") : "Meta 집계 기준 (이 기간에 접수된 리드 기록이 없습니다)" });
  if (own) {
    out.push({ key: "contacted", label: "연락", n: A.contacted, prev: P.contacted, unit: "건", costLabel: "연락당", cost: A.contacted ? A.cost / A.contacted : 0 });
    out.push({ key: "consulted", label: visit ? "내방" : "상담완료", n: A.consulted, prev: P.consulted, unit: "건", costLabel: visit ? "내방당" : "상담당", cost: A.consulted ? A.cost / A.consulted : 0 });
    out.push({ key: "conv", label: "전환", n: A.conv, prev: P.conv, unit: "건", costLabel: "전환당", cost: A.conv ? A.cost / A.conv : 0 });
  }
  return out;
}

/** 클라이언트별 개요: 노출 → 클릭 → 리드 → 연락 → 상담 → 전환 퍼널을 단계별 비율과 함께 보여 준다. */
export default async function ProjectOverviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ days?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { project, profile } = await requireProject(id);
  const period = ((REPORT_PERIODS as readonly string[]).includes(sp.days ?? "") ? sp.days : "28") as ReportPeriod;
  const unread = await getUnreadCounts();
  // 탭 메뉴와 기간 버튼은 바로 보여 주고, 시트·광고 계정을 읽어야 하는 퍼널은 준비되는 대로 뒤따라 뜬다
  return (
    <>
      <ProjectNav project={project} isStaff={profile.role === "staff"} unread={unread[project.id] ?? {}} />
      <div className="pg">
        <div className="fn-periods" role="tablist" aria-label="기간">
          {REPORT_PERIODS.map((p) => <Link key={p} href={`/app/overview/${project.id}?days=${p}`} className={p === period ? "on" : ""} role="tab" aria-selected={p === period}>{PERIOD_LABEL[p]}</Link>)}
        </div>
        <Suspense key={period} fallback={<div className="skel" aria-busy="true" aria-label="불러오는 중"><div className="skel-tiles"><div className="skel-tile" /><div className="skel-tile" /><div className="skel-tile" /><div className="skel-tile" /></div><div className="skel-block" /></div>}>
          <Funnel project={project} period={period} isStaff={profile.role === "staff"} />
        </Suspense>
      </div>
    </>
  );
}

async function Funnel({ project, period, isStaff }: { project: Project; period: ReportPeriod; isStaff: boolean }) {
  const { supabase } = await requireProject(project.id);
  const data = await loadProjectData(supabase, project, periodDataDays(period));
  const { cur, prev } = periodSlices(data, period);
  const A = agg(cur.L, cur.S, data.now), P = agg(prev.L, prev.S, data.now);
  const cmp = period !== "max"; // 최대는 앞 기간이 없어 비교하지 않는다
  // "등록 여부" 열로 단계를 정하는 클라이언트(학원형)는 상담완료 대신 내방이라고 부른다
  const visit = data.leads.some((l) => (l.custom as Record<string, unknown> | null)?.stage_by === "등록 여부");
  // 브랜드마다 퍼널을 어디까지 볼지 다르다 (예: 리드 수집이 목표인 곳은 리드까지만)
  const end: FunnelEnd = (FUNNEL_ENDS as readonly string[]).includes(project.funnel_end ?? "") ? (project.funnel_end as FunnelEnd) : "conv";
  const all = stages(A, P, visit);
  const cut = all.findIndex((s) => s.key === end);
  const st = cut >= 0 ? all.slice(0, cut + 1) : all;
  const toConv = end === "conv";
  const endLabels = Object.fromEntries(FUNNEL_ENDS.map((k) => [k, k === "leads" ? "리드" : k === "contacted" ? "연락" : k === "consulted" ? (visit ? "내방" : "상담완료") : "전환"])) as Record<FunnelEnd, string>;
  const top = Math.max(1, st[0]?.n ?? 1);
  const width = (n: number) => (n > 0 ? Math.max(6, (Math.log10(n + 1) / Math.log10(top + 1)) * 100) : 0);
  const steps = st.map((s, i) => {
    const before = i > 0 ? st[i - 1] : null;
    const r = before ? div(s.n, before.n) : null, pr = before ? div(s.prev, before.prev) : null;
    return { ...s, r, pr, lost: before ? Math.max(0, before.n - s.n) : 0, total: i > 0 ? div(s.n, st[0].n) : null, change: r != null && pr != null && pr > 0 ? r / pr - 1 : null };
  });
  const empty = st.every((s) => s.n === 0);
  const before = (i: number) => steps[i - 1].label;

  return (
    <>
        <section className="kpis">
          <div className="kpi"><span>광고비</span><b>{fmtW(A.cost)}</b></div>
          <div className="kpi"><span>리드</span><b>{fmtN(steps.find((s) => s.key === "leads")?.n ?? 0)}건</b></div>
          <div className="kpi"><span>CPL (Meta 기준)</span><b>{fmtW(A.cpl)}</b></div>
          <div className="kpi"><span>CTR</span><b>{A.imps > 0 ? rate(A.clicks / A.imps) : "–"}</b></div>
          <div className="kpi"><span>CPM</span><b>{A.imps > 0 ? fmtW((A.cost / A.imps) * 1000) : "–"}</b></div>
          {toConv && <div className="kpi"><span>전환</span><b>{fmtN(A.conv)}건</b></div>}
          {toConv && <div className="kpi"><span>{Number(project.avg_order_value) > 0 ? `매출 (객단가 ${fmtN(Number(project.avg_order_value) / 10000)}만 원 추정) · ROAS` : "확정매출 · ROAS"}</span><b>{fmtW(A.revenue)} <small>{A.cost > 0 ? `${(A.roas * 100).toFixed(0)}%` : "–"}</small></b></div>}
        </section>

        <div className="card fn-card">
          <div className="td-head"><h2>전체 퍼널 <small>{PERIOD_LABEL[period]}</small></h2>{isStaff && <FunnelEndSelect projectId={project.id} value={end} labels={endLabels} />}</div>
          {empty ? <div className="td-empty">이 기간에는 광고 지출과 리드가 없습니다. 기간을 넓혀 보세요.</div> : (
            <>
              <div className="fnl">
                <div className="fn-row fn-th"><span>단계</span><span>규모</span><span>앞 단계 대비</span><span>처음 대비</span><span>건당 비용</span></div>
                {steps.map((s, i) => (
                  <div key={s.key} className="fn-row">
                    <span className="fn-name"><b>{s.label}</b>{s.note && <small>{s.note}</small>}</span>
                    <span className="fn-bar">
                      <i className={`k-${s.key}`} style={{ width: `${width(s.n)}%` }} />
                      <em>{fmtN(s.n)}{s.unit}{cmp && <small>이전 {fmtN(s.prev)}</small>}</em>
                    </span>
                    <span className="fn-rate">
                      {i === 0 ? <small>시작</small> : (
                        <>
                          <b>{rate(s.r)}</b>
                          {cmp && s.r != null && s.pr != null && <small className={s.r >= s.pr ? "up" : "down"}>{s.r >= s.pr ? "▲" : "▼"} {Math.abs((s.r - s.pr) * 100).toFixed(Math.abs(s.r - s.pr) >= 0.001 ? 1 : 2)}%p</small>}
                          <small>{before(i)} {fmtN(s.lost)}{steps[i - 1].unit} 이탈</small>
                        </>
                      )}
                    </span>
                    <span className="fn-total">{i === 0 ? "100%" : rate(s.total)}</span>
                    <span className="fn-cost">{A.cost > 0 && s.n > 0 ? <><b>{fmtW(s.cost)}</b><small>{s.costLabel}</small></> : "–"}</span>
                  </div>
                ))}
              </div>
              <div className="hint">막대 길이는 로그 눈금입니다(단계마다 규모 차이가 커서). "앞 단계 대비"는 바로 앞 단계에서 넘어온 비율이고, ▲▼는 바로 앞 같은 길이 기간과의 차이입니다. {visit ? "연락·내방·전환은 시트의 \"등록 여부\" 값으로 셉니다 (등록·예약금 = 전환, 미등록·등록유력·결제대기 = 내방, 상담예정·재연락·미전환·상담취소·노쇼 = 연락)." : "연락·상담·전환은 리드의 상태 값으로 셉니다."}</div>
            </>
          )}
        </div>

    </>
  );
}

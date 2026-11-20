"use client";

import { Fragment, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, RefreshCw } from "lucide-react";
import { runAdsAnalysis } from "@/app/app/analysis-actions";
import type { MetaAccountSnapshot, MetaGoal, MetaInsight } from "@/lib/integrations/meta";
import type { Analysis, Project } from "@/lib/dash/types";
import { fmtN, fmtW } from "@/lib/dash/agg";
import AnalysisPanel from "./AnalysisPanel";

interface Props { project: Project; isStaff: boolean; adAccountId: string | null; preset: string; snapshot: MetaAccountSnapshot | null; snapError: string | null; cachedAt: string | null; goal: MetaGoal; analyses: Analysis[]; tokenConfigured: boolean }
const PRESETS: [string, string][] = [["last_7d", "최근 7일"], ["last_14d", "최근 14일"], ["last_30d", "최근 30일"], ["last_90d", "최근 90일"]];
const ST_LABEL: Record<string, string> = { ACTIVE: "진행", PAUSED: "중지", CAMPAIGN_PAUSED: "중지", ADSET_PAUSED: "중지", ARCHIVED: "보관", DELETED: "삭제" };

const won = (v: number | null | undefined) => (v == null ? "–" : fmtW(v));
const roasPct = (v: number | null) => (v == null ? "–" : (v * 100).toFixed(0) + "%");
/** 폼 전환율: 링크 클릭 대비 리드 수 */
const formRate = (i: MetaInsight) => (i.link_clicks > 0 ? ((i.leads / i.link_clicks) * 100).toFixed(1) + "%" : "–");

/** 표의 숫자 칸. 목표(리드/구매)에 따라 열이 달라진다. */
function cols(goal: MetaGoal): { label: string; get: (i: MetaInsight) => string }[] {
  const tail = goal === "purchase"
    ? [{ label: "구매", get: (i: MetaInsight) => fmtN(i.purchases) }, { label: "CPA", get: (i: MetaInsight) => won(i.cpa) }, { label: "ROAS", get: (i: MetaInsight) => roasPct(i.roas) }]
    : [{ label: "리드", get: (i: MetaInsight) => fmtN(i.leads) }, { label: "리드 단가", get: (i: MetaInsight) => won(i.cpl) }, { label: "폼 전환율", get: formRate }];
  return [{ label: "소진액", get: (i) => fmtW(i.spend) }, ...tail, { label: "CTR", get: (i) => i.ctr.toFixed(2) + "%" }, { label: "CPM", get: (i) => fmtW(i.cpm) }, { label: "빈도", get: (i) => i.frequency.toFixed(2) }];
}

function Thumb({ ad, size }: { ad: MetaAccountSnapshot["winners"][number]; size: number }) {
  const src = ad.creative?.thumbnail_url ?? ad.creative?.image_url;
  return src ? <img src={src} alt="" style={{ width: size, height: size }} /> : <span className="noimg" style={{ width: size, height: size }}>{ad.creative?.format ?? "–"}</span>;
}

export default function AdsClient({ project, isStaff, adAccountId, preset, snapshot, snapError, cachedAt, goal, analyses, tokenConfigured }: Props) {
  const router = useRouter(), pathname = usePathname();
  const [pending, start] = useTransition();
  const canRun = !!adAccountId && tokenConfigured && !snapError;
  const C = cols(goal);

  // 캠페인은 소진액 큰 순. 처음에는 가장 큰 캠페인만 세트까지 펼쳐 둔다.
  const camps = (snapshot?.campaigns ?? []).filter((c) => c.insight || c.adsets.some((s) => s.insight)).sort((a, b) => (b.insight?.spend ?? 0) - (a.insight?.spend ?? 0));
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(camps[0] ? [camps[0].id] : []));
  const toggle = (id: string) => setOpenIds((cur) => { const n = new Set(cur); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const t = snapshot?.totals;
  const hero: [string, string][] = !t ? [] : goal === "purchase"
    ? [["소진액", fmtW(t.spend)], ["구매", fmtN(t.purchases)], ["CPA", won(t.cpa)], ["매출", fmtW(t.purchase_value)], ["ROAS", roasPct(t.roas)], ["CTR", t.ctr.toFixed(2) + "%"]]
    : [["소진액", fmtW(t.spend)], ["리드", fmtN(t.leads)], ["리드 단가", won(t.cpl)], ["CTR", t.ctr.toFixed(2) + "%"], ["폼 전환율", formRate(t)], ["CPM", fmtW(t.cpm)]];
  const minor: [string, string][] = !t ? [] : [["노출", fmtN(t.impressions)], ["도달", fmtN(t.reach)], ["빈도", t.frequency.toFixed(2)], ["CPC", fmtW(t.cpc)], ["링크 클릭", fmtN(t.link_clicks)], ["랜딩뷰", fmtN(t.landing_page_views)], ...(goal === "purchase" ? [["CPM", fmtW(t.cpm)] as [string, string]] : [])];

  return (
    <>
      {isStaff && (
        <div className="sec-bar">
          <b>Meta 광고 현황</b>
          {snapshot && <span className="hint">{snapshot.account.name ?? snapshot.account.id}</span>}
          <span className="sp" />
          {cachedAt && <span className="hint">{new Date(cachedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })} 기준</span>}
          <select value={preset} aria-label="기간" onChange={(e) => start(() => router.replace(`${pathname}?preset=${e.target.value}`))}>{PRESETS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          {adAccountId && <button type="button" className="btn" disabled={pending} onClick={() => start(() => router.replace(`${pathname}?preset=${preset}&refresh=1`))}><RefreshCw className="ico" aria-hidden /> {pending ? "불러오는 중…" : "새로고침"}</button>}
        </div>
      )}

      {isStaff && (!adAccountId || snapError || !tokenConfigured) && (
        <div className="card" style={{ marginBottom: 12 }}>
          {!adAccountId && <div className="msg err" style={{ margin: 0 }}>Meta 광고 계정 ID가 없습니다. <Link href={`/app/settings/${project.id}`}>설정</Link>에서 입력하세요.</div>}
          {!tokenConfigured && <div className="msg err">서버에 META_ACCESS_TOKEN 이 설정되지 않았습니다.</div>}
          {snapError && <div className="msg err">광고 계정 조회 실패: {snapError}</div>}
        </div>
      )}

      {isStaff && snapshot && t && (
        <div style={{ opacity: pending ? 0.6 : 1, transition: "opacity .15s" }}>
          <section className="kpis">
            {hero.map(([k, v]) => <div className="kpi" key={k}><span>{k}</span><b>{v}</b></div>)}
          </section>
          <div className="kpi-minor">{minor.map(([k, v]) => <span key={k}>{k} <b>{v}</b></span>)}</div>

          {snapshot.winners.length > 0 && (
            <section className="card" style={{ marginBottom: 12 }}>
              <h2>위너 광고</h2><div className="sub">{goal === "purchase" ? "구매 수 → ROAS → CPA 순" : "리드 수 → 리드 단가 → CTR 순"}</div>
              <div className="winners">
                {snapshot.winners.map((ad, i) => (
                  <div className="win" key={ad.id}>
                    <div className="win-top"><Thumb ad={ad} size={56} /><div><span className="rank">{i + 1}</span><b title={ad.name}>{ad.name}</b>{ad.creative?.title && <p>{ad.creative.title}</p>}</div></div>
                    {ad.insight && <dl>{C.slice(0, 4).map((c) => <div key={c.label}><dt>{c.label}</dt><dd>{c.get(ad.insight!)}</dd></div>)}</dl>}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="card" style={{ marginBottom: 12 }}>
            <h2>캠페인별 성과</h2><div className="sub">캠페인을 누르면 세트와 광고가 펼쳐집니다 · 성과 있는 항목만 · 소진액 큰 순</div>
            <div className="tbl-wrap">
              <table className="atbl">
                <thead><tr><th>이름</th><th>상태</th>{C.map((c) => <th key={c.label} className="num">{c.label}</th>)}</tr></thead>
                <tbody>
                  {camps.length === 0 && <tr><td colSpan={C.length + 2} className="empty">기간 내 성과가 있는 캠페인이 없습니다.</td></tr>}
                  {camps.map((c) => {
                    const open = openIds.has(c.id);
                    return (
                      <Fragment key={c.id}>
                        <tr className="lv0" onClick={() => toggle(c.id)}>
                          <td><ChevronRight className={`chev ${open ? "open" : ""}`} aria-hidden /><b>{c.name}</b>{c.daily_budget ? <small>일예산 {fmtW(c.daily_budget)}</small> : null}</td>
                          <td><span className={`st ${c.status}`}>{ST_LABEL[c.status] ?? c.status}</span></td>
                          {C.map((col) => <td key={col.label} className="num">{c.insight ? col.get(c.insight) : "–"}</td>)}
                        </tr>
                        {open && c.adsets.filter((s) => s.insight).map((s) => {
                          const sOpen = openIds.has(s.id), ads = s.ads.filter((a) => a.insight && a.insight.spend > 0);
                          return (
                            <Fragment key={s.id}>
                              <tr className="lv1" onClick={() => toggle(s.id)}>
                                <td><ChevronRight className={`chev ${sOpen ? "open" : ""}`} aria-hidden /><span>{s.name}</span><small>광고 {ads.length}개{s.targeting_summary ? ` · ${s.targeting_summary}` : ""}</small></td>
                                <td><span className={`st ${s.status}`}>{ST_LABEL[s.status] ?? s.status}</span></td>
                                {C.map((col) => <td key={col.label} className="num">{s.insight ? col.get(s.insight) : "–"}</td>)}
                              </tr>
                              {sOpen && ads.map((a) => (
                                <tr className="lv2" key={a.id}>
                                  <td><Thumb ad={a} size={32} /><span title={a.creative?.body ?? a.name}>{a.name}</span></td>
                                  <td><span className={`st ${a.status}`}>{ST_LABEL[a.status] ?? a.status}</span></td>
                                  {C.map((col) => <td key={col.label} className="num">{a.insight ? col.get(a.insight) : "–"}</td>)}
                                </tr>
                              ))}
                            </Fragment>
                          );
                        })}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      <AnalysisPanel projectId={project.id} analyses={analyses} isStaff={isStaff} runLabel={`AI 광고 분석 실행 (${PRESETS.find(([k]) => k === preset)?.[1]})`} canRun={canRun} disabledReason={!adAccountId ? "광고 계정 ID를 저장하세요." : !tokenConfigured ? "META_ACCESS_TOKEN 이 필요합니다." : snapError ? "광고 계정 조회가 실패해 실행할 수 없습니다." : undefined} onRun={() => runAdsAnalysis(project.id, preset)} />
    </>
  );
}

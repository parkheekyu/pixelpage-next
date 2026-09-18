"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { runAdsAnalysis } from "@/app/app/analysis-actions";
import type { MetaAccountSnapshot, MetaGoal, MetaInsight } from "@/lib/integrations/meta";
import type { Analysis, Project } from "@/lib/dash/types";
import { fmtN, fmtW, pct } from "@/lib/dash/agg";
import AnalysisPanel from "./AnalysisPanel";

interface Props { project: Project; isStaff: boolean; adAccountId: string | null; preset: string; snapshot: MetaAccountSnapshot | null; snapError: string | null; cachedAt: string | null; goal: MetaGoal; analyses: Analysis[]; tokenConfigured: boolean }
const PRESETS: [string, string][] = [["last_7d", "최근 7일"], ["last_14d", "최근 14일"], ["last_30d", "최근 30일"], ["last_90d", "최근 90일"]];

const roasPct = (v: number | null) => (v == null ? "-" : (v * 100).toFixed(0) + "%");
function M({ i, goal }: { i: MetaInsight | null; goal: MetaGoal }) {
  if (!i) return <span className="metrics">성과 없음</span>;
  const conv = goal === "purchase" ? `구매 ${i.purchases} · 매출 ${fmtW(i.purchase_value)} · CPA ${i.cpa == null ? "-" : fmtW(i.cpa)} · ROAS ${roasPct(i.roas)}` : `리드 ${i.leads} · CPL ${i.cpl == null ? "-" : fmtW(i.cpl)}`;
  return <span className="metrics">지출 {fmtW(i.spend)} · 노출 {fmtN(i.impressions)} · 도달 {fmtN(i.reach)} · 빈도 {i.frequency.toFixed(2)} · CPM {fmtW(i.cpm)} · CTR {i.ctr.toFixed(2)}% · CPC {fmtW(i.cpc)} · 링크클릭 {fmtN(i.link_clicks)} · 랜딩뷰 {fmtN(i.landing_page_views)} · {conv}{i.thruplays ? ` · 훅률 ${pct(i.thruplays, i.impressions)}` : ""}</span>;
}

export default function AdsClient({ project, isStaff, adAccountId, preset, snapshot, snapError, cachedAt, goal, analyses, tokenConfigured }: Props) {
  const router = useRouter(), pathname = usePathname();
  const [pending, start] = useTransition();
  const canRun = !!adAccountId && tokenConfigured && !snapError;

  return (
    <>
      <div className="ph" style={{ marginTop: -4 }}>
        <h2 style={{ fontSize: 15 }}>Meta 광고 현황</h2>
        {isStaff && <div className="controls">
          <select value={preset} onChange={(e) => start(() => router.replace(`${pathname}?preset=${e.target.value}`))}>{PRESETS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          {cachedAt && <span className="hint" style={{ marginTop: 0 }}>{new Date(cachedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })} 조회 · 30분 캐시</span>}
          {adAccountId && <button type="button" className="btn" disabled={pending} onClick={() => start(() => router.replace(`${pathname}?preset=${preset}&refresh=1`))}><RefreshCw className="ico" aria-hidden /> 새로고침</button>}
        </div>}
      </div>

      {isStaff && (!adAccountId || snapError || !tokenConfigured) && (
        <div className="card" style={{ marginBottom: 12 }}>
          {!adAccountId && <div className="msg err" style={{ margin: 0 }}>Meta 광고 계정 ID가 없습니다. <Link href={`/app/settings/${project.id}`}>설정</Link>에서 입력하세요.</div>}
          {!tokenConfigured && <div className="msg err">서버에 META_ACCESS_TOKEN 이 설정되지 않았습니다.</div>}
          {snapError && <div className="msg err">광고 계정 조회 실패: {snapError}</div>}
        </div>
      )}
      {isStaff && snapshot && (
        <>
          <section className="tiles">
            {(() => { const t = snapshot.totals; const base: [string, string][] = [["지출", fmtW(t.spend)], ["노출", fmtN(t.impressions)], ["도달", fmtN(t.reach)], ["빈도", t.frequency.toFixed(2)], ["CPM", fmtW(t.cpm)], ["CTR", t.ctr.toFixed(2) + "%"], ["CPC", fmtW(t.cpc)], ["링크 클릭", fmtN(t.link_clicks)], ["랜딩뷰", fmtN(t.landing_page_views)]]; const g: [string, string][] = goal === "purchase" ? [["구매", fmtN(t.purchases)], ["CPA", t.cpa == null ? "-" : fmtW(t.cpa)], ["매출", fmtW(t.purchase_value)], ["ROAS", roasPct(t.roas)]] : [["리드", fmtN(t.leads)], ["CPL", t.cpl == null ? "-" : fmtW(t.cpl)]]; return [...base, ...g].map(([k, v]) => <div className="tile" key={k}><div className="k">{k}</div><div className="v">{v}</div></div>); })()}
          </section>
          <section className="grid" style={{ marginBottom: 12 }}>
            <div className="card c5">
              <h2>위너 광고</h2><div className="sub">{goal === "purchase" ? "구매 수 → ROAS → CPA 순" : "리드 수 → CPL → CTR 순"} · {snapshot.account.name ?? snapshot.account.id}</div>
              {snapshot.winners.length === 0 && <div className="hint" style={{ margin: 0 }}>기간 내 성과 데이터가 없습니다.</div>}
              {snapshot.winners.map((ad, i) => (
                <div className="winner" key={ad.id}>
                  {ad.creative?.thumbnail_url || ad.creative?.image_url ? <img src={ad.creative.thumbnail_url ?? ad.creative.image_url} alt="" /> : <div className="noimg" style={{ width: 72, height: 72 }}>{ad.creative?.format ?? "-"}</div>}
                  <div>
                    <div><span className="rank">{i + 1}</span><b>{ad.name}</b> <span className={`st ${ad.status}`}>{ad.status}</span></div>
                    <M i={ad.insight} goal={goal} />
                    {ad.creative?.title && <div className="copy" style={{ marginTop: 3, color: "var(--text)" }}>{ad.creative.title}</div>}
                    {ad.creative?.body && <div className="copy">{ad.creative.body}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="card c7">
              <h2>캠페인 구조</h2><div className="sub">캠페인 → 세트 → 광고 (성과 있는 항목만)</div>
              <div className="tree">
                {snapshot.campaigns.filter((c) => c.insight || c.adsets.some((s) => s.insight)).map((c) => (
                  <div className="camp" key={c.id}>
                    <div className="camp-head"><span className={`st ${c.status}`}>{c.status}</span><span>{c.name}</span><span className="metrics">{c.objective}{c.daily_budget ? ` · 일예산 ${fmtW(c.daily_budget)}` : ""}</span></div>
                    <div style={{ padding: "4px 12px" }}><M i={c.insight} goal={goal} /></div>
                    {c.adsets.filter((s) => s.insight).map((s) => (
                      <div className="set" key={s.id}>
                        <div className="set-head"><span className={`st ${s.status}`}>{s.status}</span><span>{s.name}</span><span className="metrics">{s.optimization_goal}{s.daily_budget ? ` · 일예산 ${fmtW(s.daily_budget)}` : ""}</span></div>
                        {s.targeting_summary && <div className="metrics">타깃: {s.targeting_summary}</div>}
                        <M i={s.insight} goal={goal} />
                        {s.ads.filter((a) => a.insight && a.insight.spend > 0).map((a) => (
                          <div className="ad" key={a.id}>
                            {a.creative?.thumbnail_url || a.creative?.image_url ? <img src={a.creative.thumbnail_url ?? a.creative.image_url} alt="" /> : <div className="noimg">{a.creative?.format ?? "-"}</div>}
                            <div>
                              <div><span className={`st ${a.status}`}>{a.status}</span> <b>{a.name}</b> <span className="metrics">{a.creative?.format}{a.creative?.call_to_action ? ` · ${a.creative.call_to_action}` : ""}</span></div>
                              <M i={a.insight} goal={goal} />
                              {a.creative?.body && <div className="copy">{a.creative.body}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
                {snapshot.campaigns.length === 0 && <div className="hint" style={{ margin: 0 }}>캠페인이 없습니다.</div>}
              </div>
            </div>
          </section>
        </>
      )}

      <AnalysisPanel projectId={project.id} analyses={analyses} isStaff={isStaff} runLabel={`AI 광고 분석 실행 (${PRESETS.find(([k]) => k === preset)?.[1]})`} canRun={canRun} disabledReason={!adAccountId ? "광고 계정 ID를 저장하세요." : !tokenConfigured ? "META_ACCESS_TOKEN 이 필요합니다." : snapError ? "광고 계정 조회가 실패해 실행할 수 없습니다." : undefined} onRun={() => runAdsAnalysis(project.id, preset)} />
    </>
  );
}

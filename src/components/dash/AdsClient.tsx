"use client";

import { Fragment, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, RefreshCw } from "lucide-react";
import type { MetaAccountSnapshot, MetaGoal, MetaInsight } from "@/lib/integrations/meta";
import type { Analysis, Project } from "@/lib/dash/types";
import { fmtN, fmtW } from "@/lib/dash/agg";
import AnalysisPanel from "./AnalysisPanel";

interface Props { project: Project; isStaff: boolean; adAccountId: string | null; preset: string; snapshot: MetaAccountSnapshot | null; snapError: string | null; cachedAt: string | null; goal: MetaGoal; analyses: Analysis[]; tokenConfigured: boolean }
const PRESETS: [string, string][] = [["last_7d", "최근 7일"], ["last_14d", "최근 14일"], ["last_30d", "최근 30일"], ["last_90d", "최근 90일"], ["maximum", "최대"]];
const ST_LABEL: Record<string, string> = { ACTIVE: "진행", PAUSED: "중지", CAMPAIGN_PAUSED: "중지", ADSET_PAUSED: "중지", ARCHIVED: "보관", DELETED: "삭제" };

const won = (v: number | null | undefined) => (v == null ? "–" : fmtW(v));
const roasPct = (v: number | null) => (v == null ? "–" : (v * 100).toFixed(0) + "%");
/** 폼 전환율: 링크 클릭 대비 리드 수 */
const formRate = (i: MetaInsight) => (i.link_clicks > 0 ? ((i.leads / i.link_clicks) * 100).toFixed(1) + "%" : "–");

const pct = (a: number, b: number, d = 1) => (b > 0 ? ((a / b) * 100).toFixed(d) + "%" : "–");
const v3 = (i: MetaInsight) => i.video_3s ?? 0;
/** 영상 지표 칸: 훅 비율(3초 재생 ÷ 노출), 지속률(끝까지 또는 15초 본 수 ÷ 3초 재생), 구간별 시청(노출 대비) */
const VIDEO_COLS: { label: string; get: (i: MetaInsight) => string }[] = [
  { label: "소진액", get: (i) => fmtW(i.spend) }, { label: "노출", get: (i) => fmtN(i.impressions) },
  { label: "훅 비율", get: (i) => pct(v3(i), i.impressions) }, { label: "지속률", get: (i) => pct(i.thruplays, v3(i)) },
  { label: "25% 시청", get: (i) => pct(i.video_p25, i.impressions) }, { label: "50%", get: (i) => pct(i.video_p50, i.impressions) }, { label: "100%", get: (i) => pct(i.video_p100, i.impressions) },
  { label: "빈도", get: (i) => i.frequency.toFixed(2) },
];

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
  const [view, setView] = useState<"perf" | "video">("perf");
  const P = cols(goal), C = view === "video" ? VIDEO_COLS : P;

  // 캠페인은 소진액 큰 순. 처음에는 가장 큰 캠페인만 세트까지 펼쳐 둔다.
  const camps = (snapshot?.campaigns ?? []).filter((c) => c.insight || c.adsets.some((s) => s.insight)).sort((a, b) => (b.insight?.spend ?? 0) - (a.insight?.spend ?? 0));
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(camps[0] ? [camps[0].id] : []));
  const toggle = (id: string) => setOpenIds((cur) => { const n = new Set(cur); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const t = snapshot?.totals;
  const hero: [string, string][] = !t ? [] : goal === "purchase"
    ? [["소진액", fmtW(t.spend)], ["구매", fmtN(t.purchases)], ["CPA", won(t.cpa)], ["매출", fmtW(t.purchase_value)], ["ROAS", roasPct(t.roas)], ["CTR", t.ctr.toFixed(2) + "%"]]
    : [["소진액", fmtW(t.spend)], ["리드", fmtN(t.leads)], ["리드 단가", won(t.cpl)], ["CTR", t.ctr.toFixed(2) + "%"], ["폼 전환율", formRate(t)], ["CPM", fmtW(t.cpm)], ["빈도", t.frequency.toFixed(2)]];
  const minor: [string, string][] = !t ? [] : [["도달", fmtN(t.reach)], ["전체 클릭", fmtN(t.clicks)], ["CPC", fmtW(t.cpc)], ...(goal === "purchase" ? [["CPM", fmtW(t.cpm)], ["빈도", t.frequency.toFixed(2)]] as [string, string][] : [])];

  // 퍼널: 노출 → 링크 클릭 → 랜딩 도착 → 리드(구매). 인스턴트 양식처럼 랜딩을 거치지 않는 광고는 도착 단계를 뺀다.
  const result = !t ? 0 : goal === "purchase" ? t.purchases : t.leads;
  const funnel: { label: string; n: number; cost: string; costLabel: string }[] = !t ? [] : [
    { label: "노출", n: t.impressions, cost: fmtW(t.cpm), costLabel: "1,000회당" },
    { label: "링크 클릭", n: t.link_clicks, cost: t.link_clicks ? fmtW(t.spend / t.link_clicks) : "–", costLabel: "클릭당" },
    ...(t.landing_page_views > 0 && t.landing_page_views >= result ? [{ label: "랜딩 도착", n: t.landing_page_views, cost: fmtW(t.spend / t.landing_page_views), costLabel: "도착당" }] : []),
    { label: goal === "purchase" ? "구매" : "리드", n: result, cost: result ? fmtW(t.spend / result) : "–", costLabel: goal === "purchase" ? "구매당" : "리드당" },
  ];

  // 영상 소재: 3초 재생이 잡힌 광고만 모아 본다 (이미지 광고의 노출이 섞이면 훅 비율이 낮게 나온다)
  const videoAds = (snapshot?.campaigns ?? []).flatMap((c) => c.adsets.flatMap((s) => s.ads)).filter((a) => a.insight && v3(a.insight) > 0).sort((a, b) => b.insight!.spend - a.insight!.spend);
  const vt = videoAds.reduce((a, x) => { const i = x.insight!; a.imp += i.impressions; a.v3 += v3(i); a.thru += i.thruplays; a.p25 += i.video_p25; a.p50 += i.video_p50; a.p75 += i.video_p75; a.p100 += i.video_p100; return a; }, { imp: 0, v3: 0, thru: 0, p25: 0, p50: 0, p75: 0, p100: 0 });
  const curve: [string, number][] = [["3초", vt.v3], ["25%", vt.p25], ["50%", vt.p50], ["75%", vt.p75], ["100%", vt.p100]];

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

          <section className="card" style={{ marginBottom: 12 }}>
            <h2>{goal === "purchase" ? "구매 퍼널" : "리드 퍼널"}</h2><div className="sub">광고를 본 사람이 단계마다 얼마나 남는지 · 화살표의 %는 바로 앞 단계 대비</div>
            <div className="fn">
              {funnel.map((f, i) => (
                <Fragment key={f.label}>
                  {i > 0 && <div className="fn-arrow"><b>{pct(f.n, funnel[i - 1].n, f.n / (funnel[i - 1].n || 1) < 0.1 ? 2 : 1)}</b><ChevronRight aria-hidden /></div>}
                  <div className={`fn-step s${i}${i === funnel.length - 1 ? " last" : ""}`}>
                    <span>{f.label}</span><b>{fmtN(f.n)}</b><small>{f.costLabel} {f.cost}</small>
                  </div>
                </Fragment>
              ))}
            </div>
            {t.link_clicks > 0 && <div className="fn-foot">클릭한 사람 100명 중 <b>{((result / t.link_clicks) * 100).toFixed(1)}명</b>이 {goal === "purchase" ? "구매" : "리드"}로 이어졌습니다{funnel.length === 4 && t.link_clicks > 0 ? <> · 클릭 후 랜딩에 도착하지 못한 비율 <b>{(100 - (t.landing_page_views / t.link_clicks) * 100).toFixed(0)}%</b></> : null}</div>}
          </section>

          {videoAds.length > 0 && (
            <section className="card" style={{ marginBottom: 12 }}>
              <h2>영상 소재</h2><div className="sub">영상 광고 {videoAds.length}개 기준 · 훅 비율은 노출 중 3초 이상 본 비율, 지속률은 3초 본 사람 중 끝까지(15초 이상) 본 비율</div>
              <div className="vd">
                <div className="vd-kpis">
                  <div><span>훅 비율</span><b>{pct(vt.v3, vt.imp)}</b></div>
                  <div><span>지속률</span><b>{pct(vt.thru, vt.v3)}</b></div>
                  <div><span>완주율</span><b>{pct(vt.p100, vt.imp, 2)}</b></div>
                </div>
                <div className="vd-curve" role="img" aria-label="구간별 시청 비율">
                  {curve.map(([k, n]) => { const r = vt.imp ? (n / vt.imp) * 100 : 0; return <div key={k} className="vd-bar"><span>{k}</span><i><em style={{ width: `${Math.min(100, vt.v3 ? (n / Math.max(vt.v3, vt.p25)) * 100 : 0)}%` }} /></i><b>{r.toFixed(r < 10 ? 1 : 0)}%</b></div>; })}
                  <small>노출 대비 해당 지점까지 본 비율</small>
                </div>
              </div>
              <div className="tbl-wrap">
                <table className="atbl">
                  <thead><tr><th>소재</th>{VIDEO_COLS.slice(0, 4).map((c) => <th key={c.label} className="num">{c.label}</th>)}<th className="num">100%</th>{P.slice(1, 3).map((c) => <th key={c.label} className="num">{c.label}</th>)}</tr></thead>
                  <tbody>
                    {videoAds.slice(0, 8).map((a) => (
                      <tr className="lv2 flat" key={a.id}>
                        <td><Thumb ad={a} size={32} /><span title={a.creative?.body ?? a.name}>{a.name}</span></td>
                        {VIDEO_COLS.slice(0, 4).map((c) => <td key={c.label} className="num">{c.get(a.insight!)}</td>)}
                        <td className="num">{pct(a.insight!.video_p100, a.insight!.impressions, 2)}</td>
                        {P.slice(1, 3).map((c) => <td key={c.label} className="num">{c.get(a.insight!)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {videoAds.length > 8 && <div className="hint" style={{ marginTop: 6 }}>소진액 큰 순으로 8개만 표시합니다. 나머지는 아래 표에서 &lsquo;영상&rsquo; 보기로 확인하세요.</div>}
            </section>
          )}

          {snapshot.winners.length > 0 && (
            <section className="card" style={{ marginBottom: 12 }}>
              <h2>위너 광고</h2><div className="sub">{goal === "purchase" ? "구매 수 → ROAS → CPA 순" : "리드 수 → 리드 단가 → CTR 순"}</div>
              <div className="winners">
                {snapshot.winners.map((ad, i) => (
                  <div className="win" key={ad.id}>
                    <div className="win-top"><Thumb ad={ad} size={56} /><div><span className="rank">{i + 1}</span><b title={ad.name}>{ad.name}</b>{ad.creative?.title && <p>{ad.creative.title}</p>}</div></div>
                    {ad.insight && <dl>{P.slice(0, 4).map((c) => <div key={c.label}><dt>{c.label}</dt><dd>{c.get(ad.insight!)}</dd></div>)}</dl>}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="card" style={{ marginBottom: 12 }}>
            <div className="card-head"><div><h2>캠페인별 성과</h2><div className="sub">캠페인을 누르면 세트와 광고가 펼쳐집니다 · 성과 있는 항목만 · 소진액 큰 순</div></div>
              <div className="tabs"><button type="button" className={view === "perf" ? "on" : ""} onClick={() => setView("perf")}>성과</button><button type="button" className={view === "video" ? "on" : ""} onClick={() => setView("video")}>영상</button></div></div>
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

      {/* AI 분석은 화면에서 뺐다. 고객사 계정은 숫자 화면이 없으므로 이전에 저장된 리포트만 읽을 수 있게 둔다. */}
      {!isStaff && <AnalysisPanel projectId={project.id} analyses={analyses} isStaff={false} runLabel="" canRun={false} onRun={async () => ({ ok: false, error: "" })} />}
    </>
  );
}

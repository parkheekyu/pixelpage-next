"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { runAdsAnalysis, saveIntegrations } from "@/app/app/analysis-actions";
import type { MetaAccountSnapshot, MetaInsight } from "@/lib/integrations/meta";
import type { Analysis, Project } from "@/lib/dash/types";
import { fmtN, fmtW, pct } from "@/lib/dash/agg";
import AnalysisPanel from "./AnalysisPanel";

interface Props { project: Project; isStaff: boolean; adAccountId: string | null; preset: string; snapshot: MetaAccountSnapshot | null; snapError: string | null; analyses: Analysis[]; tokenConfigured: boolean }
const PRESETS: [string, string][] = [["last_7d", "최근 7일"], ["last_14d", "최근 14일"], ["last_30d", "최근 30일"], ["last_90d", "최근 90일"]];

function M({ i }: { i: MetaInsight | null }) {
  if (!i) return <span className="metrics">성과 없음</span>;
  return <span className="metrics">지출 {fmtW(i.spend)} · 노출 {fmtN(i.impressions)} · CTR {i.ctr.toFixed(2)}% · CPC {fmtW(i.cpc)} · 링크클릭 {fmtN(i.link_clicks)} · 리드 {i.leads} · CPL {i.cpl == null ? "-" : fmtW(i.cpl)}{i.thruplays ? ` · 훅률 ${pct(i.thruplays, i.impressions)}` : ""}</span>;
}

export default function AdsClient({ project, isStaff, adAccountId, preset, snapshot, snapError, analyses, tokenConfigured }: Props) {
  const router = useRouter(), pathname = usePathname();
  const [acct, setAcct] = useState(adAccountId ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const save = () => start(async () => { const r = await saveIntegrations(project.id, { meta_ad_account_id: acct }); setMsg(r.ok ? "저장됨" : r.error); if (r.ok) router.refresh(); });
  const canRun = !!adAccountId && tokenConfigured && !snapError;

  return (
    <>
      <header className="ph">
        <h1>{project.name}<small>광고 · Meta</small></h1>
        {isStaff && <div className="controls"><select value={preset} onChange={(e) => start(() => router.replace(`${pathname}?preset=${e.target.value}`))}>{PRESETS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>}
      </header>

      {isStaff && (
        <div className="card" style={{ marginBottom: 12 }}>
          <h2>연동 설정</h2><div className="sub">광고 관리자 → 계정 개요의 계정 ID (숫자, act_ 생략 가능). 토큰은 서버 환경 변수 META_ACCESS_TOKEN.</div>
          <div className="form-row">
            <label className="f">Meta 광고 계정 ID<input type="text" value={acct} onChange={(e) => setAcct(e.target.value)} placeholder="123456789012345" style={{ minWidth: 220 }} /></label>
            <button type="button" className="btn" onClick={save} disabled={pending} style={{ alignSelf: "flex-end" }}><Save className="ico" aria-hidden /> 저장</button>
            {msg && <span className="hint" style={{ alignSelf: "flex-end", marginBottom: 8 }}>{msg}</span>}
            {!tokenConfigured && <span className="msg err" style={{ margin: 0 }}>META_ACCESS_TOKEN 이 설정되지 않았습니다.</span>}
          </div>
          {snapError && <div className="msg err">광고 계정 조회 실패: {snapError}</div>}
        </div>
      )}

      {isStaff && snapshot && (
        <>
          <section className="tiles">
            {[["지출", fmtW(snapshot.totals.spend)], ["노출", fmtN(snapshot.totals.impressions)], ["CTR", snapshot.totals.ctr.toFixed(2) + "%"], ["CPC", fmtW(snapshot.totals.cpc)], ["링크 클릭", fmtN(snapshot.totals.link_clicks)], ["랜딩뷰", fmtN(snapshot.totals.landing_page_views)], ["리드", fmtN(snapshot.totals.leads)], ["CPL", snapshot.totals.cpl == null ? "-" : fmtW(snapshot.totals.cpl)]].map(([k, v]) => <div className="tile" key={k}><div className="k">{k}</div><div className="v">{v}</div></div>)}
          </section>
          <section className="grid" style={{ marginBottom: 12 }}>
            <div className="card c5">
              <h2>위너 광고</h2><div className="sub">리드 수 → CPL → CTR 순 · {snapshot.account.name ?? snapshot.account.id}</div>
              {snapshot.winners.length === 0 && <div className="hint" style={{ margin: 0 }}>기간 내 성과 데이터가 없습니다.</div>}
              {snapshot.winners.map((ad, i) => (
                <div className="winner" key={ad.id}>
                  {ad.creative?.thumbnail_url || ad.creative?.image_url ? <img src={ad.creative.thumbnail_url ?? ad.creative.image_url} alt="" /> : <div className="noimg" style={{ width: 72, height: 72 }}>{ad.creative?.format ?? "-"}</div>}
                  <div>
                    <div><span className="rank">{i + 1}</span><b>{ad.name}</b> <span className={`st ${ad.status}`}>{ad.status}</span></div>
                    <M i={ad.insight} />
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
                    <div style={{ padding: "4px 12px" }}><M i={c.insight} /></div>
                    {c.adsets.filter((s) => s.insight).map((s) => (
                      <div className="set" key={s.id}>
                        <div className="set-head"><span className={`st ${s.status}`}>{s.status}</span><span>{s.name}</span><span className="metrics">{s.optimization_goal}{s.daily_budget ? ` · 일예산 ${fmtW(s.daily_budget)}` : ""}</span></div>
                        {s.targeting_summary && <div className="metrics">타깃: {s.targeting_summary}</div>}
                        <M i={s.insight} />
                        {s.ads.filter((a) => a.insight && a.insight.spend > 0).map((a) => (
                          <div className="ad" key={a.id}>
                            {a.creative?.thumbnail_url || a.creative?.image_url ? <img src={a.creative.thumbnail_url ?? a.creative.image_url} alt="" /> : <div className="noimg">{a.creative?.format ?? "-"}</div>}
                            <div>
                              <div><span className={`st ${a.status}`}>{a.status}</span> <b>{a.name}</b> <span className="metrics">{a.creative?.format}{a.creative?.call_to_action ? ` · ${a.creative.call_to_action}` : ""}</span></div>
                              <M i={a.insight} />
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

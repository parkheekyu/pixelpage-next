"use client";

import { useMemo, useState } from "react";
import { agg, buckets, bySource, creativeStats, dropStats, fmtN, fmtW, landingStats, pct, slice, sources, tmStats } from "@/lib/dash/agg";
import type { ProjectData } from "@/lib/dash/data";
import { Funnel, HBar, SourcePill, Tiles, WeeklyChart } from "./charts";

export default function ProjectReport({ data, isStaff, now }: { data: ProjectData; isStaff: boolean; now: number }) {
  const [days, setDays] = useState(28);
  const [src, setSrc] = useState("all");
  const srcs = useMemo(() => sources(data.creatives, data.leads, data.spend), [data]);

  const { L, S, A, P } = useMemo(() => {
    const cur = slice(data.leads, data.spend, days, src, 0, now), prev = slice(data.leads, data.spend, days, src, 1, now);
    return { L: cur.L, S: cur.S, A: agg(cur.L, cur.S, now), P: agg(prev.L, prev.S, now) };
  }, [data, days, src, now]);

  const cs = creativeStats(data.creatives, L, S);
  const cplRows = [...cs].sort((a, b) => a.cpl - b.cpl).map((r, i) => ({ label: r.c.creative_id, value: r.cpl, text: `${fmtW(r.cpl)} · ${r.leads}건`, tip: `${r.c.creative_id} · CPL ${fmtW(r.cpl)} · 광고비 ${fmtW(r.cost)}`, hi: i === 0 }));
  const drops = dropStats(L);
  const lands = landingStats(data.creatives, L, S).map((r, i) => ({ label: r.lp, value: r.r, text: (r.r * 100).toFixed(1) + "%", tip: `${r.lp} · 클릭 ${fmtN(r.clicks)} → 리드 ${r.n}`, hi: i === 0 }));
  const tm = tmStats(L, now);
  const bs = bySource(data.creatives, L, S);
  const recent = [...L].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()).slice(0, 10);

  return (
    <>
      <div className="controls" style={{ marginBottom: 12 }}>
        <select value={days} onChange={(e) => setDays(+e.target.value)}><option value={7}>최근 7일</option><option value={14}>최근 14일</option><option value={28}>최근 4주</option><option value={56}>최근 8주</option></select>
        <select value={src} onChange={(e) => setSrc(e.target.value)}><option value="all">전체 매체</option>{srcs.map((s) => <option key={s} value={s}>{s}</option>)}</select>
      </div>

      <Tiles A={A} P={P} keys={isStaff ? ["leads", "cost", "cpl", "conv", "cvr", "revenue", "roas", "stale"] : ["leads", "cost", "cpl", "conv", "cvr", "revenue", "roas"]} />

      <section className="grid">
        <div className="card c8">
          <h2>주간 리드 · 전환</h2><div className="sub">중복 제외</div>
          <div className="legend"><span><i style={{ background: "var(--s1)" }} />리드</span><span><i style={{ background: "var(--s3)" }} />전환</span></div>
          <WeeklyChart buckets={buckets(L, days, now)} />
        </div>
        <div className="card c4"><h2>퍼널</h2><div className="sub">어디서 새는지</div><Funnel A={A} /></div>

        <div className="card c6">
          <h2>매체별 요약</h2><div className="sub">광고비 · 리드 · 전환 · 매출</div>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>매체</th><th>광고비</th><th>리드</th><th>CPL</th><th>전환</th><th>전환율</th><th>매출</th><th>ROAS</th></tr></thead>
            <tbody>{bs.map((r) => <tr key={r.s}><td><SourcePill s={r.s} /></td><td>{fmtW(r.cost)}</td><td>{r.leads}</td><td>{fmtW(r.cpl)}</td><td>{r.conv}</td><td>{pct(r.conv, r.leads)}</td><td>{fmtW(r.revenue)}</td><td>{(r.roas * 100).toFixed(0)}%</td></tr>)}
            {bs.length === 0 && <tr><td colSpan={8} style={{ color: "var(--muted)" }}>데이터 없음</td></tr>}</tbody>
          </table></div>
        </div>
        <div className="card c6">
          <h2>최근 리드</h2><div className="sub">{isStaff ? "소재 · 담당자 포함 (내부)" : "상태 표시"}</div>
          <div className="tbl-wrap"><table className="tbl left">
            <thead><tr><th>수집일시</th><th>이름</th><th>연락처</th><th>매체</th>{isStaff && <><th>소재</th><th>담당자</th></>}<th>상태</th></tr></thead>
            <tbody>{recent.map((l) => <tr key={l.id}><td>{new Date(l.submitted_at).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })}</td><td>{l.name}</td><td>{l.phone}</td><td>{l.utm_source}</td>{isStaff && <><td>{l.utm_content}</td><td>{l.assignee}</td></>}<td><span className={`pill st-${l.status}`}>{l.status}</span></td></tr>)}</tbody>
          </table></div>
        </div>

        {isStaff && <>
          <div className="card c6"><h2>소재별 CPL</h2><div className="sub">낮을수록 좋음 · 막대 옆 = 리드수</div><HBar rows={cplRows} /></div>
          <div className="card c6">
            <h2>소재별 4단계 전환율</h2><div className="sub">CTR → 랜딩전환 → 컨택률 → TM전환</div>
            <div className="tbl-wrap"><table className="tbl">
              <thead><tr><th>소재</th><th>매체</th><th>CTR</th><th>랜딩전환</th><th>컨택률</th><th>TM전환</th><th>CPA</th><th>ROAS</th></tr></thead>
              <tbody>{[...cs].sort((a, b) => (a.cpa || 1e12) - (b.cpa || 1e12)).map((r) => <tr key={r.c.id}><td>{r.c.creative_id}</td><td>{r.c.source}</td><td>{pct(r.clicks, r.imps)}</td><td>{pct(r.leads, r.clicks)}</td><td>{pct(r.contacted, r.leads)}</td><td>{pct(r.conv, r.consulted)}</td><td>{r.conv ? fmtW(r.cpa) : "–"}</td><td>{(r.roas * 100).toFixed(0)}%</td></tr>)}
              {cs.length === 0 && <tr><td colSpan={8} style={{ color: "var(--muted)" }}>소재가 등록되지 않았거나 리드가 없습니다</td></tr>}</tbody>
            </table></div>
          </div>
          <div className="card c4">
            <h2>드랍 사유</h2><div className="sub">리드 품질 vs TM 문제</div>
            {drops.total ? <>
              <div className="legend"><span><i style={{ background: "var(--s2)" }} />리드 품질 (광고/타겟) {pct(drops.quality, drops.total)}</span><span><i style={{ background: "var(--s1)" }} />상담 단계 (TM/오퍼) {pct(drops.total - drops.quality, drops.total)}</span></div>
              <HBar W={360} pl={60} pr={40} rh={26} rows={drops.rows.map((r) => ({ label: r.d, value: r.n, text: String(r.n), tip: `${r.d} ${r.n}건 (${pct(r.n, drops.total)})`, color: r.quality ? "var(--s2)" : "var(--s1)" }))} />
            </> : <div className="hint">데이터 없음</div>}
          </div>
          <div className="card c4"><h2>랜딩별 전환율</h2><div className="sub">클릭 → 리드</div><HBar W={360} pl={90} pr={60} rows={lands} /></div>
          <div className="card c4">
            <h2>TM 담당자별</h2><div className="sub">컨택률 · TM전환 · 미처리</div>
            <div className="tbl-wrap"><table className="tbl">
              <thead><tr><th>담당자</th><th>배정</th><th>컨택률</th><th>TM전환</th><th>매출</th><th>평균컨택</th><th>24h</th></tr></thead>
              <tbody>{tm.map((r) => <tr key={r.t}><td>{r.t}</td><td>{r.leads}</td><td>{pct(r.contacted, r.leads)}</td><td>{pct(r.conv, r.consulted)}</td><td>{fmtW(r.revenue)}</td><td>{r.avgH.toFixed(1)}h</td><td>{r.stale ? <span className="pill st-드랍">{r.stale}</span> : "0"}</td></tr>)}
              {tm.length === 0 && <tr><td colSpan={7} style={{ color: "var(--muted)" }}>담당자 배정 없음</td></tr>}</tbody>
            </table></div>
          </div>
        </>}
      </section>
    </>
  );
}

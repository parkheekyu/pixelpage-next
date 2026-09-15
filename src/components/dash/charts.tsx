"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { fmtN, fmtW, pct, ratio, type Agg, type Bucket } from "@/lib/dash/agg";

// ---------- 타일 ----------
function Delta({ a, b, inverse }: { a: number; b: number; inverse?: boolean }) {
  if (!b) return null;
  const d = ((a - b) / b) * 100, up = d >= 0, good = inverse ? !up : up;
  return <div className={`d ${good ? "up" : "down"}`}>{up ? <ArrowUp className="ico" aria-hidden /> : <ArrowDown className="ico" aria-hidden />} {Math.abs(d).toFixed(0)}% vs 이전 기간</div>;
}

export type TileKey = "leads" | "cost" | "cpl" | "conv" | "cvr" | "revenue" | "roas" | "stale";

export function Tiles({ A, P, keys }: { A: Agg; P: Agg; keys: TileKey[] }) {
  const all: Record<TileKey, [string, string, React.ReactNode]> = {
    leads: ["리드 수", fmtN(A.leads), <Delta key="l" a={A.leads} b={P.leads} />],
    cost: ["광고비", fmtW(A.cost), <Delta key="c" a={A.cost} b={P.cost} inverse />],
    cpl: ["CPL", fmtW(A.cpl), <Delta key="p" a={A.cpl} b={P.cpl} inverse />],
    conv: ["전환 수", fmtN(A.conv), <Delta key="v" a={A.conv} b={P.conv} />],
    cvr: ["리드 전환율", pct(A.conv, A.leads), <Delta key="r" a={ratio(A.conv, A.leads)} b={ratio(P.conv, P.leads)} />],
    revenue: ["확정 매출", fmtW(A.revenue), <Delta key="m" a={A.revenue} b={P.revenue} />],
    roas: ["ROAS", (A.roas * 100).toFixed(0) + "%", <Delta key="o" a={A.roas} b={P.roas} />],
    stale: ["24h 미처리", fmtN(A.stale), A.stale ? <div key="s" className="d down">확인 필요</div> : <div key="s" className="d up">정상</div>],
  };
  return (
    <section className="tiles">
      {keys.map((k) => { const [label, v, d] = all[k]; return <div className="tile" key={k}><div className="k">{label}</div><div className="v">{v}</div>{d}</div>; })}
    </section>
  );
}

// ---------- 주간 리드·전환 라인 ----------
export function WeeklyChart({ buckets }: { buckets: Bucket[] }) {
  const W = 640, H = 220, pl = 36, pr = 40, pt = 12, pb = 28, iw = W - pl - pr, ih = H - pt - pb;
  const max = Math.max(1, ...buckets.map((b) => b.leads)) * 1.15;
  const x = (i: number) => pl + (buckets.length === 1 ? iw / 2 : (i / (buckets.length - 1)) * iw);
  const y = (v: number) => pt + ih - (v / max) * ih;
  const path = (k: "leads" | "conv") => buckets.map((b, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(b[k]).toFixed(1)}`).join(" ");
  const last = buckets[buckets.length - 1];
  if (!buckets.length) return <div className="hint">데이터 없음</div>;
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`}>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => { const v = Math.round((max * t) / 1.15); return (
        <g key={t}><line className="grid-line" x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} /><text className="axis" x={pl - 6} y={y(v) + 4} textAnchor="end">{v}</text></g>
      ); })}
      <path d={path("leads")} fill="none" stroke="var(--s1)" strokeWidth="2" strokeLinejoin="round" />
      <path d={path("conv")} fill="none" stroke="var(--s3)" strokeWidth="2" strokeLinejoin="round" />
      {buckets.map((b, i) => (
        <g key={i}>
          <text className="axis" x={x(i)} y={H - 8} textAnchor="middle">{b.label}</text>
          <circle cx={x(i)} cy={y(b.leads)} r="4" fill="var(--s1)" stroke="var(--card)" strokeWidth="2"><title>{`${b.label} · 리드 ${b.leads}`}</title></circle>
          <circle cx={x(i)} cy={y(b.conv)} r="4" fill="var(--s3)" stroke="var(--card)" strokeWidth="2"><title>{`${b.label} · 전환 ${b.conv}`}</title></circle>
        </g>
      ))}
      <text className="lbl strong" x={x(buckets.length - 1) + 8} y={y(last.leads) + 4}>{last.leads}</text>
      <text className="lbl strong" x={x(buckets.length - 1) + 8} y={y(last.conv) + 4}>{last.conv}</text>
    </svg>
  );
}

// ---------- 퍼널 ----------
export function Funnel({ A }: { A: Agg }) {
  const steps: [string, number][] = [["노출", A.imps], ["클릭", A.clicks], ["리드", A.leads], ["컨택", A.contacted], ["상담", A.consulted], ["결제", A.conv]];
  const rates = ["", "CTR", "랜딩전환", "컨택률", "상담률", "TM전환"];
  const cols = ["--seq-250", "--seq-350", "--seq-450", "--seq-450", "--seq-550", "--seq-650"];
  const w = (v: number) => (A.imps > 0 ? Math.max(3, (Math.log10(v + 1) / Math.log10(A.imps + 1)) * 100) : v > 0 ? 40 : 3);
  return (
    <div>
      {steps.map(([k, v], i) => (
        <div className="funnel-row" key={k}>
          <span>{k}</span>
          <div>
            <div className="funnel-bar" style={{ width: `${w(v)}%`, background: `var(${cols[i]})` }} title={`${k} ${fmtN(v)}`} />
            {i > 0 && <div className="funnel-rate">{rates[i]} {pct(v, steps[i - 1][1])}</div>}
          </div>
          <strong style={{ textAlign: "right" }}>{fmtN(v)}</strong>
        </div>
      ))}
      <div className="hint">막대 폭은 로그 스케일</div>
    </div>
  );
}

// ---------- 가로 막대 ----------
export interface HBarRow { label: string; value: number; text: string; tip?: string; hi?: boolean; color?: string }
export function HBar({ rows, W = 560, pl = 100, pr = 70, rh = 30 }: { rows: HBarRow[]; W?: number; pl?: number; pr?: number; rh?: number }) {
  if (!rows.length) return <div className="hint">데이터 없음</div>;
  const H = rows.length * rh + 10, iw = W - pl - pr, max = Math.max(...rows.map((r) => r.value)) * 1.05 || 1;
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`}>
      {rows.map((r, i) => { const y = 5 + i * rh, w = (r.value / max) * iw; return (
        <g key={i}>
          <text className="lbl" x={pl - 8} y={y + 19} textAnchor="end">{r.label}</text>
          <rect x={pl} y={y + 5} width={w.toFixed(1)} height="18" rx="4" fill={r.color ?? (r.hi ? "var(--s1)" : "var(--seq-250)")}>{r.tip && <title>{r.tip}</title>}</rect>
          <text className={`lbl ${r.hi ? "strong" : ""}`} x={pl + w + 6} y={y + 19}>{r.text}</text>
        </g>
      ); })}
    </svg>
  );
}

// ---------- 스파크라인 ----------
export function Spark({ pts, W = 90, H = 24 }: { pts: number[]; W?: number; H?: number }) {
  const max = Math.max(1, ...pts);
  const p = pts.map((v, i) => `${((i / (pts.length - 1 || 1)) * (W - 4) + 2).toFixed(1)},${(H - 2 - (v / max) * (H - 4)).toFixed(1)}`).join(" ");
  return <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, height: H, display: "inline-block" }}><polyline points={p} fill="none" stroke="var(--s1)" strokeWidth="1.5" /></svg>;
}

export function Trend({ a, b, inverse }: { a: number; b: number; inverse?: boolean }) {
  if (!b) return null;
  const d = ((a - b) / b) * 100, good = inverse ? d <= 0 : d >= 0;
  return <small style={{ color: `var(${good ? "--good" : "--bad"})`, whiteSpace: "nowrap" }}>{d >= 0 ? <ArrowUp className="ico sm" aria-hidden /> : <ArrowDown className="ico sm" aria-hidden />}{Math.abs(d).toFixed(0)}%</small>;
}

export function SourcePill({ s }: { s: string }) {
  return <span className={`src ${s}`}>{s}</span>;
}

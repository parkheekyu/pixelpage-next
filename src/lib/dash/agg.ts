import { QUALITY_DROPS, type AdSpend, type Creative, type Lead } from "./types";

export const DAY = 86400000;

export const fmtW = (n: number) => "₩" + Math.round(n || 0).toLocaleString("ko-KR");
export const fmtN = (n: number) => Math.round(n || 0).toLocaleString("ko-KR");
export const pct = (a: number, b: number) => (b > 0 ? ((a / b) * 100).toFixed(1) + "%" : "–");
export const ratio = (a: number, b: number) => (b > 0 ? a / b : 0);

export function leadTs(l: Lead) {
  return new Date(l.submitted_at).getTime();
}

export interface Slice {
  L: Lead[];
  S: AdSpend[];
}

/** 최근 days일 구간(offset=1이면 그 직전 구간) · 매체 필터 · 중복 제외 */
export function slice(leads: Lead[], spend: AdSpend[], days: number, src: string, offset = 0, now = Date.now()): Slice {
  const to = now - offset * days * DAY;
  const from = to - days * DAY;
  const L = leads.filter((l) => {
    const t = leadTs(l);
    return !l.is_duplicate && t > from && t <= to && (src === "all" || l.utm_source === src);
  });
  const S = spend.filter((s) => {
    const d = new Date(s.date + "T23:59:59+09:00").getTime();
    return d > from && d <= to && (src === "all" || s.source === src);
  });
  return { L, S };
}

export interface Agg {
  cost: number; imps: number; clicks: number;
  leads: number; contacted: number; consulted: number; conv: number;
  revenue: number; stale: number;
  cpl: number; cpa: number; roas: number;
}

export function agg(L: Lead[], S: AdSpend[], now = Date.now()): Agg {
  const cost = S.reduce((a, s) => a + Number(s.cost), 0);
  const imps = S.reduce((a, s) => a + s.impressions, 0);
  const clicks = S.reduce((a, s) => a + s.clicks, 0);
  const contacted = L.filter((l) => l.first_contact_at != null || ["연락중", "상담완료", "전환"].includes(l.status)).length;
  const consulted = L.filter((l) => l.status === "상담완료" || l.status === "전환").length;
  const conv = L.filter((l) => l.status === "전환");
  const revenue = conv.filter((l) => l.pay_type === "결제확정").reduce((a, l) => a + Number(l.revenue || 0), 0);
  const stale = L.filter((l) => l.status === "신규" && (now - leadTs(l)) / DAY > 1).length;
  return {
    cost, imps, clicks, leads: L.length, contacted, consulted, conv: conv.length, revenue, stale,
    cpl: ratio(cost, L.length), cpa: ratio(cost, conv.length), roas: ratio(revenue, cost),
  };
}

export interface Bucket { label: string; leads: number; conv: number }

export function buckets(L: Lead[], days: number, now = Date.now()): Bucket[] {
  const step = days <= 14 ? 1 : 7;
  const out: Bucket[] = [];
  for (let d = days - step; d >= 0; d -= step) {
    const to = now - d * DAY, from = to - step * DAY;
    const inB = L.filter((l) => { const t = leadTs(l); return t > from && t <= to; });
    const dt = new Date(to);
    out.push({
      label: (step === 1 ? "" : "~") + `${dt.getMonth() + 1}/${dt.getDate()}`,
      leads: inB.length,
      conv: inB.filter((l) => l.status === "전환").length,
    });
  }
  return out;
}

export function sources(creatives: Creative[], L: Lead[], S: AdSpend[]) {
  return [...new Set([...creatives.map((c) => c.source), ...L.map((l) => l.utm_source), ...S.map((s) => s.source)])].filter(Boolean);
}

export function bySource(creatives: Creative[], L: Lead[], S: AdSpend[]) {
  return sources(creatives, L, S)
    .map((s) => ({ s, ...agg(L.filter((l) => l.utm_source === s), S.filter((x) => x.source === s)) }))
    .filter((r) => r.leads || r.cost);
}

export type CreativeStat = Agg & { c: Creative };

export function creativeStats(creatives: Creative[], L: Lead[], S: AdSpend[]): CreativeStat[] {
  return creatives
    .map((c) => ({ c, ...agg(L.filter((l) => l.utm_content === c.creative_id), S.filter((s) => s.creative_id === c.creative_id)) }))
    .filter((r) => r.leads > 0);
}

export function dropStats(L: Lead[]) {
  const D = L.filter((l) => l.status === "드랍");
  const counts = new Map<string, number>();
  for (const l of D) if (l.drop_reason) counts.set(l.drop_reason, (counts.get(l.drop_reason) ?? 0) + 1);
  const rows = [...counts.entries()].map(([d, n]) => ({ d, n, quality: QUALITY_DROPS.has(d) })).sort((a, b) => b.n - a.n);
  const q = D.filter((l) => l.drop_reason && QUALITY_DROPS.has(l.drop_reason)).length;
  return { total: D.length, quality: q, rows };
}

export function landingStats(creatives: Creative[], L: Lead[], S: AdSpend[]) {
  const lps = [...new Set([...creatives.map((c) => c.landing_id), ...L.map((l) => l.landing_id)])].filter((x): x is string => !!x);
  return lps
    .map((lp) => {
      const ids = creatives.filter((c) => c.landing_id === lp).map((c) => c.creative_id);
      const clicks = S.filter((s) => ids.includes(s.creative_id)).reduce((a, s) => a + s.clicks, 0);
      const n = L.filter((l) => l.landing_id === lp).length;
      return { lp, clicks, n, r: ratio(n, clicks) };
    })
    .sort((a, b) => b.r - a.r);
}

export function tmStats(L: Lead[], now = Date.now()) {
  const names = [...new Set(L.map((l) => l.assignee).filter((x): x is string => !!x))];
  return names.map((t) => {
    const M = L.filter((l) => l.assignee === t);
    const a = agg(M, [], now);
    const ch = M.filter((l) => l.first_contact_at != null);
    const avgH = ch.length
      ? ch.reduce((x, l) => x + (new Date(l.first_contact_at!).getTime() - leadTs(l)) / 3600000, 0) / ch.length
      : 0;
    return { t, ...a, avgH };
  });
}

export function sparkPoints(leads: Lead[], days: number, now = Date.now()) {
  const step = days <= 14 ? 1 : 7;
  const pts: number[] = [];
  for (let d = days - step; d >= 0; d -= step) {
    const to = now - d * DAY, from = to - step * DAY;
    pts.push(leads.filter((l) => { const t = leadTs(l); return !l.is_duplicate && t > from && t <= to; }).length);
  }
  return pts;
}

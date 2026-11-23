import "server-only";
import { agg, buckets, bySource, creativeStats, dropStats, landingStats, slice, sources, tmStats, type Agg, type Bucket } from "./agg";
import type { ProjectData } from "./data";
import type { Lead } from "./types";
import { monthStart, prevMonthStart, todayKST } from "./dates";

/** 리포트 화면에 필요한 값만 서버에서 계산해 넘긴다 (원본 리드는 보내지 않음) */
export interface ReportModel {
  period: ReportPeriod;
  src: string;
  sources: string[];
  A: Agg;
  P: Agg;
  buckets: Bucket[];
  bySource: ReturnType<typeof bySource>;
  creatives: ({ id: string; creative_id: string; source: string } & Agg)[];
  drops: ReturnType<typeof dropStats>;
  landings: ReturnType<typeof landingStats>;
  tm: ReturnType<typeof tmStats>;
  recent: Pick<Lead, "id" | "submitted_at" | "name" | "phone" | "utm_source" | "utm_content" | "assignee" | "status">[];
}

export const REPORT_PERIODS = ["7", "14", "28", "56", "month", "prev", "max"] as const;
export type ReportPeriod = (typeof REPORT_PERIODS)[number];
const DAY = 86400000;
const kstMidnight = (d: string) => new Date(d + "T00:00:00+09:00").getTime();

/** 기간 키를 [끝 시각, 길이(일)] 로 바꾼다. 이번 달은 1일부터 지금까지, 지난달은 지난달 1일부터 말일까지. */
export function periodWindow(period: ReportPeriod, now = Date.now()): { end: number; days: number } {
  const m0 = kstMidnight(monthStart(todayKST(now)));
  if (period === "month") return { end: now, days: Math.max(1, (now - m0) / DAY) };
  if (period === "prev") return { end: m0, days: (m0 - kstMidnight(prevMonthStart(todayKST(now)))) / DAY };
  if (period === "max") return { end: now, days: 3650 };
  return { end: now, days: +period };
}
/** 그 기간과 바로 앞 비교 기간까지 읽으려면 오늘부터 며칠 전까지 필요한지 */
export function periodLoadDays(period: ReportPeriod, now = Date.now()): number {
  const w = periodWindow(period, now);
  return period === "max" ? w.days : Math.ceil((now - w.end) / DAY + w.days * 2) + 1;
}

/** 그 기간(cur)과 바로 앞 같은 길이 기간(prev)의 리드·광고비. 최대는 가장 오래된 리드·광고비가 있는 날부터 지금까지. */
export function periodSlices(data: ProjectData, period: ReportPeriod, src = "all") {
  const now = data.now, w = periodWindow(period, now);
  let days = w.days;
  if (period === "max") {
    const first = Math.min(now, ...data.leads.map((l) => new Date(l.submitted_at).getTime()), ...data.spend.map((s) => kstMidnight(s.date)));
    days = Math.max(1, Math.ceil((now - first) / DAY) + 1);
  }
  return { cur: slice(data.leads, data.spend, days, src, 0, w.end), prev: slice(data.leads, data.spend, days, src, 1, w.end), days, end: w.end };
}
/** loadProjectData 에 넘길 날 수 (그쪽에서 비교 기간까지 두 배로 읽는다) */
export const periodDataDays = (period: ReportPeriod) => (period === "max" ? 3650 : Math.ceil(periodLoadDays(period) / 2));

export function buildReport(data: ProjectData, period: ReportPeriod, src: string): ReportModel {
  const now = data.now;
  const { cur, prev, days, end } = periodSlices(data, period, src);
  const A = agg(cur.L, cur.S, now), P = agg(prev.L, prev.S, now);
  const recent = [...cur.L].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()).slice(0, 10)
    .map((l) => ({ id: l.id, submitted_at: l.submitted_at, name: l.name, phone: l.phone, utm_source: l.utm_source, utm_content: l.utm_content, assignee: l.assignee, status: l.status }));
  return {
    period, src,
    sources: sources(data.creatives, data.leads, data.spend),
    A, P,
    buckets: buckets(cur.L, days, end),
    bySource: bySource(data.creatives, cur.L, cur.S),
    creatives: creativeStats(data.creatives, cur.L, cur.S).map(({ c, ...a }) => ({ id: c.id, creative_id: c.creative_id, source: c.source, ...a })),
    drops: dropStats(cur.L),
    landings: landingStats(data.creatives, cur.L, cur.S),
    tm: tmStats(cur.L, now),
    recent,
  };
}

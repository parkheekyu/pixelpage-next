import "server-only";
import { agg, buckets, bySource, creativeStats, dropStats, landingStats, slice, sources, tmStats, type Agg, type Bucket } from "./agg";
import type { ProjectData } from "./data";
import type { Lead } from "./types";

/** 리포트 화면에 필요한 값만 서버에서 계산해 넘긴다 (원본 리드는 보내지 않음) */
export interface ReportModel {
  days: number;
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

export function buildReport(data: ProjectData, days: number, src: string): ReportModel {
  const now = data.now;
  const cur = slice(data.leads, data.spend, days, src, 0, now), prev = slice(data.leads, data.spend, days, src, 1, now);
  const A = agg(cur.L, cur.S, now), P = agg(prev.L, prev.S, now);
  const recent = [...cur.L].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()).slice(0, 10)
    .map((l) => ({ id: l.id, submitted_at: l.submitted_at, name: l.name, phone: l.phone, utm_source: l.utm_source, utm_content: l.utm_content, assignee: l.assignee, status: l.status }));
  return {
    days, src,
    sources: sources(data.creatives, data.leads, data.spend),
    A, P,
    buckets: buckets(cur.L, days, now),
    bySource: bySource(data.creatives, cur.L, cur.S),
    creatives: creativeStats(data.creatives, cur.L, cur.S).map(({ c, ...a }) => ({ id: c.id, creative_id: c.creative_id, source: c.source, ...a })),
    drops: dropStats(cur.L),
    landings: landingStats(data.creatives, cur.L, cur.S),
    tm: tmStats(cur.L, now),
    recent,
  };
}

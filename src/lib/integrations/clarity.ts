import "server-only";

/** Microsoft Clarity Data Export API — 프로젝트별 API 토큰 (Clarity > Settings > Data Export) */
export interface ClarityMetric { name: string; info: Record<string, string | number>[] }
export interface ClaritySummary {
  days: number;
  metrics: Record<string, Record<string, string | number>[]>; // Traffic, ScrollDepth, EngagementTime, DeadClickCount, RageClickCount, QuickbackClick, ExcessiveScroll, ScriptErrorCount, ErrorClickCount, PopularPages ...
  headline: { sessions: number; users: number; pagesPerSession: number; scrollDepth: number; engagementSec: number; activeSec: number; deadClicks: number; rageClicks: number; quickBacks: number; scriptErrors: number };
}

/** numOfDays 는 1~3 만 허용 (API 제한). dimension: OS, Browser, Device, Country/Region, URL, Source, Medium, Campaign, Channel */
export async function claritySummary(token: string, days = 3, dimension?: string): Promise<ClaritySummary> {
  const u = new URL("https://www.clarity.ms/export-data/api/v1/project-live-insights");
  u.searchParams.set("numOfDays", String(Math.min(3, Math.max(1, days))));
  if (dimension) u.searchParams.set("dimension1", dimension);
  const r = await fetch(u, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`Clarity API ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const data = (await r.json()) as { metricName: string; information: Record<string, string | number>[] }[];
  const metrics: ClaritySummary["metrics"] = {};
  for (const m of data) metrics[m.metricName] = m.information ?? [];
  const first = (name: string, key: string) => { const row = metrics[name]?.[0]; return row ? Number(row[key] ?? 0) : 0; };
  const traffic = metrics["Traffic"]?.[0] ?? {};
  return {
    days,
    metrics,
    headline: {
      sessions: Number(traffic["totalSessionCount"] ?? 0), users: Number(traffic["distantUserCount"] ?? traffic["distinctUserCount"] ?? 0), pagesPerSession: Number(traffic["PagesPerSessionPercentage"] ?? 0),
      scrollDepth: first("ScrollDepth", "averageScrollDepth"), engagementSec: first("EngagementTime", "totalTime"), activeSec: first("EngagementTime", "activeTime"),
      deadClicks: first("DeadClickCount", "subTotal"), rageClicks: first("RageClickCount", "subTotal"), quickBacks: first("QuickbackClick", "subTotal"), scriptErrors: first("ScriptErrorCount", "subTotal"),
    },
  };
}

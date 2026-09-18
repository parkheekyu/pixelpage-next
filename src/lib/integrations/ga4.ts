import "server-only";
import { createSign } from "node:crypto";

/** GA4 Data API — 서비스 계정 JSON (GA4_SERVICE_ACCOUNT_JSON) 으로 속성 리포트 조회 */
interface SA { client_email: string; private_key: string }
const cached = new Map<string, { token: string; exp: number }>();

export const hasGoogleServiceAccount = () => !!process.env.GA4_SERVICE_ACCOUNT_JSON;
export function googleServiceAccountEmail(): string | null { try { return (JSON.parse(process.env.GA4_SERVICE_ACCOUNT_JSON ?? "") as SA).client_email ?? null; } catch { return null; } }

/** 구글 서비스 계정 액세스 토큰 (GA4·Sheets 공용). scope 별 캐시 */
export async function googleAccessToken(scope = "https://www.googleapis.com/auth/analytics.readonly"): Promise<string> {
  const raw = process.env.GA4_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GA4_SERVICE_ACCOUNT_JSON 미설정 (구글 서비스 계정 키)");
  const c = cached.get(scope);
  if (c && c.exp > Date.now() + 60000) return c.token;
  const sa = JSON.parse(raw) as SA;
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({ iss: sa.client_email, scope, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key, "base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }) });
  const j = (await r.json()) as { access_token?: string; expires_in?: number; error_description?: string };
  if (!j.access_token) throw new Error("구글 토큰 발급 실패: " + (j.error_description ?? r.status));
  cached.set(scope, { token: j.access_token, exp: Date.now() + (j.expires_in ?? 3600) * 1000 });
  return j.access_token;
}
const accessToken = () => googleAccessToken();

export interface Ga4Row { dims: string[]; metrics: number[] }
export interface Ga4Report { dimensionHeaders: string[]; metricHeaders: string[]; rows: Ga4Row[] }

export async function runReport(propertyId: string, body: { dateRanges: { startDate: string; endDate: string }[]; dimensions?: { name: string }[]; metrics: { name: string }[]; dimensionFilter?: unknown; orderBys?: unknown[]; limit?: number }): Promise<Ga4Report> {
  const token = await accessToken();
  const pid = propertyId.replace(/^properties\//, "");
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${pid}:runReport`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
  const j = (await r.json()) as { dimensionHeaders?: { name: string }[]; metricHeaders?: { name: string }[]; rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[]; error?: { message: string } };
  if (j.error) throw new Error("GA4: " + j.error.message);
  return { dimensionHeaders: (j.dimensionHeaders ?? []).map((h) => h.name), metricHeaders: (j.metricHeaders ?? []).map((h) => h.name), rows: (j.rows ?? []).map((row) => ({ dims: (row.dimensionValues ?? []).map((v) => v.value), metrics: (row.metricValues ?? []).map((v) => Number(v.value)) })) };
}

export interface Ga4Summary {
  range: { start: string; end: string };
  totals: { sessions: number; users: number; engagedSessions: number; engagementRate: number; avgEngagementSec: number; bounceRate: number; conversions: number; pageviews: number };
  byPage: { path: string; views: number; users: number; avgEngagementSec: number; conversions: number }[];
  bySource: { source: string; sessions: number; engagementRate: number; conversions: number }[];
  byDevice: { device: string; sessions: number; engagementRate: number; conversions: number }[];
  daily: { date: string; sessions: number; conversions: number }[];
}

/** 랜딩 분석용 요약 (기간: 최근 days일, pathFilter 로 특정 경로만) */
export async function ga4Summary(propertyId: string, days = 28, pathFilter?: string): Promise<Ga4Summary> {
  const end = "yesterday", start = `${days}daysAgo`;
  const M = ["sessions", "totalUsers", "engagedSessions", "engagementRate", "userEngagementDuration", "bounceRate", "conversions", "screenPageViews"].map((name) => ({ name }));
  const filt = pathFilter ? { filter: { fieldName: "pagePath", stringFilter: { matchType: "BEGINS_WITH", value: pathFilter } } } : undefined;
  const [tot, page, src, dev, day] = await Promise.all([
    runReport(propertyId, { dateRanges: [{ startDate: start, endDate: end }], metrics: M, dimensionFilter: filt }),
    runReport(propertyId, { dateRanges: [{ startDate: start, endDate: end }], dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }, { name: "userEngagementDuration" }, { name: "conversions" }], orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: 15, dimensionFilter: filt }),
    runReport(propertyId, { dateRanges: [{ startDate: start, endDate: end }], dimensions: [{ name: "sessionSourceMedium" }], metrics: [{ name: "sessions" }, { name: "engagementRate" }, { name: "conversions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 10, dimensionFilter: filt }),
    runReport(propertyId, { dateRanges: [{ startDate: start, endDate: end }], dimensions: [{ name: "deviceCategory" }], metrics: [{ name: "sessions" }, { name: "engagementRate" }, { name: "conversions" }], dimensionFilter: filt }),
    runReport(propertyId, { dateRanges: [{ startDate: start, endDate: end }], dimensions: [{ name: "date" }], metrics: [{ name: "sessions" }, { name: "conversions" }], orderBys: [{ dimension: { dimensionName: "date" } }], dimensionFilter: filt }),
  ]);
  const t = tot.rows[0]?.metrics ?? [];
  return {
    range: { start, end },
    totals: { sessions: t[0] ?? 0, users: t[1] ?? 0, engagedSessions: t[2] ?? 0, engagementRate: t[3] ?? 0, avgEngagementSec: t[0] ? (t[4] ?? 0) / t[0] : 0, bounceRate: t[5] ?? 0, conversions: t[6] ?? 0, pageviews: t[7] ?? 0 },
    byPage: page.rows.map((r) => ({ path: r.dims[0], views: r.metrics[0], users: r.metrics[1], avgEngagementSec: r.metrics[1] ? r.metrics[2] / r.metrics[1] : 0, conversions: r.metrics[3] })),
    bySource: src.rows.map((r) => ({ source: r.dims[0], sessions: r.metrics[0], engagementRate: r.metrics[1], conversions: r.metrics[2] })),
    byDevice: dev.rows.map((r) => ({ device: r.dims[0], sessions: r.metrics[0], engagementRate: r.metrics[1], conversions: r.metrics[2] })),
    daily: day.rows.map((r) => ({ date: r.dims[0], sessions: r.metrics[0], conversions: r.metrics[1] })),
  };
}

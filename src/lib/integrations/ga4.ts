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

/* ---------- 판매(전자상거래) 요약 ---------- */
export interface Ga4Commerce {
  /** 실제 집계 시작일 (YYYYMMDD). 구매 기록이 기간 중간에 시작됐으면 그 날짜 */
  from: string;
  /** 구매 기록이 기간 중간에 시작돼 집계 구간을 줄였는가 */
  trimmed: boolean;
  totals: { sessions: number; purchases: number; revenue: number; purchasers: number };
  daily: { date: string; sessions: number; purchases: number; revenue: number }[];
  items: { id: string; name: string; qty: number; revenue: number }[];
  bySource: { source: string; sessions: number; purchases: number; revenue: number; folded?: boolean }[];
  byDevice: { device: string; sessions: number; purchases: number; revenue: number }[];
  byLanding: { path: string; sessions: number; purchases: number; revenue: number }[];
}

/** 결제창·로그인 화면을 거쳐 돌아온 방문. GA4가 새 유입으로 잘못 세는 것들이라 한 줄로 묶는다 */
const RETURN_HOP = /tosspayments|kakaopay|kauth\.kakao|accounts\.kakao|nid\.naver|pay\.naver|inicis|nicepay|kcp\.co|payco|payple|portone|iamport|accounts\.google|appleid\.apple|paypal|stripe\.com/i;

/** 구매 이벤트(purchase)가 들어오는 속성만 값이 나온다. 구매가 한 건도 없으면 null */
export async function ga4Commerce(propertyId: string, days = 28): Promise<Ga4Commerce | null> {
  const end = "yesterday";
  const m = (...n: string[]) => n.map((name) => ({ name }));
  const day = await runReport(propertyId, { dateRanges: [{ startDate: `${days}daysAgo`, endDate: end }], dimensions: [{ name: "date" }], metrics: m("sessions", "ecommercePurchases", "purchaseRevenue"), orderBys: [{ dimension: { dimensionName: "date" } }] });
  const dailyAll = day.rows.map((r) => ({ date: r.dims[0], sessions: r.metrics[0], purchases: r.metrics[1], revenue: r.metrics[2] }));
  const first = dailyAll.find((d) => d.purchases > 0);
  if (!first) return null;

  // 기간 앞쪽에 구매가 비어 있으면, 그 전에도 구매 기록이 없었는지 본다. 없었다면 구매 추적을 그날 시작한 것이므로 그날부터만 센다.
  let from = dailyAll[0].date, trimmed = false;
  if (first.date !== dailyAll[0].date) {
    const prior = await runReport(propertyId, { dateRanges: [{ startDate: `${days + 365}daysAgo`, endDate: `${days + 1}daysAgo` }], metrics: m("ecommercePurchases") });
    if (!(prior.rows[0]?.metrics[0] > 0)) { from = first.date; trimmed = true; }
  }
  const start = `${from.slice(0, 4)}-${from.slice(4, 6)}-${from.slice(6, 8)}`;
  const range = [{ startDate: start, endDate: end }];
  const rev = [{ metric: { metricName: "purchaseRevenue" }, desc: true }];
  const [tot, item, src, dev, land] = await Promise.all([
    runReport(propertyId, { dateRanges: range, metrics: m("sessions", "ecommercePurchases", "purchaseRevenue", "totalPurchasers") }),
    runReport(propertyId, { dateRanges: range, dimensions: [{ name: "itemId" }, { name: "itemName" }], metrics: m("itemsPurchased", "itemRevenue"), orderBys: [{ metric: { metricName: "itemRevenue" }, desc: true }], limit: 200 }),
    runReport(propertyId, { dateRanges: range, dimensions: [{ name: "sessionSourceMedium" }], metrics: m("sessions", "ecommercePurchases", "purchaseRevenue"), orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 50 }),
    runReport(propertyId, { dateRanges: range, dimensions: [{ name: "deviceCategory" }], metrics: m("sessions", "ecommercePurchases", "purchaseRevenue") }),
    runReport(propertyId, { dateRanges: range, dimensions: [{ name: "landingPage" }], metrics: m("sessions", "ecommercePurchases", "purchaseRevenue"), orderBys: rev, limit: 20 }),
  ]);

  // 같은 상품이 할인 문구만 바뀌어 여러 이름으로 들어오므로 상품 ID로 합친다. 이름은 매출이 가장 큰 것을 쓴다.
  const items = new Map<string, { id: string; name: string; qty: number; revenue: number }>();
  for (const r of item.rows) {
    const id = r.dims[0] && r.dims[0] !== "(not set)" ? r.dims[0] : r.dims[1];
    const cur = items.get(id);
    if (cur) { cur.qty += r.metrics[0]; cur.revenue += r.metrics[1]; } else items.set(id, { id, name: r.dims[1], qty: r.metrics[0], revenue: r.metrics[1] });
  }
  const hop = { source: "결제·로그인 뒤 복귀", sessions: 0, purchases: 0, revenue: 0, folded: true };
  const bySource: Ga4Commerce["bySource"] = [];
  for (const r of src.rows) {
    if (RETURN_HOP.test(r.dims[0])) { hop.sessions += r.metrics[0]; hop.purchases += r.metrics[1]; hop.revenue += r.metrics[2]; }
    else bySource.push({ source: r.dims[0], sessions: r.metrics[0], purchases: r.metrics[1], revenue: r.metrics[2] });
  }
  if (hop.sessions) bySource.push(hop);
  bySource.sort((a, b) => b.revenue - a.revenue || b.sessions - a.sessions);
  const t = tot.rows[0]?.metrics ?? [];
  return {
    from, trimmed,
    totals: { sessions: t[0] ?? 0, purchases: t[1] ?? 0, revenue: t[2] ?? 0, purchasers: t[3] ?? 0 },
    daily: dailyAll.filter((d) => d.date >= from),
    items: [...items.values()].sort((a, b) => b.revenue - a.revenue),
    bySource,
    byDevice: dev.rows.map((r) => ({ device: r.dims[0], sessions: r.metrics[0], purchases: r.metrics[1], revenue: r.metrics[2] })),
    // 결제 완료·로그인 복귀 화면은 처음 들어온 페이지가 아니라 돌아온 페이지이므로 뺀다
    byLanding: land.rows.filter((r) => r.dims[0] && r.dims[0] !== "(not set)" && !/\/(payment|checkout|pay|order|login|auth|oauth|callback)(\/|$)/i.test(r.dims[0])).map((r) => ({ path: r.dims[0], sessions: r.metrics[0], purchases: r.metrics[1], revenue: r.metrics[2] })),
  };
}

/**
 * 단계를 순서대로 밟은 사람 수 (GA4 퍼널 보고서, 닫힌 퍼널: 첫 단계부터 차례로 거친 사람만 다음 단계에 센다).
 * 날짜는 YYYY-MM-DD.
 */
export async function ga4Funnel(propertyId: string, start: string, end: string, steps: { name: string; event: string; param?: string; value?: string }[]): Promise<number[]> {
  const token = await accessToken();
  const pid = propertyId.replace(/^properties\//, "");
  const body = {
    dateRanges: [{ startDate: start, endDate: end }],
    funnel: {
      isOpenFunnel: false,
      steps: steps.map((s) => ({
        name: s.name,
        filterExpression: { funnelEventFilter: { eventName: s.event, ...(s.param && s.value ? { funnelParameterFilterExpression: { funnelParameterFilter: { eventParameterName: s.param, stringFilter: { matchType: "CONTAINS", value: s.value } } } } : {}) } },
      })),
    },
  };
  const r = await fetch(`https://analyticsdata.googleapis.com/v1alpha/properties/${pid}:runFunnelReport`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
  const j = (await r.json()) as { funnelTable?: { rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[] }; error?: { message: string } };
  if (j.error) throw new Error("GA4: " + j.error.message);
  const out = steps.map(() => 0);
  // 행 이름은 "1. 단계명" 꼴. 아무도 도달하지 못한 단계는 행이 없다.
  for (const row of j.funnelTable?.rows ?? []) {
    const i = parseInt(row.dimensionValues?.[0]?.value ?? "", 10) - 1;
    if (i >= 0 && i < out.length) out[i] = Number(row.metricValues?.[0]?.value ?? 0);
  }
  return out;
}

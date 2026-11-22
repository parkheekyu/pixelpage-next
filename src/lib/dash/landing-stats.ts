import "server-only";
import { ga4Summary, ga4Commerce, type Ga4Summary, type Ga4Commerce } from "@/lib/integrations/ga4";
import { claritySummary, type ClaritySummary } from "@/lib/integrations/clarity";

/** 랜딩 탭 숫자: GA4(방문·전환·참여) + Clarity(스크롤·클릭 문제). 10분 동안 기억해 두고 다시 쓴다. */
export interface LandingStats { days: number; ga: Ga4Summary | null; commerce: Ga4Commerce | null; gaError: string | null; clarity: ClaritySummary["headline"] | null; clarityError: string | null; fetchedAt: number }

const TTL = 600_000;
const memo = new Map<string, { at: number; v: Promise<LandingStats> }>();

export function loadLandingStats(opts: { landingUrl: string | null; ga4PropertyId: string | null; clarityToken: string | null; days: number }, fresh = false): Promise<LandingStats> {
  const key = [opts.ga4PropertyId, opts.landingUrl, opts.days, opts.clarityToken ? "c" : ""].join("|");
  const hit = memo.get(key);
  if (hit && !fresh && Date.now() - hit.at < TTL) return hit.v;
  const v = (async (): Promise<LandingStats> => {
    // 랜딩 주소가 특정 경로면 그 경로만, 홈이면 사이트 전체
    let path: string | undefined;
    try { const p = opts.landingUrl ? new URL(opts.landingUrl).pathname : "/"; path = p === "/" ? undefined : p; } catch { path = undefined; }
    const hasGa = !!(opts.ga4PropertyId && process.env.GA4_SERVICE_ACCOUNT_JSON);
    const [ga, cl, shop] = await Promise.all([
      opts.ga4PropertyId && process.env.GA4_SERVICE_ACCOUNT_JSON ? ga4Summary(opts.ga4PropertyId, opts.days, path).then((d) => ({ d, e: null as string | null }), (e: Error) => ({ d: null, e: e.message })) : Promise.resolve({ d: null, e: null as string | null }),
      opts.clarityToken ? claritySummary(opts.clarityToken, 3).then((d) => ({ d: d.headline, e: null as string | null }), (e: Error) => ({ d: null, e: e.message })) : Promise.resolve({ d: null, e: null as string | null }),
      // 판매 숫자는 사이트 전체 기준. 실패해도 나머지 화면은 그대로 보여 준다.
      hasGa ? ga4Commerce(opts.ga4PropertyId!, opts.days).catch(() => null) : Promise.resolve(null),
    ]);
    return { days: opts.days, ga: ga.d, commerce: shop, gaError: ga.e, clarity: cl.d, clarityError: cl.e, fetchedAt: Date.now() };
  })();
  memo.set(key, { at: Date.now(), v });
  return v;
}

import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchMetaDailySpend } from "@/lib/integrations/meta";
import type { AdSpend } from "./types";

/**
 * 광고비는 Meta 광고 계정이 원본이다. 계정을 연결한 프로젝트는 DB(ad_spend)를 읽지 않고 Meta 에서 일별 광고비를 읽는다.
 * 읽기만 한다. 한 번 읽은 것은 10분 동안 기억해 두고 다시 쓴다 (서버 인스턴스가 바뀌어도 유지).
 */
const cachedDaily = unstable_cache((acct: string, from: string, until: string) => fetchMetaDailySpend(acct, from, until), ["meta-daily-spend"], { revalidate: 600 });
const kstDate = (ms: number) => new Date(ms + 9 * 3600_000).toISOString().slice(0, 10);

/** since(YYYY-MM-DD)부터 오늘까지의 일별 광고비. 연결된 계정이나 토큰이 없으면 null. */
export async function metaSpend(projectId: string, since: string): Promise<AdSpend[] | null> {
  if (!process.env.META_ACCESS_TOKEN) return null;
  const { data } = await createAdminClient().from("project_integrations").select("meta_ad_account_id,meta_goal").eq("project_id", projectId).maybeSingle();
  const acct = data?.meta_ad_account_id as string | null | undefined;
  if (!acct) return null;
  const purchase = data?.meta_goal === "purchase"; // 판매 캠페인은 구매 수를 결과로 센다
  // Meta 는 37개월보다 오래된 날짜를 받지 않는다
  const floor = kstDate(Date.now() - 36 * 30 * 86400_000), from = since < floor ? floor : since, until = kstDate(Date.now());
  return cachedDaily(acct, from, until).then((days) => days.map((d) => ({ id: `meta-${acct}-${d.date}`, project_id: projectId, date: d.date, creative_id: "", source: "meta", impressions: d.impressions, clicks: d.clicks, cost: d.spend, platform_leads: purchase ? d.purchases : d.leads })));
}

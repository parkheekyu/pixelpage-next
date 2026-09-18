import "server-only";

/** Meta Marketing API — 캠페인 구조 + 광고별 성과 + 크리에이티브. 토큰은 META_ACCESS_TOKEN (ads_read). */
const V = "v21.0";
const BASE = `https://graph.facebook.com/${V}`;

export interface MetaAction { action_type: string; value: string }
export interface MetaInsight {
  spend: number; impressions: number; reach: number; frequency: number; clicks: number; ctr: number; cpc: number; cpm: number;
  link_clicks: number; landing_page_views: number; leads: number; purchases: number; purchase_value: number; cpl: number | null; cpa: number | null; roas: number | null;
  video_p25: number; video_p50: number; video_p75: number; video_p100: number; thruplays: number; hook_rate: number | null; hold_rate: number | null;
}
export interface MetaCreative {
  id: string; name?: string; title?: string; body?: string; call_to_action?: string; link?: string;
  image_url?: string; thumbnail_url?: string; video_id?: string; format: "video" | "image" | "carousel" | "unknown";
  cards?: { title?: string; body?: string; image_url?: string }[];
}
export interface MetaAd { id: string; name: string; status: string; adset_id: string; campaign_id: string; creative?: MetaCreative; insight: MetaInsight | null }
export interface MetaAdSet { id: string; name: string; status: string; campaign_id: string; daily_budget?: number; lifetime_budget?: number; optimization_goal?: string; targeting_summary?: string; ads: MetaAd[]; insight: MetaInsight | null }
export interface MetaCampaign { id: string; name: string; status: string; objective?: string; daily_budget?: number; lifetime_budget?: number; adsets: MetaAdSet[]; insight: MetaInsight | null }
export interface MetaAccountSnapshot {
  account: { id: string; name?: string; currency?: string };
  date_preset: string; fetched_at: string;
  campaigns: MetaCampaign[];
  totals: MetaInsight;
  winners: MetaAd[];
}

async function gget<T>(path: string, params: Record<string, string>): Promise<T> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error("META_ACCESS_TOKEN 미설정");
  const u = new URL(`${BASE}/${path}`);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  u.searchParams.set("access_token", token);
  const r = await fetch(u, { signal: AbortSignal.timeout(30000) });
  const j = (await r.json()) as T & { error?: { message: string; code?: number } };
  if (!r.ok || j.error) throw new Error(`Meta API: ${j.error?.message ?? r.status}`);
  return j;
}
/** 페이지네이션 수집. 큰 계정에서 "reduce the amount of data" 오류가 나면 페이지 크기를 줄여 재시도 */
async function gall<T>(path: string, params: Record<string, string>, cap = 1500): Promise<T[]> {
  const sizes = [params.limit ?? "50", "20", "5"];
  let lastErr: unknown = null;
  for (const limit of sizes) {
    try {
      const out: T[] = [];
      let after: string | undefined;
      do {
        const j = await gget<{ data: T[]; paging?: { cursors?: { after?: string }; next?: string } }>(path, { ...params, limit, ...(after ? { after } : {}) });
        out.push(...(j.data ?? []));
        after = j.paging?.next ? j.paging.cursors?.after : undefined;
      } while (after && out.length < cap);
      return out;
    } catch (e) {
      lastErr = e;
      if (!/reduce the amount of data|Please retry your request later|code 1\b|\(#1\)/i.test((e as Error).message)) throw e;
    }
  }
  throw lastErr as Error;
}

const n = (v: unknown) => (v == null ? 0 : Number(v) || 0);
const act = (arr: MetaAction[] | undefined, ...types: string[]) => { for (const t of types) { const f = arr?.find((a) => a.action_type === t); if (f) return n(f.value); } return 0; };

interface RawInsight { spend?: string; impressions?: string; reach?: string; frequency?: string; clicks?: string; ctr?: string; cpc?: string; cpm?: string; inline_link_clicks?: string; actions?: MetaAction[]; action_values?: MetaAction[]; cost_per_action_type?: MetaAction[]; video_p25_watched_actions?: MetaAction[]; video_p50_watched_actions?: MetaAction[]; video_p75_watched_actions?: MetaAction[]; video_p100_watched_actions?: MetaAction[]; video_thruplay_watched_actions?: MetaAction[]; video_play_actions?: MetaAction[]; campaign_id?: string; adset_id?: string; ad_id?: string }
// 목록: 삭제·보관 제외 / 인사이트: 지출 있는 항목만 (큰 계정의 데이터 초과 오류 방지)
const LIVE_FILTER = JSON.stringify([{ field: "effective_status", operator: "IN", value: ["ACTIVE", "PAUSED", "CAMPAIGN_PAUSED", "ADSET_PAUSED", "IN_PROCESS", "WITH_ISSUES", "PENDING_REVIEW"] }]);
const SPEND_FILTER = JSON.stringify([{ field: "spend", operator: "GREATER_THAN", value: "0" }]);
const INSIGHT_FIELDS = "spend,impressions,reach,frequency,clicks,ctr,cpc,cpm,inline_link_clicks,actions,action_values,cost_per_action_type,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p100_watched_actions,video_thruplay_watched_actions,video_play_actions";

function toInsight(r: RawInsight | undefined): MetaInsight | null {
  if (!r) return null;
  const leads = act(r.actions, "lead", "onsite_conversion.lead_grouped", "offsite_conversion.fb_pixel_lead", "onsite_web_lead", "submit_application");
  const spend = n(r.spend), imps = n(r.impressions);
  const plays = act(r.video_play_actions, "video_view"), p25 = act(r.video_p25_watched_actions, "video_view"), p100 = act(r.video_p100_watched_actions, "video_view");
  const thru = act(r.video_thruplay_watched_actions, "video_view");
  const purchases = act(r.actions, "purchase", "offsite_conversion.fb_pixel_purchase", "omni_purchase");
  const purchase_value = act(r.action_values, "purchase", "offsite_conversion.fb_pixel_purchase", "omni_purchase");
  return {
    spend, impressions: imps, reach: n(r.reach), frequency: n(r.frequency), clicks: n(r.clicks), ctr: n(r.ctr), cpc: n(r.cpc), cpm: n(r.cpm),
    link_clicks: n(r.inline_link_clicks), landing_page_views: act(r.actions, "landing_page_view"), leads, purchases, purchase_value,
    cpl: leads > 0 ? spend / leads : null, cpa: purchases > 0 ? spend / purchases : null, roas: spend > 0 && purchase_value > 0 ? purchase_value / spend : null,
    video_p25: p25, video_p50: act(r.video_p50_watched_actions, "video_view"), video_p75: act(r.video_p75_watched_actions, "video_view"), video_p100: p100, thruplays: thru,
    hook_rate: imps > 0 && plays > 0 ? thru / imps : null, hold_rate: p25 > 0 ? p100 / p25 : null,
  };
}
function sum(list: (MetaInsight | null)[]): MetaInsight {
  const t: MetaInsight = { spend: 0, impressions: 0, reach: 0, frequency: 0, clicks: 0, ctr: 0, cpc: 0, cpm: 0, link_clicks: 0, landing_page_views: 0, leads: 0, purchases: 0, purchase_value: 0, cpl: null, cpa: null, roas: null, video_p25: 0, video_p50: 0, video_p75: 0, video_p100: 0, thruplays: 0, hook_rate: null, hold_rate: null };
  for (const i of list) if (i) for (const k of ["spend", "impressions", "reach", "clicks", "link_clicks", "landing_page_views", "leads", "purchases", "purchase_value", "video_p25", "video_p50", "video_p75", "video_p100", "thruplays"] as const) t[k] += i[k];
  t.ctr = t.impressions ? (t.clicks / t.impressions) * 100 : 0; t.cpc = t.clicks ? t.spend / t.clicks : 0; t.cpm = t.impressions ? (t.spend / t.impressions) * 1000 : 0;
  t.frequency = t.reach ? t.impressions / t.reach : 0; t.cpl = t.leads ? t.spend / t.leads : null; t.cpa = t.purchases ? t.spend / t.purchases : null; t.roas = t.spend && t.purchase_value ? t.purchase_value / t.spend : null; t.hook_rate = t.impressions && t.thruplays ? t.thruplays / t.impressions : null; t.hold_rate = t.video_p25 ? t.video_p100 / t.video_p25 : null;
  return t;
}

interface RawCreative { id: string; name?: string; title?: string; body?: string; image_url?: string; thumbnail_url?: string; video_id?: string; call_to_action_type?: string; object_story_spec?: { link_data?: { message?: string; name?: string; link?: string; call_to_action?: { type?: string }; child_attachments?: { name?: string; description?: string; picture?: string }[]; picture?: string }; video_data?: { message?: string; title?: string; call_to_action?: { type?: string; value?: { link?: string } }; video_id?: string; image_url?: string } }; asset_feed_spec?: { bodies?: { text: string }[]; titles?: { text: string }[]; videos?: { video_id: string }[]; images?: { url?: string }[]; link_urls?: { website_url?: string }[] } }
function toCreative(c: RawCreative | undefined): MetaCreative | undefined {
  if (!c) return undefined;
  const ld = c.object_story_spec?.link_data, vd = c.object_story_spec?.video_data, af = c.asset_feed_spec;
  const video_id = vd?.video_id ?? c.video_id ?? af?.videos?.[0]?.video_id;
  const cards = ld?.child_attachments?.map((x) => ({ title: x.name, body: x.description, image_url: x.picture }));
  return {
    id: c.id, name: c.name,
    title: c.title ?? ld?.name ?? vd?.title ?? af?.titles?.[0]?.text,
    body: c.body ?? ld?.message ?? vd?.message ?? af?.bodies?.[0]?.text,
    call_to_action: c.call_to_action_type ?? ld?.call_to_action?.type ?? vd?.call_to_action?.type,
    link: ld?.link ?? vd?.call_to_action?.value?.link ?? af?.link_urls?.[0]?.website_url,
    image_url: c.image_url ?? ld?.picture ?? vd?.image_url ?? af?.images?.[0]?.url, thumbnail_url: c.thumbnail_url, video_id,
    format: video_id ? "video" : cards?.length ? "carousel" : (c.image_url || ld?.picture || af?.images?.length) ? "image" : "unknown",
    cards,
  };
}

/** 계정 전체 스냅샷 (기간 프리셋: last_7d | last_14d | last_30d | last_90d | maximum) */
export async function fetchMetaSnapshot(adAccountId: string, datePreset = "last_30d"): Promise<MetaAccountSnapshot> {
  const acct = adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;
  const [account, campaigns, adsets, ads, insC, insS, insA] = await Promise.all([
    gget<{ id: string; name?: string; currency?: string }>(acct, { fields: "id,name,currency" }),
    gall<{ id: string; name: string; status: string; effective_status?: string; objective?: string; daily_budget?: string; lifetime_budget?: string }>(`${acct}/campaigns`, { fields: "id,name,status,effective_status,objective,daily_budget,lifetime_budget", filtering: LIVE_FILTER }),
    gall<{ id: string; name: string; status: string; campaign_id: string; daily_budget?: string; lifetime_budget?: string; optimization_goal?: string; targeting?: { age_min?: number; age_max?: number; genders?: number[]; geo_locations?: { countries?: string[]; cities?: { name: string }[] }; flexible_spec?: { interests?: { name: string }[] }[]; custom_audiences?: { name: string }[] } }>(`${acct}/adsets`, { fields: "id,name,status,campaign_id,daily_budget,lifetime_budget,optimization_goal,targeting", filtering: LIVE_FILTER }),
    gall<{ id: string; name: string; status: string; adset_id: string; campaign_id: string; creative?: RawCreative }>(`${acct}/ads`, { fields: "id,name,status,adset_id,campaign_id,creative{id,name,title,body,image_url,thumbnail_url,video_id,call_to_action_type,object_story_spec,asset_feed_spec}", filtering: LIVE_FILTER, limit: "25" }),
    gall<RawInsight>(`${acct}/insights`, { level: "campaign", date_preset: datePreset, fields: `campaign_id,${INSIGHT_FIELDS}`, filtering: SPEND_FILTER }),
    gall<RawInsight>(`${acct}/insights`, { level: "adset", date_preset: datePreset, fields: `adset_id,${INSIGHT_FIELDS}`, filtering: SPEND_FILTER }),
    gall<RawInsight>(`${acct}/insights`, { level: "ad", date_preset: datePreset, fields: `ad_id,${INSIGHT_FIELDS}`, filtering: SPEND_FILTER, limit: "25" }),
  ]);
  const byC = new Map(insC.map((r) => [r.campaign_id!, toInsight(r)])), byS = new Map(insS.map((r) => [r.adset_id!, toInsight(r)])), byA = new Map(insA.map((r) => [r.ad_id!, toInsight(r)]));
  const adList: MetaAd[] = ads.map((a) => ({ id: a.id, name: a.name, status: a.status, adset_id: a.adset_id, campaign_id: a.campaign_id, creative: toCreative(a.creative), insight: byA.get(a.id) ?? null }));
  const tsum = (t: (typeof adsets)[number]["targeting"]) => { if (!t) return undefined; const parts: string[] = []; if (t.age_min || t.age_max) parts.push(`${t.age_min ?? ""}-${t.age_max ?? ""}세`); if (t.genders?.length) parts.push(t.genders.includes(1) && !t.genders.includes(2) ? "남" : t.genders.includes(2) && !t.genders.includes(1) ? "여" : "전체"); const geo = [...(t.geo_locations?.countries ?? []), ...(t.geo_locations?.cities?.map((c) => c.name) ?? [])]; if (geo.length) parts.push(geo.slice(0, 3).join("/")); const ints = t.flexible_spec?.flatMap((f) => f.interests?.map((i) => i.name) ?? []) ?? []; if (ints.length) parts.push("관심사: " + ints.slice(0, 4).join(", ")); if (t.custom_audiences?.length) parts.push("맞춤타깃: " + t.custom_audiences.map((c) => c.name).slice(0, 2).join(", ")); return parts.join(" · "); };
  const setList: MetaAdSet[] = adsets.map((s) => ({ id: s.id, name: s.name, status: s.status, campaign_id: s.campaign_id, daily_budget: s.daily_budget ? n(s.daily_budget) / 100 : undefined, lifetime_budget: s.lifetime_budget ? n(s.lifetime_budget) / 100 : undefined, optimization_goal: s.optimization_goal, targeting_summary: tsum(s.targeting), ads: adList.filter((a) => a.adset_id === s.id), insight: byS.get(s.id) ?? null }));
  const campList: MetaCampaign[] = campaigns.map((c) => ({ id: c.id, name: c.name, status: c.effective_status ?? c.status, objective: c.objective, daily_budget: c.daily_budget ? n(c.daily_budget) / 100 : undefined, lifetime_budget: c.lifetime_budget ? n(c.lifetime_budget) / 100 : undefined, adsets: setList.filter((s) => s.campaign_id === c.id), insight: byC.get(c.id) ?? null }));
  const snap: MetaAccountSnapshot = { account, date_preset: datePreset, fetched_at: new Date().toISOString(), campaigns: campList, totals: sum(adList.map((a) => a.insight)), winners: [] };
  snap.winners = rankWinners(snap, "lead");
  return snap;
}

export type MetaGoal = "lead" | "purchase";
/** 목표별 위너: lead = 리드 수 → CPL → CTR / purchase = 구매 수 → ROAS → CPA → CTR. 지출 0 제외 */
export function rankWinners(s: MetaAccountSnapshot, goal: MetaGoal, limit = 8): MetaAd[] {
  const ads = s.campaigns.flatMap((c) => c.adsets.flatMap((a) => a.ads)).filter((a) => a.insight && a.insight.spend > 0);
  return [...ads].sort((a, b) => {
    const A = a.insight!, B = b.insight!;
    if (goal === "purchase") {
      if (A.purchases !== B.purchases) return B.purchases - A.purchases;
      if ((A.roas ?? 0) !== (B.roas ?? 0)) return (B.roas ?? 0) - (A.roas ?? 0);
      if (A.cpa != null && B.cpa != null && A.cpa !== B.cpa) return A.cpa - B.cpa;
    } else {
      if (A.leads !== B.leads) return B.leads - A.leads;
      if (A.cpl != null && B.cpl != null && A.cpl !== B.cpl) return A.cpl - B.cpl;
    }
    return B.ctr - A.ctr;
  }).slice(0, limit);
}

/** AI 프롬프트용 압축 텍스트 */
export function snapshotToText(s: MetaAccountSnapshot, goal: MetaGoal = "lead"): string {
  const won = (v: number) => "₩" + Math.round(v).toLocaleString("ko-KR");
  const pct = (v: number | null) => (v == null ? "-" : (v * 100).toFixed(1) + "%");
  const conv = (i: MetaInsight) => goal === "purchase" ? `구매 ${i.purchases} · 매출 ${won(i.purchase_value)} · CPA ${i.cpa == null ? "-" : won(i.cpa)} · ROAS ${i.roas == null ? "-" : (i.roas * 100).toFixed(0) + "%"}` : `리드 ${i.leads} · CPL ${i.cpl == null ? "-" : won(i.cpl)}`;
  const line = (i: MetaInsight | null) => i ? `지출 ${won(i.spend)} · 노출 ${i.impressions} · 도달 ${i.reach} · 빈도 ${i.frequency.toFixed(2)} · CPM ${won(i.cpm)} · CTR ${i.ctr.toFixed(2)}% · CPC ${won(i.cpc)} · 링크클릭 ${i.link_clicks} · 랜딩뷰 ${i.landing_page_views} · ${conv(i)}${i.thruplays ? ` · 훅률 ${pct(i.hook_rate)} · 유지율 ${pct(i.hold_rate)}` : ""}` : "(성과 없음)";
  const out: string[] = [`계정 ${s.account.name ?? s.account.id} (${s.account.currency ?? ""}) · 기간 ${s.date_preset} · 전환 목표: ${goal === "purchase" ? "구매/매출 (전자책 등 판매 캠페인)" : "리드/상담 신청"}`, `합계: ${line(s.totals)}`, ""];
  for (const c of s.campaigns) {
    if (!c.insight && !c.adsets.some((a) => a.insight)) continue;
    out.push(`# 캠페인 [${c.status}] ${c.name} (${c.objective ?? ""}${c.daily_budget ? `, 일예산 ${won(c.daily_budget)}` : ""})`, `  ${line(c.insight)}`);
    for (const a of c.adsets) {
      if (!a.insight) continue;
      out.push(`  ## 세트 [${a.status}] ${a.name}${a.optimization_goal ? ` (${a.optimization_goal})` : ""}${a.daily_budget ? `, 일예산 ${won(a.daily_budget)}` : ""}${a.targeting_summary ? ` · 타깃: ${a.targeting_summary}` : ""}`, `    ${line(a.insight)}`);
      for (const ad of a.ads) {
        if (!ad.insight || ad.insight.spend === 0) continue;
        const cr = ad.creative;
        out.push(`    ### 광고 [${ad.status}] ${ad.name} · ${cr?.format ?? "?"}${cr?.call_to_action ? ` · CTA ${cr.call_to_action}` : ""}`, `      ${line(ad.insight)}`);
        if (cr?.title) out.push(`      제목: ${cr.title}`);
        if (cr?.body) out.push(`      본문: ${cr.body.replace(/\s+/g, " ").slice(0, 600)}`);
        if (cr?.cards?.length) out.push(`      카드: ${cr.cards.map((k) => k.title).filter(Boolean).join(" | ").slice(0, 300)}`);
      }
    }
  }
  return out.join("\n");
}

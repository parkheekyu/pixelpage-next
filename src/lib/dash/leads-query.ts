import "server-only";
import type { createClient } from "@/lib/supabase/server";
import type { Lead } from "./types";
import type { LeadPage, LeadQuery, LeadSummary } from "./leads-types";
export type { LeadPage, LeadQuery, LeadSummary, SheetSort, SheetView } from "./leads-types";
export { defaultQuery } from "./leads-types";
import { isDate, MIN_DATE, todayKST } from "./dates";

type DashClient = Awaited<ReturnType<typeof createClient>>;

export const LEAD_COLS = "id,project_id,submitted_at,name,phone,email,message,company,industry,budget,services,marketing_status,utm_source,utm_medium,utm_campaign,utm_content,utm_term,landing_id,status,drop_reason,assignee,first_contact_at,consulted_at,converted_on,revenue,pay_type,memo,custom,manual_order,is_duplicate";


/** 리드 시트 한 페이지 + 요약. 필터·정렬·페이지네이션은 전부 DB에서. */
export async function queryLeads(supabase: DashClient, projectId: string, p: LeadQuery, now = Date.now()): Promise<LeadPage> {
  const today = todayKST(now);
  const from = isDate(p.from) && p.from >= MIN_DATE ? p.from : today;
  const to = isDate(p.to) && p.to >= from ? p.to : today;
  const since = new Date(from + "T00:00:00+09:00").toISOString();
  const until = new Date(to + "T23:59:59.999+09:00").toISOString();
  const limit = Math.min(Math.max(p.limit, 1), 500);
  const offset = Math.max(p.offset, 0);

  let q = supabase.from("leads").select(LEAD_COLS, { count: "exact" }).eq("project_id", projectId).gte("submitted_at", since).lte("submitted_at", until);
  q = p.view === "dup" ? q.eq("is_duplicate", true) : q.eq("is_duplicate", false);
  if (p.view === "todo") q = q.in("status", ["신규", "연락중"]);
  if (p.view === "conv") q = q.eq("status", "전환");
  if (p.view === "need") q = q.eq("status", "전환").eq("revenue", 0);
  if (p.view === "drop") q = q.eq("status", "드랍");
  if (p.status) q = q.eq("status", p.status);
  if (p.src) q = q.eq("utm_source", p.src);
  if (p.q.trim()) {
    const s = p.q.trim().replace(/[%,()]/g, "");
    q = q.or(`name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%`);
  }
  if (p.sort === "manual") q = q.order("manual_order", { ascending: true, nullsFirst: false }).order("submitted_at", { ascending: false });
  else if (p.sort === "ts_asc") q = q.order("submitted_at", { ascending: true });
  else if (p.sort === "rev_desc") q = q.order("revenue", { ascending: false }).order("submitted_at", { ascending: false });
  else if (p.sort === "status") q = q.order("status").order("submitted_at", { ascending: false });
  else q = q.order("submitted_at", { ascending: false });
  q = q.range(offset, offset + limit - 1);

  const [page, summary, srcRows] = await Promise.all([
    q,
    supabase.rpc("lead_summary", { p_project: projectId, p_since: since, p_until: until }),
    supabase.from("creatives").select("source").eq("project_id", projectId),
  ]);

  const sum = (summary.data ?? {}) as Partial<LeadSummary>;
  return {
    rows: (page.data ?? []) as Lead[],
    total: page.count ?? 0,
    summary: { all: +(sum.all ?? 0), todo: +(sum.todo ?? 0), conv: +(sum.conv ?? 0), need: +(sum.need ?? 0), drop: +(sum.drop ?? 0), dup: +(sum.dup ?? 0), revenue: +(sum.revenue ?? 0) },
    sources: [...new Set(((srcRows.data ?? []) as { source: string }[]).map((r) => r.source))].sort(),
  };
}

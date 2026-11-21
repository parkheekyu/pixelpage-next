import "server-only";
import type { createClient } from "@/lib/supabase/server";
import type { Lead } from "./types";
import type { LeadPage, LeadQuery, LeadSummary } from "./leads-types";
export type { LeadPage, LeadQuery, LeadSummary, SheetSort, SheetView } from "./leads-types";
export { defaultQuery } from "./leads-types";
import { isDate, MIN_DATE, todayKST } from "./dates";
import { sheetLeads } from "./sheet-leads";

type DashClient = Awaited<ReturnType<typeof createClient>>;

export const LEAD_COLS = "id,project_id,submitted_at,name,phone,email,message,company,industry,budget,services,marketing_status,utm_source,utm_medium,utm_campaign,utm_content,utm_term,landing_id,status,drop_reason,assignee,first_contact_at,consulted_at,converted_on,revenue,pay_type,memo,custom,manual_order,is_duplicate";


/** 리드 시트 한 페이지 + 요약. 필터·정렬·페이지네이션은 전부 DB에서. */
export async function queryLeads(supabase: DashClient, projectId: string, p: LeadQuery, now = Date.now()): Promise<LeadPage> {
  const today = todayKST(now);
  const from = isDate(p.from) && p.from >= MIN_DATE ? p.from : today;
  const to = isDate(p.to) && p.to >= from ? p.to : today;
  const since = new Date(from + "T00:00:00+09:00").toISOString();
  const until = new Date(to + "T23:59:59.999+09:00").toISOString();
  const limit = Math.min(Math.max(p.limit, 1), 5000);
  const offset = Math.max(p.offset, 0);

  // 시트를 연결한 프로젝트는 시트에서 읽어 같은 모양으로 돌려준다 (중복 판정은 없다)
  const sl = await sheetLeads(projectId);
  if (sl) {
    const inRange = sl.filter((l) => l.submitted_at >= since && l.submitted_at <= until);
    const term = p.q.trim().toLowerCase();
    let rows = inRange.filter((l) => p.view !== "dup"
      && (p.view !== "todo" || l.status === "신규" || l.status === "연락중") && (p.view !== "conv" || l.status === "전환") && (p.view !== "need" || (l.status === "전환" && !l.revenue)) && (p.view !== "drop" || l.status === "드랍")
      && (!p.status || l.status === p.status) && (!p.src || l.utm_source === p.src)
      && (!term || [l.name, l.phone, l.email].some((v) => (v ?? "").toLowerCase().includes(term))));
    rows = rows.sort((a, b) => p.sort === "ts_asc" ? a.submitted_at.localeCompare(b.submitted_at) : p.sort === "rev_desc" ? b.revenue - a.revenue || b.submitted_at.localeCompare(a.submitted_at) : p.sort === "status" ? a.status.localeCompare(b.status) || b.submitted_at.localeCompare(a.submitted_at) : b.submitted_at.localeCompare(a.submitted_at));
    const n = (f: (l: Lead) => boolean) => inRange.filter(f).length;
    return {
      rows: rows.slice(offset, offset + limit), total: rows.length,
      summary: { all: inRange.length, todo: n((l) => l.status === "신규" || l.status === "연락중"), conv: n((l) => l.status === "전환"), need: n((l) => l.status === "전환" && !l.revenue), drop: n((l) => l.status === "드랍"), dup: 0, revenue: inRange.reduce((a, l) => a + (l.status === "전환" ? l.revenue : 0), 0) },
      sources: [...new Set(inRange.map((l) => l.utm_source))].sort(),
    };
  }

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

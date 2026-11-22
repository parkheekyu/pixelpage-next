import { requireStaff } from "@/lib/dash/auth";
import LedgerClient from "@/components/dash/LedgerClient";
import type { LedgerRow } from "@/lib/dash/ledger";
import { todayKST } from "@/lib/dash/work";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const { supabase } = await requireStaff();
  // 한 번에 1,000줄까지만 오므로 나눠서 끝까지 읽는다
  const rows: LedgerRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await supabase.from("ledger").select("id,date,kind,category,method,amount,fixed,title,memo").order("date", { ascending: false }).order("created_at", { ascending: false }).range(from, from + 999);
    rows.push(...((data ?? []) as LedgerRow[]));
    if (!data || data.length < 1000) break;
  }
  return <div className="pg"><LedgerClient rows={rows} today={todayKST()} /></div>;
}

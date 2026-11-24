import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { ga4Funnel } from "@/lib/integrations/ga4";
import type { Ga4FunnelStep } from "./types";

const cached = unstable_cache((pid: string, start: string, end: string, steps: string) => ga4Funnel(pid, start, end, JSON.parse(steps)), ["ga4-funnel"], { revalidate: 600 });

/** 프로젝트에 연결된 GA4 속성에서 단계별 인원을 읽는다. 속성이 없거나 읽지 못하면 null. 10분 동안 기억해 둔다. */
export async function projectGa4Funnel(projectId: string, start: string, end: string, steps: Ga4FunnelStep[]): Promise<number[] | null> {
  const { data } = await createAdminClient().from("project_integrations").select("ga4_property_id").eq("project_id", projectId).maybeSingle();
  const pid = (data as { ga4_property_id?: string | null } | null)?.ga4_property_id;
  if (!pid || !process.env.GA4_SERVICE_ACCOUNT_JSON) return null;
  const key = JSON.stringify(steps.map(({ name, event, param, value }) => ({ name, event, param, value })));
  return cached(pid, start, end, key).catch(() => null);
}

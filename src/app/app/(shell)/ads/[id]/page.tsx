import { requireProject } from "@/lib/dash/auth";
import { getIntegrations, listAnalyses } from "@/lib/dash/analysis-data";
import { fetchMetaSnapshot, type MetaAccountSnapshot } from "@/lib/integrations/meta";
import AdsClient from "@/components/dash/AdsClient";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export default async function AdsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ preset?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { supabase, project, profile } = await requireProject(id);
  const isStaff = profile.role === "staff";
  const preset = ["last_7d", "last_14d", "last_30d", "last_90d"].includes(sp.preset ?? "") ? sp.preset! : "last_30d";
  const [integ, analyses] = await Promise.all([getIntegrations(supabase, project.id), listAnalyses(supabase, project.id, "ads")]);
  // 광고 계정 스냅샷: 직원에게만 실시간 표시 (고객사는 AI 리포트만)
  let snapshot: MetaAccountSnapshot | null = null, snapError: string | null = null;
  if (isStaff && integ?.meta_ad_account_id) {
    try { snapshot = await fetchMetaSnapshot(integ.meta_ad_account_id, preset); } catch (e) { snapError = (e as Error).message; }
  }
  return <AdsClient project={project} isStaff={isStaff} adAccountId={integ?.meta_ad_account_id ?? null} preset={preset} snapshot={snapshot} snapError={snapError} analyses={analyses} tokenConfigured={!!process.env.META_ACCESS_TOKEN} />;
}

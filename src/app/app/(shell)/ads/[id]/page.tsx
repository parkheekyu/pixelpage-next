import { after } from "next/server";
import { requireProject, getUnreadCounts, markSeen } from "@/lib/dash/auth";
import ProjectNav from "@/components/dash/ProjectNav";
import { getIntegrations, getMetaSnapshot, listAnalyses } from "@/lib/dash/analysis-data";
import { rankWinners, type MetaAccountSnapshot, type MetaGoal } from "@/lib/integrations/meta";
import AdsClient from "@/components/dash/AdsClient";
import ProposalsPanel from "@/components/dash/ProposalsPanel";
import { listProposals } from "@/app/app/proposal-actions";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export default async function AdsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ preset?: string; refresh?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { supabase, project, profile } = await requireProject(id);
  const unread = (await getUnreadCounts())[project.id] ?? {};
  after(() => markSeen(project.id, "ads"));
  const isStaff = profile.role === "staff";
  const preset = ["last_7d", "last_14d", "last_30d", "last_90d"].includes(sp.preset ?? "") ? sp.preset! : "last_30d";
  const [integ, analyses, proposals] = await Promise.all([getIntegrations(supabase, project.id), listAnalyses(supabase, project.id, "ads"), listProposals(project.id)]);
  const goal: MetaGoal = integ?.meta_goal === "purchase" ? "purchase" : "lead";
  // 광고 계정 스냅샷: 직원에게만 실시간 표시 (고객사는 AI 리포트만)
  let snapshot: MetaAccountSnapshot | null = null, snapError: string | null = null, cachedAt: string | null = null;
  if (isStaff && integ?.meta_ad_account_id) {
    try { const r = await getMetaSnapshot(supabase, project.id, integ.meta_ad_account_id, preset, sp.refresh === "1"); snapshot = { ...r.snapshot, winners: rankWinners(r.snapshot, goal) }; cachedAt = r.cached_at; } catch (e) { snapError = (e as Error).message; }
  }
  return <><ProjectNav project={project} isStaff={profile.role === "staff"} unread={unread} />
    <AdsClient project={project} isStaff={isStaff} adAccountId={integ?.meta_ad_account_id ?? null} preset={preset} snapshot={snapshot} snapError={snapError} cachedAt={cachedAt} goal={goal} analyses={analyses} tokenConfigured={!!process.env.META_ACCESS_TOKEN} />
    <ProposalsPanel projectId={project.id} proposals={proposals} isStaff={isStaff} goal={goal} /></>;
}

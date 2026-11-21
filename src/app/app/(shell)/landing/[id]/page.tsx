import { after } from "next/server";
import { requireProject, getUnreadCounts, markSeen } from "@/lib/dash/auth";
import ProjectNav from "@/components/dash/ProjectNav";
import { getIntegrations, listAnalyses } from "@/lib/dash/analysis-data";
import { loadLandingStats } from "@/lib/dash/landing-stats";
import LandingClient from "@/components/dash/LandingClient";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function LandingPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ days?: string; refresh?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, project, profile } = await requireProject(id);
  const unread = (await getUnreadCounts())[project.id] ?? {};
  after(() => markSeen(project.id, "landing"));
  const isStaff = profile.role === "staff";
  const days = [7, 14, 28, 90].includes(Number(sp.days)) ? Number(sp.days) : 28;
  const integ = await getIntegrations(supabase, project.id);
  // 숫자 화면은 직원용. 고객사 계정은 이전에 저장된 리포트만 읽는다.
  const [stats, analyses] = await Promise.all([
    isStaff ? loadLandingStats({ landingUrl: project.landing_url ?? null, ga4PropertyId: integ?.ga4_property_id ?? null, clarityToken: integ?.clarity_api_token ?? null, days }, !!sp.refresh) : Promise.resolve(null),
    isStaff ? Promise.resolve([]) : listAnalyses(supabase, project.id, "landing"),
  ]);
  return <><ProjectNav project={project} isStaff={isStaff} unread={unread} />
    <div className="pg"><LandingClient project={project} isStaff={isStaff} analyses={analyses} stats={stats} days={days} integ={integ ? { ga4_property_id: integ.ga4_property_id, clarity_project_id: integ.clarity_project_id, hasClarityToken: !!integ.clarity_api_token } : null} ga4Configured={!!process.env.GA4_SERVICE_ACCOUNT_JSON} /></div></>;
}

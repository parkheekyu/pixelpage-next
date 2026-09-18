import { requireProject, getUnreadCounts, markSeen } from "@/lib/dash/auth";
import ProjectNav from "@/components/dash/ProjectNav";
import { getIntegrations, listAnalyses } from "@/lib/dash/analysis-data";
import LandingClient from "@/components/dash/LandingClient";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export default async function LandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, project, profile } = await requireProject(id);
  const unread = (await getUnreadCounts())[project.id] ?? {};
  await markSeen(project.id, "landing");
  const isStaff = profile.role === "staff";
  const [integ, analyses] = await Promise.all([getIntegrations(supabase, project.id), listAnalyses(supabase, project.id, "landing")]);
  return <><ProjectNav project={project} isStaff={profile.role === "staff"} unread={unread} />
    <LandingClient project={project} isStaff={isStaff} analyses={analyses} integ={integ ? { ga4_property_id: integ.ga4_property_id, clarity_project_id: integ.clarity_project_id, hasClarityToken: !!integ.clarity_api_token } : null} ga4Configured={!!process.env.GA4_SERVICE_ACCOUNT_JSON} /></>;
}

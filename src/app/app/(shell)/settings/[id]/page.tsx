import { requireProject, requireStaff, getUnreadCounts } from "@/lib/dash/auth";
import { getIntegrations } from "@/lib/dash/analysis-data";
import { googleServiceAccountEmail, hasGoogleServiceAccount } from "@/lib/integrations/ga4";
import ProjectNav from "@/components/dash/ProjectNav";
import SettingsClient from "@/components/dash/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireStaff();
  const { supabase, project } = await requireProject(id);
  const [integ, unread] = await Promise.all([getIntegrations(supabase, project.id), getUnreadCounts()]);
  return (
    <>
      <ProjectNav project={project} isStaff unread={unread[project.id] ?? {}} />
      <SettingsClient project={project} integ={integ} env={{ meta: !!process.env.META_ACCESS_TOKEN, google: hasGoogleServiceAccount(), googleEmail: googleServiceAccountEmail(), siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixelpage.co.kr", slack: !!process.env.SLACK_BOT_TOKEN }} />
    </>
  );
}

import { requireProject } from "@/lib/dash/auth";
import { loadProjectData } from "@/lib/dash/data";
import { buildReport, periodDataDays, REPORT_PERIODS, type ReportPeriod } from "@/lib/dash/report";
import ProjectReport from "@/components/dash/ProjectReport";

export const dynamic = "force-dynamic";

export default async function ProjectReportPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ days?: string; src?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { supabase, project, profile } = await requireProject(id);
  const period = ((REPORT_PERIODS as readonly string[]).includes(sp.days ?? "") ? sp.days : "28") as ReportPeriod;
  const src = sp.src && /^[a-z0-9_-]+$/i.test(sp.src) ? sp.src : "all";
  const data = await loadProjectData(supabase, project, periodDataDays(period));
  return <ProjectReport model={buildReport(data, period, src)} isStaff={profile.role === "staff"} />;
}

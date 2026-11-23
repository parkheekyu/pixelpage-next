import { requireProject } from "@/lib/dash/auth";
import { loadProjectData } from "@/lib/dash/data";
import { buildReport, periodLoadDays, REPORT_PERIODS, type ReportPeriod } from "@/lib/dash/report";
import ProjectReport from "@/components/dash/ProjectReport";

export const dynamic = "force-dynamic";

export default async function ProjectReportPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ days?: string; src?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { supabase, project, profile } = await requireProject(id);
  const period = ((REPORT_PERIODS as readonly string[]).includes(sp.days ?? "") ? sp.days : "28") as ReportPeriod;
  const src = sp.src && /^[a-z0-9_-]+$/i.test(sp.src) ? sp.src : "all";
  // 비교 기간까지 loadProjectData 가 두 배로 읽으므로 필요한 날 수의 절반만 넘긴다 (최대는 전부)
  const data = await loadProjectData(supabase, project, period === "max" ? 3650 : Math.ceil(periodLoadDays(period) / 2));
  return <ProjectReport model={buildReport(data, period, src)} isStaff={profile.role === "staff"} />;
}

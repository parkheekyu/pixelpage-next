import { requireProject } from "@/lib/dash/auth";
import { loadProjectData } from "@/lib/dash/data";
import { buildReport } from "@/lib/dash/report";
import ProjectReport from "@/components/dash/ProjectReport";

export const dynamic = "force-dynamic";

export default async function ProjectReportPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ days?: string; src?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { supabase, project, profile } = await requireProject(id);
  const days = [7, 14, 28, 56].includes(+(sp.days ?? 0)) ? +sp.days! : 28;
  const src = sp.src && /^[a-z0-9_-]+$/i.test(sp.src) ? sp.src : "all";
  const data = await loadProjectData(supabase, project, days);
  return <ProjectReport model={buildReport(data, days, src)} isStaff={profile.role === "staff"} />;
}

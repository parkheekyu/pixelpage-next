import { requireProject } from "@/lib/dash/auth";
import { loadProjectData } from "@/lib/dash/data";
import ProjectReport from "@/components/dash/ProjectReport";

export const dynamic = "force-dynamic";

export default async function ProjectReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, project, profile } = await requireProject(id);
  const data = await loadProjectData(supabase, project, 56);
  return <ProjectReport data={data} isStaff={profile.role === "staff"} now={data.now} />;
}

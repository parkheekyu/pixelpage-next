import { requireProject } from "@/lib/dash/auth";
import { loadProjectData } from "@/lib/dash/data";
import LeadSheet from "@/components/dash/LeadSheet";

export const dynamic = "force-dynamic";

export default async function ProjectSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, project, profile } = await requireProject(id);
  const data = await loadProjectData(supabase, project, 365);
  return <LeadSheet project={project} leads={data.leads} isStaff={profile.role === "staff"} now={data.now} />;
}

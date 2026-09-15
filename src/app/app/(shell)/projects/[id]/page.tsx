import { requireProject } from "@/lib/dash/auth";
import { defaultQuery, queryLeads } from "@/lib/dash/leads-query";
import LeadSheet from "@/components/dash/LeadSheet";

export const dynamic = "force-dynamic";

export default async function ProjectSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, project, profile } = await requireProject(id);
  const initial = await queryLeads(supabase, project.id, defaultQuery());
  return <LeadSheet project={project} initial={initial} isStaff={profile.role === "staff"} />;
}

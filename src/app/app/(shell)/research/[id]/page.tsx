import { requireProject } from "@/lib/dash/auth";
import { listAnalyses } from "@/lib/dash/analysis-data";
import ResearchClient from "@/components/dash/ResearchClient";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export default async function ResearchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, project, profile } = await requireProject(id);
  const [analyses, market] = await Promise.all([listAnalyses(supabase, project.id, "research"), listAnalyses(supabase, project.id, "market")]);
  return <ResearchClient project={project} analyses={analyses} market={market} isStaff={profile.role === "staff"} />;
}

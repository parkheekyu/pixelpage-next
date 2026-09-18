import { after } from "next/server";
import { requireProject, getUnreadCounts, markSeen } from "@/lib/dash/auth";
import ProjectNav from "@/components/dash/ProjectNav";
import { listAnalyses } from "@/lib/dash/analysis-data";
import ResearchClient from "@/components/dash/ResearchClient";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export default async function ResearchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, project, profile } = await requireProject(id);
  const unread = (await getUnreadCounts())[project.id] ?? {};
  after(() => markSeen(project.id, "research"));
  const [analyses, market] = await Promise.all([listAnalyses(supabase, project.id, "research"), listAnalyses(supabase, project.id, "market")]);
  return <><ProjectNav project={project} isStaff={profile.role === "staff"} unread={unread} />
    <ResearchClient project={project} analyses={analyses} market={market} isStaff={profile.role === "staff"} /></>;
}

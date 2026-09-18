import { requireProject, getUnreadCounts, markSeen } from "@/lib/dash/auth";
import ProjectNav from "@/components/dash/ProjectNav";
import ProjectTabs from "@/components/dash/ProjectTabs";

export default async function ProjectLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { project, profile } = await requireProject(id);
  const unread = await getUnreadCounts();
  await markSeen(project.id, "leads");
  return (
    <>
      <ProjectNav project={project} isStaff={profile.role === "staff"} unread={unread[project.id] ?? {}} right={<ProjectTabs id={project.id} isStaff={profile.role === "staff"} />} />
      {children}
    </>
  );
}

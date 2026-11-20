import { after } from "next/server";
import { redirect } from "next/navigation";
import { requireProject, getUnreadCounts, markSeen } from "@/lib/dash/auth";
import ProjectNav from "@/components/dash/ProjectNav";
import ProjectTabs from "@/components/dash/ProjectTabs";

export default async function ProjectLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { project, profile } = await requireProject(id);
  if (!project.is_own) redirect(`/app/research/${project.id}`); // 리드 탭은 자사 프로젝트에만 있다
  const unread = await getUnreadCounts();
  after(() => markSeen(project.id, "leads"));
  return (
    <>
      <ProjectNav project={project} isStaff={profile.role === "staff"} unread={unread[project.id] ?? {}} right={<ProjectTabs id={project.id} isStaff={profile.role === "staff"} />} />
      {children}
    </>
  );
}

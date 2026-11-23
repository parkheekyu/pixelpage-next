import { after } from "next/server";
import { redirect } from "next/navigation";
import { requireProject, getUnreadCounts, markSeen } from "@/lib/dash/auth";
import ProjectNav from "@/components/dash/ProjectNav";
import ProjectTabs from "@/components/dash/ProjectTabs";

export default async function ProjectLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { project, profile } = await requireProject(id);
  if (!project.is_own && !project.has_lead_sheet) redirect(`/app/overview/${project.id}`); // 리드 탭은 자사 프로젝트와 리드 시트를 연결한 고객사에만 있다
  const unread = await getUnreadCounts();
  if (!project.has_lead_sheet) after(() => markSeen(project.id, "leads"));
  return (
    <>
      <ProjectNav project={project} isStaff={profile.role === "staff"} unread={unread[project.id] ?? {}} right={<ProjectTabs id={project.id} isStaff={profile.role === "staff"} />} />
      {children}
    </>
  );
}

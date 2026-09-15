import { requireProject } from "@/lib/dash/auth";
import ProjectTabs from "@/components/dash/ProjectTabs";

export default async function ProjectLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { project, profile } = await requireProject(id);
  return (
    <>
      <header className="ph">
        <h1>{project.name}<small>{project.slug}</small></h1>
        <ProjectTabs id={project.id} isStaff={profile.role === "staff"} />
      </header>
      {children}
    </>
  );
}

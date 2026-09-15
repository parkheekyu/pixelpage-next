import { requireSession, getMyProjects } from "@/lib/dash/auth";
import Sidebar from "@/components/dash/Sidebar";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireSession();
  const projects = await getMyProjects();
  return (
    <div className="pp-shell">
      <Sidebar profile={profile} projects={projects} />
      <main className="pp-main">{children}</main>
    </div>
  );
}

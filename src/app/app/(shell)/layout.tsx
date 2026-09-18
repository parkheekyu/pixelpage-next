import { requireSession, getMyProjects, getUnreadCounts } from "@/lib/dash/auth";
import Sidebar from "@/components/dash/Sidebar";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireSession();
  const [projects, unread] = await Promise.all([getMyProjects(), getUnreadCounts()]);
  return (
    <div className="pp-shell">
      <Sidebar profile={profile} projects={projects} unread={unread} />
      <main className="pp-main">{children}</main>
    </div>
  );
}

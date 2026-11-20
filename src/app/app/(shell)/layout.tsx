import { requireSession, getMyProjects, getUnreadCounts } from "@/lib/dash/auth";
import Sidebar from "@/components/dash/Sidebar";
import TopBar from "@/components/dash/TopBar";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const { profile, supabase } = await requireSession();
  const [projects, unread, { data: logoRows }] = await Promise.all([
    getMyProjects(), getUnreadCounts(),
    supabase.from("clients").select("project_id,logo_url").not("project_id", "is", null).not("logo_url", "is", null), // 직원만 읽힌다 (고객사 계정은 빈 목록)
  ]);
  const logos: Record<string, string> = {};
  for (const r of (logoRows ?? []) as { project_id: string; logo_url: string }[]) logos[r.project_id] = r.logo_url;
  return (
    <div className="pp-shell">
      <Sidebar profile={profile} projects={projects} unread={unread} logos={logos} />
      <div className="pp-main-wrap">
        <TopBar profile={profile} projects={projects} />
        <main className="pp-main">{children}</main>
      </div>
    </div>
  );
}

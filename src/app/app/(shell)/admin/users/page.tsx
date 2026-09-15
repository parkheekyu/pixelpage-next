import { requireStaff, getMyProjects } from "@/lib/dash/auth";
import UsersAdmin from "@/components/dash/UsersAdmin";
import type { Profile } from "@/lib/dash/types";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const { supabase, user } = await requireStaff();
  const projects = await getMyProjects();
  const [{ data: profiles }, { data: members }] = await Promise.all([
    supabase.from("profiles").select("*").order("role").order("created_at", { ascending: false }),
    supabase.from("project_members").select("project_id,user_id"),
  ]);
  return (
    <UsersAdmin
      meId={user.id}
      profiles={(profiles ?? []) as Profile[]}
      projects={projects}
      members={(members ?? []) as { project_id: string; user_id: string }[]}
      canInvite={!!process.env.SUPABASE_SERVICE_ROLE_KEY}
    />
  );
}

import { requireStaff, getMyProjects } from "@/lib/dash/auth";
import { loadAllProjectData } from "@/lib/dash/data";
import AdminOverview from "@/components/dash/AdminOverview";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { supabase } = await requireStaff();
  const projects = await getMyProjects();
  const data = await loadAllProjectData(supabase, projects, 56);
  return <AdminOverview data={data} now={data[0]?.now ?? 0} />;
}

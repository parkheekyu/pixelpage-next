import { requireStaff, getMyProjects } from "@/lib/dash/auth";
import ClientsAdmin from "@/components/dash/ClientsAdmin";
import type { Client } from "@/lib/dash/types";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { supabase } = await requireStaff();
  const [projects, { data, error }] = await Promise.all([
    getMyProjects(),
    supabase.from("clients").select("*").order("status").order("contract_date", { ascending: false, nullsFirst: false }).order("name"),
  ]);
  return <ClientsAdmin clients={(data ?? []) as Client[]} projects={projects} loadError={error?.message ?? null} />;
}

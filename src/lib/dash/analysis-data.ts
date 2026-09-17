import "server-only";
import type { createClient } from "@/lib/supabase/server";
import type { Analysis, AnalysisKind, ProjectIntegrations } from "./types";

type DashClient = Awaited<ReturnType<typeof createClient>>;

/** 연동 정보 (RLS: 직원만 조회 가능 → 고객사는 null) */
export async function getIntegrations(supabase: DashClient, projectId: string): Promise<ProjectIntegrations | null> {
  const { data } = await supabase.from("project_integrations").select("*").eq("project_id", projectId).maybeSingle();
  return (data as ProjectIntegrations | null) ?? null;
}

export async function listAnalyses(supabase: DashClient, projectId: string, kind: AnalysisKind, limit = 10): Promise<Analysis[]> {
  const { data } = await supabase.from("analyses").select("*").eq("project_id", projectId).eq("kind", kind).order("created_at", { ascending: false }).limit(limit);
  return (data ?? []) as Analysis[];
}

import "server-only";
import type { createClient } from "@/lib/supabase/server";
import type { Analysis, AnalysisKind, ProjectIntegrations } from "./types";
import { fetchMetaSnapshot, type MetaAccountSnapshot } from "@/lib/integrations/meta";

type DashClient = Awaited<ReturnType<typeof createClient>>;

/** 연동 정보 (RLS: 직원만 조회 가능 → 고객사는 null) */
export async function getIntegrations(supabase: DashClient, projectId: string): Promise<ProjectIntegrations | null> {
  const { data } = await supabase.from("project_integrations").select("*").eq("project_id", projectId).maybeSingle();
  return (data as ProjectIntegrations | null) ?? null;
}

/** 목록은 메타만, 본문(result_md)은 최신 완료 1건만 포함 (페이지 크기 절감). 나머지는 클릭 시 loadAnalysis 로 조회 */
export async function listAnalyses(supabase: DashClient, projectId: string, kind: AnalysisKind, limit = 10): Promise<Analysis[]> {
  const { data } = await supabase.from("analyses").select("id,project_id,kind,status,title,error,model,created_by,created_at,input").eq("project_id", projectId).eq("kind", kind).order("created_at", { ascending: false }).limit(limit);
  const list = ((data ?? []) as Omit<Analysis, "result_md">[]).map((a) => ({ ...a, result_md: null as string | null }));
  const latest = list.find((a) => a.status === "done");
  if (latest) { const { data: full } = await supabase.from("analyses").select("result_md").eq("id", latest.id).single(); latest.result_md = full?.result_md ?? null; }
  return list as Analysis[];
}

export async function loadAnalysis(supabase: DashClient, id: string): Promise<Analysis | null> {
  const { data } = await supabase.from("analyses").select("*").eq("id", id).maybeSingle();
  return (data as Analysis | null) ?? null;
}

const SNAPSHOT_TTL_MS = 30 * 60 * 1000;

/** Meta 스냅샷: 30분 캐시. refresh=true 면 강제 재조회. 반환값에 캐시 시각 포함 */
export async function getMetaSnapshot(supabase: DashClient, projectId: string, adAccountId: string, preset: string, refresh = false): Promise<{ snapshot: MetaAccountSnapshot; cached_at: string; fresh: boolean }> {
  if (!refresh) {
    const { data } = await supabase.from("meta_snapshots").select("fetched_at,data").eq("project_id", projectId).eq("date_preset", preset).maybeSingle();
    if (data && Date.now() - new Date(data.fetched_at).getTime() < SNAPSHOT_TTL_MS) return { snapshot: data.data as MetaAccountSnapshot, cached_at: data.fetched_at, fresh: false };
  }
  const snapshot = await fetchMetaSnapshot(adAccountId, preset);
  await supabase.from("meta_snapshots").upsert({ project_id: projectId, date_preset: preset, fetched_at: new Date().toISOString(), data: snapshot }, { onConflict: "project_id,date_preset" });
  return { snapshot, cached_at: new Date().toISOString(), fresh: true };
}

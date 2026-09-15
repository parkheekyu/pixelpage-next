import "server-only";
import type { createClient } from "@/lib/supabase/server";

type DashClient = Awaited<ReturnType<typeof createClient>>;
import type { AdSpend, Creative, Lead, Project } from "./types";

export interface ProjectData {
  project: Project;
  leads: Lead[];
  spend: AdSpend[];
  creatives: Creative[];
  /** 서버에서 데이터를 읽은 시각 (집계 기준) */
  now: number;
}

/** 프로젝트 1개의 리드·광고비·소재 (최근 days일 + 이전 비교 구간). RLS 적용 클라이언트로 호출. */
export async function loadProjectData(supabase: DashClient, project: Project, days = 90): Promise<ProjectData> {
  const since = new Date(Date.now() - days * 2 * 86400000).toISOString();
  const [leads, spend, creatives] = await Promise.all([
    supabase.from("leads").select("*").eq("project_id", project.id).gte("submitted_at", since).order("submitted_at", { ascending: false }).limit(5000),
    supabase.from("ad_spend").select("*").eq("project_id", project.id).gte("date", since.slice(0, 10)).limit(20000),
    supabase.from("creatives").select("*").eq("project_id", project.id).order("creative_id"),
  ]);
  return {
    project,
    leads: (leads.data ?? []) as Lead[],
    spend: ((spend.data ?? []) as AdSpend[]).map((s) => ({ ...s, cost: Number(s.cost) })),
    creatives: (creatives.data ?? []) as Creative[],
    now: Date.now(),
  };
}

/** 전체 프로젝트 (직원용) */
export async function loadAllProjectData(supabase: DashClient, projects: Project[], days = 56) {
  return Promise.all(projects.map((p) => loadProjectData(supabase, p, days)));
}

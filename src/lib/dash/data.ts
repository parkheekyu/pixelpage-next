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

const LEAD_COLS = "id,project_id,submitted_at,name,phone,email,message,utm_source,utm_medium,utm_campaign,utm_content,utm_term,landing_id,status,drop_reason,assignee,first_contact_at,consulted_at,converted_on,revenue,pay_type,memo,is_duplicate";
const SPEND_COLS = "id,project_id,date,creative_id,source,impressions,clicks,cost";
const PAGE = 1000; // PostgREST max_rows

/** max_rows(1000) 제한을 넘는 데이터를 range 반복으로 전부 가져온다 */
async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<{ data: unknown; error: unknown }>, cap = 20000): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; from < cap; from += PAGE) {
    const { data } = await build(from, from + PAGE - 1);
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}

/** 프로젝트 1개의 리드·광고비·소재 (최근 days일 + 이전 비교 구간). RLS 적용 클라이언트로 호출. */
export async function loadProjectData(supabase: DashClient, project: Project, days = 28, withPrevious = true): Promise<ProjectData> {
  const span = withPrevious ? days * 2 : days;
  const since = new Date(Date.now() - span * 86400000).toISOString();
  const [leads, spend, creatives] = await Promise.all([
    fetchAll<Lead>((a, b) => supabase.from("leads").select(LEAD_COLS).eq("project_id", project.id).gte("submitted_at", since).order("submitted_at", { ascending: false }).range(a, b)),
    fetchAll<AdSpend>((a, b) => supabase.from("ad_spend").select(SPEND_COLS).eq("project_id", project.id).gte("date", since.slice(0, 10)).order("date").range(a, b)),
    supabase.from("creatives").select("*").eq("project_id", project.id).order("creative_id"),
  ]);
  return {
    project,
    leads,
    spend: spend.map((s) => ({ ...s, cost: Number(s.cost) })),
    creatives: (creatives.data ?? []) as Creative[],
    now: Date.now(),
  };
}

/** 전체 프로젝트 (직원용) */
export async function loadAllProjectData(supabase: DashClient, projects: Project[], days = 28) {
  return Promise.all(projects.map((p) => loadProjectData(supabase, p, days)));
}

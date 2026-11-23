import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { matchHeader, rowToLeadInput, sheetsReadGrid } from "@/lib/integrations/leadsync";
import type { Lead } from "./types";

/**
 * 리드는 구글 시트가 원본이다. 시트를 연결한 프로젝트는 DB 에 리드를 쌓지 않고, 시트를 읽어서 보여 주기만 한다.
 * 수정은 시트에서 한다. 시트는 잠깐(2분) 기억해 두고 다시 쓴다.
 */
export interface SheetGrid { sheetId: string; tab: string; header: string[]; rows: string[][]; fetchedAt: number }

const TTL = 120_000;
const memo = new Map<string, { at: number; grid: Promise<SheetGrid> }>();

/** tab 은 첫 번째 탭(웹훅으로 들어온 리드를 적는 곳), tabs 는 읽어 올 탭 전부. 설정의 탭 이름에 쉼표로 여러 개를 적을 수 있다. */
export async function sheetConfig(projectId: string): Promise<{ sheetId: string; tab: string; tabs: string[] } | null> {
  const { data } = await createAdminClient().from("project_integrations").select("google_sheet_id,google_sheet_tab").eq("project_id", projectId).maybeSingle();
  if (!data?.google_sheet_id) return null;
  const tabs = (data.google_sheet_tab || "리드").split(",").map((t: string) => t.trim()).filter(Boolean);
  return { sheetId: data.google_sheet_id, tab: tabs[0] ?? "리드", tabs: tabs.length ? tabs : ["리드"] };
}

/** 연결된 시트 전체 (머리글 + 행). 연결이 없으면 null. fresh 면 기억해 둔 것을 버리고 다시 읽는다. */
export async function loadSheetGrid(projectId: string, fresh = false): Promise<SheetGrid | null> {
  const cfg = await sheetConfig(projectId);
  if (!cfg) return null;
  const key = `${cfg.sheetId}\n${cfg.tabs.join(",")}`;
  const hit = memo.get(key);
  if (hit && !fresh && Date.now() - hit.at < TTL) return hit.grid;
  const grid = Promise.all(cfg.tabs.map((t) => sheetsReadGrid(cfg.sheetId, t))).then((gs) => ({ sheetId: cfg.sheetId, tab: cfg.tabs.join(", "), ...mergeTabs(cfg.tabs, gs), fetchedAt: Date.now() }));
  memo.set(key, { at: Date.now(), grid });
  grid.catch(() => memo.delete(key)); // 실패는 기억하지 않는다
  return grid;
}

/** 탭이 여럿이면 한 표로 합친다: 맨 앞에 어느 탭에서 왔는지("구분") 열을 붙이고, 열은 머리글 이름으로 맞춘다. */
function mergeTabs(tabs: string[], grids: { header: string[]; rows: string[][] }[]): { header: string[]; rows: string[][] } {
  if (grids.length === 1) return grids[0];
  const header: string[] = [];
  for (const g of grids) for (const h of g.header) if (h.trim() && !header.includes(h)) header.push(h);
  const rows = grids.flatMap((g, gi) => {
    const at = header.map((h) => g.header.indexOf(h));
    return g.rows.filter((r) => r.some((c) => (c ?? "").trim())).map((r) => [tabs[gi], ...at.map((k) => (k >= 0 ? r[k] ?? "" : ""))]);
  });
  return { header: ["구분", ...header], rows };
}

/** 등록일시로 알아볼 수 있는 열의 위치 (없으면 -1) */
export const dateColumn = (header: string[]) => header.findIndex((h) => matchHeader(h) === "등록일시");

/** 시트 행을 집계용 리드로 바꾼다 (전체 개요·성과 리포트·AI 조회). 날짜를 읽을 수 없는 행은 집계에서 빠진다. 연결이 없으면 null. */
export async function sheetLeads(projectId: string): Promise<Lead[] | null> {
  const grid = await loadSheetGrid(projectId);
  if (!grid) return null;
  const out: Lead[] = [];
  grid.rows.forEach((r, i) => {
    if (!r.some((c) => (c ?? "").trim())) return;
    const v = rowToLeadInput(Object.fromEntries(grid.header.map((h, k) => [h, r[k] ?? ""])));
    if (!v.submitted_at) return;
    const phone = v.phone || null;
    out.push({
      id: `row-${i + 2}`, project_id: projectId, submitted_at: v.submitted_at,
      name: v.name || null, phone, phone_norm: phone ? phone.replace(/[^0-9]/g, "") : null, email: v.email || null, message: v.message || null,
      company: v.company || null, industry: v.industry || null, budget: v.budget || null, services: null, marketing_status: null,
      utm_source: (v.utm_source || "unknown").toLowerCase(), utm_medium: null, utm_campaign: v.utm_campaign || null, utm_content: v.utm_content || null, utm_term: null,
      landing_id: v.landing_id || null, landing_url: null,
      status: (v.status || "신규") as Lead["status"], drop_reason: (v.drop_reason || null) as Lead["drop_reason"], assignee: v.assignee || null,
      first_contact_at: null, consulted_at: null, converted_on: v.converted_on ?? null, revenue: v.revenue ?? 0, pay_type: (v.pay_type || null) as Lead["pay_type"],
      memo: v.memo || null, custom: v.by_registration ? { stage_by: "등록 여부" } : {}, manual_order: null, is_duplicate: false, original_lead_id: null, created_at: v.submitted_at, updated_at: v.submitted_at,
    });
  });
  return out;
}

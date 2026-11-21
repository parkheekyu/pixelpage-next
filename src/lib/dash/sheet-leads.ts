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

export async function sheetConfig(projectId: string): Promise<{ sheetId: string; tab: string } | null> {
  const { data } = await createAdminClient().from("project_integrations").select("google_sheet_id,google_sheet_tab").eq("project_id", projectId).maybeSingle();
  return data?.google_sheet_id ? { sheetId: data.google_sheet_id, tab: data.google_sheet_tab || "리드" } : null;
}

/** 연결된 시트 전체 (머리글 + 행). 연결이 없으면 null. fresh 면 기억해 둔 것을 버리고 다시 읽는다. */
export async function loadSheetGrid(projectId: string, fresh = false): Promise<SheetGrid | null> {
  const cfg = await sheetConfig(projectId);
  if (!cfg) return null;
  const key = `${cfg.sheetId}\n${cfg.tab}`;
  const hit = memo.get(key);
  if (hit && !fresh && Date.now() - hit.at < TTL) return hit.grid;
  const grid = sheetsReadGrid(cfg.sheetId, cfg.tab).then((g) => ({ ...cfg, ...g, fetchedAt: Date.now() }));
  memo.set(key, { at: Date.now(), grid });
  grid.catch(() => memo.delete(key)); // 실패는 기억하지 않는다
  return grid;
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
      memo: v.memo || null, custom: {}, manual_order: null, is_duplicate: false, original_lead_id: null, created_at: v.submitted_at, updated_at: v.submitted_at,
    });
  });
  return out;
}

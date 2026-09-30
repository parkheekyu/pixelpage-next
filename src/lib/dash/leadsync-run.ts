import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { airtableCreate, airtableReadAll, leadToRow, matchHeader, rowToLeadInput, sheetsAppend, sheetsHeader, sheetsReadAll, sheetsUpdateCells } from "@/lib/integrations/leadsync";
import { ingestLead } from "@/lib/dash/ingest";
import type { CustomField, Lead } from "@/lib/dash/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = SupabaseClient<any, any, any, any, any>;
export type SyncTarget = "sheets" | "airtable";
export interface SyncResult { ok: boolean; message?: string; error?: string; added?: number; updated?: number; pushed?: number; pushedUpdates?: number }

type Integ = { project_id: string; google_sheet_id: string | null; google_sheet_tab: string | null; airtable_token: string | null; airtable_base_id: string | null; airtable_table: string | null; sync_pull?: boolean | null; sync_push?: boolean | null };
const hasTarget = (integ: Integ, target: SyncTarget) => target === "sheets" ? !!integ.google_sheet_id : !!(integ.airtable_token && integ.airtable_base_id && integ.airtable_table);
/** PostgREST 는 한 번에 최대 1000행만 주므로 전부 받을 때는 나눠서 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQ = any;
async function selectAll<T>(db: Db, table: string, columns: string, filters: (q: AnyQ) => AnyQ): Promise<T[]> {
  const out: T[] = [];
  for (let off = 0; ; off += 1000) { const { data, error } = await filters(db.from(table).select(columns)).range(off, off + 999); if (error) throw new Error(error.message); out.push(...((data ?? []) as T[])); if (!data || data.length < 1000) break; }
  return out;
}
/** 한 번의 자동 동기화에서 추가할 수 있는 최대 건수 (초과하면 중단: 무한 복제 방지) */
const MAX_ADD_PER_PASS = 300;
const keyHash = (label: string) => { let h = 0; for (const ch of label) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return `s_${h.toString(36)}`; };

/** 외부(시트/에어테이블) → 대시보드. 새 행은 리드로 추가, 기존 리드는 대시보드에서 손대지 않았으면 외부 값으로 맞추고, 손댔으면 빈 값만 채운다 */
export async function pullLeads(db: Db, projectId: string, integ: Integ, target: SyncTarget, opts: { maxAdd: number } = { maxAdd: Infinity }): Promise<SyncResult> {
  const tab = integ.google_sheet_tab || "리드";
  const rows = target === "sheets" ? await sheetsReadAll(integ.google_sheet_id!, tab) : await airtableReadAll(integ.airtable_token!, integ.airtable_base_id!, integ.airtable_table!);
  const [existing, { data: proj }, syncRows] = await Promise.all([
    selectAll<AnyQ>(db, "leads", "id,phone_norm,status,revenue,pay_type,custom,converted_on,drop_reason,memo,assignee,updated_at,is_duplicate", (q) => q.eq("project_id", projectId).order("created_at")),
    db.from("projects").select("custom_fields").eq("id", projectId).single(),
    selectAll<AnyQ>(db, "lead_sync", "lead_id,synced_at,external_id", (q) => q.eq("target", target)),
  ]);
  const syncedAt = new Map((syncRows ?? []).map((x) => [x.lead_id as string, new Date(x.synced_at as string).getTime()]));
  const known = new Map<string, AnyQ>(); for (const x of existing) if (!known.has(x.phone_norm as string)) known.set(x.phone_norm as string, x); // 원본(가장 오래된) 우선
  const fields: CustomField[] = [...((proj?.custom_fields ?? []) as CustomField[])]; const fieldCount = fields.length;
  const keyFor = (label: string) => { const f = fields.find((x) => x.label === label); if (f) return f.key; if (fields.length >= 30) return null; const key = keyHash(label); fields.push({ key, label: label.slice(0, 40), type: "text" }); return key; };
  let added = 0, updated = 0, dup = 0, noPhone = 0, skipped = 0, failed = 0, lastErr = "";
  const now = Date.now();
  const seenInSheet = new Set<string>();
  const syncUpserts: { lead_id: string; target: SyncTarget; external_id: string; synced_at: string }[] = [];
  for (const row of rows) {
    const li = rowToLeadInput(row.values);
    const norm = li.phone.replace(/[^0-9]/g, "");
    if (li.lead_id && !known.has(norm)) { skipped++; continue; }
    if (!norm) { noPhone++; continue; }
    if (seenInSheet.has(norm)) { skipped++; continue; } // 시트 안 중복 행은 첫 행만
    seenInSheet.add(norm);
    const custom: Record<string, string> = {};
    for (const [label, v] of Object.entries(li.extra)) { const k = keyFor(label); if (k) custom[k] = v; }
    const patch: Record<string, unknown> = {};
    if (li.status) patch.status = li.status; else if (li.raw_status) { const k = keyFor("상태(원본)"); if (k) custom[k] = li.raw_status; }
    if (li.memo) patch.memo = li.memo; if (li.assignee) patch.assignee = li.assignee;
    if (li.revenue != null) patch.revenue = li.revenue; if (li.pay_type) patch.pay_type = li.pay_type;
    if (li.converted_on) patch.converted_on = li.converted_on; else if (li.status === "전환" && li.submitted_at) patch.converted_on = li.submitted_at.slice(0, 10);
    if (li.drop_reason) patch.drop_reason = li.drop_reason;
    if (Object.keys(custom).length) patch.custom = custom;
    const prev = known.get(norm);
    if (prev) {
      dup++;
      const touched = new Date(prev.updated_at as string).getTime() > (syncedAt.get(prev.id as string) ?? 0) + 2000; // 마지막 동기화 이후 대시보드에서 수정됨
      const fill: Record<string, unknown> = {};
      const pc = (prev.custom ?? {}) as Record<string, unknown>; const nc = { ...pc }; let ch = false;
      if (!touched) {
        // 외부가 최신 → 외부 값으로 맞춤 (외부에 값이 있을 때만)
        for (const k of ["status", "revenue", "pay_type", "converted_on", "drop_reason", "memo", "assignee"] as const) if (patch[k] != null && String(patch[k]) !== String(prev[k] ?? "") && !(k === "revenue" && Number(patch[k]) === Number(prev[k] ?? 0))) fill[k] = patch[k];
        for (const [k, v] of Object.entries(custom)) if (String(pc[k] ?? "") !== v) { nc[k] = v; ch = true; }
      } else {
        if (patch.status && prev.status === "신규") fill.status = patch.status;
        if (patch.revenue != null && !(Number(prev.revenue) > 0)) fill.revenue = patch.revenue;
        if (patch.pay_type && !prev.pay_type) fill.pay_type = patch.pay_type;
        if (patch.converted_on && !prev.converted_on) fill.converted_on = patch.converted_on;
        if (patch.drop_reason && !prev.drop_reason) fill.drop_reason = patch.drop_reason;
        for (const [k, v] of Object.entries(custom)) if (!pc[k]) { nc[k] = v; ch = true; }
      }
      if (ch) fill.custom = nc;
      if (Object.keys(fill).length) { const { error } = await db.from("leads").update(fill).eq("id", prev.id); if (error) { failed++; lastErr = error.message; } else updated++; }
      // 행 번호 기억 + 동기화 시각 (갱신 직후 시각으로: 다음 패스에서 '대시보드가 손댔다'고 오판하지 않게)
      syncUpserts.push({ lead_id: prev.id, target, external_id: row.external_id, synced_at: new Date(Date.now() + 1000).toISOString() });
      continue;
    }
    if (added >= opts.maxAdd) { skipped++; continue; }
    const r = await ingestLead({ project_id: projectId, name: li.name, phone: li.phone, email: li.email, message: li.message, company: li.company, industry: li.industry, budget: li.budget, utm_source: li.utm_source || target, utm_medium: "import", utm_campaign: li.utm_campaign, utm_content: li.utm_content, landing_id: li.landing_id, submitted_at: li.submitted_at });
    if (!r.ok) { skipped++; continue; }
    known.set(norm, { id: r.id, phone_norm: norm, status: "신규", revenue: 0, pay_type: null, custom: {}, converted_on: null, drop_reason: null, memo: null, assignee: null, updated_at: new Date(now).toISOString() }); added++;
    if (Object.keys(patch).length) { const { error } = await db.from("leads").update(patch).eq("id", r.id); if (error) { failed++; lastErr = error.message; } }
    syncUpserts.push({ lead_id: r.id, target, external_id: row.external_id, synced_at: new Date(Date.now() + 1000).toISOString() });
  }
  for (let i = 0; i < syncUpserts.length; i += 500) await db.from("lead_sync").upsert(syncUpserts.slice(i, i + 500));
  if (fields.length !== fieldCount) await db.from("projects").update({ custom_fields: fields }).eq("id", projectId);
  const capped = Number.isFinite(opts.maxAdd) && added >= opts.maxAdd && skipped > 0;
  const detail = [capped ? `자동 동기화 1회 상한 ${opts.maxAdd}건 도달 → 나머지는 다음 회차 또는 설정에서 '가져오기'` : "", dup ? `기존 ${dup}${updated ? ` (변경 반영 ${updated})` : ""}` : "", noPhone ? `연락처 없음 ${noPhone}` : "", skipped ? `기타 ${skipped}` : "", failed ? `갱신 실패 ${failed} (${lastErr.slice(0, 80)})` : ""].filter(Boolean).join(", ");
  const noPhoneCol = rows.length > 0 && !rows.some((x) => rowToLeadInput(x.values).phone);
  return { ok: true, added, updated, message: `${target === "sheets" ? "구글 시트" : "에어테이블"}에서 ${added}건 가져왔습니다.${detail ? ` (${detail})` : ""}${noPhoneCol ? " 연락처 열을 찾지 못했습니다. 헤더에 '연락처' 또는 '전화번호' 열이 있는지 확인하세요." : ""}` };
}

/** 대시보드 → 외부. 아직 내보내지 않은 리드는 추가하고, 시트는 마지막 동기화 이후 바뀐 리드의 셀을 갱신한다 */
export async function pushLeads(db: Db, projectId: string, integ: Integ, target: SyncTarget): Promise<SyncResult> {
  const tab = integ.google_sheet_tab || "리드";
  const [synced, leads, { data: proj }] = await Promise.all([
    selectAll<AnyQ>(db, "lead_sync", "lead_id,external_id,synced_at", (q) => q.eq("target", target)),
    selectAll<Lead>(db, "leads", "*", (q) => q.eq("project_id", projectId).eq("is_duplicate", false).order("submitted_at")),
    db.from("projects").select("custom_fields").eq("id", projectId).single(),
  ]);
  const fields = (proj?.custom_fields ?? []) as CustomField[];
  const syncMap = new Map((synced ?? []).map((x) => [x.lead_id as string, x]));
  const all = (leads ?? []) as Lead[];
  // 그 외부에서 온 리드는 다시 내보내지 않는다 (메아리 방지)
  const todo = all.filter((l) => !syncMap.has(l.id) && !(l.utm_medium === "import" && l.utm_source === target));
  let pushed = 0, pushedUpdates = 0;
  if (target === "airtable") {
    if (!todo.length) return { ok: true, pushed: 0, message: "내보낼 새 리드가 없습니다." };
    const r = await airtableCreate(integ.airtable_token!, integ.airtable_base_id!, integ.airtable_table!, todo);
    await db.from("lead_sync").upsert(todo.map((l) => ({ lead_id: l.id, target, external_id: r.ids[l.id] ?? null, synced_at: new Date().toISOString() })));
    return { ok: true, pushed: r.created, message: `에어테이블로 ${r.created}건 내보냈습니다.` };
  }
  const header = await sheetsHeader(integ.google_sheet_id!, tab);
  if (todo.length) {
    const r = await sheetsAppend(integ.google_sheet_id!, tab, todo, fields);
    await db.from("lead_sync").upsert(todo.map((l, i) => ({ lead_id: l.id, target, external_id: r.startRow ? String(r.startRow + i) : null, synced_at: new Date().toISOString() })));
    pushed = r.appended;
  }
  // 변경분: updated_at > synced_at 인 리드의 매칭 열만 셀 갱신 (행 번호를 아는 경우)
  const cells: { row: number; col: number; value: string }[] = []; const touchedIds: string[] = [];
  const cols = header.map((h) => matchHeader(h));
  const editable = new Set(["상태", "드랍사유", "매출액", "결제구분", "전환일", "담당자", "메모", "이름", "이메일", "연락처"]);
  for (const l of all) {
    const sy = syncMap.get(l.id); if (!sy?.external_id || !/^\d+$/.test(sy.external_id)) continue;
    if (new Date((l as unknown as { updated_at: string }).updated_at).getTime() <= new Date(sy.synced_at as string).getTime() + 2000) continue;
    const m = leadToRow(l) as Record<string, string>; const row = Number(sy.external_id);
    cols.forEach((std, ci) => { if (std && editable.has(std)) cells.push({ row, col: ci, value: m[std] ?? "" }); else if (!std) { const f = fields.find((x) => x.label === header[ci].trim()); if (f) cells.push({ row, col: ci, value: String((l.custom as Record<string, unknown> | undefined)?.[f.key] ?? "") }); } });
    touchedIds.push(l.id);
  }
  if (cells.length) { await sheetsUpdateCells(integ.google_sheet_id!, tab, cells); pushedUpdates = touchedIds.length; const ts = new Date().toISOString(); for (let i = 0; i < touchedIds.length; i += 500) await db.from("lead_sync").update({ synced_at: ts }).in("lead_id", touchedIds.slice(i, i + 500)).eq("target", target); }
  return { ok: true, pushed, pushedUpdates, message: `구글 시트로 새 리드 ${pushed}건 내보냈고 ${pushedUpdates}건을 갱신했습니다.` };
}

export async function runLeadSync(db: Db, projectId: string, target: SyncTarget, direction: "push" | "pull"): Promise<SyncResult> {
  const { data: integ } = await db.from("project_integrations").select("*").eq("project_id", projectId).maybeSingle();
  if (!integ) return { ok: false, error: "연동 설정이 없습니다." };
  if (!hasTarget(integ as Integ, target)) return { ok: false, error: target === "sheets" ? "구글 시트 ID를 먼저 저장하세요." : "에어테이블 토큰·베이스·테이블을 먼저 저장하세요." };
  try { return direction === "pull" ? await pullLeads(db, projectId, integ as Integ, target) : await pushLeads(db, projectId, integ as Integ, target); }
  catch (e) { return { ok: false, error: (e as Error).message }; }
}

/** 연동된 모든 고객사: 가져오기 → 내보내기 (워커가 주기적으로 호출) */
export async function runAllLeadSync(db: Db): Promise<{ project_id: string; target: SyncTarget; pull?: SyncResult; push?: SyncResult }[]> {
  const { data: integs } = await db.from("project_integrations").select("*");
  const out: { project_id: string; target: SyncTarget; pull?: SyncResult; push?: SyncResult }[] = [];
  for (const integ of (integs ?? []) as Integ[]) {
    for (const target of ["sheets", "airtable"] as SyncTarget[]) {
      if (!hasTarget(integ, target)) continue;
      const r: { project_id: string; target: SyncTarget; pull?: SyncResult; push?: SyncResult } = { project_id: integ.project_id, target };
      if (integ.sync_pull !== false) { try { r.pull = await pullLeads(db, integ.project_id, integ, target, { maxAdd: MAX_ADD_PER_PASS }); } catch (e) { r.pull = { ok: false, error: (e as Error).message }; } }
      if (integ.sync_push === true) { try { r.push = await pushLeads(db, integ.project_id, integ, target); } catch (e) { r.push = { ok: false, error: (e as Error).message }; } }
      if (r.pull || r.push) out.push(r);
    }
  }
  return out;
}

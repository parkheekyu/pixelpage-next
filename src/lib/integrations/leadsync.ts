import "server-only";
import { googleAccessToken } from "./ga4";
import type { Lead } from "@/lib/dash/types";

/** 리드 ↔ 구글 시트 / 에어테이블. 열 이름은 한국어 고정 (양쪽 동일) */
export const COLUMNS = ["리드ID", "등록일시", "이름", "연락처", "이메일", "문의내용", "회사", "업종", "예산", "유입매체", "캠페인", "소재", "랜딩", "상태", "드랍사유", "매출액", "결제구분", "전환일", "담당자", "메모"] as const;
type Col = (typeof COLUMNS)[number];

const kst = (iso: string) => new Date(iso).toLocaleString("sv-SE", { timeZone: "Asia/Seoul" }).replace("T", " ").slice(0, 16);
export function leadToRow(l: Lead): Record<Col, string> {
  return { "리드ID": l.id, "등록일시": kst(l.submitted_at), "이름": l.name ?? "", "연락처": l.phone ?? "", "이메일": l.email ?? "", "문의내용": l.message ?? "", "회사": l.company ?? "", "업종": l.industry ?? "", "예산": l.budget ?? "", "유입매체": l.utm_source ?? "", "캠페인": l.utm_campaign ?? "", "소재": l.utm_content ?? "", "랜딩": l.landing_id ?? "", "상태": l.status, "드랍사유": l.drop_reason ?? "", "매출액": l.revenue ? String(l.revenue) : "", "결제구분": l.pay_type ?? "", "전환일": l.converted_on ?? "", "담당자": l.assignee ?? "", "메모": l.memo ?? "" };
}
/** 외부 행 → 리드 입력 (헤더 이름 기준, 없는 열은 무시) */
export interface ExternalRow { external_id: string; values: Record<string, string> }
export function rowToLeadInput(r: Record<string, string>) {
  const g = (k: string) => (r[k] ?? "").toString().trim();
  return { name: g("이름"), phone: g("연락처"), email: g("이메일"), message: g("문의내용"), company: g("회사"), industry: g("업종"), budget: g("예산"), utm_source: g("유입매체"), utm_campaign: g("캠페인"), utm_content: g("소재"), landing_id: g("랜딩"), submitted_at: g("등록일시") ? new Date(g("등록일시").replace(" ", "T") + "+09:00").toISOString() : undefined, memo: g("메모"), assignee: g("담당자"), status: g("상태"), lead_id: g("리드ID") };
}

// ---------- Google Sheets ----------
const SHEETS = "https://sheets.googleapis.com/v4/spreadsheets";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const enc = (s: string) => encodeURIComponent(s);

async function sheetsFetch(path: string, init?: RequestInit) {
  const token = await googleAccessToken(SCOPE);
  const r = await fetch(`${SHEETS}/${path}`, { ...init, headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...(init?.headers ?? {}) }, signal: AbortSignal.timeout(30000) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Google Sheets: ${(j as { error?: { message?: string } }).error?.message ?? r.status}`);
  return j;
}
export async function sheetsEnsureHeader(sheetId: string, tab: string) {
  const j = (await sheetsFetch(`${sheetId}/values/${enc(`${tab}!1:1`)}`)) as { values?: string[][] };
  const first = j.values?.[0] ?? [];
  if (first.length === 0) await sheetsFetch(`${sheetId}/values/${enc(`${tab}!A1`)}?valueInputOption=RAW`, { method: "PUT", body: JSON.stringify({ values: [[...COLUMNS]] }) });
  return first.length ? first : [...COLUMNS];
}
export async function sheetsAppend(sheetId: string, tab: string, leads: Lead[]): Promise<{ appended: number; startRow: number }> {
  const header = await sheetsEnsureHeader(sheetId, tab);
  const rows = leads.map((l) => { const m = leadToRow(l); return header.map((h) => (m as Record<string, string>)[h] ?? ""); });
  if (!rows.length) return { appended: 0, startRow: 0 };
  const j = (await sheetsFetch(`${sheetId}/values/${enc(`${tab}!A:A`)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, { method: "POST", body: JSON.stringify({ values: rows }) })) as { updates?: { updatedRange?: string } };
  const m = j.updates?.updatedRange?.match(/!A(\d+)/);
  return { appended: rows.length, startRow: m ? Number(m[1]) : 0 };
}
export async function sheetsReadAll(sheetId: string, tab: string): Promise<ExternalRow[]> {
  const j = (await sheetsFetch(`${sheetId}/values/${enc(`${tab}!A:Z`)}`)) as { values?: string[][] };
  const [header, ...rows] = j.values ?? [];
  if (!header) return [];
  return rows.map((r, i) => ({ external_id: String(i + 2), values: Object.fromEntries(header.map((h, k) => [h, r[k] ?? ""])) }));
}

// ---------- Airtable ----------
const AT = "https://api.airtable.com/v0";
async function atFetch(token: string, path: string, init?: RequestInit) {
  const r = await fetch(`${AT}/${path}`, { ...init, headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...(init?.headers ?? {}) }, signal: AbortSignal.timeout(30000) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Airtable: ${(j as { error?: { message?: string } | string }).error && typeof (j as { error?: unknown }).error === "object" ? ((j as { error: { message?: string } }).error.message ?? r.status) : r.status}`);
  return j;
}
export async function airtableCreate(token: string, baseId: string, table: string, leads: Lead[]): Promise<{ created: number; ids: Record<string, string> }> {
  const ids: Record<string, string> = {}; let created = 0;
  for (let i = 0; i < leads.length; i += 10) {
    const chunk = leads.slice(i, i + 10);
    const j = (await atFetch(token, `${baseId}/${enc(table)}`, { method: "POST", body: JSON.stringify({ records: chunk.map((l) => ({ fields: Object.fromEntries(Object.entries(leadToRow(l)).filter(([, v]) => v !== "")) })), typecast: true }) })) as { records?: { id: string; fields: { 리드ID?: string } }[] };
    for (const rec of j.records ?? []) { if (rec.fields.리드ID) ids[rec.fields.리드ID] = rec.id; created++; }
  }
  return { created, ids };
}
export async function airtableReadAll(token: string, baseId: string, table: string): Promise<ExternalRow[]> {
  const out: ExternalRow[] = []; let offset: string | undefined;
  do {
    const j = (await atFetch(token, `${baseId}/${enc(table)}?pageSize=100${offset ? `&offset=${offset}` : ""}`)) as { records?: { id: string; fields: Record<string, unknown> }[]; offset?: string };
    for (const r of j.records ?? []) out.push({ external_id: r.id, values: Object.fromEntries(Object.entries(r.fields).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")])) });
    offset = j.offset;
  } while (offset && out.length < 5000);
  return out;
}

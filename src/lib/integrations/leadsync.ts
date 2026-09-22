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
/** 외부 행 → 리드 입력. 헤더 이름은 별칭을 넓게 인식하고(전화번호=연락처 등), 매칭 안 된 열은 extra 로 돌려준다 */
export interface ExternalRow { external_id: string; values: Record<string, string> }
const ALIASES: Record<string, string[]> = {
  "리드ID": ["리드id", "lead_id", "leadid"],
  "등록일시": ["등록일시", "등록일", "일시", "날짜", "신청일", "신청일시", "제출일", "제출일시", "접수일", "접수일시", "timestamp", "date", "created", "created_at", "타임스탬프"],
  "이름": ["이름", "성함", "성명", "고객명", "신청자", "name", "이름(성함)"],
  "연락처": ["연락처", "전화번호", "전화", "휴대폰", "휴대폰번호", "핸드폰", "핸드폰번호", "폰번호", "phone", "mobile", "tel", "번호"],
  "이메일": ["이메일", "메일", "email", "e-mail", "이메일주소"],
  "문의내용": ["문의내용", "문의", "내용", "메시지", "상담내용", "message", "요청사항"],
  "회사": ["회사", "회사명", "업체", "업체명", "브랜드", "company"],
  "업종": ["업종", "분야", "industry"],
  "예산": ["예산", "광고예산", "월예산", "budget"],
  "유입매체": ["유입매체", "매체", "유입경로", "소스", "source", "utm_source"],
  "캠페인": ["캠페인", "campaign", "utm_campaign"],
  "소재": ["소재", "광고소재", "utm_content", "content"],
  "랜딩": ["랜딩", "랜딩페이지", "landing"],
  "상태": ["상태", "진행상태", "처리상태", "status"],
  "드랍사유": ["드랍사유", "취소사유", "이탈사유", "실패사유", "사유"],
  "매출액": ["매출액", "매출", "결제금액", "금액", "계약금액", "revenue", "amount"],
  "결제구분": ["결제구분", "결제상태", "결제단계"],
  "전환일": ["전환일", "결제일", "계약일", "구매일", "전환일시", "결제일시"],
  "담당자": ["담당자", "담당", "assignee"],
  "메모": ["메모", "비고", "note", "notes", "memo"],
};
const normKey = (s: string) => s.toLowerCase().replace(/[\s_\-()/.:]/g, "");
export function matchHeader(h: string): string | null {
  const n = normKey(h); if (!n) return null;
  for (const [std, list] of Object.entries(ALIASES)) if (list.some((a) => normKey(a) === n)) return std;
  return null;
}
function parseDate(v: string): string | undefined {
  const t = v.trim(); if (!t) return undefined;
  let m = t.match(/(\d{4})[.\-/년]\s*(\d{1,2})[.\-/월]\s*(\d{1,2})[일]?(?:[\sT]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  // 두 자리 연도 (26.08.13 18:34, 26-8-5)
  if (!m) { const m2 = t.match(/^(\d{2})[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})\.?(?:[\sT]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/); if (m2) m = [m2[0], "20" + m2[1], m2[2], m2[3], m2[4], m2[5], m2[6]] as unknown as RegExpMatchArray; }
  if (m) { const iso = `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}T${(m[4] ?? "0").padStart(2, "0")}:${m[5] ?? "00"}:${m[6] ?? "00"}+09:00`; const d = new Date(iso); return isNaN(d.getTime()) ? undefined : d.toISOString(); }
  const d = new Date(t); return isNaN(d.getTime()) ? undefined : d.toISOString();
}
/** 외부 상태 문구를 우리 상태로 (결제·구매·완료 → 전환, 취소·환불 → 드랍 …) */
export function mapStatus(v: string): string {
  const t = v.trim(); if (!t) return "";
  if (["신규", "연락중", "상담완료", "전환", "드랍"].includes(t)) return t;
  if (/환불|취소|드랍|드롭|이탈|실패|거절|노쇼/.test(t)) return "드랍";
  if (/결제|구매|전환|계약|입금|완료|확정|성공/.test(t)) return "전환";
  if (/상담|연락|통화|진행|대기/.test(t)) return "연락중";
  return "";
}
const EMPTY = new Set(["-", "—", "–", "없음", "n/a", "na", "null", "x", "X", "."]);
const clean = (v: unknown) => { const t = (v ?? "").toString().trim(); return EMPTY.has(t) ? "" : t; };
const DROPS = ["부재", "노쇼", "가격", "타상품", "자격미달", "관심없음", "허위정보", "중복"];
/** 자유 문구 드랍 사유 → 허용 값. 못 맞추면 "" (원문은 extra 로 보존) */
export function mapDropReason(v: string): string {
  const t = v.trim(); if (!t) return "";
  if (DROPS.includes(t)) return t;
  if (/부재|연락안|응답없|전화안/.test(t)) return "부재"; if (/노쇼|불참|미방문/.test(t)) return "노쇼"; if (/가격|비싸|비용|예산/.test(t)) return "가격";
  if (/타사|타상품|경쟁|다른곳|다른 곳/.test(t)) return "타상품"; if (/자격|조건|미달|불가/.test(t)) return "자격미달"; if (/관심|변심|필요없|단순/.test(t)) return "관심없음";
  if (/허위|가짜|장난|스팸/.test(t)) return "허위정보"; if (/중복/.test(t)) return "중복";
  return "";
}
export function rowToLeadInput(r: Record<string, string>) {
  const std: Record<string, string> = {}; const extra: Record<string, string> = {};
  for (const [h, v] of Object.entries(r)) { const k = matchHeader(h); const val = clean(v); if (k) { if (!std[k]) std[k] = val; } else if (h.trim() && val) extra[h.trim()] = val; }
  const g = (k: string) => std[k] ?? "";
  const revenueNum = Number(g("매출액").replace(/[^0-9.]/g, ""));
  const pay = g("결제구분"); const stRaw = g("상태"); const status = mapStatus(stRaw);
  let payType = ["결제확정", "예약금", "가계약", "환불"].find((p) => pay.includes(p)) ?? "";
  if (!payType) { if (/환불/.test(stRaw + pay)) payType = "환불"; else if (/가계약/.test(stRaw + pay)) payType = "가계약"; else if (/예약금|계약금|보증금/.test(stRaw + pay)) payType = "예약금"; else if (status === "전환" && (revenueNum > 0 || /결제|입금|구매|완료|확정/.test(stRaw))) payType = "결제확정"; }
  return { name: g("이름"), phone: g("연락처"), email: g("이메일"), message: g("문의내용"), company: g("회사"), industry: g("업종"), budget: g("예산"), utm_source: g("유입매체"), utm_campaign: g("캠페인"), utm_content: g("소재"), landing_id: g("랜딩"), submitted_at: parseDate(g("등록일시")), memo: g("메모"), assignee: g("담당자"), status, raw_status: stRaw, lead_id: g("리드ID"),
    revenue: g("매출액") && !isNaN(revenueNum) ? Math.round(revenueNum) : null, pay_type: payType, converted_on: parseDate(g("전환일"))?.slice(0, 10) ?? null, drop_reason: mapDropReason(g("드랍사유")), extra: { ...extra, ...(g("드랍사유") && !mapDropReason(g("드랍사유")) ? { "드랍사유(원본)": g("드랍사유") } : {}) } };
}

// ---------- Google Sheets ----------
const SHEETS = "https://sheets.googleapis.com/v4/spreadsheets";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const enc = (s: string) => encodeURIComponent(s);
/** 탭 이름은 항상 따옴표로 감싼다 (한글·공백·특수문자 대비). A1 표기: '탭'!A:Z */
const rangeOf = (tab: string, a1: string) => `'${tab.replace(/'/g, "''")}'!${a1}`;

async function sheetsFetch(path: string, init?: RequestInit) {
  const token = await googleAccessToken(SCOPE);
  const r = await fetch(`${SHEETS}/${path}`, { ...init, headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...(init?.headers ?? {}) }, signal: AbortSignal.timeout(30000) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = (j as { error?: { message?: string } }).error?.message ?? String(r.status);
    // 탭이 없을 때 구글은 "Unable to parse range" 를 돌려준다 → 실제 탭 목록을 알려 준다
    if (/Unable to parse range/i.test(msg)) {
      const sheetId = path.split("/")[0];
      try {
        const meta = (await (await fetch(`${SHEETS}/${sheetId}?fields=sheets.properties.title`, { headers: { authorization: `Bearer ${token}` } })).json()) as { sheets?: { properties: { title: string } }[] };
        const tabs = (meta.sheets ?? []).map((x) => x.properties.title);
        throw new Error(`Google Sheets: 그 이름의 탭이 없습니다. 이 시트의 탭: ${tabs.map((t) => `"${t}"`).join(", ") || "(없음)"} — 설정의 "탭 이름"을 시트 아래쪽 탭 이름과 똑같이 맞춰 주세요.`);
      } catch (e) { if ((e as Error).message.startsWith("Google Sheets:")) throw e; }
    }
    if (r.status === 403) throw new Error(`Google Sheets: 접근 권한 없음 — 시트를 서비스 계정 이메일에게 편집자로 공유했는지 확인하세요. (${msg})`);
    if (r.status === 404) throw new Error(`Google Sheets: 시트를 찾을 수 없음 — 시트 주소(ID)를 확인하세요. (${msg})`);
    throw new Error(`Google Sheets: ${msg}`);
  }
  return j;
}
export async function sheetsEnsureHeader(sheetId: string, tab: string) {
  const j = (await sheetsFetch(`${sheetId}/values/${enc(rangeOf(tab, "1:1"))}`)) as { values?: string[][] };
  const first = j.values?.[0] ?? [];
  if (first.length === 0) await sheetsFetch(`${sheetId}/values/${enc(rangeOf(tab, "A1"))}?valueInputOption=RAW`, { method: "PUT", body: JSON.stringify({ values: [[...COLUMNS]] }) });
  return first.length ? first : [...COLUMNS];
}
export async function sheetsAppend(sheetId: string, tab: string, leads: Lead[]): Promise<{ appended: number; startRow: number }> {
  const header = await sheetsEnsureHeader(sheetId, tab);
  const rows = leads.map((l) => { const m = leadToRow(l); return header.map((h) => (m as Record<string, string>)[h] ?? ""); });
  if (!rows.length) return { appended: 0, startRow: 0 };
  const j = (await sheetsFetch(`${sheetId}/values/${enc(rangeOf(tab, "A:A"))}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, { method: "POST", body: JSON.stringify({ values: rows }) })) as { updates?: { updatedRange?: string } };
  const m = j.updates?.updatedRange?.match(/!A(\d+)/);
  return { appended: rows.length, startRow: m ? Number(m[1]) : 0 };
}
export async function sheetsReadAll(sheetId: string, tab: string): Promise<ExternalRow[]> {
  const j = (await sheetsFetch(`${sheetId}/values/${enc(rangeOf(tab, "A:Z"))}`)) as { values?: string[][] };
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

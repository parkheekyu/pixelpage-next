import { requireProject } from "@/lib/dash/auth";
import { defaultQuery, queryLeads } from "@/lib/dash/leads-query";
import { dateColumn, loadSheetGrid } from "@/lib/dash/sheet-leads";
import { parseDate } from "@/lib/integrations/leadsync";
import LeadSheet from "@/components/dash/LeadSheet";
import SheetLeads from "@/components/dash/SheetLeads";

export const dynamic = "force-dynamic";
const MAX_ROWS = 5000; // 화면에 보내는 최대 행 수 (최신순)

/** 시트 값을 읽기 좋게: UTC 로 적힌 시각(…Z)은 한국 시간으로, ["a","b"] 같은 목록은 "a, b" 로 */
function pretty(v: string, isDate: boolean): string {
  const t = v.trim();
  if (isDate && /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(t)) { const d = new Date(t); if (!isNaN(d.getTime())) return new Date(d.getTime() + 9 * 3600_000).toISOString().slice(0, 16).replace("T", " "); }
  if (t.startsWith("[\"") && t.endsWith("]")) { try { const a = JSON.parse(t); if (Array.isArray(a) && a.every((x) => typeof x === "string")) return a.join(", "); } catch {} }
  return v;
}

export default async function ProjectSheetPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ r?: string }> }) {
  const { id } = await params;
  const { supabase, project, profile } = await requireProject(id);
  // 리드 시트를 연결한 프로젝트: 시트를 읽어서 보여 주기만 한다 (수정은 시트에서)
  if (project.has_lead_sheet) {
    try {
      const grid = await loadSheetGrid(project.id, !!(await searchParams).r);
      if (grid) {
        const dc = dateColumn(grid.header);
        // 내용이 있는 열만 남기고, 날짜를 읽을 수 있으면 최신순으로
        const keep = grid.header.map((h, k) => k).filter((k) => grid.header[k].trim() || grid.rows.some((r) => (r[k] ?? "").trim()));
        const all = grid.rows.map((r, i) => ({ n: i + 2, t: dc >= 0 ? (Date.parse(parseDate(r[dc] ?? "") ?? "") || 0) : 0, c: keep.map((k) => pretty(r[k] ?? "", k === dc)) })).filter((r) => r.c.some((v) => v.trim()));
        all.sort((a, b) => (dc >= 0 ? b.t - a.t : 0) || b.n - a.n);
        return <SheetLeads header={keep.map((k) => grid.header[k] || `열 ${k + 1}`)} rows={all.slice(0, MAX_ROWS)} total={all.length} hasDate={dc >= 0} dateIndex={keep.indexOf(dc)} sheetUrl={`https://docs.google.com/spreadsheets/d/${grid.sheetId}`} tab={grid.tab} fetchedAt={grid.fetchedAt} />;
      }
    } catch (e) {
      return <div className="msg err">리드 시트를 읽지 못했습니다. {(e as Error).message}{profile.role === "staff" && " 설정 탭의 Google Sheets 연결을 확인해 주세요."}</div>;
    }
  }
  const initial = await queryLeads(supabase, project.id, defaultQuery());
  return <LeadSheet project={project} initial={initial} isStaff={profile.role === "staff"} />;
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import DateRangePicker from "./DateRangePicker";
import { AlignLeft, ArrowUpDown, Banknote, Briefcase, Building2, Calendar, ChevronDown, Filter, LayoutGrid, Mail, Megaphone, Phone, PiggyBank, Plus, Radar, Table2, UserRound, UserRoundCog, type LucideIcon } from "lucide-react";
import { fetchLeadsPage, setAssignee, updateLead } from "@/app/app/actions";
import { fmtN, fmtW, pct } from "@/lib/dash/agg";
import { defaultQuery, PAGE_LIMIT, type LeadPage, type LeadQuery, type SheetSort, type SheetView } from "@/lib/dash/leads-types";
import { DROPS, PAYS, STATUSES, type Lead, type LeadPatch, type Project } from "@/lib/dash/types";
import { SourcePill } from "./charts";


// 열 정의 (key, 라벨, 기본 너비). 너비는 드래그로 조절, localStorage 에 저장
const COLS: { key: string; label: string; w: number; ic: LucideIcon; staff?: boolean; ifAny?: keyof Lead }[] = [
  { key: "name", label: "이름", w: 120, ic: UserRound }, { key: "ts", label: "등록일", w: 140, ic: Calendar }, { key: "phone", label: "연락처", w: 130, ic: Phone },
  { key: "email", label: "이메일", w: 160, ic: Mail },
  { key: "company", label: "회사·브랜드", w: 140, ic: Building2, ifAny: "company" }, { key: "industry", label: "업종", w: 130, ic: Briefcase, ifAny: "industry" }, { key: "budget", label: "월 광고 예산", w: 140, ic: PiggyBank, ifAny: "budget" },
  { key: "services", label: "관심 서비스", w: 180, ic: LayoutGrid, ifAny: "services" }, { key: "marketing_status", label: "현재 마케팅", w: 140, ic: Radar, ifAny: "marketing_status" },
  { key: "message", label: "문의내용", w: 240, ic: AlignLeft }, { key: "src", label: "유입매체", w: 100, ic: Megaphone },
  { key: "content", label: "소재", w: 120, ic: LayoutGrid, staff: true }, { key: "assignee", label: "담당자", w: 100, ic: UserRoundCog, staff: true },
  { key: "status", label: "상태", w: 110, ic: ChevronDown }, { key: "revenue", label: "매출액", w: 130, ic: Banknote }, { key: "pay", label: "결제구분", w: 110, ic: ChevronDown },
  { key: "conv", label: "전환일", w: 140, ic: Calendar }, { key: "drop", label: "드랍사유", w: 120, ic: ChevronDown }, { key: "memo", label: "메모", w: 220, ic: AlignLeft },
];
const NUM_W = 44;
const WIDTH_KEY = "leadSheetColWidths";
const VIEWS: [SheetView, string][] = [["all", "전체 리드"], ["todo", "처리 필요 (신규·연락중)"], ["conv", "전환 리드"], ["need", "매출 미입력"], ["drop", "드랍"], ["dup", "중복"]];
const pad = (n: number) => String(n).padStart(2, "0");
const fmtTs = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const today = () => new Date().toISOString().slice(0, 10);

export default function LeadSheet({ project, initial, isStaff }: { project: Project; initial: LeadPage; isStaff: boolean }) {
  const [query, setQuery] = useState<LeadQuery>(() => defaultQuery());
  const [page, setPage] = useState<LeadPage>(initial);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<string | null>(null), [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [memoDraft, setMemoDraft] = useState<Record<string, string>>({});
  const [revDraft, setRevDraft] = useState<Record<string, string>>({});
  const first = useRef(true);
  const seq = useRef(0);
  // 폼 항목 열은 현재 페이지에 값이 하나라도 있을 때만 표시 (광고 리드만 있는 고객사 시트는 숨김)
  const cols = COLS.filter((c) => (!c.staff || isStaff) && (!c.ifAny || page.rows.some((r) => r[c.ifAny!])));
  const [widths, setWidths] = useState<Record<string, number>>(() => Object.fromEntries(COLS.map((c) => [c.key, c.w])));
  useEffect(() => {
    // 하이드레이션 후 저장된 너비 적용 (동기 setState 회피)
    const t = setTimeout(() => { try { const v = JSON.parse(localStorage.getItem(WIDTH_KEY) || "{}"); if (v && typeof v === "object") setWidths((w) => ({ ...w, ...v })); } catch {} }, 0);
    return () => clearTimeout(t);
  }, []);
  const startResize = (key: string, e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX, startW = widths[key];
    const move = (ev: PointerEvent) => setWidths((w) => ({ ...w, [key]: Math.max(60, Math.min(600, startW + ev.clientX - startX)) }));
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); setWidths((w) => { try { localStorage.setItem(WIDTH_KEY, JSON.stringify(w)); } catch {} return w; }); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  const tableW = NUM_W + cols.reduce((a, c) => a + widths[c.key], 0);

  // 필터가 바뀌면 서버에서 다시 조회 (검색어는 250ms 디바운스)
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const id = ++seq.current;
    const t = setTimeout(async () => {
      setLoading(true);
      const r = await fetchLeadsPage(project.id, query);
      if (id !== seq.current) return;
      setLoading(false);
      if ("error" in r) { setErr(r.error); return; }
      setPage((cur) => (query.offset > 0 ? { ...r, rows: [...cur.rows, ...r.rows] } : r));
    }, query.q ? 250 : 0);
    return () => clearTimeout(t);
  }, [query, project.id]);

  const set = (patch: Partial<LeadQuery>) => setQuery((q) => ({ ...q, ...patch, offset: 0 }));
  const more = () => setQuery((q) => ({ ...q, offset: page.rows.length }));
  const { summary: S, rows, total } = page;

  function save(l: Lead, patch: LeadPatch) {
    const before = page.rows;
    const local: Partial<Lead> = { ...patch };
    if (patch.status && patch.status !== "전환") { local.revenue = 0; local.pay_type = null; local.converted_on = null; }
    if (patch.status && patch.status !== "드랍") local.drop_reason = null;
    if (patch.status === "전환") { local.pay_type = l.pay_type ?? "결제확정"; local.converted_on = l.converted_on ?? today(); }
    setPage((p) => ({ ...p, rows: p.rows.map((x) => (x.id === l.id ? { ...x, ...local } : x)) }));
    start(async () => {
      setErr(null);
      const r = await updateLead(project.id, l.id, patch);
      if (!r.ok) { setPage((p) => ({ ...p, rows: before })); setErr(r.error); return; }
      setSaved(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      // 요약 숫자 갱신 (상태 변경 시)
      if (patch.status !== undefined || patch.revenue !== undefined || patch.pay_type !== undefined) {
        const fresh = await fetchLeadsPage(project.id, { ...query, limit: 1, offset: 0 });
        if (!("error" in fresh)) setPage((p) => ({ ...p, summary: fresh.summary }));
      }
    });
  }
  function saveAssignee(l: Lead, v: string) {
    setPage((p) => ({ ...p, rows: p.rows.map((x) => (x.id === l.id ? { ...x, assignee: v || null } : x)) }));
    start(async () => { const r = await setAssignee(project.id, l.id, v || null); if (!r.ok) setErr(r.error); });
  }
  const revText = (l: Lead) => revDraft[l.id] ?? (l.revenue ? "₩" + Number(l.revenue).toLocaleString("ko-KR") : "");

  return (
    <div className="sheet-app">
      <div className="bar">
        <h2>리드 DB</h2>
        <div className="sp" />
        <div className="stat">
          <span>리드 <b>{fmtN(S.all)}</b></span>
          <span>전환 <b>{S.conv}</b> ({pct(S.conv, S.all)})</span>
          <span>확정 매출 <b>{fmtW(S.revenue)}</b></span>
          <span style={{ color: S.need ? "var(--warn)" : "inherit" }}>매출 미입력 <b>{S.need}</b></span>
        </div>
      </div>
      <div className="toolbar">
        <label className="tb"><Filter className="ico" aria-hidden /> 상태 <select value={query.status} onChange={(e) => set({ status: e.target.value })}><option value="">전체</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="tb"><Filter className="ico" aria-hidden /> 매체 <select value={query.src} onChange={(e) => set({ src: e.target.value })}><option value="">전체</option>{page.sources.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="tb"><ArrowUpDown className="ico" aria-hidden /> 정렬 <select value={query.sort} onChange={(e) => set({ sort: e.target.value as SheetSort })}><option value="ts_desc">등록일 최신순</option><option value="ts_asc">등록일 오래된순</option><option value="status">상태순</option><option value="rev_desc">매출액 높은순</option></select></label>
        <DateRangePicker value={{ from: query.from, to: query.to }} onChange={(r) => set(r)} />
        <div className="search"><input type="text" placeholder="이름, 연락처 검색" value={query.q} onChange={(e) => set({ q: e.target.value })} /></div>
      </div>
      <div className="main">
        <aside className="views">
          <h4>뷰</h4>
          {VIEWS.map(([v, label]) => <button key={v} className={`v ${query.view === v ? "on" : ""}`} onClick={() => set({ view: v })}><Table2 className="ico" aria-hidden /> {label}<small>{S[v]}</small></button>)}
        </aside>
        <div className="gridwrap" style={{ opacity: loading ? 0.6 : 1, transition: "opacity .15s" }}>
          <table className="sheet" style={{ width: tableW, tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: NUM_W }} />
              {cols.map((c) => <col key={c.key} style={{ width: widths[c.key] }} />)}
            </colgroup>
            <thead>
              <tr>
                <th className="num">#</th>
                {cols.map((c) => (
                  <th key={c.key} className={c.key === "name" ? "name" : ""}>
                    <c.ic className="ico" aria-hidden />{c.label}
                    <span className="rz" onPointerDown={(e) => startResize(c.key, e)} onDoubleClick={() => setWidths((w) => ({ ...w, [c.key]: c.w }))} title="드래그로 너비 조절 · 더블클릭 초기화" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((l, i) => {
                const isConv = l.status === "전환", isDrop = l.status === "드랍";
                return (
                  <tr key={l.id}>
                    <td className="num">{i + 1}</td>
                    <td className={`name ${l.is_duplicate ? "dup" : ""}`}>{l.name || "–"}{l.is_duplicate && " (중복)"}</td>
                    <td className="muted">{fmtTs(l.submitted_at)}</td>
                    <td>{l.phone}</td>
                    <td className="muted">{l.email || ""}</td>
                    {cols.some((c) => c.key === "company") && <td title={l.company ?? ""}>{l.company || ""}</td>}
                    {cols.some((c) => c.key === "industry") && <td>{l.industry || ""}</td>}
                    {cols.some((c) => c.key === "budget") && <td>{l.budget || ""}</td>}
                    {cols.some((c) => c.key === "services") && <td title={l.services ?? ""}>{l.services || ""}</td>}
                    {cols.some((c) => c.key === "marketing_status") && <td>{l.marketing_status || ""}</td>}
                    <td className="wide" title={l.message ?? ""}>{l.message || ""}</td>
                    <td><SourcePill s={l.utm_source} /></td>
                    {isStaff && <>
                      <td className="muted">{l.utm_content || ""}</td>
                      <td><input className="cell-in" defaultValue={l.assignee ?? ""} placeholder="담당자" style={{ minWidth: 70 }} onBlur={(e) => { if (e.target.value !== (l.assignee ?? "")) saveAssignee(l, e.target.value); }} onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} /></td>
                    </>}
                    <td><select className={`cell-sel st-${l.status}`} value={l.status} onChange={(e) => save(l, { status: e.target.value as Lead["status"] })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
                    {isConv ? (
                      <td className={l.revenue ? "" : "needs"}>
                        <input className="cell-in" inputMode="numeric" placeholder="매출액 입력" value={revText(l)}
                          onChange={(e) => { const n = +e.target.value.replace(/[^0-9]/g, ""); setRevDraft((d) => ({ ...d, [l.id]: n ? "₩" + n.toLocaleString("ko-KR") : "" })); }}
                          onBlur={(e) => { const n = +e.target.value.replace(/[^0-9]/g, ""); setRevDraft((d) => { const c = { ...d }; delete c[l.id]; return c; }); if (n !== Number(l.revenue)) save(l, { revenue: n }); }}
                          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} />
                      </td>
                    ) : <td className="locked" />}
                    {isConv ? <td><select className="cell-sel plain" value={l.pay_type ?? "결제확정"} onChange={(e) => save(l, { pay_type: e.target.value as Lead["pay_type"] })}>{PAYS.map((p) => <option key={p}>{p}</option>)}</select></td> : <td className="locked" />}
                    {isConv ? <td><input className="cell-in" type="date" value={l.converted_on ?? today()} onChange={(e) => save(l, { converted_on: e.target.value })} /></td> : <td className="locked" />}
                    {isDrop ? <td><select className={`cell-sel plain ${l.drop_reason ? "" : "empty"}`} value={l.drop_reason ?? ""} onChange={(e) => save(l, { drop_reason: (e.target.value || null) as Lead["drop_reason"] })}><option value="">사유 선택</option>{DROPS.map((d) => <option key={d}>{d}</option>)}</select></td> : <td className="locked" />}
                    <td><input className="cell-in" style={{ minWidth: 200 }} value={memoDraft[l.id] ?? (l.memo ?? "")}
                      onChange={(e) => setMemoDraft((d) => ({ ...d, [l.id]: e.target.value }))}
                      onBlur={(e) => { setMemoDraft((d) => { const c = { ...d }; delete c[l.id]; return c; }); if (e.target.value !== (l.memo ?? "")) save(l, { memo: e.target.value }); }}
                      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} /></td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td className="num" /><td colSpan={cols.length + 1} style={{ color: "var(--muted)", padding: "18px 12px" }}>{loading ? "불러오는 중…" : "조건에 맞는 리드가 없습니다. 리드는 광고 폼 제출 시 자동으로 추가됩니다."}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="foot">
        <span><Plus className="ico" aria-hidden /> 리드는 광고 폼 제출 시 자동 추가됩니다</span>
        <span>{rows.length < total ? `${rows.length} / ${fmtN(total)}` : fmtN(total)} records</span>
        {rows.length < total && <button className="btn" onClick={more} disabled={loading}>더 보기 (+{PAGE_LIMIT})</button>}
        {err ? <span className="err">저장 실패: {err}</span> : pending ? <span className="saving">저장 중…</span> : saved ? <span className="saved">저장됨 {saved}</span> : null}
      </div>
    </div>
  );
}

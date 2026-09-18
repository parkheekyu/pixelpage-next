"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import DateRangePicker from "./DateRangePicker";
import { AlignLeft, ArrowUpDown, Banknote, Briefcase, Building2, Calendar, ChevronDown, Filter, LayoutGrid, Mail, Megaphone, Phone, PiggyBank, Plus, Radar, Table2, Trash2, UserRound, UserRoundCog, X, GripVertical, EyeOff, Copy, Ruler, CheckSquare, type LucideIcon } from "lucide-react";
import { bulkStatus, createLead, deleteLeads, fetchLeadsPage, reorderLeads, setAssignee, updateLead, updateProjectColumns } from "@/app/app/actions";
import ColumnsMenu from "./ColumnsMenu";
import { createClient } from "@/lib/supabase/client";
import { todayKST } from "@/lib/dash/dates";
import { fmtN, fmtW, pct } from "@/lib/dash/agg";
import { defaultQuery, PAGE_LIMIT, type LeadPage, type LeadQuery, type SheetSort, type SheetView } from "@/lib/dash/leads-types";
import { DROPS, PAYS, STATUSES, type CustomField, type Lead, type LeadPatch, type Project } from "@/lib/dash/types";
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
// 서버(UTC)와 브라우저(KST) 렌더 결과가 같도록 시간대를 Asia/Seoul 로 고정 (하이드레이션 불일치 방지)
const TS_FMT = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
const fmtTs = (iso: string) => TS_FMT.format(new Date(iso)).replace("T", " ");
const today = () => todayKST();

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
  // 열 설정: 기본 열 숨김 + 사용자 정의 열 (직원이 변경, 프로젝트에 저장)
  const [hidden, setHidden] = useState<string[]>(project.hidden_columns ?? []);
  const [fields, setFields] = useState<CustomField[]>(project.custom_fields ?? []);
  const [colBusy, setColBusy] = useState(false);
  const saveCols = (next: { hidden_columns?: string[]; custom_fields?: CustomField[] }) => {
    setColBusy(true);
    start(async () => { const r = await updateProjectColumns(project.id, next); setColBusy(false); if (!r.ok) setErr(r.error); });
  };
  const toggleHidden = (key: string) => { const next = hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key]; setHidden(next); saveCols({ hidden_columns: next }); };
  const addField = (f: CustomField) => { const next = [...fields, f]; setFields(next); saveCols({ custom_fields: next }); };
  const removeField = (key: string) => { const next = fields.filter((f) => f.key !== key); setFields(next); saveCols({ custom_fields: next }); };
  // 자사 프로젝트(홈페이지 문의)는 폼 항목 열 항상 표시, 다른 고객사는 값이 있을 때만
  const builtinCols = COLS.filter((c) => (!c.staff || isStaff) && (!c.ifAny || project.is_own || page.rows.some((r) => r[c.ifAny!])));
  const cols = [
    ...builtinCols.filter((c) => c.key === "name" || !hidden.includes(c.key)),
    ...fields.map((f) => ({ key: "custom:" + f.key, label: f.label, w: 140, ic: (f.type === "date" ? Calendar : f.type === "number" ? Banknote : f.type === "select" ? ChevronDown : AlignLeft) as LucideIcon, custom: f })),
  ];
  const has = (key: string) => cols.some((c) => c.key === key);

  // 선택 · 우클릭 메뉴 · 드래그 정렬 · 열 메뉴 열기
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [menu, setMenu] = useState<{ x: number; y: number; kind: "row"; rowId: string } | { x: number; y: number; kind: "col"; colKey: string; custom?: CustomField } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [colsOpen, setColsOpen] = useState(false);
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null); const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(null); };
    window.addEventListener("click", close); window.addEventListener("keydown", esc); window.addEventListener("contextmenu", close);
    return () => { window.removeEventListener("click", close); window.removeEventListener("keydown", esc); window.removeEventListener("contextmenu", close); };
  }, [menu]);
  const toggleSel = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const openRowMenu = (e: React.MouseEvent, id: string) => { e.preventDefault(); e.stopPropagation(); if (!selected.has(id)) setSelected(new Set([id])); setMenu({ x: e.clientX, y: e.clientY, kind: "row", rowId: id }); };
  const openColMenu = (e: React.MouseEvent, colKey: string, custom?: CustomField) => { e.preventDefault(); e.stopPropagation(); setMenu({ x: e.clientX, y: e.clientY, kind: "col", colKey, custom }); };
  const selIds = () => [...selected].filter((id) => page.rows.some((r) => r.id === id));
  const removeSelected = () => {
    const ids = selIds(); if (!ids.length) return;
    if (!confirm(`선택한 ${ids.length}건을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    const before = page;
    setPage((p) => ({ ...p, rows: p.rows.filter((x) => !ids.includes(x.id)), total: Math.max(0, p.total - ids.length) })); setSelected(new Set());
    start(async () => { const r = await deleteLeads(project.id, ids); if (!r.ok) { setPage(before); setErr(r.error); } });
  };
  const statusSelected = (status: Lead["status"]) => {
    const ids = selIds(); if (!ids.length) return;
    setPage((p) => ({ ...p, rows: p.rows.map((x) => (ids.includes(x.id) ? { ...x, status, ...(status !== "전환" ? { revenue: 0, pay_type: null, converted_on: null } : { pay_type: x.pay_type ?? "결제확정", converted_on: x.converted_on ?? today() }), ...(status !== "드랍" ? { drop_reason: null } : {}) } : x)) }));
    start(async () => { const r = await bulkStatus(project.id, ids, status); if (!r.ok) setErr(r.error); else scheduleRefetch(); });
  };
  const copyPhones = () => { const ids = selIds(); const txt = page.rows.filter((r) => ids.includes(r.id)).map((r) => `${r.name ?? ""}\t${r.phone ?? ""}`).join("\n"); navigator.clipboard?.writeText(txt); setSaved("복사됨"); };
  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); return; }
    const rowsNow = [...page.rows]; const from = rowsNow.findIndex((r) => r.id === dragId), to = rowsNow.findIndex((r) => r.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = rowsNow.splice(from, 1); rowsNow.splice(to, 0, moved);
    setPage((p) => ({ ...p, rows: rowsNow })); setDragId(null); setOverId(null);
    start(async () => { const r = await reorderLeads(project.id, rowsNow.map((x) => x.id)); if (!r.ok) { setErr(r.error); return; } if (query.sort !== "manual") setQuery((q) => ({ ...q, sort: "manual", offset: 0 })); });
  };

  // 행 추가 폼
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", phone: "", email: "", utm_source: "", message: "" });
  const submitNew = () => {
    if (!draft.name.trim() || draft.phone.replace(/\D/g, "").length < 9) { setErr("이름과 연락처(9자리 이상)를 입력해 주세요."); return; }
    start(async () => {
      setErr(null);
      const r = await createLead(project.id, draft);
      if (!r.ok) { setErr(r.error); return; }
      setAdding(false); setDraft({ name: "", phone: "", email: "", utm_source: "", message: "" });
      setSaved(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setQuery((q) => ({ ...q, offset: 0 })); // 목록·요약 다시 조회
    });
  };
  const setCustom = (l: Lead, key: string, v: string | number | null) => save(l, { custom: { ...(l.custom ?? {}), [key]: v } });
  const [widths, setWidths] = useState<Record<string, number>>(() => Object.fromEntries(COLS.map((c) => [c.key, c.w])));
  useEffect(() => {
    // 하이드레이션 후 저장된 너비 적용 (동기 setState 회피)
    const t = setTimeout(() => { try { const v = JSON.parse(localStorage.getItem(WIDTH_KEY) || "{}"); if (v && typeof v === "object") setWidths((w) => ({ ...w, ...v })); } catch {} }, 0);
    return () => clearTimeout(t);
  }, []);
  const startResize = (key: string, e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX, startW = widths[key] ?? cols.find((c) => c.key === key)?.w ?? 140;
    const move = (ev: PointerEvent) => setWidths((w) => ({ ...w, [key]: Math.max(60, Math.min(600, startW + ev.clientX - startX)) }));
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); setWidths((w) => { try { localStorage.setItem(WIDTH_KEY, JSON.stringify(w)); } catch {} return w; }); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  const tableW = NUM_W + cols.reduce((a, c) => a + (widths[c.key] ?? c.w), 0) + (isStaff ? 44 : 0);

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

  // ---- 실시간: 다른 곳에서 리드가 추가/수정/삭제되면 새로고침 없이 반영 ----
  const [live, setLive] = useState<"connecting" | "on" | "off">("connecting");
  const [incoming, setIncoming] = useState(0);
  const queryRef = useRef(query); queryRef.current = query;
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRefetch = () => {
    if (refetchTimer.current) clearTimeout(refetchTimer.current);
    refetchTimer.current = setTimeout(async () => {
      const q = queryRef.current;
      const r = await fetchLeadsPage(project.id, { ...q, offset: 0, limit: Math.max(q.limit, page.rows.length || q.limit) });
      if (!("error" in r)) setPage(r);
    }, 600);
  };
  useEffect(() => {
    const sb = createClient();
    let channel: ReturnType<typeof sb.channel> | null = null;
    let cancelled = false;
    (async () => {
      const { data: { session } } = await sb.auth.getSession();
      if (!session || cancelled) { setLive("off"); return; }
      await sb.realtime.setAuth(session.access_token);
      channel = sb.channel(`leads:${project.id}`)
        .on("postgres_changes", { event: "*", schema: "dash", table: "leads", filter: `project_id=eq.${project.id}` }, (p) => {
          if (p.eventType === "INSERT") { setIncoming((n) => n + 1); scheduleRefetch(); return; }
          if (p.eventType === "UPDATE") {
            const row = p.new as Partial<Lead> & { id: string };
            setPage((cur) => ({ ...cur, rows: cur.rows.map((x) => (x.id === row.id ? { ...x, ...row } : x)) }));
            scheduleRefetch(); return;
          }
          const id = (p.old as { id?: string }).id;
          if (id) setPage((cur) => (cur.rows.some((x) => x.id === id) ? { ...cur, rows: cur.rows.filter((x) => x.id !== id), total: Math.max(0, cur.total - 1) } : cur));
          scheduleRefetch();
        })
        .subscribe((status) => setLive(status === "SUBSCRIBED" ? "on" : status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED" ? "off" : "connecting"));
    })();
    // 안전장치: Realtime 이벤트가 드물게 누락되므로, 탭이 보이는 동안 20초마다 · 탭 복귀 시 조용히 재조회
    const poll = () => { if (document.visibilityState === "visible") scheduleRefetch(); };
    const iv = setInterval(poll, 20000);
    document.addEventListener("visibilitychange", poll);
    return () => { cancelled = true; if (channel) sb.removeChannel(channel); if (refetchTimer.current) clearTimeout(refetchTimer.current); clearInterval(iv); document.removeEventListener("visibilitychange", poll); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const set = (patch: Partial<LeadQuery>) => { setIncoming(0); setQuery((q) => ({ ...q, ...patch, offset: 0 })); };
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
        <label className="tb"><ArrowUpDown className="ico" aria-hidden /> 정렬 <select value={query.sort} onChange={(e) => set({ sort: e.target.value as SheetSort })}><option value="ts_desc">등록일 최신순</option><option value="ts_asc">등록일 오래된순</option><option value="status">상태순</option><option value="rev_desc">매출액 높은순</option><option value="manual">직접 정렬 (드래그)</option></select></label>
        <DateRangePicker value={{ from: query.from, to: query.to }} onChange={(r) => set(r)} />
        {selected.size > 0 && <span className="tb sel-info"><CheckSquare className="ico" aria-hidden /> {selected.size}건 선택 · 우클릭으로 작업</span>}
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
              {cols.map((c) => <col key={c.key} style={{ width: widths[c.key] ?? c.w }} />)}
              {isStaff && <col style={{ width: 44 }} />}
            </colgroup>
            <thead>
              <tr>
                <th className="num"><input type="checkbox" aria-label="전체 선택" checked={rows.length > 0 && rows.every((r) => selected.has(r.id))} onChange={(e) => setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())} /></th>
                {cols.map((c) => (
                  <th key={c.key} className={c.key === "name" ? "name" : ""} onContextMenu={(e) => openColMenu(e, c.key, (c as { custom?: CustomField }).custom)}>
                    <c.ic className="ico" aria-hidden />{c.label}
                    <span className="rz" onPointerDown={(e) => startResize(c.key, e)} onDoubleClick={() => setWidths((w) => ({ ...w, [c.key]: c.w }))} title="드래그로 너비 조절 · 더블클릭 초기화" />
                  </th>
                ))}
                {isStaff && <th className="add"><ColumnsMenu compact open={colsOpen} onOpenChange={setColsOpen} builtin={builtinCols.filter((c) => c.key !== "name").map((c) => ({ key: c.key, label: c.label }))} hidden={hidden} fields={fields} busy={colBusy} onToggleHidden={toggleHidden} onAddField={addField} onRemoveField={removeField} /></th>}
              </tr>
            </thead>
            <tbody>
              {adding && (
                <tr className="newrow">
                  <td className="num"><Plus className="ico" aria-hidden /></td>
                  <td colSpan={cols.length + (isStaff ? 1 : 0)}>
                    <div className="newrow-form">
                      <input className="cell-in" autoFocus placeholder="이름 *" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                      <input className="cell-in" placeholder="연락처 *" inputMode="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                      <input className="cell-in" placeholder="이메일" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
                      <input className="cell-in" placeholder="유입매체 (기본: manual)" list="src-list" value={draft.utm_source} onChange={(e) => setDraft({ ...draft, utm_source: e.target.value })} />
                      <datalist id="src-list">{page.sources.map((x) => <option key={x} value={x} />)}</datalist>
                      <input className="cell-in" placeholder="문의내용" value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") submitNew(); }} />
                      <button type="button" className="btn primary" onClick={submitNew} disabled={pending}>저장</button>
                      <button type="button" className="btn" onClick={() => setAdding(false)} aria-label="취소"><X className="ico" aria-hidden /></button>
                    </div>
                  </td>
                </tr>
              )}
              {rows.map((l, i) => {
                const isConv = l.status === "전환", isDrop = l.status === "드랍";
                const isSel = selected.has(l.id);
                return (
                  <tr key={l.id} className={`${isSel ? "sel" : ""} ${overId === l.id && dragId && dragId !== l.id ? "dragover" : ""}`} onContextMenu={(e) => openRowMenu(e, l.id)}
                    onDragOver={(e) => { if (dragId) { e.preventDefault(); setOverId(l.id); } }} onDrop={(e) => { e.preventDefault(); onDrop(l.id); }}>
                    <td className="num">
                      <span className="grip" draggable title="드래그로 순서 변경" onDragStart={(e) => { setDragId(l.id); e.dataTransfer.effectAllowed = "move"; }} onDragEnd={() => { setDragId(null); setOverId(null); }}><GripVertical className="ico" aria-hidden /></span>
                      <input type="checkbox" className="rowcheck" checked={isSel} onChange={() => toggleSel(l.id)} aria-label="선택" />
                      <span className="rownum">{i + 1}</span>
                    </td>
                    <td className={`name ${l.is_duplicate ? "dup" : ""}`}>{l.name || "–"}{l.is_duplicate && " (중복)"}</td>
                    {has("ts") && <td className="muted">{fmtTs(l.submitted_at)}</td>}
                    {has("phone") && <td>{l.phone}</td>}
                    {has("email") && <td className="muted">{l.email || ""}</td>}
                    {has("company") && <td title={l.company ?? ""}>{l.company || ""}</td>}
                    {has("industry") && <td>{l.industry || ""}</td>}
                    {has("budget") && <td>{l.budget || ""}</td>}
                    {has("services") && <td title={l.services ?? ""}>{l.services || ""}</td>}
                    {has("marketing_status") && <td>{l.marketing_status || ""}</td>}
                    {has("message") && <td className="wide" title={l.message ?? ""}>{l.message || ""}</td>}
                    {has("src") && <td><SourcePill s={l.utm_source} /></td>}
                    {has("content") && <td className="muted">{l.utm_content || ""}</td>}
                    {has("assignee") && <td><input className="cell-in" defaultValue={l.assignee ?? ""} placeholder="담당자" style={{ minWidth: 70 }} onBlur={(e) => { if (e.target.value !== (l.assignee ?? "")) saveAssignee(l, e.target.value); }} onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} /></td>}
                    {has("status") && <td><select className={`cell-sel st-${l.status}`} value={l.status} onChange={(e) => save(l, { status: e.target.value as Lead["status"] })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>}
                    {has("revenue") && (isConv ? (
                      <td className={l.revenue ? "" : "needs"}>
                        <input className="cell-in" inputMode="numeric" placeholder="매출액 입력" value={revText(l)}
                          onChange={(e) => { const n = +e.target.value.replace(/[^0-9]/g, ""); setRevDraft((d) => ({ ...d, [l.id]: n ? "₩" + n.toLocaleString("ko-KR") : "" })); }}
                          onBlur={(e) => { const n = +e.target.value.replace(/[^0-9]/g, ""); setRevDraft((d) => { const c = { ...d }; delete c[l.id]; return c; }); if (n !== Number(l.revenue)) save(l, { revenue: n }); }}
                          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} />
                      </td>
                    ) : <td className="locked" />)}
                    {has("pay") && (isConv ? <td><select className="cell-sel plain" value={l.pay_type ?? "결제확정"} onChange={(e) => save(l, { pay_type: e.target.value as Lead["pay_type"] })}>{PAYS.map((p) => <option key={p}>{p}</option>)}</select></td> : <td className="locked" />)}
                    {has("conv") && (isConv ? <td><input className="cell-in" type="date" value={l.converted_on ?? today()} onChange={(e) => save(l, { converted_on: e.target.value })} /></td> : <td className="locked" />)}
                    {has("drop") && (isDrop ? <td><select className={`cell-sel plain ${l.drop_reason ? "" : "empty"}`} value={l.drop_reason ?? ""} onChange={(e) => save(l, { drop_reason: (e.target.value || null) as Lead["drop_reason"] })}><option value="">사유 선택</option>{DROPS.map((d) => <option key={d}>{d}</option>)}</select></td> : <td className="locked" />)}
                    {has("memo") && <td><input className="cell-in" style={{ minWidth: 200 }} value={memoDraft[l.id] ?? (l.memo ?? "")}
                      onChange={(e) => setMemoDraft((d) => ({ ...d, [l.id]: e.target.value }))}
                      onBlur={(e) => { setMemoDraft((d) => { const c = { ...d }; delete c[l.id]; return c; }); if (e.target.value !== (l.memo ?? "")) save(l, { memo: e.target.value }); }}
                      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} /></td>}
                    {fields.map((f) => { const v = l.custom?.[f.key] ?? null; return (
                      <td key={f.key}>
                        {f.type === "select" ? (
                          <select className={`cell-sel plain ${v == null ? "empty" : ""}`} value={v == null ? "" : String(v)} onChange={(e) => setCustom(l, f.key, e.target.value || null)}><option value="">선택</option>{(f.options ?? []).map((o) => <option key={o}>{o}</option>)}</select>
                        ) : f.type === "date" ? (
                          <input className="cell-in" type="date" value={v == null ? "" : String(v)} onChange={(e) => setCustom(l, f.key, e.target.value || null)} />
                        ) : (
                          <input className="cell-in" inputMode={f.type === "number" ? "decimal" : undefined} defaultValue={v == null ? "" : String(v)}
                            onBlur={(e) => { const raw = e.target.value.trim(); const nv = raw === "" ? null : f.type === "number" ? (Number.isFinite(+raw) ? +raw : null) : raw; if (nv !== v) setCustom(l, f.key, nv); }}
                            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} />
                        )}
                      </td>
                    ); })}
                    {isStaff && <td className="del" />}
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td className="num" /><td colSpan={cols.length + (isStaff ? 1 : 0)} style={{ color: "var(--muted)", padding: "18px 12px" }}>{loading ? "불러오는 중…" : "조건에 맞는 리드가 없습니다. 리드는 광고 폼 제출 시 자동으로 추가됩니다."}</td></tr>}
              {!adding && <tr className="addrow" onClick={() => setAdding(true)}><td className="num"><Plus className="ico" aria-hidden /></td><td colSpan={cols.length + (isStaff ? 1 : 0)}>행 추가</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {menu && (
        <div className="ctx" style={{ left: Math.min(menu.x, window.innerWidth - 240), top: Math.min(menu.y, window.innerHeight - 330) }} onClick={(e) => e.stopPropagation()}>
          {menu.kind === "row" ? (
            <>
              <div className="ctx-title">{selIds().length}건 선택</div>
              <div className="ctx-sub">상태 변경</div>
              {STATUSES.map((st) => <button type="button" key={st} className="ctx-item" onClick={() => { statusSelected(st); setMenu(null); }}><span className={`pill st-${st}`} style={{ fontSize: 11.5 }}>{st}</span></button>)}
              <div className="ctx-sep" />
              <button type="button" className="ctx-item" onClick={() => { copyPhones(); setMenu(null); }}><Copy className="ico" aria-hidden /> 이름·연락처 복사</button>
              <button type="button" className="ctx-item" onClick={() => { setSelected(new Set()); setMenu(null); }}><X className="ico" aria-hidden /> 선택 해제</button>
              {isStaff && <><div className="ctx-sep" /><button type="button" className="ctx-item danger" onClick={() => { setMenu(null); removeSelected(); }}><Trash2 className="ico" aria-hidden /> 선택한 {selIds().length}건 삭제</button></>}
            </>
          ) : (
            <>
              <div className="ctx-title">{cols.find((c) => c.key === menu.colKey)?.label}</div>
              <button type="button" className="ctx-item" onClick={() => { setWidths((w) => { const c = { ...w }; delete c[menu.colKey]; return c; }); setMenu(null); }}><Ruler className="ico" aria-hidden /> 너비 초기화</button>
              {isStaff && menu.colKey !== "name" && !menu.custom && <button type="button" className="ctx-item" onClick={() => { toggleHidden(menu.colKey); setMenu(null); }}><EyeOff className="ico" aria-hidden /> 열 숨기기</button>}
              {isStaff && <button type="button" className="ctx-item" onClick={() => { setColsOpen(true); setMenu(null); }}><Plus className="ico" aria-hidden /> 새 열 추가 · 숨긴 열 보기</button>}
              {isStaff && menu.custom && <><div className="ctx-sep" /><button type="button" className="ctx-item danger" onClick={() => { const f = menu.custom!; setMenu(null); if (confirm(`"${f.label}" 열을 삭제할까요?`)) removeField(f.key); }}><Trash2 className="ico" aria-hidden /> 열 삭제</button></>}
            </>
          )}
        </div>
      )}
      <div className="foot">
        <span><Plus className="ico" aria-hidden /> 리드는 광고 폼 제출 시 자동 추가됩니다</span>
        <span>{rows.length < total ? `${rows.length} / ${fmtN(total)}` : fmtN(total)} records</span>
        <span className={`live ${live}`} title={live === "on" ? "실시간 연결됨: 새 리드·상태 변경이 자동 반영됩니다" : live === "off" ? "실시간 연결 끊김" : "연결 중"}><i />{live === "on" ? "실시간" : live === "off" ? "오프라인" : "연결 중"}</span>
        {incoming > 0 && <button type="button" className="btn incoming" onClick={() => { setIncoming(0); setQuery((q) => ({ ...q, offset: 0 })); }}>새 리드 {incoming}건 반영됨</button>}
        {rows.length < total && <button className="btn" onClick={more} disabled={loading}>더 보기 (+{PAGE_LIMIT})</button>}
        {err ? <span className="err">저장 실패: {err}</span> : pending ? <span className="saving">저장 중…</span> : saved ? <span className="saved">저장됨 {saved}</span> : null}
      </div>
    </div>
  );
}

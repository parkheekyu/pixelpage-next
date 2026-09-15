"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { fetchLeadsPage, setAssignee, updateLead } from "@/app/app/actions";
import { fmtN, fmtW, pct } from "@/lib/dash/agg";
import { DEFAULT_QUERY, type LeadPage, type LeadQuery, type SheetSort, type SheetView } from "@/lib/dash/leads-types";
import { DROPS, PAYS, STATUSES, type Lead, type LeadPatch, type Project } from "@/lib/dash/types";
import { SourcePill } from "./charts";

const VIEWS: [SheetView, string][] = [["all", "전체 리드"], ["todo", "처리 필요 (신규·연락중)"], ["conv", "전환 리드"], ["need", "매출 미입력"], ["drop", "드랍"], ["dup", "중복"]];
const pad = (n: number) => String(n).padStart(2, "0");
const fmtTs = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const today = () => new Date().toISOString().slice(0, 10);

export default function LeadSheet({ project, initial, isStaff }: { project: Project; initial: LeadPage; isStaff: boolean }) {
  const [query, setQuery] = useState<LeadQuery>(DEFAULT_QUERY);
  const [page, setPage] = useState<LeadPage>(initial);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<string | null>(null), [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [memoDraft, setMemoDraft] = useState<Record<string, string>>({});
  const [revDraft, setRevDraft] = useState<Record<string, string>>({});
  const first = useRef(true);
  const seq = useRef(0);

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
        <label className="tb">⏷ 상태 <select value={query.status} onChange={(e) => set({ status: e.target.value })}><option value="">전체</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="tb">⏷ 매체 <select value={query.src} onChange={(e) => set({ src: e.target.value })}><option value="">전체</option>{page.sources.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="tb">⇅ 정렬 <select value={query.sort} onChange={(e) => set({ sort: e.target.value as SheetSort })}><option value="ts_desc">등록일 최신순</option><option value="ts_asc">등록일 오래된순</option><option value="status">상태순</option><option value="rev_desc">매출액 높은순</option></select></label>
        <label className="tb">기간 <select value={query.days} onChange={(e) => set({ days: +e.target.value })}><option value={7}>7일</option><option value={14}>14일</option><option value={28}>4주</option><option value={90}>90일</option><option value={365}>1년</option></select></label>
        <div className="search"><input type="text" placeholder="이름, 연락처 검색" value={query.q} onChange={(e) => set({ q: e.target.value })} /></div>
      </div>
      <div className="main">
        <aside className="views">
          <h4>뷰</h4>
          {VIEWS.map(([v, label]) => <button key={v} className={`v ${query.view === v ? "on" : ""}`} onClick={() => set({ view: v })}>▦ {label}<small>{S[v]}</small></button>)}
        </aside>
        <div className="gridwrap" style={{ opacity: loading ? 0.6 : 1, transition: "opacity .15s" }}>
          <table className="sheet">
            <thead>
              <tr>
                <th className="num">#</th><th className="name"><span className="ic">A</span>이름</th><th><span className="ic">📅</span>등록일</th><th><span className="ic">☎</span>연락처</th><th><span className="ic">@</span>이메일</th><th><span className="ic">≡</span>문의내용</th><th><span className="ic">◉</span>유입매체</th>
                {isStaff && <><th><span className="ic">▣</span>소재</th><th><span className="ic">👤</span>담당자</th></>}
                <th><span className="ic">▾</span>상태</th><th><span className="ic">₩</span>매출액</th><th><span className="ic">▾</span>결제구분</th><th><span className="ic">📅</span>전환일</th><th><span className="ic">▾</span>드랍사유</th><th><span className="ic">≡</span>메모</th>
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
              {rows.length === 0 && <tr><td className="num" /><td colSpan={isStaff ? 15 : 13} style={{ color: "var(--muted)", padding: "18px 12px" }}>{loading ? "불러오는 중…" : "조건에 맞는 리드가 없습니다. 리드는 광고 폼 제출 시 자동으로 추가됩니다."}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="foot">
        <span>＋ 리드는 광고 폼 제출 시 자동 추가됩니다</span>
        <span>{rows.length < total ? `${rows.length} / ${fmtN(total)}` : fmtN(total)} records</span>
        {rows.length < total && <button className="btn" onClick={more} disabled={loading}>더 보기 (+{DEFAULT_QUERY.limit})</button>}
        {err ? <span className="err">저장 실패: {err}</span> : pending ? <span className="saving">저장 중…</span> : saved ? <span className="saved">저장됨 {saved}</span> : null}
      </div>
    </div>
  );
}

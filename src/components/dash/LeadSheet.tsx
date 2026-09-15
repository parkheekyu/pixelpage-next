"use client";

import { useState, useTransition } from "react";
import { setAssignee, updateLead } from "@/app/app/actions";
import { DAY, fmtN, fmtW, pct } from "@/lib/dash/agg";
import { DROPS, PAYS, STATUSES, type Lead, type LeadPatch, type Project } from "@/lib/dash/types";
import { SourcePill } from "./charts";

type View = "all" | "todo" | "conv" | "need" | "drop" | "dup";
const VIEWS: [View, string][] = [["all", "전체 리드"], ["todo", "처리 필요 (신규·연락중)"], ["conv", "전환 리드"], ["need", "매출 미입력"], ["drop", "드랍"], ["dup", "중복"]];

const pad = (n: number) => String(n).padStart(2, "0");
const fmtTs = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const today = () => new Date().toISOString().slice(0, 10);

export default function LeadSheet({ project, leads: initial, isStaff, now }: { project: Project; leads: Lead[]; isStaff: boolean; now: number }) {
  const [leads, setLeads] = useState(initial);
  const [view, setView] = useState<View>("all");
  const [fStatus, setFStatus] = useState(""), [fSrc, setFSrc] = useState(""), [fSort, setFSort] = useState("ts_desc"), [fRange, setFRange] = useState(28), [q, setQ] = useState("");
  const [saved, setSaved] = useState<string | null>(null), [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [memoDraft, setMemoDraft] = useState<Record<string, string>>({});
  const [revDraft, setRevDraft] = useState<Record<string, string>>({});

  const srcs = [...new Set(leads.map((l) => l.utm_source))].sort();

  const inRange = leads.filter((l) => new Date(l.submitted_at).getTime() > now - fRange * DAY);
  const all = inRange.filter((l) => !l.is_duplicate);
  const conv = all.filter((l) => l.status === "전환"), need = conv.filter((l) => !l.revenue);
  const rev = conv.filter((l) => l.pay_type === "결제확정").reduce((a, l) => a + Number(l.revenue || 0), 0);
  const cnt: Record<View, number> = { all: all.length, todo: all.filter((l) => l.status === "신규" || l.status === "연락중").length, conv: conv.length, need: need.length, drop: all.filter((l) => l.status === "드랍").length, dup: inRange.filter((l) => l.is_duplicate).length };

  const rows = (() => {
    let L = view === "dup" ? inRange.filter((l) => l.is_duplicate) : all;
    if (view === "todo") L = L.filter((l) => l.status === "신규" || l.status === "연락중");
    if (view === "conv") L = L.filter((l) => l.status === "전환");
    if (view === "need") L = L.filter((l) => l.status === "전환" && !l.revenue);
    if (view === "drop") L = L.filter((l) => l.status === "드랍");
    if (fStatus) L = L.filter((l) => l.status === fStatus);
    if (fSrc) L = L.filter((l) => l.utm_source === fSrc);
    if (q) { const s = q.trim(); L = L.filter((l) => (l.name ?? "").includes(s) || (l.phone ?? "").includes(s) || (l.email ?? "").includes(s)); }
    const ts = (l: Lead) => new Date(l.submitted_at).getTime();
    return [...L].sort((a, b) => fSort === "ts_asc" ? ts(a) - ts(b) : fSort === "status" ? (STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status) || ts(b) - ts(a)) : fSort === "rev_desc" ? Number(b.revenue) - Number(a.revenue) : ts(b) - ts(a));
  })();

  function save(l: Lead, patch: LeadPatch) {
    // 낙관적 업데이트 + 서버 액션 (실패 시 롤백)
    const before = leads;
    const local: Partial<Lead> = { ...patch };
    if (patch.status && patch.status !== "전환") { local.revenue = 0; local.pay_type = null; local.converted_on = null; }
    if (patch.status && patch.status !== "드랍") local.drop_reason = null;
    if (patch.status === "전환") { local.pay_type = l.pay_type ?? "결제확정"; local.converted_on = l.converted_on ?? today(); }
    setLeads((cur) => cur.map((x) => (x.id === l.id ? { ...x, ...local } : x)));
    start(async () => {
      setErr(null);
      const r = await updateLead(project.id, l.id, patch);
      if (!r.ok) { setLeads(before); setErr(r.error); return; }
      setSaved(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    });
  }
  function saveAssignee(l: Lead, v: string) {
    setLeads((cur) => cur.map((x) => (x.id === l.id ? { ...x, assignee: v || null } : x)));
    start(async () => { const r = await setAssignee(project.id, l.id, v || null); if (!r.ok) setErr(r.error); });
  }
  const revText = (l: Lead) => revDraft[l.id] ?? (l.revenue ? "₩" + Number(l.revenue).toLocaleString("ko-KR") : "");

  return (
    <div className="sheet-app">
      <div className="bar">
        <h2>리드 DB</h2>
        <div className="sp" />
        <div className="stat">
          <span>리드 <b>{fmtN(all.length)}</b></span>
          <span>전환 <b>{conv.length}</b> ({pct(conv.length, all.length)})</span>
          <span>확정 매출 <b>{fmtW(rev)}</b></span>
          <span style={{ color: need.length ? "var(--warn)" : "inherit" }}>매출 미입력 <b>{need.length}</b></span>
        </div>
      </div>
      <div className="toolbar">
        <label className="tb">⏷ 상태 <select value={fStatus} onChange={(e) => setFStatus(e.target.value)}><option value="">전체</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="tb">⏷ 매체 <select value={fSrc} onChange={(e) => setFSrc(e.target.value)}><option value="">전체</option>{srcs.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="tb">⇅ 정렬 <select value={fSort} onChange={(e) => setFSort(e.target.value)}><option value="ts_desc">등록일 최신순</option><option value="ts_asc">등록일 오래된순</option><option value="status">상태순</option><option value="rev_desc">매출액 높은순</option></select></label>
        <label className="tb">기간 <select value={fRange} onChange={(e) => setFRange(+e.target.value)}><option value={7}>7일</option><option value={14}>14일</option><option value={28}>4주</option><option value={90}>90일</option><option value={9999}>전체</option></select></label>
        <div className="search"><input type="text" placeholder="이름, 연락처 검색" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      <div className="main">
        <aside className="views">
          <h4>뷰</h4>
          {VIEWS.map(([v, label]) => <button key={v} className={`v ${view === v ? "on" : ""}`} onClick={() => setView(v)}>▦ {label}<small>{cnt[v]}</small></button>)}
        </aside>
        <div className="gridwrap">
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
              {rows.length === 0 && <tr><td className="num" /><td colSpan={isStaff ? 15 : 13} style={{ color: "var(--muted)", padding: "18px 12px" }}>아직 리드가 없습니다. 광고 폼 제출 시 자동으로 추가됩니다.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="foot">
        <span>＋ 리드는 광고 폼 제출 시 자동 추가됩니다</span>
        <span>{rows.length} records</span>
        {err ? <span className="err">저장 실패: {err}</span> : pending ? <span className="saving">저장 중…</span> : saved ? <span className="saved">저장됨 {saved}</span> : null}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { createClientRow, deleteClientRow, updateClientRow } from "@/app/app/client-actions";
import type { ActionResult } from "@/app/app/actions";
import { CLIENT_STATUSES, CLIENT_STATUS_LABEL, CONTRACT_TYPES, CONTRACT_TYPE_LABEL, type Client, type ClientPatch, type ClientStatus, type ContractType, type Project } from "@/lib/dash/types";

const TYPE_TAG: Record<ContractType, string> = { markup: "blue", revshare: "green", cpa: "orange", own: "gray" };

/** 계약일부터 오늘(또는 종료일)까지 지난 개월 수 */
function months(from: string | null, to: string | null) {
  if (!from) return null;
  const a = new Date(from), b = to ? new Date(to) : new Date();
  const m = (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth() - (b.getDate() < a.getDate() ? 1 : 0);
  return m < 0 ? null : m;
}

export default function ClientsAdmin({ clients, projects, loadError }: { clients: Client[]; projects: Project[]; loadError: string | null }) {
  const [addState, addAction, adding] = useActionState<ActionResult | null, FormData>(createClientRow, null);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(loadError);
  const [filter, setFilter] = useState<"all" | ClientStatus>("all");
  const run = (fn: () => Promise<ActionResult>) => start(async () => { setErr(null); const r = await fn(); if (!r.ok) setErr(r.error); });
  const save = (id: string, patch: ClientPatch) => run(() => updateClientRow(id, patch));

  const linked = new Set(clients.map((c) => c.project_id).filter(Boolean));
  const freeProjects = projects.filter((p) => !linked.has(p.id));
  const rows = clients.filter((c) => filter === "all" || c.status === filter);
  const active = clients.filter((c) => c.status === "active");
  const count = (t: ContractType) => active.filter((c) => c.contract_type === t).length;

  return (
    <>
      <header className="ph"><h1>클라이언트 <small>진행중 {active.length} · 전체 {clients.length}</small></h1></header>

      <div className="form-row" style={{ marginBottom: 12 }}>
        {(["all", ...CLIENT_STATUSES] as const).map((f) => (
          <button key={f} type="button" className={`btn ${filter === f ? "primary" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "전체" : CLIENT_STATUS_LABEL[f]}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        {CONTRACT_TYPES.map((t) => <span key={t} className={`pill tag-${TYPE_TAG[t]}`}>{CONTRACT_TYPE_LABEL[t]} {count(t)}</span>)}
      </div>

      {err && <div className="msg err">{err}</div>}

      <div className="card" style={{ marginBottom: 12 }}>
        <h2>클라이언트 목록</h2>
        <div className="sub">칸을 바로 고치면 저장됩니다. 종료로 바꾸면 종료일이 오늘로 들어갑니다.</div>
        <div className="tbl-wrap">
          <table className="tbl left">
            <thead>
              <tr><th>고객사</th><th>계약 형태</th><th>계약 상태</th><th>계약일</th><th>수익구조</th><th>대시보드</th><th></th></tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={7} style={{ color: "var(--muted)" }}>표시할 클라이언트가 없습니다</td></tr>}
              {rows.map((c) => {
                const m = months(c.contract_date, c.end_date);
                return (
                  <tr key={c.id} style={{ opacity: pending ? 0.6 : c.status === "ended" ? 0.6 : 1 }}>
                    <td><input className="cell-in" defaultValue={c.name} aria-label="고객사 이름" style={{ fontWeight: 600, minWidth: 120 }} onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== c.name) save(c.id, { name: v }); else e.target.value = c.name; }} /></td>
                    <td>
                      <select value={c.contract_type ?? ""} aria-label="계약 형태" className={c.contract_type ? `pill tag-${TYPE_TAG[c.contract_type]}` : ""} onChange={(e) => save(c.id, { contract_type: (e.target.value || null) as ContractType | null })}>
                        <option value="">미정</option>
                        {CONTRACT_TYPES.map((t) => <option key={t} value={t}>{CONTRACT_TYPE_LABEL[t]}</option>)}
                      </select>
                    </td>
                    <td>
                      <select value={c.status} aria-label="계약 상태" className={`pill tag-${c.status === "active" ? "green" : "gray"}`} onChange={(e) => save(c.id, { status: e.target.value as ClientStatus })}>
                        {CLIENT_STATUSES.map((st) => <option key={st} value={st}>{CLIENT_STATUS_LABEL[st]}</option>)}
                      </select>
                    </td>
                    <td>
                      <input type="date" className="cell-in" defaultValue={c.contract_date ?? ""} aria-label="계약일" onChange={(e) => save(c.id, { contract_date: e.target.value || null })} />
                      {m !== null && <small style={{ color: "var(--muted)", marginLeft: 6 }}>{c.status === "ended" ? `${m}개월 진행` : `${m}개월차`}</small>}
                      {c.status === "ended" && c.end_date && <small style={{ color: "var(--muted)", marginLeft: 6 }}>~ {c.end_date}</small>}
                    </td>
                    <td style={{ width: "34%" }}><input className="cell-in" defaultValue={c.revenue_model ?? ""} aria-label="수익구조" placeholder="예) 광고비의 15% / 건당 3만원" style={{ width: "100%", minWidth: 220 }} onBlur={(e) => { const v = e.target.value.trim(); if (v !== (c.revenue_model ?? "")) save(c.id, { revenue_model: v }); }} /></td>
                    <td>
                      {c.project_id
                        ? <Link href={`/app/research/${c.project_id}`} className="pill">열기 ›</Link>
                        : <select value="" aria-label="대시보드 연결" onChange={(e) => e.target.value && save(c.id, { project_id: e.target.value })}>
                            <option value="">연결 안 됨</option>
                            {freeProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>}
                    </td>
                    <td><button className="btn danger" onClick={() => { if (confirm(`${c.name} 클라이언트를 삭제할까요? 계약 정보만 지워지고 대시보드 프로젝트는 남습니다.`)) run(() => deleteClientRow(c.id)); }}>삭제</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>클라이언트 추가</h2>
        <form action={addAction} className="form-row" style={{ alignItems: "flex-end" }}>
          <label className="f">고객사<input name="name" type="text" required /></label>
          <label className="f">계약 형태
            <select name="contract_type" defaultValue=""><option value="">미정</option>{CONTRACT_TYPES.map((t) => <option key={t} value={t}>{CONTRACT_TYPE_LABEL[t]}</option>)}</select>
          </label>
          <label className="f">계약 상태
            <select name="status" defaultValue="active">{CLIENT_STATUSES.map((st) => <option key={st} value={st}>{CLIENT_STATUS_LABEL[st]}</option>)}</select>
          </label>
          <label className="f">계약일<input name="contract_date" type="date" /></label>
          <label className="f" style={{ flex: 1, minWidth: 220 }}>수익구조<input name="revenue_model" type="text" placeholder="예) 광고비의 15% / 건당 3만원" /></label>
          <label className="f">대시보드 프로젝트
            <select name="project_id" defaultValue=""><option value="">연결 안 함</option>{freeProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          </label>
          <button className="btn primary" type="submit" disabled={adding}>{adding ? "추가 중…" : "추가"}</button>
          {addState && <div className={`msg ${addState.ok ? "ok" : "err"}`} style={{ width: "100%" }}>{addState.ok ? addState.message : addState.error}</div>}
        </form>
      </div>
    </>
  );
}

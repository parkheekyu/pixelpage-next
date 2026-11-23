"use client";

import DateInput from "./DateInput";
import Link from "next/link";
import { useState, useTransition } from "react";
import { CalendarDays, CircleDot, FileText, LayoutGrid, Link2, Plus, Tag, Type, Wallet, X } from "lucide-react";
import { addClient, deleteClientRow, updateClientRow } from "@/app/app/client-actions";
import type { ActionResult } from "@/app/app/actions";
import { CLIENT_CATEGORIES, CLIENT_CATEGORY_LABEL, CLIENT_STATUSES, CLIENT_STATUS_LABEL, CONTRACT_TYPES, CONTRACT_TYPE_LABEL, type Client, type ClientCategory, type ClientPatch, type ClientStatus, type ContractType, type Project } from "@/lib/dash/types";

const TYPE_TAG: Record<ContractType, string> = { markup: "blue", revshare: "green", cpa: "orange", own: "gray" };
const CAT_TAG: Record<ClientCategory, string> = { db: "blue", sales: "orange" };

/** 계약일부터 오늘(또는 종료일)까지 지난 개월 수 */
function months(from: string | null, to: string | null) {
  if (!from) return null;
  const a = new Date(from), b = to ? new Date(to) : new Date();
  const m = (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth() - (b.getDate() < a.getDate() ? 1 : 0);
  return m < 0 ? null : m;
}

export default function ClientsAdmin({ clients, loadError }: { clients: Client[]; projects: Project[]; loadError: string | null }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(loadError);
  const [filter, setFilter] = useState<"all" | ClientStatus>("all");
  const [newName, setNewName] = useState("");
  const run = (fn: () => Promise<ActionResult>, after?: () => void) => start(async () => { setErr(null); const r = await fn(); if (!r.ok) setErr(r.error); else after?.(); });
  const save = (id: string, patch: ClientPatch) => run(() => updateClientRow(id, patch));

  const rows = clients.filter((c) => filter === "all" || c.status === filter);
  const active = clients.filter((c) => c.status === "active");
  const enter = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") e.currentTarget.blur(); };

  return (
    <>
      <header className="ph"><h1>클라이언트 <small>진행중 {active.length} · 전체 {clients.length}</small></h1></header>

      <div className="ndb-views">
        {(["all", ...CLIENT_STATUSES] as const).map((f) => (
          <button key={f} type="button" className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>
            {f === "all" ? "전체" : CLIENT_STATUS_LABEL[f]} <small>{f === "all" ? clients.length : clients.filter((c) => c.status === f).length}</small>
          </button>
        ))}
        <span style={{ flex: 1 }} />
        {CLIENT_CATEGORIES.map((t) => <span key={t} className={`pill tag-${CAT_TAG[t]}`}>{CLIENT_CATEGORY_LABEL[t]} {active.filter((c) => c.category === t).length}</span>)}
        {CONTRACT_TYPES.map((t) => <span key={t} className={`pill tag-${TYPE_TAG[t]}`}>{CONTRACT_TYPE_LABEL[t]} {active.filter((c) => c.contract_type === t).length}</span>)}
      </div>

      {err && <div className="msg err">{err}</div>}

      <div className="tbl-wrap">
        <table className="ndb" style={{ opacity: pending ? 0.6 : 1 }}>
          <thead>
            <tr>
              <th><Type aria-hidden /> 고객사</th><th><LayoutGrid aria-hidden /> 구분</th><th><Tag aria-hidden /> 계약 형태</th><th><CircleDot aria-hidden /> 계약 상태</th>
              <th><CalendarDays aria-hidden /> 계약일</th><th><Wallet aria-hidden /> 수익구조</th><th><FileText aria-hidden /> 메모</th><th><Link2 aria-hidden /> 대시보드</th><th />
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const m = months(c.contract_date, c.end_date);
              return (
                <tr key={c.id} className={c.status === "ended" ? "dim" : ""}>
                  <td className="title">
                    {c.logo_url ? <img className="c-logo" src={c.logo_url} alt="" /> : <span className="c-logo none" aria-hidden>{c.name.replace(/^\(주\)/, "").slice(0, 1)}</span>}
                    <input className="cell-in" defaultValue={c.name} key={c.name} aria-label="고객사 이름" onKeyDown={enter} onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== c.name) save(c.id, { name: v }); else e.target.value = c.name; }} />
                  </td>
                  <td>
                    {c.contract_type === "own"
                      ? <span className="pill tag-gray">자사</span>
                      : <select value={c.category ?? ""} aria-label="구분" className={c.category ? `pill tag-${CAT_TAG[c.category]}` : "pill"} onChange={(e) => save(c.id, { category: (e.target.value || null) as ClientCategory | null })}>
                          <option value="">미정</option>
                          {CLIENT_CATEGORIES.map((t) => <option key={t} value={t}>{CLIENT_CATEGORY_LABEL[t]}</option>)}
                        </select>}
                  </td>
                  <td>
                    <select value={c.contract_type ?? ""} aria-label="계약 형태" className={c.contract_type ? `pill tag-${TYPE_TAG[c.contract_type]}` : "pill"} onChange={(e) => save(c.id, { contract_type: (e.target.value || null) as ContractType | null })}>
                      <option value="">미정</option>
                      {CONTRACT_TYPES.map((t) => <option key={t} value={t}>{CONTRACT_TYPE_LABEL[t]}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={c.status} aria-label="계약 상태" className={`pill tag-${c.status === "active" ? "green" : "gray"}`} onChange={(e) => save(c.id, { status: e.target.value as ClientStatus })}>
                      {CLIENT_STATUSES.map((st) => <option key={st} value={st}>{CLIENT_STATUS_LABEL[st]}</option>)}
                    </select>
                  </td>
                  <td className="nowrap">
                    <DateInput className="cell-in date" value={c.contract_date} label="계약일" onCommit={(v) => save(c.id, { contract_date: v })} />
                    {m !== null && <small>{c.status === "ended" ? `${m}개월 진행` : `${m}개월차`}</small>}
                  </td>
                  <td className="wide"><input className="cell-in" defaultValue={c.revenue_model ?? ""} key={c.revenue_model ?? ""} aria-label="수익구조" placeholder="비어 있음" onKeyDown={enter} onBlur={(e) => { const v = e.target.value.trim(); if (v !== (c.revenue_model ?? "")) save(c.id, { revenue_model: v }); }} /></td>
                  <td className="wide"><input className="cell-in" defaultValue={c.memo ?? ""} key={c.memo ?? ""} aria-label="메모" placeholder="비어 있음" onKeyDown={enter} onBlur={(e) => { const v = e.target.value.trim(); if (v !== (c.memo ?? "")) save(c.id, { memo: v }); }} /></td>
                  <td>{c.project_id ? <Link href={`/app/overview/${c.project_id}`} className="ndb-link">열기 ›</Link> : <small>없음</small>}</td>
                  <td className="act"><button type="button" className="t-del" title="삭제" aria-label="삭제" onClick={() => { if (confirm(`${c.name} 클라이언트를 삭제할까요? 계약 정보만 지워지고 고객사(대시보드)는 남습니다.`)) run(() => deleteClientRow(c.id)); }}><X size={14} aria-hidden /></button></td>
                </tr>
              );
            })}
            <tr className="new">
              <td colSpan={9}>
                <form onSubmit={(e) => { e.preventDefault(); const v = newName.trim(); if (v) run(() => addClient(v), () => setNewName("")); }}>
                  <Plus size={14} aria-hidden />
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="새 클라이언트 (이름을 적고 엔터 · 고객사 목록에도 함께 추가됩니다)" aria-label="새 클라이언트" />
                </form>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

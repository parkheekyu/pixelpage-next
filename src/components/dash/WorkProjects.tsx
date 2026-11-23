"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Building2, CalendarDays, CircleDot, Gauge as Gauge2, ListChecks, Plus, Target, Type, X } from "lucide-react";
import { addWorkProject, deleteWorkProject, updateWorkProject } from "@/app/app/work-actions";
import type { ActionResult } from "@/app/app/actions";
import type { Client, WorkProject, WorkProjectPatch, WorkTask } from "@/lib/dash/types";
import { ddayLabel, progress, risk, type Risk } from "@/lib/dash/work";
import { useFreshOnMount } from "./WorkTasks";

const RISK_LABEL: Record<Risk, string> = { ok: "", slow: "진행 느림", late: "마감 지남" };

export function Gauge({ pct, risk: r = "ok" }: { pct: number; risk?: Risk }) {
  return <div className={`gauge r-${r}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div>;
}

export default function WorkProjects({ projects, tasks, clients, today }: { projects: WorkProject[]; tasks: WorkTask[]; clients: Client[]; today: string }) {
  useFreshOnMount();
  const [showDone, setShowDone] = useState(false);
  const [busy, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const run = (fn: () => Promise<ActionResult>, after?: () => void) => start(async () => { setErr(null); const r = await fn(); if (!r.ok) setErr(r.error); else after?.(); });
  const save = (id: string, patch: WorkProjectPatch) => run(() => updateWorkProject(id, patch));
  const active = projects.filter((p) => p.status === "active"), finished = projects.filter((p) => p.status === "done");
  const cards = (showDone ? finished : active).map((p) => {
    const pr = progress(tasks.filter((t) => t.project_id === p.id));
    return { p, pr, r: risk(p, pr.pct, today) };
  }).sort((a, b) => (a.p.deadline ?? "9").localeCompare(b.p.deadline ?? "9"));

  return (
    <>
      <header className="ph"><h1>프로젝트 관리 <small>진행 중 프로젝트 {active.length}개</small></h1></header>

      <div className="ndb-views">
        <button type="button" className={!showDone ? "on" : ""} onClick={() => setShowDone(false)}>진행 중 <small>{active.length}</small></button>
        <button type="button" className={showDone ? "on" : ""} onClick={() => setShowDone(true)}>완료 <small>{finished.length}</small></button>
      </div>

      {err && <div className="msg err">{err}</div>}

      <div className="tbl-wrap">
        <table className="ndb" style={{ opacity: busy ? 0.6 : 1 }}>
          <thead>
            <tr>
              <th><Type aria-hidden /> 프로젝트</th><th><Building2 aria-hidden /> 클라이언트</th><th><Target aria-hidden /> 목표</th><th><CalendarDays aria-hidden /> 데드라인</th>
              <th><Gauge2 aria-hidden /> 진행률</th><th><ListChecks aria-hidden /> 할 일</th><th><CircleDot aria-hidden /> 상태</th><th />
            </tr>
          </thead>
          <tbody>
            {cards.map(({ p, pr, r }) => (
              <tr key={p.id}>
                <td className="title">
                  <input className="cell-in" defaultValue={p.name} key={p.name} aria-label="프로젝트 명" onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== p.name) save(p.id, { name: v }); else e.target.value = p.name; }} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
                  <Link href={`/app/admin/work/${p.id}`} className="ndb-open">열기</Link>
                </td>
                <td>
                  <select className="pill" value={p.client_id ?? ""} aria-label="클라이언트" onChange={(e) => save(p.id, { client_id: e.target.value || null })}>
                    <option value="">없음</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </td>
                <td className="wide"><input className="cell-in" defaultValue={p.goal ?? ""} key={p.goal ?? ""} aria-label="목표" placeholder="비어 있음" onBlur={(e) => { const v = e.target.value.trim(); if (v !== (p.goal ?? "")) save(p.id, { goal: v }); }} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} /></td>
                <td className="nowrap">
                  <input type="date" className="cell-in date" defaultValue={p.deadline ?? ""} key={p.deadline ?? ""} aria-label="데드라인" onChange={(e) => save(p.id, { deadline: e.target.value || null })} />
                  {p.deadline && p.status === "active" && <small className={r === "late" ? "late" : ""}>{ddayLabel(p.deadline, today)}</small>}
                </td>
                <td className="nowrap">
                  <span className="wt-prog"><Gauge pct={pr.pct} risk={r} /><b>{pr.pct}%</b></span>
                  {r !== "ok" && <span className={`pill tag-${r === "late" ? "red" : "orange"}`} style={{ marginLeft: 6, fontSize: 11.5 }}>{RISK_LABEL[r]}</span>}
                </td>
                <td className="nowrap pad">{pr.done} / {pr.base}{pr.hold ? ` · 보류 ${pr.hold}` : ""}</td>
                <td>
                  <select className={`pill tag-${p.status === "active" ? "blue" : "green"}`} value={p.status} aria-label="상태" onChange={(e) => save(p.id, { status: e.target.value as WorkProject["status"] })}>
                    <option value="active">진행 중</option><option value="done">완료</option>
                  </select>
                </td>
                <td className="act"><button type="button" className="t-del" title="삭제" aria-label="삭제" onClick={() => { if (confirm(`${p.name} 프로젝트를 삭제할까요? 마일스톤과 할 일 ${pr.total}건이 함께 지워집니다.`)) run(() => deleteWorkProject(p.id)); }}><X size={14} aria-hidden /></button></td>
              </tr>
            ))}
            {!showDone && (
              <tr className="new">
                <td colSpan={8}>
                  <form onSubmit={(e) => { e.preventDefault(); const v = newName.trim(); if (v) run(() => addWorkProject(v), () => setNewName("")); }}>
                    <Plus size={14} aria-hidden />
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="새 프로젝트 (이름을 적고 엔터)" aria-label="새 프로젝트" />
                  </form>
                </td>
              </tr>
            )}
            {showDone && cards.length === 0 && <tr><td colSpan={8} className="pad" style={{ color: "var(--muted)" }}>완료한 프로젝트가 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

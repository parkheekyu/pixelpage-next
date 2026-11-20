"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { createWorkProject, deleteWorkProject, updateWorkProject } from "@/app/app/work-actions";
import type { ActionResult } from "@/app/app/actions";
import type { Client, WorkProject, WorkProjectPatch, WorkTask } from "@/lib/dash/types";
import { ddayLabel, progress, risk, type Risk } from "@/lib/dash/work";
import { useFreshOnMount } from "./WorkTasks";

const RISK_LABEL: Record<Risk, string> = { ok: "", slow: "진행 느림", late: "마감 지남" };

export function Gauge({ pct, risk: r = "ok" }: { pct: number; risk?: Risk }) {
  return <div className={`gauge r-${r}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div>;
}

export default function WorkProjects({ projects, tasks, clients, today }: { projects: WorkProject[]; tasks: WorkTask[]; clients: Client[]; today: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(createWorkProject, null);
  useFreshOnMount();
  const [showDone, setShowDone] = useState(false);
  const [busy, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const run = (fn: () => Promise<ActionResult>) => start(async () => { setErr(null); const r = await fn(); if (!r.ok) setErr(r.error); });
  const save = (id: string, patch: WorkProjectPatch) => run(() => updateWorkProject(id, patch));
  const active = projects.filter((p) => p.status === "active"), finished = projects.filter((p) => p.status === "done");
  const cards = (showDone ? finished : active).map((p) => {
    const pr = progress(tasks.filter((t) => t.project_id === p.id));
    return { p, pr, r: risk(p, pr.pct, today) };
  }).sort((a, b) => (a.p.deadline ?? "9").localeCompare(b.p.deadline ?? "9"));

  return (
    <>
      <header className="ph">
        <h1>업무 관리 <small>진행 중 프로젝트 {active.length}개</small></h1>
        <div className="controls">
          <button type="button" className={`btn ${!showDone ? "primary" : ""}`} onClick={() => setShowDone(false)}>진행 중 {active.length}</button>
          <button type="button" className={`btn ${showDone ? "primary" : ""}`} onClick={() => setShowDone(true)}>완료 {finished.length}</button>
        </div>
      </header>

      {err && <div className="msg err">{err}</div>}

      <div className="card">
        <div className="sub" style={{ marginBottom: 6 }}>칸을 바로 고치면 저장됩니다. 프로젝트 명 옆 "열기"로 마일스톤과 할 일을 봅니다.</div>
        <div className="tbl-wrap">
          <table className="tbl left work-tbl" style={{ opacity: busy ? 0.6 : 1 }}>
            <thead>
              <tr><th>프로젝트</th><th>클라이언트</th><th>목표</th><th>데드라인</th><th>진행률</th><th>할 일</th><th>상태</th><th></th></tr>
            </thead>
            <tbody>
              {cards.length === 0 && <tr><td colSpan={8} style={{ color: "var(--muted)" }}>{showDone ? "완료한 프로젝트가 없습니다." : "아직 프로젝트가 없습니다. 아래에서 첫 프로젝트를 만들어 보세요."}</td></tr>}
              {cards.map(({ p, pr, r }) => (
                <tr key={p.id}>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <input className="cell-in" defaultValue={p.name} key={p.name} aria-label="프로젝트 명" style={{ fontWeight: 600, minWidth: 140 }} onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== p.name) save(p.id, { name: v }); else e.target.value = p.name; }} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
                      <Link href={`/app/admin/work/${p.id}`} className="pill">열기 ›</Link>
                    </span>
                  </td>
                  <td>
                    <select value={p.client_id ?? ""} aria-label="클라이언트" onChange={(e) => save(p.id, { client_id: e.target.value || null })}>
                      <option value="">없음</option>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </td>
                  <td style={{ width: "30%" }}><input className="cell-in" defaultValue={p.goal ?? ""} key={p.goal ?? ""} aria-label="목표" placeholder="목표 입력" style={{ width: "100%", minWidth: 200 }} onBlur={(e) => { const v = e.target.value.trim(); if (v !== (p.goal ?? "")) save(p.id, { goal: v }); }} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} /></td>
                  <td>
                    <input type="date" className="cell-in" defaultValue={p.deadline ?? ""} key={p.deadline ?? ""} aria-label="데드라인" onChange={(e) => save(p.id, { deadline: e.target.value || null })} />
                    {p.deadline && p.status === "active" && <small className={r === "late" ? "late" : ""} style={{ color: "var(--muted)", marginLeft: 4 }}>{ddayLabel(p.deadline, today)}</small>}
                  </td>
                  <td>
                    <span className="wt-prog"><Gauge pct={pr.pct} risk={r} /><b>{pr.pct}%</b></span>
                    {r !== "ok" && <span className={`pill tag-${r === "late" ? "red" : "orange"}`} style={{ marginLeft: 6, fontSize: 11.5 }}>{RISK_LABEL[r]}</span>}
                  </td>
                  <td style={{ color: "var(--text-2)" }}>{pr.done} / {pr.base}{pr.hold ? ` · 보류 ${pr.hold}` : ""}</td>
                  <td>
                    <select className={`pill tag-${p.status === "active" ? "blue" : "green"}`} value={p.status} aria-label="상태" onChange={(e) => save(p.id, { status: e.target.value as WorkProject["status"] })}>
                      <option value="active">진행 중</option><option value="done">완료</option>
                    </select>
                  </td>
                  <td><button type="button" className="btn danger" onClick={() => { if (confirm(`${p.name} 프로젝트를 삭제할까요? 마일스톤과 할 일 ${pr.total}건이 함께 지워집니다.`)) run(() => deleteWorkProject(p.id)); }}>삭제</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h2>프로젝트 추가</h2>
        <form action={action} className="form-row" style={{ alignItems: "flex-end" }}>
          <label className="f">프로젝트 명<input name="name" type="text" required /></label>
          <label className="f" style={{ flex: 1, minWidth: 240 }}>목표<input name="goal" type="text" placeholder="예) 11월 말까지 CPL 2만원 이하로 안정화" /></label>
          <label className="f">데드라인<input name="deadline" type="date" /></label>
          <label className="f">클라이언트
            <select name="client_id" defaultValue=""><option value="">없음</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </label>
          <button className="btn primary" type="submit" disabled={pending}>{pending ? "추가 중…" : "추가"}</button>
          {state && <div className={`msg ${state.ok ? "ok" : "err"}`} style={{ width: "100%" }}>{state.ok ? state.message : state.error}</div>}
        </form>
      </div>
    </>
  );
}

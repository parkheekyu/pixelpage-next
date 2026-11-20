"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createWorkProject } from "@/app/app/work-actions";
import type { ActionResult } from "@/app/app/actions";
import type { Client, WorkProject, WorkTask } from "@/lib/dash/types";
import { ddayLabel, progress, risk, type Risk } from "@/lib/dash/work";

const RISK_LABEL: Record<Risk, string> = { ok: "", slow: "진행 느림", late: "마감 지남" };

export function Gauge({ pct, risk: r = "ok" }: { pct: number; risk?: Risk }) {
  return <div className={`gauge r-${r}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div>;
}

export default function WorkProjects({ projects, tasks, clients, today }: { projects: WorkProject[]; tasks: WorkTask[]; clients: Client[]; today: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(createWorkProject, null);
  const [showDone, setShowDone] = useState(false);
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

      <div className="work-cards">
        {cards.length === 0 && <div className="hint">{showDone ? "완료한 프로젝트가 없습니다." : "아직 프로젝트가 없습니다. 아래에서 첫 프로젝트를 만들어 보세요."}</div>}
        {cards.map(({ p, pr, r }) => (
          <Link key={p.id} href={`/app/admin/work/${p.id}`} className="card work-card">
            <div className="wc-top">
              <strong>{p.name}</strong>
              {p.client_id && <span className="pill">{clients.find((c) => c.id === p.client_id)?.name}</span>}
            </div>
            <p className="wc-goal">{p.goal || <span style={{ color: "var(--muted)" }}>목표 미입력</span>}</p>
            <div className="wc-meta">
              <span>{p.deadline ? <>{p.deadline} <b className={r === "late" ? "late" : ""}>{p.status === "active" ? ddayLabel(p.deadline, today) : ""}</b></> : "데드라인 없음"}</span>
              {r !== "ok" && <span className={`pill tag-${r === "late" ? "red" : "orange"}`}>{RISK_LABEL[r]}</span>}
            </div>
            <Gauge pct={pr.pct} risk={r} />
            <div className="wc-foot"><b>{pr.pct}%</b><span>{pr.done} / {pr.base} 완료{pr.hold ? ` · 보류 ${pr.hold}` : ""}</span></div>
          </Link>
        ))}
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

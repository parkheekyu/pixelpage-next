"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createMilestone, deleteMilestone, deleteWorkProject, renameMilestone, updateWorkProject } from "@/app/app/work-actions";
import type { ActionResult } from "@/app/app/actions";
import type { Client, WorkMilestone, WorkProject, WorkProjectPatch, WorkTask } from "@/lib/dash/types";
import { ddayLabel, progress, risk } from "@/lib/dash/work";
import { Gauge } from "./WorkProjects";
import { TaskAdd, TaskRow, sortTasks, useTaskEdits } from "./WorkTasks";

export default function WorkProjectDetail({ project: p, milestones, tasks, clients, today }: { project: WorkProject; milestones: WorkMilestone[]; tasks: WorkTask[]; clients: Client[]; today: string }) {
  const router = useRouter();
  const edits = useTaskEdits(tasks);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [newMs, setNewMs] = useState("");
  const run = (fn: () => Promise<ActionResult>, after?: () => void) => start(async () => { setErr(null); const r = await fn(); if (!r.ok) setErr(r.error); else after?.(); });
  const save = (patch: WorkProjectPatch) => run(() => updateWorkProject(p.id, patch));

  const pr = progress(edits.view), r = risk(p, pr.pct, today);
  const loose = edits.view.filter((t) => !t.milestone_id || !milestones.some((m) => m.id === t.milestone_id));
  const blurSave = (key: "name" | "goal", cur: string) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { const v = e.target.value.trim(); if (v !== cur) { if (key === "name" && !v) e.target.value = cur; else save({ [key]: v }); } };

  return (
    <div style={{ opacity: pending ? 0.7 : 1 }}>
      <header className="ph">
        <h1><Link href="/app/admin/work" style={{ color: "var(--muted)", fontWeight: 400 }}>업무 관리 ›</Link> <input className="h-edit" defaultValue={p.name} aria-label="프로젝트 명" onBlur={blurSave("name", p.name)} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} /></h1>
        <div className="controls">
          <button type="button" className="btn" onClick={() => save({ status: p.status === "active" ? "done" : "active" })}>{p.status === "active" ? "프로젝트 완료 처리" : "다시 진행 중으로"}</button>
          <button type="button" className="btn danger" onClick={() => { if (confirm(`${p.name} 프로젝트를 삭제할까요? 마일스톤과 할 일 ${tasks.length}건이 함께 지워집니다.`)) run(() => deleteWorkProject(p.id), () => router.push("/app/admin/work")); }}>삭제</button>
        </div>
      </header>

      {(err || edits.err) && <div className="msg err">{err || edits.err}</div>}

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="form-row" style={{ alignItems: "flex-end", marginBottom: 14 }}>
          <label className="f" style={{ flex: 1, minWidth: 260 }}>목표<input type="text" defaultValue={p.goal ?? ""} placeholder="이 프로젝트로 이루려는 것" onBlur={blurSave("goal", p.goal ?? "")} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} /></label>
          <label className="f">데드라인<input type="date" defaultValue={p.deadline ?? ""} onChange={(e) => save({ deadline: e.target.value || null })} /></label>
          <label className="f">클라이언트
            <select value={p.client_id ?? ""} onChange={(e) => save({ client_id: e.target.value || null })}><option value="">없음</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </label>
        </div>
        <Gauge pct={pr.pct} risk={r} />
        <div className="wc-foot">
          <b>{pr.pct}%</b>
          <span>{pr.done} / {pr.base} 완료{pr.hold ? ` · 보류 ${pr.hold}` : ""}{p.deadline && p.status === "active" ? ` · ${ddayLabel(p.deadline, today)}` : ""}{r === "slow" ? " · 남은 기간에 비해 진행이 느립니다" : r === "late" ? " · 마감이 지났습니다" : ""}</span>
        </div>
      </div>

      {milestones.map((m, i) => {
        const list = edits.view.filter((t) => t.milestone_id === m.id).sort(sortTasks);
        const mp = progress(list);
        return (
          <section key={m.id} className="card milestone">
            <div className="ms-head">
              <span className={`ms-num ${mp.base > 0 && mp.pct === 100 ? "done" : ""}`}>{i + 1}</span>
              <input className="h-edit" defaultValue={m.title} aria-label="마일스톤 이름" onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== m.title) run(() => renameMilestone(m.id, v)); else e.target.value = m.title; }} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
              <small>{mp.done} / {mp.base}{mp.hold ? ` · 보류 ${mp.hold}` : ""}</small>
              <div style={{ width: 120 }}><Gauge pct={mp.pct} /></div>
              <button type="button" className="t-del" title="마일스톤 삭제" aria-label="마일스톤 삭제" onClick={() => { if (confirm(`"${m.title}" 마일스톤을 삭제할까요? 안에 있는 할 일 ${list.length}건은 '마일스톤 없음'으로 남습니다.`)) run(() => deleteMilestone(m.id)); }}>✕</button>
            </div>
            {list.map((t) => <TaskRow key={t.id} t={t} today={today} edits={edits} />)}
            <TaskAdd edits={edits} fixed={{ project_id: p.id, milestone_id: m.id, client_id: p.client_id }} placeholder="이 마일스톤까지 가기 위한 할 일을 적고 엔터" />
          </section>
        );
      })}

      <form className="card milestone-add" onSubmit={(e) => { e.preventDefault(); const v = newMs.trim(); if (v) run(() => createMilestone(p.id, v), () => setNewMs("")); }}>
        <input value={newMs} onChange={(e) => setNewMs(e.target.value)} placeholder="+ 마일스톤 추가 (예: 1단계 소재 테스트 완료)" aria-label="새 마일스톤" />
        <button className="btn primary" type="submit" disabled={!newMs.trim()}>추가</button>
      </form>

      <section className="card milestone">
        <div className="ms-head"><strong>마일스톤 없음</strong><small>{loose.length}건</small></div>
        {loose.sort(sortTasks).map((t) => <TaskRow key={t.id} t={t} today={today} edits={edits} />)}
        <TaskAdd edits={edits} fixed={{ project_id: p.id, milestone_id: null, client_id: p.client_id }} placeholder="마일스톤에 넣지 않을 할 일" />
      </section>
    </div>
  );
}

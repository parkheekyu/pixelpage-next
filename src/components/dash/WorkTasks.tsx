"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { X } from "lucide-react";
import { createTask, deleteTask, updateTask } from "@/app/app/work-actions";
import type { ActionResult } from "@/app/app/actions";
import { PRIORITIES, PRIORITY_LABEL, TASK_STATUSES, TASK_STATUS_LABEL, type Client, type Priority, type TaskStatus, type WorkProject, type WorkTask, type WorkTaskPatch } from "@/lib/dash/types";
import { GROUP_LABEL, GROUP_ORDER, ddayLabel, daysLeft, groupOf, type TaskGroup } from "@/lib/dash/work";

const PRI_TAG: Record<Priority, string> = { high: "red", mid: "blue", low: "gray" };
const ST_TAG: Record<TaskStatus, string> = { todo: "blue", done: "green", hold: "orange" };
const PRI_RANK: Record<Priority, number> = { high: 0, mid: 1, low: 2 };
export const sortTasks = (a: WorkTask, b: WorkTask) =>
  PRI_RANK[a.priority] - PRI_RANK[b.priority] || (a.deadline ?? "9").localeCompare(b.deadline ?? "9") || a.created_at.localeCompare(b.created_at);

/** 할 일을 고치는 공통 훅: 체크는 화면에 먼저 반영하고 서버에 저장한다 */
export function useTaskEdits(tasks: WorkTask[]) {
  const [, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [view, apply] = useOptimistic(tasks, (cur: WorkTask[], a: { id: string; patch: WorkTaskPatch | null }) =>
    a.patch === null ? cur.filter((t) => t.id !== a.id) : cur.map((t) => (t.id === a.id ? { ...t, ...a.patch } : t)));
  const run = (fn: () => Promise<ActionResult>, opt?: { id: string; patch: WorkTaskPatch | null }) =>
    start(async () => { setErr(null); if (opt) apply(opt); const r = await fn(); if (!r.ok) setErr(r.error); });
  return {
    view, err,
    save: (id: string, patch: WorkTaskPatch) => run(() => updateTask(id, patch), { id, patch }),
    remove: (id: string) => run(() => deleteTask(id), { id, patch: null }),
    add: (input: WorkTaskPatch) => run(() => createTask(input)),
  };
}
type Edits = ReturnType<typeof useTaskEdits>;

/** 할 일 한 줄. context 를 주면 클라이언트·프로젝트 칸도 보여 준다 (전체 업무 리스트용). */
export function TaskRow({ t, today, edits, context }: { t: WorkTask; today: string; edits: Edits; context?: { clients: Client[]; projects: WorkProject[] } }) {
  const late = t.status === "todo" && t.deadline && daysLeft(t.deadline, today) < 0;
  const project = context?.projects.find((p) => p.id === t.project_id);
  return (
    <div className={`task ${t.status}`}>
      <input type="checkbox" className="chk" checked={t.status === "done"} aria-label="완료" onChange={(e) => edits.save(t.id, { status: e.target.checked ? "done" : "todo" })} />
      <div className="t-main">
        <input className="t-title" defaultValue={t.title} key={t.title} aria-label="할 일" onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== t.title) edits.save(t.id, { title: v }); else e.target.value = t.title; }} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
        {t.status === "hold" && (
          <input className="t-hold" defaultValue={t.hold_reason ?? ""} key={t.hold_reason ?? ""} placeholder="보류 사유 (예: 고객사 회신 대기)" aria-label="보류 사유" onBlur={(e) => { const v = e.target.value.trim(); if (v !== (t.hold_reason ?? "")) edits.save(t.id, { hold_reason: v }); }} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
        )}
      </div>
      {context && (
        <>
          <select className="t-sel" value={t.client_id ?? ""} aria-label="클라이언트" onChange={(e) => edits.save(t.id, { client_id: e.target.value || null })}>
            <option value="">클라이언트 없음</option>
            {context.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {project
            ? <Link className="t-proj" href={`/app/admin/work/${project.id}`} title="프로젝트 열기">{project.name}</Link>
            : <select className="t-sel" value="" aria-label="프로젝트" onChange={(e) => e.target.value && edits.save(t.id, { project_id: e.target.value })}>
                <option value="">프로젝트 없음</option>
                {context.projects.filter((p) => p.status === "active").map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>}
        </>
      )}
      <span className="t-date">
        <input type="date" value={t.deadline ?? ""} aria-label="데드라인" onChange={(e) => edits.save(t.id, { deadline: e.target.value || null })} />
        {t.deadline && t.status !== "done" && <small className={late ? "late" : ""}>{ddayLabel(t.deadline, today)}</small>}
      </span>
      <select className={`pill tag-${PRI_TAG[t.priority]}`} value={t.priority} aria-label="우선순위" onChange={(e) => edits.save(t.id, { priority: e.target.value as Priority })}>
        {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
      </select>
      <select className={`pill tag-${ST_TAG[t.status]}`} value={t.status} aria-label="상태" onChange={(e) => edits.save(t.id, { status: e.target.value as TaskStatus })}>
        {TASK_STATUSES.map((s) => <option key={s} value={s}>{TASK_STATUS_LABEL[s]}</option>)}
      </select>
      <button type="button" className="t-del" title="삭제" aria-label="삭제" onClick={() => { if (confirm(`"${t.title}" 을(를) 삭제할까요?`)) edits.remove(t.id); }}><X size={14} aria-hidden /></button>
    </div>
  );
}

/** 한 줄 빠른 입력: 적고 엔터. fixed 를 주면 그 프로젝트·마일스톤에 바로 들어간다. */
export function TaskAdd({ edits, fixed, context, placeholder }: { edits: Edits; fixed?: WorkTaskPatch; context?: { clients: Client[]; projects: WorkProject[] }; placeholder?: string }) {
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<Priority>("mid");
  const projects = context?.projects.filter((p) => p.status === "active" && (!clientId || !p.client_id || p.client_id === clientId)) ?? [];
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    edits.add({ title, deadline: deadline || null, priority, client_id: clientId || null, project_id: projectId || null, ...fixed });
    setTitle("");
  };
  return (
    <form className="task-add" onSubmit={submit}>
      <input className="t-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={placeholder ?? "할 일을 적고 엔터"} aria-label="새 할 일" />
      {context && (
        <>
          <select className="t-sel" value={clientId} aria-label="클라이언트" onChange={(e) => { setClientId(e.target.value); setProjectId(""); }}>
            <option value="">클라이언트</option>
            {context.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="t-sel" value={projectId} aria-label="프로젝트" onChange={(e) => { const p = context.projects.find((x) => x.id === e.target.value); setProjectId(e.target.value); if (p?.client_id) setClientId(p.client_id); }}>
            <option value="">프로젝트</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </>
      )}
      <input type="date" value={deadline} aria-label="데드라인" onChange={(e) => setDeadline(e.target.value)} />
      <select value={priority} aria-label="우선순위" onChange={(e) => setPriority(e.target.value as Priority)}>
        {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
      </select>
      <button className="btn primary" type="submit" disabled={!title.trim()}>추가</button>
    </form>
  );
}

/** 전체 업무 리스트: 지연 / 오늘 / 이번 주 / 이후 / 기한 없음 / 보류 / 완료 로 묶어 보여 준다 */
export default function WorkTaskBoard({ tasks, clients, projects, today }: { tasks: WorkTask[]; clients: Client[]; projects: WorkProject[]; today: string }) {
  const edits = useTaskEdits(tasks);
  const [showDone, setShowDone] = useState(false);
  const context = { clients, projects };
  const groups = new Map<TaskGroup, WorkTask[]>();
  for (const t of edits.view) { const g = groupOf(t, today); groups.set(g, [...(groups.get(g) ?? []), t]); }
  const open = edits.view.filter((t) => t.status === "todo").length;
  const doneList = (groups.get("done") ?? []).sort((a, b) => (b.done_at ?? "").localeCompare(a.done_at ?? ""));

  return (
    <div className="card work-board" style={{ marginBottom: 12 }}>
      <h2>업무 리스트 <small style={{ color: "var(--muted)", fontWeight: 400, marginLeft: 6 }}>진행 {open}건{groups.get("late")?.length ? ` · 지연 ${groups.get("late")!.length}건` : ""}</small></h2>
      <div className="sub">체크하면 프로젝트 진행률에 바로 반영됩니다. <Link href="/app/admin/work" style={{ color: "var(--s1)" }}>프로젝트 보기 ›</Link></div>
      <TaskAdd edits={edits} context={context} />
      {edits.err && <div className="msg err">{edits.err}</div>}
      {edits.view.length === 0 && <div className="hint">아직 업무가 없습니다. 위 칸에 적고 엔터를 누르면 추가됩니다.</div>}
      {GROUP_ORDER.filter((g) => g !== "done").map((g) => {
        const list = (groups.get(g) ?? []).sort(sortTasks);
        if (list.length === 0) return null;
        return (
          <section key={g} className={`task-group g-${g}`}>
            <h3>{GROUP_LABEL[g]} <small>{list.length}</small></h3>
            {list.map((t) => <TaskRow key={t.id} t={t} today={today} edits={edits} context={context} />)}
          </section>
        );
      })}
      {doneList.length > 0 && (
        <section className="task-group g-done">
          <h3><button type="button" className="link" onClick={() => setShowDone((v) => !v)}>{showDone ? "▾" : "▸"} 완료 <small>{doneList.length}</small></button></h3>
          {showDone && doneList.slice(0, 50).map((t) => <TaskRow key={t.id} t={t} today={today} edits={edits} context={context} />)}
        </section>
      )}
    </div>
  );
}

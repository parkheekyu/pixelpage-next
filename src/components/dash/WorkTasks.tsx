"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { createTask, deleteTask, updateTask } from "@/app/app/work-actions";
import type { ActionResult } from "@/app/app/actions";
import { PRIORITIES, PRIORITY_LABEL, TASK_STATUSES, TASK_STATUS_LABEL, type Client, type Priority, type TaskStatus, type WorkProject, type WorkTask, type WorkTaskPatch } from "@/lib/dash/types";
import { ddayLabel, daysLeft } from "@/lib/dash/work";

const PRI_TAG: Record<Priority, string> = { high: "red", mid: "blue", low: "gray" };
const ST_TAG: Record<TaskStatus, string> = { todo: "blue", done: "green", hold: "orange" };
const PRI_RANK: Record<Priority, number> = { high: 0, mid: 1, low: 2 };
export const sortTasks = (a: WorkTask, b: WorkTask) =>
  PRI_RANK[a.priority] - PRI_RANK[b.priority] || (a.deadline ?? "9").localeCompare(b.deadline ?? "9") || a.created_at.localeCompare(b.created_at);

/** 화면에 들어올 때 뒤에서 한 번 서버 값을 다시 받는다. 다른 화면에서 고친 업무가 캐시된 예전 값으로 보이지 않게 한다. */
export function useFreshOnMount() {
  const router = useRouter();
  const [, start] = useTransition();
  useEffect(() => { start(() => router.refresh()); }, [router]);
}

/** 할 일을 고치는 공통 훅: 화면을 먼저 바꾸고 서버에는 뒤에서 저장한다. 저장이 실패하면 서버 값으로 되돌린다. */
export function useTaskEdits(tasks: WorkTask[]) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [view, setView] = useState(tasks);
  const [seen, setSeen] = useState(tasks);
  const [busy, setBusy] = useState(0); // 저장 중인 요청 수
  // 서버에서 새 목록이 오면 그걸로 맞춘다. 저장 중일 때는 방금 고친 내용이 덮이지 않게 기다린다.
  if (seen !== tasks && busy === 0) { setSeen(tasks); setView(tasks); }
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, startRefresh] = useTransition();
  const send = (fn: () => Promise<ActionResult>) => {
    setErr(null);
    setBusy((n) => n + 1);
    if (timer.current) clearTimeout(timer.current);
    fn()
      .then((r) => { if (!r.ok) setErr(r.error); })
      .catch(() => setErr("저장하지 못했습니다. 다시 시도해 주세요."))
      .finally(() => {
        setBusy((n) => n - 1);
        // 입력이 잠잠해지면 뒤에서 조용히 서버 값과 맞춘다 (다른 화면에 다녀와도 최신 상태가 보이게)
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => startRefresh(() => router.refresh()), 1500);
      });
  };
  return {
    view, err,
    save: (id: string, patch: WorkTaskPatch) => {
      const local: Partial<WorkTask> = { ...patch };
      if (patch.status) { local.done_at = patch.status === "done" ? new Date().toISOString() : null; if (patch.status !== "hold") local.hold_reason = null; }
      setView((cur) => cur.map((t) => (t.id === id ? { ...t, ...local } : t)));
      send(() => updateTask(id, patch));
    },
    remove: (id: string) => { setView((cur) => cur.filter((t) => t.id !== id)); send(() => deleteTask(id)); },
    add: (input: WorkTaskPatch) => {
      const id = crypto.randomUUID();
      const row: WorkTask = { id, title: (input.title ?? "").trim(), client_id: input.client_id ?? null, project_id: input.project_id ?? null, milestone_id: input.milestone_id ?? null, deadline: input.deadline ?? null, do_date: input.do_date ?? null, priority: input.priority ?? "mid", status: "todo", hold_reason: null, done_at: null, created_at: new Date().toISOString() };
      setView((cur) => [...cur, row]);
      send(() => createTask({ ...input, id }));
    },
  };
}
export type Edits = ReturnType<typeof useTaskEdits>;

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

"use client";

import DateInput from "./DateInput";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createMilestone, deleteMilestone, deleteWorkProject, renameMilestone, reorderMilestones, updateWorkProject } from "@/app/app/work-actions";
import type { ActionResult } from "@/app/app/actions";
import type { Client, WorkMilestone, WorkProject, WorkProjectPatch, WorkTask } from "@/lib/dash/types";
import { ddayLabel, progress, risk } from "@/lib/dash/work";
import { Check, Flag, GripVertical, Plane, Rocket, Send, Sparkles } from "lucide-react";
import { Gauge } from "./WorkProjects";
import { TaskAdd, TaskRow, sortTasks, useFreshOnMount, useTaskEdits, type RowDnd } from "./WorkTasks";

export default function WorkProjectDetail({ project: p, milestones: msProp, tasks, clients, today }: { project: WorkProject; milestones: WorkMilestone[]; tasks: WorkTask[]; clients: Client[]; today: string }) {
  const router = useRouter();
  useFreshOnMount();
  const edits = useTaskEdits(tasks);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [newMs, setNewMs] = useState("");
  const run = (fn: () => Promise<ActionResult>, after?: () => void) => start(async () => { setErr(null); const r = await fn(); if (!r.ok) setErr(r.error); else after?.(); });
  const save = (patch: WorkProjectPatch) => run(() => updateWorkProject(p.id, patch));

  // 마일스톤 순서: 끌어다 놓으면 화면을 먼저 바꾸고 뒤에서 저장한다
  const [msIds, setMsIds] = useState<string[] | null>(null);
  const [seenMs, setSeenMs] = useState(msProp);
  if (seenMs !== msProp) { setSeenMs(msProp); setMsIds(null); }
  const milestones = msIds ? msIds.map((id) => msProp.find((m) => m.id === id)).filter((m): m is WorkMilestone => !!m) : msProp;

  // 끌어다 놓기: 할 일은 같은 마일스톤 안에서 순서를 바꾸거나 다른 마일스톤으로 옮기고, 마일스톤은 서로 자리를 바꾼다
  const [drag, setDrag] = useState<{ kind: "task" | "ms"; id: string } | null>(null);
  const [over, setOver] = useState<{ id: string; after: boolean } | null>(null);
  const clear = () => { setDrag(null); setOver(null); };
  const groupOf = (t: WorkTask) => (t.milestone_id && milestones.some((m) => m.id === t.milestone_id) ? t.milestone_id : null);
  const listOf = (g: string | null) => edits.view.filter((t) => groupOf(t) === g).sort(sortTasks);
  const half = (e: React.DragEvent) => { const r = e.currentTarget.getBoundingClientRect(); return e.clientY > r.top + r.height / 2; };
  const mark = (id: string, after: boolean) => { if (over?.id !== id || over.after !== after) setOver({ id, after }); };
  const dragStart = (kind: "task" | "ms", id: string, sel: string) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", id);
    const el = e.currentTarget.closest(sel); if (el) e.dataTransfer.setDragImage(el, 14, 14);
    setDrag({ kind, id });
  };
  /** 끌던 할 일을 g 마일스톤의 anchor 앞(또는 뒤)에 놓는다. anchor 가 없으면 맨 아래. */
  const dropTask = (g: string | null, anchor: string | null, after: boolean) => {
    if (!drag || drag.kind !== "task" || drag.id === anchor) return clear();
    const ids = listOf(g).map((t) => t.id).filter((id) => id !== drag.id);
    const i = anchor ? ids.indexOf(anchor) : -1;
    ids.splice(i < 0 ? ids.length : i + (after ? 1 : 0), 0, drag.id);
    edits.reorder(p.id, g, ids);
    clear();
  };
  const rowDnd = (t: WorkTask, g: string | null): RowDnd => ({
    cls: drag?.kind === "task" ? (drag.id === t.id ? " dragging" : over?.id === t.id ? (over.after ? " drop-after" : " drop-before") : "") : "",
    row: {
      onDragOver: (e) => { if (drag?.kind !== "task") return; e.preventDefault(); e.stopPropagation(); mark(t.id, half(e)); },
      onDrop: (e) => { if (drag?.kind !== "task") return; e.preventDefault(); e.stopPropagation(); dropTask(g, t.id, half(e)); },
    },
    handle: { onDragStart: dragStart("task", t.id, ".task"), onDragEnd: clear },
  });
  /** 마일스톤 카드: 할 일을 빈 곳에 놓으면 맨 아래로, 마일스톤을 놓으면 그 앞뒤로 */
  const secDnd = (g: string | null) => ({
    onDragOver: (e: React.DragEvent) => {
      if (!drag || (drag.kind === "ms" && !g)) return;
      e.preventDefault();
      if (drag.kind === "task") mark(`end:${g}`, true); else mark(g!, half(e));
    },
    onDrop: (e: React.DragEvent) => {
      if (!drag || (drag.kind === "ms" && !g)) return;
      e.preventDefault();
      if (drag.kind === "task") return dropTask(g, null, true);
      if (drag.id !== g) {
        const ids = milestones.map((m) => m.id).filter((id) => id !== drag.id);
        ids.splice(ids.indexOf(g!) + (half(e) ? 1 : 0), 0, drag.id);
        setMsIds(ids);
        run(() => reorderMilestones(p.id, ids));
      }
      clear();
    },
  });
  const secCls = (g: string | null) => (!drag ? "" : drag.kind === "task" ? (over?.id === `end:${g}` ? " drop-in" : "") : drag.id === g ? " dragging" : over?.id === g ? (over.after ? " drop-after" : " drop-before") : "");

  const pr = progress(edits.view), r = risk(p, pr.pct, today);
  const loose = edits.view.filter((t) => !t.milestone_id || !milestones.some((m) => m.id === t.milestone_id));
  const blurSave = (key: "name" | "goal", cur: string) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { const v = e.target.value.trim(); if (v !== cur) { if (key === "name" && !v) e.target.value = cur; else save({ [key]: v }); } };

  return (
    <div style={{ opacity: pending ? 0.7 : 1 }}>
      <header className="ph">
        <h1><Link href="/app/admin/work" style={{ color: "var(--muted)", fontWeight: 400 }}>프로젝트 관리 ›</Link> <input className="h-edit" defaultValue={p.name} aria-label="프로젝트 명" onBlur={blurSave("name", p.name)} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} /></h1>
        <div className="controls">
          <button type="button" className="btn" onClick={() => save({ status: p.status === "active" ? "done" : "active" })}>{p.status === "active" ? "프로젝트 완료 처리" : "다시 진행 중으로"}</button>
          <button type="button" className="btn danger" onClick={() => { if (confirm(`${p.name} 프로젝트를 삭제할까요? 마일스톤과 할 일 ${tasks.length}건이 함께 지워집니다.`)) run(() => deleteWorkProject(p.id), () => router.push("/app/admin/work")); }}>삭제</button>
        </div>
      </header>

      {(err || edits.err) && <div className="msg err">{err || edits.err}</div>}

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="form-row" style={{ alignItems: "flex-end", marginBottom: 14 }}>
          <label className="f" style={{ flex: 1, minWidth: 260 }}>목표<input type="text" defaultValue={p.goal ?? ""} placeholder="이 프로젝트로 이루려는 것" onBlur={blurSave("goal", p.goal ?? "")} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} /></label>
          <label className="f">데드라인<DateInput value={p.deadline} label="데드라인" onCommit={(v) => save({ deadline: v })} /></label>
          <label className="f">클라이언트
            <select value={p.client_id ?? ""} onChange={(e) => save({ client_id: e.target.value || null })}><option value="">없음</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </label>
        </div>
        <Roadmap steps={milestones.map((m) => ({ id: m.id, title: m.title, ...progress(edits.view.filter((t) => t.milestone_id === m.id)) }))} goal={p.goal ?? ""} overall={pr.pct} rest={progress(loose).pct} />
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
          <section key={m.id} id={`ms-${m.id}`} className={`card milestone${secCls(m.id)}`} {...secDnd(m.id)}>
            <div className="ms-head">
              <span className="grip" draggable title="끌어서 마일스톤 순서 바꾸기" aria-hidden onDragStart={dragStart("ms", m.id, ".milestone")} onDragEnd={clear}><GripVertical size={15} /></span>
              <span className={`ms-num ${mp.base > 0 && mp.pct === 100 ? "done" : ""}`}>{i + 1}</span>
              <input className="h-edit" defaultValue={m.title} aria-label="마일스톤 이름" onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== m.title) run(() => renameMilestone(m.id, v)); else e.target.value = m.title; }} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
              <small>{mp.done} / {mp.base}{mp.hold ? ` · 보류 ${mp.hold}` : ""}</small>
              <div style={{ width: 120 }}><Gauge pct={mp.pct} /></div>
              <button type="button" className="t-del" title="마일스톤 삭제" aria-label="마일스톤 삭제" onClick={() => { if (confirm(`"${m.title}" 마일스톤을 삭제할까요? 안에 있는 할 일 ${list.length}건은 '마일스톤 없음'으로 남습니다.`)) run(() => deleteMilestone(m.id)); }}>✕</button>
            </div>
            {list.map((t) => <TaskRow key={t.id} t={t} today={today} edits={edits} todayBtn dnd={rowDnd(t, m.id)} />)}
            <TaskAdd edits={edits} fixed={{ project_id: p.id, milestone_id: m.id, client_id: p.client_id }} placeholder="이 마일스톤까지 가기 위한 할 일을 적고 엔터" />
          </section>
        );
      })}

      <form className="card milestone-add" onSubmit={(e) => { e.preventDefault(); const v = newMs.trim(); if (v) run(() => createMilestone(p.id, v), () => setNewMs("")); }}>
        <input value={newMs} onChange={(e) => setNewMs(e.target.value)} placeholder="+ 마일스톤 추가 (예: 1단계 소재 테스트 완료)" aria-label="새 마일스톤" />
        <button className="btn primary" type="submit" disabled={!newMs.trim()}>추가</button>
      </form>

      <section className={`card milestone${secCls(null)}`} {...secDnd(null)}>
        <div className="ms-head"><strong>마일스톤 없음</strong><small>{loose.length}건</small></div>
        {loose.sort(sortTasks).map((t) => <TaskRow key={t.id} t={t} today={today} edits={edits} todayBtn dnd={rowDnd(t, null)} />)}
        <TaskAdd edits={edits} fixed={{ project_id: p.id, milestone_id: null, client_id: p.client_id }} placeholder="마일스톤에 넣지 않을 할 일" />
      </section>
    </div>
  );
}

const LEVELS = ["종이비행기", "비행기", "로켓", "불꽃 로켓", "반짝이는 로켓"];

/** 마일스톤 여정 그림: 출발점에서 마일스톤을 차례로 지나 맨 끝 깃발(프로젝트 최종 목표)까지. 로켓은 진행 중인 마일스톤 구간 안에서 완료 비율만큼 나아가고, 마일스톤을 다 끝낸 뒤에는 남은 할 일 비율만큼 깃발로 다가간다. */
function Roadmap({ steps, goal, overall, rest }: { steps: { id: string; title: string; done: number; base: number; pct: number }[]; goal: string; overall: number; rest: number }) {
  const n = steps.length, seg = n + 1; // 마지막 마일스톤에서 깃발까지가 한 구간 더 있다
  const finished = (st: { base: number; pct: number }) => st.base > 0 && st.pct >= 100;
  const cur = steps.findIndex((st) => !finished(st)); // 아직 안 끝난 첫 마일스톤
  const arrived = overall >= 100 && cur === -1;
  const pos = arrived ? 100 : cur === -1 ? ((n + Math.min(rest, 95) / 100) / seg) * 100 : ((cur + steps[cur].pct / 100) / seg) * 100;
  // 마일스톤을 통과할 때마다 탈것이 한 단계씩 발전한다: 종이비행기 → 비행기 → 로켓 → 불꽃 로켓 → 반짝이는 로켓. 마일스톤이 4개보다 많으면 비율로 나눈다.
  const passed = cur === -1 ? n : cur;
  const lv = arrived ? 4 : n === 0 ? 2 : Math.min(4, n <= 4 ? passed : Math.floor((passed / n) * 4));
  const Craft = lv === 0 ? Send : lv === 1 ? Plane : Rocket;
  return (
    <div className="roadmap-wrap">
      <div className="roadmap" style={{ minWidth: seg * 96 }}>
        <div className="rm-line"><i style={{ width: `${pos}%` }} /></div>
        <span className="rm-start" title="출발" />
        {steps.map((st, i) => {
          const state = finished(st) ? "done" : i === cur ? "cur" : "todo";
          return (
            <a key={st.id} href={`#ms-${st.id}`} className={`rm-node ${state}`} style={{ left: `${((i + 1) / seg) * 100}%` }} title={`${st.title} · ${st.done}/${st.base}`}>
              <span className="rm-dot">{state === "done" ? <Check size={14} aria-hidden /> : i + 1}</span>
              <span className="rm-label">{st.title}</span>
              <small>{st.base > 0 ? `${st.done}/${st.base}` : "할 일 없음"}</small>
            </a>
          );
        })}
        <span className={`rm-node rm-goal ${arrived ? "done" : cur === -1 ? "cur" : "todo"}`} style={{ left: "100%" }} title={goal || "최종 목표"}>
          <span className="rm-dot"><Flag size={13} aria-hidden /></span>
          <span className="rm-label">{goal || "최종 목표"}</span>
          <small>{overall}%</small>
        </span>
        <span className={`rm-rocket lv${lv} ${arrived ? "arrived" : ""}`} style={{ left: `${pos}%` }} title={LEVELS[lv]} aria-hidden>
          {lv >= 3 && <i className="rm-flame" />}
          <Craft size={15 + lv * 2} />
          {lv >= 4 && <Sparkles className="rm-spark" size={13} />}
        </span>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, FolderInput, X } from "lucide-react";
import type { Client, WorkMilestone, WorkProject, WorkTask } from "@/lib/dash/types";
import { addDays, dayLabel, daysLeft, ddayLabel, dowOf, progress, risk, weekStart, type Risk } from "@/lib/dash/work";
import { Gauge } from "./WorkProjects";
import { sortTasks, useFreshOnMount, useTaskEdits, type Edits } from "./WorkTasks";

const RISK_LABEL: Record<Risk, string> = { ok: "", slow: "진행 느림", late: "마감 지남" };
const ST_RANK = { todo: 0, hold: 1, done: 2 } as const;
/** 하루 목록 순서: 할 일 → 보류 → 끝낸 일 */
const sortDay = (a: WorkTask, b: WorkTask) => ST_RANK[a.status] - ST_RANK[b.status] || (a.status === "done" ? (a.done_at ?? "").localeCompare(b.done_at ?? "") : sortTasks(a, b));
const md = (s: string) => `${+s.slice(5, 7)}/${+s.slice(8, 10)}`;

/** 할 일 한 줄. 프로젝트에서 가져온 일은 프로젝트 이름이 붙고, 체크하면 프로젝트 진행률에 그대로 반영된다. */
function TodoRow({ t, today, edits, projects, children }: { t: WorkTask; today: string; edits: Edits; projects: WorkProject[]; children?: React.ReactNode }) {
  const project = projects.find((p) => p.id === t.project_id);
  const late = t.status === "todo" && t.deadline && daysLeft(t.deadline, today) < 0;
  return (
    <div className={`td-row ${t.status}`}>
      <input type="checkbox" className="chk" checked={t.status === "done"} aria-label="완료" onChange={(e) => edits.save(t.id, { status: e.target.checked ? "done" : "todo" })} />
      <input className="td-title" defaultValue={t.title} key={t.title} aria-label="할 일" onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== t.title) edits.save(t.id, { title: v }); else e.target.value = t.title; }} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
      {t.status === "hold" && <span className="pill tag-orange">보류</span>}
      {project && <Link className="td-proj" href={`/app/admin/work/${project.id}`} title="프로젝트 열기">{project.name}</Link>}
      {t.deadline && t.status !== "done" && <small className={`td-due ${late ? "late" : ""}`}>마감 {ddayLabel(t.deadline, today)}</small>}
      <span className="td-act">{children}</span>
    </div>
  );
}

/** 목록에서 빼기: 프로젝트 업무는 날짜만 비우고(프로젝트에 남는다), 여기서 만든 일은 지운다 */
function RemoveBtn({ t, edits }: { t: WorkTask; edits: Edits }) {
  return t.project_id
    ? <button type="button" className="t-del" title="이 날 목록에서 빼기 (프로젝트에는 남습니다)" aria-label="목록에서 빼기" onClick={() => edits.save(t.id, { do_date: null })}><X size={14} aria-hidden /></button>
    : <button type="button" className="t-del" title="삭제" aria-label="삭제" onClick={() => { if (confirm(`"${t.title}" 을(를) 삭제할까요?`)) edits.remove(t.id); }}><X size={14} aria-hidden /></button>;
}

function QuickAdd({ edits, day, projects, placeholder }: { edits: Edits; day: string; projects?: WorkProject[]; placeholder: string }) {
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  return (
    <form className="td-add" onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; edits.add({ title, do_date: day, project_id: projectId || null }); setTitle(""); }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={placeholder} aria-label="새 할 일" />
      {projects && projects.length > 0 && (
        <select value={projectId} aria-label="프로젝트" title="프로젝트를 고르면 그 프로젝트의 업무로도 들어갑니다" onChange={(e) => setProjectId(e.target.value)}>
          <option value="">프로젝트 없음</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      )}
      <button className="btn primary" type="submit" disabled={!title.trim()}>추가</button>
    </form>
  );
}

function DayProgress({ list }: { list: WorkTask[] }) {
  const pr = progress(list);
  if (list.length === 0) return null;
  return <div className="td-prog"><Gauge pct={pr.pct} /><b>{pr.done} / {pr.base}</b></div>;
}

/** 업무 관리: 날짜별 할 일 목록. 프로젝트 관리의 업무를 골라 가져올 수 있다. */
export default function TodoClient({ tasks, projects, milestones, today }: { tasks: WorkTask[]; projects: WorkProject[]; milestones: WorkMilestone[]; clients?: Client[]; today: string }) {
  useFreshOnMount();
  const edits = useTaskEdits(tasks);
  const [day, setDay] = useState(today);
  const [picking, setPicking] = useState(false);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [pickProject, setPickProject] = useState("");
  const all = edits.view;
  const active = projects.filter((p) => p.status === "active");

  const list = all.filter((t) => t.do_date === day).sort(sortDay);
  const left = list.filter((t) => t.status === "todo").length;
  const isToday = day === today;
  const overdue = all.filter((t) => t.status === "todo" && t.do_date && t.do_date < today).sort((a, b) => a.do_date!.localeCompare(b.do_date!));
  const undated = all.filter((t) => !t.project_id && !t.do_date && t.status !== "done").sort(sortTasks);
  // 마감이 오늘까지인데 아직 어느 날에도 안 넣은 프로젝트 업무
  const dueNow = all.filter((t) => t.project_id && t.status === "todo" && !t.do_date && t.deadline && t.deadline <= today);
  const week = Array.from({ length: 7 }, (_, i) => addDays(weekStart(day), i));

  // 가져올 수 있는 업무: 아직 안 끝났고 이 날 목록에 없는 프로젝트 업무
  const cands = all.filter((t) => t.project_id && t.status === "todo" && t.do_date !== day);
  const pickList = active.filter((p) => !pickProject || p.id === pickProject).map((p) => {
    const mine = cands.filter((t) => t.project_id === p.id);
    const ms = milestones.filter((m) => m.project_id === p.id);
    const groups = [...ms.map((m) => ({ key: m.id, title: m.title, items: mine.filter((t) => t.milestone_id === m.id).sort(sortTasks) })),
      { key: "none", title: "마일스톤 없음", items: mine.filter((t) => !t.milestone_id || !ms.some((m) => m.id === t.milestone_id)).sort(sortTasks) }].filter((g) => g.items.length > 0);
    return { p, groups, count: mine.length };
  });
  const toggle = (ids: string[], on: boolean) => setSel((cur) => { const n = new Set(cur); ids.forEach((id) => (on ? n.add(id) : n.delete(id))); return n; });
  const bring = () => { sel.forEach((id) => edits.save(id, { do_date: day })); setSel(new Set()); setPicking(false); };
  const moveAll = (items: WorkTask[], to: string) => items.forEach((t) => edits.save(t.id, { do_date: to }));

  return (
    <div className="pg">
      <header className="ph">
        <h1>업무 관리 <small>{isToday ? "오늘" : dayLabel(day)} 할 일 {list.length}건{list.length > 0 ? ` · 남은 일 ${left}건` : ""}</small></h1>
        <div className="controls">
          <span className="lg-step">
            <button type="button" className="btn" aria-label="전날" title="전날" onClick={() => setDay(addDays(day, -1))}><ChevronLeft size={16} aria-hidden /></button>
            <button type="button" className="btn" aria-label="다음 날" title="다음 날" onClick={() => setDay(addDays(day, 1))}><ChevronRight size={16} aria-hidden /></button>
          </span>
          <input type="date" value={day} aria-label="날짜" onChange={(e) => e.target.value && setDay(e.target.value)} />
          {!isToday && <button type="button" className="btn" onClick={() => setDay(today)}>오늘로</button>}
        </div>
      </header>

      <div className="td-week" role="tablist" aria-label="이번 주">
        {week.map((d) => {
          const items = all.filter((t) => t.do_date === d), done = items.filter((t) => t.status === "done").length;
          return (
            <button key={d} type="button" role="tab" aria-selected={d === day} className={`${d === day ? "on" : ""}${d === today ? " today" : ""}`} onClick={() => setDay(d)}>
              <small>{dowOf(d)}</small><b>{+d.slice(8, 10)}</b>
              <span className={items.length > 0 && done === items.length ? "all" : ""}>{items.length > 0 ? `${done}/${items.length}` : "·"}</span>
            </button>
          );
        })}
      </div>

      {edits.err && <div className="msg err">{edits.err}</div>}

      <div className="card td-card">
        <div className="td-head">
          <h2>{isToday ? "오늘 할 일" : `${dayLabel(day)} 할 일`}</h2>
          <DayProgress list={list} />
        </div>
        <div className="td-addrow">
          <QuickAdd edits={edits} day={day} projects={active} placeholder="할 일을 적고 엔터" />
          <button type="button" className={`btn ${picking ? "on" : ""}`} onClick={() => { setPicking((v) => !v); setSel(new Set()); }}><FolderInput size={15} aria-hidden /> 프로젝트에서 가져오기</button>
        </div>

        {picking && (
          <div className="td-pick">
            <div className="td-pick-head">
              <b>가져올 업무를 고르세요</b>
              {active.length > 1 && (
                <select value={pickProject} aria-label="프로젝트" onChange={(e) => setPickProject(e.target.value)}>
                  <option value="">모든 프로젝트</option>
                  {active.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
            </div>
            {pickList.every((x) => x.count === 0) && <div className="hint">가져올 업무가 없습니다. 진행 중인 프로젝트의 남은 업무가 여기에 나옵니다.</div>}
            {pickList.filter((x) => x.count > 0).map(({ p, groups }) => {
              const ids = groups.flatMap((g) => g.items.map((t) => t.id)), allOn = ids.every((id) => sel.has(id));
              return (
                <section key={p.id}>
                  <h3>{p.name} <small>남은 업무 {ids.length}건</small> <button type="button" className="link" onClick={() => toggle(ids, !allOn)}>{allOn ? "전체 해제" : "전체 선택"}</button></h3>
                  {groups.map((g) => (
                    <div key={g.key} className="td-pick-g">
                      <h4>{g.title}</h4>
                      {g.items.map((t) => (
                        <label key={t.id} className={sel.has(t.id) ? "on" : ""}>
                          <input type="checkbox" className="chk" checked={sel.has(t.id)} onChange={(e) => toggle([t.id], e.target.checked)} />
                          <span>{t.title}</span>
                          {t.priority === "high" && <small className="pill tag-red">높음</small>}
                          {t.deadline && <small className={daysLeft(t.deadline, today) < 0 ? "late" : ""}>마감 {ddayLabel(t.deadline, today)}</small>}
                          {t.do_date && <small>{md(t.do_date)} 예정</small>}
                        </label>
                      ))}
                    </div>
                  ))}
                </section>
              );
            })}
            <div className="td-pick-foot">
              <button type="button" className="btn primary" disabled={sel.size === 0} onClick={bring}>{sel.size > 0 ? `${sel.size}건을 ` : ""}{isToday ? "오늘" : md(day)} 할 일로 가져오기</button>
              <button type="button" className="btn" onClick={() => { setPicking(false); setSel(new Set()); }}>닫기</button>
            </div>
          </div>
        )}

        {isToday && dueNow.length > 0 && !picking && (
          <div className="td-nudge">마감이 오늘까지인 프로젝트 업무 {dueNow.length}건이 아직 목록에 없습니다. <button type="button" className="link" onClick={() => moveAll(dueNow, today)}>오늘 할 일에 넣기</button></div>
        )}

        {list.length === 0 && !picking && <div className="td-empty">{isToday ? "오늘 할 일이 아직 없습니다." : "이 날 할 일이 없습니다."} 위 칸에 적거나 프로젝트에서 가져오세요.</div>}
        {list.map((t) => (
          <TodoRow key={t.id} t={t} today={today} edits={edits} projects={projects}>
            {t.status !== "done" && <button type="button" className="td-move" title="다음 날로 미루기" onClick={() => edits.save(t.id, { do_date: addDays(day, 1) })}>내일로</button>}
            <RemoveBtn t={t} edits={edits} />
          </TodoRow>
        ))}
      </div>

      {overdue.length > 0 && (
        <div className="card td-card td-over">
          <div className="td-head">
            <h2>밀린 일 <small>{overdue.length}건</small></h2>
            <button type="button" className="btn" onClick={() => moveAll(overdue, today)}>모두 오늘로</button>
          </div>
          <div className="sub">지난 날짜에 잡아 두고 끝내지 못한 일입니다.</div>
          {overdue.map((t) => (
            <TodoRow key={t.id} t={t} today={today} edits={edits} projects={projects}>
              <small className="td-from">{md(t.do_date!)}</small>
              <button type="button" className="td-move" onClick={() => edits.save(t.id, { do_date: today })}>오늘로</button>
              <RemoveBtn t={t} edits={edits} />
            </TodoRow>
          ))}
        </div>
      )}

      {undated.length > 0 && (
        <div className="card td-card">
          <div className="td-head"><h2>날짜를 안 정한 일 <small>{undated.length}건</small></h2></div>
          {undated.map((t) => (
            <TodoRow key={t.id} t={t} today={today} edits={edits} projects={projects}>
              <button type="button" className="td-move" onClick={() => edits.save(t.id, { do_date: day })}>{isToday ? "오늘로" : `${md(day)}로`}</button>
              <RemoveBtn t={t} edits={edits} />
            </TodoRow>
          ))}
        </div>
      )}
    </div>
  );
}

/** 전체 개요: 오늘 할 일과 프로젝트 진행률. 체크하면 옆의 진행률이 바로 바뀐다. */
export function OverviewBoard({ tasks, projects, clients, today }: { tasks: WorkTask[]; projects: WorkProject[]; clients: Client[]; today: string }) {
  useFreshOnMount();
  const edits = useTaskEdits(tasks);
  const all = edits.view;
  const list = all.filter((t) => t.do_date === today).sort(sortDay);
  const left = list.filter((t) => t.status === "todo").length;
  const overdue = all.filter((t) => t.status === "todo" && t.do_date && t.do_date < today).length;
  const rows = projects.filter((p) => p.status === "active").map((p) => {
    const mine = all.filter((t) => t.project_id === p.id), pr = progress(mine);
    return { p, pr, r: risk(p, pr.pct, today), todayN: mine.filter((t) => t.do_date === today && t.status === "todo").length };
  }).sort((a, b) => (a.p.deadline ?? "9").localeCompare(b.p.deadline ?? "9"));

  return (
    <div className="pg">
      <header className="ph"><h1>전체 개요 <small>{dayLabel(today)} · 남은 일 {left}건 · 진행 중 프로젝트 {rows.length}개</small></h1></header>
      {edits.err && <div className="msg err">{edits.err}</div>}
      <div className="ov-grid">
        <div className="card td-card">
          <div className="td-head">
            <h2>오늘 할 일</h2>
            <DayProgress list={list} />
          </div>
          <QuickAdd edits={edits} day={today} placeholder="할 일을 적고 엔터" />
          {list.length === 0 && <div className="td-empty">오늘 할 일이 아직 없습니다. <Link href="/app/admin/tasks">업무 관리</Link>에서 프로젝트 업무를 가져올 수 있습니다.</div>}
          {list.map((t) => <TodoRow key={t.id} t={t} today={today} edits={edits} projects={projects}><RemoveBtn t={t} edits={edits} /></TodoRow>)}
          <div className="td-foot">
            {overdue > 0 && <span className="late">밀린 일 {overdue}건</span>}
            <Link href="/app/admin/tasks">업무 관리 열기 ›</Link>
          </div>
        </div>

        <div className="card td-card">
          <div className="td-head"><h2>프로젝트 진행률</h2></div>
          {rows.length === 0 && <div className="td-empty">진행 중인 프로젝트가 없습니다. <Link href="/app/admin/work">프로젝트 관리</Link>에서 만들 수 있습니다.</div>}
          {rows.map(({ p, pr, r, todayN }) => (
            <Link key={p.id} href={`/app/admin/work/${p.id}`} className="pj-row">
              <div className="pj-top">
                <b>{p.name}</b>
                {clients.find((c) => c.id === p.client_id) && <small>{clients.find((c) => c.id === p.client_id)!.name}</small>}
                {r !== "ok" && <span className={`pill tag-${r === "late" ? "red" : "orange"}`}>{RISK_LABEL[r]}</span>}
                <strong>{pr.pct}%</strong>
              </div>
              <Gauge pct={pr.pct} risk={r} />
              <div className="pj-meta">
                <span>{pr.done} / {pr.base} 완료{pr.hold ? ` · 보류 ${pr.hold}` : ""}</span>
                {todayN > 0 && <span>오늘 {todayN}건</span>}
                {p.deadline && <span className={r === "late" ? "late" : ""}>마감 {md(p.deadline)} · {ddayLabel(p.deadline, today)}</span>}
              </div>
            </Link>
          ))}
          <div className="td-foot"><Link href="/app/admin/work">프로젝트 관리 열기 ›</Link></div>
        </div>
      </div>
    </div>
  );
}

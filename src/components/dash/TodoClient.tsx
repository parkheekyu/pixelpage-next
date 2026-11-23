"use client";

import DateInput from "./DateInput";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpDown, Building2, CalendarCheck, CalendarDays, ChevronLeft, ChevronRight, CircleDot, Flag, FolderInput, FolderKanban, Plus, Type, X } from "lucide-react";
import { PRIORITIES, PRIORITY_LABEL, TASK_STATUSES, TASK_STATUS_LABEL, type Client, type Priority, type TaskStatus, type WorkMilestone, type WorkProject, type WorkTask } from "@/lib/dash/types";
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

function DayProgress({ list }: { list: WorkTask[] }) {
  const pr = progress(list);
  if (list.length === 0) return null;
  return <div className="td-prog"><Gauge pct={pr.pct} /><b>{pr.done} / {pr.base}</b></div>;
}

type Shared = { edits: Edits; projects: WorkProject[]; milestones: WorkMilestone[]; today: string };
const dayName = (d: string, today: string) => (d === today ? "오늘" : `${md(d)}(${dowOf(d)})`);

/** 프로젝트에서 가져오기: 프로젝트 › 마일스톤 › 업무 순으로 들어가서 고른다. days 가 여럿이면 넣을 날도 고른다. */
function Picker({ edits, projects, milestones, today, days, start, onClose }: Shared & { days: string[]; start: string; onClose: () => void }) {
  const [target, setTarget] = useState(start);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [pickProject, setPickProject] = useState("");
  const [pickGroup, setPickGroup] = useState("");
  // 가져올 수 있는 업무: 아직 안 끝났고 그 날 목록에 없는 프로젝트 업무
  const cands = edits.view.filter((t) => t.project_id && t.status === "todo" && t.do_date !== target);
  const withTasks = projects.filter((p) => p.status === "active").map((p) => {
    const mine = cands.filter((t) => t.project_id === p.id);
    const ms = milestones.filter((m) => m.project_id === p.id);
    const groups = [...ms.map((m) => ({ key: m.id, title: m.title, items: mine.filter((t) => t.milestone_id === m.id).sort(sortTasks) })),
      { key: "none", title: "마일스톤 없음", items: mine.filter((t) => !t.milestone_id || !ms.some((m) => m.id === t.milestone_id)).sort(sortTasks) }].filter((g) => g.items.length > 0);
    return { p, groups, count: mine.length };
  }).filter((x) => x.count > 0);
  const toggle = (ids: string[], on: boolean) => setSel((cur) => { const n = new Set(cur); ids.forEach((id) => (on ? n.add(id) : n.delete(id))); return n; });
  const bring = () => { sel.forEach((id) => edits.save(id, { do_date: target })); onClose(); };
  const proj = withTasks.find((x) => x.p.id === pickProject);
  const group = proj?.groups.find((g) => g.key === pickGroup);
  const nSel = (items: WorkTask[]) => items.filter((t) => sel.has(t.id)).length;
  const ids = group?.items.map((t) => t.id) ?? [], allOn = ids.length > 0 && ids.every((id) => sel.has(id));
  return (
    <div className="td-pick">
      <div className="td-crumb">
        <button type="button" disabled={!proj} onClick={() => { setPickProject(""); setPickGroup(""); }}>프로젝트</button>
        {proj && <><ChevronRight size={14} aria-hidden /><button type="button" disabled={!group} onClick={() => setPickGroup("")}>{proj.p.name}</button></>}
        {group && <><ChevronRight size={14} aria-hidden /><b>{group.title}</b></>}
      </div>
      {withTasks.length === 0 && <div className="hint">가져올 업무가 없습니다. 진행 중인 프로젝트의 남은 업무가 여기에 나옵니다.</div>}
      {!proj && withTasks.map(({ p, groups, count }) => (
        <button key={p.id} type="button" className="td-step" onClick={() => { setPickProject(p.id); setPickGroup(""); }}>
          <span>{p.name}</span>
          {nSel(groups.flatMap((g) => g.items)) > 0 && <em>{nSel(groups.flatMap((g) => g.items))}건 선택</em>}
          <small>남은 업무 {count}건</small><ChevronRight size={16} aria-hidden />
        </button>
      ))}
      {proj && !group && proj.groups.map((g) => (
        <button key={g.key} type="button" className="td-step" onClick={() => setPickGroup(g.key)}>
          <span>{g.title}</span>
          {nSel(g.items) > 0 && <em>{nSel(g.items)}건 선택</em>}
          <small>남은 업무 {g.items.length}건</small><ChevronRight size={16} aria-hidden />
        </button>
      ))}
      {group && (
        <div className="td-pick-g">
          <div className="td-pick-all"><button type="button" className="link" onClick={() => toggle(ids, !allOn)}>{allOn ? "전체 해제" : "전체 선택"}</button></div>
          {group.items.map((t) => (
            <label key={t.id} className={sel.has(t.id) ? "on" : ""}>
              <input type="checkbox" className="chk" checked={sel.has(t.id)} onChange={(e) => toggle([t.id], e.target.checked)} />
              <span>{t.title}</span>
              {t.priority === "high" && <small className="pill tag-red">높음</small>}
              {t.deadline && <small className={daysLeft(t.deadline, today) < 0 ? "late" : ""}>마감 {ddayLabel(t.deadline, today)}</small>}
              {t.do_date && <small>{md(t.do_date)} 예정</small>}
            </label>
          ))}
        </div>
      )}
      <div className="td-pick-foot">
        {days.length > 1 && (
          <select value={target} aria-label="넣을 날" onChange={(e) => setTarget(e.target.value)}>
            {days.map((d) => <option key={d} value={d}>{dowOf(d)}요일 {md(d)}{d === today ? " (오늘)" : ""}</option>)}
          </select>
        )}
        <button type="button" className="btn primary" disabled={sel.size === 0} onClick={bring}>{sel.size > 0 ? `${sel.size}건을 ` : ""}{dayName(target, today)} 할 일로 가져오기</button>
        <button type="button" className="btn" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

/** 하루 단위 할 일: 날짜 이동, 추가, 프로젝트에서 가져오기, 밀린 일. 전체 개요에 들어간다. */
function DayTodo({ edits, projects, milestones, today }: Shared) {
  const [day, setDay] = useState(today);
  const all = edits.view;
  const list = all.filter((t) => t.do_date === day).sort(sortDay);
  const isToday = day === today;
  const overdue = all.filter((t) => t.status === "todo" && t.do_date && t.do_date < today).sort((a, b) => a.do_date!.localeCompare(b.do_date!));
  const undated = all.filter((t) => !t.project_id && !t.do_date && t.status !== "done").sort(sortTasks);
  // 마감이 오늘까지인데 아직 어느 날에도 안 넣은 프로젝트 업무
  const dueNow = all.filter((t) => t.project_id && t.status === "todo" && !t.do_date && t.deadline && t.deadline <= today);
  const week = Array.from({ length: 7 }, (_, i) => addDays(weekStart(day), i));
  const moveAll = (items: WorkTask[], to: string) => items.forEach((t) => edits.save(t.id, { do_date: to }));
  const go = (d: string) => setDay(d);

  return (
    <div className="ov-left">
      <div className="td-week" role="tablist" aria-label="이번 주">
        <button type="button" className="nav" aria-label="지난주" title="지난주" onClick={() => go(addDays(day, -7))}><ChevronLeft size={16} aria-hidden /></button>
        {week.map((d) => {
          const items = all.filter((t) => t.do_date === d), done = items.filter((t) => t.status === "done").length;
          return (
            <button key={d} type="button" role="tab" aria-selected={d === day} className={`${d === day ? "on" : ""}${d === today ? " today" : ""}`} onClick={() => go(d)}>
              <small>{dowOf(d)}</small><b>{+d.slice(8, 10)}</b>
              <span className={items.length > 0 && done === items.length ? "all" : ""}>{items.length > 0 ? `${done}/${items.length}` : "·"}</span>
            </button>
          );
        })}
        <button type="button" className="nav" aria-label="다음 주" title="다음 주" onClick={() => go(addDays(day, 7))}><ChevronRight size={16} aria-hidden /></button>
      </div>

      <div className="card td-card ov-box ov-today">
        <div className="td-head">
          <h2>{isToday ? "오늘 할 일" : `${dayLabel(day)} 할 일`}{!isToday && <button type="button" className="td-move" style={{ marginLeft: 8 }} onClick={() => go(today)}>오늘로</button>}</h2>
          <DayProgress list={list} />
        </div>
        <div className="ov-scroll">
        {isToday && dueNow.length > 0 && (
          <div className="td-nudge">마감이 오늘까지인 프로젝트 업무 {dueNow.length}건이 아직 목록에 없습니다. <button type="button" className="link" onClick={() => moveAll(dueNow, today)}>오늘 할 일에 넣기</button></div>
        )}
        {list.length === 0 && <div className="td-empty">{isToday ? "오늘 할 일이 아직 없습니다." : "이 날 할 일이 없습니다."} 할 일은 <Link href="/app/admin/tasks">업무 관리</Link>에서 추가합니다.</div>}
        {list.map((t) => (
          <TodoRow key={t.id} t={t} today={today} edits={edits} projects={projects}>
            {t.status !== "done" && <button type="button" className="td-move" title="다음 날로 미루기" onClick={() => edits.save(t.id, { do_date: addDays(day, 1) })}>내일로</button>}
            <RemoveBtn t={t} edits={edits} />
          </TodoRow>
        ))}
        </div>
        <div className="td-foot"><Link href="/app/admin/tasks">주간 업무 관리 열기 ›</Link></div>
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

const PRI_TAG: Record<Priority, string> = { high: "red", mid: "blue", low: "gray" };
const ST_TAG: Record<TaskStatus, string> = { todo: "blue", done: "green", hold: "orange" };
type View = "week" | "overdue" | "none" | "all" | "done";

/** 데이터베이스 표의 한 줄: 칸마다 바로 고친다 */
function DbRow({ t, today, edits, projects, milestones, clients }: Shared & { t: WorkTask; clients: Client[] }) {
  const late = t.status === "todo" && t.deadline && daysLeft(t.deadline, today) < 0;
  const ms = milestones.find((m) => m.id === t.milestone_id);
  return (
    <tr className={t.status === "done" ? "dim" : ""}>
      <td className="title db-title">
        <input type="checkbox" className="chk" checked={t.status === "done"} aria-label="완료" onChange={(e) => edits.save(t.id, { status: e.target.checked ? "done" : "todo" })} />
        <input className="cell-in" defaultValue={t.title} key={t.title} aria-label="할 일" onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== t.title) edits.save(t.id, { title: v }); else e.target.value = t.title; }} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
      </td>
      <td>
        <select className="pill" value={t.client_id ?? ""} aria-label="클라이언트" onChange={(e) => edits.save(t.id, { client_id: e.target.value || null })}>
          <option value="">없음</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </td>
      <td>
        <select className={`pill tag-${ST_TAG[t.status]}`} value={t.status} aria-label="상태" onChange={(e) => edits.save(t.id, { status: e.target.value as TaskStatus })}>
          {TASK_STATUSES.map((x) => <option key={x} value={x}>{TASK_STATUS_LABEL[x]}</option>)}
        </select>
      </td>
      <td className="nowrap"><DateInput className="cell-in date" value={t.do_date} label="하는 날" onCommit={(v) => edits.save(t.id, { do_date: v })} />{t.do_date && <small>{dowOf(t.do_date)}</small>}</td>
      <td>
        <select className="pill" value={t.project_id ?? ""} aria-label="프로젝트" onChange={(e) => edits.save(t.id, { project_id: e.target.value || null })}>
          <option value="">없음</option>
          {projects.filter((p) => p.status === "active" || p.id === t.project_id).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </td>
      <td className="pad nowrap">{ms?.title ?? ""}</td>
      <td className="nowrap"><DateInput className="cell-in date" value={t.deadline} label="마감" onCommit={(v) => edits.save(t.id, { deadline: v })} />{t.deadline && t.status !== "done" && <small className={late ? "late" : ""}>{ddayLabel(t.deadline, today)}</small>}</td>
      <td>
        <select className={`pill tag-${PRI_TAG[t.priority]}`} value={t.priority} aria-label="우선순위" onChange={(e) => edits.save(t.id, { priority: e.target.value as Priority })}>
          {PRIORITIES.map((x) => <option key={x} value={x}>{PRIORITY_LABEL[x]}</option>)}
        </select>
      </td>
      <td className="act"><button type="button" className="t-del" title="삭제" aria-label="삭제" onClick={() => { if (confirm(`"${t.title}" 을(를) 삭제할까요?${t.project_id ? " 프로젝트에서도 지워집니다." : ""}`)) edits.remove(t.id); }}><X size={14} aria-hidden /></button></td>
    </tr>
  );
}

function DbAdd({ edits, day, label }: { edits: Edits; day: string | null; label: string }) {
  const [v, setV] = useState("");
  return (
    <tr className="new">
      <td colSpan={9}>
        <form onSubmit={(e) => { e.preventDefault(); if (!v.trim()) return; edits.add({ title: v, do_date: day }); setV(""); }}>
          <Plus size={14} aria-hidden />
          <input value={v} onChange={(e) => setV(e.target.value)} placeholder={label} aria-label={label} />
        </form>
      </td>
    </tr>
  );
}

/** 업무 관리: 모든 할 일을 데이터베이스 표로 본다. 이번 주 보기는 하는 날 순으로 늘어놓는다. */
export default function TodoClient({ tasks, projects, milestones, clients, today }: { tasks: WorkTask[]; projects: WorkProject[]; milestones: WorkMilestone[]; clients: Client[]; today: string }) {
  useFreshOnMount();
  const edits = useTaskEdits(tasks);
  const [view, setView] = useState<View>("week");
  const [start, setStart] = useState(weekStart(today));
  const [picking, setPicking] = useState(false);
  const all = edits.view;
  const shared = { edits, projects, milestones, today };
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const thisWeek = start === weekStart(today);
  const byDate = (a: WorkTask, b: WorkTask) => (a.do_date ?? "9").localeCompare(b.do_date ?? "9") || sortDay(a, b);
  // 체크한 일은 그날까지만 원래 자리에 남고, 다음 날부터는 완료 탭에만 보인다 (한국 시간 기준)
  const doneDay = (t: WorkTask) => (t.done_at ? new Date(Date.parse(t.done_at) + 9 * 3600_000).toISOString().slice(0, 10) : "");
  const live = (t: WorkTask) => t.status !== "done" || doneDay(t) >= today;
  const weekAll = all.filter((t) => t.do_date && t.do_date >= days[0] && t.do_date <= days[6]);
  const lists: Record<View, WorkTask[]> = {
    week: weekAll.filter(live).sort(byDate),
    overdue: all.filter((t) => live(t) && t.status !== "hold" && t.do_date && t.do_date < today).sort(byDate),
    none: all.filter((t) => live(t) && !t.do_date).sort(sortTasks),
    all: all.filter(live).sort(byDate),
    done: all.filter((t) => t.status === "done").sort((a, b) => (b.done_at ?? "").localeCompare(a.done_at ?? "")),
  };
  const VIEWS: [View, string][] = [["week", thisWeek ? "이번 주" : `${md(days[0])} 주`], ["overdue", "밀린 일"], ["none", "날짜 미정"], ["all", "남은 일 전체"], ["done", "완료"]];
  const rows = lists[view];
  const pr = progress(weekAll);
  const target = thisWeek ? today : days[0];

  return (
    <>
      <header className="ph">
        <h1>업무 관리 <small>{md(days[0])} ~ {md(days[6])} 할 일 {weekAll.length}건{weekAll.length > 0 ? ` 중 ${pr.done}건 완료` : ""}</small></h1>
        <div className="controls">
          {view === "week" && (
            <>
              <span className="lg-step">
                <button type="button" className="btn" aria-label="지난주" title="지난주" onClick={() => setStart(addDays(start, -7))}><ChevronLeft size={16} aria-hidden /></button>
                <button type="button" className="btn" aria-label="다음 주" title="다음 주" onClick={() => setStart(addDays(start, 7))}><ChevronRight size={16} aria-hidden /></button>
              </span>
              {!thisWeek && <button type="button" className="btn" onClick={() => setStart(weekStart(today))}>이번 주</button>}
            </>
          )}
          <button type="button" className={`btn td-pickbtn ${picking ? "on" : ""}`} onClick={() => setPicking((v) => !v)}><FolderInput size={15} aria-hidden /> 프로젝트에서 가져오기</button>
        </div>
      </header>

      <div className="ndb-views">
        {VIEWS.map(([k, label]) => <button key={k} type="button" className={view === k ? "on" : ""} onClick={() => setView(k)}>{label} <small>{k === "done" ? lists[k].length : lists[k].filter((t) => t.status !== "done").length}</small></button>)}
      </div>

      {edits.err && <div className="msg err">{edits.err}</div>}
      {picking && <div style={{ marginTop: 12 }}><Picker key={start} {...shared} days={days} start={target} onClose={() => setPicking(false)} /></div>}

      <div className="tbl-wrap">
        <table className="ndb db-tasks">
          <thead>
            <tr>
              <th><Type aria-hidden /> 할 일</th><th><Building2 aria-hidden /> 클라이언트</th><th><CircleDot aria-hidden /> 상태</th><th><CalendarCheck aria-hidden /> 하는 날</th><th><FolderKanban aria-hidden /> 프로젝트</th>
              <th><Flag aria-hidden /> 마일스톤</th><th><CalendarDays aria-hidden /> 마감</th><th><ArrowUpDown aria-hidden /> 우선순위</th><th />
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 200).map((t) => <DbRow key={t.id} t={t} {...shared} clients={clients} />)}
            {rows.length === 0 && <tr><td colSpan={9} className="pad" style={{ color: "var(--muted)" }}>{view === "week" ? "이 주에 잡힌 일이 없습니다." : view === "overdue" ? "밀린 일이 없습니다." : view === "done" ? "완료한 일이 없습니다." : "해당하는 일이 없습니다."}</td></tr>}
            {view === "week" && <DbAdd edits={edits} day={target} label={`새 할 일 (적고 엔터, ${dayName(target, today)} 날짜로 들어갑니다)`} />}
            {(view === "none" || view === "all") && <DbAdd edits={edits} day={null} label="새 할 일 (적고 엔터, 날짜는 나중에)" />}
          </tbody>
        </table>
      </div>
      <div className="hint">칸을 눌러 바로 고칩니다. "하는 날"이 이번 주 안에 있는 일이 이번 주 보기에 나오고, 체크한 일은 오늘까지만 여기 남고 내일부터는 완료 탭에만 보입니다.</div>
    </>
  );
}

/** 전체 개요 윗부분: 하루 단위 할 일(가져오기·밀린 일 포함)과 프로젝트 진행률. 체크하면 옆의 진행률이 바로 바뀐다. */
export function OverviewBoard({ tasks, projects, milestones, clients, today }: { tasks: WorkTask[]; projects: WorkProject[]; milestones: WorkMilestone[]; clients: Client[]; today: string }) {
  useFreshOnMount();
  const edits = useTaskEdits(tasks);
  const all = edits.view;
  const left = all.filter((t) => t.do_date === today && t.status === "todo").length;
  const rows = projects.filter((p) => p.status === "active").map((p) => {
    const mine = all.filter((t) => t.project_id === p.id), pr = progress(mine);
    return { p, pr, r: risk(p, pr.pct, today), todayN: mine.filter((t) => t.do_date === today && t.status === "todo").length };
  }).sort((a, b) => (a.p.deadline ?? "9").localeCompare(b.p.deadline ?? "9"));

  return (
    <div>
      <header className="ph"><h1>전체 개요 <small>{dayLabel(today)} · 오늘 남은 일 {left}건 · 진행 중 프로젝트 {rows.length}개</small></h1></header>
      {edits.err && <div className="msg err">{edits.err}</div>}
      <div className="ov-grid">
        <DayTodo edits={edits} projects={projects} milestones={milestones} today={today} />

        <div className="card td-card ov-box ov-prog">
          <div className="td-head"><h2>프로젝트 진행률</h2></div>
          <div className="ov-scroll">
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
          </div>
          <div className="td-foot"><Link href="/app/admin/work">프로젝트 관리 열기 ›</Link></div>
        </div>
      </div>
    </div>
  );
}

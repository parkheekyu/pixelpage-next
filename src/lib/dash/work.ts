import type { WorkProject, WorkTask } from "./types";

/** 한국 시간 기준 오늘 (YYYY-MM-DD) */
export const todayKST = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

const day = (s: string) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 86400_000;
/** 오늘부터 마감까지 남은 날 수 (지났으면 음수) */
export const daysLeft = (deadline: string, today: string) => day(deadline) - day(today);

/** 진행률: 완료 ÷ (전체 − 보류). 보류는 분모에서 뺀다. */
export function progress(tasks: WorkTask[]) {
  const hold = tasks.filter((t) => t.status === "hold").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const base = tasks.length - hold;
  return { done, hold, total: tasks.length, base, pct: base > 0 ? Math.round((done / base) * 100) : 0 };
}

export type Risk = "ok" | "slow" | "late";
/** 남은 기간에 비해 진행이 느리면 slow, 마감이 지났는데 안 끝났으면 late */
export function risk(p: Pick<WorkProject, "deadline" | "created_at" | "status">, pct: number, today: string): Risk {
  if (!p.deadline || p.status === "done" || pct >= 100) return "ok";
  if (daysLeft(p.deadline, today) < 0) return "late";
  const start = day(p.created_at.slice(0, 10)), end = day(p.deadline), span = end - start;
  if (span <= 0) return "ok";
  const elapsed = (day(today) - start) / span;
  return elapsed - pct / 100 > 0.25 ? "slow" : "ok";
}

export function ddayLabel(deadline: string | null, today: string) {
  if (!deadline) return "";
  const d = daysLeft(deadline, today);
  return d === 0 ? "오늘" : d > 0 ? `D-${d}` : `${-d}일 지남`;
}

export type TaskGroup = "late" | "today" | "week" | "later" | "none" | "hold" | "done";
export const GROUP_LABEL: Record<TaskGroup, string> = { late: "지연", today: "오늘", week: "이번 주", later: "이후", none: "기한 없음", hold: "보류", done: "완료" };
export const GROUP_ORDER: TaskGroup[] = ["late", "today", "week", "later", "none", "hold", "done"];
export function groupOf(t: WorkTask, today: string): TaskGroup {
  if (t.status === "done") return "done";
  if (t.status === "hold") return "hold";
  if (!t.deadline) return "none";
  const d = daysLeft(t.deadline, today);
  if (d < 0) return "late";
  if (d === 0) return "today";
  const dow = (new Date(today + "T00:00:00Z").getUTCDay() + 6) % 7; // 월=0
  return d <= 6 - dow ? "week" : "later";
}

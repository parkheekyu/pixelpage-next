/** KST(Asia/Seoul) 기준 날짜 유틸. 날짜 문자열은 YYYY-MM-DD. */
export const KST = "Asia/Seoul";

export function todayKST(now = Date.now()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: KST, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(now));
}
export function addDays(d: string, n: number): string {
  const t = new Date(d + "T00:00:00+09:00").getTime() + n * 86400000;
  return todayKST(t);
}
export function monthStart(d: string): string { return d.slice(0, 8) + "01"; }
export function monthEnd(d: string): string {
  const [y, m] = d.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${d.slice(0, 8)}${String(last).padStart(2, "0")}`;
}
export function prevMonthStart(d: string): string { return addDays(monthStart(d), -1).slice(0, 8) + "01"; }

export interface DateRange { from: string; to: string }
export const MIN_DATE = "2020-01-01";

export type PresetKey = "today" | "yesterday" | "7d" | "30d" | "90d" | "thisMonth" | "lastMonth" | "max";
export const PRESETS: [PresetKey, string][] = [
  ["today", "오늘"], ["yesterday", "어제"], ["7d", "최근 7일"], ["30d", "최근 30일"], ["90d", "최근 90일"],
  ["thisMonth", "이번 달"], ["lastMonth", "지난 달"], ["max", "최대"],
];
export function presetRange(k: PresetKey, now = Date.now()): DateRange {
  const t = todayKST(now);
  switch (k) {
    case "today": return { from: t, to: t };
    case "yesterday": { const y = addDays(t, -1); return { from: y, to: y }; }
    case "7d": return { from: addDays(t, -6), to: t };
    case "30d": return { from: addDays(t, -29), to: t };
    case "90d": return { from: addDays(t, -89), to: t };
    case "thisMonth": return { from: monthStart(t), to: t };
    case "lastMonth": { const s = prevMonthStart(t); return { from: s, to: monthEnd(s) }; }
    case "max": return { from: MIN_DATE, to: t };
  }
}
export function rangeLabel(r: DateRange, now = Date.now()): string {
  for (const [k, label] of PRESETS) { const p = presetRange(k, now); if (p.from === r.from && p.to === r.to) return label; }
  const f = (d: string) => d.slice(2).replace(/-/g, ".");
  return r.from === r.to ? f(r.from) : `${f(r.from)} ~ ${f(r.to)}`;
}
export const isDate = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

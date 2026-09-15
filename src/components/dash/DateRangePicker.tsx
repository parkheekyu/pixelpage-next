"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { addDays, MIN_DATE, PRESETS, presetRange, rangeLabel, todayKST, type DateRange } from "@/lib/dash/dates";

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/** 작은 달력 팝업 + 프리셋. 시작일 클릭 후 종료일 클릭으로 범위 지정. */
export default function DateRangePicker({ value, onChange }: { value: DateRange; onChange: (r: DateRange) => void }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(value.to.slice(0, 7)); // YYYY-MM
  const [pick, setPick] = useState<string | null>(null);     // 시작일만 고른 상태
  const [hover, setHover] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const today = todayKST();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const [y, m] = month.split("-").map(Number);
  const first = `${month}-01`;
  const firstDow = new Date(first + "T00:00:00+09:00").getDay();
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (string | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`)];
  while (cells.length % 7) cells.push(null);
  const shiftMonth = (n: number) => { const d = new Date(Date.UTC(y, m - 1 + n, 1)); setMonth(d.toISOString().slice(0, 7)); };

  const sel: DateRange = pick ? { from: pick < (hover ?? pick) ? pick : (hover ?? pick), to: pick < (hover ?? pick) ? (hover ?? pick) : pick } : value;
  const inRange = (d: string) => d >= sel.from && d <= sel.to;

  const clickDay = (d: string) => {
    if (d > today || d < MIN_DATE) return;
    if (!pick) { setPick(d); return; }
    const r = pick <= d ? { from: pick, to: d } : { from: d, to: pick };
    setPick(null); onChange(r); setOpen(false);
  };
  const apply = (r: DateRange) => { setPick(null); onChange(r); setMonth(r.to.slice(0, 7)); setOpen(false); };

  return (
    <div className="drp" ref={ref}>
      <button type="button" className="tb drp-btn" onClick={() => { setOpen((o) => !o); setMonth(value.to.slice(0, 7)); setPick(null); }}>
        <Calendar className="ico" aria-hidden /> {rangeLabel(value)} <ChevronDown className="ico drp-caret" aria-hidden />
      </button>
      {open && (
        <div className="drp-pop">
          <div className="drp-presets">
            {PRESETS.map(([k, label]) => { const r = presetRange(k); const on = r.from === value.from && r.to === value.to; return (
              <button type="button" key={k} className={`drp-preset ${on ? "on" : ""}`} onClick={() => apply(r)}>{label}</button>
            ); })}
          </div>
          <div className="drp-cal">
            <div className="drp-head">
              <button type="button" className="drp-nav" onClick={() => shiftMonth(-1)} aria-label="이전 달"><ChevronLeft className="ico" /></button>
              <strong>{y}년 {m}월</strong>
              <button type="button" className="drp-nav" onClick={() => shiftMonth(1)} disabled={month >= today.slice(0, 7)} aria-label="다음 달"><ChevronRight className="ico" /></button>
            </div>
            <div className="drp-grid">
              {DOW.map((d) => <div key={d} className="drp-dow">{d}</div>)}
              {cells.map((d, i) => d ? (
                <button type="button" key={d} disabled={d > today}
                  className={`drp-day ${inRange(d) ? "in" : ""} ${d === sel.from ? "from" : ""} ${d === sel.to ? "to" : ""} ${d === today ? "today" : ""}`}
                  onClick={() => clickDay(d)} onMouseEnter={() => pick && setHover(d)}>
                  {+d.slice(8)}
                </button>
              ) : <div key={"e" + i} />)}
            </div>
            <div className="drp-foot">
              <span>{pick ? `${pick} 부터 · 종료일을 선택하세요` : `${value.from} ~ ${value.to}`}</span>
              <button type="button" className="drp-nav" onClick={() => apply({ from: addDays(today, -29), to: today })} title="초기화" aria-label="초기화"><RotateCcw className="ico" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

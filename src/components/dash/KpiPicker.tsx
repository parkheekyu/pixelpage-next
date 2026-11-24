"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setOverviewKpis } from "@/app/app/actions";
import { OVERVIEW_KPI_MAX } from "@/lib/dash/types";

/** 개요 상단에 보여 줄 지표를 브랜드별로 고른다 (직원 전용, 최대 5개). 고른 순서대로 놓인다. */
export default function KpiPicker({ projectId, options, value }: { projectId: string; options: { key: string; label: string }[]; value: string[] }) {
  const router = useRouter();
  const box = useRef<HTMLDetailsElement>(null);
  const [sel, setSel] = useState<string[]>(value);
  const [busy, start] = useTransition();
  const full = sel.length >= OVERVIEW_KPI_MAX;
  const toggle = (k: string) => setSel((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : cur.length >= OVERVIEW_KPI_MAX ? cur : [...cur, k]));
  const save = (keys: string[]) => start(async () => {
    const r = await setOverviewKpis(projectId, keys);
    if (!r.ok) { alert(r.error); return; }
    if (box.current) box.current.open = false;
    router.refresh();
  });
  return (
    <details className="kpi-pick" ref={box}>
      <summary>지표 선택</summary>
      <div className="kpi-pick-pop">
        <p>상단에 보여 줄 지표를 {OVERVIEW_KPI_MAX}개까지 고르세요. 고른 순서대로 놓입니다. <b>{sel.length}/{OVERVIEW_KPI_MAX}</b></p>
        <div className="kpi-pick-list">
          {options.map((o) => {
            const i = sel.indexOf(o.key);
            return (
              <label key={o.key} className={i >= 0 ? "on" : full ? "off" : ""}>
                <input type="checkbox" checked={i >= 0} disabled={i < 0 && full} onChange={() => toggle(o.key)} />
                {o.label}{i >= 0 && <em>{i + 1}</em>}
              </label>
            );
          })}
        </div>
        <div className="kpi-pick-foot">
          <button type="button" className="btn" disabled={busy} onClick={() => { setSel([]); save([]); }}>기본값으로</button>
          <button type="button" className="btn primary" disabled={busy || sel.length === 0} onClick={() => save(sel)}>{busy ? "저장 중…" : "저장"}</button>
        </div>
      </div>
    </details>
  );
}

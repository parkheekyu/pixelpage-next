"use client";

import { useState } from "react";

/** 날짜 칸. 달력에서 달을 넘기는 동안에도 브라우저가 값을 바꿔 알리기 때문에, 바뀔 때마다 저장하면 줄이 다시 그려지며 달력이 닫힌다.
 *  그래서 고르는 동안은 칸 안에서만 값을 들고 있다가, 칸을 벗어날 때(또는 엔터) 한 번만 저장한다. */
export default function DateInput({ value, onCommit, className, label }: { value: string | null; onCommit: (v: string | null) => void; className?: string; label: string }) {
  const [v, setV] = useState(value ?? "");
  const [seen, setSeen] = useState(value);
  if (seen !== value) { setSeen(value); setV(value ?? ""); } // 밖에서 값이 바뀌면 따라간다
  return (
    <input type="date" className={className} value={v} aria-label={label}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => { if (v !== (value ?? "")) onCommit(v || null); }}
      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
  );
}

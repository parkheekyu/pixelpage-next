"use client";

import { useEffect, useRef, useState } from "react";
import { Columns3, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { CUSTOM_TYPES, type CustomField, type CustomType } from "@/lib/dash/types";

const TYPE_LABEL: Record<CustomType, string> = { text: "텍스트", number: "숫자", date: "날짜", select: "선택" };

interface Props {
  builtin: { key: string; label: string }[];
  hidden: string[];
  fields: CustomField[];
  busy: boolean;
  onToggleHidden: (key: string) => void;
  onAddField: (f: CustomField) => void;
  onRemoveField: (key: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  compact?: boolean; // 표 헤더의 "+" 버튼으로 표시
}

/** 열 설정 팝업 (직원): 기본 열 숨기기/보이기, 사용자 정의 열 추가·삭제 */
export default function ColumnsMenu({ builtin, hidden, fields, busy, onToggleHidden, onAddField, onRemoveField, open: openProp, onOpenChange, compact }: Props) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (v: boolean | ((o: boolean) => boolean)) => { const next = typeof v === "function" ? v(open) : v; setOpenState(next); onOpenChange?.(next); };
  const [label, setLabel] = useState(""), [type, setType] = useState<CustomType>("text"), [options, setOptions] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc); return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const add = () => {
    const l = label.trim(); if (!l) return;
    let key = l.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    if (!key || fields.some((f) => f.key === key)) key = `c_${Date.now().toString(36)}`;
    onAddField({ key, label: l, type, ...(type === "select" ? { options: options.split(",").map((o) => o.trim()).filter(Boolean) } : {}) });
    setLabel(""); setOptions(""); setType("text");
  };

  return (
    <div className="colmenu" ref={ref}>
      {compact
        ? <button type="button" className="th-add" title="열 추가 · 설정" onClick={() => setOpen((o) => !o)}><Plus className="ico" aria-hidden /></button>
        : <button type="button" className="tb drp-btn" onClick={() => setOpen((o) => !o)}><Columns3 className="ico" aria-hidden /> 열</button>}
      {open && (
        <div className={`drp-pop colmenu-pop ${compact ? "right" : ""}`} style={{ opacity: busy ? 0.6 : 1 }}>
          <div className="colmenu-sec">
            <h4>기본 열</h4>
            {builtin.map((c) => { const off = hidden.includes(c.key); return (
              <button type="button" key={c.key} className={`colmenu-row ${off ? "off" : ""}`} onClick={() => onToggleHidden(c.key)} disabled={busy}>
                {off ? <EyeOff className="ico" aria-hidden /> : <Eye className="ico" aria-hidden />} {c.label}
              </button>
            ); })}
          </div>
          <div className="colmenu-sec">
            <h4>사용자 정의 열</h4>
            {fields.length === 0 && <div className="hint" style={{ margin: "2px 8px 8px" }}>아직 없음</div>}
            {fields.map((f) => (
              <div key={f.key} className="colmenu-row static">
                <span>{f.label} <small>{TYPE_LABEL[f.type]}</small></span>
                <button type="button" className="colmenu-del" title="열 삭제" disabled={busy} onClick={() => { if (confirm(`"${f.label}" 열을 삭제할까요? 입력된 값도 더 이상 표시되지 않습니다.`)) onRemoveField(f.key); }}><Trash2 className="ico" aria-hidden /></button>
              </div>
            ))}
            <div className="colmenu-add">
              <input type="text" placeholder="열 이름" value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} />
              <select value={type} onChange={(e) => setType(e.target.value as CustomType)}>{CUSTOM_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}</select>
              {type === "select" && <input type="text" placeholder="선택지 (쉼표로 구분)" value={options} onChange={(e) => setOptions(e.target.value)} />}
              <button type="button" className="btn primary" onClick={add} disabled={busy || !label.trim()}><Plus className="ico" aria-hidden /> 열 추가</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

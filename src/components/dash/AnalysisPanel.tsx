"use client";

import { useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Play, Trash2 } from "lucide-react";
import { deleteAnalysis } from "@/app/app/analysis-actions";
import type { ActionResult } from "@/app/app/actions";
import type { Analysis } from "@/lib/dash/types";

interface Props {
  projectId: string;
  analyses: Analysis[];
  isStaff: boolean;
  runLabel: string;
  canRun: boolean;
  disabledReason?: string;
  onRun: () => Promise<ActionResult & { id?: string }>;
  extraControls?: React.ReactNode;
}

/** AI 분석 실행 버튼 + 최신 리포트 + 이력 */
export default function AnalysisPanel({ projectId, analyses, isStaff, runLabel, canRun, disabledReason, onRun, extraControls }: Props) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const current = analyses.find((a) => a.id === sel) ?? analyses.find((a) => a.status === "done") ?? analyses[0];
  const fmt = (iso: string) => new Date(iso).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });

  const run = () => start(async () => {
    setMsg({ ok: true, text: "분석 중입니다. 데이터 양에 따라 1~3분 걸립니다. 화면을 유지해 주세요." });
    const r = await onRun();
    setMsg(r.ok ? { ok: true, text: "분석이 완료됐습니다." } : { ok: false, text: r.error });
    if (r.ok && r.id) setSel(r.id);
  });

  return (
    <>
      {isStaff && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="form-row" style={{ alignItems: "center" }}>
            {extraControls}
            <button type="button" className="btn primary" onClick={run} disabled={pending || !canRun} title={!canRun ? disabledReason : undefined}><Play className="ico" aria-hidden /> {pending ? "분석 중…" : runLabel}</button>
            {!canRun && disabledReason && <span className="hint" style={{ marginTop: 0 }}>{disabledReason}</span>}
          </div>
          {msg && <div className={`msg ${msg.ok ? "ok" : "err"}`}>{msg.text}</div>}
        </div>
      )}
      <section className="grid">
        <div className="card c9">
          {current ? (
            <>
              <div className="form-row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                <div><h2 style={{ display: "inline" }}>{current.title ?? "분석 리포트"}</h2> <span className="hint" style={{ display: "inline", marginLeft: 8 }}>{fmt(current.created_at)} · {current.model ?? ""}</span></div>
                {isStaff && <button type="button" className="btn danger" onClick={() => { if (confirm("이 리포트를 삭제할까요?")) start(async () => { const r = await deleteAnalysis(projectId, current.id); if (!r.ok) setMsg({ ok: false, text: r.error }); setSel(null); }); }}><Trash2 className="ico" aria-hidden /></button>}
              </div>
              {current.status === "error" && <div className="msg err">분석 실패: {current.error}</div>}
              {current.status === "running" && <div className="msg ok">분석이 진행 중입니다. 잠시 후 새로고침해 주세요.</div>}
              {current.result_md && <div className="report"><ReactMarkdown remarkPlugins={[remarkGfm]}>{current.result_md}</ReactMarkdown></div>}
              {(current.input as { truncated?: boolean } | null)?.truncated && <div className="hint">출력이 길어 마지막 부분이 잘렸을 수 있습니다.</div>}
            </>
          ) : (
            <div className="hint" style={{ margin: 0 }}>{isStaff ? "아직 분석 리포트가 없습니다. 위 버튼으로 첫 분석을 실행하세요." : "아직 공유된 분석 리포트가 없습니다."}</div>
          )}
        </div>
        <div className="card c3">
          <h2>이력</h2><div className="sub">최근 {analyses.length}건</div>
          {analyses.length === 0 && <div className="hint" style={{ margin: 0 }}>없음</div>}
          {analyses.map((a) => (
            <button type="button" key={a.id} className={`colmenu-row ${current?.id === a.id ? "on" : ""}`} style={{ flexDirection: "column", alignItems: "flex-start", gap: 2, background: current?.id === a.id ? "color-mix(in srgb, var(--s1) 12%, transparent)" : undefined }} onClick={() => setSel(a.id)}>
              <span style={{ fontSize: 13 }}>{a.title ?? a.kind}</span>
              <small>{fmt(a.created_at)} · {a.status === "done" ? "완료" : a.status === "error" ? "실패" : "진행 중"}</small>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

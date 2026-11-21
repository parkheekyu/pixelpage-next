"use client";

import { useState, useTransition } from "react";
import { ChevronRight, Pencil, Save } from "lucide-react";
import { runResearch, saveResearchInput } from "@/app/app/analysis-actions";
import type { Analysis, Project, ResearchInput } from "@/lib/dash/types";
import AnalysisPanel from "./AnalysisPanel";

const FIELDS: { key: keyof ResearchInput; label: string; short: string; ph: string; required?: boolean }[] = [
  { key: "product", label: "상품/서비스", short: "상품/서비스", ph: "무엇을 파는지, 어떤 결과를 주는지. 예: 성인 대상 스피치 6주 과정, 발표 불안 해소", required: true },
  { key: "target", label: "타깃 고객", short: "타깃 고객", ph: "누가 사는지. 나이·직업·상황·지금 겪는 문제. 예: 30대 직장인, 회의 발표 때 목소리가 떨림", required: true },
  { key: "price", label: "가격/결제 구조", short: "가격", ph: "예: 49만 원 일시불, 분납 가능, 재수강 50%" },
  { key: "offer", label: "오퍼", short: "오퍼", ph: "예: 무료 진단 상담, 첫 수업 무료, 환불 보장" },
  { key: "proof", label: "보유한 증거", short: "증거", ph: "예: 수강생 후기 120건, 평균 만족도 4.8, 방송 출연, 자격증" },
  { key: "competitors", label: "경쟁사/대안", short: "경쟁사/대안", ph: "예: 유튜브 무료 강의, A학원(더 저렴), 개인 코칭(더 비쌈)" },
  { key: "objections", label: "상담에서 실제 듣는 반박·거절 이유", short: "반박·거절 이유", ph: "예: 시간이 없다, 효과가 있을지 모르겠다, 비싸다, 혼자 해보겠다" },
  { key: "notes", label: "기타", short: "기타", ph: "브랜드 톤, 하지 말아야 할 표현, 과거에 안 됐던 광고 등" },
];

export default function ResearchClient({ project, analyses, market, isStaff }: { project: Project; analyses: Analysis[]; market: Analysis[]; isStaff: boolean }) {
  const [input, setInput] = useState<ResearchInput>(project.research_input ?? {});
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const canRun = !!(input.product?.trim() && input.target?.trim());
  const [base, setBase] = useState<ResearchInput>(project.research_input ?? {});

  const filled = FIELDS.filter((f) => (input[f.key] ?? "").trim()).length;
  // 필수 정보가 비어 있을 때만 입력 칸을 처음부터 펼친다. 채워져 있으면 접어 두고 리포트를 먼저 보여 준다.
  const [showInfo, setShowInfo] = useState(!canRun);
  // 저장된 정보는 읽기 전용 표로 보여 주고, 수정을 눌렀을 때만 입력 칸으로 바꾼다.
  const [editing, setEditing] = useState(!canRun);
  const saveInfo = () => start(async () => {
    const r = await saveResearchInput(project.id, input);
    setSaved(r.ok ? "저장됨" : r.error);
    if (r.ok) { setBase(input); if (input.product?.trim() && input.target?.trim()) setEditing(false); }
  });
  // 취소는 고객사 정보 칸만 되돌린다. 붙여 넣은 사전 조사는 그대로 둔다.
  const cancel = () => { setInput({ ...base, pre_research: input.pre_research }); setEditing(false); setSaved(null); };

  return (
    <>
      {isStaff ? (
        <>
          <section className={`card fold ${showInfo ? "open" : ""}`}>
            <button type="button" className="fold-head" onClick={() => setShowInfo((v) => !v)} aria-expanded={showInfo}>
              <ChevronRight className="chev" aria-hidden />
              <b>고객사 정보</b>
              <span className={`pill ${canRun ? "tag-green" : "tag-orange"}`}>{canRun ? `${filled} / ${FIELDS.length} 입력` : "필수 항목 미입력"}</span>
              {!showInfo && input.product && <span className="fold-sum">{input.product}</span>}
            </button>
            {showInfo && (
              <div className="fold-body">
                <div className="pf-top">
                  <span className="sub">AI 리서치가 이 정보를 바탕으로 시장·경쟁사·키워드를 조사합니다. 자세할수록 정확합니다.</span>
                  {editing ? (
                    <span className="pf-acts">
                      {saved && saved !== "저장됨" && <span className="hint" style={{ marginTop: 0 }}>{saved}</span>}
                      {canRun && <button type="button" className="btn ghost" onClick={cancel} disabled={pending}>취소</button>}
                      <button type="button" className="btn primary" onClick={saveInfo} disabled={pending}><Save className="ico" aria-hidden /> 저장</button>
                    </span>
                  ) : (
                    <button type="button" className="btn" onClick={() => setEditing(true)}><Pencil className="ico" aria-hidden /> 수정</button>
                  )}
                </div>
                <dl className={`pf ${editing ? "edit" : ""}`}>
                  {FIELDS.map((f) => {
                    const v = (input[f.key] ?? "").trim();
                    return (
                      <div key={f.key} className="pf-row">
                        <dt>{f.short}{f.required && <em>필수</em>}</dt>
                        <dd>
                          {editing ? (
                            <textarea aria-label={f.label} value={input[f.key] ?? ""} placeholder={f.ph} onChange={(e) => setInput({ ...input, [f.key]: e.target.value })} rows={2} />
                          ) : v ? v : <span className="pf-empty">미입력</span>}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            )}
          </section>
        </>
      ) : (
        project.research_input?.product && (
          <div className="card" style={{ marginBottom: 12 }}>
            <h2>상품·타깃 요약</h2>
            <div className="kv"><b>상품/서비스</b><span>{project.research_input.product}</span><b>타깃 고객</b><span>{project.research_input.target}</span></div>
          </div>
        )
      )}
      <AnalysisPanel projectId={project.id} analyses={[...analyses, ...market].sort((a, b) => b.created_at.localeCompare(a.created_at))} isStaff={isStaff} runLabel="AI 리서치 실행" canRun={canRun} disabledReason="상품/서비스와 타깃 고객을 입력하고 저장한 뒤 실행하세요." onRun={async () => { const r = await saveResearchInput(project.id, input); if (!r.ok) return r; return runResearch(project.id); }} />
    </>
  );
}

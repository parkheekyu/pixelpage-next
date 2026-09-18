"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { runResearch, saveResearchInput } from "@/app/app/analysis-actions";
import type { Analysis, Project, ResearchInput } from "@/lib/dash/types";
import AnalysisPanel from "./AnalysisPanel";

const FIELDS: { key: keyof ResearchInput; label: string; ph: string; required?: boolean }[] = [
  { key: "product", label: "상품/서비스", ph: "무엇을 파는지, 어떤 결과를 주는지. 예: 성인 대상 스피치 6주 과정, 발표 불안 해소", required: true },
  { key: "target", label: "타깃 고객", ph: "누가 사는지. 나이·직업·상황·지금 겪는 문제. 예: 30대 직장인, 회의 발표 때 목소리가 떨림", required: true },
  { key: "price", label: "가격/결제 구조", ph: "예: 49만 원 일시불, 분납 가능, 재수강 50%" },
  { key: "offer", label: "오퍼", ph: "예: 무료 진단 상담, 첫 수업 무료, 환불 보장" },
  { key: "proof", label: "보유한 증거", ph: "예: 수강생 후기 120건, 평균 만족도 4.8, 방송 출연, 자격증" },
  { key: "competitors", label: "경쟁사/대안", ph: "예: 유튜브 무료 강의, A학원(더 저렴), 개인 코칭(더 비쌈)" },
  { key: "objections", label: "상담에서 실제 듣는 반박·거절 이유", ph: "예: 시간이 없다, 효과가 있을지 모르겠다, 비싸다, 혼자 해보겠다" },
  { key: "notes", label: "기타", ph: "브랜드 톤, 하지 말아야 할 표현, 과거에 안 됐던 광고 등" },
];

export default function ResearchClient({ project, analyses, market, isStaff }: { project: Project; analyses: Analysis[]; market: Analysis[]; isStaff: boolean }) {
  const [input, setInput] = useState<ResearchInput>(project.research_input ?? {});
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const canRun = !!(input.product?.trim() && input.target?.trim());
  const save = () => start(async () => { const r = await saveResearchInput(project.id, input); setSaved(r.ok ? "저장됨" : r.error); });

  return (
    <>
      <header className="ph">
        <h1>{project.name}<small>리서치 · 본능분석과 반박 제거</small></h1>
      </header>
      {isStaff ? (
        <div className="card" style={{ marginBottom: 12 }}>
          <h2>고객사 정보</h2><div className="sub">AI가 웹 검색으로 시장·경쟁사·키워드를 조사한 뒤, 그 근거로 타깃의 본능과 예상 반박, 메시지 각도, 실행 계획을 한 편의 종합 보고서로 씁니다. 자세할수록 정확합니다. 5~10분 걸립니다.</div>
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
            {FIELDS.map((f) => (
              <label key={f.key} className="f">
                {f.label}{f.required && " *"}
                <textarea value={input[f.key] ?? ""} placeholder={f.ph} onChange={(e) => setInput({ ...input, [f.key]: e.target.value })} rows={f.key === "product" || f.key === "target" ? 4 : 3} />
              </label>
            ))}
          </div>
          <div className="form-row" style={{ marginTop: 10 }}>
            <button type="button" className="btn" onClick={save} disabled={pending}><Save className="ico" aria-hidden /> 정보 저장</button>
            {saved && <span className="hint" style={{ marginTop: 0 }}>{saved}</span>}
          </div>
        </div>
      ) : (
        project.research_input?.product && (
          <div className="card" style={{ marginBottom: 12 }}>
            <h2>상품·타깃 요약</h2>
            <div className="kv"><b>상품/서비스</b><span>{project.research_input.product}</span><b>타깃 고객</b><span>{project.research_input.target}</span></div>
          </div>
        )
      )}
      <AnalysisPanel projectId={project.id} analyses={[...analyses, ...market].sort((a, b) => b.created_at.localeCompare(a.created_at))} isStaff={isStaff} runLabel="AI 리서치 실행 (종합 보고서)" canRun={canRun} disabledReason="상품/서비스와 타깃 고객을 입력하고 저장한 뒤 실행하세요." onRun={async () => { const r = await saveResearchInput(project.id, input); if (!r.ok) return r; return runResearch(project.id); }} />
    </>
  );
}

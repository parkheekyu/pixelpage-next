"use client";

import { useState, useTransition } from "react";
import { Copy, Save } from "lucide-react";
import { perplexityPrompts, perplexityTopicPrompt } from "@/lib/dash/research-prompts";
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
  const [copied, setCopied] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const copy = (title: string, text: string) => {
    const done = () => { setCopied(title); setTimeout(() => setCopied((c) => (c === title ? null : c)), 2000); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, () => setOpen(title));
    else setOpen(title);
  };
  const [pending, start] = useTransition();
  const canRun = !!(input.product?.trim() && input.target?.trim());
  const save = () => start(async () => { const r = await saveResearchInput(project.id, input); setSaved(r.ok ? "저장됨" : r.error); });

  return (
    <>
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

          <h2 style={{ marginTop: 18 }}>퍼플렉시티 사전 조사 (선택)</h2>
          <div className="sub">API 없이 퍼플렉시티 구독으로 조사하는 방법: 프롬프트를 복사해 퍼플렉시티 Research 모드에 붙여 넣고, 나온 답(출처 포함)을 아래 칸에 붙여 넣으세요. AI 리서치가 이 자료를 1차 근거로 씁니다. 비워 두면 Claude가 직접 웹 검색합니다.{!canRun && " 상품/서비스와 타깃 고객을 먼저 채우면 프롬프트가 더 정확해집니다."}</div>
          <div className="form-row" style={{ marginBottom: 8 }}>
            <input value={topic} placeholder="특정 주제로 물어보기 (예: 경쟁 강의 가격과 수강생 불만)" onChange={(e) => setTopic(e.target.value)} style={{ flex: "1 1 320px" }} />
            <button type="button" className="btn" disabled={!topic.trim()} onClick={() => copy("주제", perplexityTopicPrompt(project.name, input, topic.trim()))}><Copy className="ico" aria-hidden /> {copied === "주제" ? "복사됨" : "주제 프롬프트 복사"}</button>
            <a className="btn" href="https://www.perplexity.ai/" target="_blank" rel="noopener noreferrer">퍼플렉시티 열기</a>
          </div>
          <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
            {[...(topic.trim() ? [{ title: "주제", prompt: perplexityTopicPrompt(project.name, input, topic.trim()) }] : []), ...perplexityPrompts(project.name, input)].map((q) => (
              <div key={q.title} style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "6px 10px" }}>
                <div className="form-row" style={{ alignItems: "center" }}>
                  <button type="button" className="btn" onClick={() => copy(q.title, q.prompt)}><Copy className="ico" aria-hidden /> {copied === q.title ? "복사됨" : "복사"}</button>
                  <span style={{ fontWeight: 600 }}>{q.title === "주제" ? `주제: ${topic.trim()}` : q.title}</span>
                  <button type="button" className="btn ghost" style={{ marginLeft: "auto" }} onClick={() => setOpen(open === q.title ? null : q.title)}>{open === q.title ? "접기" : "내용 보기"}</button>
                </div>
                {open === q.title && <textarea readOnly value={q.prompt} rows={8} onFocus={(e) => e.currentTarget.select()} style={{ marginTop: 6, fontSize: 12 }} />}
              </div>
            ))}
          </div>
          <textarea value={input.pre_research ?? ""} placeholder="퍼플렉시티 답변을 그대로 붙여 넣으세요 (3개를 이어서 붙여도 됩니다). 출처 링크가 함께 있으면 보고서에 출처로 표시됩니다." onChange={(e) => setInput({ ...input, pre_research: e.target.value })} rows={6} style={{ marginTop: 4 }} />
          <div className="hint">{(input.pre_research ?? "").length.toLocaleString()}자 · 저장은 위 정보 저장 버튼 또는 실행 시 자동</div>
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

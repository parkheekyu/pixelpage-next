"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Save } from "lucide-react";
import { runLandingAnalysis, saveIntegrations, saveLandingUrl } from "@/app/app/analysis-actions";
import type { Analysis, Project } from "@/lib/dash/types";
import AnalysisPanel from "./AnalysisPanel";

interface Props { project: Project; isStaff: boolean; analyses: Analysis[]; integ: { ga4_property_id: string | null; clarity_project_id: string | null; hasClarityToken: boolean } | null; ga4Configured: boolean }

export default function LandingClient({ project, isStaff, analyses, integ, ga4Configured }: Props) {
  const router = useRouter();
  const [url, setUrl] = useState(project.landing_url ?? "");
  const [ga, setGa] = useState(integ?.ga4_property_id ?? ""), [clp, setClp] = useState(integ?.clarity_project_id ?? ""), [clt, setClt] = useState("");
  const [days, setDays] = useState(28);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const save = () => start(async () => {
    const a = await saveLandingUrl(project.id, url); if (!a.ok) { setMsg(a.error); return; }
    const b = await saveIntegrations(project.id, { ga4_property_id: ga, clarity_project_id: clp, clarity_api_token: clt });
    setMsg(b.ok ? "저장됨" : b.error); setClt(""); router.refresh();
  });

  return (
    <>
      <header className="ph">
        <h1>{project.name}<small>랜딩페이지</small></h1>
        {project.landing_url && <a className="btn" href={project.landing_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="ico" aria-hidden /> 페이지 열기</a>}
      </header>

      {isStaff ? (
        <div className="card" style={{ marginBottom: 12 }}>
          <h2>연동 설정</h2>
          <div className="sub">랜딩 주소는 필수. GA4는 속성 ID(숫자)와 서버 환경 변수 GA4_SERVICE_ACCOUNT_JSON(서비스 계정을 속성에 뷰어로 추가) · Clarity는 프로젝트 설정 → Data Export의 API 토큰. 데이터가 없어도 구조·카피 분석은 됩니다.</div>
          <div className="form-row">
            <label className="f">랜딩페이지 주소 *<input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/lp" style={{ minWidth: 320 }} /></label>
            <label className="f">GA4 속성 ID {ga4Configured ? "" : "(서버 키 미설정)"}<input type="text" value={ga} onChange={(e) => setGa(e.target.value)} placeholder="123456789" /></label>
            <label className="f">Clarity 프로젝트 ID<input type="text" value={clp} onChange={(e) => setClp(e.target.value)} placeholder="abcdefghij" /></label>
            <label className="f">Clarity API 토큰 {integ?.hasClarityToken ? "(저장됨 · 바꿀 때만 입력)" : ""}<input type="password" value={clt} onChange={(e) => setClt(e.target.value)} placeholder="eyJ…" autoComplete="off" /></label>
            <button type="button" className="btn" onClick={save} disabled={pending} style={{ alignSelf: "flex-end" }}><Save className="ico" aria-hidden /> 저장</button>
            {msg && <span className="hint" style={{ alignSelf: "flex-end", marginBottom: 8 }}>{msg}</span>}
          </div>
        </div>
      ) : (
        project.landing_url && <div className="card" style={{ marginBottom: 12 }}><div className="kv"><b>분석 대상</b><span>{project.landing_url}</span></div></div>
      )}

      <AnalysisPanel projectId={project.id} analyses={analyses} isStaff={isStaff} runLabel="AI 랜딩페이지 분석 실행" canRun={!!project.landing_url} disabledReason="랜딩페이지 주소를 저장하세요."
        extraControls={<label className="tb">GA4 기간 <select value={days} onChange={(e) => setDays(+e.target.value)}><option value={7}>7일</option><option value={14}>14일</option><option value={28}>28일</option><option value={90}>90일</option></select></label>}
        onRun={() => runLandingAnalysis(project.id, { days })} />
    </>
  );
}

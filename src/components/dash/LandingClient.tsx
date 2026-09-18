"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { runLandingAnalysis } from "@/app/app/analysis-actions";
import type { Analysis, Project } from "@/lib/dash/types";
import AnalysisPanel from "./AnalysisPanel";

interface Props { project: Project; isStaff: boolean; analyses: Analysis[]; integ: { ga4_property_id: string | null; clarity_project_id: string | null; hasClarityToken: boolean } | null; ga4Configured: boolean }

export default function LandingClient({ project, isStaff, analyses, integ, ga4Configured }: Props) {
  const [days, setDays] = useState(28);
  const status = [
    project.landing_url ? `랜딩: ${project.landing_url}` : "랜딩 주소 없음",
    integ?.ga4_property_id && ga4Configured ? `GA4 ${integ.ga4_property_id}` : "GA4 미연동",
    integ?.hasClarityToken ? "Clarity 연동" : "Clarity 미연동",
  ].join(" · ");
  return (
    <>
      <div className="ph" style={{ marginTop: -4 }}>
        <span className="hint" style={{ margin: 0 }}>{status}{isStaff && <> · <Link href={`/app/settings/${project.id}`}>설정</Link></>}</span>
        {project.landing_url && <a className="btn" href={project.landing_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="ico" aria-hidden /> 페이지 열기</a>}
      </div>
      <AnalysisPanel projectId={project.id} analyses={analyses} isStaff={isStaff} runLabel="AI 랜딩페이지 분석 실행" canRun={!!project.landing_url} disabledReason="설정에서 랜딩페이지 주소를 저장하세요."
        extraControls={<label className="tb">GA4 기간 <select value={days} onChange={(e) => setDays(+e.target.value)}><option value={7}>7일</option><option value={14}>14일</option><option value={28}>28일</option><option value={90}>90일</option></select></label>}
        onRun={() => runLandingAnalysis(project.id, { days })} />
    </>
  );
}

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
  const ga4 = !!(integ?.ga4_property_id && ga4Configured), clarity = !!integ?.hasClarityToken;
  return (
    <>
      <div className="sec-bar">
        <b>랜딩페이지</b>
        {project.landing_url
          ? <a className="lp-url" href={project.landing_url} target="_blank" rel="noopener noreferrer">{project.landing_url.replace(/^https?:\/\//, "")} <ExternalLink size={13} aria-hidden /></a>
          : <span className="pill tag-orange">주소 없음</span>}
        <span className="sp" />
        {isStaff && <>
          <span className={`pill ${ga4 ? "tag-green" : "tag-gray"}`}>GA4 {ga4 ? "연동" : "미연동"}</span>
          <span className={`pill ${clarity ? "tag-green" : "tag-gray"}`}>Clarity {clarity ? "연동" : "미연동"}</span>
          <Link className="btn" href={`/app/settings/${project.id}`}>설정</Link>
        </>}
      </div>
      <AnalysisPanel projectId={project.id} analyses={analyses} isStaff={isStaff} runLabel="AI 랜딩페이지 분석 실행" canRun={!!project.landing_url} disabledReason="설정에서 랜딩페이지 주소를 저장하세요."
        extraControls={<select value={days} aria-label="GA4 기간" onChange={(e) => setDays(+e.target.value)}><option value={7}>GA4 최근 7일</option><option value={14}>GA4 최근 14일</option><option value={28}>GA4 최근 28일</option><option value={90}>GA4 최근 90일</option></select>}
        onRun={() => runLandingAnalysis(project.id, { days })} />
    </>
  );
}

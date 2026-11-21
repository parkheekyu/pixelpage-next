"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, RefreshCw } from "lucide-react";
import type { Analysis, Project } from "@/lib/dash/types";
import type { LandingStats } from "@/lib/dash/landing-stats";
import { fmtN } from "@/lib/dash/agg";
import AnalysisPanel from "./AnalysisPanel";

interface Props { project: Project; isStaff: boolean; analyses: Analysis[]; stats: LandingStats | null; days: number; integ: { ga4_property_id: string | null; clarity_project_id: string | null; hasClarityToken: boolean } | null; ga4Configured: boolean }

type Grade = "good" | "mid" | "bad" | "none";
const GRADE: Record<Grade, [string, string]> = { good: ["좋음", "tag-green"], mid: ["보통", "tag-gray"], bad: ["손봐야 함", "tag-orange"], none: ["데이터 없음", "tag-gray"] };
/** 통상 기준으로 나눈 등급. 업종과 상품에 따라 달라지므로 참고용이다. */
const grade = (v: number, bad: number, good: number): Grade => (v >= good ? "good" : v >= bad ? "mid" : "bad");
const pc = (v: number, d = 1) => (v * 100).toFixed(d) + "%";
const sec = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}분 ${Math.round(s % 60)}초` : `${Math.round(s)}초`);
const DEVICE: Record<string, string> = { mobile: "모바일", desktop: "PC", tablet: "태블릿", "smart tv": "TV" };

function Q({ q, label, value, g, read, extra }: { q: string; label: string; value: string; g: Grade; read: string; extra?: [string, string][] }) {
  return (
    <div className="lq">
      <div className="lq-q">{q}</div>
      <div className="lq-main"><span>{label}</span><b>{value}</b><span className={`pill ${GRADE[g][1]}`}>{GRADE[g][0]}</span></div>
      {extra && <div className="lq-extra">{extra.map(([k, v]) => <span key={k}>{k} <b>{v}</b></span>)}</div>}
      <p>{read}</p>
    </div>
  );
}

export default function LandingClient({ project, isStaff, analyses, stats, days, integ, ga4Configured }: Props) {
  const router = useRouter(), pathname = usePathname();
  const [pending, start] = useTransition();
  const ga4 = !!(integ?.ga4_property_id && ga4Configured), clarity = !!integ?.hasClarityToken;
  const t = stats?.ga?.totals, c = stats?.clarity;
  const cvr = t && t.sessions ? t.conversions / t.sessions : 0;
  const rate = (conv: number, sessions: number) => (sessions ? pc(conv / sessions) : "–");
  // Clarity 는 최근 3일만 준다. 세션 100회당 건수로 바꿔서 본다.
  const per100 = (n: number) => (c && c.sessions ? (n / c.sessions) * 100 : 0);
  const trouble = c ? per100(c.rageClicks) + per100(c.deadClicks) : 0;

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
          {ga4 && <select value={days} aria-label="기간" onChange={(e) => start(() => router.replace(`${pathname}?days=${e.target.value}`))}><option value={7}>최근 7일</option><option value={14}>최근 14일</option><option value={28}>최근 28일</option><option value={90}>최근 90일</option></select>}
          {(ga4 || clarity) && <button type="button" className="btn" disabled={pending} onClick={() => start(() => router.replace(`${pathname}?days=${days}&refresh=${Date.now()}`))}><RefreshCw className="ico" aria-hidden /> {pending ? "불러오는 중…" : "새로고침"}</button>}
          <Link className="btn" href={`/app/settings/${project.id}`}>설정</Link>
        </>}
      </div>

      {isStaff && !ga4 && !clarity && (
        <div className="card"><div className="sl-empty" style={{ padding: "32px 16px" }}>GA4나 Clarity를 연결하면 방문·전환·스크롤 숫자가 여기에 나옵니다. <Link href={`/app/settings/${project.id}`}>설정에서 연결하기</Link></div></div>
      )}
      {isStaff && stats?.gaError && <div className="msg err">GA4 조회 실패: {stats.gaError}</div>}
      {isStaff && stats?.clarityError && <div className="msg err">Clarity 조회 실패: {stats.clarityError}</div>}

      {isStaff && (t || c) && (
        <div style={{ opacity: pending ? 0.6 : 1, transition: "opacity .15s" }}>
          <section className="lqs">
            {t && <Q q="들어온 사람이 신청하나" label="전환율" value={t.sessions ? pc(cvr, 2) : "–"} g={!t.sessions ? "none" : t.conversions === 0 ? "none" : grade(cvr, 0.01, 0.03)}
              extra={[["방문", fmtN(t.sessions)], ["전환", fmtN(t.conversions)]]}
              read={!t.sessions ? "이 기간에 방문이 없습니다." : t.conversions === 0 ? "전환이 0건입니다. 실제로 신청이 없었거나, GA4에 전환 이벤트(신청 완료)가 설정되지 않은 상태입니다." : `방문 100번 중 ${(cvr * 100).toFixed(1)}번이 신청으로 이어집니다.`} />}
            {t && <Q q="들어와서 바로 나가나" label="참여율" value={t.sessions ? pc(t.engagementRate, 0) : "–"} g={t.sessions ? grade(t.engagementRate, 0.4, 0.6) : "none"}
              extra={[["평균 체류", sec(t.avgEngagementSec)]]}
              read={!t.sessions ? "이 기간에 방문이 없습니다." : t.engagementRate < 0.4 ? "절반 넘게 10초 안에 나갑니다. 광고 문구와 랜딩 첫 화면이 서로 맞는지 먼저 보세요." : t.engagementRate < 0.6 ? "들어온 사람의 절반쯤이 내용을 읽습니다. 첫 화면 문구를 손보면 더 올릴 수 있습니다." : "들어온 사람 대부분이 머물러 읽습니다. 첫 화면은 잘 작동하고 있습니다."} />}
            {c ? <Q q="어디서 막히나" label="평균 스크롤" value={c.sessions ? `${Math.round(c.scrollDepth)}%` : "–"} g={c.sessions ? grade(c.scrollDepth, 40, 60) : "none"}
              extra={[["분노 클릭", `100회당 ${per100(c.rageClicks).toFixed(1)}`], ["죽은 클릭", `100회당 ${per100(c.deadClicks).toFixed(1)}`]]}
              read={!c.sessions ? "최근 3일 동안 기록된 방문이 없습니다." : `${c.scrollDepth < 40 ? "대부분 페이지 위쪽만 보고 나갑니다. 위쪽에서 핵심 혜택과 신청 버튼이 보이게 하세요." : c.scrollDepth < 60 ? "절반쯤까지 읽습니다. 신청 버튼이 그 안에 있는지 확인하세요." : "아래쪽까지 읽는 편입니다."}${trouble >= 10 ? " 눌러도 반응 없는 곳을 누르는 일이 잦습니다. 버튼과 입력 칸이 제대로 작동하는지 확인하세요." : ""} (최근 3일 기준)`} />
              : <div className="lq off"><div className="lq-q">어디서 막히나</div><p>Clarity를 연결하면 스크롤 깊이와 클릭 문제가 여기에 나옵니다.</p></div>}
          </section>

          {stats?.ga && (stats.ga.byDevice.length > 0 || stats.ga.bySource.length > 0) && (
            <section className="lts">
              <div className="card">
                <h2>기기별</h2><div className="sub">모바일과 PC의 전환율 차이가 크면 낮은 쪽 화면을 먼저 손봅니다</div>
                <table className="atbl compact"><thead><tr><th>기기</th><th className="num">방문</th><th className="num">참여율</th><th className="num">전환</th><th className="num">전환율</th></tr></thead>
                  <tbody>{[...stats.ga.byDevice].sort((a, b) => b.sessions - a.sessions).map((d) => <tr key={d.device}><td>{DEVICE[d.device] ?? d.device}</td><td className="num">{fmtN(d.sessions)}</td><td className="num">{pc(d.engagementRate, 0)}</td><td className="num">{fmtN(d.conversions)}</td><td className="num">{rate(d.conversions, d.sessions)}</td></tr>)}</tbody></table>
              </div>
              <div className="card">
                <h2>유입 경로별</h2><div className="sub">방문이 많은 순 · 어디서 온 사람이 신청까지 가는지</div>
                <table className="atbl compact"><thead><tr><th>경로</th><th className="num">방문</th><th className="num">참여율</th><th className="num">전환</th><th className="num">전환율</th></tr></thead>
                  <tbody>{stats.ga.bySource.slice(0, 8).map((d) => <tr key={d.source}><td>{d.source}</td><td className="num">{fmtN(d.sessions)}</td><td className="num">{pc(d.engagementRate, 0)}</td><td className="num">{fmtN(d.conversions)}</td><td className="num">{rate(d.conversions, d.sessions)}</td></tr>)}</tbody></table>
              </div>
            </section>
          )}
          <div className="hint" style={{ marginTop: 10 }}>좋음·보통·손봐야 함은 통상 기준(전환율 1%·3%, 참여율 40%·60%, 스크롤 40%·60%)으로 나눈 참고용입니다. GA4는 어제까지의 최근 {days}일, Clarity는 최근 3일 기준입니다.</div>
        </div>
      )}

      {/* AI 분석은 화면에서 뺐다. 고객사 계정은 숫자 화면이 없으므로 이전에 저장된 리포트만 읽을 수 있게 둔다. */}
      {!isStaff && <AnalysisPanel projectId={project.id} analyses={analyses} isStaff={false} runLabel="" canRun={false} onRun={async () => ({ ok: false, error: "" })} />}
    </>
  );
}

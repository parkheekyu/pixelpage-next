"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  MessageSquare,
  FileText,
  Users,
  UserCog,
  Code2,
  Palette,
  Bell,
  LineChart,
  ChevronDown,
} from "lucide-react";

const KAKAO_URL = "http://pf.kakao.com/_cxccdX/chat";

/* ─────────────────────── Reusable ─────────────────────── */

const Btn = ({ href, primary = false, children }: { href: string; primary?: boolean; children: React.ReactNode }) => (
  <a
    href={href}
    className={
      primary
        ? "inline-flex items-center gap-2 px-6 py-3 bg-[#2563eb] hover:bg-[#3b82f6] text-white text-[14px] font-semibold rounded-full transition-colors shadow-[0_10px_28px_-8px_rgba(37,99,235,0.55)]"
        : "inline-flex items-center gap-2 px-6 py-3 border border-white/25 hover:border-white/50 hover:bg-white/5 text-white text-[14px] font-semibold rounded-full transition-colors"
    }
  >
    {children}
  </a>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-blue-400 mb-4">{children}</p>
);

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="break-keep text-white text-[clamp(28px,4vw,44px)] font-bold leading-[1.25] tracking-[-0.03em]">
    {children}
  </h2>
);

/* ─────────────────────── Main ─────────────────────── */

const LpClient = () => {
  const [form, setForm] = useState({ name: "", company: "", phone: "", budget: "", agree: false });
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.agree) return;
    const body = `이름: ${form.name}%0A회사: ${form.company}%0A연락처: ${form.phone}%0A월 광고 예산: ${form.budget}`;
    window.location.href = `mailto:contact@pixelpage.co.kr?subject=%5B무료%20진단%20신청%5D%20${encodeURIComponent(form.company || form.name)}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="bg-[#05070d] text-white min-h-screen">
      {/* ── Top Nav ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#05070d]/85 backdrop-blur-lg border-b border-white/[0.06]">
        <div className="max-w-[1240px] mx-auto h-[68px] px-6 lg:px-10 flex items-center justify-between">
          <a href="/" className="leading-[0.95] font-extrabold tracking-[-0.02em] text-[14px]">
            <div className="text-white">PIXEL</div>
            <div className="text-blue-400">PAGE</div>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-[13px] text-white/60">
            <a href="#cases" className="hover:text-white transition-colors">성과</a>
            <a href="#service" className="hover:text-white transition-colors">서비스</a>
            <a href="#process" className="hover:text-white transition-colors">프로세스</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>
          <Btn href="#cta" primary>무료 상담 신청하기 <ArrowRight className="w-3.5 h-3.5" /></Btn>
        </div>
      </header>

      {/* ── 1. Hero (split: text left, mockup right) ── */}
      <section
        className="relative pt-[130px] pb-24 lg:pb-32 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 900px 700px at 78% 40%, rgba(37,99,235,0.55) 0%, rgba(37,99,235,0.18) 40%, transparent 70%), linear-gradient(180deg, #05070d 0%, #0a0f1e 100%)",
        }}
      >
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
          {/* Left — copy */}
          <div>
            <h1 className="break-keep text-white text-[clamp(38px,5.5vw,60px)] font-bold leading-[1.14] tracking-[-0.035em] mb-8">
              한정된 브랜드 대상<br />
              픽셀페이지가 직접 굴리는<br />
              <span className="text-blue-400">DB 마케팅</span>
            </h1>
            <p className="text-[16px] md:text-[17px] text-white/60 leading-[1.85] mb-10 max-w-[520px]">
              광고 소재·랜딩페이지 무한 A/B 테스트로 신규 고객을 확보합니다.<br />
              대행이 아닌, 브랜드 전담 팀이 하나가 되어 즉시 투입됩니다.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Btn href="#cta" primary>무료 진단 신청하기 <ArrowRight className="w-3.5 h-3.5" /></Btn>
              <Btn href="#cases">성과 사례 보기</Btn>
            </div>
          </div>

          {/* Right — floating dashboard mockups */}
          <div className="relative h-[420px] hidden lg:block">
            {/* 카톡 알림 카드 */}
            <div className="absolute top-0 right-0 w-[340px] rounded-2xl bg-[#0f1729]/85 backdrop-blur-md border border-white/10 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.6)] p-5">
              <div className="flex items-center justify-between text-[11px] mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white/70 font-semibold">신규 DB 인입</span>
                </div>
                <span className="text-emerald-300 font-mono">실시간</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { icon: "📩", name: "김OO 님 상담 신청", tag: "메타", time: "14:02" },
                  { icon: "📩", name: "이OO 님 견적 요청", tag: "검색", time: "13:48" },
                  { icon: "📩", name: "박OO 님 문의", tag: "DN", time: "12:57" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2.5">
                    <span className="text-[14px]">{r.icon}</span>
                    <span className="flex-1 text-[12px] text-white/85 truncate">{r.name}</span>
                    <span className="text-[10px] text-blue-300 bg-blue-500/15 px-1.5 py-0.5 rounded font-semibold">{r.tag}</span>
                    <span className="text-[10px] text-white/40 font-mono">{r.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DB 전환율 카드 */}
            <div className="absolute bottom-0 left-0 w-[360px] rounded-2xl bg-[#0f1729]/85 backdrop-blur-md border border-white/10 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.6)] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[11px] text-white/50 font-semibold">DB 전환율</p>
                  <p className="text-[9px] text-white/35">최근 30일 · 파트너사 평균</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/12 px-2 py-1 rounded">▲ +38%</span>
              </div>
              <div className="space-y-2.5 mb-4">
                {[
                  { label: "랜딩 접속", value: "12,480", pct: 90 },
                  { label: "DB 폼 진입", value: "4,120", pct: 55 },
                  { label: "최종 제출", value: "1,864", pct: 26 },
                ].map((b) => (
                  <div key={b.label}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-white/60">{b.label}</span>
                      <span className="text-white/85 font-mono tabular-nums">{b.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-300" style={{ width: `${b.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px]">
                <span className="text-white/50">폼 전환율</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-blue-300 text-[26px] font-bold tracking-tight">14.9%</span>
                  <div className="text-right">
                    <div className="text-white/40 text-[9px]">DB 단가</div>
                    <div className="text-white font-semibold tabular-nums">12,400원</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Partner strip (dark) ── */}
      <section className="py-8 bg-[#05070d] border-y border-white/[0.06]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <p className="text-center text-[11px] tracking-[0.28em] font-semibold text-white/40 mb-6 uppercase">픽셀페이지 파트너</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-white/55 text-[15px] font-semibold tracking-[-0.01em] opacity-80">
            <span>EDULINE</span>
            <span>NORISCHOOL</span>
            <span>CLINIQUE-K</span>
            <span>SUNROOM</span>
            <span>STUDIONINE</span>
            <span>MEGATEACH</span>
            <span>CODEROAD</span>
            <span>KLASSE</span>
          </div>
        </div>
      </section>

      {/* ── 3. Why Pixelpage ── */}
      <section id="service" className="py-24 lg:py-32 bg-[#05070d]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <Eyebrow>Why Pixelpage</Eyebrow>
            <H2>DB 마케팅은 회사 네임밸류보다<br />담당 팀이 중요합니다.</H2>
            <p className="mt-5 text-[14px] text-white/50">픽셀페이지는 <span className="text-blue-300 font-semibold">담당 팀이 직접</span> 담당합니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: FileText, title: "실무부터 미팅까지 실행 팀 직접", body: "대표가 만난 그대로 굴러갑니다. 차원이 다른 판단과 실행 속도를 경험해 보세요." },
              { icon: Users, title: "한정된 고객사, 차원이 다른 운영 퀄리티", body: "고객사의 서비스를 완벽히 이해할 정도로만 받습니다. 스마케팅팀처럼 움직입니다." },
              { icon: UserCog, title: "평생 함께 가는 담당자", body: "픽셀페이지가 직접 운영하기에 담당자가 바뀔 일이 없습니다. 평생 함께합니다." },
            ].map((c, i) => (
              <div key={i} className="rounded-2xl bg-[#0a0f1e] border border-white/[0.08] p-8">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <c.icon className="w-5 h-5 text-white/70" />
                </div>
                <h3 className="text-[16px] font-bold mb-3 tracking-[-0.02em]">{c.title}</h3>
                <p className="text-[13.5px] text-white/55 leading-[1.85]">{c.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-14 text-center text-[14px] text-blue-300/85">
            픽셀페이지는 대표가 계약 첫날부터 내 사업처럼 직접 운영합니다.
          </p>
        </div>
      </section>

      {/* ── 4. One Team Strategy ── */}
      <section className="py-24 lg:py-32 bg-[#05070d] border-t border-white/[0.04]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-12 items-start">
          <div className="lg:sticky lg:top-32">
            <Eyebrow>One Team Strategy</Eyebrow>
            <H2>대표만 투입되는 것이<br />아닙니다.</H2>
            <p className="mt-6 text-[16px] text-white/70 font-semibold">팀 단위의 리소스가 추가로 투입됩니다.</p>
            <p className="mt-3 text-[14px] text-white/45 leading-[1.85]">
              대표 마케터 외 개발자와 디자이너가 투입됩니다.<br />
              디자인 리소스와 개발 리소스가 걸림없이 제공됩니다.
            </p>
          </div>
          <div className="relative space-y-4">
            {[
              { icon: UserCog, tag: "대표", note: "전략 기획 & 운영", body: "시리즈 B~D 스타트업에서 인하우스 마케팅을 이끈 경험을 바탕으로 광고 성과와 실제 매출 구조를 함께 보고 운영합니다." },
              { icon: Code2, tag: "개발자", note: "기술적 최적화", body: "전환 추적부터 페이지 속도 개선, 테스트 환경 구축까지 광고 운영에 필요한 개발 업무를 함께 처리합니다." },
              { icon: Palette, tag: "디자이너", note: "무제한 크리에이티브", body: "예쁜 소재보다 반응 오는 소재로 랜딩페이지를 생산합니다. 데이터를 보며 계속 수정하고 테스트합니다." },
            ].map((r, i) => (
              <div key={i} className="relative rounded-2xl bg-[#0a0f1e] border border-white/[0.08] p-7">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
                    <r.icon className="w-5 h-5 text-blue-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[15px] font-bold text-white">{r.tag}</span>
                      <span className="text-[11px] text-blue-300/70 font-semibold">{r.note}</span>
                    </div>
                    <p className="text-[13px] text-white/60 leading-[1.85]">{r.body}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-2 rotate-90 origin-center">
              <div className="h-px w-8 bg-blue-400/40" />
              <span className="text-[10px] tracking-[0.28em] font-bold text-blue-300 uppercase">One Team</span>
              <div className="h-px w-8 bg-blue-400/40" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Numbers ── */}
      <section className="py-20 lg:py-24 bg-[#05070d] border-t border-white/[0.04]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            {[
              { label: "2025년 광고 취급액", n: "10억 원+" },
              { label: "2025년 매출 성장", n: "83% ↑" },
              { label: "누적 컨설팅", n: "500명+" },
            ].map((m) => (
              <div key={m.n}>
                <p className="text-[12px] text-white/40 mb-3 font-semibold">{m.label}</p>
                <p className="text-[clamp(36px,4vw,52px)] font-extrabold tracking-[-0.045em] text-white leading-none">{m.n}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Project Result (BLUE section) ── */}
      <section
        id="cases"
        className="relative py-24 lg:py-32 overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #05070d 0%, #0f2570 15%, #1e40af 50%, #0f2570 85%, #05070d 100%)",
        }}
      >
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <Eyebrow>Project Result</Eyebrow>
            <H2>함께한 브랜드,<br />모두 성장했습니다.</H2>
            <p className="mt-5 text-[14px] text-white/70">데이터 기반 전략으로 실질적인 성과를 만들었습니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                metric: "10x 성장",
                year: "2025년 매출 100억",
                tag: "D사",
                sub: "성인 교육 · 지식 콘텐츠",
                bullets: ["DB 매체 채널 개선으로 광고비 가성비 확보", "리드폼 → 세일즈 콜 자동화 구조 안착", "픽셀 도입 확장 후 유저 액션 수치화"],
              },
              {
                metric: "2.4x 성장",
                year: "2025년 매출 24억",
                tag: "P사",
                sub: "학원 프랜차이즈 로컬",
                bullets: ["지역 특성에 맞춘 조건 & 소재 세팅", "적정한 광고비에 상세 랜딩페이지·소재 A/B 테스트", "고관여 타깃 발굴을 통한 전환율 개선"],
              },
              {
                metric: "3.0x 성장",
                year: "2025년 매출 6억",
                tag: "G사",
                sub: "태양광 시공 서비스",
                bullets: ["카톡 알림톡 검색광고·그룹 및 소재 세분화", "광고소재·랜딩페이지 예산 500만 확대", "신규 KPI 설정 및 신규 캠페인 라이브"],
              },
            ].map((c) => (
              <div key={c.tag} className="rounded-2xl bg-white p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]">
                <p className="text-[26px] md:text-[30px] font-extrabold text-[#0a0f1e] tracking-[-0.035em] leading-none">{c.metric}</p>
                <p className="mt-2 text-[12px] text-[#8b95a1]">{c.year}</p>
                <div className="mt-5 pt-5 border-t border-[#eef0f4]">
                  <p className="text-[15px] font-bold text-blue-600 mb-1">{c.tag}</p>
                  <p className="text-[12px] text-[#6b7280] mb-4">{c.sub}</p>
                  <ul className="space-y-2.5">
                    {c.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12.5px] text-[#374151] leading-[1.65]">
                        <Check className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Case Index bar */}
          <div className="mt-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <p className="text-[12px] font-bold tracking-[0.2em] text-white/70 uppercase">Case Index</p>
              <p className="text-[11px] text-white/50">업종이 달라도 실행 사이클은 같습니다</p>
            </div>
            {[
              { co: "D사", biz: "성인 교육 지식 플랫폼", note: "회원가입 단가 73% 개선 및 회원가입 400% 개선", mult: "4x" },
              { co: "P사", biz: "학원 프랜차이즈", note: "광고 성과 확인용 통합 광고 예산 500만 확대", mult: "5x" },
              { co: "G사", biz: "태양광 시공", note: "고객획득단가 현실적으로 DB획득으로 수익구조 확립", mult: "2.5x" },
            ].map((r) => (
              <div key={r.co} className="grid grid-cols-[60px_180px_1fr_60px] gap-4 items-center px-6 py-4 border-b border-white/5 last:border-b-0 text-[13px]">
                <span className="text-white font-bold">{r.co}</span>
                <span className="text-white/70">{r.biz}</span>
                <span className="text-white/60 truncate">{r.note}</span>
                <span className="text-blue-300 font-bold text-right">{r.mult}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Everywhere Media (channels) ── */}
      <section className="py-24 lg:py-32 bg-[#05070d]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <Eyebrow>Everywhere Media</Eyebrow>
            <H2>모든 고객이 있는 곳,<br />모든 채널에 광고합니다.</H2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-[820px] mx-auto">
            {[
              { name: "Meta", tag: "인지·전환" },
              { name: "Google", tag: "검색·디스플레이" },
              { name: "Naver", tag: "파워링크·GFA" },
              { name: "YouTube", tag: "숏폼·영상" },
              { name: "TikTok", tag: "숏폼·트렌드" },
              { name: "Kakao", tag: "알림·비즈보드" },
              { name: "Threads", tag: "커뮤니티" },
              { name: "LinkedIn", tag: "B2B" },
            ].map((c) => (
              <div key={c.name} className="rounded-xl bg-[#0a0f1e] border border-white/[0.08] px-5 py-4 text-center">
                <p className="text-[14px] font-bold">{c.name}</p>
                <p className="text-[10.5px] text-white/45 mt-1">{c.tag}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. A/B Test (reel gallery) ── */}
      <section className="py-24 lg:py-32 bg-[#05070d] border-t border-white/[0.04]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <Eyebrow>Unlimited A/B Test</Eyebrow>
            <H2>이길 때까지<br />소재를 다시 만듭니다.</H2>
            <p className="mt-5 text-[14px] text-white/55 max-w-[520px] mx-auto leading-[1.85]">
              감이 아닌 데이터로 소재를 판단합니다. 이긴 소재에 예산을 집중하고, 진 소재는 다음 판을 준비합니다.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-[1000px] mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="aspect-[9/16] rounded-xl overflow-hidden bg-black border border-white/[0.06]">
                <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                  <source src={`/reels/${i}.mp4`} type="video/mp4" />
                </video>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Real-time Tracking ── */}
      <section className="py-24 lg:py-32 bg-[#05070d] border-t border-white/[0.04]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <Eyebrow>Real-Time Tracking</Eyebrow>
            <H2>DB가 들어오는 순간,<br />모두가 함께 봅니다.</H2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Bell, t: "카카오톡 실시간 알림", d: "리드 발생 즉시 담당자 카톡으로. 대표님 폰만 확인하시면 됩니다." },
              { icon: LineChart, t: "구글 시트 · CRM 자동", d: "이름·연락처·관심 항목이 자동 정리. 상담팀이 바로 응대합니다." },
              { icon: MessageSquare, t: "주간 데이터 미팅", d: "CPA·전환수·매출을 매주 함께 리뷰. 살릴지·끌지·교체할지 결정합니다." },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl bg-[#0a0f1e] border border-white/[0.08] p-8">
                <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center mb-5">
                  <c.icon className="w-5 h-5 text-blue-300" />
                </div>
                <h3 className="text-[17px] font-bold mb-2.5 tracking-[-0.02em]">{c.t}</h3>
                <p className="text-[13.5px] text-white/55 leading-[1.85]">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. Roadmap ── */}
      <section id="process" className="py-24 lg:py-32 bg-[#05070d] border-t border-white/[0.04]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <Eyebrow>Roadmap</Eyebrow>
            <H2>4단계로<br />처음부터 끝까지.</H2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { n: "01", t: "무료 진단", d: "광고 계정·랜딩·CRM 진단. 계약 전 공개." },
              { n: "02", t: "구조 설계", d: "채널·소재·랜딩·시퀀스를 한 번에 설계." },
              { n: "03", t: "실전 집행", d: "매주 CPA·전환 기준으로 결정. 숫자로 판단." },
              { n: "04", t: "스케일링", d: "이긴 구조를 복제하고 예산을 확장." },
            ].map((s, i) => (
              <div key={s.n} className="relative rounded-2xl bg-[#0a0f1e] border border-white/[0.08] p-7">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center mb-5 text-[13px] font-bold ${
                    i >= 2
                      ? "bg-blue-500 text-white shadow-[0_0_0_6px_rgba(37,99,235,0.18)]"
                      : "bg-white/5 border border-white/15 text-white"
                  }`}
                >
                  {s.n}
                </div>
                <h3 className="text-[16px] font-bold mb-2 tracking-[-0.02em]">{s.t}</h3>
                <p className="text-[12.5px] text-white/55 leading-[1.75]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. Scarcity ── */}
      <section className="py-16 bg-[#05070d] border-y border-white/[0.06]">
        <div className="max-w-[820px] mx-auto px-6 lg:px-10 text-center">
          <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-blue-300 mb-3">Limited Availability</p>
          <p className="text-[22px] md:text-[28px] font-bold leading-[1.4] tracking-[-0.025em] text-white">
            <span className="text-blue-400">이번 달 신규 대행 잔여: 1석</span><br />
            <span className="text-white/55 text-[14px] font-medium block mt-2">한 팀이 동시에 관리할 수 있는 브랜드 수를 제한합니다.</span>
          </p>
        </div>
      </section>

      {/* ── 12. FAQ ── */}
      <section id="faq" className="py-24 lg:py-32 bg-[#05070d]">
        <div className="max-w-[820px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <Eyebrow>FAQ</Eyebrow>
            <H2>궁금한 게 있으신가요?</H2>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {[
              { q: "일반 광고 대행사랑 뭐가 다른가요?", a: "광고만 하지 않습니다. 광고·랜딩·CRM을 하나의 팀이 설계·분석·개선합니다. 퍼널 전체를 보기 때문에 어디가 문제인지 즉시 파악합니다." },
              { q: "월 광고비가 크지 않아도 가능한가요?", a: "가능합니다. 다만 최소 3주 학습 예산은 확보하셔야 정확한 판단이 가능합니다. 무료 진단에서 예산 규모에 맞는 구조를 함께 잡아드립니다." },
              { q: "계약 기간은 어떻게 되나요?", a: "월 단위 또는 프로젝트 단위로 유연하게 진행합니다. 진단 후 브랜드 상황에 맞는 구조를 함께 설계합니다." },
              { q: "무료 진단은 정말 무료인가요?", a: "네. 계약 전에 광고 계정·랜딩 전환율·CRM 구조를 무료로 분석해 드립니다. 진단만 받고 안 하셔도 괜찮습니다." },
              { q: "우리 업종은 안 되던데 가능할까요?", a: "B2C 상담이 필요한 업종이라면 대부분 가능합니다. 교육·코칭·의료·인테리어·태양광·법률 등 다양한 업종에서 성과를 만들었습니다." },
            ].map((f, i) => (
              <details key={i} className="group py-5">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-[15px] md:text-[16px] font-semibold text-white tracking-[-0.015em]">{f.q}</span>
                  <ChevronDown className="w-5 h-5 text-white/40 transition-transform group-open:rotate-180 flex-shrink-0" />
                </summary>
                <p className="mt-4 text-[13.5px] text-white/55 leading-[1.85]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 13. Final CTA + form ── */}
      <section id="cta" className="py-24 lg:py-32 bg-[#05070d] border-t border-white/[0.06]">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <Eyebrow>Free Diagnosis</Eyebrow>
            <H2>지금 무료 진단부터<br />받아보시겠어요?</H2>
            <p className="mt-5 text-[15px] text-white/55 leading-[1.85]">
              광고 계정·랜딩·CRM을 함께 열어보고 어디가 새는지 찾아드립니다.<br />계약 없이도 괜찮습니다.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-2xl bg-[#0a0f1e] border border-white/10 p-10 text-center">
              <p className="text-[18px] font-semibold mb-3">신청이 접수되었습니다.</p>
              <p className="text-[13px] text-white/55 mb-6">평균 3시간 이내 담당자가 연락드립니다.</p>
              <a
                href={KAKAO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FEE500] text-[#181600] text-[14px] font-bold hover:bg-[#ffe95c] transition-colors"
              >
                <MessageSquare className="w-4 h-4" /> 카카오톡으로 바로 문의
              </a>
            </div>
          ) : (
            <form onSubmit={submit} className="rounded-2xl bg-[#0a0f1e] border border-white/10 p-7 md:p-9 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="성함"
                  className="w-full px-4 py-3.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder-white/35 focus:outline-none focus:border-blue-400"
                />
                <input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="회사·브랜드명"
                  className="w-full px-4 py-3.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder-white/35 focus:outline-none focus:border-blue-400"
                />
              </div>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="연락처"
                className="w-full px-4 py-3.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder-white/35 focus:outline-none focus:border-blue-400"
              />
              <select
                required
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full px-4 py-3.5 rounded-lg bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:border-blue-400"
              >
                <option value="">월 광고 예산 선택</option>
                <option>500만 원 미만</option>
                <option>500 ~ 1,000만 원</option>
                <option>1,000 ~ 3,000만 원</option>
                <option>3,000만 원 이상</option>
              </select>
              <label className="flex items-start gap-2.5 text-[12.5px] text-white/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                  className="mt-0.5"
                  required
                />
                <span>개인정보 수집·이용에 동의합니다. (상담 목적 외 사용하지 않습니다)</span>
              </label>
              <button
                type="submit"
                className="w-full mt-2 px-6 py-4 bg-[#2563eb] hover:bg-[#3b82f6] text-white text-[15px] font-bold rounded-full shadow-[0_14px_30px_-10px_rgba(37,99,235,0.55)] transition-colors"
              >
                무료 상담 신청하기 →
              </button>
              <p className="text-center text-[11.5px] text-white/40 pt-1">평균 회신 3시간 이내 · 계약 강요 없음</p>
            </form>
          )}

          <div className="mt-8 text-center text-[12.5px] text-white/40">
            바로 대화가 편하신가요? &nbsp;
            <a
              href={KAKAO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FEE500] font-semibold hover:underline"
            >
              카카오톡 채널로 문의 →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-[#05070d] text-white/35 text-center text-[11.5px] border-t border-white/[0.06]">
        <div className="max-w-[1240px] mx-auto px-6">
          © PIXELPAGE · pixelpage.co.kr · contact@pixelpage.co.kr
        </div>
      </footer>
    </div>
  );
};

export default LpClient;

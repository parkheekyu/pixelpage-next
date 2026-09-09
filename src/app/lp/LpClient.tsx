"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  MessageSquare,
  Search,
  Users,
  TrendingDown,
  Zap,
  ShieldCheck,
  Infinity as InfinityIcon,
  Target,
  Eye,
} from "lucide-react";
import WhatWeDoSection from "@/components/agency/WhatWeDoSection";
import ProcessSection from "@/components/agency/ProcessSection";
import AgencyFAQSection from "@/components/agency/AgencyFAQSection";
import MethodSection from "@/components/MethodSection";

const KAKAO_URL = "http://pf.kakao.com/_cxccdX/chat";

const PrimaryBtn = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="inline-flex items-center gap-2 px-8 py-4 bg-[#2563eb] hover:bg-[#3b82f6] text-white text-[15px] font-semibold rounded-full transition-colors shadow-[0_18px_40px_-14px_rgba(37,99,235,0.55)]"
  >
    {children}
  </a>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-blue-400 mb-4">{children}</p>
);

const H2 = ({ children, mt = false }: { children: React.ReactNode; mt?: boolean }) => (
  <h2
    className={`break-keep text-white text-[clamp(28px,4vw,44px)] font-bold leading-[1.25] tracking-[-0.03em] ${
      mt ? "mt-1" : ""
    }`}
  >
    {children}
  </h2>
);

const LpClient = () => {
  const [form, setForm] = useState({ name: "", company: "", phone: "", budget: "", agree: false });
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.agree) return;
    const body = `이름: ${form.name}%0A회사: ${form.company}%0A연락처: ${form.phone}%0A월 광고 예산: ${form.budget}`;
    window.location.href = `mailto:contact@pixelpage.co.kr?subject=%5B무료%20상담%20신청%5D%20${encodeURIComponent(form.company || form.name)}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="bg-[#0a0f1e] text-white min-h-screen">
      {/* ── Nav ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1e]/85 backdrop-blur-lg border-b border-white/[0.06]">
        <div className="max-w-[1240px] mx-auto h-[68px] px-6 lg:px-10 flex items-center justify-between">
          <a href="/" className="leading-[0.95] font-extrabold tracking-[-0.02em] text-[14px]">
            <div className="text-white">PIXEL</div>
            <div className="text-blue-400">PAGE</div>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-[13px] text-white/60">
            <a href="#problem" className="hover:text-white">문제</a>
            <a href="#solution" className="hover:text-white">해결</a>
            <a href="#portfolio" className="hover:text-white">성과</a>
            <a href="#process" className="hover:text-white">진행 방식</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <a
            href="#cta"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#2563eb] hover:bg-[#3b82f6] text-white text-[13px] font-semibold rounded-full transition-colors"
          >
            무료 상담 신청 <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* ── 1. Hero (좌측 카피 + 우측 실시간 대시보드 목업) ── */}
      <section
        className="relative pt-[130px] pb-24 lg:pb-32 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 900px 700px at 78% 45%, rgba(37,99,235,0.55) 0%, rgba(37,99,235,0.2) 40%, transparent 70%), linear-gradient(180deg, #0a0f1e 0%, #06090f 100%)",
        }}
      >
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
          {/* Left — copy */}
          <div>
            <p className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.22em] uppercase text-blue-300 bg-white/[0.04] border border-white/[0.08] px-4 py-2 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Partner DB Marketing
            </p>
            <h1 className="break-keep text-white text-[clamp(38px,5.5vw,60px)] font-extrabold leading-[1.14] tracking-[-0.035em] mb-7">
              폭발적인 매출 향상<br />
              <span className="text-blue-400">파트너형 DB 마케팅</span>
            </h1>
            <p className="text-[16px] md:text-[18px] text-white/60 leading-[1.8] max-w-[520px] mb-10">
              광고 소재부터 랜딩페이지, CRM 마케팅을<br />
              <span className="text-white/85 font-semibold">터질 때까지 무한 테스트</span>합니다.
            </p>
            <PrimaryBtn href="#cta">무료 상담 신청하기 <ArrowRight className="w-4 h-4" /></PrimaryBtn>
            <p className="mt-5 text-[12.5px] text-white/40">평균 회신 3시간 이내 · 계약 강요 없음</p>
          </div>

          {/* Right — floating dashboard mockups */}
          <div className="relative h-[440px] hidden lg:block">
            {/* 카톡 알림 카드 (상단) */}
            <div className="absolute top-0 right-0 w-[340px] rounded-2xl bg-[#0f1729]/85 backdrop-blur-md border border-white/10 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.6)] p-5">
              <div className="flex items-center justify-between text-[11px] mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white/70 font-semibold">신규 DB 인입</span>
                </div>
                <span className="text-emerald-300 font-mono">● 실시간</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { name: "김OO 님 상담 신청", tag: "메타", time: "14:02" },
                  { name: "이OO 님 견적 요청", tag: "검색", time: "13:48" },
                  { name: "박OO 님 문의", tag: "GDN", time: "12:57" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2.5">
                    <span className="text-[13px]">📩</span>
                    <span className="flex-1 text-[12px] text-white/85 truncate">{r.name}</span>
                    <span className="text-[10px] text-blue-300 bg-blue-500/15 px-1.5 py-0.5 rounded font-semibold">{r.tag}</span>
                    <span className="text-[10px] text-white/40 font-mono">{r.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DB 전환율 카드 (하단) */}
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

      {/* ── 2. Partners ── */}
      <section className="py-10 bg-[#0a0f1e] border-y border-white/[0.06]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <p className="text-center text-[11px] tracking-[0.28em] font-semibold text-white/40 mb-6 uppercase">
            함께하는 파트너사
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-white/55 text-[15px] font-semibold tracking-[-0.01em]">
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

      {/* ── 3. Problem ── */}
      <section id="problem" className="py-24 lg:py-32 bg-[#0a0f1e]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <Eyebrow>Problem</Eyebrow>
            <H2>
              기존의 DB 마케팅 방식으로는<br />
              <span className="text-white/60 font-semibold">매출 규모를 키우기 어렵습니다</span>
            </H2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[980px] mx-auto">
            {[
              {
                icon: Search,
                tag: "출처를 모릅니다",
                body: "어떤 광고를 보고 온 고객인지 모르니, 상담 품질이 복불복입니다.",
              },
              {
                icon: Users,
                tag: "나만의 DB가 아닙니다",
                body: "같은 DB가 여러 업체에 팔립니다. 전화하면 이미 경쟁사와 통화 중입니다.",
              },
              {
                icon: TrendingDown,
                tag: "늘리는 순간 무너집니다",
                body: "물량을 키우면 허수가 섞이고 단가는 뜁니다. 매출을 키우고 싶어도, 구조가 못 받쳐줍니다.",
              },
              {
                icon: Zap,
                tag: "개선이 없습니다",
                body: "성과가 안 나와도 소재도 타겟도 그대로. 파는 쪽은 바꿀 이유가 없으니까요.",
              },
            ].map((p) => (
              <div
                key={p.tag}
                className="rounded-2xl border border-white/[0.08] p-7 bg-[#0f1425] hover:border-white/[0.14] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-400/20 flex items-center justify-center flex-shrink-0">
                    <p.icon className="w-5 h-5 text-red-300" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-white mb-2 tracking-[-0.02em]">
                      {p.tag}
                    </h3>
                    <p className="text-[14px] text-white/55 leading-[1.85]">{p.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Solution ── */}
      <section
        id="solution"
        className="py-24 lg:py-32 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 720px 400px at 50% 0%, rgba(37,99,235,0.18) 0%, transparent 70%), linear-gradient(180deg, #06090f 0%, #0a0f1e 100%)",
        }}
      >
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <Eyebrow>Solution</Eyebrow>
            <H2>
              그래서 픽셀페이지는<br />
              <span className="text-blue-400">파트너형 DB 마케팅</span>을 고집합니다
            </H2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1080px] mx-auto">
            {[
              {
                icon: ShieldCheck,
                tag: "01",
                title: "전용",
                body: "소재도 랜딩도 귀사 것만. 공유 DB 0건.",
              },
              {
                icon: InfinityIcon,
                tag: "02",
                title: "무한 테스트",
                body: "터지는 조합을 찾을 때까지 다시 만듭니다.",
              },
              {
                icon: Target,
                tag: "03",
                title: "전환까지",
                body: "DB에서 끝내지 않고 매출까지 함께 봅니다.",
              },
              {
                icon: Eye,
                tag: "04",
                title: "투명 공개",
                body: "성과 데이터를 전부 오픈합니다.",
              },
            ].map((s) => (
              <div
                key={s.tag}
                className="rounded-2xl bg-[#0f1425]/80 border border-blue-400/15 p-7 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/25 to-blue-500/10 border border-blue-400/25 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-blue-300" />
                  </div>
                  <span className="text-[11px] text-blue-300/60 font-mono font-bold">{s.tag}</span>
                </div>
                <h3 className="text-[19px] font-bold mb-3 tracking-[-0.02em]">{s.title}</h3>
                <p className="text-[13.5px] text-white/60 leading-[1.85]">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center max-w-[640px] mx-auto">
            <p className="text-[18px] md:text-[20px] text-white leading-[1.55] font-semibold tracking-[-0.02em]">
              들쑥날쑥한 <span className="text-blue-400">DB 품질 문제</span>,<br />
              <span className="text-white/70 font-medium">구조를 만드는 방법으로 해결해 보세요.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── ⚡ POINT 1: 큰 임팩트 숫자 ── */}
      <section className="py-20 lg:py-28 bg-[#06090f] border-y border-white/[0.06]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6">
            {[
              { label: "2025년 광고 취급액", n: "10억", plus: "+" },
              { label: "누적 상담 DB", n: "10만", plus: "+" },
              { label: "누적 컨설팅", n: "500명", plus: "+" },
            ].map((m) => (
              <div key={m.n} className="text-center md:text-left">
                <p className="text-[11px] tracking-[0.24em] font-semibold text-white/45 mb-4 uppercase">{m.label}</p>
                <p className="text-[clamp(48px,6vw,72px)] font-extrabold tracking-[-0.045em] leading-none">
                  <span className="text-blue-400">{m.n}</span>
                  <span className="text-blue-400/60">{m.plus}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. 하나의 팀이 처음부터 끝까지 (메인 MethodSection 재사용, 다크) ── */}
      <div className="border-t border-white/[0.04]">
        <MethodSection variant="dark" />
      </div>

      {/* ── ⚡ POINT 2: 브라이트 블루 성과 섹션 (Portfolio) ── */}
      <section
        id="portfolio"
        className="relative py-24 lg:py-32 overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #06090f 0%, #0f2570 12%, #1e40af 45%, #1e3fa8 65%, #0f2570 88%, #06090f 100%)",
        }}
      >
        {/* 블루 스캔 라인 효과 */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0, transparent 3px, rgba(255,255,255,0.02) 3px, rgba(255,255,255,0.02) 4px)",
          }}
        />
        <div className="relative max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-blue-200 mb-4">Project Result</p>
            <h2 className="break-keep text-white text-[clamp(30px,4.2vw,48px)] font-bold leading-[1.2] tracking-[-0.035em]">
              함께한 파트너사,<br />
              모두 성장했습니다.
            </h2>
            <p className="mt-5 text-[15px] text-white/70">데이터 기반 전략으로 실질적인 성과를 만들었습니다.</p>
          </div>

          {/* 큰 카드 3장 (흰 배경) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                mult: "10x",
                year: "2025년 매출 100억",
                co: "D사",
                sub: "성인 교육 · 지식 콘텐츠",
                bullets: ["DB 매체 채널 최적화로 광고비 가성비 확보", "리드폼 → 세일즈 콜 자동화 안착", "픽셀 도입 후 유저 액션 수치화"],
              },
              {
                mult: "2.4x",
                year: "2025년 매출 24억",
                co: "P사",
                sub: "학원 프랜차이즈 로컬",
                bullets: ["지역 특성 맞춤 타깃·소재 세팅", "상세 랜딩·소재 A/B 테스트", "고관여 타깃 전환율 개선"],
              },
              {
                mult: "3.0x",
                year: "2025년 매출 6억",
                co: "G사",
                sub: "태양광 시공 서비스",
                bullets: ["카톡 알림·검색광고 그룹 세분화", "광고소재·랜딩 예산 500만 확대", "신규 KPI·캠페인 라이브"],
              },
            ].map((c) => (
              <div
                key={c.co}
                className="rounded-2xl bg-white p-7 lg:p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)] transition-transform hover:-translate-y-1"
              >
                <p className="text-[clamp(32px,3.8vw,42px)] font-extrabold text-[#0a0f1e] tracking-[-0.04em] leading-none">
                  {c.mult} <span className="text-[16px] font-bold text-blue-600 align-middle">성장</span>
                </p>
                <p className="mt-2 text-[12px] text-[#8b95a1]">{c.year}</p>
                <div className="mt-5 pt-5 border-t border-[#eef0f4]">
                  <p className="text-[15px] font-bold text-blue-600 mb-1">{c.co}</p>
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

          {/* Case Index — 반투명 테이블 */}
          <div className="mt-10 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/15 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <p className="text-[11px] font-bold tracking-[0.22em] text-white/75 uppercase">Case Index</p>
              <p className="text-[11px] text-white/50">업종이 달라도 실행 사이클은 같습니다</p>
            </div>
            {[
              { co: "D사", biz: "성인 교육", db: "-42%", cnt: "3.1배", mult: "10x" },
              { co: "P사", biz: "학원 프랜차이즈", db: "-58%", cnt: "2.4배", mult: "2.4x" },
              { co: "G사", biz: "태양광 시공", db: "-30%", cnt: "20배", mult: "3x" },
              { co: "M사", biz: "1:1 코칭", db: "-35%", cnt: "3.8배", mult: "4x" },
            ].map((r) => (
              <div key={r.co} className="grid grid-cols-[70px_1fr_90px_90px_70px] gap-4 items-center px-6 py-4 border-b border-white/5 last:border-b-0 text-[13px]">
                <span className="text-white font-bold">{r.co}</span>
                <span className="text-white/70">{r.biz}</span>
                <span className="text-blue-200 font-mono tabular-nums text-right">DB {r.db}</span>
                <span className="text-blue-200 font-mono tabular-nums text-right">{r.cnt}</span>
                <span className="text-white font-bold text-right">{r.mult}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. What We Do (agency 원본 컴포넌트, 다크) ── */}
      <div id="service" className="border-t border-white/[0.04]">
        <WhatWeDoSection variant="dark" />
      </div>

      {/* ── 8. Process (agency 원본 컴포넌트, 다크) ── */}
      <div id="process" className="border-t border-white/[0.04]">
        <ProcessSection variant="dark" />
      </div>

      {/* ── 9. FAQ (agency 원본 컴포넌트, 다크) ── */}
      <div id="faq" className="border-t border-white/[0.04]">
        <AgencyFAQSection variant="dark" />
      </div>

      {/* ── 10. Final CTA ── */}
      <section
        id="cta"
        className="py-24 lg:py-32 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 900px 500px at 50% 100%, rgba(37,99,235,0.28) 0%, transparent 70%), linear-gradient(180deg, #06090f 0%, #0a0f1e 100%)",
        }}
      >
        <div className="max-w-[720px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <Eyebrow>Free Consultation</Eyebrow>
            <h2 className="break-keep text-white text-[clamp(28px,4.2vw,48px)] font-extrabold leading-[1.2] tracking-[-0.035em]">
              DB를 <span className="text-white/45 line-through decoration-[3px]">사지</span> 마세요.<br />
              <span className="text-blue-400">나오는 구조</span>를 만드세요.
            </h2>
            <p className="mt-6 text-[15px] text-white/60 leading-[1.85]">
              광고 계정·랜딩·CRM을 함께 열어보고 어디가 새는지 찾아드립니다.<br />
              계약 없이도 괜찮습니다.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-2xl bg-[#0f1425] border border-white/10 p-10 text-center">
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
            <form onSubmit={submit} className="rounded-2xl bg-[#0f1425] border border-white/10 p-7 md:p-9 space-y-4">
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
                className="w-full mt-2 px-6 py-4 bg-[#2563eb] hover:bg-[#3b82f6] text-white text-[15px] font-bold rounded-full shadow-[0_18px_40px_-14px_rgba(37,99,235,0.55)] transition-colors"
              >
                무료 상담 신청하기 →
              </button>
              <p className="text-center text-[11.5px] text-white/40 pt-1">
                평균 회신 3시간 이내 · 계약 강요 없음
              </p>
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
      <footer className="py-10 bg-[#06090f] text-white/35 text-center text-[11.5px] border-t border-white/[0.06]">
        <div className="max-w-[1240px] mx-auto px-6">
          © PIXELPAGE · pixelpage.co.kr · contact@pixelpage.co.kr
        </div>
      </footer>
    </div>
  );
};

export default LpClient;

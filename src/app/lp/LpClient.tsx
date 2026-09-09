"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  X,
  Phone,
  Star,
  Plus,
  Play,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Umbrella,
  User,
} from "lucide-react";
import charMale from "@/assets/char-male.png";
import charFemale from "@/assets/char-female.png";
import charCurly from "@/assets/char-curly.png";
import logoPixelpage from "@/assets/logo-pixelpage.png";
import type { Article } from "@/lib/notion";

const KAKAO_URL = "http://pf.kakao.com/_cxccdX/chat";
const PURPLE = "#6366f1";

/* ─────────────────────── Reusable ─────────────────────── */

const PillLabel = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span
    className="inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-semibold border"
    style={{ borderColor: `${color}55`, color, backgroundColor: `${color}0f` }}
  >
    {children}
  </span>
);

const MixedTitle = ({
  strong,
  gray,
  strong2,
  gray2,
}: {
  strong: string;
  gray?: string;
  strong2?: string;
  gray2?: string;
}) => (
  <h2 className="break-keep text-[clamp(32px,4.6vw,54px)] font-bold text-white leading-[1.18] tracking-[-0.03em]">
    <span className="font-extrabold">{strong}</span>
    {gray && <span className="font-normal text-white/40"> {gray}</span>}
    {strong2 && <><br /><span className="font-extrabold">{strong2}</span></>}
    {gray2 && <span className="font-normal text-white/40"> {gray2}</span>}
  </h2>
);

/* ─────────────────────── Main ─────────────────────── */

const LpClient = ({ articles = [] }: { articles?: Article[] }) => {
  const [openFaq, setOpenFaq] = useState(1);
  const [caseIdx, setCaseIdx] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", project: "", agree: false });
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    const body = `이름: ${form.name}%0A이메일: ${form.email}%0A프로젝트: ${form.project}`;
    window.location.href = `mailto:contact@pixelpage.co.kr?subject=%5B프로젝트%20문의%5D%20${encodeURIComponent(form.name)}&body=${body}`;
    setSubmitted(true);
  };

  const cases = [
    {
      metric: "\"광고비를 아껴서 매출을 2배로 만들어 준 팀\"",
      body: "3개월간 광고 대행을 함께했습니다. 처음 만난 담당자가 마지막까지 우리 브랜드를 이해하고 굴렸습니다. CPA는 절반, 상담량은 두 배로 늘었습니다.",
      name: "박OO 대표",
      role: "성인 D교육",
      avatar: charMale,
      color: "linear-gradient(135deg, #f5c98e 0%, #e8a35f 100%)",
    },
    {
      metric: "\"진짜 리드가 뭔지 알게 됐어요\"",
      body: "몇 년간 여러 대행사를 거쳤지만 결국 리드가 새는 지점을 못 찾았습니다. 픽셀페이지는 랜딩페이지부터 세일즈 콜 스크립트까지 다 손봤습니다.",
      name: "김OO 원장",
      role: "강남 P학원",
      avatar: charFemale,
      color: "linear-gradient(135deg, #f5a3a3 0%, #d16a6a 100%)",
    },
    {
      metric: "\"CRM까지 하나로 붙여준 유일한 곳\"",
      body: "광고 대행사는 광고, 랜딩 제작사는 랜딩, CRM은 또 다른 곳. 픽셀페이지가 셋을 하나로 붙였습니다. 리드 응대 속도가 완전히 달라졌습니다.",
      name: "이OO 대표",
      role: "태양광 G",
      avatar: charCurly,
      color: "linear-gradient(135deg, #a3b1f5 0%, #6d7cd1 100%)",
    },
  ];

  const currentCase = cases[caseIdx];

  const faqs = [
    {
      q: "프로젝트는 보통 얼마나 걸리나요?",
      a: "초기 진단 1주, 구조 설계 2주, 실행 시작까지 총 3~4주 정도입니다. 이후는 월 단위 최적화입니다.",
    },
    {
      q: "우리 업종만 취급하나요?",
      a: "교육·코칭·상담 신청이 필요한 업종에 강점이 있지만, 인테리어·시공·의료·프랜차이즈 등 다양한 B2C 서비스와 함께합니다.",
    },
    {
      q: "기존 대행사에서 넘어와도 되나요?",
      a: "가능합니다. 진단에서 현재 대행사의 강점과 문제점을 함께 봐드립니다. 무리한 이탈은 권하지 않습니다.",
    },
    {
      q: "첫 단계는 무엇인가요?",
      a: "무료 상담부터 시작합니다. 30분 통화로 광고 계정·랜딩·CRM 상황을 함께 살펴봅니다.",
    },
    {
      q: "직접 연락할 수 있나요?",
      a: "네, 우측 하단 카카오톡 채널 또는 아래 폼으로 언제든 연락 가능합니다. 평균 3시간 이내 회신합니다.",
    },
  ];

  return (
    <div className="bg-[#08080d] text-white min-h-screen selection:bg-indigo-500/30">
      {/* ── Floating Pill Navbar ── */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1120px,calc(100%-24px))]">
        <div className="rounded-full bg-[#0e0e18]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_18px_50px_-20px_rgba(0,0,0,0.7)] px-4 py-2 flex items-center gap-2">
          <a href="/" className="flex items-center gap-2 pl-2 pr-3">
            <Image src={logoPixelpage} alt="PixelPage" width={26} height={26} className="h-6 w-6" />
            <span className="text-white font-bold text-[15px] tracking-[-0.02em]" style={{ fontFamily: "'Playfair Display', var(--font-playfair), serif" }}>
              PixelPage
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center text-[13px]">
            <a href="#" className="px-4 py-2 rounded-full bg-white/[0.06] text-white">Home</a>
            <a href="#service" className="px-4 py-2 rounded-full text-white/55 hover:text-white flex items-center gap-1">
              Service <Plus className="w-3 h-3" />
            </a>
            <a href="#work" className="px-4 py-2 rounded-full text-white/55 hover:text-white flex items-center gap-1.5">
              Work
              <span className="text-[9px] w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">{cases.length}</span>
            </a>
            <a href="#blog" className="px-4 py-2 rounded-full text-white/55 hover:text-white">Blog</a>
            <a href="#about" className="px-4 py-2 rounded-full text-white/55 hover:text-white">About us</a>
          </nav>
          <a
            href="#contact"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-medium transition-colors"
            style={{ borderColor: `${PURPLE}66`, color: "#fff" }}
          >
            <span className="w-6 h-6 rounded-full bg-indigo-500/25 flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-indigo-300" />
            </span>
            Start a project
          </a>
          <a
            href="#contact"
            className="md:hidden inline-flex items-center px-3 py-2 rounded-full bg-indigo-500 text-white text-[12px] font-semibold"
          >
            Start
          </a>
        </div>
      </header>

      {/* ── 1. Hero ── */}
      <section className="pt-[130px] pb-24 lg:pb-32 relative">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="rounded-3xl bg-[#0c0c14] border border-white/[0.06] p-8 md:p-16 lg:p-24 text-center">
            {/* Review avatars stack */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-[#0c0c14] overflow-hidden bg-orange-200">
                  <Image src={charMale} alt="" width={32} height={32} className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#0c0c14] bg-black flex items-center justify-center overflow-hidden">
                  <Image src={charFemale} alt="" width={32} height={32} className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#0c0c14] bg-white flex items-center justify-center text-[13px] font-bold text-blue-600">
                  G
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#0c0c14] overflow-hidden">
                  <Image src={charCurly} alt="" width={32} height={32} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="text-[15px] font-bold">4.9</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-[12px] text-white/45 mb-10">Rated on Google by various clients</p>

            {/* Big hybrid title */}
            <h1 className="break-keep text-[clamp(44px,7vw,90px)] leading-[1.05] tracking-[-0.04em] mb-14">
              <span className="font-extrabold text-white">폭발적인 매출을</span><br />
              <span className="font-normal text-white/40">향해서 </span>
              <span className="font-extrabold text-white">달립니다.</span>
            </h1>

            {/* Split CTA — text | button with avatar */}
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-indigo-500/90">
              <span className="px-5 py-3 text-white text-[13px] font-semibold whitespace-nowrap">
                무료 상담부터 시작해 보세요
              </span>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-black text-white text-[12px] font-bold uppercase tracking-[0.1em]"
              >
                무료 상담
                <span className="w-7 h-7 rounded-full bg-white overflow-hidden flex items-center justify-center">
                  <Image src={charMale} alt="" width={28} height={28} className="w-full h-full object-cover" />
                </span>
                <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                  <Phone className="w-3 h-3 text-white" />
                </span>
              </a>
            </div>
          </div>

          {/* Industry tags scroll */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {["교육", "코칭", "학원", "병원", "성형과", "인테리어", "태양광", "부동산", "법률", "프랜차이즈", "지식 SaaS", "무형 서비스"].map((t) => (
              <span
                key={t}
                className="px-4 py-1.5 rounded-full text-[12px] border border-white/[0.08] text-white/55 bg-white/[0.02]"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Sub tagline + trusted partners */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 items-end">
            <p className="text-[14px] text-white/55 leading-[1.85]">
              픽셀페이지는 브랜드가 자기다움을 잃지 않고<br />
              매출까지 이어지도록 돕는 마케팅 파트너입니다.
            </p>
            <div className="relative">
              <div className="text-right text-[clamp(24px,3vw,40px)] font-bold text-white/[0.08] tracking-[-0.02em] leading-none">
                Trusted partners
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 md:grid-cols-7 gap-3">
            {["EDULINE", "NORISCHOOL", "CLINIQUE", "SUNROOM", "STUDIONINE", "MEGATEACH", "KLASSE"].map((b) => (
              <div key={b} className="h-14 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/45 text-[12px] font-bold tracking-[-0.01em]">
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Why choose Us ── */}
      <section id="about" className="py-24 lg:py-32">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <PillLabel color="#4ade80">Why choose Us</PillLabel>
            <div className="mt-6">
              <MixedTitle strong="Driven by" gray="Results," strong2="Trusted by" gray2="Brands" />
            </div>
            <div className="mt-8">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-indigo-500 text-white text-[13px] font-semibold"
              >
                무료 진단 신청 <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { t: "Result Driven Approach", d: "결과로 증명합니다. 노출·클릭이 아니라 CPA·매출로 리포트합니다." },
              { t: "Business Goal First", d: "브랜드 매출 목표부터 시작합니다. 캠페인은 그 이후에 짜집니다." },
            ].map((c) => (
              <div key={c.t} className="relative rounded-3xl bg-[#0c0c14] border border-white/[0.06] p-9 min-h-[240px] overflow-hidden">
                <h3 className="text-[22px] font-bold mb-3 tracking-[-0.02em]">{c.t}</h3>
                <p className="text-[14px] text-white/55 leading-[1.85] max-w-[380px]">{c.d}</p>
                {/* 3D shape placeholder — 릴스 프레임을 미니 오브젝트로 */}
                <div className="absolute bottom-4 right-4 w-[110px] h-[110px] rounded-2xl overflow-hidden opacity-70">
                  <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                    <source src="/reels/2.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            ))}
            {[
              { t: "Personalised plans", d: "브랜드마다 다른 예산·시장·채널. 표준 패키지 대신 맞춤 설계." },
              { t: "Full-stack 실행 팀", d: "기획·디자인·개발이 걸림 없이 하나의 팀으로 움직입니다." },
              { t: "24/7 리드 알림", d: "리드가 들어오는 순간 카카오톡·시트·팀 모두 즉시 알림." },
            ].map((c, i) => (
              <div key={c.t} className={`relative rounded-3xl bg-[#0c0c14] border border-white/[0.06] p-9 overflow-hidden ${i === 1 ? "md:col-span-1" : ""}`}>
                <h3 className="text-[19px] font-bold mb-3 tracking-[-0.02em]">{c.t}</h3>
                <p className="text-[13.5px] text-white/55 leading-[1.85]">{c.d}</p>
                <div className="absolute bottom-3 right-3 w-[80px] h-[80px] rounded-xl overflow-hidden opacity-60">
                  <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                    <source src={`/reels/${i + 3}.mp4`} type="video/mp4" />
                  </video>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Comparison ── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <PillLabel color="#f87171">Comparison</PillLabel>
            <div className="mt-6">
              <MixedTitle strong="픽셀페이지에는" gray="다른" strong2="대안이 없습니다." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr] gap-0 rounded-3xl overflow-hidden">
            {/* Column 1 — Us (highlighted) */}
            <div className="bg-[#111120] border border-indigo-500/25 rounded-3xl md:rounded-r-none p-8 lg:p-10">
              <Image src={logoPixelpage} alt="PixelPage" width={36} height={36} className="mb-4 h-9 w-9" />
              <h3 className="text-[18px] font-bold mb-3" style={{ fontFamily: "'Playfair Display', var(--font-playfair), serif" }}>PixelPage</h3>
              <p className="text-[13px] text-white/55 leading-[1.75] mb-8">
                브랜드 전담팀이 광고·랜딩·CRM을 한 번에 굴립니다.<br />인하우스 팀을 뽑지 않아도 됩니다.
              </p>
              <ul className="space-y-4 pt-8 border-t border-white/[0.08]">
                {["Speed", "Flexibility", "Quality", "Scalability", "Affordability"].map((k) => (
                  <li key={k} className="flex items-center gap-3 text-[14px] text-white/85">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/15 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-indigo-400" strokeWidth={3} />
                    </span>
                    {k}
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 — Agency */}
            <div className="p-8 lg:p-10 text-center border-t border-b md:border-t md:border-b border-white/[0.06] mt-3 md:mt-0 rounded-3xl md:rounded-none bg-[#0a0a13]">
              <div className="w-10 h-10 mx-auto rounded-lg bg-white/5 flex items-center justify-center mb-4">
                <Umbrella className="w-5 h-5 text-white/60" />
              </div>
              <h3 className="text-[16px] font-bold mb-2 text-white/85">일반 대행사</h3>
              <p className="text-[12.5px] text-white/50 leading-[1.7] mb-10 min-h-[60px]">
                구조화된 프로세스는 있지만 대부분 높은 비용과 긴 리드타임.<br />유연성이 부족합니다.
              </p>
              <ul className="space-y-4 pt-4">
                {[false, true, false, true, false].map((v, i) => (
                  <li key={i} className="flex items-center justify-center">
                    {v ? <Check className="w-4 h-4 text-indigo-400" strokeWidth={3} /> : <X className="w-4 h-4 text-red-400" strokeWidth={3} />}
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Freelancer */}
            <div className="p-8 lg:p-10 text-center border-t border-b md:border-l border-white/[0.06] mt-3 md:mt-0 rounded-3xl md:rounded-l-none md:rounded-r-3xl bg-[#0a0a13]">
              <div className="w-10 h-10 mx-auto rounded-lg bg-white/5 flex items-center justify-center mb-4">
                <User className="w-5 h-5 text-white/60" />
              </div>
              <h3 className="text-[16px] font-bold mb-2 text-white/85">프리랜서</h3>
              <p className="text-[12.5px] text-white/50 leading-[1.7] mb-10 min-h-[60px]">
                저렴할 수 있지만 일관성·신뢰성·협업 역량이 부족합니다.
              </p>
              <ul className="space-y-4 pt-4">
                {[false, false, true, false, true].map((v, i) => (
                  <li key={i} className="flex items-center justify-center">
                    {v ? <Check className="w-4 h-4 text-indigo-400" strokeWidth={3} /> : <X className="w-4 h-4 text-red-400" strokeWidth={3} />}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Client Story (Carousel) ── */}
      <section id="work" className="py-24 lg:py-32">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <PillLabel color="#a78bfa">Client Story</PillLabel>
            <h2 className="mt-6 text-[clamp(32px,4.6vw,54px)] font-bold leading-[1.18] tracking-[-0.03em]">
              <span className="font-extrabold">함께 만든</span>
              <span className="font-normal text-white/40"> 성장의</span><br />
              <span className="font-extrabold">이야기.</span>
            </h2>
          </div>

          <div className="rounded-3xl border border-white/[0.06] p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6 md:gap-10 items-center">
              {/* Left — photo/video-ish card */}
              <div
                className="relative rounded-2xl overflow-hidden aspect-[4/5] flex items-end justify-center"
                style={{ background: currentCase.color }}
              >
                <div className="w-3/4 h-3/4 flex items-end justify-center">
                  <Image src={currentCase.avatar} alt={currentCase.name} width={300} height={300} className="w-full h-auto object-contain" />
                </div>
                <button className="absolute inset-0 flex items-center justify-center">
                  <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                  </span>
                </button>
              </div>
              {/* Right — quote */}
              <div className="p-2">
                <p className="text-[12px] text-white/45 mb-4">2026. 09. 09</p>
                <p className="text-[clamp(20px,2.4vw,28px)] font-bold leading-[1.4] tracking-[-0.02em] mb-6">
                  {currentCase.metric}
                </p>
                <p className="text-[14px] text-white/60 leading-[1.85] mb-10">
                  {currentCase.body}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-indigo-500/20 border border-indigo-400/25 flex items-center justify-center">
                    <div className="w-5 h-5 rotate-45 bg-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold">{currentCase.name}</p>
                    <p className="text-[12px] text-white/50">{currentCase.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel controls */}
          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              onClick={() => setCaseIdx((caseIdx - 1 + cases.length) % cases.length)}
              className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              {cases.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCaseIdx(i)}
                  className={`h-1 rounded-full transition-all ${i === caseIdx ? "w-8 bg-indigo-400" : "w-2 bg-white/20"}`}
                />
              ))}
            </div>
            <button
              onClick={() => setCaseIdx((caseIdx + 1) % cases.length)}
              className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. Services ── */}
      <section id="service" className="py-24 lg:py-32">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="mb-14">
            <PillLabel color="#facc15">Services</PillLabel>
            <h2 className="mt-6 text-[clamp(32px,4.6vw,54px)] font-bold leading-[1.18] tracking-[-0.03em] max-w-[720px]">
              <span className="font-extrabold">브랜드를 </span>
              <span className="font-normal text-white/40">확장하기 위한</span><br />
              <span className="font-extrabold">Solution</span>
              <span className="font-normal text-white/40">을 설계합니다.</span>
            </h2>
          </div>

          {[
            {
              t: "무한 A/B 테스트로 광고 소재를 굴립니다",
              d: "감이 아닌 데이터로 소재를 판단합니다. 매주 이긴 소재에 예산을 집중합니다.",
              bullets: ["메타·구글·틱톡 전 채널 운영", "매주 A/B 테스트 결과 리뷰", "자체 기획·촬영·편집"],
              reel: "2.mp4",
            },
            {
              t: "전환율 중심의 랜딩페이지 설계",
              d: "광고 카피와 랜딩 상단이 하나의 흐름으로 붙습니다. 방문자가 3초 안에 이탈하지 않도록.",
              bullets: ["광고↔랜딩 메시지 연계", "전환 UI/UX 최적화", "DB 수집 시스템 점검"],
              reel: "5.mp4",
            },
          ].map((s, i) => (
            <div key={s.t} className={`rounded-3xl bg-[#0c0c14] border border-white/[0.06] p-6 md:p-10 grid grid-cols-1 md:grid-cols-[1fr_1.15fr] gap-8 items-center mb-4 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <div>
                <h3 className="text-[22px] md:text-[26px] font-bold mb-2 tracking-[-0.025em] leading-[1.35]">{s.t}</h3>
                <div className="w-16 h-px bg-white/15 my-5" />
                <p className="text-[14px] text-white/55 leading-[1.85] mb-6">{s.d}</p>
                <ul className="space-y-3 mb-8">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-3 text-[13.5px] text-white/70">
                      <Check className="w-4 h-4 text-indigo-400" strokeWidth={2.5} />
                      {b}
                    </li>
                  ))}
                </ul>
                <a href="#contact" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-white/15 text-[12.5px] font-semibold hover:bg-white/[0.04]">
                  Learn More
                </a>
              </div>
              <div className="rounded-2xl overflow-hidden aspect-video bg-black">
                <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                  <source src={`/reels/${s.reel}`} type="video/mp4" />
                </video>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. News & blogs ── */}
      {articles.length > 0 && (
        <section id="blog" className="py-24 lg:py-32">
          <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
            <div className="mb-14">
              <PillLabel color="#fb923c">News & blogs</PillLabel>
              <h2 className="mt-6 text-[clamp(32px,4.6vw,54px)] font-bold leading-[1.18] tracking-[-0.03em]">
                <span className="font-extrabold">Newest</span>
                <span className="font-normal text-white/40"> Trend and</span><br />
                <span className="font-normal text-white/40">Insights</span>
                <span className="font-extrabold"> from our Team</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {articles.slice(0, 2).map((a, i) => (
                <a
                  key={a.id}
                  href={`/columns/${a.slug}`}
                  className="rounded-3xl bg-[#0c0c14] border border-white/[0.06] p-6 min-h-[380px] flex flex-col hover:border-white/15 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl overflow-hidden mb-6">
                    <Image src={i === 0 ? charFemale : charMale} alt="" width={44} height={44} className="w-full h-full object-cover" />
                  </div>
                  <div className="mt-auto">
                    <p className="text-[12px] text-white/45 mb-3">{a.date ? new Date(a.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : ""}</p>
                    <h3 className="text-[17px] font-bold leading-[1.4] mb-3 line-clamp-2">{a.title}</h3>
                    <p className="text-[13px] text-white/55 leading-[1.75] line-clamp-3">{a.description || "픽셀페이지가 실제 광고비를 굴리며 검증한 인사이트입니다."}</p>
                  </div>
                </a>
              ))}
              {/* Featured card */}
              <a href={`/columns/${articles[0].slug}`} className="rounded-3xl overflow-hidden relative aspect-square md:aspect-auto min-h-[380px] group">
                <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                  <source src="/reels/7.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/85" />
                <div className="relative h-full p-6 flex flex-col justify-between text-white">
                  <div className="flex items-center gap-1.5">
                    <Image src={logoPixelpage} alt="" width={16} height={16} className="w-4 h-4" />
                    <span className="text-[12px] font-bold" style={{ fontFamily: "'Playfair Display', var(--font-playfair), serif" }}>PixelPage</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <h3 className="text-[22px] font-bold leading-[1.3]">최근<br />인사이트?</h3>
                    <span className="w-11 h-11 rounded-full bg-indigo-500 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </a>
            </div>

            {/* Bottom accent bar */}
            <div className="mt-8 rounded-3xl bg-[#0f0f1a] border border-white/[0.05] px-8 py-10 flex items-center justify-between gap-6">
              <p className="text-[clamp(22px,3vw,36px)] font-bold leading-[1.25] tracking-[-0.02em]">
                <span className="font-extrabold">We turn</span>
                <span className="font-normal text-indigo-400"> Ideas into </span>
                <span className="font-extrabold">successful</span>
                <span className="font-normal text-white/50"> products. </span>
                <span className="font-extrabold">Get</span>
                <span className="font-normal text-indigo-400"> to Know </span>
                <span className="font-extrabold">more.</span>
              </p>
              <Image src={logoPixelpage} alt="" width={64} height={64} className="w-16 h-16 opacity-70 hidden md:block flex-shrink-0" />
            </div>
          </div>
        </section>
      )}

      {/* ── 7. FAQ ── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[820px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <PillLabel color={PURPLE}>FAQ&apos;s</PillLabel>
            <h2 className="mt-6 text-[clamp(32px,4.6vw,54px)] font-bold leading-[1.18] tracking-[-0.03em]">
              <span className="font-extrabold">Answers</span>
              <span className="font-normal text-white/40"> to the questions</span><br />
              <span className="font-extrabold">We</span>
              <span className="font-normal text-white/40"> hear most </span>
              <span className="font-extrabold">often</span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border overflow-hidden transition-colors ${isOpen ? "bg-indigo-500/15 border-indigo-500/40" : "bg-[#0c0c14] border-white/[0.06]"}`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                  >
                    <span className={`text-[15px] font-semibold ${isOpen ? "text-white" : "text-white/80"}`}>
                      {i + 1}. {f.q}
                    </span>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isOpen ? "bg-indigo-500" : "bg-white/[0.04]"}`}>
                      {isOpen ? <X className="w-3 h-3 text-white" /> : <Plus className="w-3 h-3 text-white/60" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-0">
                      <p className="text-[13.5px] text-white/70 leading-[1.85]">{f.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 8. Contact ── */}
      <section id="contact" className="py-24 lg:py-32">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="rounded-3xl border border-white/[0.06] bg-[#0c0c14] p-6 md:p-10 lg:p-16 relative overflow-hidden">
            {/* Subtle wave lines pattern */}
            <div className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage: "repeating-linear-gradient(115deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 42px)",
              }}
            />

            <div className="relative grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-10">
              {/* Left — form */}
              <div className="rounded-3xl bg-[#0a0a13] border border-white/[0.06] p-7 md:p-8">
                <p className="text-[13px] font-semibold mb-6">We are just One-click away!</p>
                {submitted ? (
                  <div className="py-12 text-center">
                    <p className="text-[16px] font-semibold mb-3">신청이 접수되었습니다.</p>
                    <p className="text-[13px] text-white/55 mb-6">평균 3시간 이내 회신드립니다.</p>
                    <a href={KAKAO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FEE500] text-[#181600] text-[13px] font-bold">
                      <MessageSquare className="w-4 h-4" /> 카카오톡으로 바로 문의
                    </a>
                  </div>
                ) : (
                  <form onSubmit={submit} className="space-y-5">
                    <div>
                      <label className="text-[12px] text-white/55 mb-1.5 block">성함 *</label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="박희규"
                        className="w-full px-4 py-3 rounded-xl bg-transparent border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] text-white/55 mb-1.5 block">이메일 *</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="ceo@yourbrand.com"
                        className="w-full px-4 py-3 rounded-xl bg-transparent border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] text-white/55 mb-1.5 block">프로젝트 이야기</label>
                      <textarea
                        rows={4}
                        value={form.project}
                        onChange={(e) => setForm({ ...form, project: e.target.value })}
                        placeholder="랜딩페이지 리뉴얼하고 싶어요"
                        className="w-full px-4 py-3 rounded-xl bg-transparent border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-indigo-400 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full mt-2 px-6 py-4 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white text-[15px] font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      Let&apos;s Connect <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <p className="text-[11px] text-white/40 text-center pt-1">
                      By submitting, you agree to our <span className="text-white/60">Terms</span> and <span className="text-white/60">Privacy Policy</span>
                    </p>
                  </form>
                )}
              </div>

              {/* Right — copy + character */}
              <div className="flex flex-col justify-between">
                <div>
                  <PillLabel color={PURPLE}>Let&apos;s connect</PillLabel>
                  <h2 className="mt-5 text-[clamp(30px,4.4vw,52px)] font-bold leading-[1.15] tracking-[-0.03em] mb-6">
                    Have a Project<br />in Mind ?
                  </h2>
                  <p className="text-[14px] text-white/55 leading-[1.85] mb-8">
                    프로젝트 이야기를 편하게 남겨 주세요.<br />
                    광고·랜딩·CRM 뭐든지 좋습니다.
                  </p>
                  <ul className="space-y-3.5 mb-10">
                    {[
                      "평균 회신 3시간 이내",
                      "브랜드 전담 담당자 배정",
                      "NDA 즉시 서명 가능",
                    ].map((v) => (
                      <li key={v} className="flex items-center gap-3 text-[14px] text-white/75">
                        <Check className="w-4 h-4 text-indigo-400" strokeWidth={2.5} />
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Character mascot card */}
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500/40 to-indigo-800/20 border border-indigo-400/20 overflow-hidden flex items-end justify-center">
                    <Image src={charMale} alt="" width={96} height={96} className="w-full h-auto object-contain" />
                  </div>
                  <div>
                    <p className="text-[16px] font-bold">박희규</p>
                    <p className="text-[12px] text-white/50 mb-3">Founder, PixelPage</p>
                    <a href={KAKAO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[12.5px] text-indigo-300 hover:text-indigo-200">
                      <MessageSquare className="w-3.5 h-3.5" /> 카카오톡으로 바로 문의
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-[11.5px] text-white/30 border-t border-white/[0.05]">
        © PIXELPAGE · pixelpage.co.kr · contact@pixelpage.co.kr
      </footer>
    </div>
  );
};

export default LpClient;

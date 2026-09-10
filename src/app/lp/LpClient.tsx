"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Phone,
  Star,
  Search,
  Users,
  TrendingDown,
  Zap,
  ShieldCheck,
  Infinity as InfinityIcon,
  Target,
  Eye,
  MessageSquare,
} from "lucide-react";
import charMale from "@/assets/char-male.png";
import charFemale from "@/assets/char-female.png";
import charCurly from "@/assets/char-curly.png";
import logoWhite from "@/assets/logo-white.png";
import WhatWeDoSection from "@/components/agency/WhatWeDoSection";
import ProcessSection from "@/components/agency/ProcessSection";
import AgencyFAQSection from "@/components/agency/AgencyFAQSection";
import MethodSection from "@/components/MethodSection";
import type { Article } from "@/lib/notion";

const KAKAO_URL = "http://pf.kakao.com/_cxccdX/chat";

/* ─────────────────────── Reusable ─────────────────────── */

const PillLabel = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span
    className="inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-semibold border"
    style={{ borderColor: `${color}55`, color, backgroundColor: `${color}0f` }}
  >
    {children}
  </span>
);

/* ─────────────────────── Main ─────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LpClient = ({ articles = [] }: { articles?: Article[] }) => {
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
    <div className="bg-[#08080d] text-white min-h-screen selection:bg-sky-500/30">
      {/* ── Floating Pill Navbar ── */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1120px,calc(100%-24px))]">
        <div className="rounded-full bg-[#0e0e18]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_18px_50px_-20px_rgba(0,0,0,0.7)] px-5 py-2.5 flex items-center gap-2">
          <a href="/" className="flex items-center gap-2 pl-1 pr-3">
            <Image src={logoWhite} alt="PixelPage" width={100} height={20} className="h-5 w-auto" />
          </a>
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center text-[13px]">
            <a href="#problem" className="px-3.5 py-2 rounded-full text-white/60 hover:text-white">문제</a>
            <a href="#solution" className="px-3.5 py-2 rounded-full text-white/60 hover:text-white">해결</a>
            <a href="#portfolio" className="px-3.5 py-2 rounded-full text-white/60 hover:text-white">성과</a>
            <a href="#process" className="px-3.5 py-2 rounded-full text-white/60 hover:text-white">진행 방식</a>
            <a href="#faq" className="px-3.5 py-2 rounded-full text-white/60 hover:text-white">FAQ</a>
          </nav>
          <a
            href="#cta"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-400/40 text-white text-[13px] font-medium"
          >
            <span className="w-6 h-6 rounded-full bg-sky-500/25 flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-sky-300" />
            </span>
            무료 상담 신청
          </a>
        </div>
      </header>

      {/* ── 1. 히어로 (검정 배경 + 라운드 카드 안에 원래 WeTechPro 스타일) ── */}
      <section className="pt-[110px] pb-16 lg:pt-[130px] lg:pb-24 bg-black">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="rounded-3xl bg-[#0c0c14] border border-white/[0.06] p-8 md:p-16 lg:p-24 text-center">
            {/* Google 리뷰 아바타 스택 */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-[#0c0c14] overflow-hidden bg-orange-200">
                  <Image src={charMale} alt="" width={32} height={32} className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#0c0c14] bg-pink-100 flex items-center justify-center overflow-hidden">
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
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <span className="text-[14px] font-bold">4.9</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-[13px] text-white/45 mb-10">Rated on Google by various clients</p>

            {/* 큰 하이브리드 타이틀 */}
            <h1 className="break-keep text-[clamp(44px,7.5vw,96px)] leading-[1.05] tracking-[-0.045em]">
              <span className="block font-extrabold text-white">폭발적인 매출을</span>
              <span className="block">
                <span className="font-normal text-white/40">향해서 </span>
                <span className="font-extrabold text-white">달립니다.</span>
              </span>
            </h1>

            {/* 스플릿 CTA */}
            <div className="mt-14 inline-flex items-center gap-1 p-1 rounded-full bg-sky-500">
              <span className="px-6 py-3 text-white text-[15px] font-semibold whitespace-nowrap">
                파트너형 DB 마케팅 도입 문의
              </span>
              <a
                href="#cta"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-black text-white text-[13px] font-bold uppercase tracking-[0.1em]"
              >
                무료 상담
                <span className="w-7 h-7 rounded-full bg-white overflow-hidden flex items-center justify-center">
                  <Image src={charMale} alt="" width={28} height={28} className="w-full h-full object-cover" />
                </span>
                <span className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center">
                  <Phone className="w-3 h-3 text-white" />
                </span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. 함께하는 파트너사 ── */}
      <section className="py-14 border-y border-white/[0.06] overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <p className="text-center text-[13px] tracking-[0.28em] font-semibold text-white/40 mb-8 uppercase">
            함께하는 파트너사
          </p>
        </div>
        {(() => {
          const partners = [
            { src: "/lp-partners/1.png", alt: "DIHABOOKS" },
            { src: "/lp-partners/2.png", alt: "안부스쿨" },
            { src: "/lp-partners/3.png", alt: "플러스스피치" },
            { src: "/lp-partners/4.png", alt: "GIM COMPANY" },
            { src: "/lp-partners/5.png", alt: "B:forest" },
            { src: "/lp-partners/6.png", alt: "빌리언 캠퍼스" },
            { src: "/lp-partners/7.png", alt: "BOOTSTRAPPER" },
            { src: "/lp-partners/8.png", alt: "디지털 노마드" },
            { src: "/lp-partners/9.png", alt: "RUNMOA" },
            { src: "/lp-partners/10.png", alt: "funnelmoa" },
            { src: "/lp-partners/11.png", alt: "Cosmosfarm" },
          ];
          return (
            <div
              className="relative"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
              }}
            >
              <div className="flex w-max animate-marquee gap-14">
                {[...partners, ...partners].map((p, i) => (
                  <div
                    key={`${p.alt}-${i}`}
                    className="h-20 flex items-center justify-center shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.src}
                      alt={p.alt}
                      className="h-16 md:h-[72px] w-auto object-contain opacity-90"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      {/* ── 3. 문제 제기 ── */}
      <section id="problem" className="py-24 lg:py-32">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <PillLabel color="#f87171">Problem</PillLabel>
            <h2 className="mt-6 break-keep text-[clamp(30px,4.5vw,52px)] font-bold leading-[1.2] tracking-[-0.03em]">
              <span className="font-normal text-white/40">기존의 DB 마케팅 방식으로는</span><br />
              <span className="font-extrabold">매출 규모를 키우기 어렵습니다.</span>
            </h2>
          </div>
          <div className="flex flex-col gap-4 max-w-[980px] mx-auto">
            {[
              {
                num: "01",
                icon: Search,
                tag: "출처를 모릅니다",
                body: "어떤 광고를 보고 온 고객인지 모르니, 상담 품질이 복불복입니다.",
              },
              {
                num: "02",
                icon: Users,
                tag: "나만의 DB가 아닙니다",
                body: "같은 DB가 여러 업체에 팔립니다. 전화하면 이미 경쟁사와 통화 중입니다.",
              },
              {
                num: "03",
                icon: TrendingDown,
                tag: "늘리는 순간 무너집니다",
                body: "물량을 키우면 허수가 섞이고 단가는 뜁니다. 매출을 키우고 싶어도, 구조가 못 받쳐줍니다.",
              },
              {
                num: "04",
                icon: Zap,
                tag: "개선이 없습니다",
                body: "성과가 안 나와도 소재도 타겟도 그대로. 파는 쪽은 바꿀 이유가 없으니까요.",
              },
            ].map((p) => (
              <div
                key={p.tag}
                className="rounded-3xl border border-white/[0.06] bg-[#0c0c14] p-6 md:p-8 hover:border-red-400/25 transition-colors"
              >
                <div className="flex items-center gap-5 md:gap-7">
                  <span className="text-[15px] font-mono font-bold text-red-300/50 tabular-nums w-8 flex-shrink-0">
                    {p.num}
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-400/20 flex items-center justify-center flex-shrink-0">
                    <p.icon className="w-5 h-5 text-red-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[18px] md:text-[20px] font-bold text-white mb-1.5 tracking-[-0.02em]">
                      {p.tag}
                    </h3>
                    <p className="text-[14px] md:text-[15px] text-white/55 leading-[1.7]">{p.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. 해결 ── */}
      <section
        id="solution"
        className="py-24 lg:py-32 relative overflow-hidden"
        style={{
          backgroundColor: "#040814",
          backgroundImage: "url(/lp-solution-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <PillLabel color="#38bdf8">Solution</PillLabel>
            <h2 className="mt-6 break-keep text-[clamp(30px,4.5vw,52px)] font-bold leading-[1.2] tracking-[-0.03em]">
              <span className="font-normal text-white/40">그래서 픽셀페이지는</span><br />
              <span className="font-extrabold text-white">파트너형 DB 마케팅</span>
              <span className="font-normal text-white/40">을 고집합니다.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1080px] mx-auto">
            {[
              { icon: ShieldCheck, tag: "01", title: "전용", body: "소재도 랜딩도 귀사 것만. 공유 DB 0건." },
              { icon: InfinityIcon, tag: "02", title: "무한 테스트", body: "터지는 조합을 찾을 때까지 다시 만듭니다." },
              { icon: Target, tag: "03", title: "전환까지", body: "DB에서 끝내지 않고 매출까지 함께 봅니다." },
              { icon: Eye, tag: "04", title: "투명 공개", body: "성과 데이터를 전부 오픈합니다." },
            ].map((s) => (
              <div
                key={s.tag}
                className="rounded-3xl bg-[#0c0c14]/80 border border-sky-400/15 p-8 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500/25 to-sky-500/10 border border-sky-400/25 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-sky-300" />
                  </div>
                  <span className="text-[13px] text-sky-300/60 font-mono font-bold">{s.tag}</span>
                </div>
                <h3 className="text-[20px] font-bold mb-3 tracking-[-0.02em]">{s.title}</h3>
                <p className="text-[13.5px] text-white/60 leading-[1.85]">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center max-w-[640px] mx-auto">
            <p className="text-[19px] md:text-[22px] text-white leading-[1.55] font-semibold tracking-[-0.02em]">
              들쑥날쑥한 <span className="text-sky-300">DB 품질 문제</span>,<br />
              <span className="text-white/70 font-medium">파트너형 DB로 해결해 보세요.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Services (좌측 정렬) ── */}
      <section id="service" className="py-24 lg:py-32 border-t border-white/[0.04]">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="mb-14">
            <PillLabel color="#facc15">Services</PillLabel>
            <h2 className="mt-6 break-keep text-[clamp(30px,4.5vw,52px)] font-bold leading-[1.2] tracking-[-0.03em] max-w-[820px]">
              <span className="font-normal text-white/40">광고소재부터 랜딩페이지, CRM</span><br />
              <span className="font-normal text-white/40">터질 때까지 </span>
              <span className="font-extrabold text-white">무한 테스트</span>
              <span className="font-normal text-white/40">합니다.</span>
            </h2>
          </div>

          {[
            {
              t: "무한 A/B 테스트로 광고 소재를 굴립니다",
              d: "감이 아닌 데이터로 소재를 판단합니다. 매주 이긴 소재에 예산을 집중합니다.",
              bullets: ["메타·구글·틱톡 전 채널 운영", "매주 A/B 테스트 결과 리뷰", "자체 기획·촬영·편집"],
              visual: "marquee" as const,
            },
            {
              t: "전환율 중심의 랜딩페이지 설계",
              d: "광고 카피와 랜딩 상단이 하나의 흐름으로 붙습니다. 방문자가 3초 안에 이탈하지 않도록.",
              bullets: ["광고 ↔ 랜딩 메시지 연계", "전환 UI/UX 최적화", "DB 수집 시스템 점검"],
              visual: "single" as const,
              reel: "5.mp4",
            },
          ].map((s, i) => (
            <div
              key={s.t}
              className={`rounded-3xl bg-[#0c0c14] border border-white/[0.06] p-6 md:p-10 grid grid-cols-1 md:grid-cols-[1fr_1.15fr] gap-8 items-center mb-4 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
            >
              <div>
                <h3 className="text-[22px] md:text-[26px] font-bold mb-2 tracking-[-0.025em] leading-[1.35]">
                  {s.t}
                </h3>
                <div className="w-16 h-px bg-white/15 my-5" />
                <p className="text-[14px] text-white/55 leading-[1.85] mb-6">{s.d}</p>
                <ul className="space-y-3 mb-8">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-3 text-[13.5px] text-white/70">
                      <Check className="w-4 h-4 text-sky-400" strokeWidth={2.5} />
                      {b}
                    </li>
                  ))}
                </ul>
                <a
                  href="#cta"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-white/15 text-[12.5px] font-semibold hover:bg-white/[0.04]"
                >
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
              {s.visual === "marquee" ? (
                <div
                  className="relative rounded-2xl overflow-hidden bg-black h-[420px] md:h-[440px] flex gap-3"
                  style={{
                    WebkitMaskImage:
                      "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
                    maskImage:
                      "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
                  }}
                >
                  {[
                    { items: ["/reels/1.mp4", "/reels/4.mp4", "/reels/7.mp4", "/reels/2.mp4"], dir: "animate-marquee-up" },
                    { items: ["/reels/3.mp4", "/reels/6.mp4", "/reels/9.mp4", "/reels/5.mp4"], dir: "animate-marquee-down" },
                    { items: ["/reels/8.mp4", "/reels/10.mp4", "/reels/2.mp4", "/reels/6.mp4"], dir: "animate-marquee-up" },
                  ].map((col, ci) => (
                    <div key={ci} className="flex-1 overflow-hidden">
                      <div className={col.dir}>
                        {[...col.items, ...col.items].map((src, j) => (
                          <div key={`${src}-${j}`} className="mb-3 relative rounded-xl overflow-hidden">
                            <video
                              src={src}
                              autoPlay
                              muted
                              loop
                              playsInline
                              className="w-full aspect-[2/3] object-cover bg-black"
                            />
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/40" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black h-[420px] md:h-[440px]">
                  {["/lp-landings/landing1.png", "/lp-landings/landing2.png", "/lp-landings/landing3.png"].map((src, li) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className="absolute inset-x-0 top-0 w-full select-none pointer-events-none"
                      style={{
                        animation: `landing-cycle 30s linear ${li * 10}s infinite`,
                        willChange: "transform, opacity",
                      }}
                    />
                  ))}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(12,12,20,0.5) 0%, transparent 6%, transparent 94%, rgba(12,12,20,0.5) 100%)",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. 하나의 팀이 처음부터 끝까지 (MethodSection 재사용) ── */}
      <div className="border-t border-white/[0.04]">
        <MethodSection variant="dark" />
      </div>

      {/* ── 7. 포트폴리오 ── */}
      <section id="portfolio" className="py-24 lg:py-32">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="mb-14">
            <PillLabel color="#fb923c">Portfolio</PillLabel>
            <h2 className="mt-6 break-keep text-[clamp(30px,4.5vw,52px)] font-bold leading-[1.2] tracking-[-0.03em]">
              <span className="font-extrabold">파트너사는 이만큼</span><br />
              <span className="font-normal text-white/40">성장했습니다.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                co: "성인 교육 플랫폼 D사",
                industry: "연매출 300억+",
                stats: [
                  { k: "DB 단가", v: "-42%" },
                  { k: "DB 수", v: "×3.1배" },
                  { k: "매출 성장", v: "×3배" },
                ],
              },
              {
                co: "태양광 시공·분양 G사",
                industry: "연매출 250억+",
                stats: [
                  { k: "DB 단가", v: "-55%" },
                  { k: "DB 수", v: "×20배" },
                  { k: "매출 성장", v: "×3배" },
                ],
              },
              {
                co: "코칭·컨설팅 P사",
                industry: "연매출 24억",
                stats: [
                  { k: "DB 단가", v: "-35%" },
                  { k: "DB 수", v: "×3.8배" },
                  { k: "매출 성장", v: "×4배" },
                ],
              },
              {
                co: "가맹 프랜차이즈 L사",
                industry: "연매출 30억+",
                stats: [
                  { k: "DB 단가", v: "-58%" },
                  { k: "DB 수", v: "×2.4배" },
                  { k: "매출 성장", v: "×2배" },
                ],
              },
            ].map((c) => (
              <div
                key={c.co}
                className="rounded-3xl bg-[#0c0c14] border border-white/[0.06] p-7 hover:border-sky-400/25 transition-colors"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[15px] font-bold">{c.co}</p>
                    <p className="text-[13px] text-white/45 mt-0.5">{c.industry}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-sky-300/60" />
                </div>
                <div className="space-y-3.5">
                  {c.stats.map((s) => (
                    <div key={s.k} className="flex items-baseline justify-between">
                      <span className="text-[12.5px] text-white/50">{s.k}</span>
                      <span className="text-[19px] font-extrabold text-sky-300 tabular-nums tracking-[-0.02em]">
                        {s.v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a
              href="#cta"
              className="inline-flex items-center gap-1.5 text-[13px] text-sky-300 hover:text-sky-200 font-semibold border border-white/10 hover:border-white/25 px-5 py-2.5 rounded-full transition-colors"
            >
              더 보기 <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── 8. WhatWeDo (marketing agency 재사용, 다크) ── */}
      <div className="border-t border-white/[0.04]">
        <WhatWeDoSection variant="dark" />
      </div>

      {/* ── 8. Process (marketing agency 재사용, 다크) ── */}
      <div id="process" className="border-t border-white/[0.04]">
        <ProcessSection variant="dark" />
      </div>

      {/* ── 10. News & blogs (좌측 정렬, Notion 최근 칼럼) ── */}
      {articles.length > 0 && (
        <section id="blog" className="py-24 lg:py-32 border-t border-white/[0.04]">
          <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
            <div className="mb-14">
              <PillLabel color="#fb923c">News & blogs</PillLabel>
              <h2 className="mt-6 break-keep text-[clamp(30px,4.5vw,52px)] font-bold leading-[1.2] tracking-[-0.03em]">
                <span className="font-normal text-white/40">꼭 저희가 아니어도 좋습니다</span><br />
                <span className="font-extrabold">칼럼 먼저 읽어보세요.</span>
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
                    <Image
                      src={i === 0 ? charFemale : charMale}
                      alt=""
                      width={44}
                      height={44}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-auto">
                    <p className="text-[12px] text-white/45 mb-3">
                      {a.date
                        ? new Date(a.date).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : ""}
                    </p>
                    <h3 className="text-[17px] font-bold leading-[1.4] mb-3 line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="text-[13px] text-white/55 leading-[1.75] line-clamp-3">
                      {a.description ||
                        "픽셀페이지가 실제 광고비를 굴리며 검증한 인사이트입니다."}
                    </p>
                  </div>
                </a>
              ))}
              {/* Featured card */}
              <a
                href={articles[0] ? `/columns/${articles[0].slug}` : "/columns"}
                className="rounded-3xl overflow-hidden relative min-h-[380px] group"
              >
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src="/reels/7.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/85" />
                <div className="relative h-full p-6 flex flex-col justify-between text-white">
                  <div className="flex items-center gap-1.5">
                    <Image src={logoWhite} alt="" width={80} height={16} className="h-4 w-auto" />
                  </div>
                  <div className="flex items-end justify-between">
                    <h3 className="text-[22px] font-bold leading-[1.3]">
                      최근<br />인사이트?
                    </h3>
                    <span className="w-11 h-11 rounded-full bg-sky-500 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </a>
            </div>

            {/* Bottom accent bar */}
            <div className="mt-8 rounded-3xl bg-[#0f0f1a] border border-white/[0.05] px-8 py-10 flex items-center justify-between gap-6">
              <p className="text-[clamp(20px,2.6vw,32px)] font-bold leading-[1.25] tracking-[-0.02em]">
                <span className="font-extrabold">We turn</span>
                <span className="font-normal text-sky-400"> Ideas into </span>
                <span className="font-extrabold">successful</span>
                <span className="font-normal text-white/50"> products. </span>
                <span className="font-extrabold">Get</span>
                <span className="font-normal text-sky-400"> to Know </span>
                <span className="font-extrabold">more.</span>
              </p>
              <Image
                src={logoWhite}
                alt=""
                width={80}
                height={16}
                className="h-5 w-auto opacity-40 hidden md:block flex-shrink-0"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── 11. FAQ (agency 재사용, 다크) ── */}
      <div id="faq" className="border-t border-white/[0.04]">
        <AgencyFAQSection variant="dark" />
      </div>

      {/* ── 10. CTA (WeTechPro DNA — 좌 폼 + 우 캐릭터 마스코트) ── */}
      <section
        id="cta"
        className="py-24 lg:py-32 relative overflow-hidden border-t border-white/[0.06]"
        style={{
          background:
            "radial-gradient(ellipse 900px 500px at 50% 100%, rgba(99,102,241,0.28) 0%, transparent 70%), linear-gradient(180deg, #08080d 0%, #0b0b16 100%)",
        }}
      >
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="rounded-3xl border border-white/[0.06] bg-[#0c0c14]/80 backdrop-blur-sm p-6 md:p-10 lg:p-14 relative overflow-hidden">
            {/* 파도 라인 패턴 */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(115deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 42px)",
              }}
            />

            <div className="relative grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-10">
              {/* Left — form */}
              <div className="rounded-3xl bg-[#0a0a13] border border-white/[0.06] p-7 md:p-8">
                <p className="text-[13px] font-semibold mb-6">지금 상담부터 시작하세요</p>
                {submitted ? (
                  <div className="py-12 text-center">
                    <p className="text-[16px] font-semibold mb-3">신청이 접수되었습니다.</p>
                    <p className="text-[13px] text-white/55 mb-6">평균 3시간 이내 회신드립니다.</p>
                    <a
                      href={KAKAO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FEE500] text-[#181600] text-[13px] font-bold"
                    >
                      <MessageSquare className="w-4 h-4" /> 카카오톡으로 바로 문의
                    </a>
                  </div>
                ) : (
                  <form onSubmit={submit} className="space-y-4">
                    <div>
                      <label className="text-[12px] text-white/55 mb-1.5 block">성함 *</label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="박희규"
                        className="w-full px-4 py-3 rounded-xl bg-transparent border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] text-white/55 mb-1.5 block">회사·브랜드명</label>
                      <input
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder="픽셀페이지"
                        className="w-full px-4 py-3 rounded-xl bg-transparent border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] text-white/55 mb-1.5 block">연락처 *</label>
                      <input
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="010-0000-0000"
                        className="w-full px-4 py-3 rounded-xl bg-transparent border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] text-white/55 mb-1.5 block">월 광고 예산 *</label>
                      <select
                        required
                        value={form.budget}
                        onChange={(e) => setForm({ ...form, budget: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-transparent border border-white/10 text-white/90 focus:outline-none focus:border-sky-400"
                      >
                        <option value="" className="bg-[#0a0a13]">선택하세요</option>
                        <option className="bg-[#0a0a13]">500만 원 미만</option>
                        <option className="bg-[#0a0a13]">500 ~ 1,000만 원</option>
                        <option className="bg-[#0a0a13]">1,000 ~ 3,000만 원</option>
                        <option className="bg-[#0a0a13]">3,000만 원 이상</option>
                      </select>
                    </div>
                    <label className="flex items-start gap-2.5 text-[12px] text-white/50 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={form.agree}
                        onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                        className="mt-0.5"
                        required
                      />
                      <span>개인정보 수집·이용에 동의합니다.</span>
                    </label>
                    <button
                      type="submit"
                      className="w-full mt-2 px-6 py-4 rounded-full bg-sky-500 hover:bg-sky-400 text-white text-[15px] font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      무료 상담 신청하기 <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <p className="text-center text-[13px] text-white/40 pt-1">
                      평균 회신 3시간 이내 · 계약 강요 없음
                    </p>
                  </form>
                )}
              </div>

              {/* Right — 카피 + 캐릭터 마스코트 */}
              <div className="flex flex-col justify-between">
                <div>
                  <PillLabel color="#38bdf8">Free Consultation</PillLabel>
                  <h2 className="mt-6 break-keep text-white text-[clamp(28px,4.2vw,48px)] font-extrabold leading-[1.15] tracking-[-0.035em] mb-6">
                    DB를 <span className="text-white/40 line-through decoration-[3px]">사지</span> 마세요.<br />
                    <span className="text-sky-300">나오는 구조</span>를<br />만드세요.
                  </h2>
                  <p className="text-[14px] text-white/60 leading-[1.85] mb-8">
                    광고 계정·랜딩·CRM을 함께 열어보고<br />
                    어디가 새는지 찾아드립니다. 계약 없이도 괜찮습니다.
                  </p>
                  <ul className="space-y-3.5 mb-10">
                    {[
                      "평균 회신 3시간 이내",
                      "브랜드 전담 담당자 배정",
                      "NDA 즉시 서명 가능",
                    ].map((v) => (
                      <li key={v} className="flex items-center gap-3 text-[14px] text-white/75">
                        <Check className="w-4 h-4 text-sky-400" strokeWidth={2.5} />
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 캐릭터 마스코트 카드 */}
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-sky-500/40 to-sky-800/20 border border-sky-400/20 overflow-hidden flex items-end justify-center">
                    <Image src={charMale} alt="" width={96} height={96} className="w-full h-auto object-contain" />
                  </div>
                  <div>
                    <p className="text-[16px] font-bold">박희규</p>
                    <p className="text-[12px] text-white/50 mb-3">Founder, PixelPage</p>
                    <a href={KAKAO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[12.5px] text-sky-300 hover:text-sky-200">
                      <MessageSquare className="w-3.5 h-3.5" /> 카카오톡으로 바로 문의
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. Footer ── */}
      <footer className="py-12 bg-[#06060a] border-t border-white/[0.05]">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <a href="/" className="flex items-center gap-2">
            <Image src={logoWhite} alt="PixelPage" width={90} height={18} className="h-4 w-auto opacity-70" />
          </a>
          <p className="text-[13px] text-white/35 text-center">
            © PIXELPAGE · pixelpage.co.kr · contact@pixelpage.co.kr
          </p>
          <div className="flex items-center gap-3 text-[13px] text-white/35">
            <a href="/columns" className="hover:text-white/60">칼럼</a>
            <span className="text-white/15">·</span>
            <a href="/consult" className="hover:text-white/60">상담</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LpClient;

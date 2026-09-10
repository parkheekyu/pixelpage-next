"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    className="inline-flex items-center px-4 py-1.5 rounded-full text-[16px] font-semibold border"
    style={{ borderColor: `${color}55`, color, backgroundColor: `${color}0f` }}
  >
    {children}
  </span>
);

/* ─────────────────────── Main ─────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LpClient = ({ articles = [] }: { articles?: Article[] }) => {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", company: "", phone: "", industry: "", budget: "", agree: false });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.agree) return;
    const body = `이름: ${form.name}%0A회사: ${form.company}%0A연락처: ${form.phone}%0A업종: ${form.industry}%0A월 광고 예산: ${form.budget}`;
    const mailto = `mailto:contact@pixelpage.co.kr?subject=%5B무료%20상담%20신청%5D%20${encodeURIComponent(form.company || form.name)}&body=${body}`;
    try {
      const a = document.createElement("a");
      a.href = mailto;
      a.rel = "noopener";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {}
    router.push("/thank-you");
  };

  return (
    <div className="bg-[#08080d] text-white min-h-screen selection:bg-sky-500/30">
      {/* ── Floating Pill Navbar ── */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1120px,calc(100%-24px))]">
        <div className="rounded-full bg-[#0e0e18]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_18px_50px_-20px_rgba(0,0,0,0.7)] px-5 py-2.5 flex items-center gap-2">
          <a href="/" className="flex items-center gap-2 pl-1 pr-3">
            <Image src={logoWhite} alt="PixelPage" width={100} height={20} className="h-5 w-auto" />
          </a>
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center text-[16px]">
            <a href="#solution" className="px-3.5 py-2 rounded-full text-white/60 hover:text-white">소개</a>
            <a href="#process" className="px-3.5 py-2 rounded-full text-white/60 hover:text-white">진행 방식</a>
            <a href="#faq" className="px-3.5 py-2 rounded-full text-white/60 hover:text-white">FAQ</a>
            <a href="/columns" className="px-3.5 py-2 rounded-full text-white/60 hover:text-white">무료 칼럼</a>
          </nav>
          <a
            href="#cta"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-400/40 text-white text-[16px] font-medium"
          >
            <span className="w-6 h-6 rounded-full bg-sky-500/25 flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-sky-300" />
            </span>
            파트너형 DB 도입
          </a>
        </div>
      </header>

      {/* ── 1. 히어로 (섹션 전체 영상 배경 + 짙은 오버레이) ── */}
      <section className="relative pt-[130px] pb-24 md:pt-[180px] md:pb-40 lg:pt-[240px] lg:pb-56 bg-black overflow-hidden">
        {/* 배경 동영상 */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/lp-hero/hero-poster.webp"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          aria-hidden="true"
        >
          <source src="/lp-hero/hero.mp4" type="video/mp4" />
        </video>
        {/* 짙은 오버레이 */}
        <div className="absolute inset-0 bg-black/80 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 85% 60% at 50% 55%, transparent 0%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        <div className="relative max-w-[1120px] mx-auto px-6 lg:px-8 text-center">
            {/* Google 리뷰 아바타 스택 */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-[#0c0c14] overflow-hidden bg-orange-200">
                  <Image src={charMale} alt="" width={32} height={32} className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#0c0c14] bg-pink-100 flex items-center justify-center overflow-hidden">
                  <Image src={charFemale} alt="" width={32} height={32} className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#0c0c14] bg-white flex items-center justify-center text-[16px] font-bold text-blue-600">
                  G
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#0c0c14] overflow-hidden">
                  <Image src={charCurly} alt="" width={32} height={32} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <span className="text-[17px] font-bold">4.9</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-[16px] text-white/45 mb-10">파트너사 만족도</p>

            {/* 큰 하이브리드 타이틀 */}
            <h1 className="break-keep text-[clamp(44px,7.5vw,96px)] leading-[1.05] tracking-[-0.045em]">
              <span className="block font-extrabold text-white">폭발적인 매출을</span>
              <span className="block">
                <span className="font-normal text-white/40">향해서 </span>
                <span className="font-extrabold text-white">달립니다.</span>
              </span>
            </h1>

            {/* 스플릿 CTA */}
            <div
              className="mt-10 md:mt-14 inline-flex items-center gap-1 p-1 rounded-full max-w-full"
              style={{ backgroundColor: "#4090f7" }}
            >
              <span className="px-3 md:px-6 py-2.5 md:py-3 text-white text-[12px] md:text-[17px] font-semibold whitespace-nowrap">
                파트너형 DB 마케팅 도입 문의
              </span>
              <a
                href="#cta"
                className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-full bg-black text-white text-[10.5px] md:text-[16px] font-bold uppercase tracking-[0.06em] md:tracking-[0.1em] whitespace-nowrap"
              >
                무료 상담
                <span className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-white overflow-hidden flex items-center justify-center">
                  <Image src={charMale} alt="" width={28} height={28} className="w-full h-full object-cover" />
                </span>
                <span className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "#4090f7" }}>
                  <Phone className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                </span>
              </a>
            </div>
        </div>
      </section>

      {/* ── 2. 함께하는 파트너사 ── */}
      <section className="py-14 border-y border-white/[0.06] overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <p className="text-center text-[16px] tracking-[0.28em] font-semibold text-white/40 mb-8 uppercase">
            함께하는 파트너사
          </p>
        </div>
        {(() => {
          const partners = [
            { src: "/lp-partners/1.webp", alt: "DIHABOOKS" },
            { src: "/lp-partners/2.webp", alt: "안부스쿨" },
            { src: "/lp-partners/3.webp", alt: "플러스스피치" },
            { src: "/lp-partners/4.webp", alt: "GIM COMPANY" },
            { src: "/lp-partners/5.webp", alt: "B:forest" },
            { src: "/lp-partners/6.webp", alt: "빌리언 캠퍼스" },
            { src: "/lp-partners/7.webp", alt: "BOOTSTRAPPER" },
            { src: "/lp-partners/8.webp", alt: "디지털 노마드" },
            { src: "/lp-partners/9.webp", alt: "RUNMOA" },
            { src: "/lp-partners/10.webp", alt: "funnelmoa" },
            { src: "/lp-partners/11.webp", alt: "Cosmosfarm" },
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
                      loading="lazy"
                      decoding="async"
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
      <section id="problem" className="py-16 md:py-24 lg:py-32">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="mb-16 text-center">
            <PillLabel color="#f87171">Problem</PillLabel>
            <h2 className="mt-6 break-keep text-[clamp(30px,4.5vw,52px)] font-bold leading-[1.2] tracking-[-0.03em]">
              <span className="font-normal text-white/40">기존의 DB 마케팅 방식으로는</span><br />
              <span className="font-extrabold">매출 규모를 키우기 어렵습니다.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1080px] mx-auto">
            {[
              { icon: TrendingDown, num: "01", tag: "늘리는 순간 무너집니다", body: "물량을 키우면 허수가 섞이고 단가는 뜁니다. 매출을 키우고 싶어도, 구조가 못 받쳐줍니다." },
              { icon: Search, num: "02", tag: "출처를 모릅니다", body: "어떤 광고를 보고 온 고객인지 모르니, 상담 품질이 복불복입니다." },
              { icon: Users, num: "03", tag: "나만의 DB가 아닙니다", body: "같은 DB가 여러 업체에 팔립니다. 전화하면 이미 경쟁사와 통화 중입니다." },
              { icon: Zap, num: "04", tag: "개선이 없습니다", body: "성과가 안 나와도 소재도 타겟도 그대로. 파는 쪽은 바꿀 이유가 없으니까요." },
            ].map((p) => (
              <div
                key={p.tag}
                className="rounded-3xl bg-[#0c0c14]/80 border border-red-400/15 p-7 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500/25 to-red-500/10 border border-red-400/25 flex items-center justify-center">
                    <p.icon className="w-5 h-5 text-red-300" />
                  </div>
                  <span className="text-[16px] text-red-300/60 font-mono font-bold">{p.num}</span>
                </div>
                <h3 className="text-[18px] md:text-[19px] font-bold mb-3 tracking-[-0.02em] leading-[1.3]">{p.tag}</h3>
                <p className="text-[16.5px] text-white/60 leading-[1.75]">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. 해결 ── */}
      <section
        id="solution"
        className="py-16 md:py-24 lg:py-32 relative overflow-hidden"
        style={{
          backgroundColor: "#040814",
          backgroundImage: "url(/lp-solution-bg.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="mb-16 text-center">
            <PillLabel color="#38bdf8">Solution</PillLabel>
            <h2 className="mt-6 break-keep text-[clamp(30px,4.5vw,52px)] font-bold leading-[1.2] tracking-[-0.03em]">
              <span className="font-normal text-white/40">그래서 픽셀페이지는</span><br />
              <span className="font-extrabold text-white">파트너형 DB 마케팅</span>
              <span className="font-normal text-white/40">을 고집합니다.</span>
            </h2>
          </div>

          <div className="flex flex-col gap-4 max-w-[980px] mx-auto">
            {[
              { num: "01", title: "대표가 직접 합니다", body: "하청식 DB 수집을 하지 않습니다. 매출 성장을 위한 마케팅 설계를 합니다." },
              { num: "02", title: "DB 단가를 부풀리지 않습니다", body: "효율이 나면 고객도 이득이면 좋겠습니다. Win-Win하며 성장하는 방식을 추구합니다." },
              { num: "03", title: "저품질 DB는 저희도 손해입니다", body: "고객에게 도움이 되지 않으면 저희도 성장할 수 없습니다." },
              { num: "04", title: "터질 때까지 합니다", body: "분명히 매출이 터지는 지점은 있습니다. 그 목표를 향해 무한 테스트합니다." },
            ].map((s) => (
              <div
                key={s.num}
                className="rounded-3xl border border-white/[0.06] bg-[#0c0c14]/70 backdrop-blur-sm p-6 md:p-8 hover:border-sky-400/25 transition-colors"
              >
                <div className="flex items-center gap-5 md:gap-7">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-sky-400/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-[18px] md:text-[20px] font-mono font-extrabold text-sky-300 tabular-nums">
                      {s.num}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[18px] md:text-[20px] font-bold text-white mb-1.5 tracking-[-0.02em]">
                      {s.title}
                    </h3>
                    <p className="text-[17px] text-white/60 leading-[1.7]">{s.body}</p>
                  </div>
                </div>
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
      <section id="service" className="py-16 md:py-24 lg:py-32 border-t border-white/[0.04]">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="mb-14 text-center">
            <PillLabel color="#facc15">Services</PillLabel>
            <h2 className="mt-6 break-keep text-[clamp(30px,4.5vw,52px)] font-bold leading-[1.2] tracking-[-0.03em] max-w-[820px] mx-auto">
              <span className="font-normal text-white/40">매출이 터질 때까지</span><br />
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
                <p className="text-[17px] text-white/55 leading-[1.85] mb-6">{s.d}</p>
                <ul className="space-y-3 mb-8">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-3 text-[16.5px] text-white/70">
                      <Check className="w-4 h-4 text-sky-400" strokeWidth={2.5} />
                      {b}
                    </li>
                  ))}
                </ul>
                <a
                  href="#cta"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-white/15 text-[15.5px] font-semibold hover:bg-white/[0.04]"
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
                <div
                  className="relative rounded-2xl overflow-hidden bg-black h-[440px] md:h-[480px] flex"
                  style={{
                    WebkitMaskImage:
                      "linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)",
                    maskImage:
                      "linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)",
                  }}
                >
                  {[
                    { src: "/lp-landings/landing1.webp", dir: "animate-marquee-up" },
                    { src: "/lp-landings/landing2.webp", dir: "animate-marquee-down" },
                    { src: "/lp-landings/landing3.webp", dir: "animate-marquee-up" },
                  ].map((col, ci) => (
                    <div key={ci} className="flex-1 overflow-hidden">
                      <div className={col.dir} style={{ animationDuration: "70s" }}>
                        {[0, 1].map((k) => (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            key={k}
                            src={col.src}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full block select-none pointer-events-none"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
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
      <section id="portfolio" className="py-16 md:py-24 lg:py-32">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="mb-14 text-center">
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
                    <p className="text-[17px] font-bold">{c.co}</p>
                    <p className="text-[16px] text-white/45 mt-0.5">{c.industry}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-sky-300/60" />
                </div>
                <div className="space-y-3.5">
                  {c.stats.map((s) => (
                    <div key={s.k} className="flex items-baseline justify-between">
                      <span className="text-[15.5px] text-white/50">{s.k}</span>
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
              className="inline-flex items-center gap-1.5 text-[16px] text-sky-300 hover:text-sky-200 font-semibold border border-white/10 hover:border-white/25 px-5 py-2.5 rounded-full transition-colors"
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

      {/* ── 8. Process (marketing agency 재사용, 다크 + LP 전용 딥 블루 배경) ── */}
      <div
        id="process"
        className="border-t border-white/[0.04] relative [&>section]:!bg-transparent"
        style={{
          backgroundColor: "#050b1e",
          backgroundImage:
            "radial-gradient(ellipse 900px 500px at 85% 0%, rgba(56,189,248,0.14) 0%, transparent 60%), radial-gradient(ellipse 700px 400px at 15% 100%, rgba(37,99,235,0.16) 0%, transparent 65%)",
        }}
      >
        <ProcessSection variant="dark" />
      </div>

      {/* ── 10. News & blogs (좌측 정렬, Notion 최근 칼럼) ── */}
      {articles.length > 0 && (
        <section id="blog" className="py-16 md:py-24 lg:py-32 border-t border-white/[0.04]">
          <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
            <div className="mb-14 text-center">
              <PillLabel color="#fb923c">INSIGHT</PillLabel>
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
                    <p className="text-[15px] text-white/45 mb-3">
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
                    <p className="text-[16px] text-white/55 leading-[1.75] line-clamp-3">
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
                style={{
                  background:
                    "radial-gradient(ellipse 120% 90% at 20% 100%, rgba(56,189,248,0.55) 0%, transparent 55%), linear-gradient(160deg, #0e152a 0%, #060a15 100%)",
                }}
              >
                <div className="relative h-full p-6 flex flex-col justify-between text-white">
                  <div className="flex items-center gap-1.5">
                    <Image src={logoWhite} alt="" width={80} height={16} className="h-4 w-auto" />
                  </div>
                  <div className="flex items-end justify-between">
                    <h3 className="text-[22px] font-bold leading-[1.3]">
                      Recent<br />Insights?
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
                <span className="font-normal text-white/50">고객이 </span>
                <span className="font-extrabold">성장하지 못하는</span>
                <span className="font-normal text-white/50"> 마케팅은 </span>
                <span className="font-extrabold">하지 않습니다.</span>
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
        className="py-6 md:py-24 lg:py-32 relative overflow-hidden border-t border-white/[0.06]"
        style={{
          backgroundColor: "#040814",
          backgroundImage: "url(/lp-cta-bg.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="p-2 md:p-4">
            <div className="max-w-[720px] mx-auto">
              {/* 헤드라인 (가운데) */}
              <div className="text-center mb-12">
                <PillLabel color="#38bdf8">Free Consultation</PillLabel>
                <h2 className="mt-6 break-keep text-white text-[clamp(28px,4.2vw,48px)] font-extrabold leading-[1.15] tracking-[-0.035em]">
                  DB를 <span className="text-white/40 line-through decoration-[3px]">사지</span> 마세요.<br />
                  <span className="text-sky-300">함께 성장</span>합시다.
                </h2>
              </div>

              {/* 폼 */}
              <div className="rounded-3xl bg-[#0a0a13] border border-white/[0.06] p-7 md:p-8">
                <p className="text-[16px] font-semibold mb-6">지금 상담부터 시작하세요</p>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                      <label className="text-[15px] text-white/55 mb-1.5 block">성함 *</label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="홍길동"
                        className="w-full px-4 py-3 rounded-xl bg-transparent border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="text-[15px] text-white/55 mb-1.5 block">회사·브랜드명</label>
                      <input
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder="픽셀페이지"
                        className="w-full px-4 py-3 rounded-xl bg-transparent border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="text-[15px] text-white/55 mb-1.5 block">연락처 *</label>
                      <input
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="010-0000-0000"
                        className="w-full px-4 py-3 rounded-xl bg-transparent border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="text-[15px] text-white/55 mb-1.5 block">업종 *</label>
                      <select
                        required
                        value={form.industry}
                        onChange={(e) => setForm({ ...form, industry: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-transparent border border-white/10 text-white/90 focus:outline-none focus:border-sky-400"
                      >
                        <option value="" className="bg-[#0a0a13]">선택하세요</option>
                        <option className="bg-[#0a0a13]">교육·코칭</option>
                        <option className="bg-[#0a0a13]">병원·의료·성형</option>
                        <option className="bg-[#0a0a13]">부동산·인테리어</option>
                        <option className="bg-[#0a0a13]">시공·설비 (태양광 등)</option>
                        <option className="bg-[#0a0a13]">법률·전문 서비스</option>
                        <option className="bg-[#0a0a13]">프랜차이즈·가맹</option>
                        <option className="bg-[#0a0a13]">이커머스·D2C</option>
                        <option className="bg-[#0a0a13]">지식 SaaS·B2B</option>
                        <option className="bg-[#0a0a13]">기타</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[15px] text-white/55 mb-1.5 block">월 광고 예산 *</label>
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
                    <label className="flex items-start gap-2.5 text-[15px] text-white/50 cursor-pointer pt-1">
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
                      className="w-full mt-2 px-6 py-4 rounded-full bg-sky-500 hover:bg-sky-400 text-white text-[17px] font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      무료 상담 신청하기 <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <p className="text-center text-[16px] text-white/40 pt-1">
                      빠른 시일 내에 연락드리겠습니다.
                    </p>
                  </form>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── 11. Footer ── */}
      <footer className="pt-16 pb-24 md:pb-16 bg-[#06060a] border-t border-white/[0.05] text-white/45">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          {/* Top: 로고 · 소개 · 링크 */}
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr] gap-10 md:gap-12 pb-10 border-b border-white/[0.06]">
            <div>
              <a href="/" className="inline-flex items-center gap-2">
                <Image src={logoWhite} alt="PixelPage" width={110} height={22} className="h-5 w-auto opacity-90" />
              </a>
              <p className="mt-5 text-[14px] text-white/50 leading-[1.85] max-w-[360px]">
                매출 성장의 진짜 파트너가 되겠습니다.
              </p>
            </div>

            <div>
              <p className="text-[12px] font-semibold tracking-[0.18em] uppercase text-white/60 mb-4">
                Company
              </p>
              <ul className="space-y-2 text-[14px]">
                <li><a href="#solution" className="hover:text-white">소개</a></li>
                <li><a href="#process" className="hover:text-white">진행 방식</a></li>
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
                <li><a href="/columns" className="hover:text-white">무료 칼럼</a></li>
              </ul>
            </div>

            <div>
              <p className="text-[12px] font-semibold tracking-[0.18em] uppercase text-white/60 mb-4">
                Contact
              </p>
              <ul className="space-y-2 text-[14px]">
                <li>
                  <a href="mailto:contact@pixelpage.co.kr" className="hover:text-white">
                    contact@pixelpage.co.kr
                  </a>
                </li>
                <li>
                  <a href={KAKAO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    카카오톡 상담
                  </a>
                </li>
                <li>
                  <a href="#cta" className="hover:text-white">파트너형 DB 도입 문의</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom: 사업자 정보 · 카피라이트 */}
          <div className="pt-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between text-[13px] leading-[1.75] text-white/35">
            <div className="space-y-1">
              <p>
                <span className="text-white/55 font-semibold">픽셀페이지</span>
                <span className="mx-2 text-white/15">|</span>
                대표 박희규
                <span className="mx-2 text-white/15">|</span>
                사업자등록번호 <span className="tabular-nums">477-11-01530</span>
              </p>
              <p>
                경기도 용인시 수지구 광교중앙로296번길 10, 207호-제24호 (상현동, 광교 리치안 오피스텔)
              </p>
            </div>
            <p className="text-white/30 whitespace-nowrap">© 2026 PIXELPAGE. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 모바일 스크롤 시 하단 플로팅 CTA */}
      <a
        href="#cta"
        aria-hidden={!scrolled}
        className={`md:hidden fixed left-3 right-3 z-40 flex items-center justify-between gap-2 px-5 py-3.5 rounded-full shadow-[0_18px_40px_-14px_rgba(64,144,247,0.6)] text-white font-bold text-[14px] tracking-[-0.01em] transition-all duration-300 ${
          scrolled
            ? "bottom-4 opacity-100 translate-y-0 pointer-events-auto"
            : "-bottom-4 opacity-0 translate-y-6 pointer-events-none"
        }`}
        style={{ backgroundColor: "#4090f7" }}
      >
        <span>파트너형 DB 도입 문의</span>
        <span className="inline-flex items-center gap-1.5">
          무료 상담
          <span className="w-6 h-6 rounded-full bg-black/25 flex items-center justify-center">
            <ArrowUpRight className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </span>
        </span>
      </a>
    </div>
  );
};

export default LpClient;

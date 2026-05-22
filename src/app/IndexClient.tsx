"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import PainSection from "@/components/PainSection";
import MethodSection from "@/components/MethodSection";
import PipelineCasesSection from "@/components/PipelineCasesSection";
import ServiceIntroSection from "@/components/ServiceIntroSection";
import FAQSection from "@/components/FAQSection";
import iconAt from "@/assets/icon-at.svg";

/* ─── 1. Hero ─── */
const HeroSection = () => (
  <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
    {/* 히어로 배경 영상 */}
    <div className="absolute bottom-[-55%] left-0 right-0 pointer-events-none z-0 flex justify-center">
      <video autoPlay muted loop playsInline className="w-full max-w-[1534px] object-contain">
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
    </div>

    <div className="relative z-10 text-center px-6 pt-24 pb-8 -mt-48">
      <h1 className="break-keep text-[clamp(36px,6vw,72px)] font-bold leading-[1.12] tracking-[-0.03em] mb-7 opacity-0 animate-fade-up stagger-1 text-white">
        DB 마케팅의<br />새로운 혁신
      </h1>
      <p className="text-[16px] md:text-[18px] text-white/50 leading-[1.85] max-w-[520px] mx-auto mb-10 opacity-0 animate-fade-up stagger-2">
        광고만 맡기던 시대는 끝났습니다.<br />
        매출 파이프라인을 함께 설계합니다.
      </p>
      <div className="opacity-0 animate-fade-up stagger-3">
        <Link
          href="/consult"
          className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/30 text-white text-[15px] font-medium rounded-lg hover:bg-white/10 hover:border-white/50 transition-all"
        >
          무료 진단 받기
        </Link>
      </div>
    </div>

    <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center">
      <img src="/meta-partner-badge.png" alt="Meta Business Partners" className="h-8" />
    </div>
  </section>
);

/* ─── Final CTA ─── */
const CtaSection = () => (
  <section id="contact" className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal>
        <img src={iconAt.src} alt="" className="w-10 h-10 mb-5" />
        <p className="text-[12px] font-semibold tracking-[0.18em] text-blue-500 mb-5">
          무료 마케팅 진단
        </p>
        <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em] mb-5">
          매출 파이프라인,<br />어디서 새는지 찾아드립니다.
        </h2>
        <p className="text-[19px] text-muted-foreground max-w-[520px] leading-[1.9] mb-10">
          무료 마케팅 진단 — 30분이면 됩니다.<br />
          계약 없이도 괜찮습니다.
          <br /><br />
          진단 후 대행이 필요하면 대행을,<br />
          방향만 필요하면 컨설팅을 제안드립니다.
        </p>
        <Link href="/consult" className="inline-flex items-center gap-2 px-9 py-4 bg-[#0a0f1e] text-white text-[16px] font-semibold rounded-xl hover:bg-[#0a0f1e]/90 transition-all">
          무료 상담 신청 <ArrowRight className="w-4 h-4" />
        </Link>
      </Reveal>
    </div>
  </section>
);

/* ─── Page ─── */
const IndexClient = () => (
  <div>
    <HeroSection />
    <PainSection />
    <MethodSection />
    <PipelineCasesSection />
    <ServiceIntroSection />
    <FAQSection />
    <CtaSection />
  </div>
);

export default IndexClient;

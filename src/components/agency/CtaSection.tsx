"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";

const CtaSection = () => (
  <section className="relative overflow-hidden">
    <div
      className="absolute inset-0 z-0"
      style={{
        background:
          "linear-gradient(135deg, #05070d 0%, #0a0f1e 40%, #131b34 75%, #1d2a55 100%)",
      }}
    />
    <div className="absolute top-[20%] right-[10%] w-[420px] h-[420px] rounded-full bg-blue-500/[0.10] blur-[160px] pointer-events-none z-0" />

    <div className="relative z-10 py-28 lg:py-40">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12 text-center">
        <Reveal>
          <h2 className="break-keep text-[clamp(34px,5vw,64px)] font-bold text-white leading-[1.18] tracking-[-0.03em] mb-7">
            지금 광고 계정,<br />무료로 진단해드립니다.
          </h2>
          <p className="text-[16px] lg:text-[19px] text-white/65 leading-[1.85] max-w-[600px] mx-auto mb-10">
            어디서 예산이 새고 있는지, 퍼널 어디가 끊겼는지 — 30분 안에 짚어드려요.<br />
            계약 없이도 괜찮아요.
          </p>
          <Link
            href="/consult"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-[#0a0f1e] text-[15px] font-bold rounded-xl hover:bg-white/90 hover:-translate-y-0.5 transition-all"
          >
            무료 마케팅 진단 신청하기 <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </div>
  </section>
);

export default CtaSection;

"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const reels = [
  "/reels/1.mp4", "/reels/2.mp4", "/reels/3.mp4", "/reels/4.mp4", "/reels/5.mp4",
  "/reels/6.mp4", "/reels/7.mp4", "/reels/8.mp4", "/reels/9.mp4", "/reels/10.mp4",
];

const ReelColumn = ({
  items,
  direction,
}: {
  items: string[];
  direction: "up" | "down";
}) => (
  <div className="relative h-full overflow-hidden flex-1">
    <div className={direction === "up" ? "animate-marquee-up" : "animate-marquee-down"}>
      {[...items, ...items].map((src, i) => (
        <div key={`${src}-${i}`} className="mb-4 lg:mb-5 relative rounded-2xl overflow-hidden">
          <video
            src={src}
            autoPlay
            muted
            loop
            playsInline
            className="w-full aspect-[2/3] object-cover bg-black"
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/15 via-transparent to-black/35" />
        </div>
      ))}
    </div>
  </div>
);

const HeroSection = () => (
  <section
    className="relative overflow-hidden"
    style={{ height: "clamp(640px, 100vh, 760px)" }}
  >
    {/* 다크 가로 그라데이션 배경 */}
    <div
      className="absolute inset-0 z-0"
      style={{
        background:
          "linear-gradient(105deg, #05070d 0%, #0a0f1e 40%, #101830 70%, #182245 100%)",
      }}
    />
    <div className="absolute top-[25%] right-[12%] w-[420px] h-[420px] rounded-full bg-blue-500/[0.08] blur-[160px] pointer-events-none z-0" />

    {/* 우측 영상 컬럼 — 절대 위치, 1.25배 키우고 우측으로 (lg 이상) */}
    <div
      className="hidden lg:block absolute z-[5] overflow-hidden"
      style={{
        top: 0,
        bottom: 0,
        right: "24px",
        width: "700px",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
      }}
    >
      <div className="flex gap-4 lg:gap-5 h-full">
        <ReelColumn items={[reels[0], reels[3], reels[7], reels[5]]} direction="up" />
        <ReelColumn items={[reels[1], reels[4], reels[8], reels[6]]} direction="down" />
        <ReelColumn items={[reels[2], reels[9], reels[0], reels[3]]} direction="up" />
      </div>
    </div>

    {/* 좌측 텍스트 — 좌측 영역 안에서 수평 중앙 + 수직 중앙 */}
    <div className="relative z-10 w-full h-full flex items-center justify-center px-6 lg:pl-12 lg:pr-[760px]">
      <div className="w-full max-w-[560px] pt-20 pb-12 lg:pt-0 lg:pb-0">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[12px] text-white/35 hover:text-blue-400 transition-colors mb-10 opacity-0 animate-fade-up stagger-1"
        >
          <ArrowLeft className="w-3 h-3" /> 홈으로
        </Link>
        <p className="text-[12px] font-semibold tracking-[0.18em] uppercase text-blue-400 mb-6 opacity-0 animate-fade-up stagger-1">
          Marketing Agency
        </p>
        <h1 className="break-keep text-[clamp(36px,6vw,72px)] font-bold leading-[1.12] tracking-[-0.03em] text-white mb-7 opacity-0 animate-fade-up stagger-2">
          광고비는 줄이고<br />
          매출은 폭발시키세요
        </h1>
        <p className="text-[16px] md:text-[18px] text-white/50 leading-[1.85] max-w-[520px] mb-10 opacity-0 animate-fade-up stagger-3">
          감이 아니라 숫자로 판단합니다.<br />
          광고비 어디서 새는지, 데이터로 바로 보여드려요.
        </p>
        <div className="opacity-0 animate-fade-up stagger-4">
          <Link
            href="/consult"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0a0f1e] text-[15px] font-bold rounded-xl hover:bg-white/90 transition-all"
          >
            무료 마케팅 진단 받기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;

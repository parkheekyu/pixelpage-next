"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const reels = [
  "/reels/1.mp4", "/reels/2.mp4", "/reels/3.mp4", "/reels/4.mp4", "/reels/5.mp4",
  "/reels/6.mp4", "/reels/7.mp4", "/reels/8.mp4", "/reels/9.mp4", "/reels/10.mp4",
];

/* 한 컬럼에 비디오 쌓고 위/아래 무한 스크롤 */
const ReelColumn = ({
  items,
  direction,
}: {
  items: string[];
  direction: "up" | "down";
}) => (
  <div className="relative h-full overflow-hidden">
    <div className={direction === "up" ? "animate-marquee-up" : "animate-marquee-down"}>
      {/* 두 번 반복해 seamless loop */}
      {[...items, ...items].map((src, i) => (
        <div key={`${src}-${i}`} className="mb-3 lg:mb-4 relative rounded-xl overflow-hidden">
          <video
            src={src}
            autoPlay
            muted
            loop
            playsInline
            className="w-full aspect-[9/16] object-cover bg-black"
          />
          {/* 다크 그라데이션 오버레이 */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/35 via-black/15 to-black/55" />
        </div>
      ))}
    </div>
  </div>
);

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
    {/* 다크 + 가로 그라데이션 (좌 어둡 → 우 밝게) */}
    <div
      className="absolute inset-0 z-0"
      style={{
        background:
          "linear-gradient(105deg, #05070d 0%, #0a0f1e 35%, #131b34 60%, #1d2a55 85%, #2c3d7a 100%)",
      }}
    />
    {/* 우측 블루 글로우 */}
    <div className="absolute top-[20%] right-[10%] w-[480px] h-[480px] rounded-full bg-blue-500/[0.10] blur-[160px] pointer-events-none z-0" />

    <div className="relative z-10 max-w-[1240px] mx-auto w-full px-6 lg:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(360px,540px)] gap-12 lg:gap-20 items-center">
        {/* 좌측 — 텍스트 */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[12px] text-white/35 hover:text-blue-400 transition-colors mb-12 opacity-0 animate-fade-up stagger-1"
          >
            <ArrowLeft className="w-3 h-3" /> 홈으로
          </Link>
          <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-blue-400 mb-7 opacity-0 animate-fade-up stagger-1">
            Marketing Agency
          </p>
          <h1 className="break-keep text-[clamp(36px,6vw,72px)] font-bold leading-[1.12] tracking-[-0.03em] text-white mb-7 opacity-0 animate-fade-up stagger-2">
            광고비는 줄이고<br />
            매출은 폭발시키세요
          </h1>
          <p className="text-[16px] md:text-[18px] text-white/55 leading-[1.85] max-w-[460px] mb-10 opacity-0 animate-fade-up stagger-3">
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

        {/* 우측 — 영상 컬럼 마퀴 (md 이상에서만) */}
        <div className="hidden md:block h-[640px] lg:h-[720px] relative">
          <div className="grid grid-cols-3 gap-3 lg:gap-4 h-full">
            <ReelColumn items={[reels[0], reels[3], reels[7], reels[5]]} direction="up" />
            <ReelColumn items={[reels[1], reels[4], reels[8], reels[6]]} direction="down" />
            <ReelColumn items={[reels[2], reels[9], reels[0], reels[3]]} direction="up" />
          </div>
          {/* 상하 페이드 마스크 */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0a0f1e] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0f1e] to-transparent" />
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;

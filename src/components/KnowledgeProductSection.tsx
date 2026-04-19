"use client";

import { useEffect, useState } from "react";
import Reveal from "@/components/Reveal";

const REELS = ["/reels/1.mp4", "/reels/2.mp4", "/reels/3.mp4", "/reels/4.mp4", "/reels/5.mp4"];

const KnowledgeProductSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % REELS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        {/* Heading */}
        <Reveal className="text-center mb-14 lg:mb-20">
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em] mb-5">
            지식 상품은<br />다르게 팔아야 합니다.
          </h2>
          <p className="text-[17px] text-muted-foreground leading-[1.9] max-w-[480px] mx-auto">
            제품은 사진 한 장으로 팔리지만,<br />
            강의는 왜 지금, 왜 당신에게 배워야 하는지가 설득되어야 팝니다.
          </p>
        </Reveal>

        {/* Phone mockup */}
        <div className="flex justify-center">
          <div className="relative w-[280px] h-[560px] lg:w-[320px] lg:h-[640px]">
            {/* Phone frame */}
            <div className="absolute inset-0 rounded-[40px] border-[6px] border-neutral-900 bg-black shadow-2xl overflow-hidden z-10">
              {/* Status bar */}
              <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-black/80 to-transparent z-30 flex items-center justify-between px-6">
                <span className="text-[10px] text-white/80 font-medium">9:41</span>
                <div className="w-4 h-2 border border-white/60 rounded-sm relative">
                  <div className="absolute inset-[1px] right-[2px] bg-white/80 rounded-[1px]" />
                </div>
              </div>

              {/* Reels header */}
              <div className="absolute top-10 inset-x-0 z-30 flex items-center justify-between px-4 py-2">
                <span className="text-[15px] text-white font-bold">Reels</span>
              </div>

              {/* Video slides */}
              <div className="absolute inset-0">
                {REELS.map((src, i) => (
                  <video
                    key={src}
                    src={src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                    style={{ opacity: current === i ? 1 : 0 }}
                  />
                ))}
              </div>

              {/* Bottom overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent h-1/3 z-20 pointer-events-none" />

              {/* Swipe up hint */}
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-bounce">
                  <path d="M8 12V4M4 6l4-4 4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
                </svg>
              </div>

              {/* Right side icons */}
              <div className="absolute bottom-20 right-3 flex flex-col items-center gap-5 z-20">
                <div className="flex flex-col items-center gap-1">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="white"/></svg>
                  <span className="text-[9px] text-white/80">2.4K</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="white" strokeWidth="2" fill="none"/></svg>
                  <span className="text-[9px] text-white/80">89</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2" fill="none"/></svg>
                </div>
              </div>

              {/* Bottom nav */}
              <div className="absolute bottom-0 inset-x-0 h-12 bg-black z-30 flex items-center justify-around px-4">
                {[0,1,2,3,4].map(j => (
                  <div key={j} className={`w-5 h-5 rounded-sm ${j === 3 ? "border-2 border-white" : "bg-white/30"}`} />
                ))}
              </div>

              {/* Home indicator */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/40 rounded-full z-40" />
            </div>

            {/* Dynamic island */}
            <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[90px] h-[22px] bg-black rounded-full z-20" />
          </div>
        </div>

        {/* Bottom text */}
        <Reveal className="mt-14 text-center">
          <p className="text-[17px] text-foreground leading-[1.8]">
            그래서 우리는 <span className="text-primary font-semibold">설득 구조부터 설계</span>합니다.
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default KnowledgeProductSection;

"use client";

import Reveal from "@/components/Reveal";

const PLACEHOLDER_COLORS = [
  "bg-[#c4a882]", "bg-[#8b7b6b]", "bg-[#a39585]",
  "bg-[#b5a08a]", "bg-[#9c8c7c]", "bg-[#c9b9a5]",
  "bg-[#a89078]", "bg-[#bfae9a]",
];

const KnowledgeProductSection = () => (
  <section className="py-28 lg:py-36 bg-background">
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      {/* Heading */}
      <Reveal className="text-center mb-14 lg:mb-20">
        <h2 className="font-serif break-keep text-[clamp(32px,4.5vw,56px)] font-semibold text-foreground leading-[1.35] tracking-[-0.01em] mb-5">
          지식 상품은<br />다르게 팔아야 합니다.
        </h2>
        <p className="text-[17px] text-muted-foreground leading-[1.9] max-w-[480px] mx-auto">
          제품은 사진 한 장으로 팔리지만,<br />
          강의는 왜 지금, 왜 당신에게 배워야 하는지가 설득되어야 팝니다.
        </p>
      </Reveal>

      {/* Phone mockup with scrolling reels */}
      <div className="flex justify-center">
        <div className="relative w-[280px] h-[560px] lg:w-[320px] lg:h-[640px]">
          {/* Phone frame */}
          <div className="absolute inset-0 rounded-[40px] border-[6px] border-neutral-900 bg-black shadow-2xl overflow-hidden z-10">
            {/* Status bar */}
            <div className="absolute top-0 inset-x-0 h-10 bg-black/60 z-30 flex items-center justify-between px-6">
              <span className="text-[10px] text-white/80 font-medium">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 border border-white/60 rounded-sm relative">
                  <div className="absolute inset-[1px] right-[2px] bg-white/80 rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* Reels header */}
            <div className="absolute top-10 inset-x-0 z-30 flex items-center justify-between px-4 py-2">
              <span className="text-[15px] text-white font-bold">Reels</span>
              <div className="w-6 h-6 rounded-full border border-white/40 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="white" strokeWidth="1.5"/></svg>
              </div>
            </div>

            {/* Scrolling content */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="flex flex-col"
                style={{ animation: "reelsScroll 24s ease-in-out infinite" }}
              >
                {[...PLACEHOLDER_COLORS, ...PLACEHOLDER_COLORS].map((color, i) => (
                  <div key={i} className={`w-full shrink-0 ${color} relative`} style={{ height: "100%" }}>
                    {/* Bottom overlay — like reels UI */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent h-1/3 z-10" />
                    <div className="absolute bottom-16 left-4 z-20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-white/30" />
                        <span className="text-[12px] text-white font-semibold">channel_{i % 8 + 1}</span>
                        <span className="text-[10px] text-white/60 border border-white/30 px-2 py-0.5 rounded">Follow</span>
                      </div>
                      <p className="text-[11px] text-white/80 max-w-[180px] leading-[1.5]">
                        {["광고 소재 A/B 테스트 결과", "교육 브랜드 숏폼 전략", "코칭 서비스 리드 전환", "학원 마케팅 캠페인", "컨설팅 브랜딩 영상", "온라인 강의 프로모션", "수강생 후기 콘텐츠", "브랜드 인지도 캠페인"][i % 8]}
                      </p>
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
                        <span className="text-[9px] text-white/80">Share</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom nav bar */}
            <div className="absolute bottom-0 inset-x-0 h-12 bg-black z-30 flex items-center justify-around px-4">
              {["Home", "Search", "+", "Reels", "Profile"].map((label, i) => (
                <div key={label} className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-sm ${i === 3 ? "border-2 border-white" : "bg-white/30"} ${i === 2 ? "bg-white/80 rounded-md" : ""}`} />
                </div>
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
        <p className="text-[17px] font-serif text-foreground leading-[1.8]">
          그래서 우리는 <span className="text-primary font-semibold">설득 구조부터 설계</span>합니다.
        </p>
      </Reveal>
    </div>

    <style jsx>{`
      @keyframes reelsScroll {
        0% { transform: translateY(0); }
        6% { transform: translateY(0); }
        12.5% { transform: translateY(-12.5%); }
        18.5% { transform: translateY(-12.5%); }
        25% { transform: translateY(-25%); }
        31% { transform: translateY(-25%); }
        37.5% { transform: translateY(-37.5%); }
        43.5% { transform: translateY(-37.5%); }
        50% { transform: translateY(-50%); }
        56% { transform: translateY(-50%); }
        62.5% { transform: translateY(-62.5%); }
        68.5% { transform: translateY(-62.5%); }
        75% { transform: translateY(-75%); }
        81% { transform: translateY(-75%); }
        87.5% { transform: translateY(-87.5%); }
        93.5% { transform: translateY(-87.5%); }
        100% { transform: translateY(-100%); }
      }
    `}</style>
  </section>
);

export default KnowledgeProductSection;

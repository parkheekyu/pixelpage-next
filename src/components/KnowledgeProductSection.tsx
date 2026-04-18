"use client";

import Reveal from "@/components/Reveal";

const PLACEHOLDER_COLORS = [
  "bg-[#c4a882]", "bg-[#8b7b6b]", "bg-[#a39585]",
  "bg-[#b5a08a]", "bg-[#9c8c7c]", "bg-[#c9b9a5]",
  "bg-[#a89078]", "bg-[#bfae9a]", "bg-[#8a7d70]",
  "bg-[#b0a090]", "bg-[#c2b2a0]", "bg-[#978878]",
  "bg-[#a8956e]", "bg-[#b5a590]", "bg-[#9e8e7e]",
  "bg-[#c0ad95]", "bg-[#a09080]", "bg-[#b8a898]",
];

const ScrollColumn = ({ items, speed, offset }: { items: string[]; speed: number; offset: number }) => (
  <div className="relative overflow-hidden h-full">
    <div
      className="flex flex-col gap-3"
      style={{
        animation: `scrollUp ${speed}s linear infinite`,
        animationDelay: `${offset}s`,
      }}
    >
      {[...items, ...items].map((color, i) => {
        const h = [200, 260, 180, 300, 220, 240, 280, 190][i % 8];
        return (
          <div
            key={i}
            className={`w-full rounded-lg ${color}`}
            style={{ height: `${h}px` }}
          />
        );
      })}
    </div>
  </div>
);

const KnowledgeProductSection = () => (
  <section className="relative bg-background overflow-hidden h-[520px] lg:h-[600px]">
    {/* Full-width scrolling columns */}
    <div className="absolute inset-0">
      {/* Fade overlays */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

      <div className="grid grid-cols-4 lg:grid-cols-6 gap-3 h-full px-3">
        <ScrollColumn items={PLACEHOLDER_COLORS.slice(0, 6)} speed={28} offset={0} />
        <ScrollColumn items={PLACEHOLDER_COLORS.slice(3, 9)} speed={22} offset={-2} />
        <ScrollColumn items={PLACEHOLDER_COLORS.slice(6, 12)} speed={32} offset={-5} />
        <ScrollColumn items={PLACEHOLDER_COLORS.slice(9, 15)} speed={26} offset={-1} />
        <div className="hidden lg:block"><ScrollColumn items={PLACEHOLDER_COLORS.slice(12, 18)} speed={24} offset={-4} /></div>
        <div className="hidden lg:block"><ScrollColumn items={PLACEHOLDER_COLORS.slice(1, 7)} speed={30} offset={-3} /></div>
      </div>
    </div>

    {/* Dark overlay for text readability */}
    <div className="absolute inset-0 bg-background/80 z-20 pointer-events-none" />

    {/* Text — centered */}
    <div className="relative z-30 flex items-center justify-center h-full px-6">
      <Reveal>
        <div className="text-center">
          <h2 className="font-serif break-keep text-[clamp(32px,4.5vw,56px)] font-semibold text-foreground leading-[1.35] tracking-[-0.01em] mb-5">
            지식 상품은<br />다르게 팔아야 합니다.
          </h2>
          <p className="text-[17px] text-muted-foreground leading-[1.9] max-w-[480px] mx-auto mb-6">
            제품은 사진 한 장으로 팔리지만,<br />
            강의는 왜 지금, 왜 당신에게 배워야 하는지가 설득되어야 팝니다.
          </p>
          <p className="text-[17px] font-serif text-foreground leading-[1.8]">
            그래서 우리는 <span className="text-primary font-semibold">설득 구조부터 설계</span>합니다.
          </p>
        </div>
      </Reveal>
    </div>

    <style jsx>{`
      @keyframes scrollUp {
        0% { transform: translateY(0); }
        100% { transform: translateY(-50%); }
      }
    `}</style>
  </section>
);

export default KnowledgeProductSection;

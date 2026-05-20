"use client";

import Reveal from "@/components/Reveal";

const CARDS = [
  { media: "/reels/1.mp4" },
  { media: "/reels/2.mp4" },
  { media: "/reels/3.mp4" },
  { media: "/reels/4.mp4" },
  { media: "/reels/7.mp4" },
  { media: "/reels/6.mp4" },
  { media: "/reels/5.mp4" },
];

const KnowledgeProductSection = () => (
  <section className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-14 lg:mb-20">
        <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em] mb-5">
          광고, 랜딩, CRM.<br />셋이 연결돼야 파이프라인이 됩니다.
        </h2>
        <p className="text-[19px] text-muted-foreground leading-[1.9] max-w-[520px] mx-auto">
          픽셀페이지는 하나의 팀이 세 개를 같이 운영합니다.
        </p>
      </Reveal>
    </div>

    {/* Horizontal scroll cards — apple style */}
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-5 px-6 lg:px-12 pb-4" style={{ width: "max-content" }}>
        {[...CARDS, ...CARDS].map((card, i) => (
          <div
            key={i}
            className="relative w-[280px] lg:w-[320px] h-[420px] lg:h-[480px] rounded-3xl overflow-hidden shrink-0 bg-black"
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={card.media} type="video/mp4" />
            </video>
          </div>
        ))}
      </div>
    </div>

    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="mt-14 text-center">
        <p className="text-[19px] text-foreground leading-[1.9] max-w-[520px] mx-auto">
          메시지가 일관되고, 데이터가 연결되고,<br />
          <span className="font-bold">성과의 책임이 한 곳에 있습니다.</span>
        </p>
      </Reveal>
    </div>

    <style jsx>{`
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
  </section>
);

export default KnowledgeProductSection;

"use client";

import Reveal from "@/components/Reveal";

const CARDS = [
  { bg: "bg-[#0a0f1e]", text: "text-white", title: "광고는 돌리는데\n상담이 안 온다.", sub: "클릭만 끌어내는 광고는\n쉽습니다.", media: "/reels/1.mp4" },
  { bg: "bg-[#f5f0ea]", text: "text-[#1a1208]", title: "좋은 강의인데\n왜 안 팔릴까.", sub: "지식은 설득되어야\n팔립니다.", media: "/reels/2.mp4" },
  { bg: "bg-[#0a0f1e]", text: "text-white", title: "콘텐츠를 만들었는데\n반응이 없다.", sub: "포맷이 틀렸을\n가능성이 큽니다.", media: "/reels/3.mp4" },
  { bg: "bg-[#f5f0ea]", text: "text-[#1a1208]", title: "대행사 보고서에\n숫자만 있다.", sub: "맥락 없는 숫자는\n의미가 없습니다.", media: "/reels/4.mp4" },
  { bg: "bg-[#0a0f1e]", text: "text-white", title: "전 과정을 이해하는\n팀이 필요하다.", sub: "유입부터 매출까지\n한 팀이 설계합니다.", media: "/reels/5.mp4" },
];

const KnowledgeProductSection = () => (
  <section className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-14 lg:mb-20">
        <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em] mb-5">
          지식 상품은<br />다르게 팔아야 합니다.
        </h2>
        <p className="text-[19px] text-muted-foreground leading-[1.9] max-w-[520px] mx-auto">
          클릭만 끌어내는 광고는 쉽습니다.<br />
          하지만 한 번 실망한 고객은 다시 오지 않습니다.
        </p>
      </Reveal>
    </div>

    {/* Horizontal scroll cards — apple style */}
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-5 px-6 lg:px-12 pb-4" style={{ width: "max-content" }}>
        {CARDS.map((card, i) => (
          <div
            key={i}
            className={`relative w-[280px] lg:w-[320px] h-[420px] lg:h-[480px] rounded-3xl overflow-hidden shrink-0 flex flex-col justify-end p-7 ${card.bg}`}
          >
            {/* Background video */}
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            >
              <source src={card.media} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Text */}
            <div className="relative z-10">
              <h3 className={`text-[24px] lg:text-[28px] font-bold leading-[1.25] tracking-[-0.02em] whitespace-pre-line mb-3 ${card.text}`}>
                {card.title}
              </h3>
              <p className={`text-[14px] leading-[1.7] whitespace-pre-line opacity-70 ${card.text}`}>
                {card.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="mt-14 text-center">
        <p className="text-[19px] text-foreground leading-[1.9] max-w-[520px] mx-auto">
          저희는 <span className="font-bold">유입부터 매출까지, 전 과정을 이해하고</span> 만듭니다.<br />
          억지 후킹 없이도 팔 수 있는 이유입니다.
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

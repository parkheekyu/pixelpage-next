"use client";

import Reveal from "@/components/Reveal";

const stats = [
  { metric: "83%", label: "동종업계 대비 최대 효율" },
  { metric: "10억+", label: "B2C 교육 프로젝트 런칭" },
  { metric: "500명+", label: "누적 코칭/컨설팅" },
];

const PipelineCasesSection = () => (
  <section className="relative overflow-hidden">
    {/* Video background */}
    <div className="absolute inset-0 z-0">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,15,30,0.92) 0%, rgba(10,15,30,0.82) 50%, rgba(10,15,30,0.95) 100%)",
        }}
      />
    </div>

    <div className="relative z-10 py-32 lg:py-44">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12 text-center">
        <Reveal>
          <p className="text-[12px] font-semibold tracking-[0.18em] uppercase text-blue-400 mb-6">
            숫자로만 말할게요
          </p>
          <h2 className="break-keep text-[clamp(36px,5vw,64px)] font-bold text-white leading-[1.15] tracking-[-0.03em] mb-16 lg:mb-20">
            직접 런칭한 결과로 증명합니다.
          </h2>
        </Reveal>

        <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16 lg:mb-20">
          {stats.map((s) => (
            <div
              key={s.metric}
              className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm px-8 py-12 lg:py-14"
            >
              <p className="text-[clamp(40px,5vw,64px)] font-bold text-white tracking-[-0.03em] leading-none mb-4">
                {s.metric}
              </p>
              <p className="text-[14px] lg:text-[15px] text-white/60 tracking-[0.02em]">
                {s.label}
              </p>
            </div>
          ))}
        </Reveal>

        <Reveal>
          <p className="text-[18px] lg:text-[22px] text-white leading-[1.7] font-medium">
            답답해서 직접 시작했습니다.<br />
            <span className="text-white/70">더 이상 다른 대행사에 속지 마세요.</span>
          </p>
        </Reveal>
      </div>
    </div>
  </section>
);

export default PipelineCasesSection;

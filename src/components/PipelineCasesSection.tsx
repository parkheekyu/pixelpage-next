"use client";

import Reveal from "@/components/Reveal";

const stats = [
  { idx: "01", metric: "83%", label: "동종업계 대비 최대 효율" },
  { idx: "02", metric: "10억+", label: "B2C 교육 프로젝트 런칭" },
  { idx: "03", metric: "500명+", label: "누적 코칭/컨설팅" },
];

const cardGradients = [
  "linear-gradient(135deg, #1e2746 0%, #0f1426 100%)",
  "linear-gradient(135deg, #2a1f4a 0%, #0f1426 100%)",
  "linear-gradient(135deg, #0d2a3a 0%, #0f1426 100%)",
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
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,9,18,0.94) 0%, rgba(6,9,18,0.88) 50%, rgba(6,9,18,0.96) 100%)",
        }}
      />
    </div>

    <div className="relative z-10 py-32 lg:py-44">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-16 lg:mb-20">
          <p className="text-[13px] font-semibold tracking-[0.18em] text-blue-400 mb-6">
            숫자로만 말할게요
          </p>
          <h2 className="break-keep text-[clamp(36px,5vw,64px)] font-bold text-white leading-[1.18] tracking-[-0.03em]">
            직접 런칭한 결과로<br />증명합니다.
          </h2>
        </Reveal>

        <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-14 lg:mb-16">
          {stats.map((s, i) => (
            <div
              key={s.idx}
              className="rounded-2xl border border-white/[0.08] overflow-hidden"
              style={{ background: cardGradients[i] }}
            >
              {/* Top — metric showcase */}
              <div className="relative aspect-[16/10] flex items-center justify-center overflow-hidden">
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    background:
                      "radial-gradient(circle at 70% 30%, rgba(96,165,250,0.18) 0%, transparent 55%), radial-gradient(circle at 20% 80%, rgba(167,139,250,0.14) 0%, transparent 55%)",
                  }}
                />
                <span className="absolute top-5 left-6 text-[10px] font-semibold tracking-[0.18em] uppercase text-white/40">
                  Case {s.idx}
                </span>
                <p className="relative text-[clamp(40px,5.5vw,72px)] font-bold text-white tracking-[-0.04em] leading-none">
                  {s.metric}
                </p>
              </div>
              {/* Bottom — label */}
              <div className="px-6 py-5 lg:px-7 lg:py-6 border-t border-white/[0.06]">
                <p className="text-[15px] lg:text-[16px] font-medium text-white/85 leading-[1.5]">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </Reveal>

        <Reveal className="text-center">
          <p className="text-[18px] lg:text-[22px] text-white font-medium leading-[1.6]">
            답답해서 직접 시작했습니다.<br />
            <span className="text-white/60">더 이상 다른 대행사에 속지 마세요.</span>
          </p>
        </Reveal>
      </div>
    </div>
  </section>
);

export default PipelineCasesSection;

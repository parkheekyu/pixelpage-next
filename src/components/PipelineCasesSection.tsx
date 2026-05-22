"use client";

import { motion } from "framer-motion";
import Reveal from "@/components/Reveal";

const stats = [
  { idx: "01", metric: "83%", label: "동종업계 대비 최대 효율" },
  { idx: "02", metric: "10억+", label: "B2C 교육 프로젝트 런칭" },
  { idx: "03", metric: "500명+", label: "누적 코칭/컨설팅" },
];

const cardGradients = [
  "linear-gradient(135deg, #1e2746 0%, #0c1124 100%)",
  "linear-gradient(135deg, #2a1f4a 0%, #0c1124 100%)",
  "linear-gradient(135deg, #0d2a3a 0%, #0c1124 100%)",
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
            "linear-gradient(180deg, rgba(6,9,18,0.96) 0%, rgba(6,9,18,0.9) 50%, rgba(6,9,18,0.97) 100%)",
        }}
      />
    </div>

    <div className="relative z-10 py-32 lg:py-44">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-16 lg:mb-20">
          <p className="text-[12px] font-semibold tracking-[0.2em] text-blue-400 mb-6">
            숫자로만 말할게요
          </p>
          <h2 className="break-keep text-[clamp(32px,4vw,52px)] font-bold text-white leading-[1.28] tracking-[-0.02em]">
            직접 런칭한 결과로<br />증명합니다
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-12 lg:mb-16">
          {stats.map((s, i) => (
            <motion.div
              key={s.idx}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl border border-white/[0.07] overflow-hidden"
              style={{ background: cardGradients[i] }}
            >
              {/* Top — metric showcase */}
              <div className="relative aspect-[5/3] flex items-center justify-center overflow-hidden">
                <div
                  className="absolute inset-0 opacity-50"
                  style={{
                    background:
                      "radial-gradient(circle at 70% 30%, rgba(96,165,250,0.18) 0%, transparent 55%), radial-gradient(circle at 20% 80%, rgba(167,139,250,0.14) 0%, transparent 55%)",
                  }}
                />
                <span className="absolute top-4 left-5 text-[10px] font-semibold tracking-[0.2em] uppercase text-white/40">
                  Case {s.idx}
                </span>
                <motion.p
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, delay: 0.3 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="relative text-[clamp(32px,4vw,52px)] font-bold text-white tracking-[-0.035em] leading-none"
                >
                  {s.metric}
                </motion.p>
              </div>
              {/* Bottom — label */}
              <div className="px-5 py-4 lg:px-6 lg:py-5 border-t border-white/[0.06]">
                <p className="text-[13px] lg:text-[14px] font-medium text-white/80 leading-[1.5]">
                  {s.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <Reveal className="text-center">
          <p className="text-[16px] lg:text-[18px] text-white font-medium leading-[1.65]">
            답답해서 직접 시작했습니다.<br />
            <span className="text-white/55">더 이상 다른 대행사에 속지 마세요.</span>
          </p>
        </Reveal>
      </div>
    </div>
  </section>
);

export default PipelineCasesSection;

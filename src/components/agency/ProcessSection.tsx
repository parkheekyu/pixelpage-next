"use client";

import { motion } from "framer-motion";
import Reveal from "@/components/Reveal";

const steps = [
  {
    num: "01",
    title: "무료 마케팅 진단",
    body: "현재 광고 계정·랜딩 전환율·CRM 구조 분석 — 계약 전에 공개해요. 진단만 받고 가셔도 괜찮아요.",
    accent: false,
  },
  {
    num: "02",
    title: "파이프라인 구조 설계",
    body: "광고 캠페인 구조·랜딩 메시지·CRM 시퀀스를 한 번에 설계해요. 방향이 맞아야 집행도 의미 있어요.",
    accent: false,
  },
  {
    num: "03",
    title: "실전 집행 & 주간 최적화",
    body: "CTR · CPA 기반으로 매주 판단해요. 살릴지, 끌지, 교체할지 — 숫자로 결정하고 공유해요.",
    accent: true,
  },
  {
    num: "04",
    title: "스케일링 & 월간 성과 보고",
    body: "이긴 구조를 복제하고 예산을 단계적으로 확장해요. 허영 지표 없이 매출로 증명해요.",
    accent: true,
  },
];

const ProcessSection = () => (
  <section className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-16 lg:mb-20">
        <p className="text-[12px] font-semibold tracking-[0.18em] text-blue-500 mb-5">
          진행 방식
        </p>
        <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.18] tracking-[-0.03em]">
          처음 만나는 순간부터<br />투명하게 진행해요.
        </h2>
      </Reveal>

      {/* 데스크톱: 가로 스테퍼 */}
      <div className="hidden lg:block relative">
        {/* 가로 연결선 (배경) */}
        <div className="absolute top-7 left-[12%] right-[12%] h-px bg-[#e5e7eb]" />
        <div className="grid grid-cols-4 gap-6 relative">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <div
                className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-6 ${
                  s.accent
                    ? "bg-blue-500 text-white shadow-[0_0_0_6px_rgba(59,130,246,0.12)]"
                    : "bg-white border border-[#e5e7eb] text-foreground"
                }`}
              >
                <span className="text-[14px] font-bold tracking-[-0.02em]">{s.num}</span>
              </div>
              <h3 className="text-[17px] lg:text-[18px] font-bold text-foreground leading-[1.35] mb-3 px-2">
                {s.title}
              </h3>
              <p className="text-[14px] lg:text-[15px] text-muted-foreground leading-[1.8] px-2">
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 모바일: 세로 스테퍼 */}
      <div className="lg:hidden relative max-w-[480px] mx-auto">
        <div className="absolute left-7 top-7 bottom-7 w-px bg-[#e5e7eb]" />
        <div className="space-y-9">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, x: 14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
              className="relative flex gap-5"
            >
              <div
                className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                  s.accent
                    ? "bg-blue-500 text-white shadow-[0_0_0_5px_rgba(59,130,246,0.12)]"
                    : "bg-white border border-[#e5e7eb] text-foreground"
                }`}
              >
                <span className="text-[14px] font-bold">{s.num}</span>
              </div>
              <div className="flex-1 pt-1.5">
                <h3 className="text-[17px] font-bold text-foreground leading-[1.35] mb-2">
                  {s.title}
                </h3>
                <p className="text-[15px] text-muted-foreground leading-[1.8]">{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default ProcessSection;

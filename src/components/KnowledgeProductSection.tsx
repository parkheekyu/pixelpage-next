"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Reveal from "@/components/Reveal";

/* ── 일반 상품 카드 ── */
const ProductCard = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const steps = [
    { icon: "📸", step: "사진 한 장", sub: "제품이 눈에 보인다" },
    { icon: "💰", step: "가격 비교", sub: "싸면 산다" },
    { icon: "⚡", step: "바로 결제", sub: "고민 시간 30초" },
  ];

  return (
    <div ref={ref} className="rounded-2xl border border-neutral-200 bg-white shadow-card overflow-hidden">
      <div className="px-7 py-5 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-neutral-300" />
          <span className="text-[15px] font-semibold text-neutral-800">일반 상품</span>
        </div>
        <span className="text-[11px] text-neutral-400 font-medium tracking-[0.05em]">SIMPLE</span>
      </div>

      <div className="p-7">
        <div className="relative">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: 0.15 + i * 0.12 }}
              className="relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute left-[22px] top-[48px] w-px h-[28px] bg-neutral-200" />
              )}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-[44px] h-[44px] rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-[18px] shrink-0 relative z-10">
                  {s.icon}
                </div>
                <div className="flex-1">
                  <span className="text-[14px] font-semibold text-neutral-800 block">{s.step}</span>
                  <span className="text-[12px] text-neutral-400">{s.sub}</span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: "100%" } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.15 }}
                  className="absolute bottom-0 left-[60px] right-0 h-px bg-neutral-100"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.35, delay: 0.65 }}
          className="mt-3 bg-neutral-50 rounded-xl p-4 text-center border border-neutral-100"
        >
          <span className="text-[22px] block mb-1">✅</span>
          <span className="text-[13px] font-semibold text-neutral-700">사진만 잘 찍으면 팔린다</span>
        </motion.div>
      </div>
    </div>
  );
};

/* ── 지식 상품 카드 ── */
const KnowledgeCard = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const steps = [
    { num: "01", step: "왜 이 사람에게?", sub: "전문성이 증명되어야 한다", accent: true },
    { num: "02", step: "왜 지금?", sub: "시급함이 설계되어야 한다", accent: true },
    { num: "03", step: "정말 효과가 있을까?", sub: "결과가 미리 보여야 한다", accent: true },
    { num: "04", step: "비싼 거 아닌가?", sub: "가치 대비 가격이 느껴져야 한다", accent: true },
  ];

  return (
    <div ref={ref} className="rounded-2xl border-2 border-primary/30 bg-white shadow-card overflow-hidden relative">
      {/* Glow */}
      <div className="absolute -top-20 -right-20 w-[200px] h-[200px] rounded-full bg-primary/[0.06] blur-[80px] pointer-events-none" />

      <div className="px-7 py-5 border-b border-primary/10 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-[15px] font-semibold text-neutral-800">지식 상품</span>
        </div>
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full tracking-[0.04em]">다르게 팔아야 합니다</span>
      </div>

      <div className="p-7 relative z-10">
        <div className="relative">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.12 }}
              className="relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute left-[22px] top-[48px] w-px h-[24px] bg-primary/20" />
              )}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-[44px] h-[44px] rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 relative z-10">
                  <span className="text-[12px] font-bold text-primary tracking-tight">{s.num}</span>
                </div>
                <div className="flex-1 bg-primary/[0.03] border border-primary/[0.08] rounded-lg px-4 py-3">
                  <span className="text-[14px] font-semibold text-foreground block">{s.step}</span>
                  <span className="text-[12px] text-muted-foreground">{s.sub}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.35, delay: 0.75 }}
          className="mt-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 text-center border border-primary/15"
        >
          <span className="text-[13px] font-bold text-primary">설득 구조 없이는 절대 팔리지 않습니다</span>
        </motion.div>
      </div>
    </div>
  );
};

/* ── 가운데 화살표 ── */
const CenterArrow = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="hidden lg:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
    >
      <div className="w-14 h-14 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center shadow-lg">
        <span className="text-[18px] text-primary font-bold">VS</span>
      </div>
    </motion.div>
  );
};

/* ── Section ── */
const KnowledgeProductSection = () => (
  <section className="py-28 lg:py-36 bg-background">
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-20 lg:mb-28">
        <h2 className="font-serif break-keep text-[clamp(32px,4.5vw,56px)] font-semibold text-foreground leading-[1.35] tracking-[-0.01em]">
          지식 상품은<br />다르게 팔아야 합니다.
        </h2>
        <p className="text-[19px] text-muted-foreground max-w-[540px] mx-auto leading-[1.9] mt-5">
          제품은 사진 한 장으로 팔리지만,<br />
          강의는 왜 지금, 왜 당신에게 배워야 하는지가<br />
          설득되어야 팝니다.
        </p>
      </Reveal>

      <div className="relative">
        <CenterArrow />
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
            <ProductCard />
            <KnowledgeCard />
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-16 lg:mt-20 text-center">
        <p className="text-[19px] font-serif text-foreground leading-[1.9] max-w-[560px] mx-auto">
          그래서 우리는 <span className="text-primary font-semibold">설득 구조부터 설계</span>합니다.<br />
          지식을 파는 마케팅은, 접근 자체가 달라야 합니다.
        </p>
      </Reveal>
    </div>
  </section>
);

export default KnowledgeProductSection;

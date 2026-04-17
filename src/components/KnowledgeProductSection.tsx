"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Reveal from "@/components/Reveal";

/* ── 일반 상품 vs 지식 상품 비교 카드 ── */
const ProductCard = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="rounded-2xl border border-neutral-200 bg-white shadow-card overflow-hidden">
      <div className="p-6 lg:p-7">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-[16px]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="16" height="16" rx="2" stroke="#94a3b8" strokeWidth="1.5"/><rect x="4" y="4" width="10" height="10" rx="1" fill="#e2e8f0"/></svg>
          </div>
          <span className="text-[14px] font-semibold text-neutral-800">일반 상품</span>
        </motion.div>

        {/* Flow */}
        <div className="space-y-3">
          {[
            { step: "사진 한 장", sub: "제품이 보인다" },
            { step: "가격 비교", sub: "싸면 산다" },
            { step: "바로 결제", sub: "고민 시간 30초" },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, x: -8 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.25, delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-[11px] font-bold text-neutral-500 shrink-0">{i + 1}</div>
              <div className="flex-1 bg-neutral-50 rounded-lg px-4 py-2.5">
                <span className="text-[13px] font-medium text-neutral-700 block">{s.step}</span>
                <span className="text-[11px] text-neutral-400">{s.sub}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mt-5 bg-neutral-50 rounded-lg px-4 py-3 text-center"
        >
          <span className="text-[12px] text-neutral-500">결과: 사진만 잘 찍으면 팔린다</span>
        </motion.div>
      </div>
    </div>
  );
};

const KnowledgeCard = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="rounded-2xl border-2 border-primary/30 bg-white shadow-card overflow-hidden">
      <div className="p-6 lg:p-7">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[16px]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 6l7 4 7-4-7-4z" stroke="currentColor" strokeWidth="1.5" className="text-primary"/><path d="M2 12l7 4 7-4" stroke="currentColor" strokeWidth="1.5" className="text-primary" opacity="0.5"/><path d="M2 9l7 4 7-4" stroke="currentColor" strokeWidth="1.5" className="text-primary" opacity="0.75"/></svg>
          </div>
          <span className="text-[14px] font-semibold text-neutral-800">지식 상품</span>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full ml-auto">다르게 팔아야 합니다</span>
        </motion.div>

        {/* Flow */}
        <div className="space-y-3">
          {[
            { step: "왜 이 사람에게?", sub: "전문성이 증명되어야 한다", color: "bg-primary/5 border-primary/10" },
            { step: "왜 지금?", sub: "시급함이 설계되어야 한다", color: "bg-primary/5 border-primary/10" },
            { step: "효과가 있을까?", sub: "결과가 미리 보여야 한다", color: "bg-primary/5 border-primary/10" },
            { step: "비싼 거 아닌가?", sub: "가치 대비 가격이 느껴져야 한다", color: "bg-primary/5 border-primary/10" },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, x: -8 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.25, delay: 0.25 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">{i + 1}</div>
              <div className={`flex-1 rounded-lg px-4 py-2.5 border ${s.color}`}>
                <span className="text-[13px] font-medium text-foreground block">{s.step}</span>
                <span className="text-[11px] text-muted-foreground">{s.sub}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="mt-5 bg-primary/5 border border-primary/10 rounded-lg px-4 py-3 text-center"
        >
          <span className="text-[12px] text-primary font-semibold">결과: 설득 구조 없이는 팔리지 않는다</span>
        </motion.div>
      </div>
    </div>
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

      <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
          <ProductCard />
          <KnowledgeCard />
        </div>
      </Reveal>

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

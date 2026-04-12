"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Reveal from "@/components/Reveal";
import iconOk from "@/assets/icon-ok.svg";

/* -- 보통 대행사: 끊긴 퍼널 -- */
const AgencyFunnel = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const layers = [
    { label: "광고 세팅", width: "100%", active: true },
    { label: "노출", width: "85%", active: true },
    { label: "클릭", width: "70%", active: true },
    { label: "전환 설계", width: "55%", active: false },
    { label: "리텐션", width: "40%", active: false },
    { label: "매출", width: "25%", active: false },
  ];

  return (
    <div ref={ref} className="rounded-2xl border border-border bg-card shadow-card overflow-hidden p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
        <span className="text-[17px] font-semibold text-muted-foreground">보통 광고 대행사</span>
      </div>
      <p className="text-[14px] text-muted-foreground/70 mb-6">광고 세팅 &rarr; 보고서 &rarr; 끝</p>

      <div className="flex flex-col items-center gap-1.5">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.label}
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={inView ? { opacity: layer.active ? 1 : 0.35, scaleX: 1 } : {}}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.08 }}
            style={{ width: layer.width }}
            className="origin-center"
          >
            <div
              className={`rounded-md px-4 py-2.5 text-center ${
                layer.active
                  ? "bg-secondary border border-border"
                  : "border border-dashed border-border/60"
              }`}
            >
              <span className={`text-[14px] font-medium ${
                layer.active ? "text-muted-foreground" : "text-muted-foreground/30 line-through"
              }`}>
                {layer.label}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.3, delay: 0.7 }}
        className="mt-6 text-center"
      >
        <span className="text-[15px] font-medium text-muted-foreground bg-secondary px-4 py-2 rounded-full">
          클릭 이후는 알아서 하세요 &#x1F44B;
        </span>
      </motion.div>
    </div>
  );
};

/* -- 픽셀페이지: AARRR 풀퍼널 -- */
const PixelPageFunnel = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const layers = [
    { label: "Acquisition", sub: "유입 설계 \u00B7 채널 최적화", width: "100%", opacity: 0.65 },
    { label: "Activation", sub: "첫 경험 설계 \u00B7 랜딩 최적화", width: "85%", opacity: 0.72 },
    { label: "Retention", sub: "CRM 자동화 \u00B7 리텐션 루프", width: "70%", opacity: 0.8 },
    { label: "Referral", sub: "바이럴 설계 \u00B7 공유 트리거", width: "55%", opacity: 0.9 },
    { label: "Revenue", sub: "매출 전환 \u00B7 ROAS 극대화", width: "40%", opacity: 1 },
  ];

  return (
    <div ref={ref} className="rounded-2xl border border-primary/20 bg-card shadow-card overflow-hidden p-6 lg:p-8 ring-1 ring-primary/10">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
        <span className="text-[17px] font-semibold text-foreground">픽셀페이지</span>
        <span className="ml-auto text-[12px] bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full tracking-wide">FULL FUNNEL</span>
      </div>
      <p className="text-[14px] text-muted-foreground mb-6">데이터 기반 &middot; 풀퍼널 설계</p>

      <div className="flex flex-col items-center gap-1">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.label}
            initial={{ opacity: 0, scaleX: 0.3, y: -8 }}
            animate={inView ? { opacity: 1, scaleX: 1, y: 0 } : {}}
            transition={{
              duration: 0.4,
              delay: 0.15 + i * 0.13,
              type: "spring",
              damping: 20,
              stiffness: 180,
            }}
            style={{ width: layer.width }}
            className="origin-center"
          >
            <div
              className="rounded-lg px-4 py-3 text-center bg-primary"
              style={{ opacity: layer.opacity }}
            >
              <span className="text-[14px] font-bold text-primary-foreground tracking-wide">{layer.label}</span>
              <span className="block text-[12px] text-primary-foreground/60 mt-0.5">{layer.sub}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.9 }}
        className="mt-6 bg-primary/5 border border-primary/15 rounded-xl px-5 py-3 text-center"
      >
        <span className="text-[14px] text-primary font-semibold">
          모든 단계를 측정 &middot; 최적화 &rarr; 결과당 비용 최대 83% &darr;
        </span>
      </motion.div>
    </div>
  );
};

/* -- Comparison Section -- */
const ComparisonSection = () => {
  return (
    <section className="py-28 lg:py-36 bg-surface-white">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-20 lg:mb-28">
          <img src={iconOk.src} alt="" className="w-10 h-10 mb-5 mx-auto" />
          <h2 className="font-serif text-[clamp(36px,5vw,64px)] font-semibold text-foreground leading-[1.2] tracking-[-0.02em]">
            일반 마케팅 회사와는<br />조금 다릅니다.
          </h2>
          <p className="text-[17px] text-muted-foreground max-w-[520px] mx-auto leading-[1.9] mt-6">
            광고 세팅만 하고 끝나는 대행이 아닙니다.<br />
            AARRR 퍼널 전체를 데이터로 설계하고 최적화합니다.
          </p>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
            <AgencyFunnel />
            <PixelPageFunnel />
          </div>
        </Reveal>

        <Reveal className="mt-16 lg:mt-20 text-center">
          <p className="text-[19px] font-serif text-foreground leading-[1.9] max-w-[560px] mx-auto">
            &ldquo;광고비만 태우고 끝&rdquo;이 아니라,<br />
            <span className="text-primary font-semibold">유입부터 매출까지</span> 전 과정을 그로스합니다.
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default ComparisonSection;

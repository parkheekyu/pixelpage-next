"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";

const services = [
  {
    label: "Agency",
    title: "마케팅 대행",
    desc: "광고·랜딩·CRM 풀패키지 운영",
    href: "/services/performance",
    bg: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 55%, #d97706 100%)",
    pattern:
      "radial-gradient(circle at 25% 80%, rgba(255,255,255,0.22) 0%, transparent 55%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.14) 0%, transparent 50%), radial-gradient(circle at 60% 60%, rgba(217,119,6,0.35) 0%, transparent 60%)",
  },
  {
    label: "Consulting",
    title: "마케팅 컨설팅",
    desc: "퍼널 진단 + 실행 플랜 제공",
    href: "/services/branded",
    bg: "linear-gradient(135deg, #4f46e5 0%, #6366f1 55%, #7c3aed 100%)",
    pattern:
      "radial-gradient(circle at 75% 80%, rgba(255,255,255,0.22) 0%, transparent 55%), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.14) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(124,58,237,0.4) 0%, transparent 60%)",
  },
];

const ServiceIntroSection = () => (
  <section className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-16 lg:mb-20">
        <h2 className="break-keep text-[clamp(34px,4.5vw,56px)] font-bold text-foreground leading-[1.2] tracking-[-0.03em] mb-5">
          어떤 서비스가 필요하세요?
        </h2>
        <p className="text-[15px] lg:text-[16px] text-muted-foreground leading-[1.8] max-w-[560px] mx-auto">
          마케팅 대행과 컨설팅 — 본인 상황에 맞는 형태를 선택하세요.<br />
          어느 쪽이든 무료 진단부터 시작합니다.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_minmax(200px,240px)] gap-5 lg:gap-6 items-stretch">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={s.href}
              className="group relative overflow-hidden rounded-3xl aspect-[4/5] lg:aspect-auto lg:min-h-[560px] flex flex-col justify-between p-8 lg:p-9 transition-transform duration-300 hover:-translate-y-1"
              style={{ background: s.bg }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: s.pattern }} />
              <div className="relative">
                <span className="text-[12px] font-semibold tracking-[0.14em] uppercase text-white/85">
                  {s.label}
                </span>
              </div>
              <div className="relative">
                <h3 className="break-keep text-[clamp(22px,2.5vw,32px)] font-bold text-white leading-[1.25] tracking-[-0.02em] mb-2.5">
                  {s.title}
                </h3>
                <p className="text-[13px] lg:text-[14px] text-white/80 leading-[1.6]">
                  {s.desc}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}

        {/* CTA block */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="lg:min-h-[560px] flex flex-col justify-center items-start gap-6 px-2 lg:px-4 py-4"
        >
          <p className="break-keep text-[clamp(18px,1.8vw,22px)] font-bold text-foreground leading-[1.4] tracking-[-0.01em]">
            지금 바로<br />
            진단을 시작해 보세요!
          </p>
          <Link
            href="/consult"
            className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-[#0a0f1e] flex items-center justify-center hover:scale-110 transition-transform duration-300"
            aria-label="무료 진단 신청"
          >
            <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </Link>
        </motion.div>
      </div>
    </div>
  </section>
);

export default ServiceIntroSection;

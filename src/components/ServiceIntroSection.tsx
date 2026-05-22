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
    image: "/services/agency.png",
    // Fallback gradient if image missing — visually similar dark tone
    fallback: "linear-gradient(135deg, #1a2540 0%, #0f1729 100%)",
  },
  {
    label: "Consulting",
    title: "마케팅 컨설팅",
    desc: "퍼널 진단 + 실행 플랜 제공",
    href: "/services/branded",
    image: "/services/consulting.png",
    fallback: "linear-gradient(135deg, #2a1f4a 0%, #150c2a 100%)",
  },
];

const ServiceIntroSection = () => (
  <section className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-16 lg:mb-20">
        <p className="text-[12px] font-semibold tracking-[0.18em] text-blue-500 mb-5">
          서비스 소개
        </p>
        <h2 className="break-keep text-[clamp(34px,4.5vw,56px)] font-bold text-foreground leading-[1.2] tracking-[-0.03em]">
          어떤 서비스가 필요하세요?
        </h2>
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
              style={{ background: s.fallback }}
            >
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${s.image})` }}
              />
              {/* Dark gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/85" />

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

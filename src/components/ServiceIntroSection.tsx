"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";

const services = [
  {
    label: "Agency",
    title: "마케팅 대행",
    desc: "광고·랜딩·CRM을 하나의 팀이 처음부터 끝까지 운영합니다.",
    href: "/services/performance",
    bg: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 55%, #d97706 100%)",
    pattern:
      "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.18) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 45%)",
  },
  {
    label: "Consulting",
    title: "마케팅 컨설팅",
    desc: "퍼널 진단 리포트와 실행 플랜으로 인하우스 팀의 실행을 돕습니다.",
    href: "/services/branded",
    bg: "linear-gradient(135deg, #4f46e5 0%, #6366f1 55%, #7c3aed 100%)",
    pattern:
      "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.18) 0%, transparent 50%), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0%, transparent 45%)",
  },
];

const ServiceIntroSection = () => (
  <section className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-16">
        <p className="text-[12px] font-semibold tracking-[0.18em] uppercase text-blue-500 mb-5">
          서비스 소개
        </p>
        <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.18] tracking-[-0.03em]">
          어떤 서비스가 필요하세요?
        </h2>
      </Reveal>
      <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
        {services.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="group relative overflow-hidden rounded-3xl aspect-[4/5] lg:aspect-[5/6] flex flex-col justify-between p-10 lg:p-12 transition-transform duration-300 hover:-translate-y-1"
            style={{ background: s.bg }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: s.pattern }} />
            <div className="relative flex items-start justify-between">
              <span className="text-[13px] font-semibold tracking-[0.1em] text-white/85">
                {s.label}
              </span>
              <div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="relative">
              <h3 className="break-keep text-[clamp(28px,3.5vw,44px)] font-bold text-white leading-[1.18] tracking-[-0.025em] mb-4">
                {s.title}
              </h3>
              <p className="text-[15px] lg:text-[16px] text-white/85 leading-[1.7] max-w-[360px]">
                {s.desc}
              </p>
            </div>
          </Link>
        ))}
      </Reveal>
    </div>
  </section>
);

export default ServiceIntroSection;

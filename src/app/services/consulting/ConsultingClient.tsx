"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, FileSearch, AlertCircle, Map, Rocket } from "lucide-react";
import Reveal from "@/components/Reveal";

const HeroSection = () => (
  <section className="relative min-h-screen overflow-hidden">
    {/* 배경 그라데이션 */}
    <div
      className="absolute inset-0 z-0"
      style={{
        background:
          "linear-gradient(105deg, #05070d 0%, #0a0f1e 40%, #101830 70%, #182245 100%)",
      }}
    />
    <div className="absolute top-[25%] right-[10%] w-[420px] h-[420px] rounded-full bg-blue-500/[0.08] blur-[160px] pointer-events-none z-0" />

    <div className="relative z-10 max-w-[1240px] mx-auto w-full min-h-screen flex items-center px-6 lg:px-12">
      <div className="w-full text-center lg:text-left lg:max-w-[640px]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[12px] text-white/35 hover:text-blue-400 transition-colors mb-10 opacity-0 animate-fade-up stagger-1"
        >
          <ArrowLeft className="w-3 h-3" /> 홈으로
        </Link>
        <p className="text-[12px] font-semibold tracking-[0.18em] uppercase text-blue-400 mb-6 opacity-0 animate-fade-up stagger-1">
          Marketing Consulting
        </p>
        <h1 className="break-keep text-[clamp(36px,6vw,72px)] font-bold leading-[1.12] tracking-[-0.03em] text-white mb-7 opacity-0 animate-fade-up stagger-2">
          방향만 잡고<br />
          가셔도 괜찮습니다
        </h1>
        <p className="text-[16px] md:text-[18px] text-white/55 leading-[1.85] max-w-[480px] mb-10 mx-auto lg:mx-0 opacity-0 animate-fade-up stagger-3">
          퍼널 진단부터 실행 플랜까지,<br />
          인하우스 팀이 직접 실행하실 수 있도록 돕습니다.
        </p>
        <div className="opacity-0 animate-fade-up stagger-4">
          <Link
            href="/consult"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0a0f1e] text-[15px] font-bold rounded-xl hover:bg-white/90 transition-all"
          >
            무료 마케팅 진단 받기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const offerings = [
  {
    icon: FileSearch,
    title: "광고 계정 정밀 진단",
    body: "Meta·Google·토스 등 운영 중인 광고 계정을 구조부터 점검. 어디서 예산이 새고 있는지, 어떤 캠페인을 살리고 끌어야 하는지 데이터로 짚어드립니다.",
  },
  {
    icon: AlertCircle,
    title: "퍼널 누수 분석 리포트",
    body: "광고 → 랜딩 → CRM 전 구간에서 어디가 끊겼는지 분석. 클릭은 나오는데 매출이 안 나오는 이유, 신청은 있는데 전환이 안 되는 이유를 단계별로 정리합니다.",
  },
  {
    icon: Map,
    title: "채널·메시지 전략 설계",
    body: "타겟 페르소나, 핵심 메시지, 채널 우선순위, 예산 배분안까지 — 인하우스 팀이 바로 실행할 수 있는 전략 문서로 전달합니다.",
  },
  {
    icon: Rocket,
    title: "실행 플랜 + 핸드오프",
    body: "단순 자료 전달이 아니라, 인하우스 팀과 합을 맞춥니다. 캠페인 설계, 소재 가이드, KPI 트래킹까지 실행 가능한 형태로 인계합니다.",
  },
];

const OfferingsSection = () => (
  <section className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-16 lg:mb-20">
        <p className="text-[12px] font-semibold tracking-[0.18em] text-blue-500 mb-5">
          컨설팅 패키지
        </p>
        <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.18] tracking-[-0.03em] mb-6">
          무엇을 받게 되시나요?
        </h2>
        <p className="text-[17px] md:text-[18px] text-muted-foreground leading-[1.85] max-w-[540px] mx-auto">
          단순 조언이 아닌, 바로 실행 가능한<br />
          데이터·문서·전략을 전달합니다.
        </p>
      </Reveal>

      <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {offerings.map((o) => {
          const Icon = o.icon;
          return (
            <div
              key={o.title}
              className="bg-[#fbfbfb] border border-[#e5e7eb] rounded-2xl p-8 lg:p-10"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                <Icon className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-[20px] lg:text-[22px] font-bold text-foreground leading-[1.35] mb-3">
                {o.title}
              </h3>
              <p className="text-[15px] lg:text-[16px] text-muted-foreground leading-[1.85]">
                {o.body}
              </p>
            </div>
          );
        })}
      </Reveal>
    </div>
  </section>
);

const WhoSection = () => (
  <section className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-14">
        <p className="text-[12px] font-semibold tracking-[0.18em] text-blue-500 mb-5">
          이런 분께 권합니다
        </p>
        <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.18] tracking-[-0.03em]">
          대행보다 컨설팅이 맞는 경우
        </h2>
      </Reveal>

      <Reveal className="max-w-[760px] mx-auto space-y-3">
        {[
          "인하우스 마케팅 팀이 있고, 실행은 직접 하고 싶을 때",
          "지금 대행사가 있지만 구조적 문제를 객관적으로 진단받고 싶을 때",
          "광고는 돌리고 있는데 매출과 연결되지 않는 이유를 알고 싶을 때",
          "큰 캠페인 전 전략 방향을 외부 시각으로 검증받고 싶을 때",
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-start gap-4 bg-white border border-[#e5e7eb] rounded-2xl px-6 py-5"
          >
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[13px] font-bold mt-0.5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-[15px] lg:text-[16px] text-foreground leading-[1.7]">{t}</p>
          </div>
        ))}
      </Reveal>
    </div>
  </section>
);

const CtaSection = () => (
  <section className="relative overflow-hidden">
    <div
      className="absolute inset-0 z-0"
      style={{
        background:
          "linear-gradient(135deg, #05070d 0%, #0a0f1e 40%, #131b34 75%, #1d2a55 100%)",
      }}
    />
    <div className="absolute top-[20%] right-[10%] w-[420px] h-[420px] rounded-full bg-blue-500/[0.10] blur-[160px] pointer-events-none z-0" />

    <div className="relative z-10 py-28 lg:py-40">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12 text-center">
        <Reveal>
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-white leading-[1.12] tracking-[-0.03em] mb-5">
            먼저 무료 진단부터<br />받아보세요.
          </h2>
          <p className="text-[17px] md:text-[19px] text-white/65 leading-[1.85] max-w-[560px] mx-auto mb-10">
            30분 통화로 현재 상황을 함께 짚어드립니다.<br />
            진단 결과를 보고 컨설팅이 맞을지 함께 판단해도 늦지 않습니다.
          </p>
          <Link
            href="/consult"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-[#0a0f1e] text-[15px] font-bold rounded-xl hover:bg-white/90 hover:-translate-y-0.5 transition-all"
          >
            무료 마케팅 진단 신청하기 <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </div>
  </section>
);

const ConsultingClient = () => (
  <div>
    <HeroSection />
    <OfferingsSection />
    <WhoSection />
    <CtaSection />
  </div>
);

export default ConsultingClient;

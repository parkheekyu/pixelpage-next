"use client";

import { ArrowRight, ArrowLeft, AlertTriangle, TrendingUp, Layers, BarChart3, Video } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import illustHero from "@/assets/illust-performance-hero.png";
import iconOk from "@/assets/icon-ok.svg";
import iconRocket from "@/assets/icon-rocket.svg";
import iconFileForm from "@/assets/icon-file-form.svg";
import iconTrophy from "@/assets/icon-trophy.svg";
import {
  AudienceOverlapMockup,
  BudgetScalingMockup,
  CreativeLifecycleMockup,
} from "@/components/PerformanceMockups";

import dynamic from "next/dynamic";
const HeroLineArt = dynamic(() => import("@/components/HeroLineArt"), { ssr: false });

/* --------------- Section 01 - Hero --------------- */
const HeroSection = () => (
  <section className="relative min-h-screen flex items-center pt-32 pb-20 bg-dark overflow-hidden">
    {/* Subtle gradient glow */}
    <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-primary/[0.05] blur-[140px] pointer-events-none" />

    <div className="relative z-10 max-w-[1240px] mx-auto w-full px-6 lg:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-cream/35 hover:text-primary transition-colors mb-16 opacity-0 animate-fade-up stagger-1">
            <ArrowLeft className="w-3 h-3" /> 홈으로
          </Link>
          <p className="text-[13px] tracking-[0.2em] uppercase text-cream/25 mb-8 opacity-0 animate-fade-up stagger-1">
            Performance Marketing
          </p>
          <h1 className="font-serif text-[clamp(42px,5.5vw,72px)] font-medium leading-[1.15] tracking-[-0.03em] text-cream mb-8 opacity-0 animate-fade-up stagger-2">
            광고비 낭비는<br />
            <span className="text-primary">구조</span>를 모르기<br />때문입니다
          </h1>
          <p className="text-[17px] text-cream/35 leading-[1.9] max-w-[400px] mb-12 opacity-0 animate-fade-up stagger-3">
            소재 기획부터 억 단위 예산 집행까지 — 감이 아닌 구조로 운영합니다.
          </p>
          <div className="flex items-center gap-5 opacity-0 animate-fade-up stagger-4">
            <Link href="/consult" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground text-[15px] font-medium tracking-[0.01em] hover:bg-gold-light transition-all rounded-md">
              무료 광고 진단 받기
            </Link>
          </div>
        </div>
        <div className="hidden lg:flex justify-center items-center relative">
          <HeroLineArt />
        </div>
      </div>
    </div>

    {/* Bottom explore link */}
    <div className="absolute bottom-10 left-0 right-0 z-10">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12 flex items-center gap-3">
        <span className="text-[12px] tracking-[0.12em] uppercase text-cream/20">스크롤</span>
        <div className="w-[50px] h-px bg-primary/30" style={{ animation: 'scroll-line 2s ease infinite' }} />
      </div>
    </div>
  </section>
);

/* --------------- Section 02 - Pain --------------- */
const PainSection = () => {
  const pains = [
    "예산 올렸더니 CPA도 같이 올라갔어요",
    "잘 되던 광고가 갑자기 죽어버렸습니다",
    "대행사 보고서가 조회수 스크린샷뿐이에요",
    "소재를 몇 개나 만들어야 할지 모르겠어요",
  ];

  return (
    <section className="py-28 lg:py-36 bg-surface-white">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-16 lg:mb-20">
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">Common Problems</p>
          <h2 className="font-serif text-[clamp(36px,5vw,64px)] font-semibold text-foreground leading-[1.2] tracking-[-0.02em]">
            광고는 돌리고 있는데,<br />뭐가 문제인지 모르겠습니다
          </h2>
          <p className="text-[17px] text-muted-foreground max-w-[480px] mx-auto leading-[1.9] mt-6">
            이런 경험 있으시죠?
          </p>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[760px] mx-auto">
            {pains.map((p, i) => (
              <div key={i} className="flex items-start gap-3 border border-border rounded-xl p-6 bg-card shadow-card">
                <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-[16px] text-foreground leading-[1.8]">{p}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-14 text-center">
          <p className="text-[19px] font-serif text-foreground leading-[1.9] max-w-[560px] mx-auto">
            이 질문들에 즉시 답할 수 없다면,<br />
            지금 광고는 <span className="text-primary font-semibold">감으로 돌아가고 있는 겁니다.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
};

/* --------------- Section 03 - Structure --------------- */
const StructureSection = () => {
  const cards = [
    {
      title: "광고 세트를 나눴는데\n왜 성과가 안 나올까?",
      body: "타겟을 세분화했는데 오히려 CPA가 올라갑니다. 내 광고끼리 같은 사람을 놓고 경쟁하고 있기 때문입니다. 오디언스 오버랩을 모르면 예산을 쪼갤수록 비효율이 커집니다.",
      mockup: <AudienceOverlapMockup />,
    },
    {
      title: "예산을 올리면\n성과도 같이 오를까?",
      body: "잘 되는 캠페인의 예산을 올리면 성과도 비례해서 오를 것 같지만, 현실은 다릅니다. 단계별로 어떤 일이 벌어지는지 알아야 예산을 안전하게 키울 수 있습니다.",
      mockup: <BudgetScalingMockup />,
    },
    {
      title: "왜 잘되던 광고가\n갑자기 죽을까?",
      body: "모든 광고 소재에는 수명이 있습니다. 성과가 좋을수록 빠르게 소진되고, 그 타이밍을 놓치면 예산만 낭비됩니다. 이 구조를 알면 죽기 전에 다음 판을 준비할 수 있습니다.",
      mockup: <CreativeLifecycleMockup />,
    },
  ];

  return (
    <section className="py-28 lg:py-36 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-20 lg:mb-28">
          <img src={iconRocket.src} alt="" className="w-10 h-10 mb-5 mx-auto" />
          <h2 className="font-serif text-[clamp(36px,5vw,64px)] font-semibold text-foreground leading-[1.2] tracking-[-0.02em]">
            대부분의 광고 실패는<br />세팅 문제가 아닙니다.
          </h2>
          <p className="text-[17px] text-muted-foreground max-w-[520px] mx-auto leading-[1.9] mt-6">
            구조 이해 없이 최적화를 시도한 결과입니다.
          </p>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="mb-6">
                  {card.mockup}
                </div>
                <h3 className="font-serif text-[22px] lg:text-[26px] font-semibold text-foreground mb-3 leading-[1.35] tracking-[-0.01em] whitespace-pre-line">
                  {card.title}
                </h3>
                <p className="text-[15px] text-muted-foreground leading-[1.9]">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* CTR x CPA Matrix */}
        <Reveal className="mt-24 lg:mt-36 text-center">
          <h3 className="font-serif text-[clamp(26px,3.5vw,36px)] font-semibold text-foreground mb-10 tracking-[-0.01em]">
            CTR &times; CPA 판단 매트릭스
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[640px] mx-auto">
            {[
              { ctr: "High", cpa: "Low", action: "전력 스케일", desc: "예산 올려라", bg: "bg-primary/10", border: "border-primary/20", text: "text-primary" },
              { ctr: "High", cpa: "High", action: "타겟 조정", desc: "입찰 경쟁이 문제", bg: "bg-gold/10", border: "border-gold/20", text: "text-gold" },
              { ctr: "Low", cpa: "Low", action: "소재 교체", desc: "새 소재 투입", bg: "bg-secondary", border: "border-border", text: "text-muted-foreground" },
              { ctr: "Low", cpa: "High", action: "즉시 중지", desc: "끄고 점검", bg: "bg-destructive/10", border: "border-destructive/20", text: "text-destructive" },
            ].map(m => (
              <div key={m.action} className={`rounded-xl border p-6 text-left ${m.bg} ${m.border}`}>
                <span className={`text-[12px] font-medium ${m.text} opacity-70`}>CTR {m.ctr} &middot; CPA {m.cpa}</span>
                <h4 className={`text-[18px] font-bold mt-2 mb-1 ${m.text}`}>{m.action}</h4>
                <p className={`text-[14px] ${m.text} opacity-60`}>{m.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* --------------- Section 04 - Differentiation --------------- */
const DifferentiationSection = () => {
  const items = [
    { icon: <Video className="w-5 h-5" />, t: "크리에이티브 소재 기획 \u00B7 제작", d: "카피 \u00B7 이미지 \u00B7 영상까지 인하우스 제작. 외주 없이 빠르게 테스트합니다." },
    { icon: <Layers className="w-5 h-5" />, t: "구조 기반 캠페인 설계", d: "3단 구조 \u00B7 오디언스 분리 \u00B7 소재 수명 관리 — 감이 아닌 시스템으로 운영합니다." },
    { icon: <TrendingUp className="w-5 h-5" />, t: "스케일링 & 예산 확장", d: "테스트 \u2192 검증 \u2192 확장의 단계적 스케일링. 예산을 10배 키워도 무너지지 않는 구조를 만듭니다." },
    { icon: <BarChart3 className="w-5 h-5" />, t: "데이터 기반 주간 리포트", d: "CTR \u00B7 CPA \u00B7 ROAS \u00B7 전환율 — 숫자로 판단하고 숫자로 보고합니다." },
  ];

  return (
    <section className="py-28 lg:py-36 bg-surface-beige">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-16 lg:mb-20">
          <img src={iconOk.src} alt="" className="w-10 h-10 mb-5 mx-auto" />
          <h2 className="font-serif text-[clamp(36px,5vw,64px)] font-semibold text-foreground leading-[1.2] tracking-[-0.02em]">
            소재 한 장부터<br />월 억 단위 예산 운용까지
          </h2>
          <p className="text-[17px] text-muted-foreground max-w-[480px] mx-auto leading-[1.9] mt-6">
            단순 집행을 넘어선 압도적 범위. 이 팀 하나면 됩니다.
          </p>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {items.map(item => (
              <div key={item.t} className="border border-border rounded-2xl p-8 bg-card shadow-card hover:shadow-card-hover transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-5">
                  {item.icon}
                </div>
                <h4 className="text-[18px] font-semibold text-foreground mb-3">{item.t}</h4>
                <p className="text-[15px] text-muted-foreground leading-[1.9]">{item.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* --------------- Section 05 - Social Proof --------------- */
const SocialProofSection = () => {
  const stats = [
    { metric: "ROAS", value: "8.4\u00D7", desc: "뷰티 커머스", sub: "월 광고비 3천만" },
    { metric: "CPA", value: "-62%", desc: "교육 플랫폼", sub: "캠페인 재설계 후" },
    { metric: "전환율", value: "3.2\u00D7", desc: "B2B SaaS", sub: "소재 교체 후 4주" },
  ];

  const cases = [
    { industry: "뷰티 커머스", challenge: "ROAS 2.0 정체", approach: "3단 구조 재설계 + 서사형 영상 소재", result: "ROAS 8.4\u00D7 달성", quote: "구조를 바꿨을 뿐인데 숫자가 완전히 달라졌습니다." },
    { industry: "교육 플랫폼", challenge: "CPA 지속 상승", approach: "오디언스 오버랩 제거 + A/B 소재 테스트", result: "CPA 62% 절감", quote: "같은 예산으로 두 배 넘게 모집할 수 있게 됐어요." },
    { industry: "B2B SaaS", challenge: "전환율 0.8%", approach: "소재 생애주기 관리 + 랜딩 최적화", result: "전환율 3.2배 향상", quote: "데이터로 모든 걸 설명해주니 신뢰가 갔습니다." },
  ];

  return (
    <section className="py-28 lg:py-36 bg-surface-white">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-16 lg:mb-20">
          <img src={iconTrophy.src} alt="" className="w-10 h-10 mb-5 mx-auto" />
          <h2 className="font-serif text-[clamp(36px,5vw,64px)] font-semibold text-foreground leading-[1.2] tracking-[-0.02em]">
            감이 아닌<br />
            <span className="text-primary">숫자로 증명합니다.</span>
          </h2>
        </Reveal>

        <Reveal className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {stats.map(s => (
              <div key={s.metric} className="text-center border border-border rounded-2xl p-8 bg-card shadow-card">
                <span className="text-[13px] text-muted-foreground tracking-[0.1em] uppercase">{s.metric}</span>
                <span className="block text-[52px] font-serif font-semibold text-foreground mt-2 tracking-[-0.03em]">{s.value}</span>
                <span className="block text-[15px] text-foreground font-medium mt-2">{s.desc}</span>
                <span className="block text-[13px] text-muted-foreground mt-1">{s.sub}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="space-y-0">
          {cases.map(c => (
            <Reveal key={c.industry}>
              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-16 py-12 border-t border-border items-start">
                <div>
                  <span className="text-[12px] text-muted-foreground tracking-[0.1em] uppercase">{c.industry}</span>
                  <h3 className="font-serif text-[22px] lg:text-[26px] font-medium text-foreground mt-2">과제: {c.challenge}</h3>
                </div>
                <div>
                  <p className="text-[17px] lg:text-[19px] text-foreground leading-[1.85] tracking-[-0.01em]">&ldquo;{c.quote}&rdquo;</p>
                  <p className="text-[14px] text-muted-foreground mt-3">{c.approach}</p>
                  <p className="text-[13px] text-primary font-semibold mt-2">{c.result}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* --------------- Section 06 - Process --------------- */
const ProcessSection = () => {
  const steps = [
    { n: "01", t: "광고 계정 & 현황 무료 진단", d: "현재 캠페인 구조, CPA 흐름, 소재 수명 분석 — 계약 전 공개" },
    { n: "02", t: "캠페인 구조 설계 & 소재 기획", d: "3단 구조 재설계 + 첫 소재 세트 제작 (이미지/영상)" },
    { n: "03", t: "실전 집행 & 주간 최적화", d: "CTR\u00B7CPA 매트릭스 기반 판단 \u2192 살릴지 끌지 교체할지 매주 결정" },
    { n: "04", t: "스케일링 & 월간 성과 보고", d: "이긴 구조를 복제하고 예산을 단계적으로 확장 — 수치로 증명" },
  ];

  return (
    <section className="py-28 lg:py-36 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-16 lg:mb-20">
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">Process</p>
          <h2 className="font-serif text-[clamp(36px,5vw,64px)] font-semibold text-foreground leading-[1.2] tracking-[-0.02em]">
            계약 후 연락이 끊기는<br />대행사에 지쳤다면 —
          </h2>
          <p className="text-[17px] text-muted-foreground max-w-[480px] mx-auto leading-[1.9] mt-6">
            저희는 다릅니다.
          </p>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map(s => (
              <div key={s.n} className="border border-border rounded-2xl p-7 bg-card shadow-card">
                <span className="text-[28px] font-serif font-bold text-primary/20 tracking-tight">{s.n}</span>
                <h3 className="text-[17px] font-semibold text-foreground mt-3 mb-3">{s.t}</h3>
                <p className="text-[15px] text-muted-foreground leading-[1.9]">{s.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* --------------- Section 07 - CTA --------------- */
const CtaSection = () => (
  <section className="py-28 lg:py-36 bg-surface-beige">
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal>
        <h2 className="font-serif text-[clamp(36px,5vw,64px)] font-semibold text-foreground leading-[1.2] tracking-[-0.02em] mb-5">
          지금 광고 계정,<br />무료로 진단해드립니다
        </h2>
        <p className="text-[19px] text-muted-foreground max-w-[480px] leading-[1.9] mb-10">
          10분이면 됩니다. 어디서 예산이 새고 있는지,
          다음 소재는 무엇을 테스트해야 하는지 —
          구조로 짚어드립니다.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/consult" className="inline-flex items-center gap-2 px-9 py-4 bg-primary text-primary-foreground text-[16px] font-medium tracking-[0.02em] hover:bg-gold-light transition-all rounded-md">
            무료 광고 진단 신청하기 <ArrowRight className="w-4.5 h-4.5" />
          </Link>
          <Link href="/cases" className="inline-flex items-center px-8 py-4 border border-border text-[16px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors rounded-md">
            포트폴리오 보기
          </Link>
        </div>
      </Reveal>
    </div>
  </section>
);

/* --------------- Page --------------- */
const PerformanceClient = () => (
  <div>
    <HeroSection />
    <PainSection />
    <StructureSection />
    <DifferentiationSection />
    <SocialProofSection />
    <ProcessSection />
    <CtaSection />
  </div>
);

export default PerformanceClient;

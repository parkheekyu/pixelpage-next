"use client";

import { motion } from "framer-motion";
import { Mail, MessageSquare, Check, TrendingUp, ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";

/* ─────────────────────────────────────────────────────────────
   Pipeline Illustration (flat, no shadow)
───────────────────────────────────────────────────────────── */

const Pipe = () => (
  <div className="relative w-3 h-16 lg:h-20 my-1">
    <div className="absolute inset-x-0 inset-y-0 mx-auto w-1.5 rounded-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-400" />
    <div className="absolute inset-x-0 inset-y-0 mx-auto w-3 rounded-full bg-blue-500/20 blur-[3px]" />
  </div>
);

const PipelineCard = ({
  label,
  dark = false,
  children,
}: {
  label: string;
  dark?: boolean;
  children: React.ReactNode;
}) => (
  <div
    className={`w-full max-w-[320px] rounded-2xl border ${
      dark ? "bg-[#0f1729] border-[#1e2746] text-white" : "bg-white border-[#e5e7eb] text-foreground"
    } px-6 py-5`}
  >
    <h4 className={`text-center text-[15px] font-bold mb-4 ${dark ? "text-white" : "text-foreground"}`}>
      {label}
    </h4>
    {children}
  </div>
);

const AdsCardVisual = () => (
  <PipelineCard label="Ads">
    <div className="flex items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-[#fbfbfb] border border-[#e5e7eb] flex items-center justify-center font-bold text-[20px]">
        <span className="bg-gradient-to-br from-[#4285f4] via-[#ea4335] to-[#fbbc04] bg-clip-text text-transparent">G</span>
      </div>
      <div className="w-12 h-12 rounded-xl bg-[#fbfbfb] border border-[#e5e7eb] flex items-center justify-center font-bold text-[18px] text-[#0866ff]">
        ∞
      </div>
      <div className="w-12 h-12 rounded-xl bg-[#0a66c2] flex items-center justify-center font-bold text-[15px] text-white">
        in
      </div>
    </div>
  </PipelineCard>
);

const LandingCardVisual = () => (
  <PipelineCard label="Landing">
    <div className="rounded-lg border border-[#e5e7eb] bg-[#fbfbfb] overflow-hidden">
      <div className="flex items-center gap-1 px-2 py-1.5 bg-white border-b border-[#e5e7eb]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#e5e7eb]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#e5e7eb]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#e5e7eb]" />
      </div>
      <div className="p-3">
        <div className="aspect-[16/8] rounded bg-gradient-to-br from-blue-200 via-blue-300 to-blue-500 mb-2.5" />
        <div className="space-y-1.5 mb-3">
          <div className="h-1.5 bg-[#e5e7eb] rounded w-full" />
          <div className="h-1.5 bg-[#e5e7eb] rounded w-4/5" />
        </div>
        <div className="bg-blue-500 text-white text-[10px] font-semibold rounded py-1.5 text-center flex items-center justify-center gap-1">
          Get Started <ArrowUpRight className="w-2.5 h-2.5" />
        </div>
      </div>
    </div>
  </PipelineCard>
);

const CrmCardVisual = () => (
  <PipelineCard label="CRM" dark>
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2 bg-[#1a2540] rounded-lg px-2.5 py-2">
          <div className="w-5 h-5 rounded-full bg-blue-500/30" />
          <div className="flex-1 flex gap-1">
            <div className="h-1.5 bg-white/15 rounded flex-1" />
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
      ))}
      <div className="flex items-center justify-center gap-3 pt-2">
        <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center">
          <Mail className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </div>
      </div>
    </div>
  </PipelineCard>
);

const SalesCardVisual = () => (
  <PipelineCard label="Sales / Revenue">
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-4 h-4 rounded-full bg-blue-500" />
          <div className="h-1.5 bg-[#e5e7eb] rounded flex-1" />
        </div>
        <div className="text-emerald-500 text-[18px] font-bold leading-none">$120,000</div>
      </div>
      <div className="flex items-end gap-1 h-12 relative">
        <div className="w-2 bg-blue-300 rounded-t" style={{ height: "30%" }} />
        <div className="w-2 bg-blue-400 rounded-t" style={{ height: "50%" }} />
        <div className="w-2 bg-blue-500 rounded-t" style={{ height: "75%" }} />
        <div className="w-2 bg-blue-600 rounded-t" style={{ height: "100%" }} />
        <TrendingUp className="absolute -top-1 -right-2 w-4 h-4 text-emerald-500" strokeWidth={2.5} />
      </div>
    </div>
  </PipelineCard>
);

const PipelineIllustration = () => (
  <div className="relative flex flex-col items-center">
    <AdsCardVisual />
    <Pipe />
    <LandingCardVisual />
    <Pipe />
    <CrmCardVisual />
    <Pipe />
    <SalesCardVisual />
    {/* Revenue Growth 뱃지 */}
    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f1729] text-white">
      <div className="flex flex-col leading-tight">
        <span className="text-[9px] text-white/60">Revenue Growth</span>
        <span className="text-[15px] font-bold text-emerald-400">+250%</span>
      </div>
      <ArrowUpRight className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Service text blocks
───────────────────────────────────────────────────────────── */

const services = [
  {
    name: "퍼포먼스 마케팅",
    tagline: "상담 신청을 만드는 광고",
    items: [
      { head: "구조 기반 캠페인 설계", body: "오디언스 오버랩 제거, 3단 구조 재설계 — 감이 아닌 데이터로 판단해요." },
      { head: "소재 기획 · 제작 · 교체", body: "소재 생애주기를 관리해요. 죽기 전에 다음 판을 준비합니다." },
      { head: "스케일링 & 예산 확장", body: "테스트 → 검증 → 확장. 예산을 10배 키워도 무너지지 않는 구조를 만들어요." },
    ],
  },
  {
    name: "랜딩페이지",
    tagline: "이탈을 막는 페이지",
    items: [
      { head: "광고 메시지 연계 설계", body: "광고로 들어온 사람이 이탈하지 않도록 메시지를 일치시켜요." },
      { head: "전환 UI/UX 최적화", body: "스크롤·클릭·체류시간을 모니터링하며 신청 버튼을 누르게 만들어요." },
      { head: "DB 수집 시스템 점검", body: "고객이 몰려왔을 때 준비가 됐는지 먼저 확인해요." },
    ],
  },
  {
    name: "CRM 자동화",
    tagline: "신청을 매출로 바꾸는 시퀀스",
    items: [
      { head: "행동 기반 자동화 퍼널 설계", body: "카카오 알림톡 · 이메일 · 문자, 각 리드에게 맞는 흐름으로 자동 분기해요." },
      { head: "육성 시퀀스 구축", body: "지금 당장 구매 안 한 리드도 타이밍 맞춰 다시 연결돼요." },
    ],
  },
];

const ServiceTextBlock = ({
  s,
  i,
}: {
  s: (typeof services)[number];
  i: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: 24 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
  >
    <span className="inline-block text-[11px] font-semibold tracking-[0.1em] uppercase text-blue-500 bg-blue-50 px-3 py-1 rounded-full mb-3">
      {`0${i + 1}`}
    </span>
    <h3 className="text-[22px] lg:text-[26px] font-bold text-foreground leading-[1.25] mb-1.5 tracking-[-0.02em]">
      {s.name}
    </h3>
    <p className="text-[15px] text-muted-foreground mb-6">{s.tagline}</p>
    <ul className="space-y-4">
      {s.items.map((it) => (
        <li key={it.head}>
          <p className="text-[14px] lg:text-[15px] font-bold text-foreground leading-[1.5] mb-1">
            • {it.head}
          </p>
          <p className="text-[13px] lg:text-[14px] text-muted-foreground leading-[1.75] pl-3">
            {it.body}
          </p>
        </li>
      ))}
    </ul>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────
   Main Section
───────────────────────────────────────────────────────────── */
const WhatWeDoSection = () => (
  <section className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-16 lg:mb-24">
        <p className="text-[12px] font-semibold tracking-[0.18em] text-blue-500 mb-5">
          무엇을 해드리나요
        </p>
        <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.18] tracking-[-0.03em] mb-6">
          광고부터 전환까지<br />끊기지 않게 연결해요.
        </h2>
        <p className="text-[17px] md:text-[18px] text-muted-foreground leading-[1.85] max-w-[560px] mx-auto">
          세 개를 따로 굴리면 반드시 어딘가 끊겨요.<br />
          픽셀페이지는 하나의 팀이 설계하고, 분석하고, 개선해요.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr] gap-12 lg:gap-20 items-start">
        {/* 좌측 — 파이프라인 일러스트 */}
        <div className="lg:sticky lg:top-32 flex justify-center">
          <PipelineIllustration />
        </div>
        {/* 우측 — 서비스 텍스트 3블록 + 마무리 */}
        <div className="space-y-14 lg:space-y-20">
          {services.map((s, i) => (
            <ServiceTextBlock key={s.name} s={s} i={i} />
          ))}
          {/* 마무리 카피 — Sales 카드 옆 */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-blue-100 bg-blue-50/50 p-7 lg:p-8"
          >
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-blue-500 mb-3">
              Outcome
            </p>
            <p className="text-[17px] lg:text-[20px] font-bold text-foreground leading-[1.5] tracking-[-0.015em]">
              이 모든 흐름이<br />매출로 연결돼요.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
);

export default WhatWeDoSection;

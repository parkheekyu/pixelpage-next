"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/Reveal";

/* ============================================================
   Section 01 · Hero
   ============================================================ */
const HeroSection = () => {
  const clients = ["Genesis", "LG Signature", "쭌난방", "충남도청", "해양경찰", "서울청년센터"];
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-32 bg-dark overflow-hidden">
      <div className="absolute top-[15%] right-[10%] w-[500px] h-[500px] rounded-full bg-primary/[0.05] blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-[1240px] mx-auto w-full px-6 lg:px-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-cream/35 hover:text-primary transition-colors mb-12 opacity-0 animate-fade-up stagger-1">
          <ArrowLeft className="w-3 h-3" /> 홈으로
        </Link>

        <p className="text-[13px] tracking-[0.2em] uppercase text-cream/25 mb-8 opacity-0 animate-fade-up stagger-1">
          Branded Content
        </p>

        <h1 className="font-serif break-keep text-[clamp(40px,5.5vw,72px)] font-semibold leading-[1.15] tracking-[-0.03em] text-cream mb-8 max-w-[900px] opacity-0 animate-fade-up stagger-2">
          영상을 만들어 드리는 게 아닙니다.<br />
          <span className="text-primary">브랜드가 팔리게</span> 만듭니다
        </h1>

        <p className="text-[19px] text-cream/45 leading-[1.9] max-w-[560px] mb-12 opacity-0 animate-fade-up stagger-3">
          기획부터 납품까지 — Genesis · LG Signature · 쭌난방 · 충남도청이 선택한 크리에이티브 파트너.
        </p>

        <div className="flex items-center gap-4 mb-16 opacity-0 animate-fade-up stagger-4">
          <Link href="/consult" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground text-[15px] font-medium tracking-[0.01em] hover:bg-gold-light transition-all rounded-md">
            무료 영상 전략 상담
          </Link>
          <a href="http://yoon6film.co.kr/services/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-7 py-3.5 border border-cream/15 text-cream/70 text-[15px] hover:border-cream/30 hover:text-cream transition-colors rounded-md">
            포트폴리오 전체 보기
          </a>
        </div>

        {/* Trust numbers */}
        <div className="flex flex-wrap gap-10 mb-14 opacity-0 animate-fade-up stagger-5">
          {[
            { n: "9년+", l: "현장 제작 경력" },
            { n: "90%", l: "재계약률" },
            { n: "4.5×", l: "상담 전환 증가" },
          ].map(k => (
            <div key={k.l}>
              <span className="text-[32px] font-serif font-semibold text-cream tracking-[-0.02em]">{k.n}</span>
              <span className="block text-[11px] text-cream/25 tracking-[0.08em] uppercase mt-1">{k.l}</span>
            </div>
          ))}
        </div>

        {/* Rolling clients */}
        <div className="relative overflow-hidden border-t border-cream/[0.06] pt-8 opacity-0 animate-fade-up stagger-6">
          <div className="flex gap-12 animate-marquee whitespace-nowrap">
            {[...clients, ...clients, ...clients].map((c, i) => (
              <span key={i} className="text-[15px] text-cream/30 tracking-[0.05em] font-medium shrink-0">{c}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ============================================================
   Section 02 · Pain
   ============================================================ */
const PainSection = () => {
  const pains = [
    { text: "제작비 썼는데 조회수만 나왔어요", cause: "예쁜 영상 ≠ 팔리는 영상" },
    { text: "유튜브 채널이 1년 넘게 정체 상태예요", cause: "방향 없는 운영의 전형" },
    { text: "우리 브랜드가 뭔지 영상에 안 담겨요", cause: "기획 없는 제작의 결과" },
    { text: "숏폼 따로, 유튜브 따로 파편화됩니다", cause: "원스톱 파트너가 없는 문제" },
  ];

  return (
    <section className="py-28 lg:py-36 bg-surface-white">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-16">
          <h2 className="font-serif break-keep text-[clamp(32px,4.5vw,56px)] font-semibold text-foreground leading-[1.35] tracking-[-0.01em]">
            영상은 만들었는데<br />문의가 늘지 않았습니다
          </h2>
          <p className="text-[19px] text-muted-foreground leading-[1.9] max-w-[480px] mx-auto mt-4">
            이런 경험 있으시죠?
          </p>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[800px] mx-auto">
            {pains.map((p, i) => (
              <div key={i} className="border border-border rounded-xl p-7 bg-card shadow-card">
                <p className="text-[16px] text-foreground leading-[1.7] mb-2">{p.text}</p>
                <p className="text-[13px] text-muted-foreground tracking-[-0.01em]">&rarr; {p.cause}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-14 text-center">
          <p className="font-serif text-[22px] lg:text-[26px] text-foreground leading-[1.6] tracking-[-0.02em] max-w-[560px] mx-auto">
            조회수가 아니라 <span className="text-primary font-semibold">매출이 먼저</span>입니다.
          </p>
        </Reveal>
      </div>
    </section>
  );
};

/* ============================================================
   Section 03 · Services
   ============================================================ */
interface ServicesProps { onFilter: (cat: string) => void; }
const ServicesSection = ({ onFilter }: ServicesProps) => {
  const services = [
    { t: "브랜드 유튜브 채널 운영 대행", d: "알고리즘 기반 기획부터 댓글 관리, 월간 성과 리포트까지. 클라이언트는 결과만 확인.", filter: "브랜드 유튜브" },
    { t: "하이엔드 기업 브랜딩 필름", d: "비전 · 가치 · 철학을 압도적 영상미로. 가맹 사업 설득, 투자자 IR, 신규 고객 유치에 직접 쓰이는 영상.", filter: "브랜딩 필름" },
    { t: "관공서 · 기업 행사 스케치 & 중계", d: "VIP 의전 동선 파악, 멀티캠 + 드론 구성. 다시는 오지 않는 현장을 영화처럼 기록.", filter: "행사 영상" },
    { t: "숏폼 · SNS 콘텐츠", d: "릴스 · 쇼츠 · 틱톡 최적화. 롱폼 원소스에서 숏폼 다포맷 재가공.", filter: "숏폼" },
  ];

  const scrollToPortfolio = (cat: string) => {
    onFilter(cat);
    document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="py-28 lg:py-36 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-16">
          <h2 className="font-serif break-keep text-[clamp(32px,4.5vw,56px)] font-semibold text-foreground leading-[1.35] tracking-[-0.01em]">
            기획 · 촬영 · 편집 · 운영<br />외주 없이 한 팀이 끝냅니다
          </h2>
          <p className="text-[19px] text-muted-foreground leading-[1.9] max-w-[540px] mx-auto mt-4">
            Sony FX3 · 드론 · 짐벌 · 무선마이크 — 장비도 인하우스. 빠르게 테스트하고 바로 반영합니다.
          </p>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1000px] mx-auto">
            {services.map(s => (
              <div key={s.t} className="border border-border rounded-xl p-8 bg-card hover:shadow-card-hover transition-shadow flex flex-col">
                <h3 className="font-serif text-[22px] font-semibold text-foreground mb-4 tracking-[-0.01em]">{s.t}</h3>
                <p className="text-[15px] text-muted-foreground leading-[1.9] mb-6 flex-1">{s.d}</p>
                <button onClick={() => scrollToPortfolio(s.filter)} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:gap-2.5 transition-all self-start">
                  사례 보기 <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ============================================================
   Section 04 · Portfolio
   ============================================================ */
interface Work { title: string; cat: string; id: string; }
const ALL_WORKS: Work[] = [
  // 브랜드 유튜브
  { title: "기업을 위한 영상 외주 제작사 윤식스필름", cat: "브랜드 유튜브", id: "zdTY2J1Gzl4" },
  { title: "영상전문프로덕션 윤식스필름", cat: "브랜드 유튜브", id: "R3e97IcifnQ" },
  { title: "떡볶이 제조업체 인터뷰 영상", cat: "브랜드 유튜브", id: "bvfvAaNATkU" },
  { title: "유튜브 제품 홍보영상 · 새우장", cat: "브랜드 유튜브", id: "V1l8MPOOl2s" },
  { title: "헬스장 홍보영상 제작", cat: "브랜드 유튜브", id: "RYNbq4sr5go" },
  // 브랜딩 필름
  { title: "영상 테마파크 합천 · 영화의 도시", cat: "브랜딩 필름", id: "84rBb-wcevI" },
  { title: "기업 · 학교 기념영상 드론촬영", cat: "브랜딩 필름", id: "xUFp-zrjupU" },
  { title: "개신교 연합 수련회 시네마틱", cat: "브랜딩 필름", id: "UFO9hSHkYM0" },
  { title: "미술 전시 개인전 스케치", cat: "브랜딩 필름", id: "hF5ijggQtgk" },
  // 행사 영상
  { title: "뉴진스 팝업스토어 행사 영상", cat: "행사 영상", id: "cfRmAnDejx0" },
  { title: "기업 체육대회 행사 영상", cat: "행사 영상", id: "C9P9Ggki68c" },
  { title: "한국영아발달조기개입협회 행사", cat: "행사 영상", id: "obxC9tNwvro" },
  { title: "연말 행사 포상식 · 수료식", cat: "행사 영상", id: "9inKmyI8Uec" },
  // 숏폼
  { title: "기업 행사 모션그래픽 편집", cat: "숏폼", id: "jgaDCh-Nawk" },
  { title: "제품 SNS 홍보영상 제작", cat: "숏폼", id: "o-MxpPTcKvs" },
  { title: "행사 전광판 모션그래픽", cat: "숏폼", id: "LbnTS7Zc2Zw" },
  // 공공기관
  { title: "공공기관 · 해양경찰 훈련 교육", cat: "공공기관", id: "F_36PsHEJ6A" },
  { title: "서울청년센터 공간 소개영상", cat: "공공기관", id: "qobtHTN8ONw" },
];

const CATEGORIES = ["전체", "브랜드 유튜브", "브랜딩 필름", "행사 영상", "숏폼", "공공기관"];

interface PortfolioProps { filter: string; setFilter: (f: string) => void; }
const PortfolioSection = ({ filter, setFilter }: PortfolioProps) => {
  const filtered = filter === "전체" ? ALL_WORKS : ALL_WORKS.filter(w => w.cat === filter);

  return (
    <section id="portfolio" className="py-28 lg:py-36 bg-surface-beige scroll-mt-20">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-12">
          <h2 className="font-serif break-keep text-[clamp(32px,4.5vw,56px)] font-semibold text-foreground leading-[1.35] tracking-[-0.01em]">
            말보다 먼저 보여드립니다
          </h2>
          <p className="text-[19px] text-muted-foreground leading-[1.9] max-w-[480px] mx-auto mt-4">
            썸네일을 클릭하면 유튜브 영상으로 바로 이동합니다.
          </p>
        </Reveal>

        {/* Filter tabs */}
        <Reveal>
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`text-[13px] font-medium px-4 py-2 rounded-full transition-all ${
                  filter === c
                    ? "bg-foreground text-background"
                    : "bg-background/50 text-muted-foreground border border-border hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(w => (
              <a
                key={w.id}
                href={`https://www.youtube.com/watch?v=${w.id}`}
                target="_blank"
                rel="noreferrer"
                className="group block"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-dark shadow-card group-hover:shadow-card-hover transition-all">
                  <img
                    src={`https://img.youtube.com/vi/${w.id}/hqdefault.jpg`}
                    alt={w.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-dark/20 group-hover:bg-dark/40 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                      <Play className="w-5 h-5 text-dark ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 px-1">
                  <span className="text-[11px] text-primary tracking-[0.08em] uppercase font-medium">{w.cat}</span>
                  <h4 className="text-[14px] font-medium text-foreground mt-1 leading-[1.5]">{w.title}</h4>
                </div>
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-16 text-center">
          <a
            href="http://yoon6film.co.kr/services/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 border border-foreground/20 text-[14px] font-medium text-foreground hover:border-foreground/40 hover:gap-3 transition-all rounded-md"
          >
            전체 포트폴리오 보기 <ArrowRight className="w-4 h-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
};

/* ============================================================
   Section 05 · Social Proof
   ============================================================ */
const SocialProofSection = () => (
  <section className="py-28 lg:py-36 bg-surface-white">
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-16">
        <h2 className="font-serif break-keep text-[clamp(32px,4.5vw,56px)] font-semibold text-foreground leading-[1.35] tracking-[-0.01em]">
          구독자 73명 → 2,500명.<br />2개월이면 됩니다
        </h2>
      </Reveal>

      {/* Before / After */}
      <Reveal className="max-w-[880px] mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="border border-border rounded-xl p-8 bg-card">
            <span className="text-[11px] font-bold text-muted-foreground tracking-[0.1em] uppercase">Before · 직접 운영 1년 6개월</span>
            <div className="mt-6 space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-[32px] font-serif font-semibold text-muted-foreground tracking-[-0.02em]">73</span>
                <span className="text-[13px] text-muted-foreground">명 구독자</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[32px] font-serif font-semibold text-muted-foreground tracking-[-0.02em]">4.4만</span>
                <span className="text-[13px] text-muted-foreground">누적 조회수</span>
              </div>
              <p className="text-[13px] text-muted-foreground/70 pt-2 border-t border-border">방향성 불명확</p>
            </div>
          </div>
          <div className="border-2 border-primary rounded-xl p-8 bg-primary/5 relative">
            <span className="text-[11px] font-bold text-primary tracking-[0.1em] uppercase">After · 대행 2개월</span>
            <div className="mt-6 space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-[32px] font-serif font-semibold text-primary tracking-[-0.02em]">2,500</span>
                <span className="text-[13px] text-primary/70">명 구독자</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[32px] font-serif font-semibold text-primary tracking-[-0.02em]">44만</span>
                <span className="text-[13px] text-primary/70">누적 조회수</span>
              </div>
              <p className="text-[13px] text-primary/80 pt-2 border-t border-primary/20 font-medium">상담 전환 4.5배 증가</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Reviews */}
      <Reveal className="max-w-[880px] mx-auto">
        <div className="space-y-0">
          {[
            { quote: "유튜브 채널 운영 후 제품 문의 전화가 4.5배 폭증했습니다. 시청자를 실제 구매 고객으로 전환시키는 기획력을 증명해 주었습니다.", person: "쭌난방 대표이사" },
            { quote: "빛과 구조를 이해하는 탁월한 감각으로, 우리 제품이 놓인 공간의 공기마저 고급스럽게 영상에 담아냈습니다.", person: "LG Signature 브랜드팀 PM" },
            { quote: "가맹점주와 투자자를 설득하기 위한 비전을 텍스트 제안서보다 훨씬 강력한 설득력으로 담아냈습니다. 가맹 사업 확장에 결정적인 역할을 했습니다.", person: "프랜차이즈 본사 가맹사업본부장" },
            { quote: "수백 명이 모이는 지자체 행사는 돌발 변수가 많아 경험이 필수적입니다. VIP 의전 동선 파악부터 현장 스케치까지 빈틈없이 수행합니다.", person: "충청남도청 행사 기획 주무관" },
          ].map((r, i) => (
            <div key={i} className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-12 py-10 border-t border-border items-start">
              <p className="text-[13px] text-muted-foreground tracking-[0.02em]">{r.person}</p>
              <p className="font-serif text-[18px] lg:text-[20px] text-foreground leading-[1.75] tracking-[-0.01em]">
                &ldquo;{r.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

/* ============================================================
   Section 06 · Differentiation
   ============================================================ */
const DifferentiationSection = () => (
  <section className="py-28 lg:py-36 bg-background">
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-16">
        <h2 className="font-serif break-keep text-[clamp(32px,4.5vw,56px)] font-semibold text-foreground leading-[1.35] tracking-[-0.01em]">
          단순 제작사는 납품하고 끝납니다.<br />
          <span className="text-primary">저희는 채널이 살 때까지 책임집니다</span>
        </h2>
      </Reveal>

      <Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[880px] mx-auto">
          <div className="border-l-4 border-red-400 bg-red-50/40 rounded-xl p-8">
            <span className="text-[13px] font-bold text-red-500/90 tracking-[0.05em] mb-5 block">일반 제작사</span>
            <ul className="space-y-3">
              {["기획 없이 받아서 찍는다", "납품 후 소통 끊김", "알고리즘 무관심", "조회수로 성과 포장"].map(t => (
                <li key={t} className="flex items-start gap-2 text-[15px] text-red-700/60 leading-[1.7]">
                  <span className="text-red-400 mt-0.5 shrink-0">×</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-l-4 border-emerald-500 bg-emerald-50/40 rounded-xl p-8">
            <span className="text-[13px] font-bold text-emerald-600/90 tracking-[0.05em] mb-5 block">브랜디드 콘텐츠 팀</span>
            <ul className="space-y-3">
              {["비즈니스 목표 먼저 분석", "전담 PD 실시간 소통", "알고리즘 기반 기획", "상담 · 매출로 성과 측정"].map(t => (
                <li key={t} className="flex items-start gap-2 text-[15px] text-emerald-800/70 leading-[1.7]">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ============================================================
   Section 07 · Process
   ============================================================ */
const ProcessSection = () => {
  const steps = [
    { s: "01", t: "무료 상담", d: "목표 · 타겟 · 예산 분석. 어떤 영상이 전환으로 이어질지 먼저 설계합니다." },
    { s: "02", t: "기획", d: "핵심 메시지 도출, 알고리즘 반응 기반 주제 설계, 촬영 콘티 확정." },
    { s: "03", t: "촬영", d: "Sony FX3 멀티캠 + 드론 + 무선마이크. 현장 돌발 변수 대응 경험 9년." },
    { s: "04", t: "후반 작업", d: "컷 편집 · 색보정 · 자막 · BGM · 모션그래픽. 피드백 반영 후 수정." },
    { s: "05", t: "납품", d: "유튜브 · 릴스 · 쇼츠 · 틱톡 포맷 동시 납품. 운영 채널이면 업로드 · 관리까지." },
  ];

  return (
    <section className="py-28 lg:py-36 bg-surface-beige">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-16">
          <h2 className="font-serif break-keep text-[clamp(32px,4.5vw,56px)] font-semibold text-foreground leading-[1.35] tracking-[-0.01em]">
            첫 상담부터 납품까지,<br />어느 단계에서도 연락이 끊기지 않습니다
          </h2>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0 max-w-[1100px] mx-auto">
            {steps.map(p => (
              <div key={p.s} className="border-t-2 border-primary pt-7 pr-6 pb-8">
                <span className="text-[13px] font-display text-primary tracking-[0.1em] font-medium">{p.s}</span>
                <h3 className="text-[17px] font-semibold text-foreground mt-3 mb-3 tracking-[-0.01em]">{p.t}</h3>
                <p className="text-[14px] text-muted-foreground leading-[1.85]">{p.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ============================================================
   Section 08 · CTA
   ============================================================ */
const CtaSection = () => (
  <section className="py-28 lg:py-36 bg-background text-center">
    <div className="max-w-[1240px] mx-auto px-6">
      <Reveal>
        <h2 className="font-serif break-keep text-[clamp(32px,4.5vw,56px)] font-semibold text-foreground leading-[1.35] tracking-[-0.01em] mb-5">
          우리 브랜드에 맞는 영상 전략,<br />무료로 먼저 들어보세요
        </h2>
        <p className="text-[19px] text-muted-foreground leading-[1.9] max-w-[540px] mx-auto mt-4 mb-12">
          30분이면 됩니다. 어떤 영상이 매출로 이어질지, 채널 구조를 어떻게 잡을지 — 방향을 먼저 잡아드립니다.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/consult" className="inline-flex items-center gap-2 px-9 py-4 bg-primary text-primary-foreground text-[16px] font-medium tracking-[0.02em] hover:bg-gold-light transition-all rounded-md">
            무료 영상 전략 상담 신청 <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="http://yoon6film.co.kr/services/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-8 py-4 border border-border text-[16px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors rounded-md">
            포트폴리오 전체 보기
          </a>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ============================================================
   Page
   ============================================================ */
const BrandedClient = () => {
  const [filter, setFilter] = useState("전체");

  return (
    <div>
      <HeroSection />
      <PainSection />
      <ServicesSection onFilter={setFilter} />
      <PortfolioSection filter={filter} setFilter={setFilter} />
      <SocialProofSection />
      <DifferentiationSection />
      <ProcessSection />
      <CtaSection />
    </div>
  );
};

export default BrandedClient;

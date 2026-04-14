"use client";

import dynamic from "next/dynamic";
import { ArrowRight, ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/Reveal";

const BrandedHeroArt = dynamic(() => import("@/components/BrandedHeroArt"), { ssr: false });

/* ============================================================
   Section 01 · Hero
   ============================================================ */
const HeroSection = () => (
  <section className="relative min-h-screen flex items-center pt-32 pb-20 bg-dark overflow-hidden">
    <div className="absolute top-[15%] right-[8%] w-[500px] h-[500px] rounded-full bg-primary/[0.05] blur-[150px] pointer-events-none" />

    <div className="relative z-10 max-w-[1240px] mx-auto w-full px-6 lg:px-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-cream/35 hover:text-primary transition-colors mb-12 opacity-0 animate-fade-up stagger-1">
        <ArrowLeft className="w-3 h-3" /> 홈으로
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-[13px] tracking-[0.2em] uppercase text-cream/25 mb-7 opacity-0 animate-fade-up stagger-1">
            Branded Content
          </p>

          <h1 className="font-serif break-keep text-[clamp(40px,5.5vw,72px)] font-semibold leading-[1.15] tracking-[-0.03em] text-cream mb-7 opacity-0 animate-fade-up stagger-2">
            유튜브로<br />
            <span className="text-primary">24시간 영업사원</span>을<br />
            만듭니다
          </h1>

          <p className="text-[18px] text-cream/45 leading-[1.85] max-w-[500px] mb-10 opacity-0 animate-fade-up stagger-3">
            병원 · 사업자 전문 유튜브 채널 운영 대행.<br />
            기획부터 숏폼까지, 한 팀이 다 합니다.
          </p>

          <div className="flex items-center gap-4 opacity-0 animate-fade-up stagger-4">
            <Link href="/consult" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground text-[15px] font-medium tracking-[0.01em] hover:bg-gold-light transition-all rounded-md">
              무료 상담 신청
            </Link>
            <a href="https://pf.kakao.com/_Hptyb/chat" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-7 py-3.5 border border-cream/15 text-cream/70 text-[15px] hover:border-cream/30 hover:text-cream transition-colors rounded-md">
              <MessageCircle className="w-4 h-4" /> 카카오톡 문의
            </a>
          </div>
        </div>

        <div className="hidden lg:flex justify-center items-center">
          <BrandedHeroArt />
        </div>
      </div>
    </div>
  </section>
);

/* ============================================================
   Section 02 · Portfolio
   ============================================================ */
interface Video { title: string; channel: string; embedId: string; }

const FEATURED_VIDEOS: Video[] = [
  // 1열
  { title: "AI로 이런 1인 사업이 뜨고 있어요", channel: "포리얼", embedId: "IFLV4cI4R_Y" },
  { title: "10평 농막 찜질방 온수난방 시공", channel: "쭌난방 본사", embedId: "NWrm2WueHLY" },
  { title: "얼굴 홍조 이유와 치료 방법", channel: "닥터세사마", embedId: "_wejdbdwbNA" },
  // 2열
  { title: "개업 하자마자 50명씩 웨이팅 만든 비결", channel: "포리얼", embedId: "1ATfpuC_gY4" },
  { title: "발리에서 에어비앤비에 도전하는 직장인", channel: "공간수익", embedId: "oIWM3itfnFY" },
  { title: "갤럭시 Z 폴드7 최신 유출 정보", channel: "스마트폰면세점", embedId: "_yL-RX1RYn8" },
  // 3열
  { title: "태양광 발전소 투자 전 확인할 5가지", channel: "짐컴퍼니", embedId: "gAs58TT_OVQ" },
  { title: "복부집중 4주 챌린지", channel: "무나홈트", embedId: "6oX8sQ6kuL4" },
  { title: "인간극장 레전드 직접 만남", channel: "아하부장", embedId: "DzQdfxEGKn0" },
  // 4열
  { title: "한국 아이템으로 미국 8천 억 사업", channel: "포리얼", embedId: "Q2V1et5cz4E" },
  { title: "손으로 끼우면 끝나는 바닥 열선 난방", channel: "쭌난방 본사", embedId: "lbiFo4tkG6U" },
  { title: "오봉집 창업 30살에 결혼 성공", channel: "장사가 머니", embedId: "VoZIKuFM_CU" },
];

const VideoCard = ({ v }: { v: Video }) => (
  <div className="group">
    <div className="relative aspect-video rounded-xl overflow-hidden bg-dark shadow-card group-hover:shadow-card-hover transition-all">
      <iframe
        src={`https://www.youtube.com/embed/${v.embedId}`}
        title={v.title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
    <div className="mt-3 px-1">
      <span className="text-[11px] text-primary tracking-[0.08em] uppercase font-medium">{v.channel}</span>
      <h4 className="text-[14px] font-medium text-foreground mt-1 leading-[1.5] tracking-[-0.01em]">{v.title}</h4>
    </div>
  </div>
);

const PortfolioSection = () => (
  <section className="py-28 lg:py-36 bg-surface-white">
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-16">
        <h2 className="font-serif break-keep text-[clamp(32px,4.5vw,56px)] font-semibold text-foreground leading-[1.35] tracking-[-0.01em]">
          직접 확인하세요
        </h2>
        <p className="text-[19px] text-muted-foreground leading-[1.9] max-w-[480px] mx-auto mt-4">
          말보다 채널이 먼저입니다.<br />지금 운영 중인 채널들을 보세요.
        </p>
      </Reveal>

      {/* Featured Videos — 4 columns × 3 rows = 12 */}
      <Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURED_VIDEOS.map(v => (
            <VideoCard key={v.embedId} v={v} />
          ))}
        </div>
      </Reveal>

    </div>
  </section>
);

/* ============================================================
   Section 03 · Pain
   ============================================================ */
const PainSection = () => {
  const pains = [
    "유튜브 해야 하는 건 아는데, 뭘 만들어야 할지 모르겠어요",
    "영상 올리고 있는데 잘 되고 있는 건지 모르겠어요",
    "몇 편 만들었는데 문의랑 매출에 아무 변화가 없어요",
    "대표가 직접 찍고 편집할 시간이 없어요",
    "광고 말고 장기적으로 1등 자리 잡고 싶어요",
  ];

  return (
    <section className="py-28 lg:py-36 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-14">
          <h2 className="font-serif break-keep text-[clamp(32px,4.5vw,56px)] font-semibold text-foreground leading-[1.35] tracking-[-0.01em]">
            이런 고민, 있으시죠?
          </h2>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[780px] mx-auto">
            {pains.map((p, i) => (
              <div key={i} className="border border-border rounded-xl p-6 bg-card shadow-card">
                <p className="text-[15px] text-foreground leading-[1.75]">{p}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-14 text-center">
          <p className="font-serif text-[22px] lg:text-[26px] text-foreground leading-[1.6] tracking-[-0.02em] max-w-[560px] mx-auto">
            하나라도 해당되면, <span className="text-primary font-semibold">저희가 해결해 드립니다.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
};

/* ============================================================
   Section 04 · Problem
   ============================================================ */
const ProblemSection = () => (
  <section className="py-28 lg:py-36 bg-surface-beige">
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-14">
        <h2 className="font-serif break-keep text-[clamp(32px,4.5vw,56px)] font-semibold text-foreground leading-[1.35] tracking-[-0.01em]">
          기존 방식으로는 안 됩니다
        </h2>
      </Reveal>

      <Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[880px] mx-auto">
          <div className="bg-card border border-border rounded-xl p-8">
            <span className="text-[11px] font-bold text-red-500/90 tracking-[0.1em] uppercase">문제 A</span>
            <h3 className="font-serif text-[22px] font-semibold text-foreground mt-3 mb-4 tracking-[-0.01em]">AI 공장형 유튜브</h3>
            <p className="text-[15px] text-muted-foreground leading-[1.85] mb-5">
              영상은 깔끔합니다. 근데 우리 브랜드 색이 없습니다. 교과서적 설명만 있고, 대표 철학도 고객 질문도 없습니다.
            </p>
            <div className="pt-4 border-t border-border">
              <span className="text-[13px] font-bold text-red-500/90">결과 &middot;</span>
              <span className="text-[14px] text-foreground/80 ml-2">브랜드 가치 하락</span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-8">
            <span className="text-[11px] font-bold text-red-500/90 tracking-[0.1em] uppercase">문제 B</span>
            <h3 className="font-serif text-[22px] font-semibold text-foreground mt-3 mb-4 tracking-[-0.01em]">무전략 유튜브</h3>
            <p className="text-[15px] text-muted-foreground leading-[1.85] mb-5">
              기획 없이 올리면 알고리즘이 외면합니다. 채널이 저품질로 낙인찍히면 복구가 안 됩니다.
            </p>
            <div className="pt-4 border-t border-border">
              <span className="text-[13px] font-bold text-red-500/90">결과 &middot;</span>
              <span className="text-[14px] text-foreground/80 ml-2">실고객 유입 Zero</span>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ============================================================
   Section 05 · Services
   ============================================================ */
const ServicesSection = () => {
  const services = [
    { num: "01", t: "올인원 유튜브 운영", d: "기획 · 촬영 · 편집 · 업로드 · 댓글 관리 · 숏폼 재가공까지. 매달 성과 리포트로 보고합니다." },
    { num: "02", t: "맞춤 영상 편집", d: "찍어오신 촬영본을 알고리즘에 맞게 편집합니다. 썸네일 3종, 자막, BGM, 유튜브 SEO까지 포함." },
    { num: "03", t: "익명 · 자막 영상", d: "얼굴 안 나와도 됩니다. 자막형 콘텐츠, 보이스오버로 운영 가능합니다." },
  ];

  return (
    <section className="py-28 lg:py-36 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-16">
          <h2 className="font-serif break-keep text-[clamp(32px,4.5vw,56px)] font-semibold text-foreground leading-[1.35] tracking-[-0.01em]">
            그래서 저희가 이렇게 합니다
          </h2>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1000px] mx-auto">
            {services.map(s => (
              <div key={s.num} className="border border-border rounded-xl p-8 bg-card hover:shadow-card-hover transition-shadow">
                <span className="text-[13px] font-display text-primary tracking-[0.1em] font-medium">{s.num}</span>
                <h3 className="font-serif text-[20px] font-semibold text-foreground mt-4 mb-4 tracking-[-0.01em]">{s.t}</h3>
                <p className="text-[15px] text-muted-foreground leading-[1.9]">{s.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ============================================================
   Section 06 · Social Proof
   ============================================================ */
const SocialProofSection = () => (
  <section className="py-28 lg:py-36 bg-surface-white">
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-14">
        <h2 className="font-serif break-keep text-[clamp(32px,4.5vw,56px)] font-semibold text-foreground leading-[1.35] tracking-[-0.01em]">
          숫자로 말합니다
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
            </div>
          </div>
          <div className="border-2 border-primary rounded-xl p-8 bg-primary/5">
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
              <p className="text-[13px] text-primary/80 pt-2 border-t border-primary/20 font-medium">상담 4배 증가</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Reviews */}
      <Reveal className="max-w-[880px] mx-auto">
        <div className="space-y-0">
          {[
            { quote: "문의 전화가 4.5배 폭증했습니다. 조회수만 나오는 영상이 아니라 실제 구매로 이어지는 기획력을 증명해 줬습니다.", person: "쭌난방 대표이사" },
            { quote: "텍스트 제안서보다 훨씬 강력했습니다. 가맹 사업 확장에 결정적인 역할을 했습니다.", person: "프랜차이즈 본사 가맹사업본부장" },
            { quote: "LG Signature가 추구하는 프리미엄 가치를 공간의 공기마저 고급스럽게 담아냈습니다.", person: "LG Signature 브랜드팀 PM" },
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
   Section 07 · Process
   ============================================================ */
const ProcessSection = () => {
  const roadmap = [
    { period: "1개월차", d: "우리 채널만의 USP를 찾습니다" },
    { period: "2개월차", d: "알고리즘 반응 보고 주력 방향을 확정합니다" },
    { period: "3~5개월", d: "검증된 구조로 콘텐츠를 확장합니다" },
    { period: "6개월~", d: "반복 노출로 채널 포지션을 고정합니다" },
    { period: "매월", d: "데이터 분석 후 다음 달 전략에 반영합니다" },
  ];

  return (
    <section className="py-28 lg:py-36 bg-surface-beige">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-16">
          <h2 className="font-serif break-keep text-[clamp(32px,4.5vw,56px)] font-semibold text-foreground leading-[1.35] tracking-[-0.01em]">
            맡기면 이렇게 됩니다
          </h2>
        </Reveal>

        <Reveal>
          <div className="max-w-[760px] mx-auto">
            {roadmap.map((r, i) => (
              <div key={i} className="grid grid-cols-[120px_1fr] gap-6 lg:gap-10 py-7 border-t border-border items-center">
                <span className="text-[15px] font-display font-semibold text-primary tracking-[0.05em]">{r.period}</span>
                <p className="text-[17px] text-foreground leading-[1.7] tracking-[-0.01em]">{r.d}</p>
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
          채널 방향,<br />무료로 먼저 잡아드립니다
        </h2>
        <p className="text-[19px] text-muted-foreground leading-[1.9] max-w-[520px] mx-auto mt-4 mb-12">
          지금 유튜브 현황을 보내주시면<br />어디서 막혀있는지 바로 짚어드립니다.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/consult" className="inline-flex items-center gap-2 px-9 py-4 bg-primary text-primary-foreground text-[16px] font-medium tracking-[0.02em] hover:bg-gold-light transition-all rounded-md">
            무료 상담 신청하기 <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="https://pf.kakao.com/_Hptyb/chat" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-8 py-4 border border-border text-[16px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors rounded-md">
            <MessageCircle className="w-4 h-4" /> 카카오톡으로 바로 문의
          </a>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ============================================================
   Page
   ============================================================ */
const BrandedClient = () => (
  <div>
    <HeroSection />
    <PortfolioSection />
    <PainSection />
    <ProblemSection />
    <ServicesSection />
    <SocialProofSection />
    <ProcessSection />
    <CtaSection />
  </div>
);

export default BrandedClient;

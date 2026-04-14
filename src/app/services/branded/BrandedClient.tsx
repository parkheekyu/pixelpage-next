"use client";

import { ArrowRight, ArrowLeft, AlertTriangle, Tv, Film, PartyPopper, Zap, Target, BarChart3, RefreshCw, Camera } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/Reveal";

/* ─────────────── S01 · Hero ─────────────── */
const HeroSection = () => (
  <section className="relative min-h-screen flex items-center pt-32 pb-20 bg-dark overflow-hidden">
    <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-primary/[0.05] blur-[140px] pointer-events-none" />

    <div className="relative z-10 max-w-[1240px] mx-auto w-full px-6 lg:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-cream/35 hover:text-primary transition-colors mb-16 opacity-0 animate-fade-up stagger-1">
            <ArrowLeft className="w-3 h-3" /> 홈으로
          </Link>
          <p className="text-[13px] tracking-[0.2em] uppercase text-cream/25 mb-8 opacity-0 animate-fade-up stagger-1">
            Branded Content
          </p>
          <h1 className="font-serif break-keep text-[clamp(42px,5.5vw,72px)] font-medium leading-[1.15] tracking-[-0.03em] text-cream mb-8 opacity-0 animate-fade-up stagger-2">
            영상을 만들어 드리는 게<br />아닙니다.<br />
            <span className="text-primary">브랜드가 팔리게</span> 만듭니다
          </h1>
          <p className="text-[17px] text-cream/35 leading-[1.9] max-w-[440px] mb-10 opacity-0 animate-fade-up stagger-3">
            기획부터 납품까지 — Genesis, LG Signature, 쭌난방, 충남도청이 선택한 크리에이티브 파트너.
          </p>
          <div className="flex items-center gap-5 opacity-0 animate-fade-up stagger-4">
            <Link href="/consult" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground text-[15px] font-medium tracking-[0.01em] hover:bg-gold-light transition-all rounded-md">
              무료 영상 전략 상담
            </Link>
          </div>
        </div>
        <div className="hidden lg:flex flex-col items-center justify-center gap-6 opacity-0 animate-fade-up stagger-5">
          <div className="flex flex-wrap gap-10">
            {[
              { n: "9년+", l: "현장 제작 경력" },
              { n: "90%", l: "재계약률" },
              { n: "4.5x", l: "상담 전환 증가" },
            ].map(k => (
              <div key={k.l} className="text-center">
                <span className="text-[32px] font-serif font-medium text-cream tracking-[-0.02em]">{k.n}</span>
                <span className="block text-[11px] text-cream/25 tracking-[0.08em] uppercase mt-1">{k.l}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {["Genesis", "LG Signature", "쭌난방", "충남도청", "해양경찰", "서울청년센터"].map(c => (
              <span key={c} className="text-[11px] text-cream/30 border border-cream/10 px-3 py-1 rounded-full">{c}</span>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="absolute bottom-10 left-0 right-0 z-10">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12 flex items-center gap-3">
        <span className="text-[12px] tracking-[0.12em] uppercase text-cream/20">스크롤</span>
        <div className="w-[50px] h-px bg-primary/30" style={{ animation: "scroll-line 2s ease infinite" }} />
      </div>
    </div>
  </section>
);

/* ─────────────── S02 · Pain ─────────────── */
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
        <Reveal className="text-center mb-16 lg:mb-20">
          <h2 className="font-serif break-keep text-[clamp(36px,5vw,64px)] font-semibold text-foreground leading-[1.2] tracking-[-0.02em]">
            영상은 만들었는데<br />문의가 늘지 않았습니다
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
                <div>
                  <span className="text-[16px] text-foreground leading-[1.8] block">{p.text}</span>
                  <span className="text-[13px] text-muted-foreground mt-1 block">&rarr; {p.cause}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-14 text-center">
          <p className="text-[19px] font-serif text-foreground leading-[1.9] max-w-[560px] mx-auto">
            <span className="text-primary font-semibold">조회수가 아니라 매출이 먼저입니다.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
};

/* ─────────────── S03 · Services ─────────────── */
const ServicesSection = () => {
  const services = [
    { icon: <Tv className="w-5 h-5" />, t: "브랜드 유튜브 채널 운영 대행", d: "알고리즘 기반 기획 → 촬영 → 편집 → 업로드 → 댓글 관리 → 월간 성과 리포트. 클라이언트는 결과만 확인." },
    { icon: <Film className="w-5 h-5" />, t: "하이엔드 기업 브랜딩 필름", d: "비전, 가치, 철학을 압도적 영상미로. 가맹 사업 설득, 투자자 IR, 신규 고객 유치에 직접 쓰이는 영상." },
    { icon: <PartyPopper className="w-5 h-5" />, t: "관공서 / 기업 행사 스케치 & 중계", d: "VIP 의전 동선 파악, 멀티캠 + 드론 구성. 다시는 오지 않는 현장을 영화처럼 기록합니다." },
    { icon: <Zap className="w-5 h-5" />, t: "숏폼 / SNS 콘텐츠 제작", d: "릴스, 쇼츠, 틱톡 최적화. 롱폼 원소스에서 숏폼 다포맷 재가공. 채널 간 시너지 극대화." },
  ];

  return (
    <section className="py-28 lg:py-36 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-16 lg:mb-20">
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">Services</p>
          <h2 className="font-serif break-keep text-[clamp(36px,5vw,64px)] font-semibold text-foreground leading-[1.2] tracking-[-0.02em]">
            기획 / 촬영 / 편집 / 운영 —<br />외주 없이 한 팀이 끝냅니다
          </h2>
          <p className="text-[15px] text-muted-foreground max-w-[520px] mx-auto leading-[1.9] mt-5">
            Sony FX3, 드론, 짐벌, 무선마이크 — 장비도 인하우스. 빠르게 테스트하고 바로 반영합니다.
          </p>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {services.map(s => (
              <div key={s.t} className="border border-border rounded-xl p-8 hover:shadow-card-hover transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5 text-primary">
                  {s.icon}
                </div>
                <h3 className="text-[17px] font-semibold text-foreground mb-3">{s.t}</h3>
                <p className="text-[15px] text-muted-foreground leading-[1.9]">{s.d}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <div className="flex flex-wrap gap-2 justify-center">
            {["Sony FX3 / FX2", "일반 드론 + FPV", "DJI RS3 짐벌", "무선마이크 / 조명"].map(e => (
              <span key={e} className="text-[12px] text-muted-foreground bg-secondary border border-border px-3 py-1.5 rounded-full">{e}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ─────────────── S04 · Portfolio ─────────────── */
const PortfolioSection = () => {
  const works = [
    { title: "뉴진스 팝업스토어 행사 영상", cat: "행사영상", url: "https://youtu.be/example1" },
    { title: "영상 테마파크 합천 - 영화의 도시", cat: "브랜딩필름", url: "https://youtu.be/example2" },
    { title: "기업/학교 기념영상 드론촬영", cat: "드론촬영", url: "https://youtu.be/example3" },
    { title: "기업을 위한 영상 외주 제작사", cat: "유튜브대행", url: "https://youtu.be/example4" },
    { title: "헬스장 홍보영상 제작", cat: "홍보영상", url: "https://youtu.be/example5" },
    { title: "떡볶이 제조업체 인터뷰 영상", cat: "유튜브대행", url: "https://youtu.be/example6" },
  ];

  return (
    <section className="py-28 lg:py-36 bg-dark text-cream">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-16">
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">Portfolio</p>
          <h2 className="font-serif break-keep text-[clamp(36px,5vw,64px)] font-semibold text-cream leading-[1.2] tracking-[-0.02em]">
            말보다 먼저 보여드립니다
          </h2>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {works.map(w => (
              <div key={w.title} className="border border-cream/10 rounded-xl p-6 hover:bg-cream/5 transition-colors">
                <span className="text-[11px] text-primary font-medium tracking-[0.05em]">{w.cat}</span>
                <h4 className="text-[15px] font-medium text-cream mt-2 mb-3">{w.title}</h4>
                <span className="text-[13px] text-cream/40 hover:text-primary transition-colors">영상 보기 &rarr;</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ─────────────── S05 · Social Proof ─────────────── */
const SocialProofSection = () => (
  <section className="py-28 lg:py-36 bg-surface-white">
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-16">
        <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">Results</p>
        <h2 className="font-serif break-keep text-[clamp(36px,5vw,64px)] font-semibold text-foreground leading-[1.2] tracking-[-0.02em]">
          구독자 73명 &rarr; 2,500명.<br />2개월이면 됩니다
        </h2>
      </Reveal>

      {/* Before / After */}
      <Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto mb-16">
          <div className="border border-border rounded-xl p-8">
            <span className="text-[12px] font-bold text-muted-foreground tracking-[0.08em]">BEFORE - 직접 운영 1년 6개월</span>
            <div className="mt-5 space-y-3">
              <div><span className="text-[28px] font-serif font-medium text-muted-foreground">73</span><span className="text-[13px] text-muted-foreground ml-1">명 구독자</span></div>
              <div><span className="text-[28px] font-serif font-medium text-muted-foreground">4.4</span><span className="text-[13px] text-muted-foreground ml-1">만 누적 조회수</span></div>
              <p className="text-[13px] text-muted-foreground/60">방향성 불명확</p>
            </div>
          </div>
          <div className="border-2 border-primary rounded-xl p-8">
            <span className="text-[12px] font-bold text-primary tracking-[0.08em]">AFTER - 대행 2개월</span>
            <div className="mt-5 space-y-3">
              <div><span className="text-[28px] font-serif font-medium text-primary">2,500</span><span className="text-[13px] text-primary/70 ml-1">명 구독자</span></div>
              <div><span className="text-[28px] font-serif font-medium text-primary">44</span><span className="text-[13px] text-primary/70 ml-1">만 누적 조회수</span></div>
              <p className="text-[13px] text-primary/60">상담 전환 4.5배 증가</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Reviews */}
      <Reveal>
        <div className="space-y-0 max-w-[800px] mx-auto">
          {[
            { quote: "유튜브 채널 운영 후 본사로 들어오는 제품 문의 전화가 4.5배 폭증했습니다. 조회수만 나오는 영상이 아닌, 시청자를 실제 구매 고객으로 전환시키는 기획력을 증명해 주었습니다.", person: "쭌난방 대표이사", company: "JJUNHEAT" },
            { quote: "빛과 구조를 이해하는 탁월한 감각으로, 우리 제품이 놓인 공간의 공기마저 고급스럽게 영상에 담아냈습니다.", person: "LG Signature 브랜드팀", company: "PM" },
            { quote: "가맹점주와 투자자를 설득하기 위한 비전을 텍스트 제안서보다 훨씬 강력한 설득력으로 담아냈습니다. 가맹 사업 확장에 결정적인 역할을 했습니다.", person: "프랜차이즈 본사", company: "가맹사업본부장" },
            { quote: "VIP 의전 동선 파악부터 현장 스케치까지 빈틈없이 수행합니다. 수백 명이 모이는 지자체 행사는 돌발 변수가 많아 경험이 필수적입니다.", person: "충청남도청", company: "행사 기획 주무관" },
          ].map((r, i) => (
            <div key={i} className="py-8 border-t border-border">
              <p className="text-[17px] text-foreground leading-[1.85] mb-4">&ldquo;{r.quote}&rdquo;</p>
              <p className="text-[13px] text-muted-foreground">{r.person} &middot; {r.company}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

/* ─────────────── S06 · Differentiation ─────────────── */
const DifferentiationSection = () => (
  <section className="py-28 lg:py-36 bg-background">
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-16">
        <h2 className="font-serif break-keep text-[clamp(36px,5vw,64px)] font-semibold text-foreground leading-[1.2] tracking-[-0.02em]">
          단순 제작사는 납품하고 끝납니다.<br /><span className="text-primary">저희는 채널이 살 때까지 책임집니다</span>
        </h2>
      </Reveal>

      <Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto mb-14">
          <div className="border-l-4 border-red-400 bg-red-50/50 rounded-xl p-7">
            <span className="text-[13px] font-bold text-red-500 mb-4 block">일반 제작사</span>
            <ul className="space-y-2">
              {["기획 없이 받아서 찍는다", "납품 후 소통 끊김", "알고리즘 무관심", "조회수로 성과 포장"].map(t => (
                <li key={t} className="text-[14px] text-red-600/70 leading-[1.8]">&times; {t}</li>
              ))}
            </ul>
          </div>
          <div className="border-l-4 border-emerald-500 bg-emerald-50/50 rounded-xl p-7">
            <span className="text-[13px] font-bold text-emerald-600 mb-4 block">브랜디드 콘텐츠 팀</span>
            <ul className="space-y-2">
              {["비즈니스 목표 먼저 분석", "전담 PD 실시간 소통", "알고리즘 기반 기획", "상담, 매출로 성과 측정"].map(t => (
                <li key={t} className="text-[14px] text-emerald-700/70 leading-[1.8]">&check; {t}</li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[800px] mx-auto">
          {[
            { icon: <Target className="w-5 h-5" />, t: "비즈니스 목표 우선", d: "영상보다 전환이 먼저" },
            { icon: <BarChart3 className="w-5 h-5" />, t: "데이터 기반 기획", d: "알고리즘 반응으로 운영" },
            { icon: <RefreshCw className="w-5 h-5" />, t: "원스톱 ALL-IN-ONE", d: "기획부터 운영까지 한 팀" },
          ].map(d => (
            <div key={d.t} className="text-center border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">{d.icon}</div>
              <h4 className="text-[15px] font-semibold text-foreground mb-1">{d.t}</h4>
              <p className="text-[13px] text-muted-foreground">{d.d}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

/* ─────────────── S07 · Process ─────────────── */
const ProcessSection = () => (
  <section className="py-28 lg:py-36 bg-dark text-cream">
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-16">
        <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">Process</p>
        <h2 className="font-serif break-keep text-[clamp(28px,4vw,48px)] font-semibold text-cream leading-[1.2] tracking-[-0.02em]">
          첫 상담부터 납품까지,<br />어느 단계에서도 연락이 끊기지 않습니다
        </h2>
      </Reveal>

      <Reveal>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
          {[
            { s: "01", t: "무료 상담", d: "비즈니스 목표 파악. 어떤 영상이 전환으로 이어질지 먼저 설계합니다." },
            { s: "02", t: "기획", d: "핵심 메시지 도출, 알고리즘 기반 주제 설계, 촬영 콘티 확정." },
            { s: "03", t: "촬영", d: "Sony FX3 멀티캠 + 드론 + 무선마이크. 현장 돌발 변수 대응 경험 9년." },
            { s: "04", t: "후반 작업", d: "컷 편집, 색보정, 자막, BGM, 모션그래픽. 피드백 반영 후 수정." },
            { s: "05", t: "납품 & 최적화", d: "유튜브, 릴스, 쇼츠, 틱톡 포맷 동시 납품. 운영 채널이면 업로드, 관리까지." },
          ].map(p => (
            <div key={p.s} className="border-t-2 border-primary pt-8 pr-6 pb-8">
              <span className="text-[13px] font-display text-primary tracking-[0.1em]">{p.s}</span>
              <h3 className="text-[17px] font-medium text-cream mt-4 mb-3">{p.t}</h3>
              <p className="text-[14px] text-cream/50 leading-[1.9]">{p.d}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

/* ─────────────── S08 · CTA ─────────────── */
const CtaSection = () => (
  <section className="py-28 lg:py-36 bg-background text-center">
    <div className="max-w-[1240px] mx-auto px-6">
      <Reveal>
        <h2 className="font-serif break-keep text-[clamp(28px,4vw,48px)] font-semibold text-foreground leading-[1.2] tracking-[-0.02em] mb-5">
          우리 브랜드에 맞는 영상 전략,<br />무료로 먼저 들어보세요
        </h2>
        <p className="text-[17px] text-muted-foreground max-w-[480px] mx-auto leading-[1.9] mb-10">
          30분이면 됩니다. 어떤 영상이 매출로 이어질지, 채널 구조를 어떻게 잡을지 — 방향을 먼저 잡아드립니다.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/consult" className="inline-flex items-center gap-2 px-9 py-4 bg-primary text-primary-foreground text-[15px] font-bold tracking-[0.03em] hover:bg-gold-light transition-all rounded-md">
            무료 영상 전략 상담 신청 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ─────────────── Page ─────────────── */
const BrandedClient = () => (
  <div>
    <HeroSection />
    <PainSection />
    <ServicesSection />
    <PortfolioSection />
    <SocialProofSection />
    <DifferentiationSection />
    <ProcessSection />
    <CtaSection />
  </div>
);

export default BrandedClient;

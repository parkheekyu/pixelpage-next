"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, FileText } from "lucide-react";
import Reveal from "@/components/Reveal";
import ServicesTabSection from "@/components/ServicesTabSection";
import PhilosophySection from "@/components/PhilosophySection";
import ComparisonSection from "@/components/ComparisonSection";
import KnowledgeProductSection from "@/components/KnowledgeProductSection";
import charMale from "@/assets/char-male.png";
import charFemale from "@/assets/char-female.png";
import charCurly from "@/assets/char-curly.png";
import iconOk from "@/assets/icon-ok.svg";
import iconRocket from "@/assets/icon-rocket.svg";
import iconFileForm from "@/assets/icon-file-form.svg";
import iconCloud from "@/assets/icon-cloud.svg";
import iconAt from "@/assets/icon-at.svg";
import iconTrophy from "@/assets/icon-trophy.svg";

/* ─── 1. Hero ─── */
const HeroSection = () => (
  <section className="relative min-h-screen flex items-center pt-32 pb-24 overflow-hidden bg-[#0a0f1e]">
    <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-40" poster="">
      <source src="/hero-bg.mp4" type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e]/80 via-[#0a0f1e]/50 to-[#0a0f1e] pointer-events-none" />
    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e]/90 via-transparent to-transparent pointer-events-none" />
    <div className="absolute top-[20%] left-[50%] w-[600px] h-[600px] rounded-full bg-blue-600/[0.08] blur-[150px] pointer-events-none" />
    <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="absolute top-0 bottom-0 w-px bg-white" style={{ left: `${8 + i * 8}%` }} />
      ))}
    </div>
    <div className="relative z-10 max-w-[1240px] mx-auto w-full px-6 lg:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-[13px] tracking-[0.2em] uppercase text-white/40 mb-8 opacity-0 animate-fade-up stagger-1">
            <span className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              강의 &middot; 코칭 &middot; 컨설팅 &middot; 학원
            </span>
          </p>
          <h1 className="break-keep text-[clamp(38px,5.5vw,68px)] font-bold leading-[1.12] tracking-[-0.03em] text-white mb-7 opacity-0 animate-fade-up stagger-2">
            좋은 강의인데,<br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">왜 안 팔릴까요?</span>
          </h1>
          <p className="text-[18px] text-white/50 leading-[1.85] max-w-[480px] mb-10 opacity-0 animate-fade-up stagger-3">
            제품은 사진으로 팔리지만, 지식은 설득되어야 팔립니다.<br />
            강의 · 코칭 · 컨설팅을 파는 브랜드를 위한 퍼포먼스 파트너.
          </p>
          <div className="flex items-center gap-4 opacity-0 animate-fade-up stagger-4">
            <Link href="/consult" className="inline-flex items-center gap-2 px-9 py-4 bg-white text-[#0a0f1e] text-[16px] font-semibold rounded-xl hover:bg-white/90 transition-all shadow-lg shadow-white/10">
              무료 진단 받기
            </Link>
            <Link href="/#cases" className="inline-flex items-center px-8 py-4 border border-white/20 text-white/70 text-[16px] rounded-xl hover:bg-white/5 hover:border-white/40 transition-all">
              성과 사례 보기
            </Link>
          </div>
        </div>
        <div className="hidden lg:flex justify-center items-center relative h-[520px]">
          <div className="absolute top-0 right-4 animate-float stagger-2">
            <div className="blob-shape-1 w-[220px] h-[220px] overflow-hidden" style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.3)" }}>
              <img src={charMale.src} alt="" className="w-full h-full object-cover scale-110 object-[center_20%]" />
            </div>
            <span className="absolute -top-2 -left-8 z-10 bg-blue-500/20 text-blue-300 text-[13px] font-semibold px-4 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap shadow-sm">Meta Business Partner</span>
          </div>
          <div className="absolute bottom-0 right-12 animate-float stagger-4">
            <div className="blob-shape-2 w-[240px] h-[260px] overflow-hidden" style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.3)" }}>
              <img src={charFemale.src} alt="" className="w-full h-full object-cover scale-110" />
            </div>
          </div>
          <div className="absolute top-[28%] left-0 animate-float stagger-6">
            <div className="blob-shape-3 w-[200px] h-[220px] overflow-hidden" style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.3)" }}>
              <img src={charCurly.src} alt="" className="w-full h-full object-cover scale-110" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
      <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/30" />
    </div>
  </section>
);

/* ─── 2. Problem Agitation ─── */
const ProblemSection = () => {
  const pains = [
    { text: "광고는 돌아가는데, 상담 신청은 줄지 않는다", emoji: "/emojis/confused.svg" },
    { text: "대행사는 '노출·클릭은 좋아요'라고 하는데 매출은 그대로다", emoji: "/emojis/sad.svg" },
    { text: "좋은 커리큘럼인데, 왜 경쟁사 후기가 더 많은지 모르겠다", emoji: "/emojis/crying.svg" },
    { text: "SNS 콘텐츠도 찍어봤지만, 어떤 게 먹히는지 감이 안 온다", emoji: "/emojis/worried.svg" },
  ];
  return (
    <section className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-16">
          <img src={iconRocket.src} alt="" className="w-10 h-10 mb-5 mx-auto" />
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em]">
            혹시 이런 상황인가요?
          </h2>
        </Reveal>
        <Reveal>
          <div className="max-w-[760px] mx-auto space-y-8">
            {pains.map((p, i) => {
              const emojiLeft = i % 2 === 0;
              return (
                <div key={i} className={`flex items-center gap-5 md:gap-7 ${emojiLeft ? "" : "flex-row-reverse"}`}>
                  <div className="shrink-0 w-[72px] h-[72px] md:w-[90px] md:h-[90px] rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center shadow-sm">
                    <img src={p.emoji} alt="" className="w-10 h-10 md:w-12 md:h-12" />
                  </div>
                  <div className="flex-1 bg-white border border-[#e5e7eb] rounded-2xl px-6 py-5 md:px-7 md:py-6 shadow-sm">
                    <p className="text-[15px] md:text-[16px] text-foreground leading-[1.7]">{p.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
        <Reveal className="mt-16 text-center">
          <p className="text-[19px] text-foreground leading-[1.8] max-w-[560px] mx-auto">
            당신 잘못이 아닙니다.<br />
            <span className="font-bold">지식 상품은 원래 이렇게 팔면 안 팔립니다.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
};

/* ─── 3. Why Different ─── */
const WhyDifferentSection = () => (
  <section className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <div className="max-w-[720px] mx-auto">
        <Reveal>
          <img src={iconOk.src} alt="" className="w-10 h-10 mb-5" />
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em] mb-8">
            싸구려 후킹으로는,<br />팔지 않습니다.
          </h2>
          <p className="text-[17px] text-muted-foreground leading-[2] mb-8">
            &ldquo;지금 아니면 손해&rdquo;, &ldquo;마감 임박&rdquo; — 클릭만 끌어내는 광고는 쉽습니다.<br />
            하지만 한 번 실망한 고객은 다시 오지 않습니다.
          </p>
          <p className="text-[17px] text-foreground leading-[2]">
            저희는 <span className="font-bold">유입부터 매출까지, 전 과정을 이해하고</span> 만듭니다.<br />
            억지 후킹 없이도 팔 수 있는 이유입니다.
          </p>
        </Reveal>
      </div>
    </div>
  </section>
);

/* ─── 4. How It Works ─── */
const ProcessSection = () => {
  const steps = [
    { t: "진단", d: "지금 퍼널의 어디가 새고 있는지 데이터로 찾습니다." },
    { t: "메시지 설계", d: "USP 개발, 경쟁사 분석, 고객 페르소나 정의." },
    { t: "실행", d: "광고 세팅, 콘텐츠 제작, 랜딩 최적화를 동시에 진행합니다." },
    { t: "리포팅", d: "숫자만 보내지 않습니다. 무엇을 배웠고, 다음에 무엇을 바꿀지 함께 공유합니다." },
  ];
  return (
    <section className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-16">
          <img src={iconFileForm.src} alt="" className="w-10 h-10 mb-5 mx-auto" />
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em]">
            이렇게 진행됩니다.
          </h2>
        </Reveal>
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 max-w-[1100px] mx-auto">
            {steps.map((s, i) => (
              <div key={s.t} className="border-t-2 border-blue-500 pt-8 pr-6 pb-8">
                <span className="text-[13px] text-blue-500 tracking-[0.1em] font-semibold">0{i + 1}</span>
                <h3 className="text-[18px] font-bold text-foreground mt-3 mb-3">{s.t}</h3>
                <p className="text-[14px] text-muted-foreground leading-[1.9]">{s.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ─── 5. Services — 기존 ServicesTabSection 컴포넌트 사용 ─── */

/* ─── 6. Cases ─── */
const CasesSection = () => (
  <section id="cases" className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-16">
        <img src={iconTrophy.src} alt="" className="w-10 h-10 mb-5 mx-auto" />
        <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em]">
          짧은 기간, 또렷한 결과.
        </h2>
      </Reveal>
      <div className="space-y-0">
        {[
          { cat: "온라인 교육", name: "디지털노마드 하이클래스", metric: "ROAS 180% → 420%", quote: "직접 운영했을 때 ROAS 180%에서 협업 후 ROAS 420%로. 메시지 프레임워크를 재설계하고 크리에이티브를 교체한 결과, 6개월간 꾸준히 업계 평균 2배 이상의 효율을 유지하고 있습니다." },
          { cat: "B2B 지식 서비스", name: "부트스트래퍼", metric: "ROAS 500%", quote: "4천만 원 예산으로 ROAS 500% 달성. 고단가 B2B 지식 상품은 못 판다는 게 업계 통념이었습니다. 정확한 메시지 설계 하나로 팔기 어려운 상품도 팔린다는 걸 증명했습니다." },
          { cat: "오프라인 교육", name: "플러스 스피치 학원", metric: "매출 6.6배", quote: "1개 지점에서 5개 지점, 매출 6.6배 성장 (24개월). 지역별 타겟 세그먼트와 지점별 메시지 차별화로 신규 지점 4곳을 순차 오픈했습니다." },
          { cat: "가맹 네트워크", name: "라 컴퍼니", metric: "전국 7개 지점", quote: "브랜드 통일성은 유지하면서, 지역별로 다른 메시지를 설계했습니다. 전국 커버리지를 완성한 가맹 마케팅 사례입니다." },
        ].map(c => (
          <Reveal key={c.name}>
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-16 py-12 border-t border-[#e5e7eb] items-start">
              <div>
                <span className="text-[12px] text-muted-foreground tracking-[0.1em] uppercase">{c.cat}</span>
                <h3 className="text-[22px] lg:text-[26px] font-bold text-foreground mt-2">{c.name}</h3>
                <span className="inline-block mt-2 text-[13px] font-semibold text-blue-500 bg-blue-50 px-3 py-1 rounded-full">{c.metric}</span>
              </div>
              <p className="text-[17px] lg:text-[18px] text-foreground/80 leading-[1.85] tracking-[-0.01em]">{c.quote}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ─── 7. Why It Works — PhilosophySection (Notion/Sheets/Meta 목업) 사용 ─── */

/* ─── 8. Lead Magnet ─── */
const LeadMagnetSection = () => (
  <section className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
    <div className="max-w-[640px] mx-auto px-6 lg:px-12 text-center">
      <Reveal>
        <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em] mb-6">
          아직 상담까지는 이르다면.
        </h2>
        <div className="border border-[#e5e7eb] rounded-2xl p-10 bg-[#fbfbfb] mt-10">
          <FileText className="w-10 h-10 text-blue-500 mx-auto mb-5" />
          <h3 className="text-[20px] font-bold text-foreground mb-3">지식 상품 퍼널 진단 체크리스트</h3>
          <p className="text-[14px] text-muted-foreground mb-2">PDF, 12p</p>
          <p className="text-[15px] text-muted-foreground leading-[1.8] mb-8">당신의 퍼널에서 매출이 새고 있는 7가지 지점을<br />스스로 점검해보세요.</p>
          <Link href="/consult" className="inline-flex items-center gap-2 px-8 py-4 bg-[#0a0f1e] text-white text-[15px] font-semibold rounded-xl hover:bg-[#0a0f1e]/90 transition-all">
            무료로 받기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ─── 9. FAQ ─── */
const FaqSection = () => {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "월 비용은 어느 정도인가요?", a: "프로젝트 규모에 따라 다르지만, 보통 월 600만원부터 시작합니다. 첫 상담에서 예산 범위를 함께 확인합니다." },
    { q: "최소 계약 기간이 있나요?", a: "퍼포먼스 마케팅은 최소 3개월을 권장합니다. 첫 달은 학습, 두 번째 달부터 최적화가 본격화되기 때문입니다." },
    { q: "기존 대행사가 있는데도 상담 가능한가요?", a: "물론입니다. 현재 성과를 객관적으로 진단해드리고, 필요한 경우에만 이관을 제안합니다." },
    { q: "어떤 규모의 브랜드와 일하나요?", a: "월 광고비 300만원 이상, 지식 상품을 판매하는 브랜드를 주로 담당합니다." },
  ];
  return (
    <section className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
      <div className="max-w-[700px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-14">
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em]">
            자주 묻는 질문.
          </h2>
        </Reveal>
        <Reveal>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left hover:bg-[#fbfbfb] transition-colors">
                  <span className="text-[16px] font-semibold text-foreground">{f.q}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ml-4 ${open === i ? "rotate-180" : ""}`} />
                </button>
                {open === i && (
                  <div className="px-6 pb-6">
                    <p className="text-[15px] text-muted-foreground leading-[1.85]">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ─── 10. Final CTA ─── */
const CtaSection = () => (
  <section id="contact" className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal>
        <img src={iconAt.src} alt="" className="w-10 h-10 mb-5" />
        <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em] mb-5">
          한 번 얘기해봐요.
        </h2>
        <p className="text-[19px] text-muted-foreground max-w-[520px] leading-[1.9] mb-10">
          계약이 목표가 아닙니다. 지금 당신 브랜드의 퍼널 어디가 새고 있는지, 30분 안에 찾아드립니다. 필요한 것만 가져가세요.
        </p>
        <a href="mailto:contact@pixelpage.co.kr" className="block text-[24px] font-bold text-foreground/80 hover:text-blue-500 transition-colors mb-2">
          contact@pixelpage.co.kr
        </a>
        <p className="text-[14px] text-muted-foreground mb-8">보통 24시간 이내 회신드립니다.</p>
        <Link href="/consult" className="inline-flex items-center gap-2 px-9 py-4 bg-[#0a0f1e] text-white text-[16px] font-semibold rounded-xl hover:bg-[#0a0f1e]/90 transition-all">
          무료 상담 신청 <ArrowRight className="w-4 h-4" />
        </Link>
      </Reveal>
    </div>
  </section>
);

/* ─── Page ─── */
const IndexClient = () => (
  <div>
    <HeroSection />
    <KnowledgeProductSection />
    <ProblemSection />
    <ComparisonSection />
    <WhyDifferentSection />
    <ProcessSection />
    <ServicesTabSection />
    <CasesSection />
    <PhilosophySection
      heading={<>압도적인 성과를<br />낼 수 있는 이유.</>}
      icon={iconCloud.src}
      iconAlt=""
    />
    <LeadMagnetSection />
    <FaqSection />
    <CtaSection />
  </div>
);

export default IndexClient;

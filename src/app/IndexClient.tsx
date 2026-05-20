"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import Reveal from "@/components/Reveal";
import ServicesTabSection from "@/components/ServicesTabSection";
import PhilosophySection from "@/components/PhilosophySection";
import KnowledgeProductSection from "@/components/KnowledgeProductSection";
import iconRocket from "@/assets/icon-rocket.svg";
import iconCloud from "@/assets/icon-cloud.svg";
import iconAt from "@/assets/icon-at.svg";
import iconTrophy from "@/assets/icon-trophy.svg";

/* ─── 1. Hero ─── */
const HeroSection = () => (
  <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
    {/* 히어로 배경 영상 */}
    <div className="absolute bottom-[-55%] left-0 right-0 pointer-events-none z-0 flex justify-center">
      <video autoPlay muted loop playsInline className="w-full max-w-[1534px] object-contain">
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
    </div>

    <div className="relative z-10 text-center px-6 pt-24 pb-8 -mt-48">
      <h1 className="break-keep text-[clamp(36px,6vw,72px)] font-bold leading-[1.12] tracking-[-0.03em] mb-7 opacity-0 animate-fade-up stagger-1 text-white">
        단순 광고가 아닌,<br />매출 파이프라인을 만듭니다.
      </h1>
      <p className="text-[16px] md:text-[18px] text-white/50 leading-[1.85] max-w-[520px] mx-auto mb-10 opacity-0 animate-fade-up stagger-2">
        광고만 잘 돌아가도 매출이 안 나오는 이유가 있습니다.<br />
        퍼널이 끊기기 때문입니다.
      </p>
      <div className="opacity-0 animate-fade-up stagger-3">
        <Link
          href="/consult"
          className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/30 text-white text-[15px] font-medium rounded-lg hover:bg-white/10 hover:border-white/50 transition-all"
        >
          무료 진단 받기
        </Link>
      </div>
    </div>

    <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center">
      <img src="/meta-partner-badge.png" alt="Meta Business Partners" className="h-8" />
    </div>
  </section>
);

/* ─── 2. Problem Agitation ─── */
const ProblemSection = () => {
  const pains = [
    { bold: "광고 대행사는 랜딩 탓, 랜딩 제작사는 광고 탓.", sub: "성과가 안 나와도 책임지는 곳이 없습니다.", emoji: "/emojis/crying.svg" },
    { bold: "이번 달도 광고비 수백만 원 나갔습니다.", sub: "근데 상담 신청은 세 개입니다.", emoji: "/emojis/worried.svg" },
    { bold: "대행사 보고서엔 클릭률, 노출수가 가득합니다.", sub: "매출은 왜 그대로일까?", emoji: "/emojis/sad.svg" },
    { bold: "상담 신청이 왔는데 후속 연락을 놓쳤습니다.", sub: "그 리드, 다음 날 경쟁사로 갔습니다.", emoji: "/emojis/confused.svg" },
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
                    <p className="text-[15px] md:text-[16px] leading-[1.7]">
                      <span className="font-bold text-foreground">{p.bold}</span>
                      <span className="block text-muted-foreground mt-1">{p.sub}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ─── 3. 지식 상품은 다르게 + 아이폰 릴스 ─── */


/* ─── 5. Services — 기존 ServicesTabSection 컴포넌트 사용 ─── */

/* ─── 6. Cases ─── */
const CasesSection = () => (
  <section id="cases" className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-16">
        <img src={iconTrophy.src} alt="" className="w-10 h-10 mb-5 mx-auto" />
        <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em]">
          숫자로만 말합니다.
        </h2>
      </Reveal>
      <div className="space-y-0">
        {[
          { cat: "Case 01", name: "커머스 브랜드", metric: "ROAS 8.4×", quote: "광고비 한 푼당 8.4배 매출. 광고·랜딩·시퀀스를 하나의 메시지로 정렬해 만든 결과입니다." },
          { cat: "Case 02", name: "서비스 브랜드", metric: "CPA −62%", quote: "전환 단가를 62% 줄였습니다. 타겟 정밀화와 퍼널 누수 차단을 동시에 진행한 결과입니다." },
          { cat: "Case 03", name: "B2B SaaS", metric: "전환율 3.2×", quote: "기존 대비 3.2배 높은 전환율. 리드 퀄리티와 후속 시퀀스를 함께 설계해 만든 숫자입니다." },
          { cat: "Case 04", name: "지식 상품", metric: "매출 6.6배", quote: "24개월 동안 매출 6.6배 성장. 광고-랜딩-CRM이 끊김 없이 연결된 파이프라인의 결과입니다." },
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
  <section className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
    <div className="max-w-[640px] mx-auto px-6 lg:px-12 text-center">
      <Reveal>
        <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em] mb-6">
          아직 상담까지는 이르다면.
        </h2>
        <div className="border border-[#e5e7eb] rounded-2xl p-10 bg-[#fbfbfb] mt-10">
          <FileText className="w-10 h-10 text-blue-500 mx-auto mb-5" />
          <h3 className="text-[20px] font-bold text-foreground mb-3">지식 상품 퍼널 진단 체크리스트</h3>
          <p className="text-[14px] text-muted-foreground mb-2">PDF, 12p</p>
          <p className="text-[15px] text-muted-foreground leading-[1.8] mb-8">당신의 퍼널에서 매출이 새고 있는 7가지 지점을<br />스스로 점검해봅니다.</p>
          <Link href="/consult" className="inline-flex items-center gap-2 px-8 py-4 bg-[#0a0f1e] text-white text-[15px] font-semibold rounded-xl hover:bg-[#0a0f1e]/90 transition-all">
            무료로 받기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Reveal>
    </div>
  </section>
);


/* ─── 10. Final CTA ─── */
const CtaSection = () => (
  <section id="contact" className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal>
        <img src={iconAt.src} alt="" className="w-10 h-10 mb-5" />
        <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em] mb-5">
          파이프라인,<br />어디서 새는지 찾아드립니다.
        </h2>
        <p className="text-[19px] text-muted-foreground max-w-[520px] leading-[1.9] mb-10">
          무료 마케팅 진단 — 30분이면 됩니다.<br />
          계약 없이도 괜찮습니다.
          <br /><br />
          진단 후 대행이 필요하면 대행을,<br />
          방향만 필요하면 컨설팅을 제안드립니다.
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
    <ProblemSection />
    <KnowledgeProductSection />
    <ServicesTabSection />
    <CasesSection />
    <PhilosophySection
      heading={<>압도적인 성과를<br />낼 수 있는 이유.</>}
      icon={iconCloud.src}
      iconAlt=""
    />
    <CtaSection />
  </div>
);

export default IndexClient;

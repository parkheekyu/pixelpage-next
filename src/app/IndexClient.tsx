"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import ServicesTabSection from "@/components/ServicesTabSection";
import PhilosophySection from "@/components/PhilosophySection";
import ComparisonSection from "@/components/ComparisonSection";
import KnowledgeProductSection from "@/components/KnowledgeProductSection";
import iconCloud from "@/assets/icon-cloud.svg";
import iconAt from "@/assets/icon-at.svg";
import iconTrophy from "@/assets/icon-trophy.svg";


const IndexClient = () => {
  return (
    <div>
      {/* ─── HERO — dark gradient + video bg ─── */}
      <section className="relative min-h-screen flex items-center pt-32 pb-24 overflow-hidden bg-[#0a0f1e]">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          poster=""
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e]/80 via-[#0a0f1e]/50 to-[#0a0f1e] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e]/90 via-transparent to-transparent pointer-events-none" />

        {/* Subtle glow */}
        <div className="absolute top-[20%] left-[50%] w-[600px] h-[600px] rounded-full bg-blue-600/[0.08] blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] rounded-full bg-indigo-500/[0.06] blur-[120px] pointer-events-none" />

        {/* Vertical light bars — like AIVORA */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-white"
              style={{ left: `${8 + i * 8}%` }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-[1240px] mx-auto w-full px-6 lg:px-12">
          <div className="max-w-[720px] mx-auto text-center">
            <p className="text-[13px] tracking-[0.2em] uppercase text-white/40 mb-8 opacity-0 animate-fade-up stagger-1">
              <span className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                강의 &middot; 코칭 &middot; 컨설팅 &middot; 학원
              </span>
            </p>

            <h1 className="break-keep text-[clamp(38px,5.5vw,68px)] font-bold leading-[1.12] tracking-[-0.03em] text-white mb-7 opacity-0 animate-fade-up stagger-2">
              가르치는 일에 집중하세요.<br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">파는 일은 저희가 합니다.</span>
            </h1>

            <p className="text-[18px] text-white/50 leading-[1.85] max-w-[480px] mx-auto mb-10 opacity-0 animate-fade-up stagger-3">
              지식을 파는 브랜드의 퍼포먼스 파트너.<br />
              마케팅에 시간 뺏기는 문제를 끝내드립니다.
            </p>

            <div className="flex items-center justify-center gap-4 opacity-0 animate-fade-up stagger-4">
              <Link href="/consult" className="inline-flex items-center gap-2 px-9 py-4 bg-white text-[#0a0f1e] text-[16px] font-semibold rounded-xl hover:bg-white/90 transition-all shadow-lg shadow-white/10">
                무료 상담 신청
              </Link>
              <Link href="/#cases" className="inline-flex items-center px-8 py-4 border border-white/20 text-white/70 text-[16px] rounded-xl hover:bg-white/5 hover:border-white/40 transition-all">
                성과 보기
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/30" />
          <span className="text-[10px] text-white/25 tracking-[0.15em] uppercase">Scroll</span>
        </div>
      </section>

      <KnowledgeProductSection />

      <ComparisonSection />

      <ServicesTabSection />

      {/* ─── CASES ─── */}
      <section id="cases" className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <Reveal className="text-center mb-16">
            <div>
              <img src={iconTrophy.src} alt="Cases" className="w-10 h-10 mb-5 mx-auto" />
              <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.35] tracking-[-0.01em]">
                짧은 기간,<br />또렷한 결과.
              </h2>
            </div>
            <p className="text-[19px] text-muted-foreground max-w-[480px] mx-auto leading-[1.9] mt-4">
              지식 상품 브랜드와 함께한 실제 성과입니다.
            </p>
          </Reveal>

          <div className="space-y-0">
            {[
              { cat: "온라인 교육", name: "디지털노마드 하이클래스", quote: "대형 커뮤니티를 보유한 온라인 교육 브랜드. 업계 평균을 크게 웃도는 광고 효율을 달성하며, 한정된 예산으로도 높은 전환 효율을 증명했습니다.", person: "광고 성과 기준" },
              { cat: "B2B 지식 서비스", name: "부트스트래퍼", quote: "고단가 B2B 지식 상품을 단 4천만 원 예산으로 ROAS 500%를 달성했습니다. 팔기 어려운 상품도 메시지 설계가 정확하면 팔린다는 것을 보여준 사례입니다.", person: "ROAS 500% 달성" },
              { cat: "오프라인 교육", name: "플러스 스피치 학원", quote: "단일 지점에서 시작해 4개 신규 지점을 오픈하며 매출을 6.6배 성장시켰습니다. 무형의 교육 서비스를 지역 기반으로 확장한 대표 사례입니다.", person: "매출 6.6배 성장" },
              { cat: "가맹 네트워크", name: "라 컴퍼니", quote: "전국 7개 지점의 가맹 네트워크를 마케팅으로 확장한 프로젝트입니다. 브랜드 통일성을 유지하면서 각 지역에 맞는 메시지를 설계해 전국 커버리지를 완성했습니다.", person: "전국 7개 지점 확장" },
            ].map((c) => (
              <Reveal key={c.name}>
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-16 py-12 border-t border-border items-start">
                  <div>
                    <span className="text-[12px] text-muted-foreground tracking-[0.1em] uppercase">{c.cat}</span>
                    <h3 className="text-[22px] lg:text-[26px] font-semibold text-foreground mt-2">{c.name}</h3>
                  </div>
                  <div>
                    <p className="text-[17px] lg:text-[19px] text-foreground leading-[1.85] tracking-[-0.01em]">
                      &ldquo;{c.quote}&rdquo;
                    </p>
                    <p className="text-[13px] text-muted-foreground mt-4">{c.person}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY WE DELIVER ─── */}
      <PhilosophySection
        heading={<>압도적인 성과를<br />낼 수 있는 이유?</>}
        icon={iconCloud.src}
        iconAlt="Why"
      />

      {/* ─── CONTACT ─── */}
      <section id="contact" className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <Reveal>
            <img src={iconAt.src} alt="Contact" className="w-10 h-10 mb-5" />
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.35] tracking-[-0.01em] mb-5">
              한 번 얘기해봐요.
            </h2>
            <p className="text-[19px] text-muted-foreground max-w-[480px] leading-[1.9] mt-4 mb-10">
              지금 당장 계약이 목표가 아닙니다. 강의 · 코칭 · 컨설팅을 어떻게 더 잘 팔 수 있는지, 함께 생각해 보는 것부터 시작합니다.
            </p>
            <a href="mailto:contact@pixelpage.co.kr" className="block text-[24px] font-semibold text-foreground/80 hover:text-primary transition-colors mb-2">
              contact@pixelpage.co.kr
            </a>
            <p className="text-[14px] text-muted-foreground mb-8">보통 24시간 이내 회신드립니다.</p>
            <Link href="/consult" className="inline-flex items-center gap-2 px-9 py-4 bg-primary text-primary-foreground text-[16px] font-semibold tracking-[0.02em] hover:bg-gold-light transition-all rounded-xl">
              무료 상담 신청 <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default IndexClient;

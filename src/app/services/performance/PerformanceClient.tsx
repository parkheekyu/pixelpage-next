"use client";

import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import illustPerformance from "@/assets/illust-performance.png";

const PerformanceClient = () => (
  <div>
    {/* Hero */}
    <section className="pt-32 pb-24 lg:pb-32 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary transition-colors mb-10">
          <ArrowLeft className="w-3 h-3" /> 홈으로
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">01 · Performance Marketing</p>
            <h1 className="font-serif break-keep text-[clamp(36px,5vw,64px)] font-normal text-foreground leading-[1.15] tracking-[-0.02em] mb-6">
              퍼포먼스 마케팅
            </h1>
            <p className="text-[17px] text-muted-foreground leading-[1.85] max-w-[480px] mb-8">
              무형 서비스 광고의 핵심은 &apos;예산의 크기&apos;가 아닌 <strong className="text-foreground font-medium">&apos;구매 의향이 있는 사람을 얼마나 정확하게 찾는가&apos;</strong>입니다.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Meta Ads", "Google Ads", "토스애즈", "당근마켓", "TikTok"].map(t => (
                <span key={t} className="text-[12px] text-muted-foreground bg-secondary border border-border px-3 py-1 rounded-full">{t}</span>
              ))}
            </div>
          </Reveal>
          <div className="hidden lg:flex justify-center">
            <img src={illustPerformance.src} alt="퍼포먼스 마케팅" className="w-[300px] animate-float" loading="lazy" />
          </div>
        </div>
      </div>
    </section>

    {/* KPI */}
    <section className="py-16 bg-dark">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="flex flex-wrap justify-between gap-8">
          {[{ n: "3.93", u: "%", l: "Avg. CTR" }, { n: "500", u: "%", l: "Peak ROAS" }, { n: "280", u: "+", l: "캠페인 집행" }, { n: "70,000", u: "+", l: "커뮤니티 회원" }].map(k => (
            <div key={k.l} className="text-center">
              <span className="text-[36px] font-display font-normal text-cream tracking-[-0.02em]">{k.n}<span className="text-[16px] text-cream/40 ml-0.5">{k.u}</span></span>
              <span className="block text-[11px] text-cream/30 tracking-[0.08em] uppercase mt-1">{k.l}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* Why different */}
    <section className="py-32 lg:py-40 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">왜 다른가요?</p>
          <h2 className="font-serif break-keep text-[clamp(28px,4vw,48px)] font-normal text-foreground leading-[1.15] tracking-[-0.02em] mb-8 max-w-[600px]">
            무형 서비스 광고는<br />일반 이커머스 광고와 다릅니다.
          </h2>
        </Reveal>
        <div className="mt-3 mb-12 w-16 h-px bg-primary" />
        <Reveal>
          <div className="max-w-[720px] space-y-6">
            <p className="text-[16px] text-muted-foreground leading-[2]">
              온라인 쇼핑몰의 광고는 단순합니다. 제품 사진을 보여주고, 할인율을 강조하면 됩니다. 하지만 교육, 코칭, 컨설팅, 체험형 서비스를 파는 브랜드는 다릅니다. 고객이 &apos;이걸 경험해 보고 싶다&apos;고 느끼기까지의 과정이 훨씬 복잡합니다.
            </p>
            <p className="text-[16px] text-muted-foreground leading-[2]">
              그래서 우리는 단순히 &apos;많이 노출&apos;하는 광고를 하지 않습니다. <strong className="text-foreground font-medium">의향 없는 클릭은 줄이고 전환 가능성이 높은 관객만 남기는 구조</strong>를 만듭니다. 서사형 크리에이티브로 &apos;광고 같지 않은 광고&apos;를 만들어, 브랜드 톤을 보존하면서도 구매 의향을 만들어냅니다.
            </p>
          </div>
        </Reveal>
      </div>
    </section>

    {/* Service detail cards */}
    <section className="py-32 lg:py-40 bg-dark text-cream">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">서비스 상세</p>
          <h2 className="font-serif break-keep text-[clamp(28px,4vw,48px)] font-normal text-cream leading-[1.15] tracking-[-0.02em]">
            구체적으로 뭘 하나요?
          </h2>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[
            { t: "의향 기반 타겟팅", d: "'관심 있는 사람'이 아니라 '실제로 올 사람'을 정의하고 찾습니다. 행동 패턴과 관심사 기반으로 타겟을 세분화합니다." },
            { t: "서사형 크리에이티브", d: "광고가 아닌 것처럼 보이는 광고를 만듭니다. 브랜드 고유의 서사와 톤을 보존하면서 '경험해 보고 싶다'는 감정을 설계합니다." },
            { t: "리드 단가 · ROAS 최적화", d: "노출 수나 클릭 수 같은 허수 지표가 아닌, 실제 전환 당 비용(CPA)과 매출 대비 수익률(ROAS)로 성과를 관리합니다." },
            { t: "매 시즌 A/B 테스트", d: "소재, 카피, 타겟, 랜딩 페이지를 매 시즌 반복 테스트합니다. 감이 아닌 데이터로 의사결정하며, 검증된 조합만 스케일업합니다." },
            { t: "멀티 플랫폼 운영", d: "Meta, Google, 토스애즈, 당근마켓, TikTok 등 주요 플랫폼을 동시 운영합니다. 전체 예산을 효율적으로 배분합니다." },
            { t: "주간 리포트 · 소통", d: "핵심 숫자와 다음 주 실행 계획을 간결하게 전달합니다. 슬랙이나 카카오톡으로 실시간 소통도 가능합니다." },
          ].map(item => (
            <div key={item.t} className="border border-cream/10 rounded-lg p-7 hover:bg-cream/5 transition-colors">
              <h4 className="text-[15px] font-medium text-cream mb-3">{item.t}</h4>
              <p className="text-[14px] text-cream/55 leading-[1.9]">{item.d}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* Platforms */}
    <section className="py-32 lg:py-40 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">Platforms</p>
          <h2 className="font-serif break-keep text-[clamp(28px,4vw,48px)] font-normal text-foreground leading-[1.15] tracking-[-0.02em]">
            지원 플랫폼 상세
          </h2>
          <p className="text-[16px] text-muted-foreground mt-5 max-w-[520px] leading-[2]">
            각 플랫폼의 강점을 이해하고, 브랜드에 가장 적합한 조합을 설계합니다.
          </p>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: "f", name: "Meta Ads", sub: "Facebook · Instagram", desc: "가장 정밀한 타겟팅. 무형 서비스 광고에서 가장 높은 효율을 보입니다." },
            { icon: "G", name: "Google Ads", sub: "Search · Display · YouTube", desc: "'이미 찾고 있는 사람'을 잡는 검색 광고와 인지를 확장하는 디스플레이 광고." },
            { icon: "T", name: "토스애즈", sub: "핀테크 네이티브 광고", desc: "2030 금융·자기계발 관심층에게 네이티브하게 노출됩니다." },
            { icon: "D", name: "당근마켓", sub: "하이퍼로컬 광고", desc: "학원, 스튜디오 등 오프라인 기반 서비스에 최적화된 하이퍼로컬 광고." },
            { icon: "♪", name: "TikTok Ads", sub: "숏폼 광고", desc: "15-60초 숏폼으로 강렬한 첫 인상. 젊은 층 대상 서비스에 효과적." },
            { icon: "★", name: "크로스 플랫폼", sub: "통합 운영", desc: "전체 마케팅 퍼널을 하나로 관리. 각 플랫폼의 시너지를 만듭니다." },
          ].map(p => (
            <div key={p.name} className="border border-border rounded-lg p-6 hover:shadow-card-hover transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-[16px] text-primary font-bold">{p.icon}</span>
                <div>
                  <span className="block text-[14px] font-medium text-foreground">{p.name}</span>
                  <span className="block text-[11px] text-muted-foreground">{p.sub}</span>
                </div>
              </div>
              <p className="text-[14px] text-muted-foreground leading-[1.9]">{p.desc}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* Process */}
    <section className="py-32 lg:py-40 bg-dark text-cream">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">Process</p>
          <h2 className="font-serif break-keep text-[clamp(28px,4vw,48px)] font-normal text-cream leading-[1.15] tracking-[-0.02em]">
            데이터 기반 4단계 프로세스
          </h2>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-0">
          {[
            { s: "01", t: "브랜드 · 상품 분석", d: "무형 서비스의 핵심 가치를 정의합니다. 기존 광고 자산을 진단하고, 타겟 관객의 구매 여정을 분석합니다." },
            { s: "02", t: "채널 · 예산 설계", d: "브랜드에 가장 적합한 플랫폼 조합과 예산 배분을 설계합니다. KPI와 타임라인을 함께 정합니다." },
            { s: "03", t: "소재 제작 · 테스트", d: "서사형 크리에이티브를 제작합니다. A/B 테스트를 반복하고, 가장 효과적인 조합을 찾습니다." },
            { s: "04", t: "최적화 · 스케일업", d: "매주 데이터를 리뷰하며 소재 · 타겟 · 예산을 지속 최적화합니다. 검증된 조합을 스케일업합니다." },
          ].map(p => (
            <div key={p.s} className="border-t-2 border-primary pt-8 pr-8 pb-8">
              <span className="text-[13px] font-display text-primary tracking-[0.1em]">{p.s}</span>
              <h3 className="text-[18px] font-medium text-cream mt-4 mb-4">{p.t}</h3>
              <p className="text-[15px] text-cream/60 leading-[2]">{p.d}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 bg-background text-center">
      <div className="max-w-[1240px] mx-auto px-6">
        <Reveal>
          <h2 className="font-serif break-keep text-[clamp(24px,3vw,36px)] font-normal text-foreground mb-4">퍼포먼스 마케팅이 필요하신가요?</h2>
          <p className="text-[15px] text-muted-foreground mb-8 max-w-[440px] mx-auto leading-[1.9]">무료 상담에서 브랜드를 함께 진단하고, 최적의 채널 · 예산 · 전략을 제안드립니다.</p>
          <Link href="/consult" className="inline-flex items-center gap-2 px-9 py-4 bg-primary text-primary-foreground text-[14px] font-bold tracking-[0.05em] hover:bg-gold-light transition-all hover:-translate-y-0.5">
            무료 상담 신청 <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  </div>
);

export default PerformanceClient;

"use client";

import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import illustWeb from "@/assets/illust-web.png";

const WebBuildClient = () => (
  <div>
    {/* Hero */}
    <section className="pt-32 pb-24 lg:pb-32 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary transition-colors mb-10">
          <ArrowLeft className="w-3 h-3" /> 홈으로
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">05 · Web Build</p>
            <h1 className="font-serif text-[clamp(36px,5vw,64px)] font-normal text-foreground leading-[1.15] tracking-[-0.02em] mb-6">
              웹 빌드
            </h1>
            <p className="text-[17px] text-muted-foreground leading-[1.85] max-w-[480px] mb-8">
              보여주기 위한 웹이 아닌, <strong className="text-foreground font-medium">파는 웹</strong>. 광고를 클릭한 관객이 처음 만나는 곳을 전환이 일어나도록 설계합니다.
            </p>
            <div className="flex flex-wrap gap-2">
              {["랜딩 페이지", "브랜드 사이트", "엔터프라이즈"].map(t => (
                <span key={t} className="text-[12px] text-muted-foreground bg-secondary border border-border px-3 py-1 rounded-full">{t}</span>
              ))}
            </div>
          </Reveal>
          <div className="hidden lg:flex justify-center">
            <img src={illustWeb.src} alt="웹 빌드" className="w-[300px] animate-float" loading="lazy" />
          </div>
        </div>
      </div>
    </section>

    {/* Why */}
    <section className="py-32 lg:py-40 bg-dark text-cream">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">왜 중요한가요?</p>
          <h2 className="font-serif text-[clamp(28px,4vw,48px)] font-normal text-cream leading-[1.15] tracking-[-0.02em] mb-8 max-w-[600px]">
            광고비의 절반은<br />웹사이트에서 낭비됩니다.
          </h2>
        </Reveal>
        <div className="mt-3 mb-12 w-16 h-px bg-primary" />
        <Reveal>
          <div className="max-w-[720px] space-y-6">
            <p className="text-[16px] text-cream/70 leading-[2]">
              아무리 좋은 광고를 만들어도, 클릭 후 도착하는 웹사이트가 형편없으면 전환이 일어나지 않습니다. 로딩이 느리거나, 모바일에서 깨지거나, CTA가 명확하지 않으면 — 광고비의 절반은 웹사이트에서 낭비되고 있는 겁니다.
            </p>
            <p className="text-[16px] text-cream/70 leading-[2]">
              PIXELPAGE의 웹 빌드는 <strong className="text-cream font-medium">광고 → 랜딩 → 상담 신청까지의 전환 퍼널을 설계</strong>하고, 그에 맞게 빌드합니다. 픽셀 설치, CRM 연동, 리드 자동 수집까지 포함됩니다.
            </p>
          </div>
        </Reveal>
      </div>
    </section>

    {/* 3 Tiers */}
    <section className="py-32 lg:py-40 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">Service Tiers</p>
          <h2 className="font-serif text-[clamp(28px,4vw,48px)] font-normal text-foreground leading-[1.15] tracking-[-0.02em]">
            필요에 맞는 3가지 빌드
          </h2>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-border rounded-lg p-8 hover:shadow-card-hover transition-shadow">
            <h4 className="font-serif text-[20px] font-normal text-foreground mb-4">Landing Page</h4>
            <p className="text-[14px] text-muted-foreground leading-[1.9] mb-6">
              단일 전환 목적의 고집중 랜딩 페이지. &apos;상담 신청&apos; 또는 &apos;구매&apos;라는 하나의 행동에 집중합니다.
            </p>
            {["광고 연동 전환 최적화", "모바일 퍼스트 반응형", "Meta · Google 픽셀 연동", "A/B 테스트용 다중 버전"].map(li => (
              <p key={li} className="text-[13px] text-muted-foreground pl-3 py-1.5 border-l-2 border-primary/30 mb-1">{li}</p>
            ))}
          </div>
          <div className="border-2 border-primary rounded-lg p-8 relative hover:shadow-card-hover transition-shadow">
            <span className="absolute -top-2.5 left-5 text-[9px] font-bold bg-primary text-primary-foreground px-2.5 py-0.5 rounded tracking-[0.04em]">Most Popular</span>
            <h4 className="font-serif text-[20px] font-normal text-foreground mb-4">Brand Website</h4>
            <p className="text-[14px] text-muted-foreground leading-[1.9] mb-6">
              브랜드 전체를 아우르는 멀티 페이지 웹 경험. CMS · 블로그 · CRM · 결제까지 연동합니다.
            </p>
            {["멀티 페이지 브랜드 사이트", "블로그 · CMS 연동", "CRM · 리드 수집 자동화", "결제 시스템 통합 (PG)"].map(li => (
              <p key={li} className="text-[13px] text-muted-foreground pl-3 py-1.5 border-l-2 border-primary/30 mb-1">{li}</p>
            ))}
          </div>
          <div className="border border-border rounded-lg p-8 hover:shadow-card-hover transition-shadow">
            <h4 className="font-serif text-[20px] font-normal text-foreground mb-4">Enterprise</h4>
            <p className="text-[14px] text-muted-foreground leading-[1.9] mb-6">
              가맹 · B2B · 다지점 사업을 위한 대형 풀빌드. 회원 시스템, 예약 · 결제, AI 자동화까지.
            </p>
            {["회원 · 로그인 시스템", "예약 · 결제 풀스택", "AI 마케팅 자동화 연동", "유지보수 · 기능 확장"].map(li => (
              <p key={li} className="text-[13px] text-muted-foreground pl-3 py-1.5 border-l-2 border-primary/30 mb-1">{li}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>

    {/* Enterprise detail */}
    <section className="py-32 lg:py-40 bg-dark text-cream">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">Enterprise Grade</p>
          <h2 className="font-serif text-[clamp(28px,4vw,48px)] font-normal text-cream leading-[1.15] tracking-[-0.02em]">
            엔터프라이즈급 웹 빌드 상세
          </h2>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { t: "멀티 페이지 설계", d: "사용자 동선을 분석해 전환 최적화된 페이지 흐름을 만듭니다." },
            { t: "회원 · 결제 시스템", d: "소셜 로그인, PG사 연동, 구독 결제, 환불 처리를 자동화합니다." },
            { t: "AI 마케팅 자동화", d: "AI 기반 상품 추천, 챗봇 상담, 자동 이메일 발송을 구현합니다." },
            { t: "반응형 · 퍼포먼스", d: "Core Web Vitals를 통과하는 빠른 로딩 속도와 완벽한 반응형." },
            { t: "SEO 구조 설계", d: "메타 태그, 스키마 마크업, 사이트맵 등 SEO 기본 구조를 세팅합니다." },
            { t: "유지보수 · 확장", d: "런칭 후 업데이트, 신규 기능 추가, 보안 업데이트를 지원합니다." },
          ].map(f => (
            <div key={f.t} className="border border-cream/10 rounded-lg p-6 hover:bg-cream/5 transition-colors">
              <h4 className="text-[15px] font-medium text-cream mb-2">{f.t}</h4>
              <p className="text-[14px] text-cream/55 leading-[1.9]">{f.d}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* What's included */}
    <section className="py-32 lg:py-40 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">모든 빌드에 포함</p>
          <h2 className="font-serif text-[clamp(28px,4vw,48px)] font-normal text-foreground leading-[1.15] tracking-[-0.02em]">
            기본 포함 사항
          </h2>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { t: "모바일 퍼스트 반응형 디자인", d: "유입의 70% 이상이 모바일입니다. 모바일을 먼저 설계하고, 모든 디바이스에서 완벽한 레이아웃을 보장합니다." },
            { t: "Meta · Google 픽셀 연동", d: "어떤 광고에서 유입된 사용자가 실제로 전환했는지 정확하게 추적합니다." },
            { t: "SEO 기본 설정", d: "메타 태그, 오픈그래프, 사이트맵, robots.txt 등 검색엔진 최적화 기본 설정을 세팅합니다." },
            { t: "속도 최적화", d: "이미지 최적화, 코드 최소화, 캐싱 설정 등을 통해 3초 이내 로딩을 목표로 합니다." },
          ].map(item => (
            <div key={item.t} className="border border-border rounded-lg p-8 hover:shadow-card-hover transition-shadow">
              <h4 className="text-[16px] font-medium text-foreground mb-3">{item.t}</h4>
              <p className="text-[15px] text-muted-foreground leading-[1.9]">{item.d}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 bg-dark text-center">
      <div className="max-w-[1240px] mx-auto px-6">
        <Reveal>
          <h2 className="font-serif text-[clamp(24px,3vw,36px)] font-normal text-cream mb-4">전환되는 웹사이트가 필요하신가요?</h2>
          <p className="text-[15px] text-cream/60 mb-8 max-w-[440px] mx-auto leading-[1.9]">무료 상담에서 현재 웹사이트를 진단하고, 전환율을 높이는 최적의 빌드를 제안드립니다.</p>
          <a href="mailto:contact@pixelpage.co.kr" className="inline-flex items-center gap-2 px-9 py-4 bg-primary text-primary-foreground text-[14px] font-bold tracking-[0.05em] hover:bg-gold-light transition-all hover:-translate-y-0.5">
            무료 상담 신청 <ArrowRight className="w-4 h-4" />
          </a>
        </Reveal>
      </div>
    </section>
  </div>
);

export default WebBuildClient;

"use client";

import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import illustSeo from "@/assets/illust-seo.png";

const SeoClient = () => (
  <div>
    {/* Hero */}
    <section className="pt-32 pb-24 lg:pb-32 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary transition-colors mb-10">
          <ArrowLeft className="w-3 h-3" /> 홈으로
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">03 · Search Engine Optimization</p>
            <h1 className="font-serif break-keep text-[clamp(36px,5vw,64px)] font-normal text-foreground leading-[1.15] tracking-[-0.02em] mb-6">
              검색엔진 최적화
            </h1>
            <p className="text-[17px] text-muted-foreground leading-[1.85] max-w-[480px] mb-8">
              광고는 돈을 써서 보여주는 것이고, SEO는 <strong className="text-foreground font-medium">돈을 쓰지 않아도 찾아오게 만드는 것</strong>입니다.
            </p>
            <div className="flex flex-wrap gap-2">
              {["네이버 SEO", "구글 SEO (준비 중)"].map(t => (
                <span key={t} className="text-[12px] text-muted-foreground bg-secondary border border-border px-3 py-1 rounded-full">{t}</span>
              ))}
            </div>
          </Reveal>
          <div className="hidden lg:flex justify-center">
            <img src={illustSeo.src} alt="검색엔진 최적화" className="w-[300px] animate-float" loading="lazy" />
          </div>
        </div>
      </div>
    </section>

    {/* Why SEO */}
    <section className="py-32 lg:py-40 bg-dark text-cream">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">왜 SEO인가요?</p>
          <h2 className="font-serif break-keep text-[clamp(28px,4vw,48px)] font-normal text-cream leading-[1.15] tracking-[-0.02em] mb-8 max-w-[600px]">
            광고를 끄면 유입도 멈춥니다.<br />SEO는 멈추지 않습니다.
          </h2>
        </Reveal>
        <div className="mt-3 mb-12 w-16 h-px bg-primary" />
        <Reveal>
          <div className="max-w-[720px] space-y-6">
            <p className="text-[16px] text-cream/70 leading-[2]">
              퍼포먼스 광고는 즉각적인 효과가 있지만, 광고비를 쓰는 동안만 유입이 발생합니다. SEO는 다릅니다. 한 번 만든 콘텐츠가 검색 상위에 노출되면, <strong className="text-cream font-medium">광고비 없이도 매일 새로운 잠재 고객이 찾아옵니다.</strong>
            </p>
            <p className="text-[16px] text-cream/70 leading-[2]">
              무형 서비스를 찾는 사람들은 &apos;검색&apos;을 통해 신뢰할 수 있는 브랜드를 찾습니다. 이 사람들이 검색했을 때 가장 먼저 보이는 것이 우리 브랜드의 콘텐츠라면, 광고보다 훨씬 높은 전환율을 얻을 수 있습니다.
            </p>
          </div>
        </Reveal>
      </div>
    </section>

    {/* Platforms */}
    <section className="py-32 lg:py-40 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">Platforms</p>
          <h2 className="font-serif break-keep text-[clamp(28px,4vw,48px)] font-normal text-foreground leading-[1.15] tracking-[-0.02em]">
            플랫폼별 SEO 전략
          </h2>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-border rounded-lg p-8 border-l-4 border-l-primary">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-[16px] font-bold text-primary">N</span>
              <div>
                <span className="block text-[14px] font-medium text-foreground">네이버 SEO</span>
                <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-primary">운영 중</span>
              </div>
            </div>
            <p className="text-[15px] text-muted-foreground leading-[1.9] mb-6">
              네이버 블로그, 스마트스토어, 플레이스, 지식iN까지 네이버 생태계 전체를 활용한 콘텐츠 기반 신뢰 구축 전략을 실행합니다.
            </p>
            {["네이버 블로그 SEO", "스마트스토어 · 플레이스 최적화", "지식iN · 카페 마케팅", "월간 키워드 리서치"].map(f => (
              <p key={f} className="text-[13px] text-muted-foreground pl-3 py-1.5 border-l-2 border-primary/30 mb-1">{f}</p>
            ))}
          </div>
          <div className="border border-border rounded-lg p-8 border-l-4 border-l-muted opacity-60">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-[16px] font-bold text-muted-foreground">G</span>
              <div>
                <span className="block text-[14px] font-medium text-foreground">구글 SEO</span>
                <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-muted-foreground">Coming Soon</span>
              </div>
            </div>
            <p className="text-[15px] text-muted-foreground leading-[1.9] mb-6">
              글로벌 기준의 기술적 SEO와 콘텐츠 마케팅으로 장기 마케팅 자산을 구축합니다.
            </p>
            {["기술적 SEO (Technical SEO)", "콘텐츠 마케팅 · 백링크", "사이트맵 · 인덱싱 최적화", "성과 측정 · 리포팅"].map(f => (
              <p key={f} className="text-[13px] text-muted-foreground pl-3 py-1.5 border-l-2 border-muted mb-1">{f}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>

    {/* Benefits */}
    <section className="py-32 lg:py-40 bg-dark text-cream">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">Benefits</p>
          <h2 className="font-serif break-keep text-[clamp(28px,4vw,48px)] font-normal text-cream leading-[1.15] tracking-[-0.02em]">
            SEO가 만드는 장기적 가치
          </h2>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { t: "광고비 절감", d: "SEO를 통한 트래픽은 광고비가 들지 않습니다. 콘텐츠가 쌓일수록 유입 비용이 점점 낮아집니다." },
            { t: "높은 전환율", d: "검색을 통해 찾아오는 사람은 이미 의향이 있는 사람입니다. 광고 유입보다 전환율이 2-5배 높습니다." },
            { t: "브랜드 신뢰 구축", d: "검색 1페이지에 노출되면, 그 자체로 전문성과 신뢰를 보여줍니다." },
            { t: "장기 마케팅 자산", d: "한 번 만든 콘텐츠는 수년간 유입을 만듭니다. 시간이 지날수록 가치가 올라갑니다." },
            { t: "경쟁 우위 확보", d: "먼저 시작하면 경쟁사가 따라잡기 어렵습니다. 검색 1위를 점유하면 빼앗기 매우 어렵습니다." },
            { t: "다른 채널과의 시너지", d: "SEO 콘텐츠는 광고 랜딩, CRM 시퀀스, 유튜브 소재로 재활용됩니다." },
          ].map(f => (
            <div key={f.t} className="border border-cream/10 rounded-lg p-6 hover:bg-cream/5 transition-colors">
              <h4 className="text-[15px] font-medium text-cream mb-2">{f.t}</h4>
              <p className="text-[14px] text-cream/55 leading-[1.9]">{f.d}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 bg-background text-center">
      <div className="max-w-[1240px] mx-auto px-6">
        <Reveal>
          <h2 className="font-serif break-keep text-[clamp(24px,3vw,36px)] font-normal text-foreground mb-4">네이버 SEO는 지금 바로 시작할 수 있습니다.</h2>
          <p className="text-[15px] text-muted-foreground mb-8 max-w-[440px] mx-auto leading-[1.9]">무료 상담에서 현재 검색 노출 현황을 진단하고, 키워드 전략을 함께 설계합니다.</p>
          <Link href="/consult" className="inline-flex items-center gap-2 px-9 py-4 bg-primary text-primary-foreground text-[14px] font-bold tracking-[0.05em] hover:bg-gold-light transition-all hover:-translate-y-0.5">
            무료 상담 신청 <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  </div>
);

export default SeoClient;

"use client";

import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import illustBranded from "@/assets/illust-branded.png";

const BrandedClient = () => (
  <div>
    {/* Hero */}
    <section className="pt-32 pb-24 lg:pb-32 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary transition-colors mb-10">
          <ArrowLeft className="w-3 h-3" /> 홈으로
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">02 · Branded Content</p>
            <h1 className="font-serif break-keep text-[clamp(36px,5vw,64px)] font-normal text-foreground leading-[1.15] tracking-[-0.02em] mb-6">
              브랜디드 콘텐츠
            </h1>
            <p className="text-[17px] text-muted-foreground leading-[1.85] max-w-[480px] mb-8">
              강사의 목소리, 공간의 공기, 수강생의 표정 — 무형을 파는 일은 결국 <strong className="text-foreground font-medium">감각을 번역하는 일</strong>입니다. 24시간 일하는 영업사원을 만듭니다.
            </p>
            <div className="flex flex-wrap gap-2">
              {["브랜디드 유튜브", "숏폼 (Shorts · Reels)", "광고 소재 제작"].map(t => (
                <span key={t} className="text-[12px] text-muted-foreground bg-secondary border border-border px-3 py-1 rounded-full">{t}</span>
              ))}
            </div>
          </Reveal>
          <div className="hidden lg:flex justify-center">
            <img src={illustBranded.src} alt="브랜디드 콘텐츠" className="w-[300px] animate-float" loading="lazy" />
          </div>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="py-16 bg-dark">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="flex flex-wrap justify-between gap-8">
          {[{ n: "9", u: "년+", l: "영상 제작 경력" }, { n: "100", u: "만+", l: "누적 구독자" }, { n: "4", u: "배", l: "상담 전환율 증가" }, { n: "2", u: "개월", l: "채널 성장 기간" }].map(k => (
            <div key={k.l} className="text-center">
              <span className="text-[36px] font-display font-normal text-cream tracking-[-0.02em]">{k.n}<span className="text-[16px] text-cream/40 ml-0.5">{k.u}</span></span>
              <span className="block text-[11px] text-cream/30 tracking-[0.08em] uppercase mt-1">{k.l}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* Why branded content */}
    <section className="py-32 lg:py-40 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">왜 브랜디드 콘텐츠인가요?</p>
          <h2 className="font-serif break-keep text-[clamp(28px,4vw,48px)] font-normal text-foreground leading-[1.15] tracking-[-0.02em] mb-8 max-w-[600px]">
            광고는 3초 만에 스킵됩니다.<br />콘텐츠는 10분을 붙잡습니다.
          </h2>
        </Reveal>
        <div className="mt-3 mb-12 w-16 h-px bg-primary" />
        <Reveal>
          <div className="max-w-[720px] space-y-6">
            <p className="text-[16px] text-muted-foreground leading-[2]">
              무형 서비스를 파는 브랜드에게 유튜브는 단순한 영상 플랫폼이 아닙니다. 잠재 고객이 &apos;이 브랜드를 믿을 수 있는가?&apos;를 판단하는 <strong className="text-foreground font-medium">신뢰의 공간</strong>입니다.
            </p>
            <p className="text-[16px] text-muted-foreground leading-[2]">
              &apos;조회수를 위한 영상&apos;이 아니라 <strong className="text-foreground font-medium">&apos;상담과 매출로 연결되는 영상&apos;</strong>을 만듭니다. 서사형 콘텐츠가 광고보다 훨씬 강력한 신뢰를 만듭니다.
            </p>
          </div>
        </Reveal>
      </div>
    </section>

    {/* YouTube operations */}
    <section className="py-32 lg:py-40 bg-dark text-cream">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">YouTube Operations</p>
          <h2 className="font-serif break-keep text-[clamp(28px,4vw,48px)] font-normal text-cream leading-[1.15] tracking-[-0.02em]">
            유튜브 운영 상세
          </h2>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[
            { t: "올인원 채널 운영", d: "주제 기획부터 촬영, 편집, 업로드, 썸네일, 숏폼 재가공까지 전 과정을 대행합니다. 대표님은 촬영에만 참여하시면 됩니다." },
            { t: "알고리즘 기반 주제 선정", d: "감이 아닌 데이터로 주제를 선정합니다. 키워드 검색량, 경쟁 강도, 트렌드를 분석해 가장 효과적인 콘텐츠를 기획합니다." },
            { t: "매출 연결 전략", d: "조회수가 아닌, 실제 상담과 매출로 연결되는 구조를 설계합니다. 영상 내 CTA 설계, 댓글 관리, 커뮤니티 탭 운영까지." },
            { t: "2개월 내 채널 성장", d: "추천 알고리즘과 검색 유입을 동시에 공략합니다. 실제로 구독자 73명 → 2,500명을 2개월 만에 달성한 사례가 있습니다." },
            { t: "숏폼 자동 재가공", d: "롱폼 콘텐츠의 핵심 장면을 Shorts, Reels, TikTok용 숏폼으로 재가공합니다. 하나의 촬영으로 5개 이상의 콘텐츠를 생산합니다." },
            { t: "카테고리 1등 포지션", d: "'스피치 학원' 하면 ○○ — 카테고리를 대표하는 채널이 되도록 장기 포지션을 설계합니다." },
          ].map(item => (
            <div key={item.t} className="border border-cream/10 rounded-lg p-7 hover:bg-cream/5 transition-colors">
              <h4 className="text-[15px] font-medium text-cream mb-3">{item.t}</h4>
              <p className="text-[14px] text-cream/55 leading-[1.9]">{item.d}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* Results */}
    <section className="py-32 lg:py-40 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">Results</p>
          <h2 className="font-serif break-keep text-[clamp(28px,4vw,48px)] font-normal text-foreground leading-[1.15] tracking-[-0.02em]">
            실제 채널 성장 케이스
          </h2>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-border rounded-lg p-10">
            <span className="text-[12px] font-medium tracking-[0.08em] uppercase text-primary">채널 성장</span>
            <h3 className="font-serif text-[22px] font-normal text-foreground mt-3 mb-6">Before vs After</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-[12px] font-bold text-muted-foreground mb-3">Before — 1년 6개월</h4>
                <span className="text-[32px] font-display font-normal text-muted-foreground">73<span className="text-[14px] ml-0.5">명</span></span>
                <span className="block text-[11px] text-muted-foreground tracking-[0.08em] uppercase mt-1">구독자</span>
              </div>
              <div>
                <h4 className="text-[12px] font-bold text-primary mb-3">After — 2개월</h4>
                <span className="text-[32px] font-display font-normal text-primary">2,500<span className="text-[14px] text-primary/60 ml-0.5">명</span></span>
                <span className="block text-[11px] text-muted-foreground tracking-[0.08em] uppercase mt-1">구독자</span>
              </div>
            </div>
          </div>
          <div className="border border-border rounded-lg p-10">
            <span className="text-[12px] font-medium tracking-[0.08em] uppercase text-primary">매출 전환</span>
            <h3 className="font-serif text-[22px] font-normal text-foreground mt-3 mb-6">상담 건수 4배 증가</h3>
            <p className="text-[15px] text-muted-foreground leading-[2] mb-6">
              유튜브 콘텐츠를 통해 월 평균 상담 건수가 30건에서 120건 이상으로 4배 증가했습니다.
            </p>
            <div className="flex items-end gap-8">
              <div>
                <span className="text-[36px] font-display font-normal text-muted-foreground">30</span>
                <span className="block text-[11px] text-muted-foreground tracking-[0.08em] uppercase mt-1">이전 월평균</span>
              </div>
              <span className="text-primary text-[24px] mb-3">&rarr;</span>
              <div>
                <span className="text-[36px] font-display font-normal text-primary">120<span className="text-[18px] text-primary/50">+</span></span>
                <span className="block text-[11px] text-muted-foreground tracking-[0.08em] uppercase mt-1">현재 월평균</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 bg-dark text-center">
      <div className="max-w-[1240px] mx-auto px-6">
        <Reveal>
          <h2 className="font-serif break-keep text-[clamp(24px,3vw,36px)] font-normal text-cream mb-4">브랜디드 콘텐츠가 필요하신가요?</h2>
          <p className="text-[15px] text-cream/60 mb-8 max-w-[440px] mx-auto leading-[1.9]">기획부터 촬영, 편집, 운영까지 원스톱으로. 무료 상담에서 채널 전략을 함께 설계합니다.</p>
          <Link href="/consult" className="inline-flex items-center gap-2 px-9 py-4 bg-primary text-primary-foreground text-[14px] font-bold tracking-[0.05em] hover:bg-gold-light transition-all hover:-translate-y-0.5">
            무료 상담 신청 <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  </div>
);

export default BrandedClient;

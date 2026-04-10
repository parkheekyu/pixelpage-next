"use client";

import { ArrowLeft, ArrowRight, Download, FileText } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/Reveal";

const documents = [
  {
    title: "PIXELPAGE 서비스 소개서",
    desc: "무형 서비스 전담 마케팅 파트너 PIXELPAGE의 전체 서비스 소개서입니다. 5가지 핵심 서비스, 진행 프로세스, 그리고 실제 성과를 확인하실 수 있습니다.",
    pages: "24p",
    updated: "2026.04",
    tag: "전체 서비스",
  },
  {
    title: "퍼포먼스 마케팅 소개서",
    desc: "Meta · Google · 토스 · 당근 · TikTok 광고 운영 전략과 무형 서비스에 특화된 서사형 크리에이티브 방법론을 담았습니다.",
    pages: "18p",
    updated: "2026.04",
    tag: "퍼포먼스",
  },
  {
    title: "브랜디드 콘텐츠 소개서",
    desc: "브랜디드 유튜브 · 숏폼 운영 전략, 콘텐츠 기획부터 채널 성장까지의 프로세스와 실제 Before/After 사례를 담았습니다.",
    pages: "16p",
    updated: "2026.04",
    tag: "브랜디드",
  },
  {
    title: "SEO · CRM 통합 소개서",
    desc: "네이버 SEO 최적화 전략과 CRM 자동화 퍼널 설계 방법론을 하나의 문서로 정리했습니다. 장기적 유입과 리텐션 전략을 확인하세요.",
    pages: "20p",
    updated: "2026.04",
    tag: "SEO · CRM",
  },
  {
    title: "웹 빌드 포트폴리오",
    desc: "랜딩 페이지, 브랜드 사이트, 엔터프라이즈 웹 구축 사례와 전환율 최적화 설계 방법론을 담은 포트폴리오입니다.",
    pages: "14p",
    updated: "2026.03",
    tag: "웹 빌드",
  },
];

const cases = [
  { name: "디지털노마드 하이클래스", cat: "온라인 교육", stats: [{ n: "70,000", u: "+", l: "카페 회원" }, { n: "3.93", u: "%", l: "CTR" }] },
  { name: "부트스트래퍼", cat: "B2B 지식 서비스", stats: [{ n: "500", u: "%", l: "ROAS" }, { n: "40", u: "M", l: "집행 금액" }] },
  { name: "플러스 스피치 학원", cat: "오프라인 교육", stats: [{ n: "6.6", u: "×", l: "매출 성장" }, { n: "4", u: "+", l: "신규 지점" }] },
  { name: "라 컴퍼니", cat: "가맹 네트워크", stats: [{ n: "7", u: "+", l: "전국 지점" }, { n: "전국", u: "", l: "커버리지" }] },
];

const CasesClient = () => (
  <div>
    {/* Hero */}
    <section className="pt-32 pb-24 lg:pb-32 bg-dark text-cream">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-cream/50 hover:text-primary transition-colors mb-10">
          <ArrowLeft className="w-3 h-3" /> 홈으로
        </Link>
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">Cases & Downloads</p>
          <h1 className="font-serif break-keep text-[clamp(36px,5vw,64px)] font-normal text-cream leading-[1.15] tracking-[-0.02em] mb-6">
            성과와 서비스 소개서
          </h1>
          <p className="text-[17px] text-cream/70 leading-[1.85] max-w-[520px]">
            무형 서비스 브랜드와 함께한 실제 성과를 확인하고,<br />
            서비스별 소개서를 다운로드하실 수 있습니다.
          </p>
        </Reveal>
      </div>
    </section>

    {/* KPI */}
    <section className="py-16 bg-dark border-t border-cream/10">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="flex flex-wrap justify-between gap-8">
          {[
            { n: "100", u: "%", l: "무형 서비스 전담" },
            { n: "5", u: "+", l: "시그니처 브랜드" },
            { n: "500", u: "%", l: "Peak ROAS" },
            { n: "6.6", u: "×", l: "최고 매출 성장" },
          ].map(k => (
            <div key={k.l} className="text-center">
              <span className="text-[36px] font-display font-normal text-cream tracking-[-0.02em]">{k.n}<span className="text-[16px] text-cream/40 ml-0.5">{k.u}</span></span>
              <span className="block text-[11px] text-cream/30 tracking-[0.08em] uppercase mt-1">{k.l}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* Case Studies */}
    <section className="py-32 lg:py-40 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">01 · Case Studies</p>
          <h2 className="font-serif break-keep text-[clamp(28px,4vw,48px)] font-normal text-foreground leading-[1.15] tracking-[-0.02em]">
            짧은 기간, 또렷한 결과.
          </h2>
          <p className="text-[17px] text-muted-foreground mt-5 max-w-[500px] leading-[2]">
            무형 서비스 브랜드와 함께한 실제 성과입니다.
          </p>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((c, i) => (
            <div key={i} className="border border-border rounded-lg p-10 hover:shadow-card-hover transition-shadow">
              <span className="text-[12px] font-medium tracking-[0.08em] uppercase text-primary">{c.cat}</span>
              <h3 className="font-serif text-[26px] font-normal text-foreground mt-3 mb-6">{c.name}</h3>
              <div className="flex gap-10 pt-6 border-t border-border">
                {c.stats.map((s, j) => (
                  <div key={j}>
                    <span className="text-[36px] font-display font-normal text-foreground tracking-[-0.02em]">
                      {s.n}<span className="text-[16px] text-muted-foreground ml-0.5">{s.u}</span>
                    </span>
                    <span className="block text-[11px] text-muted-foreground tracking-[0.08em] uppercase mt-1">{s.l}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* Downloads */}
    <section className="py-32 lg:py-40 bg-dark text-cream">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">02 · Downloads</p>
          <h2 className="font-serif break-keep text-[clamp(28px,4vw,48px)] font-normal text-cream leading-[1.15] tracking-[-0.02em]">
            서비스 소개서 다운로드
          </h2>
          <p className="text-[17px] text-cream/70 mt-5 max-w-[520px] leading-[2]">
            각 서비스별 상세 소개서를 PDF로 다운로드하실 수 있습니다.
          </p>
        </Reveal>
        <div className="mt-16 space-y-4">
          {documents.map((doc, i) => (
            <Reveal key={i}>
              <div className="border border-cream/10 rounded-lg p-8 hover:bg-cream/5 transition-colors group">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
                  <div className="flex items-start gap-5 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-[17px] font-medium text-cream">{doc.title}</h3>
                        <span className="text-[11px] text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">{doc.tag}</span>
                      </div>
                      <p className="text-[14px] text-cream/55 leading-[1.85] max-w-[560px]">{doc.desc}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-[12px] text-cream/35">PDF · {doc.pages}</span>
                        <span className="text-[12px] text-cream/35">업데이트 {doc.updated}</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={`mailto:contact@pixelpage.co.kr?subject=소개서 요청: ${doc.title}`}
                    className="inline-flex items-center gap-2 px-7 py-3.5 border border-primary text-primary text-[13px] font-bold tracking-[0.03em] hover:bg-primary hover:text-primary-foreground transition-all flex-shrink-0"
                  >
                    <Download className="w-4 h-4" /> 다운로드
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12">
          <p className="text-[14px] text-cream/40">
            * 소개서 요청 시 이메일로 PDF를 보내드립니다. 빠른 수령을 원하시면{" "}
            <Link href="/consult" className="text-primary hover:underline">무료 상담 신청</Link>을 이용해 주세요.
          </p>
        </Reveal>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 bg-background text-center">
      <div className="max-w-[1240px] mx-auto px-6">
        <Reveal>
          <h2 className="font-serif break-keep text-[clamp(24px,3vw,36px)] font-normal text-foreground mb-4">우리 브랜드에 맞는 전략이 궁금하신가요?</h2>
          <p className="text-[15px] text-muted-foreground mb-8 max-w-[440px] mx-auto leading-[1.9]">무료 상담에서 브랜드를 함께 진단하고, 최적의 서비스 조합을 제안드립니다.</p>
          <Link href="/consult" className="inline-flex items-center gap-2 px-9 py-4 bg-primary text-primary-foreground text-[14px] font-bold tracking-[0.05em] hover:bg-gold-light transition-all hover:-translate-y-0.5">
            무료 상담 신청 <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  </div>
);

export default CasesClient;

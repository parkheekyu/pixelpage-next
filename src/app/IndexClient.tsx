"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import illustHero from "@/assets/illust-hero.png";
import illustPerformance from "@/assets/illust-performance.png";
import illustBranded from "@/assets/illust-branded.png";
import illustSeo from "@/assets/illust-seo.png";
import illustCrm from "@/assets/illust-crm.png";
import illustWeb from "@/assets/illust-web.png";
import charMale from "@/assets/char-male.png";
import charFemale from "@/assets/char-female.png";
import charCurly from "@/assets/char-curly.png";

const IndexClient = () => {
  return (
    <div>
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 bg-background overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] right-[15%] w-[500px] h-[500px] rounded-full bg-primary/[0.06] blur-[120px]" />
          <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-[1240px] mx-auto w-full px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6 opacity-0 animate-fade-up stagger-1">
                교육 · 지식 · 경험 · 문화
              </p>
              <h1 className="font-serif text-[clamp(48px,7vw,96px)] font-normal leading-[1.1] tracking-[-0.03em] text-foreground mb-7 opacity-0 animate-fade-up stagger-2">
                만질 수 없는 것을<br /><span className="text-primary">파는 일.</span>
              </h1>
              <p className="text-[17px] text-muted-foreground leading-[1.85] max-w-[460px] mb-10 opacity-0 animate-fade-up stagger-3">
                무형의 가치를 파는 브랜드의 전담 마케팅 파트너.<br />
                짧은 사이클 안에, 관객이 &apos;한 번 경험해 보고 싶다&apos;고<br />
                느끼는 그 순간까지 설계합니다.
              </p>
              <div className="flex items-center gap-4 mb-14 opacity-0 animate-fade-up stagger-4">
                <Link href="/#contact" className="inline-flex items-center gap-2 px-9 py-4 bg-primary text-primary-foreground text-[14px] font-bold tracking-[0.05em] hover:bg-gold-light transition-all hover:-translate-y-0.5">
                  무료 상담 신청
                </Link>
                <Link href="/#cases" className="inline-flex items-center px-8 py-4 border border-foreground/20 text-[14px] font-medium text-foreground hover:border-primary hover:text-primary transition-colors">
                  성과 보기
                </Link>
              </div>
              <div className="flex items-center gap-8 opacity-0 animate-fade-up stagger-5">
                {[
                  { num: "100%", label: "무형 서비스 전담" },
                  { num: "5+", label: "시그니처 브랜드" },
                  { num: "TOP 1%", label: "니치 마켓 포지션" },
                ].map((k, i) => (
                  <div key={i} className="flex items-center gap-8">
                    {i > 0 && <div className="w-px h-9 bg-foreground/10" />}
                    <div>
                      <span className="block font-display text-[28px] font-normal text-foreground tracking-[-0.02em]">{k.num}</span>
                      <span className="block text-[11px] text-muted-foreground tracking-[0.05em] mt-0.5">{k.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex justify-center items-center relative h-[500px]">
              {/* Floating blob characters */}
              <div className="absolute top-0 right-8 animate-float stagger-2">
                <div className="blob-shape-1 w-[200px] h-[200px] overflow-hidden shadow-card">
                  <img src={charMale.src} alt="" className="w-full h-full object-cover scale-110 object-[center_20%]" />
                </div>
              </div>
              <div className="absolute bottom-4 right-16 animate-float stagger-4">
                <div className="blob-shape-2 w-[220px] h-[240px] overflow-hidden shadow-card">
                  <img src={charFemale.src} alt="" className="w-full h-full object-cover scale-110" />
                </div>
              </div>
              <div className="absolute top-[30%] left-0 animate-float stagger-6">
                <div className="blob-shape-3 w-[180px] h-[200px] overflow-hidden shadow-card">
                  <img src={charCurly.src} alt="" className="w-full h-full object-cover scale-110" />
                </div>
              </div>
              {/* Decorative floating tags */}
              <div className="absolute top-[15%] left-[30%] bg-primary/10 text-primary text-[11px] font-medium px-3 py-1.5 rounded-full animate-float stagger-3">
                Meta Business Partner
              </div>
              <div className="absolute bottom-[25%] left-[15%] bg-primary/10 text-primary text-[11px] font-medium px-3 py-1.5 rounded-full animate-float stagger-5">
                ROAS 500%
              </div>
              <div className="absolute top-[55%] right-0 bg-primary/10 text-primary text-[11px] font-medium px-3 py-1.5 rounded-full animate-float stagger-1">
                Marketing Design
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-12 flex items-center gap-4">
          <span className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground">스크롤</span>
          <div className="w-[60px] h-px bg-primary" style={{ animation: 'scroll-line 2s ease infinite' }} />
        </div>
      </section>

      {/* ─── PHILOSOPHY ─── */}
      <section className="py-32 lg:py-40 bg-dark text-cream">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <Reveal>
            <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">01 · Philosophy</p>
            <h2 className="font-serif text-[clamp(32px,5vw,64px)] font-normal text-cream leading-[1.15] tracking-[-0.02em] max-w-[700px]">
              일반 마케팅 회사와는<br />조금 다릅니다.
            </h2>
          </Reveal>
          <div className="mt-3 mb-16 w-16 h-px bg-primary" />
          <Reveal className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="text-[17px] text-cream/70 leading-[2] mb-6">
                교육 · 지식 · 체험 · 문화 — 무형의 가치를 파는 브랜드는 &apos;공급의 질&apos;만큼
                <strong className="text-cream font-medium"> &apos;의향을 가진 관객과 어떻게 만나는가&apos;가 전부입니다.</strong>
              </p>
              <p className="text-[17px] text-cream/70 leading-[2]">
                PIXELPAGE는 이 낯선 시장에서만 일해 왔습니다. 예산의 크기가 아니라 짧은 시간 안에 얼마나 또렷한 결과를 만들 수 있는가 — 상품이 아니라 서사, 숫자가 아니라 태도를 다루는 브랜드들의 전담 파트너입니다.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-0">
              {[
                { num: "01", title: "Intangible First", body: "무형 서비스 전담. 제품 기반 이커머스와 완전히 다른 의사결정 구조를 이해합니다." },
                { num: "02", title: "Narrative Creative", body: "감각을 번역하는 크리에이티브. 브랜드 고유의 톤을 해치지 않는 서사를 설계합니다." },
                { num: "03", title: "Short-Cycle Wins", body: "짧은 사이클 안에 유의미한 결과. 단기 집행만으로 브랜드가 다음 단계로 넘어갑니다." },
                { num: "04", title: "Category Leader", body: "함께한 브랜드들은 각 카테고리에서 상위권으로 올라섰습니다." },
              ].map(p => (
                <div key={p.num} className="border-t border-cream/15 pt-6 pr-6 pb-8">
                  <span className="text-[12px] font-display text-primary tracking-[0.1em]">{p.num}</span>
                  <h3 className="font-accent text-[15px] font-bold text-cream mt-3 mb-2">{p.title}</h3>
                  <p className="text-[14px] text-cream/60 leading-[1.9]">{p.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="py-32 lg:py-40 border-t border-border">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <Reveal>
            <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">02 · Services</p>
            <h2 className="font-serif text-[clamp(32px,5vw,64px)] font-normal text-foreground leading-[1.15] tracking-[-0.02em]">
              5가지 서비스,<br />하나의 마케팅 설계.
            </h2>
            <p className="text-[17px] text-muted-foreground mt-5 max-w-[520px] leading-[2]">
              각각 독립적으로 강하고, 함께할 때 가장 강력합니다.
            </p>
          </Reveal>

          {/* Service cards */}
          <div className="mt-20 space-y-6">
            {[
              {
                num: "01", name: "퍼포먼스 마케팅", sub: "Performance Marketing",
                desc: "Meta · Google · 토스 · 당근 · TikTok — 주요 광고 플랫폼에서 '구매 의향이 있는 사람'을 정밀하게 찾아냅니다. 서사형 크리에이티브로 '광고 같지 않은 광고'를 만들어 전환합니다.",
                img: illustPerformance, href: "/services/performance",
                tags: ["Meta Ads", "Google Ads", "토스애즈", "당근마켓", "TikTok"]
              },
              {
                num: "02", name: "브랜디드 콘텐츠", sub: "Branded Content",
                desc: "강사의 목소리, 공간의 공기, 수강생의 표정 — 무형을 파는 일은 결국 감각을 번역하는 일입니다. 브랜디드 유튜브와 숏폼으로 24시간 일하는 영업사원을 만듭니다.",
                img: illustBranded, href: "/services/branded",
                tags: ["브랜디드 유튜브", "숏폼 (Shorts · Reels)", "광고 소재 제작"]
              },
              {
                num: "03", name: "검색엔진 최적화", sub: "SEO",
                desc: "광고는 돈을 써서 보여주는 것이고, SEO는 돈을 쓰지 않아도 찾아오게 만드는 것입니다. 네이버 생태계 전체를 활용해 콘텐츠 기반 장기 신뢰를 구축합니다.",
                img: illustSeo, href: "/services/seo",
                tags: ["네이버 SEO", "구글 SEO (준비 중)"]
              },
              {
                num: "04", name: "CRM 마케팅", sub: "CRM Automation",
                desc: "퍼포먼스 광고가 관객을 데려온다면, CRM은 그들이 떠나지 않도록 붙잡습니다. 리드 수집 → 육성 자동화 → 전환 최적화 → 리텐션까지 4단계 자동화 퍼널을 설계합니다.",
                img: illustCrm, href: "/services/crm",
                tags: ["카카오 알림톡", "이메일 시퀀스", "문자 자동화"]
              },
              {
                num: "05", name: "웹 빌드", sub: "Web Build",
                desc: "보여주기 위한 웹이 아닌, 파는 웹. 광고를 클릭한 관객이 처음 만나는 곳을 전환이 일어나도록 설계합니다.",
                img: illustWeb, href: "/services/webbuild",
                tags: ["랜딩 페이지", "브랜드 사이트", "엔터프라이즈"]
              },
            ].map((s, i) => (
              <Reveal key={s.num}>
                <Link href={s.href} className={`group grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12 border-t border-border hover:bg-card/50 transition-colors px-6 -mx-6 rounded-lg ${i % 2 === 1 ? 'lg:direction-rtl' : ''}`}>
                  <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                    <span className="font-display text-[12px] tracking-[0.15em] uppercase text-primary">{s.num} · {s.sub}</span>
                    <h3 className="font-serif text-[clamp(28px,3.5vw,42px)] font-normal text-foreground mt-3 mb-4">{s.name}</h3>
                    <p className="text-[16px] text-muted-foreground leading-[2] mb-6 max-w-[460px]">{s.desc}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {s.tags.map(t => (
                        <span key={t} className="text-[12px] text-muted-foreground bg-secondary border border-border px-3 py-1 rounded-full">{t}</span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-2 text-[14px] font-medium text-primary group-hover:translate-x-1 transition-transform">
                      자세히 보기 <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                  <div className={`flex justify-center ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <img src={s.img.src} alt={s.name} className="w-[280px] lg:w-[320px] group-hover:scale-105 transition-transform duration-500" loading="lazy" width={800} height={640} />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CASES ─── */}
      <section id="cases" className="py-32 lg:py-40 bg-dark text-cream">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <Reveal>
            <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">03 · Case Studies</p>
            <h2 className="font-serif text-[clamp(32px,5vw,64px)] font-normal text-cream leading-[1.15] tracking-[-0.02em]">
              짧은 기간, 또렷한 결과.
            </h2>
            <p className="text-[17px] text-cream/70 mt-5 max-w-[500px] leading-[2]">
              무형 서비스 브랜드와 함께한 실제 성과입니다.
            </p>
          </Reveal>
          <Reveal className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: "디지털노마드 하이클래스", cat: "온라인 교육", desc: "카페 회원 7만 명의 커뮤니티를 가진 온라인 교육 브랜드. 퍼포먼스 광고를 통해 업계 평균의 3배 이상인 CTR 3.93%를 달성했습니다.", stats: [{ n: "70,000", u: "+", l: "카페 회원" }, { n: "3.93", u: "%", l: "CTR" }] },
              { name: "부트스트래퍼", cat: "B2B 지식 서비스", desc: "고단가 B2B 지식 상품을 단 ₩40M 예산으로 수익 구간에 올린 사례입니다. ROAS 500%를 달성하며, 적은 예산으로도 수익성을 증명했습니다.", stats: [{ n: "500", u: "%", l: "ROAS" }, { n: "40", u: "M", l: "집행 금액" }] },
              { name: "플러스 스피치 학원", cat: "오프라인 교육", desc: "단일 지점에서 시작해, 마케팅을 통해 4개 신규 지점을 오픈하며 매출을 6.6배 성장시켰습니다.", stats: [{ n: "6.6", u: "×", l: "매출 성장" }, { n: "4", u: "+", l: "신규 지점" }] },
              { name: "라 컴퍼니", cat: "가맹 네트워크", desc: "전국 7개 지점의 가맹 네트워크를 마케팅으로 확장한 프로젝트입니다.", stats: [{ n: "7", u: "+", l: "전국 지점" }, { n: "전국", u: "", l: "커버리지" }] },
            ].map((c, i) => (
              <div key={i} className="border border-cream/15 rounded-lg p-10 hover:bg-cream/5 transition-colors">
                <span className="text-[12px] font-medium tracking-[0.08em] uppercase text-primary">{c.cat}</span>
                <h3 className="font-serif text-[26px] font-normal text-cream mt-3 mb-4">{c.name}</h3>
                <p className="text-[15px] text-cream/60 leading-[2] mb-8">{c.desc}</p>
                <div className="flex gap-10 pt-6 border-t border-cream/15">
                  {c.stats.map((s, j) => (
                    <div key={j}>
                      <span className="text-[36px] font-display font-normal text-cream tracking-[-0.02em]">
                        {s.n}<span className="text-[16px] text-cream/50 ml-0.5">{s.u}</span>
                      </span>
                      <span className="block text-[11px] text-cream/50 tracking-[0.08em] uppercase mt-1">{s.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ─── HOW WE WORK ─── */}
      <section className="py-32 lg:py-40 border-t border-border">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <Reveal>
            <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">04 · Process</p>
            <h2 className="font-serif text-[clamp(32px,5vw,64px)] font-normal text-foreground leading-[1.15] tracking-[-0.02em]">
              어떻게 일하나요?
            </h2>
            <p className="text-[17px] text-muted-foreground mt-5 max-w-[520px] leading-[2]">
              계약 전 무료 상담에서 브랜드를 함께 진단하고, 어떤 서비스 조합이 가장 효과적인지 설계합니다.
            </p>
          </Reveal>
          <Reveal className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
            {[
              { s: "01", t: "브랜드 진단", d: "무형 서비스의 핵심 가치, 기존 마케팅 자산, 경쟁 환경을 분석합니다. 타겟 관객이 누구인지, 어디에 있는지를 정의합니다." },
              { s: "02", t: "채널 · 퍼널 설계", d: "5가지 서비스 중 최적의 조합을 설계합니다. 예산 배분, KPI, 타임라인을 함께 정합니다." },
              { s: "03", t: "집행 · 크리에이티브", d: "서사형 광고 소재를 제작하고, A/B 테스트를 반복하며 최적화합니다. 매주 데이터를 리뷰합니다." },
              { s: "04", t: "스케일업 · 확장", d: "검증된 소재와 채널을 기반으로 빠르게 스케일업합니다. 새로운 채널 확장까지 함께 설계합니다." },
            ].map(p => (
              <div key={p.s} className="border-t-2 border-primary pt-8 pr-8 pb-8">
                <span className="text-[13px] font-display text-primary tracking-[0.1em]">{p.s}</span>
                <h3 className="text-[18px] font-medium text-foreground mt-4 mb-4">{p.t}</h3>
                <p className="text-[15px] text-muted-foreground leading-[2]">{p.d}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contact" className="py-32 lg:py-40 bg-dark text-cream">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <Reveal>
            <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">05 · Contact</p>
            <h2 className="font-serif text-[clamp(32px,5vw,64px)] font-normal text-cream leading-[1.15] tracking-[-0.02em] mb-6">
              한 번 얘기해봐요.
            </h2>
            <p className="text-[17px] text-cream/70 max-w-[480px] leading-[2] mb-12">
              지금 당장 계약이 목표가 아닙니다. 브랜드를 함께 진단하고, 어떻게 팔 수 있는지 생각해 보는 것부터 시작합니다.
            </p>
            <Link href="/consult" className="inline-flex items-center gap-2 px-9 py-4 bg-primary text-primary-foreground text-[14px] font-bold tracking-[0.05em] hover:bg-gold-light transition-all hover:-translate-y-0.5">
              무료 상담 신청 <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default IndexClient;

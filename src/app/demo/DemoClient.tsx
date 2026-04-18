"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Reveal from "@/components/Reveal";
import charMale from "@/assets/char-male.png";
import charFemale from "@/assets/char-female.png";
import charCurly from "@/assets/char-curly.png";

/**
 * Demo page — 메인 페이지 구조 복제
 * 프리텐다드 + 쿨 그레이 톤 (웜톤 제거)
 * 독립 색상 시스템 (CSS variables override)
 */
const DemoClient = () => (
  <div
    className="demo-page"
    style={{
      "--demo-bg": "#f7f8fa",
      "--demo-fg": "#111318",
      "--demo-muted": "#6b7280",
      "--demo-border": "#e5e7eb",
      "--demo-accent": "#2563eb",
      "--demo-accent-light": "#3b82f6",
      "--demo-card": "#ffffff",
      "--demo-surface": "#f1f3f5",
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    } as React.CSSProperties}
  >
    {/* Pretendard font load */}
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
    />

    {/* Back banner */}
    <div className="fixed top-0 left-0 right-0 z-50 text-center py-2 text-[13px] font-medium" style={{ background: "var(--demo-accent)", color: "#fff" }}>
      PIXELPAGE 웹 빌드 샘플입니다.{" "}
      <Link href="/services/webbuild" className="underline font-bold ml-1">웹 빌드 서비스 보기 &rarr;</Link>
    </div>

    {/* ─── HERO ─── */}
    <section className="relative min-h-screen flex items-center pt-40 pb-20 overflow-hidden" style={{ background: "var(--demo-bg)" }}>
      <div className="relative z-10 max-w-[1240px] mx-auto w-full px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-[13px] tracking-[0.15em] uppercase mb-5 opacity-0 animate-fade-up stagger-1" style={{ color: "var(--demo-muted)" }}>
              강의 &middot; 코칭 &middot; 컨설팅 &middot; 학원
            </p>
            <h1 className="break-keep text-[clamp(36px,5vw,60px)] font-bold leading-[1.15] tracking-[-0.03em] mb-6 opacity-0 animate-fade-up stagger-2" style={{ color: "var(--demo-fg)" }}>
              가르치는 일에 집중하세요.<br />
              <span style={{ color: "var(--demo-accent)" }}>파는 일은 저희가 합니다.</span>
            </h1>
            <p className="text-[17px] leading-[1.85] max-w-[440px] mb-9 opacity-0 animate-fade-up stagger-3" style={{ color: "var(--demo-muted)" }}>
              지식을 파는 브랜드의 퍼포먼스 파트너.<br />
              마케팅에 시간 뺏기는 문제를 끝내드립니다.
            </p>
            <div className="flex items-center gap-4 mb-14 opacity-0 animate-fade-up stagger-4">
              <button className="inline-flex items-center gap-2 px-9 py-4 text-white text-[16px] font-semibold rounded-lg transition-all hover:opacity-90" style={{ background: "var(--demo-accent)" }}>
                무료 상담 신청
              </button>
              <button className="inline-flex items-center px-8 py-4 border text-[16px] rounded-lg transition-colors hover:opacity-80" style={{ borderColor: "var(--demo-border)", color: "var(--demo-muted)" }}>
                성과 보기
              </button>
            </div>
          </div>
          <div className="hidden lg:flex justify-center items-center relative h-[520px]">
            <div className="absolute top-0 right-4 animate-float stagger-2">
              <div className="blob-shape-1 w-[220px] h-[220px] overflow-hidden" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <img src={charMale.src} alt="" className="w-full h-full object-cover scale-110 object-[center_20%]" />
              </div>
              <span className="absolute -top-2 -left-8 z-10 text-[13px] font-semibold px-4 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap shadow-sm" style={{ background: "rgba(37,99,235,0.15)", color: "var(--demo-accent)" }}>Meta Business Partner</span>
            </div>
            <div className="absolute bottom-0 right-12 animate-float stagger-4">
              <div className="blob-shape-2 w-[240px] h-[260px] overflow-hidden" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <img src={charFemale.src} alt="" className="w-full h-full object-cover scale-110" />
              </div>
            </div>
            <div className="absolute top-[28%] left-0 animate-float stagger-6">
              <div className="blob-shape-3 w-[200px] h-[220px] overflow-hidden" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <img src={charCurly.src} alt="" className="w-full h-full object-cover scale-110" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ─── CASES ─── */}
    <section className="py-28 lg:py-36" style={{ background: "var(--demo-card)" }}>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-16">
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.35] tracking-[-0.01em] mb-4" style={{ color: "var(--demo-fg)" }}>
            짧은 기간,<br />또렷한 결과.
          </h2>
          <p className="text-[19px] max-w-[480px] mx-auto leading-[1.9]" style={{ color: "var(--demo-muted)" }}>
            지식 상품 브랜드와 함께한 실제 성과입니다.
          </p>
        </Reveal>

        <div className="space-y-0">
          {[
            { cat: "온라인 교육", name: "디지털노마드 하이클래스", quote: "대형 커뮤니티를 보유한 온라인 교육 브랜드. 업계 평균을 크게 웃도는 광고 효율을 달성하며, 한정된 예산으로도 높은 전환 효율을 증명했습니다.", person: "광고 성과 기준" },
            { cat: "B2B 지식 서비스", name: "부트스트래퍼", quote: "고단가 B2B 지식 상품을 단 4천만 원 예산으로 ROAS 500%를 달성했습니다. 팔기 어려운 상품도 메시지 설계가 정확하면 팔린다는 것을 보여준 사례입니다.", person: "ROAS 500% 달성" },
            { cat: "오프라인 교육", name: "플러스 스피치 학원", quote: "단일 지점에서 시작해 4개 신규 지점을 오픈하며 매출을 6.6배 성장시켰습니다.", person: "매출 6.6배 성장" },
          ].map((c) => (
            <Reveal key={c.name}>
              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-16 py-12 items-start" style={{ borderTop: "1px solid var(--demo-border)" }}>
                <div>
                  <span className="text-[12px] tracking-[0.1em] uppercase" style={{ color: "var(--demo-muted)" }}>{c.cat}</span>
                  <h3 className="text-[22px] lg:text-[26px] font-semibold mt-2" style={{ color: "var(--demo-fg)" }}>{c.name}</h3>
                </div>
                <div>
                  <p className="text-[17px] lg:text-[19px] leading-[1.85] tracking-[-0.01em]" style={{ color: "var(--demo-fg)" }}>
                    &ldquo;{c.quote}&rdquo;
                  </p>
                  <p className="text-[13px] mt-4" style={{ color: "var(--demo-muted)" }}>{c.person}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* ─── SERVICES ─── */}
    <section className="py-28 lg:py-36" style={{ background: "var(--demo-surface)" }}>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-16">
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.35] tracking-[-0.01em] mb-4" style={{ color: "var(--demo-fg)" }}>
            5가지 서비스,<br />하나의 마케팅 설계.
          </h2>
          <p className="text-[19px] max-w-[480px] mx-auto leading-[1.9]" style={{ color: "var(--demo-muted)" }}>
            각각 독립적으로 강하고, 함께할 때 가장 강력합니다.
          </p>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { t: "퍼포먼스 마케팅", d: "Meta, Google, 토스, 당근, TikTok 광고를 데이터 기반으로 운영합니다." },
              { t: "브랜디드 콘텐츠", d: "유튜브, 숏폼 영상으로 24시간 일하는 영업사원을 만듭니다." },
              { t: "검색엔진 최적화", d: "네이버 SEO로 광고비 없이도 찾아오게 만듭니다." },
              { t: "CRM 마케팅", d: "리드 수집부터 팬덤 설계까지, 이탈 없는 퍼널을 만듭니다." },
              { t: "웹 빌드", d: "보여주기 위한 웹이 아닌, 전환이 일어나는 웹을 만듭니다." },
              { t: "LLM / AI 자동화", d: "맞춤형 AI를 구축해 24시간 일하는 시스템을 심습니다." },
            ].map(s => (
              <div key={s.t} className="rounded-xl p-7 transition-shadow hover:shadow-lg" style={{ background: "var(--demo-card)", border: "1px solid var(--demo-border)" }}>
                <h3 className="text-[17px] font-bold mb-3" style={{ color: "var(--demo-fg)" }}>{s.t}</h3>
                <p className="text-[14px] leading-[1.85]" style={{ color: "var(--demo-muted)" }}>{s.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>

    {/* ─── CONTACT ─── */}
    <section className="py-28 lg:py-36" style={{ background: "var(--demo-bg)" }}>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.35] tracking-[-0.01em] mb-5" style={{ color: "var(--demo-fg)" }}>
            한 번 얘기해봐요.
          </h2>
          <p className="text-[19px] max-w-[480px] leading-[1.9] mb-10" style={{ color: "var(--demo-muted)" }}>
            지금 당장 계약이 목표가 아닙니다. 강의, 코칭, 컨설팅을 어떻게 더 잘 팔 수 있는지, 함께 생각해 보는 것부터 시작합니다.
          </p>
          <button className="inline-flex items-center gap-2 px-9 py-4 text-white text-[16px] font-semibold rounded-lg transition-all hover:opacity-90" style={{ background: "var(--demo-accent)" }}>
            무료 상담 신청 <ArrowRight className="w-4 h-4" />
          </button>
        </Reveal>
      </div>
    </section>

    {/* Back to PIXELPAGE */}
    <div className="py-8 text-center" style={{ background: "var(--demo-card)", borderTop: "1px solid var(--demo-border)" }}>
      <Link href="/services/webbuild" className="inline-flex items-center gap-2 text-[14px] font-medium transition-colors" style={{ color: "var(--demo-accent)" }}>
        <ArrowLeft className="w-4 h-4" /> 웹 빌드 서비스 보기
      </Link>
    </div>
  </div>
);

export default DemoClient;

"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

const Section = ({ title, bg = "#ffffff", children }: { title: string; bg?: string; children: React.ReactNode }) => (
  <section className="py-20 lg:py-28" style={{ background: bg }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted-foreground/50 mb-8">{title}</p>
      {children}
    </div>
  </section>
);

const StyleGuideClient = () => (
  <div>
    {/* ── Header ── */}
    <section className="bg-black pt-32 pb-20">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <h1 className="text-[clamp(36px,6vw,72px)] font-bold leading-[1.12] tracking-[-0.03em] text-white mb-5">
          Style Guide
        </h1>
        <p className="text-[18px] text-white/50 leading-[1.85] max-w-[520px]">
          PIXELPAGE 디자인 시스템의 타이포그래피, 컬러, 컴포넌트를 정리한 가이드입니다.
        </p>
      </div>
    </section>

    {/* ── Typography ── */}
    <Section title="Typography" bg="#ffffff">
      <div className="space-y-10">
        <div>
          <p className="text-[11px] text-muted-foreground mb-2">Font Family</p>
          <p className="text-[28px] font-bold text-foreground">Pretendard</p>
        </div>

        <div className="border-t border-[#e5e7eb] pt-10 space-y-8">
          <div>
            <p className="text-[11px] text-muted-foreground mb-3">H1 — Hero Title · clamp(36px, 6vw, 72px) · Bold · tracking -0.03em</p>
            <h1 className="text-[clamp(36px,6vw,72px)] font-bold leading-[1.12] tracking-[-0.03em] text-foreground">
              지식 마케팅의 새로운 기준
            </h1>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground mb-3">H2 — Section Title · clamp(32px, 4.5vw, 56px) · Bold · tracking -0.03em</p>
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em]">
              짧은 기간, 또렷한 결과.
            </h2>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground mb-3">H3 — Card Title · 22-26px · Bold</p>
            <h3 className="text-[26px] font-bold text-foreground">디지털노마드 하이클래스</h3>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground mb-3">Body Large — 19px · leading 1.9</p>
            <p className="text-[19px] text-foreground leading-[1.9] max-w-[520px]">
              유입부터 매출까지, 전 과정을 이해하고 만듭니다. 억지 후킹 없이도 팔 수 있는 이유입니다.
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground mb-3">Body — 16-18px · leading 1.85 · text-white/50 (dark) or text-muted-foreground (light)</p>
            <p className="text-[18px] text-muted-foreground leading-[1.85] max-w-[480px]">
              더 이상 광고비만 태우지 마세요. 픽셀페이지가 유입부터 매출까지 설계합니다.
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground mb-3">Caption — 12-13px · tracking 0.1em · uppercase</p>
            <span className="text-[12px] text-muted-foreground tracking-[0.1em] uppercase">온라인 교육</span>
          </div>
        </div>
      </div>
    </Section>

    {/* ── Colors ── */}
    <Section title="Colors" bg="#fbfbfb">
      <div className="space-y-10">
        <div>
          <p className="text-[13px] font-semibold text-foreground mb-4">Backgrounds</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Black (Hero)", color: "#000000", text: "text-white" },
              { name: "Dark", color: "#0a0f1e", text: "text-white" },
              { name: "White", color: "#ffffff", text: "text-foreground" },
              { name: "Off-white", color: "#fbfbfb", text: "text-foreground" },
            ].map(c => (
              <div key={c.name} className="rounded-xl overflow-hidden border border-[#e5e7eb]">
                <div className={`h-24 ${c.text} flex items-end p-4`} style={{ background: c.color }}>
                  <span className="text-[12px] font-medium">{c.color}</span>
                </div>
                <div className="bg-white px-4 py-3">
                  <span className="text-[13px] font-medium text-foreground">{c.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[13px] font-semibold text-foreground mb-4">Accent & Text</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: "Blue-500", color: "#3b82f6" },
              { name: "Blue-50", color: "#eff6ff" },
              { name: "Foreground", color: "#0a0a0a" },
              { name: "Muted", color: "#737373" },
              { name: "Border", color: "#e5e7eb" },
            ].map(c => (
              <div key={c.name} className="rounded-xl overflow-hidden border border-[#e5e7eb]">
                <div className="h-16" style={{ background: c.color }} />
                <div className="bg-white px-4 py-3">
                  <span className="text-[12px] font-medium text-foreground block">{c.name}</span>
                  <span className="text-[11px] text-muted-foreground">{c.color}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>

    {/* ── Buttons ── */}
    <Section title="Buttons" bg="#ffffff">
      <div className="space-y-8">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="#" className="inline-flex items-center gap-2 px-9 py-4 bg-[#0a0f1e] text-white text-[16px] font-semibold rounded-xl hover:bg-[#0a0f1e]/90 transition-all">
            Primary Dark <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="#" className="inline-flex items-center gap-2 px-9 py-4 bg-white text-black text-[16px] font-semibold rounded-xl border border-[#e5e7eb] hover:bg-gray-50 transition-all">
            Primary Light
          </Link>
          <Link href="#" className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/30 text-white text-[15px] font-medium rounded-lg bg-black hover:bg-white/10 transition-all">
            Outline (Dark BG)
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-block text-[13px] font-semibold text-blue-500 bg-blue-50 px-3 py-1 rounded-full">ROAS 420%</span>
          <span className="text-[12px] font-bold tracking-[0.05em] text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded">NEW</span>
          <span className="text-[12px] text-muted-foreground tracking-[0.1em] uppercase">Category Tag</span>
        </div>
      </div>
    </Section>

    {/* ── Cards ── */}
    <Section title="Cards & Components" bg="#fbfbfb">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Speech bubble card */}
        <div>
          <p className="text-[11px] text-muted-foreground mb-4">Pain Point Card</p>
          <div className="flex items-center gap-5">
            <div className="shrink-0 w-[72px] h-[72px] rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center shadow-sm">
              <img src="/emojis/confused.svg" alt="" className="w-10 h-10" />
            </div>
            <div className="flex-1 bg-white border border-[#e5e7eb] rounded-2xl px-6 py-5 shadow-sm">
              <p className="text-[15px] text-foreground leading-[1.7]">광고는 돌아가는데, 상담 신청 늘질 않아요</p>
            </div>
          </div>
        </div>

        {/* Case card */}
        <div>
          <p className="text-[11px] text-muted-foreground mb-4">Case Study Row</p>
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6">
            <span className="text-[12px] text-muted-foreground tracking-[0.1em] uppercase">온라인 교육</span>
            <h3 className="text-[22px] font-bold text-foreground mt-2">디지털노마드 하이클래스</h3>
            <span className="inline-block mt-2 text-[13px] font-semibold text-blue-500 bg-blue-50 px-3 py-1 rounded-full">ROAS 180% → 420%</span>
            <p className="text-[15px] text-foreground/80 leading-[1.85] mt-4">메시지 프레임워크를 재설계하고 크리에이티브를 교체한 결과, 6개월간 업계 평균 2배 이상의 효율을 유지.</p>
          </div>
        </div>

        {/* Lead magnet card */}
        <div>
          <p className="text-[11px] text-muted-foreground mb-4">Lead Magnet Card</p>
          <div className="border border-[#e5e7eb] rounded-2xl p-8 bg-white text-center">
            <FileText className="w-10 h-10 text-blue-500 mx-auto mb-4" />
            <h3 className="text-[20px] font-bold text-foreground mb-2">지식 상품 퍼널 진단 체크리스트</h3>
            <p className="text-[14px] text-muted-foreground mb-1">PDF, 12p</p>
            <p className="text-[15px] text-muted-foreground leading-[1.8] mb-6">당신의 퍼널에서 매출이 새고 있는 7가지 지점</p>
            <Link href="#" className="inline-flex items-center gap-2 px-8 py-4 bg-[#0a0f1e] text-white text-[15px] font-semibold rounded-xl">
              무료로 받기 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Video card */}
        <div>
          <p className="text-[11px] text-muted-foreground mb-4">Video Carousel Card</p>
          <div className="relative w-[280px] h-[420px] rounded-3xl overflow-hidden bg-black">
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src="/reels/1.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </Section>

    {/* ── Spacing & Layout ── */}
    <Section title="Spacing & Layout" bg="#ffffff">
      <div className="space-y-6">
        <div>
          <p className="text-[13px] font-semibold text-foreground mb-4">Section Spacing</p>
          <div className="space-y-3">
            {[
              { label: "Section padding", value: "py-28 (112px) / lg:py-36 (144px)" },
              { label: "Max width", value: "max-w-[1240px]" },
              { label: "Horizontal padding", value: "px-6 / lg:px-12" },
              { label: "Section title margin-bottom", value: "mb-16 (64px)" },
            ].map(s => (
              <div key={s.label} className="flex items-baseline gap-4">
                <span className="text-[13px] text-muted-foreground w-[200px] shrink-0">{s.label}</span>
                <code className="text-[13px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded">{s.value}</code>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-[#e5e7eb] pt-6">
          <p className="text-[13px] font-semibold text-foreground mb-4">Background Alternation Pattern</p>
          <div className="flex gap-2">
            {["#000000", "#ffffff", "#fbfbfb", "#ffffff", "#fbfbfb", "#ffffff", "#fbfbfb", "#fbfbfb"].map((c, i) => (
              <div key={i} className="flex-1 text-center">
                <div className="h-12 rounded-lg border border-[#e5e7eb]" style={{ background: c }} />
                <p className="text-[10px] text-muted-foreground mt-1">{["Hero", "Problem", "Knowledge", "Services", "Cases", "Philosophy", "Lead", "CTA"][i]}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-[#e5e7eb] pt-6">
          <p className="text-[13px] font-semibold text-foreground mb-4">Border & Shadow</p>
          <div className="space-y-3">
            {[
              { label: "Border color", value: "border-[#e5e7eb]" },
              { label: "Card radius", value: "rounded-2xl (16px)" },
              { label: "Button radius", value: "rounded-xl (12px) / rounded-lg (8px)" },
              { label: "Card shadow", value: "shadow-sm" },
            ].map(s => (
              <div key={s.label} className="flex items-baseline gap-4">
                <span className="text-[13px] text-muted-foreground w-[200px] shrink-0">{s.label}</span>
                <code className="text-[13px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded">{s.value}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  </div>
);

export default StyleGuideClient;

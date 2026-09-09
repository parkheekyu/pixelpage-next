"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  Users,
  TrendingDown,
  Zap,
  ShieldCheck,
  Infinity as InfinityIcon,
  Target,
  Eye,
  MessageSquare,
} from "lucide-react";
import logoPixelpage from "@/assets/logo-pixelpage.png";
import WhatWeDoSection from "@/components/agency/WhatWeDoSection";
import ProcessSection from "@/components/agency/ProcessSection";
import AgencyFAQSection from "@/components/agency/AgencyFAQSection";
import MethodSection from "@/components/MethodSection";
import type { Article } from "@/lib/notion";

const KAKAO_URL = "http://pf.kakao.com/_cxccdX/chat";

/* ─────────────────────── Reusable ─────────────────────── */

const PillLabel = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span
    className="inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-semibold border"
    style={{ borderColor: `${color}55`, color, backgroundColor: `${color}0f` }}
  >
    {children}
  </span>
);

const PurpleBtn = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white text-[15px] font-semibold transition-colors shadow-[0_18px_40px_-12px_rgba(99,102,241,0.55)]"
  >
    {children}
  </a>
);

/* ─────────────────────── Main ─────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LpClient = ({ articles = [] }: { articles?: Article[] }) => {
  const [form, setForm] = useState({ name: "", company: "", phone: "", budget: "", agree: false });
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.agree) return;
    const body = `이름: ${form.name}%0A회사: ${form.company}%0A연락처: ${form.phone}%0A월 광고 예산: ${form.budget}`;
    window.location.href = `mailto:contact@pixelpage.co.kr?subject=%5B무료%20상담%20신청%5D%20${encodeURIComponent(form.company || form.name)}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="bg-[#08080d] text-white min-h-screen selection:bg-indigo-500/30">
      {/* ── Floating Pill Navbar ── */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1120px,calc(100%-24px))]">
        <div className="rounded-full bg-[#0e0e18]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_18px_50px_-20px_rgba(0,0,0,0.7)] px-4 py-2 flex items-center gap-2">
          <a href="/" className="flex items-center gap-2 pl-2 pr-3">
            <Image src={logoPixelpage} alt="PixelPage" width={26} height={26} className="h-6 w-6" />
            <span className="text-white font-bold text-[15px] tracking-[-0.02em]" style={{ fontFamily: "'Playfair Display', var(--font-playfair), serif" }}>
              PixelPage
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center text-[13px]">
            <a href="#problem" className="px-4 py-2 rounded-full text-white/60 hover:text-white">문제</a>
            <a href="#solution" className="px-4 py-2 rounded-full text-white/60 hover:text-white">해결</a>
            <a href="#portfolio" className="px-4 py-2 rounded-full text-white/60 hover:text-white">성과</a>
            <a href="#process" className="px-4 py-2 rounded-full text-white/60 hover:text-white">진행 방식</a>
            <a href="#faq" className="px-4 py-2 rounded-full text-white/60 hover:text-white">FAQ</a>
          </nav>
          <a
            href="#cta"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white text-[13px] font-semibold transition-colors"
          >
            무료 상담
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* ── 1. Hero (와이드) ── */}
      <section
        className="relative pt-[160px] pb-24 lg:pt-[180px] lg:pb-40 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 1400px 720px at 50% 30%, rgba(99,102,241,0.32) 0%, rgba(99,102,241,0.08) 40%, transparent 70%), linear-gradient(180deg, #0b0b16 0%, #08080d 100%)",
        }}
      >
        {/* 은은한 그리드/노이즈 패턴 */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative max-w-[1240px] mx-auto px-6 lg:px-8 text-center">
          <PillLabel color="#818cf8">Partner DB Marketing</PillLabel>
          <h1 className="mt-8 break-keep text-white text-[clamp(42px,7vw,90px)] font-extrabold leading-[1.08] tracking-[-0.04em]">
            <span className="block">폭발적인 매출 향상</span>
            <span className="block bg-gradient-to-r from-indigo-300 via-indigo-400 to-indigo-300 bg-clip-text text-transparent">
              파트너형 DB 마케팅
            </span>
          </h1>
          <p className="mt-10 text-[17px] md:text-[19px] text-white/60 leading-[1.85] max-w-[560px] mx-auto">
            광고 소재부터 랜딩페이지, CRM 마케팅을<br />
            <span className="text-white/85 font-semibold">터질 때까지 무한 테스트</span>합니다.
          </p>
          <div className="mt-12">
            <PurpleBtn href="#cta">무료 상담 신청하기 <ArrowRight className="w-4 h-4" /></PurpleBtn>
          </div>
          <p className="mt-6 text-[12.5px] text-white/40">평균 회신 3시간 이내 · 계약 강요 없음</p>
        </div>
      </section>

      {/* ── 2. 함께하는 파트너사 ── */}
      <section className="py-12 border-y border-white/[0.06]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <p className="text-center text-[11px] tracking-[0.28em] font-semibold text-white/40 mb-8 uppercase">
            함께하는 파트너사
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {["EDULINE", "NORISCHOOL", "CLINIQUE", "SUNROOM", "STUDIONINE", "MEGATEACH", "KLASSE"].map((b) => (
              <div key={b} className="h-14 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-white/45 text-[12.5px] font-bold tracking-[-0.01em]">
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. 문제 제기 ── */}
      <section id="problem" className="py-24 lg:py-32">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <PillLabel color="#f87171">Problem</PillLabel>
            <h2 className="mt-6 break-keep text-[clamp(30px,4.5vw,52px)] font-bold leading-[1.2] tracking-[-0.03em]">
              <span className="font-normal text-white/40">기존의 DB 마케팅 방식으로는</span><br />
              <span className="font-extrabold">매출 규모를 키우기 어렵습니다</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[980px] mx-auto">
            {[
              {
                icon: Search,
                tag: "출처를 모릅니다",
                body: "어떤 광고를 보고 온 고객인지 모르니, 상담 품질이 복불복입니다.",
              },
              {
                icon: Users,
                tag: "나만의 DB가 아닙니다",
                body: "같은 DB가 여러 업체에 팔립니다. 전화하면 이미 경쟁사와 통화 중입니다.",
              },
              {
                icon: TrendingDown,
                tag: "늘리는 순간 무너집니다",
                body: "물량을 키우면 허수가 섞이고 단가는 뜁니다. 매출을 키우고 싶어도, 구조가 못 받쳐줍니다.",
              },
              {
                icon: Zap,
                tag: "개선이 없습니다",
                body: "성과가 안 나와도 소재도 타겟도 그대로. 파는 쪽은 바꿀 이유가 없으니까요.",
              },
            ].map((p) => (
              <div
                key={p.tag}
                className="rounded-3xl border border-white/[0.06] bg-[#0c0c14] p-8 hover:border-red-400/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-400/20 flex items-center justify-center flex-shrink-0">
                    <p.icon className="w-5 h-5 text-red-300" />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold text-white mb-2 tracking-[-0.02em]">
                      {p.tag}
                    </h3>
                    <p className="text-[14px] text-white/55 leading-[1.85]">{p.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. 해결 ── */}
      <section
        id="solution"
        className="py-24 lg:py-32 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 800px 500px at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)",
        }}
      >
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <PillLabel color="#818cf8">Solution</PillLabel>
            <h2 className="mt-6 break-keep text-[clamp(30px,4.5vw,52px)] font-bold leading-[1.2] tracking-[-0.03em]">
              <span className="font-normal text-white/40">그래서 픽셀페이지는</span><br />
              <span className="font-extrabold text-indigo-300">파트너형 DB 마케팅</span>
              <span className="font-normal text-white/40">을 고집합니다</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1080px] mx-auto">
            {[
              { icon: ShieldCheck, tag: "01", title: "전용", body: "소재도 랜딩도 귀사 것만. 공유 DB 0건." },
              { icon: InfinityIcon, tag: "02", title: "무한 테스트", body: "터지는 조합을 찾을 때까지 다시 만듭니다." },
              { icon: Target, tag: "03", title: "전환까지", body: "DB에서 끝내지 않고 매출까지 함께 봅니다." },
              { icon: Eye, tag: "04", title: "투명 공개", body: "성과 데이터를 전부 오픈합니다." },
            ].map((s) => (
              <div
                key={s.tag}
                className="rounded-3xl bg-[#0c0c14]/80 border border-indigo-400/15 p-8 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/25 to-indigo-500/10 border border-indigo-400/25 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-indigo-300" />
                  </div>
                  <span className="text-[11px] text-indigo-300/60 font-mono font-bold">{s.tag}</span>
                </div>
                <h3 className="text-[20px] font-bold mb-3 tracking-[-0.02em]">{s.title}</h3>
                <p className="text-[13.5px] text-white/60 leading-[1.85]">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center max-w-[640px] mx-auto">
            <p className="text-[19px] md:text-[22px] text-white leading-[1.55] font-semibold tracking-[-0.02em]">
              들쑥날쑥한 <span className="text-indigo-300">DB 품질 문제</span>,<br />
              <span className="text-white/70 font-medium">구조를 만드는 방법으로 해결해 보세요.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. 하나의 팀이 처음부터 끝까지 (MethodSection 재사용) ── */}
      <div className="border-t border-white/[0.04]">
        <MethodSection variant="dark" />
      </div>

      {/* ── 6. 포트폴리오 ── */}
      <section id="portfolio" className="py-24 lg:py-32">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <PillLabel color="#fb923c">Portfolio</PillLabel>
            <h2 className="mt-6 break-keep text-[clamp(30px,4.5vw,52px)] font-bold leading-[1.2] tracking-[-0.03em]">
              <span className="font-extrabold">파트너사는 이만큼</span><br />
              <span className="font-normal text-white/40">성장했습니다</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                co: "성인 D교육",
                industry: "지식 콘텐츠",
                stats: [
                  { k: "DB 단가", v: "-42%" },
                  { k: "DB 수", v: "3.1배" },
                  { k: "전환율", v: "2배" },
                ],
              },
              {
                co: "강남 P학원",
                industry: "학원 프랜차이즈",
                stats: [
                  { k: "DB 단가", v: "-58%" },
                  { k: "월 상담", v: "2.4배" },
                  { k: "매출", v: "2배" },
                ],
              },
              {
                co: "태양광 G",
                industry: "시공 서비스",
                stats: [
                  { k: "일 문의", v: "20배" },
                  { k: "전환율", v: "2배" },
                  { k: "매출", v: "3배" },
                ],
              },
              {
                co: "코칭 M",
                industry: "1:1 코칭",
                stats: [
                  { k: "DB 단가", v: "-35%" },
                  { k: "상담 예약", v: "3.8배" },
                  { k: "매출", v: "4배" },
                ],
              },
            ].map((c) => (
              <div
                key={c.co}
                className="rounded-3xl bg-[#0c0c14] border border-white/[0.06] p-7 hover:border-indigo-400/25 transition-colors"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[15px] font-bold">{c.co}</p>
                    <p className="text-[11.5px] text-white/45 mt-0.5">{c.industry}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-indigo-300/60" />
                </div>
                <div className="space-y-3.5">
                  {c.stats.map((s) => (
                    <div key={s.k} className="flex items-baseline justify-between">
                      <span className="text-[12.5px] text-white/50">{s.k}</span>
                      <span className="text-[19px] font-extrabold text-indigo-300 tabular-nums tracking-[-0.02em]">
                        {s.v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a
              href="#cta"
              className="inline-flex items-center gap-1.5 text-[13px] text-indigo-300 hover:text-indigo-200 font-semibold border border-white/10 hover:border-white/25 px-5 py-2.5 rounded-full transition-colors"
            >
              더 보기 <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── 7. What We Do (marketing agency 재사용, 다크) ── */}
      <div id="service" className="border-t border-white/[0.04]">
        <WhatWeDoSection variant="dark" />
      </div>

      {/* ── 8. Process (marketing agency 재사용, 다크) ── */}
      <div id="process" className="border-t border-white/[0.04]">
        <ProcessSection variant="dark" />
      </div>

      {/* ── 9. FAQ (agency 재사용, 다크) ── */}
      <div id="faq" className="border-t border-white/[0.04]">
        <AgencyFAQSection variant="dark" />
      </div>

      {/* ── 10. CTA ── */}
      <section
        id="cta"
        className="py-24 lg:py-32 relative overflow-hidden border-t border-white/[0.06]"
        style={{
          background:
            "radial-gradient(ellipse 900px 500px at 50% 100%, rgba(99,102,241,0.28) 0%, transparent 70%), linear-gradient(180deg, #08080d 0%, #0b0b16 100%)",
        }}
      >
        <div className="max-w-[720px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <PillLabel color="#818cf8">Free Consultation</PillLabel>
            <h2 className="mt-6 break-keep text-white text-[clamp(30px,4.5vw,54px)] font-extrabold leading-[1.15] tracking-[-0.035em]">
              DB를 <span className="text-white/40 line-through decoration-[3px]">사지</span> 마세요.<br />
              <span className="text-indigo-300">나오는 구조</span>를 만드세요.
            </h2>
            <p className="mt-6 text-[15px] text-white/60 leading-[1.85]">
              광고 계정·랜딩·CRM을 함께 열어보고 어디가 새는지 찾아드립니다.<br />
              계약 없이도 괜찮습니다.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-3xl bg-[#0c0c14] border border-white/[0.06] p-10 text-center">
              <p className="text-[18px] font-semibold mb-3">신청이 접수되었습니다.</p>
              <p className="text-[13px] text-white/55 mb-6">평균 3시간 이내 담당자가 연락드립니다.</p>
              <a
                href={KAKAO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FEE500] text-[#181600] text-[14px] font-bold hover:bg-[#ffe95c] transition-colors"
              >
                <MessageSquare className="w-4 h-4" /> 카카오톡으로 바로 문의
              </a>
            </div>
          ) : (
            <form onSubmit={submit} className="rounded-3xl bg-[#0c0c14] border border-white/[0.06] p-7 md:p-9 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="성함"
                  className="w-full px-4 py-3.5 rounded-xl bg-transparent border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400"
                />
                <input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="회사·브랜드명"
                  className="w-full px-4 py-3.5 rounded-xl bg-transparent border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400"
                />
              </div>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="연락처"
                className="w-full px-4 py-3.5 rounded-xl bg-transparent border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400"
              />
              <select
                required
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl bg-transparent border border-white/10 text-white/90 focus:outline-none focus:border-indigo-400"
              >
                <option value="" className="bg-[#0c0c14]">월 광고 예산 선택</option>
                <option className="bg-[#0c0c14]">500만 원 미만</option>
                <option className="bg-[#0c0c14]">500 ~ 1,000만 원</option>
                <option className="bg-[#0c0c14]">1,000 ~ 3,000만 원</option>
                <option className="bg-[#0c0c14]">3,000만 원 이상</option>
              </select>
              <label className="flex items-start gap-2.5 text-[12.5px] text-white/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                  className="mt-0.5"
                  required
                />
                <span>개인정보 수집·이용에 동의합니다. (상담 목적 외 사용하지 않습니다)</span>
              </label>
              <button
                type="submit"
                className="w-full mt-2 px-6 py-4 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white text-[15px] font-bold shadow-[0_18px_40px_-14px_rgba(99,102,241,0.55)] transition-colors"
              >
                무료 상담 신청하기 →
              </button>
              <p className="text-center text-[11.5px] text-white/40 pt-1">
                평균 회신 3시간 이내 · 계약 강요 없음
              </p>
            </form>
          )}

          <div className="mt-8 text-center text-[12.5px] text-white/40">
            바로 대화가 편하신가요? &nbsp;
            <a
              href={KAKAO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FEE500] font-semibold hover:underline"
            >
              카카오톡 채널로 문의 →
            </a>
          </div>
        </div>
      </section>

      {/* ── 11. Footer ── */}
      <footer className="py-12 bg-[#06060a] border-t border-white/[0.05]">
        <div className="max-w-[1120px] mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <a href="/" className="flex items-center gap-2">
            <Image src={logoPixelpage} alt="PixelPage" width={22} height={22} className="h-5 w-5 opacity-70" />
            <span className="text-white/60 font-bold text-[14px] tracking-[-0.02em]" style={{ fontFamily: "'Playfair Display', var(--font-playfair), serif" }}>
              PixelPage
            </span>
          </a>
          <p className="text-[11.5px] text-white/35 text-center">
            © PIXELPAGE · pixelpage.co.kr · contact@pixelpage.co.kr
          </p>
          <div className="flex items-center gap-3 text-[11.5px] text-white/35">
            <a href="/columns" className="hover:text-white/60">칼럼</a>
            <span className="text-white/15">·</span>
            <a href="/consult" className="hover:text-white/60">상담</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LpClient;

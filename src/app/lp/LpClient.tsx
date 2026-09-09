"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  MessageSquare,
  Search,
  Users,
  TrendingDown,
  Zap,
  ShieldCheck,
  Infinity as InfinityIcon,
  Target,
  Eye,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";

const KAKAO_URL = "http://pf.kakao.com/_cxccdX/chat";

const PrimaryBtn = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="inline-flex items-center gap-2 px-8 py-4 bg-[#2563eb] hover:bg-[#3b82f6] text-white text-[15px] font-semibold rounded-full transition-colors shadow-[0_18px_40px_-14px_rgba(37,99,235,0.55)]"
  >
    {children}
  </a>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-blue-400 mb-4">{children}</p>
);

const H2 = ({ children, mt = false }: { children: React.ReactNode; mt?: boolean }) => (
  <h2
    className={`break-keep text-white text-[clamp(28px,4vw,44px)] font-bold leading-[1.25] tracking-[-0.03em] ${
      mt ? "mt-1" : ""
    }`}
  >
    {children}
  </h2>
);

const LpClient = () => {
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
    <div className="bg-[#0a0f1e] text-white min-h-screen">
      {/* ── Nav ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1e]/85 backdrop-blur-lg border-b border-white/[0.06]">
        <div className="max-w-[1240px] mx-auto h-[68px] px-6 lg:px-10 flex items-center justify-between">
          <a href="/" className="leading-[0.95] font-extrabold tracking-[-0.02em] text-[14px]">
            <div className="text-white">PIXEL</div>
            <div className="text-blue-400">PAGE</div>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-[13px] text-white/60">
            <a href="#problem" className="hover:text-white">문제</a>
            <a href="#solution" className="hover:text-white">해결</a>
            <a href="#portfolio" className="hover:text-white">성과</a>
            <a href="#process" className="hover:text-white">진행 방식</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <a
            href="#cta"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#2563eb] hover:bg-[#3b82f6] text-white text-[13px] font-semibold rounded-full transition-colors"
          >
            무료 상담 신청 <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* ── 1. Hero ── */}
      <section
        className="relative pt-[150px] pb-28 lg:pb-36 overflow-hidden text-center"
        style={{
          background:
            "radial-gradient(ellipse 900px 600px at 50% 20%, rgba(37,99,235,0.35) 0%, rgba(37,99,235,0.08) 40%, transparent 70%), linear-gradient(180deg, #0a0f1e 0%, #06090f 100%)",
        }}
      >
        <div className="max-w-[880px] mx-auto px-6 lg:px-10 relative">
          <p className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.22em] uppercase text-blue-300 bg-white/[0.04] border border-white/[0.08] px-4 py-2 rounded-full mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Partner DB Marketing
          </p>
          <h1 className="break-keep text-white text-[clamp(38px,5.8vw,68px)] font-extrabold leading-[1.15] tracking-[-0.035em] mb-8">
            폭발적인 매출 향상<br />
            <span className="text-blue-400">파트너형 DB 마케팅</span>
          </h1>
          <p className="text-[17px] md:text-[19px] text-white/60 leading-[1.75] max-w-[560px] mx-auto mb-12">
            광고 소재부터 랜딩페이지, CRM 마케팅을<br />
            <span className="text-white/85 font-semibold">터질 때까지 무한 테스트</span>합니다.
          </p>
          <PrimaryBtn href="#cta">무료 상담 신청하기 <ArrowRight className="w-4 h-4" /></PrimaryBtn>
          <p className="mt-6 text-[12.5px] text-white/40">평균 회신 3시간 이내 · 계약 강요 없음</p>
        </div>
      </section>

      {/* ── 2. Partners ── */}
      <section className="py-10 bg-[#0a0f1e] border-y border-white/[0.06]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <p className="text-center text-[11px] tracking-[0.28em] font-semibold text-white/40 mb-6 uppercase">
            함께하는 파트너사
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-white/55 text-[15px] font-semibold tracking-[-0.01em]">
            <span>EDULINE</span>
            <span>NORISCHOOL</span>
            <span>CLINIQUE-K</span>
            <span>SUNROOM</span>
            <span>STUDIONINE</span>
            <span>MEGATEACH</span>
            <span>CODEROAD</span>
            <span>KLASSE</span>
          </div>
        </div>
      </section>

      {/* ── 3. Problem ── */}
      <section id="problem" className="py-24 lg:py-32 bg-[#0a0f1e]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <Eyebrow>Problem</Eyebrow>
            <H2>
              기존의 DB 마케팅 방식으로는<br />
              <span className="text-white/60 font-semibold">매출 규모를 키우기 어렵습니다</span>
            </H2>
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
                className="rounded-2xl border border-white/[0.08] p-7 bg-[#0f1425] hover:border-white/[0.14] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-400/20 flex items-center justify-center flex-shrink-0">
                    <p.icon className="w-5 h-5 text-red-300" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-white mb-2 tracking-[-0.02em]">
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

      {/* ── 4. Solution ── */}
      <section
        id="solution"
        className="py-24 lg:py-32 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 720px 400px at 50% 0%, rgba(37,99,235,0.18) 0%, transparent 70%), linear-gradient(180deg, #06090f 0%, #0a0f1e 100%)",
        }}
      >
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <Eyebrow>Solution</Eyebrow>
            <H2>
              그래서 픽셀페이지는<br />
              <span className="text-blue-400">파트너형 DB 마케팅</span>을 고집합니다
            </H2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1080px] mx-auto">
            {[
              {
                icon: ShieldCheck,
                tag: "01",
                title: "전용",
                body: "소재도 랜딩도 귀사 것만. 공유 DB 0건.",
              },
              {
                icon: InfinityIcon,
                tag: "02",
                title: "무한 테스트",
                body: "터지는 조합을 찾을 때까지 다시 만듭니다.",
              },
              {
                icon: Target,
                tag: "03",
                title: "전환까지",
                body: "DB에서 끝내지 않고 매출까지 함께 봅니다.",
              },
              {
                icon: Eye,
                tag: "04",
                title: "투명 공개",
                body: "성과 데이터를 전부 오픈합니다.",
              },
            ].map((s) => (
              <div
                key={s.tag}
                className="rounded-2xl bg-[#0f1425]/80 border border-blue-400/15 p-7 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/25 to-blue-500/10 border border-blue-400/25 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-blue-300" />
                  </div>
                  <span className="text-[11px] text-blue-300/60 font-mono font-bold">{s.tag}</span>
                </div>
                <h3 className="text-[19px] font-bold mb-3 tracking-[-0.02em]">{s.title}</h3>
                <p className="text-[13.5px] text-white/60 leading-[1.85]">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center max-w-[640px] mx-auto">
            <p className="text-[18px] md:text-[20px] text-white leading-[1.55] font-semibold tracking-[-0.02em]">
              들쑥날쑥한 <span className="text-blue-400">DB 품질 문제</span>,<br />
              <span className="text-white/70 font-medium">구조를 만드는 방법으로 해결해 보세요.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. One Team ── */}
      <section className="py-24 lg:py-32 bg-[#0a0f1e]">
        <div className="max-w-[1080px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-14 items-center">
          <div>
            <Eyebrow>One Team</Eyebrow>
            <H2>
              하나의 팀이<br />
              처음부터 끝까지.
            </H2>
            <p className="mt-6 text-[16px] text-white/60 leading-[1.85]">
              브랜드 맞춤 기획부터 <span className="text-white/85 font-semibold">디자인과 개발까지</span>,<br />
              빠르게 제작하고 테스트합니다.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "기획", desc: "브랜드·타겟 진단" },
              { name: "디자인", desc: "소재·랜딩 제작" },
              { name: "개발", desc: "전환 트래킹·CRM" },
            ].map((r) => (
              <div
                key={r.name}
                className="rounded-2xl bg-[#0f1425] border border-white/[0.08] p-6 text-center"
              >
                <p className="text-[16px] font-bold mb-1.5 tracking-[-0.02em]">{r.name}</p>
                <p className="text-[11.5px] text-white/50">{r.desc}</p>
              </div>
            ))}
            <div className="col-span-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/[0.02] border border-blue-400/15 p-5 text-center">
              <span className="text-[11px] tracking-[0.28em] font-bold text-blue-300 uppercase">
                ▶ ONE TEAM · 걸림 없는 리소스
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Portfolio ── */}
      <section id="portfolio" className="py-24 lg:py-32 bg-[#0a0f1e] border-t border-white/[0.04]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <Eyebrow>Portfolio</Eyebrow>
            <H2>
              파트너사는<br />
              이만큼 성장했습니다.
            </H2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                co: "성인 D교육",
                industry: "지식 콘텐츠",
                stats: [
                  { k: "DB 단가", v: "-42%", positive: true },
                  { k: "DB 수", v: "3.1배", positive: true },
                  { k: "매출", v: "10배", positive: true },
                ],
              },
              {
                co: "강남 P학원",
                industry: "학원 프랜차이즈",
                stats: [
                  { k: "DB 단가", v: "-58%", positive: true },
                  { k: "월 상담", v: "2.4배", positive: true },
                  { k: "매출", v: "2배", positive: true },
                ],
              },
              {
                co: "태양광 G",
                industry: "시공 서비스",
                stats: [
                  { k: "일 문의", v: "20배", positive: true },
                  { k: "전환율", v: "2배", positive: true },
                  { k: "매출", v: "3배", positive: true },
                ],
              },
              {
                co: "코칭 M",
                industry: "1:1 코칭",
                stats: [
                  { k: "DB 단가", v: "-35%", positive: true },
                  { k: "상담 예약", v: "3.8배", positive: true },
                  { k: "매출", v: "4배", positive: true },
                ],
              },
            ].map((c) => (
              <div
                key={c.co}
                className="rounded-2xl bg-[#0f1425] border border-white/[0.08] p-6 hover:border-blue-400/25 transition-colors"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[15px] font-bold">{c.co}</p>
                    <p className="text-[11px] text-white/45 mt-0.5">{c.industry}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-blue-300/60" />
                </div>
                <div className="space-y-3">
                  {c.stats.map((s) => (
                    <div key={s.k} className="flex items-baseline justify-between">
                      <span className="text-[12px] text-white/50">{s.k}</span>
                      <span className="text-[18px] font-extrabold text-blue-300 tabular-nums">
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
              className="inline-flex items-center gap-1.5 text-[13px] text-blue-300 hover:text-blue-200 font-semibold border border-white/10 hover:border-white/25 px-5 py-2.5 rounded-full transition-colors"
            >
              더 보기 <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── 7. What We Do ── */}
      <section className="py-24 lg:py-32 bg-[#0a0f1e] border-t border-white/[0.04]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <Eyebrow>What We Do</Eyebrow>
            <H2>
              광고부터 전환까지<br />
              끊기지 않게 연결해요.
            </H2>
            <p className="mt-5 text-[14px] text-white/55 max-w-[520px] mx-auto leading-[1.85]">
              세 개를 따로 굴리면 반드시 어딘가 끊깁니다.<br />
              하나의 팀이 설계·분석·개선합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[1080px] mx-auto">
            {[
              {
                tag: "01",
                name: "퍼포먼스 마케팅",
                sub: "상담 신청을 만드는 광고",
                items: [
                  "구조 기반 캠페인 설계",
                  "소재 기획·제작·교체",
                  "스케일링 & 예산 확장",
                ],
              },
              {
                tag: "02",
                name: "랜딩페이지",
                sub: "이탈을 막는 페이지",
                items: [
                  "광고 메시지 연계 설계",
                  "전환 UI/UX 최적화",
                  "DB 수집 시스템 점검",
                ],
              },
              {
                tag: "03",
                name: "CRM 자동화",
                sub: "신청을 매출로 바꾸는 시퀀스",
                items: [
                  "행동 기반 자동화 퍼널",
                  "카톡·문자·이메일 분기",
                  "육성 시퀀스 구축",
                ],
              },
            ].map((s) => (
              <div key={s.tag} className="rounded-2xl bg-[#0f1425] border border-white/[0.08] p-7">
                <span className="inline-block text-[11px] font-bold tracking-[0.1em] text-blue-300 bg-blue-500/12 px-2.5 py-1 rounded-full mb-4">
                  {s.tag}
                </span>
                <h3 className="text-[19px] font-bold mb-1 tracking-[-0.02em]">{s.name}</h3>
                <p className="text-[13px] text-white/50 mb-5">{s.sub}</p>
                <ul className="space-y-2.5">
                  {s.items.map((it) => (
                    <li
                      key={it}
                      className="flex items-start gap-2.5 text-[13.5px] text-white/70 leading-[1.65]"
                    >
                      <Check className="w-3.5 h-3.5 text-blue-400 mt-1 flex-shrink-0" strokeWidth={2.5} />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 max-w-[1080px] mx-auto">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-400/15 px-7 py-6 text-center">
              <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-blue-300 mb-2">
                Outcome
              </p>
              <p className="text-[18px] font-bold tracking-[-0.02em]">
                이 모든 흐름이 <span className="text-blue-300">매출로 연결됩니다.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Process ── */}
      <section id="process" className="py-24 lg:py-32 bg-[#0a0f1e] border-t border-white/[0.04]">
        <div className="max-w-[1080px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <Eyebrow>Process</Eyebrow>
            <H2>
              처음 만나는 순간부터<br />
              투명하게 진행해요.
            </H2>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-6 left-[12%] right-[12%] h-px bg-white/10" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {[
                { n: "01", t: "무료 마케팅 진단", d: "광고·랜딩·CRM 진단. 계약 없이 진단만 받으셔도 됩니다.", accent: false },
                { n: "02", t: "파이프라인 구조 설계", d: "채널·소재·랜딩·시퀀스를 한 번에 설계합니다.", accent: false },
                { n: "03", t: "실전 집행 & 주간 최적화", d: "매주 CPA·전환 기준으로 살릴지·끌지·교체할지 결정합니다.", accent: true },
                { n: "04", t: "스케일링 & 성과 보고", d: "이긴 구조를 복제하고 예산을 단계적으로 확장합니다.", accent: true },
              ].map((s) => (
                <div key={s.n} className="text-center">
                  <div
                    className={`relative z-10 w-12 h-12 rounded-full mx-auto mb-5 flex items-center justify-center text-[13px] font-bold ${
                      s.accent
                        ? "bg-blue-500 text-white shadow-[0_0_0_6px_rgba(37,99,235,0.16)]"
                        : "bg-[#0a0f1e] border border-white/15 text-white"
                    }`}
                  >
                    {s.n}
                  </div>
                  <h3 className="text-[15px] font-bold mb-2 tracking-[-0.02em]">{s.t}</h3>
                  <p className="text-[12.5px] text-white/50 leading-[1.75] px-1">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. FAQ ── */}
      <section id="faq" className="py-24 lg:py-32 bg-[#0a0f1e] border-t border-white/[0.04]">
        <div className="max-w-[820px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <Eyebrow>FAQ</Eyebrow>
            <H2>궁금한 게 있으신가요?</H2>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {[
              {
                q: "일반 광고 대행사랑 뭐가 다른가요?",
                a: "광고만 하지 않습니다. 광고·랜딩·CRM을 하나의 팀이 설계·분석·개선합니다. 퍼널 전체를 보기 때문에 어디가 문제인지 즉시 파악합니다.",
              },
              {
                q: "월 광고비가 크지 않아도 가능한가요?",
                a: "가능합니다. 다만 최소 3주 학습 예산은 확보하셔야 정확한 판단이 가능합니다. 무료 진단에서 예산 규모에 맞는 구조를 함께 잡아드립니다.",
              },
              {
                q: "계약 기간은 어떻게 되나요?",
                a: "월 단위 또는 프로젝트 단위로 유연하게 진행합니다. 진단 후 브랜드 상황에 맞는 구조를 함께 설계합니다.",
              },
              {
                q: "무료 진단은 정말 무료인가요?",
                a: "네. 계약 전에 광고 계정·랜딩 전환율·CRM 구조를 무료로 분석해 드립니다. 진단만 받고 안 하셔도 괜찮습니다.",
              },
              {
                q: "우리 업종은 안 되던데 가능할까요?",
                a: "B2C 상담이 필요한 업종이라면 대부분 가능합니다. 교육·코칭·의료·인테리어·태양광·법률 등 다양한 업종에서 성과를 만들었습니다.",
              },
            ].map((f, i) => (
              <details key={i} className="group py-5">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-[15px] md:text-[16px] font-semibold text-white tracking-[-0.015em]">
                    {f.q}
                  </span>
                  <ChevronDown className="w-5 h-5 text-white/40 transition-transform group-open:rotate-180 flex-shrink-0" />
                </summary>
                <p className="mt-4 text-[13.5px] text-white/55 leading-[1.85]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. Final CTA ── */}
      <section
        id="cta"
        className="py-24 lg:py-32 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 900px 500px at 50% 100%, rgba(37,99,235,0.28) 0%, transparent 70%), linear-gradient(180deg, #06090f 0%, #0a0f1e 100%)",
        }}
      >
        <div className="max-w-[720px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <Eyebrow>Free Consultation</Eyebrow>
            <h2 className="break-keep text-white text-[clamp(28px,4.2vw,48px)] font-extrabold leading-[1.2] tracking-[-0.035em]">
              DB를 <span className="text-white/45 line-through decoration-[3px]">사지</span> 마세요.<br />
              <span className="text-blue-400">나오는 구조</span>를 만드세요.
            </h2>
            <p className="mt-6 text-[15px] text-white/60 leading-[1.85]">
              광고 계정·랜딩·CRM을 함께 열어보고 어디가 새는지 찾아드립니다.<br />
              계약 없이도 괜찮습니다.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-2xl bg-[#0f1425] border border-white/10 p-10 text-center">
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
            <form onSubmit={submit} className="rounded-2xl bg-[#0f1425] border border-white/10 p-7 md:p-9 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="성함"
                  className="w-full px-4 py-3.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder-white/35 focus:outline-none focus:border-blue-400"
                />
                <input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="회사·브랜드명"
                  className="w-full px-4 py-3.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder-white/35 focus:outline-none focus:border-blue-400"
                />
              </div>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="연락처"
                className="w-full px-4 py-3.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder-white/35 focus:outline-none focus:border-blue-400"
              />
              <select
                required
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full px-4 py-3.5 rounded-lg bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:border-blue-400"
              >
                <option value="">월 광고 예산 선택</option>
                <option>500만 원 미만</option>
                <option>500 ~ 1,000만 원</option>
                <option>1,000 ~ 3,000만 원</option>
                <option>3,000만 원 이상</option>
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
                className="w-full mt-2 px-6 py-4 bg-[#2563eb] hover:bg-[#3b82f6] text-white text-[15px] font-bold rounded-full shadow-[0_18px_40px_-14px_rgba(37,99,235,0.55)] transition-colors"
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

      {/* Footer */}
      <footer className="py-10 bg-[#06090f] text-white/35 text-center text-[11.5px] border-t border-white/[0.06]">
        <div className="max-w-[1240px] mx-auto px-6">
          © PIXELPAGE · pixelpage.co.kr · contact@pixelpage.co.kr
        </div>
      </footer>
    </div>
  );
};

export default LpClient;

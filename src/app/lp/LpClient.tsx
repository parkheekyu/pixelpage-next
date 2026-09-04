"use client";

import { useState } from "react";
import { ArrowRight, Check, Users, LineChart, Zap, Bell, Sparkles, ChevronDown, MessageSquare } from "lucide-react";

const KAKAO_URL = "http://pf.kakao.com/_cxccdX/chat";

/* ─────────────────────── Sub components ─────────────────────── */

const SectionEyebrow = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <p className={`text-[12px] font-bold tracking-[0.22em] uppercase mb-4 ${dark ? "text-blue-300" : "text-blue-600"}`}>
    {children}
  </p>
);

const SectionTitle = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <h2
    className={`break-keep text-[clamp(30px,4.5vw,52px)] font-bold leading-[1.18] tracking-[-0.035em] ${
      dark ? "text-white" : "text-[#0a0f1e]"
    }`}
  >
    {children}
  </h2>
);

const PrimaryButton = ({
  href,
  onClick,
  children,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) => {
  const cls =
    "inline-flex items-center gap-2 px-8 py-4 bg-[#ff6b00] text-white text-[15px] font-bold rounded-xl shadow-[0_14px_30px_-10px_rgba(255,107,0,0.6)] hover:bg-[#ff7c1a] hover:-translate-y-0.5 transition-all";
  if (href) return <a href={href} className={cls}>{children}</a>;
  return <button onClick={onClick} className={cls}>{children}</button>;
};

const SecondaryButton = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="inline-flex items-center gap-2 px-8 py-4 border border-white/25 text-white text-[15px] font-semibold rounded-xl hover:bg-white/5 hover:border-white/40 transition-all"
  >
    {children}
  </a>
);

/* ─────────────────────── Main Client ─────────────────────── */

const LpClient = () => {
  const [form, setForm] = useState({ name: "", company: "", phone: "", budget: "", agree: false });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.agree) return;
    const body = `이름: ${form.name}%0A회사: ${form.company}%0A연락처: ${form.phone}%0A월 광고 예산: ${form.budget}`;
    // 카카오 채팅으로 안내 (이메일 폴백)
    window.location.href = `mailto:contact@pixelpage.co.kr?subject=%5B무료%20진단%20신청%5D%20${encodeURIComponent(form.company || form.name)}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="bg-white text-[#0a0f1e]">
      {/* ── Top slim nav ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-[#eef0f4]">
        <div className="max-w-[1240px] mx-auto h-[64px] px-5 lg:px-8 flex items-center justify-between">
          <a href="/" className="text-[16px] font-extrabold tracking-[-0.02em] text-[#0a0f1e]">
            <span className="text-[#0a0f1e]">Pixel</span>
            <span className="text-blue-600">Page</span>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-[13px] text-[#6b7280]">
            <a href="#cases" className="hover:text-[#0a0f1e]">성과</a>
            <a href="#how" className="hover:text-[#0a0f1e]">진행 방식</a>
            <a href="#faq" className="hover:text-[#0a0f1e]">FAQ</a>
          </nav>
          <PrimaryButton href="#cta">무료 진단 신청</PrimaryButton>
        </div>
      </header>

      {/* ── 1. Hero ── */}
      <section className="relative pt-[120px] pb-24 lg:pb-32 overflow-hidden bg-[#06090f]">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/reels/2.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/85" />
        </div>
        <div className="relative max-w-[1240px] mx-auto px-6 lg:px-12 text-center text-white">
          <p className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.2em] uppercase text-blue-300 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-3.5 h-3.5" /> DB 마케팅 전담 파트너
          </p>
          <h1 className="break-keep text-[clamp(36px,6.5vw,72px)] font-bold leading-[1.1] tracking-[-0.035em] mb-6">
            광고비는 줄이고,<br />매출은 폭발시키세요.
          </h1>
          <p className="text-[18px] md:text-[20px] text-white/65 leading-[1.75] max-w-[620px] mx-auto mb-12">
            교육·코칭·전문 서비스 브랜드 전담.<br />
            3개월 안에 문의량 <b className="text-white">2~5배</b>, 광고비 대비 매출로만 증명합니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <PrimaryButton href="#cta">무료 진단 신청하기 <ArrowRight className="w-4 h-4" /></PrimaryButton>
            <SecondaryButton href="#cases">성과 사례 보기</SecondaryButton>
          </div>
          <p className="mt-8 text-[13px] text-white/45">평균 회신 3시간 이내 · 상담 후 계약 강요 없음</p>
        </div>
      </section>

      {/* ── 2. Industry trust bar ── */}
      <section className="py-12 bg-white border-b border-[#eef0f4]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <p className="text-center text-[12px] font-semibold tracking-[0.18em] uppercase text-[#8b95a1] mb-6">
            함께한 업종
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[15px] text-[#4b5563] font-medium">
            <span>성인 교육</span>
            <span className="text-[#e5e7eb]">·</span>
            <span>코칭 · 컨설팅</span>
            <span className="text-[#e5e7eb]">·</span>
            <span>학원</span>
            <span className="text-[#e5e7eb]">·</span>
            <span>피부·성형과</span>
            <span className="text-[#e5e7eb]">·</span>
            <span>인테리어</span>
            <span className="text-[#e5e7eb]">·</span>
            <span>태양광 시공</span>
            <span className="text-[#e5e7eb]">·</span>
            <span>부동산</span>
            <span className="text-[#e5e7eb]">·</span>
            <span>지식 SaaS</span>
          </div>
        </div>
      </section>

      {/* ── 3. Why us — 3 differentiators ── */}
      <section className="py-24 lg:py-32 bg-[#fbfbfb]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <SectionEyebrow>Why Pixelpage</SectionEyebrow>
            <SectionTitle>대행사가 아니라,<br />매출 파이프라인 팀입니다.</SectionTitle>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: LineChart,
                tag: "01",
                title: "광고만 하지 않습니다",
                body: "광고·랜딩·CRM을 하나의 구조로 봅니다. 문의가 안 늘면 어디가 새는지 즉시 찾아냅니다.",
              },
              {
                icon: Users,
                tag: "02",
                title: "실행 담당자가 미팅에 나옵니다",
                body: "영업과 실행이 분리되지 않습니다. 계약한 그대로 굴러갑니다.",
              },
              {
                icon: Zap,
                tag: "03",
                title: "숫자로만 말합니다",
                body: "노출·클릭율 대신 CPA·전환수·매출로 보고합니다. 매주 살릴지, 끌지, 교체할지만 결정합니다.",
              },
            ].map((d) => (
              <div key={d.tag} className="bg-white rounded-2xl p-8 border border-[#eef0f4] shadow-[0_6px_18px_-10px_rgba(15,23,41,0.08)]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <d.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[12px] font-mono font-bold text-[#8b95a1]">{d.tag}</span>
                </div>
                <h3 className="text-[19px] font-bold tracking-[-0.02em] mb-3">{d.title}</h3>
                <p className="text-[14.5px] text-[#6b7280] leading-[1.8]">{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Metrics ── */}
      <section className="py-24 lg:py-32 bg-[#0a0f1e] text-white">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <SectionEyebrow dark>By the Numbers</SectionEyebrow>
            <SectionTitle dark>숫자로만 말합니다.</SectionTitle>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { n: "83%", label: "동종업계 대비 최대 효율", sub: "결과당 비용 기준" },
              { n: "10억+", label: "B2C 교육 프로젝트 런칭", sub: "픽셀페이지 운영 누적 매출" },
              { n: "500명+", label: "누적 코칭·컨설팅", sub: "교육·지식·코칭 브랜드 대상" },
            ].map((m, i) => (
              <div
                key={m.n}
                className="rounded-2xl border border-white/10 p-10 text-center backdrop-blur-sm"
                style={{
                  background: [
                    "linear-gradient(135deg, rgba(30,39,70,0.6), rgba(12,17,36,0.6))",
                    "linear-gradient(135deg, rgba(42,31,74,0.6), rgba(12,17,36,0.6))",
                    "linear-gradient(135deg, rgba(13,42,58,0.6), rgba(12,17,36,0.6))",
                  ][i],
                }}
              >
                <div className="text-[clamp(44px,6vw,68px)] font-extrabold tracking-[-0.045em] leading-none mb-5">{m.n}</div>
                <div className="text-[16px] text-white/85 font-medium">{m.label}</div>
                <div className="text-[12px] text-white/45 mt-2">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Cases ── */}
      <section id="cases" className="py-24 lg:py-32 bg-white">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <SectionEyebrow>Project Result</SectionEyebrow>
            <SectionTitle>직접 런칭한 결과로<br />증명합니다.</SectionTitle>
          </div>
          <div className="space-y-6">
            {[
              {
                tag: "성인 D교육",
                metric: "연 100억+ 매출",
                bg: "linear-gradient(135deg, #1e40af, #6d28d9)",
                bullets: [
                  "월 광고비 5천 → 3억 단계적 확장",
                  "DB 광고 리드폼 + 세일즈 콜 자동화",
                  "CPA 지속 하락, 6개월 매출 3배 성장",
                ],
              },
              {
                tag: "강남 P학원",
                metric: "월 매출 1억 → 2억",
                bg: "linear-gradient(135deg, #7e22ce, #c026d3)",
                bullets: [
                  "학원 특성에 맞춘 로컬 타깃팅 재설계",
                  "상세페이지 리뉴얼 + 카톡 알림 자동화",
                  "3개월간 상담 신청 2.4배 성장",
                ],
              },
              {
                tag: "태양광 시공 G",
                metric: "월 문의 20건 → 하루 20건",
                bg: "linear-gradient(135deg, #0e7490, #059669)",
                bullets: [
                  "리드폼 + 랜딩 이중 구조로 전환 필터링",
                  "CRM 세팅으로 시공팀 콜 응대 최적화",
                  "성수기 진입 30일 만에 문의 30배",
                ],
              },
            ].map((c) => (
              <div key={c.tag} className="rounded-2xl border border-[#eef0f4] overflow-hidden bg-white grid grid-cols-1 md:grid-cols-[280px_1fr]">
                <div className="p-8 text-white flex flex-col justify-center" style={{ background: c.bg }}>
                  <p className="text-[12px] font-semibold tracking-[0.18em] uppercase text-white/70 mb-3">{c.tag}</p>
                  <p className="text-[22px] md:text-[24px] font-bold leading-[1.3] tracking-[-0.025em]">{c.metric}</p>
                </div>
                <div className="p-8">
                  <ul className="space-y-3.5">
                    {c.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-[15px] text-[#374151] leading-[1.65]">
                        <Check className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" strokeWidth={2.5} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. A/B test — reel gallery ── */}
      <section className="py-24 lg:py-32 bg-[#f6f8fb]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <SectionEyebrow>Unlimited A/B Test</SectionEyebrow>
            <SectionTitle>이길 때까지<br />소재를 다시 만듭니다.</SectionTitle>
            <p className="mt-5 text-[16px] text-[#6b7280] max-w-[540px] mx-auto leading-[1.85]">
              감이 아닌 데이터로 소재를 판단합니다. 매주 이긴 소재에 예산을 집중하고, 진 소재는 다음 판을 준비합니다.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="aspect-[9/16] rounded-xl overflow-hidden bg-black border border-[#e5e7eb]">
                <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                  <source src={`/reels/${i}.mp4`} type="video/mp4" />
                </video>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Real-time tracking ── */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <SectionEyebrow>Real-Time Tracking</SectionEyebrow>
            <SectionTitle>리드가 들어오는 순간,<br />카톡·시트·팀 모두 알림.</SectionTitle>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Bell, title: "카카오톡 실시간 알림", body: "리드 발생 즉시 담당자 카톡으로. 대표님 폰만 확인하시면 됩니다." },
              { icon: LineChart, title: "구글 시트 자동 저장", body: "이름·연락처·관심 항목이 자동 정리. CRM 툴 없어도 즉시 관리." },
              { icon: MessageSquare, title: "주간 데이터 미팅", body: "CPA·전환수·매출을 매주 함께 리뷰. 살릴지, 끌지, 교체할지 결정." },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-[#eef0f4] bg-white p-8 shadow-[0_6px_18px_-10px_rgba(15,23,41,0.06)]">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                  <c.icon className="w-5 h-5" />
                </div>
                <h3 className="text-[18px] font-bold tracking-[-0.02em] mb-3">{c.title}</h3>
                <p className="text-[14.5px] text-[#6b7280] leading-[1.8]">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Process ── */}
      <section id="how" className="py-24 lg:py-32 bg-[#fbfbfb]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <SectionEyebrow>Roadmap</SectionEyebrow>
            <SectionTitle>4단계로<br />처음부터 끝까지.</SectionTitle>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              { n: "01", t: "무료 진단", d: "광고 계정·랜딩·CRM 진단. 계약 전 공개, 안 하셔도 괜찮습니다." },
              { n: "02", t: "구조 설계", d: "채널·소재·랜딩·시퀀스 한 번에 설계. 방향부터 맞춥니다." },
              { n: "03", t: "실전 집행", d: "매주 CPA·전환 기준으로 살리기·끄기·교체. 숫자로 결정합니다." },
              { n: "04", t: "스케일링", d: "이긴 구조를 복제하고 예산을 단계적으로 키웁니다." },
            ].map((s, i) => (
              <div key={s.n} className="relative bg-white rounded-2xl p-7 border border-[#eef0f4]">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-5 text-[13px] font-bold ${
                  i >= 2 ? "bg-blue-600 text-white shadow-[0_0_0_6px_rgba(37,99,235,0.14)]" : "bg-white border border-[#eef0f4] text-[#0a0f1e]"
                }`}>
                  {s.n}
                </div>
                <h3 className="text-[17px] font-bold tracking-[-0.02em] mb-2.5">{s.t}</h3>
                <p className="text-[13.5px] text-[#6b7280] leading-[1.75]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Scarcity ── */}
      <section className="py-16 bg-[#0a0f1e] text-white border-y border-white/10">
        <div className="max-w-[820px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-[12px] font-bold tracking-[0.22em] uppercase text-orange-400 mb-3">Limited Availability</p>
          <p className="text-[24px] md:text-[28px] font-bold leading-[1.4] tracking-[-0.025em]">
            <span className="text-orange-400">이번 달 신규 대행 잔여: 1석</span><br />
            <span className="text-white/60 text-[16px] font-medium block mt-3">한 팀이 동시에 관리할 수 있는 브랜드 수를 제한합니다.</span>
          </p>
        </div>
      </section>

      {/* ── 10. FAQ ── */}
      <section id="faq" className="py-24 lg:py-32 bg-white">
        <div className="max-w-[820px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-14">
            <SectionEyebrow>FAQ</SectionEyebrow>
            <SectionTitle>궁금한 게 있으신가요?</SectionTitle>
          </div>
          <div className="divide-y divide-[#eef0f4]">
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
                  <span className="text-[16px] md:text-[17px] font-semibold text-[#0a0f1e] tracking-[-0.02em]">{f.q}</span>
                  <ChevronDown className="w-5 h-5 text-[#8b95a1] transition-transform group-open:rotate-180 flex-shrink-0" />
                </summary>
                <p className="mt-4 text-[14.5px] text-[#4b5563] leading-[1.85]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. Final CTA + form ── */}
      <section id="cta" className="py-24 lg:py-32 bg-[#0a0f1e] text-white">
        <div className="max-w-[720px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <SectionEyebrow dark>Free Diagnosis</SectionEyebrow>
            <SectionTitle dark>지금 무료 진단부터<br />받아보시겠어요?</SectionTitle>
            <p className="mt-5 text-[16px] text-white/60 leading-[1.85]">
              광고 계정·랜딩·CRM을 함께 열어보고,<br />어디가 새는지 찾아드립니다. 계약 없이도 괜찮습니다.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-10 text-center">
              <p className="text-[18px] font-semibold mb-3">신청이 접수되었습니다.</p>
              <p className="text-[14px] text-white/60 mb-6">평균 3시간 이내 담당자가 연락드립니다.</p>
              <a
                href={KAKAO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FEE500] text-[#181600] text-[14px] font-bold hover:bg-[#ffe95c] transition-colors"
              >
                <MessageSquare className="w-4 h-4" /> 카카오톡으로 바로 문의
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl bg-white/[0.05] border border-white/10 p-7 md:p-9 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="성함"
                  className="w-full px-4 py-3.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                />
                <input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="회사·브랜드명"
                  className="w-full px-4 py-3.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                />
              </div>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="연락처"
                className="w-full px-4 py-3.5 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
              />
              <select
                required
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full px-4 py-3.5 rounded-lg bg-black/30 border border-white/10 text-white/90 focus:outline-none focus:border-blue-400"
              >
                <option value="">월 광고 예산 선택</option>
                <option value="500만원 미만">500만 원 미만</option>
                <option value="500~1000만원">500 ~ 1,000만 원</option>
                <option value="1000~3000만원">1,000 ~ 3,000만 원</option>
                <option value="3000만원 이상">3,000만 원 이상</option>
              </select>
              <label className="flex items-start gap-2.5 text-[13px] text-white/60 cursor-pointer">
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
                className="w-full mt-2 px-6 py-4 bg-[#ff6b00] text-white text-[16px] font-bold rounded-xl shadow-[0_14px_30px_-10px_rgba(255,107,0,0.55)] hover:bg-[#ff7c1a] transition-colors"
              >
                무료 진단 신청하기 →
              </button>
              <p className="text-center text-[12px] text-white/45 pt-1">평균 회신 3시간 이내 · 계약 강요 없음</p>
            </form>
          )}

          <div className="mt-8 text-center text-[13px] text-white/40">
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

      {/* ── Footer ── */}
      <footer className="py-10 bg-[#06090f] text-white/45 text-center text-[12px] border-t border-white/5">
        <div className="max-w-[1240px] mx-auto px-6">
          © PIXELPAGE · pixelpage.co.kr · contact@pixelpage.co.kr
        </div>
      </footer>
    </div>
  );
};

export default LpClient;

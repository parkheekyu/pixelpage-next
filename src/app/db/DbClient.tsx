"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Square, CheckSquare } from "lucide-react";
import { captureAttribution, submitInquiry } from "@/lib/attribution";
import logoWhite from "@/assets/logo-white.png";

/* 광고용 랜딩 — CCFM 세일즈 페이지 구조. 대괄호 자리는 실제 자산으로 교체 */

const PAINS = [
  "DB 마케팅을 시작하거나 확대하고 싶은데, 믿고 맡길 팀이 마땅치 않습니다.",
  "광고비는 계속 쓰는데, 기대했던 만큼 성과가 나오지 않습니다.",
  "새로운 소재나 랜딩페이지 개선이 필요할 때마다 진행이 더딥니다.",
  "광고 예산을 더 늘리고 싶은데, 지금 효율로는 확신이 서지 않습니다.",
];
const PERF = [
  ["성인 교육 플랫폼 D사", "42% ↓", "3.1배 ↑", "2배 ↑"],
  ["태양광 시공·분양 G사", "55% ↓", "20배 ↑", "1.5배 ↑"],
  ["코칭·컨설팅 P사", "35% ↓", "3.8배 ↑", "4배 ↑"],
  ["가맹 프랜차이즈 L사", "58% ↓", "2.4배 ↑", "3배 ↑"],
];
const WHY = [
  { n: "1", t: "대표가 직접 운영하는\nDB 마케팅", s: "계약만 대표가 하고, 운영은 직원에게 넘기지 않습니다.", items: ["대표 직접 전략 수립 및 운영", "광고 성과 분석과 개선", "고객사별 맞춤 전략 수립"] },
  { n: "2", t: "마케팅 + 디자인 + 개발\n한 팀으로 실행", s: "기획부터 제작까지, 기다릴 이유가 없습니다.", items: ["광고 소재 기획 및 제작", "랜딩페이지 디자인·개발", "전환 추적 및 CRM 자동화"] },
  { n: "3", t: "인하우스처럼 움직이는\nDB 마케팅 파트너", s: "시키는 일만 하는 대행사가 아닙니다.", items: ["새로운 광고 소구점 제안", "성과에 따른 소재·랜딩 개선", "지속적인 테스트와 예산 확대"] },
];
const STEPS = [
  { t: "STEP 1. 사업 분석 & DB 마케팅 전략 수립", items: ["상품·서비스 USP 및 경쟁사 분석", "고객 타겟·광고 매체·랜딩페이지 점검", "고객 확보 목표에 맞춘 광고 전략 설계"] },
  { t: "STEP 2. 광고 콘텐츠 제작 & 집행", items: ["DB 신청을 유도하는 이미지·영상 소재 제작", "성과에 따른 소재 교체 및 반복 테스트", "Meta·Google 등 주요 광고 매체 운영"] },
  { t: "STEP 3. 성과 분석 & 최적화", items: ["광고별 DB 단가 및 수량 분석", "랜딩페이지 전환율 개선", "CRM 자동화 및 영업 데이터 연동", "성과에 따른 타겟·소재·예산 최적화"] },
];
const CREATIVE_TAGS = ["태양광", "교육", "컨설팅", "프랜차이즈", "부동산", "기타"];
const STORIES = [["태양광 시공·분양 G사", "[실제 고객사 후기 삽입]"], ["성인 교육 플랫폼 D사", "[실제 고객사 후기 삽입]"], ["코칭·컨설팅 P사", "[실제 고객사 후기 삽입]"]];
const PROOFS = ["[실제 카카오톡 대화 캡처]", "[광고 성과 개선 사례]", "[고객사 감사 메시지]", "[장기 운영 및 광고 예산 증액 사례]"];
const BUDGETS = ["아직 집행하지 않음", "500만원 미만", "500만~1,000만원", "1,000만~3,000만원", "3,000만원 이상"];

function CountUp({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null); const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; io.disconnect(); const t0 = performance.now(); const dur = 1200;
      const tick = (t: number) => { const p = Math.min(1, (t - t0) / dur); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }, { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{prefix}{v.toLocaleString()}{suffix}</span>;
}

const Eyebrow = ({ children }: { children: React.ReactNode }) => <p className="text-[12px] font-semibold tracking-[0.22em] uppercase text-sky-300/80 mb-4">{children}</p>;
const H2 = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <h2 className={`break-keep text-[clamp(28px,4.2vw,48px)] font-bold leading-[1.2] tracking-[-0.035em] ${className}`}>{children}</h2>;
const Cta = ({ children = "DB 마케팅 상담하기" }: { children?: React.ReactNode }) => <a href="#form" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-black text-[16px] font-semibold hover:bg-white/90 transition">{children} <ArrowRight className="w-4 h-4" /></a>;

export default function DbClient() {
  const router = useRouter();
  const [f, setF] = useState({ company: "", name: "", phone: "", email: "", site: "", budget: "", agree: false });
  const [submitting, setSubmitting] = useState(false); const [err, setErr] = useState<string | null>(null);
  useEffect(() => { captureAttribution(); }, []);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null);
    if (!f.company.trim() || !f.name.trim() || !f.phone.trim() || !f.email.trim()) { setErr("회사명, 성함, 전화번호, 이메일을 입력해 주세요."); return; }
    if (!f.agree) { setErr("개인정보 수집·이용에 동의해 주세요."); return; }
    setSubmitting(true);
    const r = await submitInquiry({ form: "db", name: f.name, phone: f.phone, email: f.email, company: f.company, budget: f.budget, message: f.site ? `사이트: ${f.site}` : "" });
    setSubmitting(false);
    if (!r.ok) { setErr("전송에 실패했습니다. 잠시 후 다시 시도해 주세요."); return; }
    router.push("/thank-you");
  };

  return (
    <div className="bg-[#07090f] text-white selection:bg-sky-500/30">
      {/* 상단 바 */}
      <header className="absolute top-0 inset-x-0 z-20 px-6 py-5 flex items-center justify-between max-w-[1120px] mx-auto">
        <Image src={logoWhite} alt="픽셀페이지" width={120} height={24} priority />
        <a href="#form" className="text-[14px] font-semibold px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition">상담하기</a>
      </header>

      {/* 01 HERO */}
      <section className="relative overflow-hidden px-6 pt-36 pb-28 md:pt-44 md:pb-36">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 900px 540px at 50% -5%, rgba(67,150,248,0.25) 0%, transparent 60%)" }} />
        <div className="relative max-w-[900px] mx-auto text-center">
          <Eyebrow>DB 마케팅 전문팀, 픽셀페이지</Eyebrow>
          <h1 className="break-keep text-[clamp(38px,6.4vw,76px)] font-bold leading-[1.12] tracking-[-0.04em]">성과 내는 기업엔<br />공통점이 있습니다.</h1>
          <p className="mt-7 text-[18px] md:text-[21px] text-white/75 leading-[1.7] break-keep">DB 마케팅을 제대로 한다는 것.<br /><span className="text-white font-semibold">다음은 대표님 차례입니다.</span></p>
          <div className="mt-10"><Cta /></div>
        </div>
      </section>

      {/* 02 PAIN POINT */}
      <section className="px-6 py-20 md:py-24 border-t border-white/[0.06]">
        <div className="max-w-[820px] mx-auto">
          <Eyebrow>Pain point</Eyebrow>
          <H2>혹시 이런 고민 중이신가요?</H2>
          <ul className="mt-10 space-y-3">
            {PAINS.map((p) => (
              <li key={p} className="flex gap-4 items-start rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-[16px] md:text-[17px] leading-[1.7] break-keep">
                <Square className="w-5 h-5 mt-1 shrink-0 text-sky-300/70" />{p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 03 PERFORMANCE */}
      <section className="px-6 py-20 md:py-24 border-t border-white/[0.06] bg-[#0a0d16]">
        <div className="max-w-[900px] mx-auto">
          <Eyebrow>Performance</Eyebrow>
          <H2>우리는 이 고민을<br />숫자로 바꿉니다.</H2>
          <p className="mt-4 text-[16px] text-white/60">말보다 확실한 건 실제 성과입니다.</p>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[560px] text-left">
              <thead className="bg-white/[0.04] text-[13px] text-white/55">
                <tr>{["고객사", "DB 단가 개선", "DB 수량 증가", "매출 성장"].map((h) => <th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {PERF.map(([c, a, b, d]) => (
                  <tr key={c} className="text-[16px]">
                    <td className="px-5 py-5 font-medium">{c}</td>
                    <td className="px-5 py-5 text-sky-300 font-semibold tabular-nums">{a}</td>
                    <td className="px-5 py-5 text-sky-300 font-semibold tabular-nums">{b}</td>
                    <td className="px-5 py-5 text-sky-300 font-semibold tabular-nums">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[12.5px] text-white/35">Meta·Google 광고 계정 기준. 측정 기간과 비교 기준은 상담 시 계정 화면으로 확인하실 수 있습니다.</p>
        </div>
      </section>

      {/* 04 WHY */}
      <section className="px-6 py-20 md:py-24 border-t border-white/[0.06]">
        <div className="max-w-[1040px] mx-auto">
          <Eyebrow>Why PixelPage</Eyebrow>
          <H2>DB 마케팅에 특화된 전문팀<br />픽셀페이지가 직접 합니다.</H2>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {WHY.map((w) => (
              <div key={w.n} className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
                <p className="text-[13px] font-bold text-sky-300/80 mb-4">{w.n}</p>
                <p className="text-[20px] font-bold leading-[1.35] tracking-[-0.02em] whitespace-pre-line mb-3">{w.t}</p>
                <p className="text-[14.5px] text-white/55 leading-[1.7] mb-5 break-keep">{w.s}</p>
                <ul className="space-y-2">{w.items.map((i) => <li key={i} className="flex gap-2.5 text-[15px] text-white/80"><Check className="w-4 h-4 mt-1 shrink-0 text-sky-300" />{i}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05 BRAND MESSAGE */}
      <section className="px-6 py-24 md:py-28 border-t border-white/[0.06] bg-[#0a0d16]">
        <div className="max-w-[900px] mx-auto text-center">
          <H2>광고는 누구나 할 수 있지만<br />성과를 키우는 건 아무나 못합니다.</H2>
          <p className="mt-6 text-[17px] md:text-[19px] text-white/65 leading-[1.7]">같은 광고비, 다른 결과.<br />차이는 운영하는 사람에게 있습니다.</p>
          <div className="mt-14 grid sm:grid-cols-3 gap-5">
            {[
              ["누적 광고 취급액", <><CountUp to={0} suffix="억+" />{/* [실제 금액] */}</>, "[실제 금액 입력]"],
              ["평균 DB 단가 개선율", <CountUp key="b" to={48} suffix="%" />, "4개 고객사 평균"],
              ["광고 예산 최대 확대", <CountUp key="c" to={20} suffix="배" />, "태양광 G사 기준"],
            ].map(([k, v, note]) => (
              <div key={String(k)} className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
                <p className="text-[13px] text-white/50 mb-3">{k as string}</p>
                <p className="text-[40px] font-bold tracking-[-0.03em] tabular-nums">{v as React.ReactNode}</p>
                <p className="text-[12px] text-white/35 mt-2">{note as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06 PROCESS */}
      <section className="px-6 py-20 md:py-24 border-t border-white/[0.06]">
        <div className="max-w-[1040px] mx-auto">
          <Eyebrow>Our process</Eyebrow>
          <H2>픽셀페이지는 이렇게 접근합니다.</H2>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {STEPS.map((s) => (
              <div key={s.t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
                <p className="text-[17px] font-bold leading-[1.4] mb-5 break-keep">{s.t}</p>
                <ul className="space-y-2.5">{s.items.map((i) => <li key={i} className="flex gap-2.5 text-[15px] text-white/75 leading-[1.6]"><span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-sky-300 shrink-0" />{i}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 07 CREATIVE */}
      <section className="px-6 py-20 md:py-24 border-t border-white/[0.06] bg-[#0a0d16]">
        <div className="max-w-[1040px] mx-auto">
          <Eyebrow>Creative</Eyebrow>
          <H2>터지는 광고 소재가 나올 때까지.</H2>
          <p className="mt-4 text-[16px] md:text-[17px] text-white/60 leading-[1.7]">새로운 소재를 만들고, 테스트하고, 다시 만듭니다.</p>
          <div className="mt-10 flex gap-2 flex-wrap">{CREATIVE_TAGS.map((t) => <span key={t} className="px-3.5 py-1.5 rounded-full border border-white/15 text-[13px] text-white/70">{t}</span>)}</div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[9/16] rounded-xl border border-dashed border-white/15 bg-white/[0.02] flex items-center justify-center text-[12px] text-white/35 text-center px-3">[실제 광고 소재 {i}]</div>
            ))}
          </div>
        </div>
      </section>

      {/* 08 SUCCESS STORY */}
      <section className="px-6 py-20 md:py-24 border-t border-white/[0.06]">
        <div className="max-w-[1040px] mx-auto">
          <Eyebrow>Success story</Eyebrow>
          <H2>다양한 업종의 성공 경험으로<br />기업의 성장을 함께 만듭니다.</H2>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {STORIES.map(([c, q]) => (
              <div key={c} className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 min-h-[220px] flex flex-col">
                <p className="text-[13px] text-sky-300/80 font-semibold mb-4">{c}</p>
                <p className="text-[15px] text-white/45 leading-[1.8] flex-1">{q}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12.5px] text-white/35">실제 고객이 남긴 후기만 사용합니다.</p>
        </div>
      </section>

      {/* 09 SOCIAL PROOF */}
      <section className="px-6 py-20 md:py-24 border-t border-white/[0.06] bg-[#0a0d16]">
        <div className="max-w-[1040px] mx-auto">
          <Eyebrow>Social proof</Eyebrow>
          <H2>성과로 증명한<br />고객사의 생생한 목소리입니다.</H2>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROOFS.map((p) => <div key={p} className="aspect-[3/4] rounded-xl border border-dashed border-white/15 bg-white/[0.02] flex items-center justify-center text-[13px] text-white/35 text-center px-4">{p}</div>)}
          </div>
        </div>
      </section>

      {/* 10 FINAL CTA + FORM */}
      <section id="form" className="px-6 py-24 md:py-32 border-t border-white/[0.06]">
        <div className="max-w-[560px] mx-auto">
          <div className="text-center mb-12">
            <H2>DB 마케팅,<br />이제 제대로 된 팀과 함께하세요.</H2>
            <p className="mt-5 text-[17px] text-white/65 leading-[1.7]">우리 회사의 DB 마케팅팀.<br />픽셀페이지가 함께합니다.</p>
          </div>
          <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-4">
            <p className="text-[18px] font-bold mb-2">DB 마케팅 상담하기</p>
            {[["company", "회사명 *", "text", "회사명"], ["name", "성함 / 직함 *", "text", "홍길동 / 대표"], ["phone", "전화번호 *", "tel", "010-0000-0000"], ["email", "이메일 *", "email", "name@company.com"], ["site", "사이트 주소", "url", "https://"]].map(([k, label, type, ph]) => (
              <label key={k} className="block">
                <span className="block text-[13px] text-white/60 mb-1.5">{label}</span>
                <input type={type} value={f[k as keyof typeof f] as string} onChange={(e) => setF({ ...f, [k]: e.target.value })} placeholder={ph} className="w-full rounded-lg bg-black/40 border border-white/15 px-4 py-3 text-[15px] placeholder:text-white/25 focus:outline-none focus:border-sky-400/60" />
              </label>
            ))}
            <div>
              <span className="block text-[13px] text-white/60 mb-2">현재 월 광고 예산</span>
              <div className="grid grid-cols-2 gap-2">
                {BUDGETS.map((b) => <button type="button" key={b} onClick={() => setF({ ...f, budget: b })} className={`rounded-lg border px-3 py-2.5 text-[13.5px] text-left transition ${f.budget === b ? "border-sky-400 bg-sky-400/15 text-white" : "border-white/15 text-white/70 hover:bg-white/5"}`}>{b}</button>)}
              </div>
            </div>
            <button type="button" onClick={() => setF({ ...f, agree: !f.agree })} className="flex items-center gap-2 text-[13.5px] text-white/70">
              {f.agree ? <CheckSquare className="w-4 h-4 text-sky-300" /> : <Square className="w-4 h-4" />} 개인정보 수집 및 이용에 동의합니다.
            </button>
            {err && <p className="text-[13px] text-red-300">{err}</p>}
            <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-black text-[16px] font-semibold hover:bg-white/90 transition disabled:opacity-60">{submitting ? "전송 중…" : "DB 마케팅 상담 신청하기"} <ArrowRight className="w-4 h-4" /></button>
          </form>
        </div>
      </section>

      <footer className="px-6 py-10 border-t border-white/[0.06] text-[12.5px] text-white/35 text-center leading-[1.8]">
        픽셀페이지 · 대표 박희규 · 사업자등록번호 477-11-01530<br />경기도 용인시 수지구 광교중앙로296번길 10, 207호-제24호 · contact@pixelpage.co.kr
      </footer>
    </div>
  );
}

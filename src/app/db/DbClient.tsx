"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Square, CheckSquare } from "lucide-react";
import { captureAttribution, submitInquiry } from "@/lib/attribution";
import logoWhite from "@/assets/logo-white.png";

/* 광고용 랜딩 — 레퍼런스(CCFM 구독 문의 페이지) 구조: 검정 배경 위 480px 한 열, 강조색 하나, 섹션 사이 세로선 */

const ACCENT = "#4396F8";
const PAINS = [
  <>DB 마케팅을 <b>시작하거나 확대</b>하고 싶은데, 믿고 맡길 팀이 마땅치 않습니다.</>,
  <>광고비는 계속 쓰는데, <b>기대했던 만큼 성과</b>가 나오지 않습니다.</>,
  <>새로운 소재나 랜딩페이지 개선이 필요할 때마다 <b>진행이 더딥니다.</b></>,
  <>광고 예산을 더 늘리고 싶은데, <b>지금 효율로는 확신</b>이 서지 않습니다.</>,
];
const PERF = [
  ["성인 교육 플랫폼 D사", "42%↓", "3.1배↑", "2배↑"],
  ["태양광 시공·분양 G사", "55%↓", "20배↑", "1.5배↑"],
  ["코칭·컨설팅 P사", "35%↓", "3.8배↑", "4배↑"],
  ["가맹 프랜차이즈 L사", "58%↓", "2.4배↑", "3배↑"],
];
const WHY = [
  { n: "1", t: <><em>대표가 직접</em> 운영하는<br />DB 마케팅</>, s: "계약만 대표가 하고, 운영은 직원에게 넘기지 않습니다.", items: ["대표 직접 전략 수립 및 운영", "광고 성과 분석과 개선", "고객사별 맞춤 전략 수립"] },
  { n: "2", t: <><em>[마케팅 + 디자인 + 개발]</em><br />한 팀으로 실행</>, s: "기획부터 제작까지, 기다릴 이유가 없습니다.", items: ["광고 소재 기획 및 제작", "랜딩페이지 디자인·개발", "전환 추적 및 CRM 자동화"] },
  { n: "3", t: <><em>인하우스처럼 움직이는</em><br />DB 마케팅 파트너</>, s: "시키는 일만 하는 대행사가 아닙니다.", items: ["새로운 광고 소구점 제안", "성과에 따른 소재·랜딩 개선", "지속적인 테스트와 예산 확대"] },
];
const STEPS = [
  { t: "사업 분석 & DB 마케팅 전략 수립", items: ["상품·서비스 USP 및 경쟁사 분석", "고객 타겟·광고 매체·랜딩페이지 점검", "고객 확보 목표에 맞춘 광고 전략 설계"] },
  { t: "광고 콘텐츠 제작 & 집행", items: ["DB 신청을 유도하는 이미지·영상 소재 제작", "성과에 따른 소재 교체 및 반복 테스트", "Meta·Google 등 주요 광고 매체 운영"] },
  { t: "성과 분석 & 최적화", items: ["광고별 DB 단가 및 수량 분석", "랜딩페이지 전환율 개선", "CRM 자동화 및 영업 데이터 연동", "성과에 따른 타겟·소재·예산 최적화"] },
];
const BUDGETS = ["아직 집행하지 않음", "500만원 미만", "500만~1,000만원", "1,000만~3,000만원", "3,000만원 이상"];

function CountUp({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null); const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; io.disconnect(); const t0 = performance.now(); const dur = 1200;
      const tick = (t: number) => { const p = Math.min(1, (t - t0) / dur); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }, { threshold: 0.4 });
    io.observe(el); const fb = setTimeout(() => setV(to), 2500);
    return () => { io.disconnect(); clearTimeout(fb); };
  }, [to]);
  return <span ref={ref}>{v.toFixed(decimals)}{suffix}</span>;
}

const Line = () => <div className="mx-auto w-px h-14 bg-white/20" aria-hidden />;
const H = ({ children, small }: { children: React.ReactNode; small?: boolean }) => <h2 className={`text-center break-keep font-bold leading-[1.3] tracking-[-0.03em] ${small ? "text-[20px]" : "text-[24px] md:text-[26px]"}`}>{children}</h2>;
const Sub = ({ children }: { children: React.ReactNode }) => <p className="text-center text-[14px] text-white/55 leading-[1.7] break-keep">{children}</p>;
const Cta = ({ children = "DB 마케팅 상담하기" }: { children?: React.ReactNode }) => (
  <a href="#form" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[15px] font-bold text-white shadow-[0_8px_30px_rgba(67,150,248,0.35)]" style={{ background: ACCENT }}>{children} <ArrowRight className="w-4 h-4" /></a>
);
const Placeholder = ({ label, ratio = "aspect-[3/4]" }: { label: string; ratio?: string }) => <div className={`${ratio} rounded-lg border border-dashed border-white/15 bg-white/[0.03] flex items-center justify-center text-[11px] text-white/35 text-center px-2`}>{label}</div>;

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
    <div className="min-h-screen bg-[#101010] text-white selection:bg-sky-500/30" style={{ fontFamily: "Pretendard, Inter, -apple-system, sans-serif" }}>
      <style>{`.db em{font-style:normal;color:${ACCENT}} .db b{font-weight:700;color:#fff}`}</style>
      <div className="db mx-auto w-full max-w-[480px] px-6 pt-10 pb-24">
        {/* 로고 */}
        <div className="flex justify-center mb-10"><div className="w-11 h-11 rounded-full border border-white/25 flex items-center justify-center"><Image src={logoWhite} alt="픽셀페이지" width={26} height={26} className="w-6 h-auto" priority /></div></div>

        {/* 01 HERO */}
        <p className="text-[13px] text-white/60 mb-4 flex items-center gap-1.5"><span>📝</span>DB 마케팅 전문팀, 픽셀페이지</p>
        <div className="text-center">
          <p className="text-[15px] text-white/80 leading-[1.7] break-keep">성과 내는 기업엔 공통점이 있습니다.<br /><em>DB 마케팅</em>을 제대로 한다는 것</p>
          <h1 className="mt-5 text-[28px] md:text-[30px] font-extrabold leading-[1.25] tracking-[-0.03em] break-keep">다음은 대표님 차례입니다.</h1>
          <div className="mt-6"><Cta /></div>
        </div>

        <Line />

        {/* 02 PAIN POINT */}
        <H>혹시 이런 고민 중이신가요?</H>
        <div className="mt-6 rounded-2xl bg-[#1c1c1c] border border-white/10 p-5 space-y-4">
          {PAINS.map((p, i) => <div key={i} className="flex gap-3 items-start text-[14px] leading-[1.7] text-white/80 break-keep"><Square className="w-4 h-4 mt-1 shrink-0 text-white/50" /><span>{p}</span></div>)}
        </div>

        <Line />

        {/* 03 PERFORMANCE */}
        <H>우리는 이 고민을 <em>숫자로 바꿉니다.</em></H>
        <div className="mt-2"><Sub>말보다 확실한 건 실제 성과입니다.</Sub></div>
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          {PERF.map(([c, a, b, d]) => (
            <div key={c} className="rounded-xl bg-[#1c1c1c] border border-white/10 p-4">
              <p className="text-[12px] text-white/60 mb-3 break-keep leading-[1.4]">{c}</p>
              {[["DB 단가", a], ["DB 수량", b], ["매출", d]].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between py-1 border-t border-white/[0.06] first:border-0"><span className="text-[11px] text-white/45">{k}</span><span className="text-[15px] font-bold tabular-nums" style={{ color: ACCENT }}>{v}</span></div>
              ))}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-white/35 text-center">Meta·Google 광고 계정 기준 · 측정 기간과 비교 기준은 상담 시 계정 화면으로 확인</p>

        <Line />

        {/* 04 WHY */}
        <Sub>DB 마케팅에 특화된 전문팀</Sub>
        <div className="mt-1"><H>픽셀페이지가 <em>직접</em> 합니다.</H></div>
        <div className="mt-8 space-y-8">
          {WHY.map((w) => (
            <div key={w.n} className="text-center">
              <div className="mx-auto w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-bold" style={{ background: ACCENT }}>{w.n}</div>
              <p className="mt-4 text-[19px] font-bold leading-[1.35] tracking-[-0.02em] break-keep">{w.t}</p>
              <p className="mt-2 text-[13px] text-white/55 break-keep">{w.s}</p>
              <ul className="mt-4 inline-block text-left space-y-1.5">{w.items.map((i) => <li key={i} className="flex gap-2 text-[14px] text-white/80"><span className="mt-[9px] w-1 h-1 rounded-full bg-white/60 shrink-0" />{i}</li>)}</ul>
            </div>
          ))}
        </div>

        <Line />

        {/* 05 BRAND MESSAGE */}
        <Sub>광고는 누구나 할 수 있지만</Sub>
        <div className="mt-1"><H>성과를 키우는 건<br />아무나 못합니다.</H></div>
        <div className="mt-3"><Sub>같은 광고비, 다른 결과.<br />차이는 운영하는 사람에게 있습니다.</Sub></div>
        <div className="mt-7 grid grid-cols-3 gap-2 text-center">
          {[["누적 광고 취급액", <span key="a" className="text-white/30 text-[16px]">[금액]억+</span>], ["평균 DB 단가 개선율", <CountUp key="b" to={48} suffix="%" />], ["광고 예산 최대 확대", <CountUp key="c" to={20} suffix="배" />]].map(([k, v]) => (
            <div key={String(k)} className="rounded-xl bg-[#1c1c1c] border border-white/10 py-5 px-2">
              <p className="text-[11px] text-white/50 mb-2 break-keep">{k as string}</p>
              <p className="text-[24px] font-extrabold tabular-nums tracking-[-0.02em]" style={{ color: ACCENT }}>{v as React.ReactNode}</p>
            </div>
          ))}
        </div>

        <Line />

        {/* 06 PROCESS */}
        <H>픽셀페이지는 <em>이렇게</em> 접근합니다</H>
        <div className="mt-8 relative pl-6">
          <div className="absolute left-[7px] top-2 bottom-2 border-l border-dashed border-white/25" aria-hidden />
          <div className="space-y-8">
            {STEPS.map((s, i) => (
              <div key={s.t} className="relative">
                <span className="absolute -left-6 top-[6px] w-[15px] h-[15px] rounded-full border-2 border-[#101010]" style={{ background: ACCENT }} aria-hidden />
                <p className="text-[12px] font-bold tracking-wider" style={{ color: ACCENT }}>STEP. {i + 1}</p>
                <p className="mt-1 text-[16px] font-bold break-keep">{s.t}</p>
                <ul className="mt-3 space-y-1.5">{s.items.map((it) => <li key={it} className="flex gap-2 text-[13.5px] text-white/75 leading-[1.6] break-keep"><span className="mt-[9px] w-1 h-1 rounded-full bg-white/50 shrink-0" />{it}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>

        <Line />

        {/* 07 CREATIVE */}
        <H>터지는 광고 소재가 <em>나올 때까지.</em></H>
        <div className="mt-2"><Sub>새로운 소재를 만들고, 테스트하고, 다시 만듭니다.</Sub></div>
        <div className="mt-6 grid grid-cols-3 gap-2">
          {["태양광", "교육", "컨설팅", "프랜차이즈", "부동산", "기타"].map((t) => <Placeholder key={t} label={`[광고 소재 · ${t}]`} />)}
        </div>

        <Line />

        {/* 08 SUCCESS STORY */}
        <Sub>다양한 업종의 성공 경험으로</Sub>
        <div className="mt-1"><H>기업의 성장을 함께 만듭니다.</H></div>
        <div className="mt-6 space-y-3">
          {["태양광 시공·분양 G사", "성인 교육 플랫폼 D사", "코칭·컨설팅 P사"].map((c) => (
            <div key={c} className="rounded-xl bg-[#1c1c1c] border border-white/10 p-4 flex gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 shrink-0 flex items-center justify-center text-[10px] text-white/40">{c.slice(-2, -1)}사</div>
              <div><p className="text-[12px] font-semibold text-white/80 mb-1">{c}</p><p className="text-[12.5px] text-white/40 leading-[1.6]">[실제 고객사 후기 삽입]</p></div>
            </div>
          ))}
        </div>

        <Line />

        {/* 09 SOCIAL PROOF */}
        <Sub>성과로 증명한</Sub>
        <div className="mt-1"><H>고객사의 생생한 목소리입니다.</H></div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          {["[카카오톡 대화 캡처]", "[광고 성과 개선 사례]", "[고객사 감사 메시지]", "[예산 증액 사례]"].map((p) => <Placeholder key={p} label={p} ratio="aspect-[4/5]" />)}
        </div>

        <Line />

        {/* 10 FORM */}
        <div id="form" className="scroll-mt-10">
          <H>DB 마케팅,<br />이제 <em>제대로 된 팀</em>과 함께하세요.</H>
          <div className="mt-3"><Sub>우리 회사의 DB 마케팅팀.<br />픽셀페이지가 함께합니다.</Sub></div>
          <form onSubmit={onSubmit} className="mt-10 space-y-7">
            <p className="text-[18px] font-bold flex items-center gap-1.5"><span>📝</span>DB 마케팅 상담하기</p>
            {[["company", "회사명", "text"], ["name", "성함 / 직함", "text"], ["phone", "전화번호", "tel"], ["email", "이메일", "email"], ["site", "사이트 주소", "url"]].map(([k, label, type]) => (
              <label key={k} className="block">
                <span className="block text-[15px] font-semibold mb-2">{label}{k !== "site" && <span className="ml-1" style={{ color: ACCENT }}>*</span>}</span>
                <input type={type} value={f[k as keyof typeof f] as string} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="w-full bg-transparent border-0 border-b border-white/25 px-0 py-2.5 text-[15px] focus:outline-none focus:border-[#4396F8] transition" />
              </label>
            ))}
            <div>
              <span className="block text-[15px] font-semibold mb-3">현재 월 광고 예산</span>
              <div className="space-y-2">
                {BUDGETS.map((b) => <button type="button" key={b} onClick={() => setF({ ...f, budget: b })} className="flex items-center gap-2.5 text-[14px] text-white/85">{f.budget === b ? <span className="w-4 h-4 rounded-full border-[5px] shrink-0" style={{ borderColor: ACCENT }} /> : <span className="w-4 h-4 rounded-full border border-white/40 shrink-0" />}{b}</button>)}
              </div>
            </div>
            <div>
              <span className="block text-[15px] font-semibold mb-3">개인정보 수집 및 이용 동의<span className="ml-1" style={{ color: ACCENT }}>*</span></span>
              <button type="button" onClick={() => setF({ ...f, agree: !f.agree })} className="flex items-center gap-2.5 text-[14px] text-white/85">{f.agree ? <CheckSquare className="w-4 h-4" style={{ color: ACCENT }} /> : <Square className="w-4 h-4 text-white/50" />} 개인 정보 수집 및 이용에 동의합니다.</button>
            </div>
            {err && <p className="text-[13px] text-red-300">{err}</p>}
            <button type="submit" disabled={submitting} className="w-full py-4 rounded-full text-[16px] font-bold text-white disabled:opacity-60 shadow-[0_8px_30px_rgba(67,150,248,0.35)]" style={{ background: ACCENT }}>{submitting ? "전송 중…" : "DB 마케팅 상담 신청하기"}</button>
          </form>
        </div>

        <p className="mt-16 text-[11px] text-white/30 text-center leading-[1.8]">픽셀페이지 · 대표 박희규 · 사업자등록번호 477-11-01530<br />contact@pixelpage.co.kr</p>
      </div>
      {/* 떠 있는 CTA (모바일) */}
      <a href="#form" className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-2 px-5 py-3 rounded-full text-[14px] font-bold text-white shadow-[0_8px_30px_rgba(0,0,0,0.5)]" style={{ background: ACCENT }}>DB 마케팅 상담하기 <ArrowRight className="w-4 h-4" /></a>
    </div>
  );
}

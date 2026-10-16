"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { captureAttribution, submitInquiry } from "@/lib/attribution";
import charMale from "@/assets/char-male.png";
import charFemale from "@/assets/char-female.png";
import charCurly from "@/assets/char-curly.png";

/*
 * 광고용 랜딩 — CCFM 구독 문의 페이지(탈리 폼) 프레임을 분절해 그대로 옮김.
 * 레퍼런스 원본 폭 1337px → 모바일 340px 렌더(×0.254) 기준으로 잰 값:
 *   서브 15px/300 · 메인 헤드 21px/800 · 섹션 헤드 18~21px/700 · 본문 12.5~13px · 라벨 11px
 *   카드 bg #292929 r15 · 번호 원 28px #3a3a3a · 세로선 38px + 점 10px · 강조 1색
 * 데스크톱은 같은 프레임을 1.3배로 키운다(컬럼 440px).
 */

const A = "#4396F8"; // 강조색 (레퍼런스 핑크 자리)
const PAINS = [
  <>DB 마케팅을 시작하거나 확대하고 싶은데, <b>믿고 맡길 팀이 마땅치 않아요.</b></>,
  <>광고비는 계속 쓰는데, 기대했던 만큼 <b>성과가 안 나와요.</b></>,
  <>새 소재나 랜딩 개선이 필요할 때마다 <b>진행이 더뎌요.</b></>,
  <>예산을 더 늘리고 싶은데, 지금 효율로는 <b>확신이 안 서요.</b></>,
];
const PERF = [
  { c: "성인 교육 플랫폼 D사", cpl: "DB 단가 42%↓", before: 1, after: 3.1, label: "3.1배", rev: "매출 2배" },
  { c: "태양광 시공·분양 G사", cpl: "DB 단가 55%↓", before: 1, after: 20, label: "20배", rev: "매출 1.5배" },
  { c: "코칭·컨설팅 P사", cpl: "DB 단가 35%↓", before: 1, after: 3.8, label: "3.8배", rev: "매출 4배" },
  { c: "가맹 프랜차이즈 L사", cpl: "DB 단가 58%↓", before: 1, after: 2.4, label: "2.4배", rev: "매출 3배" },
];
const WHY = [
  { t: <><em>대표가 직접</em> 운영하는<br />DB 마케팅</>, s: "계약만 대표가 하고, 운영은 직원에게 넘기지 않습니다.", items: ["대표 직접 전략 수립 및 운영", "광고 성과 분석과 개선", "고객사별 맞춤 전략 수립"] },
  { t: <><em>[ 마케팅 + 디자인 + 개발 ]</em><br />한 팀으로 실행</>, s: "기획부터 제작까지, 기다릴 이유가 없습니다.", items: ["광고 소재 기획 및 제작", "랜딩페이지 디자인·개발", "전환 추적 및 CRM 자동화"] },
  { t: <><em>인하우스처럼 움직이는</em><br />DB 마케팅 파트너</>, s: "시키는 일만 하는 대행사가 아닙니다.", items: ["새로운 광고 소구점 제안", "성과에 따른 소재·랜딩 개선", "지속적인 테스트와 예산 확대"] },
];
const STEPS = [
  { t: "사업 분석 & DB 마케팅 전략 수립", items: ["상품·서비스 USP 및 경쟁사 분석", "고객 타겟 / 광고 매체 / 랜딩페이지 등 DB 수집 컨디션 전반 점검", "고객 확보 목표에 맞춘 광고 전략 설계"] },
  { t: "광고 콘텐츠 제작 & 집행", items: ["DB 신청을 유도하는 이미지 / 영상 소재 기획 및 제작", "효율 저하 시 즉시 신규 소재 투입, 소재 반복 테스트", "Meta / Google 등 주요 매체 광고 집행"] },
  { t: "성과 분석 & 최적화", items: ["광고별 DB 단가 및 수량 분석", "랜딩페이지 전환율 개선", "CRM 자동화 및 영업 데이터 연동", "성과에 따른 타겟 / 소재 / 예산 최적화"] },
];
const STORIES = [
  { chip: "운영 [N]개월 차", c: "태양광 시공·분양\nG사", img: charMale, side: "l", q: "[실제 고객사 후기 삽입 — 두세 문장, 핵심 숫자는 강조]" },
  { chip: "운영 [N]개월 차", c: "성인 교육 플랫폼\nD사", img: charFemale, side: "r", q: "[실제 고객사 후기 삽입]" },
  { chip: "운영 [N]개월 차", c: "코칭·컨설팅\nP사", img: charCurly, side: "l", q: "[실제 고객사 후기 삽입]" },
];
const CREATIVES: { src: string; v?: boolean }[] = [
  ...[1, 2, 3, 4, 5, 10].map((n) => ({ src: `/reels/${n}.mp4`, v: true })),
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ src: `/db-creatives/a${n}.webp` })),
  { src: "/db-creatives/v1.mp4", v: true }, { src: "/db-creatives/v2.mp4", v: true },
];
const PARTNERS = [
  { src: "/lp-partners/1.webp", alt: "DIHABOOKS" }, { src: "/lp-partners/2.webp", alt: "안부스쿨" }, { src: "/lp-partners/3.webp", alt: "플러스스피치" }, { src: "/lp-partners/4.webp", alt: "GIM COMPANY" },
  { src: "/lp-partners/5.webp", alt: "B:forest" }, { src: "/lp-partners/6.webp", alt: "빌리언 캠퍼스" }, { src: "/lp-partners/7.webp", alt: "BOOTSTRAPPER" }, { src: "/lp-partners/8.webp", alt: "디지털 노마드" },
  { src: "/lp-partners/9.webp", alt: "RUNMOA" }, { src: "/lp-partners/10.webp", alt: "funnelmoa" }, { src: "/lp-partners/11.webp", alt: "Cosmosfarm" },
];
const BUDGETS = ["아직 집행하지 않음", "500만원 미만", "500만~1,000만원", "1,000만~3,000만원", "3,000만원 이상"];

function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T | null>(null); const [on, setOn] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold }); io.observe(el); const fb = setTimeout(() => setOn(true), 3000); return () => { io.disconnect(); clearTimeout(fb); }; }, [threshold]);
  return [ref, on] as const;
}
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [ref, on] = useInView<HTMLDivElement>(0.15);
  return <div ref={ref} className={`transition-all duration-700 ease-out ${on ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[14px]"} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}
function CountUp({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null); const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; io.disconnect(); const t0 = performance.now();
      const tick = (t: number) => { const p = Math.min(1, (t - t0) / 1200); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }, { threshold: 0.4 });
    io.observe(el); const fb = setTimeout(() => setV(to), 2500); return () => { io.disconnect(); clearTimeout(fb); };
  }, [to]);
  return <span ref={ref}>{v.toFixed(decimals)}{suffix}</span>;
}
function Bar({ h, label, dim }: { h: number; label: string; dim?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null); const [on, setOn] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.3 }); io.observe(el); const fb = setTimeout(() => setOn(true), 2500); return () => { io.disconnect(); clearTimeout(fb); }; }, []);
  return (
    <div ref={ref} className="flex flex-col items-center justify-end h-full gap-1 flex-1">
      <span className="text-[12.5px] text-white/70 tabular-nums">{label}</span>
      <div className="w-[60%] rounded-t-[2px] transition-[height] duration-1000 ease-out" style={{ height: on ? `${h}%` : "4%", background: dim ? "rgba(255,255,255,0.25)" : A }} />
    </div>
  );
}

const Connector = () => { const [ref, on] = useInView<HTMLDivElement>(0.6); return <div ref={ref} className="flex flex-col items-center my-9" aria-hidden><div className="w-px bg-white/70 transition-[height] duration-500 ease-out" style={{ height: on ? 38 : 0 }} /><div className="w-[10px] h-[10px] rounded-full bg-white -mt-px transition-transform duration-300 delay-500" style={{ transform: on ? "scale(1)" : "scale(0)" }} /></div>; };
const Light = ({ children }: { children: React.ReactNode }) => <p className="text-center text-[19px] md:text-[24px] font-light leading-[1.5] text-white/90 break-keep">{children}</p>;
const Head = ({ children, size = "md" }: { children: React.ReactNode; size?: "sm" | "md" | "lg" }) => <h2 className={`text-center break-keep font-extrabold leading-[1.3] tracking-[-0.03em] ${size === "lg" ? "text-[30px] md:text-[39px]" : size === "sm" ? "text-[22.5px] md:text-[29px]" : "text-[26px] md:text-[34px]"}`}>{children}</h2>;
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <div className={`rounded-[15px] bg-[#292929] ${className}`}>{children}</div>;
const Dot = () => <span className="mt-[8px] w-[4px] h-[4px] rounded-full bg-white shrink-0" />;
const Cta = ({ children }: { children: React.ReactNode }) => <a href="#form" className="group inline-flex items-center gap-2 h-[36px] md:h-[44px] px-[14px] md:px-[18px] rounded-[8px] text-[19px] md:text-[21px] font-semibold text-white transition-transform duration-200 hover:-translate-y-[1px]" style={{ background: A }}>{children} <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-[3px]">→</span></a>;

function shuffle<T>(arr: T[]) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function CreativeStrip() {
  const [rows, setRows] = useState<{ src: string; v?: boolean }[][]>([CREATIVES.slice(0, 7), CREATIVES.slice(7)]);
  useEffect(() => { const all = shuffle(CREATIVES); setRows([all.slice(0, Math.ceil(all.length / 2)), all.slice(Math.ceil(all.length / 2))]); }, []);
  const Tile = ({ c, k }: { c: { src: string; v?: boolean }; k: string }) => (
    <div key={k} className="w-[150px] md:w-[180px] aspect-square rounded-[8px] overflow-hidden bg-[#1a1a1a] shrink-0">
      {c.v ? <video src={c.src} muted autoPlay loop playsInline preload="metadata" className="w-full h-full object-cover" />
        /* eslint-disable-next-line @next/next/no-img-element */
        : <img src={c.src} alt="" decoding="async" loading="lazy" className="w-full h-full object-cover" />}
    </div>
  );
  return (
    <div className="mt-6 -mx-[25px] space-y-[8px]" style={{ maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)" }}>
      {rows.map((row, r) => (
        <div key={r} className="overflow-hidden">
          <div className="flex w-max gap-[8px] animate-marquee" style={{ animationDuration: `${row.length * 6}s`, animationDirection: r === 1 ? "reverse" : "normal" }}>
            {[...row, ...row].map((c, i) => <Tile key={`${r}-${i}`} c={c} k={`${r}-${i}`} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function PainCard() {
  const [ref, on] = useInView<HTMLDivElement>(0.5);
  return (
    <div ref={ref}><Card className="mt-7 mx-auto w-[88%] px-[18px] md:px-[24px] py-[6px]">
      {PAINS.map((p, i) => (
        <div key={i} className="flex gap-[14px] items-start py-[14px] border-t border-white/40 first:border-0 text-[15.5px] md:text-[19.5px] leading-[1.55] text-white/90 break-keep">
          <span className="mt-[5px] w-[14px] h-[14px] md:w-[16px] md:h-[16px] border border-white/80 shrink-0 flex items-center justify-center transition-colors duration-300" style={{ transitionDelay: `${300 + i * 350}ms`, background: on ? A : "transparent", borderColor: on ? A : undefined }} aria-hidden>
            <svg viewBox="0 0 12 12" className="w-[10px] h-[10px]"><path d="M2 6.5 5 9.5 10 3" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="14" strokeDashoffset={on ? 0 : 14} style={{ transition: "stroke-dashoffset .35s ease-out", transitionDelay: `${400 + i * 350}ms` }} /></svg>
          </span>
          <span>{p}</span>
        </div>
      ))}
    </Card></div>
  );
}

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
    <div className="min-h-screen bg-[#101010] text-white" style={{ fontFamily: "Pretendard, Inter, -apple-system, sans-serif" }}>
      <style>{`.db em{font-style:normal;color:${A}} .db b{font-weight:700;color:#fff} .db input::placeholder{color:rgba(255,255,255,.3)} @keyframes dbUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}} .db-up{opacity:0;animation:dbUp .7s cubic-bezier(.2,.7,.2,1) forwards}`}</style>
      <div className="db mx-auto w-full max-w-[420px] md:max-w-[540px] px-[25px] pt-[60px] pb-[120px]">


        {/* 01 HERO — 로드 시 순차 페이드업 */}
        <div className="pt-[10px] pb-[6px] text-center">
          <p className="text-[17px] md:text-[21px] font-light leading-[1.5] text-white/80 break-keep db-up" style={{ animationDelay: "0ms" }}>성과 내는 기업엔 공통점이 있습니다.</p>
          <p className="mt-[2px] text-[20px] md:text-[25px] font-bold leading-[1.45] break-keep db-up" style={{ animationDelay: "120ms" }}><em>DB 마케팅</em>을 제대로 한다는 것</p>
          <h2 className="mt-8 text-[38px] md:text-[50px] font-extrabold leading-[1.15] tracking-[-0.04em] break-keep db-up" style={{ animationDelay: "260ms" }}>다음은<br />대표님 차례입니다.</h2>
          <div className="mt-9 flex justify-center db-up" style={{ animationDelay: "420ms" }}><a href="#form" className="group inline-flex items-center gap-2 h-[50px] md:h-[56px] px-[26px] md:px-[30px] rounded-[10px] text-[18px] md:text-[20px] font-bold text-white transition-transform duration-200 hover:-translate-y-[1px] shadow-[0_10px_30px_rgba(67,150,248,0.35)]" style={{ background: A }}>DB 마케팅 상담하기 <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-[3px]">→</span></a></div>
        </div>

        <Connector />

        {/* 02 PAIN POINT */}
        <Reveal><Head size="sm">혹시 이런 고민 중이신가요?</Head></Reveal>
        <PainCard />

        <Connector />

        {/* 03 PERFORMANCE — 운영 전/후 막대 */}
        <Reveal><Head size="sm"><span className="font-light">우리는 이 고민을</span> 숫자로 바꿉니다.</Head></Reveal>
        <div className="mt-7 grid grid-cols-2 gap-[10px]">
          {PERF.map((p) => (
            <div key={p.c} className="rounded-[12px] bg-[#0d0d0d] border border-white/[0.08] p-[12px] md:p-[14px]">
              <p className="text-[14px] md:text-[16px] font-semibold text-white/90 mb-1 break-keep leading-[1.3]">{p.c}</p>
              <p className="text-[12.5px] md:text-[15px] text-white/50 mb-3">{p.cpl} · {p.rev}</p>
              <div className="relative h-[72px] md:h-[88px] border-b border-white/30">
                <div className="absolute inset-x-0 top-[22%] border-t border-dashed border-white/15" /><div className="absolute inset-x-0 top-[61%] border-t border-dashed border-white/15" />
                <div className="flex h-full items-end gap-2 px-1"><Bar h={(p.before / p.after) * 100} label="운영 전" dim /><Bar h={100} label={p.label} /></div>
              </div>
              <div className="flex justify-around mt-1 text-[11px] md:text-[14px] text-white/45"><span>운영 전</span><span>운영 후 DB 수량</span></div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12.5px] md:text-[15px] text-white/35 text-center leading-[1.6]">Meta·Google 광고 계정 기준. 측정 기간과 비교 기준은 상담 시 계정 화면으로 확인하실 수 있습니다.</p>

        <Connector />

        {/* 04 WHY */}
        <Reveal><Light>DB 마케팅에 특화된 전문팀</Light>
        <Head>픽셀페이지가 직접 합니다</Head></Reveal>
        <div className="mt-8 space-y-[34px]">
          {WHY.map((w, i) => (
            <Reveal key={i} className="relative pt-[14px]" delay={i * 80}>
              <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[28px] h-[28px] md:w-[34px] md:h-[34px] rounded-full bg-[#3a3a3a] flex items-center justify-center text-[16px] md:text-[20px] font-bold z-10">{i + 1}</div>
              <Card className="mx-auto w-[92%] pt-[34px] pb-[24px] px-[22px] md:px-[28px] text-center">
                <p className="text-[24px] md:text-[29px] font-bold leading-[1.35] tracking-[-0.02em] break-keep">{w.t}</p>
                <p className="mt-[6px] text-[14.5px] md:text-[17px] text-white/55 break-keep">{w.s}</p>
                <ul className="mt-[18px] inline-block text-left space-y-[6px]">{w.items.map((it) => <li key={it} className="flex gap-[10px] text-[16px] md:text-[19px] text-white/90 leading-[1.5]"><Dot />{it}</li>)}</ul>
              </Card>
            </Reveal>
          ))}
        </div>

        <div className="mt-[60px]">
          <Light>광고는 누구나 할 수 있지만</Light>
          <Head size="lg">성과를 키우는 건<br />아무나 못합니다</Head>
          <p className="mt-3 text-center text-[15.5px] md:text-[19px] text-white/60 leading-[1.6]">같은 광고비, 다른 결과.<br />차이는 운영하는 사람에게 있습니다.</p>
        </div>
        <div className="mt-7 grid grid-cols-3 gap-[8px]">
          {[["누적 DB 수", <CountUp key="a" to={10} suffix="만 건" />], ["평균 DB 단가 개선", <CountUp key="b" to={48} suffix="%" />], ["광고 예산 최대 확대", <CountUp key="c" to={20} suffix="배" />]].map(([k, v]) => (
            <div key={String(k)} className="rounded-[12px] bg-[#0d0d0d] border border-white/[0.08] py-[14px] px-[6px] text-center">
              <p className="text-[12px] md:text-[14px] text-white/55 mb-[6px] break-keep leading-[1.3]">{k as string}</p>
              <p className="text-[25px] md:text-[32.5px] font-extrabold tabular-nums tracking-[-0.02em]" style={{ color: A }}>{v as React.ReactNode}</p>
            </div>
          ))}
        </div>

        <Connector />

        {/* 05 PROCESS */}
        <Reveal><Head>픽셀페이지는 이렇게 접근합니다</Head></Reveal>
        <div className="mt-8 relative">
          <div className="absolute left-[5px] top-[10px] bottom-[14px] border-l-2 border-dotted" style={{ borderColor: A }} aria-hidden />
          <div className="space-y-[26px]">
            {STEPS.map((s, i) => (
              <Reveal key={s.t} className="relative pl-[24px]" delay={i * 120}>
                <span className="absolute left-0 top-[5px] w-[12px] h-[12px] rounded-full" style={{ background: A }} aria-hidden />
                <p className="text-[19px] md:text-[22.5px] font-extrabold leading-[1.3] break-keep"><span style={{ color: A }}>STEP. {i + 1}</span> <span className="ml-1">{s.t}</span></p>
                <Card className="mt-[14px] ml-[6px] px-[18px] md:px-[22px] py-[16px] md:py-[20px]">
                  <ul className="space-y-[8px]">{s.items.map((it) => <li key={it} className="flex gap-[10px] text-[15.5px] md:text-[18px] text-white/90 leading-[1.5] break-keep"><Dot />{it}</li>)}</ul>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-[60px]"><Head size="sm">터지는 광고 소재가 <span className="font-light">나올 때까지</span></Head></div>

        {/* 06 CREATIVE — 실제 집행 소재, 2단 무한 스와이프(로드마다 랜덤 순서) */}
        <CreativeStrip />

        <Connector />

        {/* 07 SUCCESS STORY — 말풍선 */}
        <Head size="sm"><span>다양한 성공 레퍼런스</span><span className="font-light">를 바탕으로</span><br /><span className="font-light">기업의 성장을 </span>함께 만듭니다.</Head>
        <div className="mt-8 space-y-[18px]">
          {STORIES.map((s, i) => (
            <Reveal key={s.c} className={`flex items-center gap-[10px] ${s.side === "r" ? "flex-row-reverse" : ""}`} delay={i * 120}>
              <div className="w-[70px] md:w-[84px] shrink-0 text-center">
                <span className="inline-block px-[8px] py-[3px] rounded-full bg-[#2a2a2a] text-[11px] md:text-[13px] font-semibold">{s.chip}</span>
                <p className="mt-[4px] text-[14px] md:text-[16px] font-bold leading-[1.25] whitespace-pre-line">{s.c}</p>
              </div>
              <div className="relative flex-1 rounded-[10px] bg-[#e9e9e9] text-[#222] text-[14px] md:text-[16px] leading-[1.6] px-[14px] py-[12px] break-keep">
                <span className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent ${s.side === "r" ? "-right-[6px] border-l-[7px] border-l-[#e9e9e9]" : "-left-[6px] border-r-[7px] border-r-[#e9e9e9]"}`} aria-hidden />
                {s.q}
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-3 text-[12.5px] text-white/35 text-center">실제 고객이 남긴 후기만 사용합니다.</p>

        <div className="mt-[60px]"><Head>성과로 증명한<br />고객사의 생생한 목소리입니다</Head></div>
        <div className="mt-7 grid grid-cols-2 gap-[8px]">
          {["[카카오톡 대화 캡처 1]", "[카카오톡 대화 캡처 2]", "[광고 성과 개선 사례]", "[예산 증액 사례]"].map((p) => (
            <div key={p} className="aspect-[4/5] rounded-[6px] bg-[#b7c7d9] flex items-center justify-center text-[14px] text-[#223] text-center px-3">{p}</div>
          ))}
        </div>

        {/* 파트너 로고 — 메인 랜딩과 동일한 마키 */}
        <div className="mt-[60px]">
          <p className="text-center text-[14px] md:text-[16px] text-white/50 mb-5">픽셀페이지와 함께하는 파트너사</p>
          <div className="relative -mx-[25px]" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
            <div className="flex w-max animate-marquee gap-8 md:gap-10">
              {[...PARTNERS, ...PARTNERS].map((p, i) => (
                <div key={`${p.alt}-${i}`} className="h-12 flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt={p.alt} decoding="async" className="h-10 md:h-12 w-auto object-contain opacity-90" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <Connector />

        {/* 08 FORM — 탈리 폼 수치 그대로: 라벨 18/600, 입력 36px r8 bg white/5.5%, 버튼 36px r8 */}
        <div id="form" className="scroll-mt-6">
          <Head size="sm">DB 마케팅,<br />이제 <em>제대로 된 팀</em>과 함께하세요.</Head>
          <p className="mt-3 text-center text-[15.5px] md:text-[19px] text-white/60 leading-[1.6]">우리 회사의 DB 마케팅팀.<br />픽셀페이지가 함께합니다.</p>
          <form onSubmit={onSubmit} className="mt-10">
            <p className="text-[30px] font-semibold leading-[1.25] mb-[30px]">📝DB 마케팅 상담하기</p>
            {[["company", "회사명", "text", true], ["name", "성함/직함", "text", true], ["phone", "전화번호", "tel", true], ["email", "이메일", "email", true], ["site", "사이트 주소", "url", false]].map(([k, label, type, req]) => (
              <label key={String(k)} className="block mb-[36px]">
                <span className="block text-[22.5px] font-semibold leading-[1.25] pb-[5px]">{label as string}{req ? <span className="ml-[6px] text-[17.5px] font-black align-middle">*</span> : null}</span>
                <input type={type as string} value={f[k as keyof typeof f] as string} onChange={(e) => setF({ ...f, [k as string]: e.target.value })} className="mt-[10px] w-full h-[36px] rounded-[8px] bg-white/[0.055] border border-white/10 px-[10px] text-[20px] focus:outline-none focus:border-white/40" />
              </label>
            ))}
            <div className="mb-[36px]">
              <span className="block text-[22.5px] font-semibold leading-[1.25] pb-[12px]">현재 월 광고 예산</span>
              <div className="space-y-[10px]">
                {BUDGETS.map((b) => (
                  <button type="button" key={b} onClick={() => setF({ ...f, budget: b })} className="flex items-center gap-[10px] text-[20px]">
                    <span className="w-[20px] h-[20px] rounded-full border border-white/60 flex items-center justify-center shrink-0">{f.budget === b && <span className="w-[10px] h-[10px] rounded-full" style={{ background: A }} />}</span>{b}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-[36px]">
              <span className="block text-[22.5px] font-semibold leading-[1.25] pb-[12px]">개인정보 수집 및 이용 동의<span className="ml-[6px] text-[17.5px] font-black align-middle">*</span></span>
              <button type="button" onClick={() => setF({ ...f, agree: !f.agree })} className="flex items-center gap-[10px] text-[20px]">
                <span className="w-[20px] h-[20px] rounded-[4px] border border-white/60 flex items-center justify-center shrink-0" style={f.agree ? { background: A, borderColor: A } : undefined}>{f.agree && <span className="text-[16px] font-bold">✓</span>}</span>개인 정보 수집 및 이용에 동의합니다.
              </button>
            </div>
            {err && <p className="mb-4 text-[16px] text-red-300">{err}</p>}
            <div className="flex justify-center"><button type="submit" disabled={submitting} className="inline-flex items-center gap-2 h-[36px] px-[14px] rounded-[8px] text-[19px] font-semibold text-white disabled:opacity-60" style={{ background: A }}>{submitting ? "전송 중…" : "DB 마케팅 상담하기"} <span aria-hidden>→</span></button></div>
          </form>
        </div>

        <p className="mt-[80px] text-[12.5px] text-white/30 text-center leading-[1.8]">픽셀페이지 · 대표 박희규 · 사업자등록번호 477-11-01530<br />contact@pixelpage.co.kr</p>
      </div>
      <a href="#form" className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-2 h-[40px] px-[16px] rounded-[8px] text-[17.5px] font-semibold text-white shadow-[0_8px_30px_rgba(0,0,0,0.5)]" style={{ background: A }}>DB 마케팅 상담하기 →</a>
    </div>
  );
}

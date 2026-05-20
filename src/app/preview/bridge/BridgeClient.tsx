"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Megaphone, Globe, Mail } from "lucide-react";
import Reveal from "@/components/Reveal";

const pains = [
  {
    tag: "광고 대행사",
    title: "랜딩 탓을 해요.",
    desc: "광고 성과가 안 나오면 랜딩페이지 문제라고 해요. 랜딩 제작사는 광고 탓을 하고요. 어느 쪽도 퍼널 전체를 보지 않아요.",
  },
  {
    tag: "보고서",
    title: "클릭률, 노출수가 가득해요.",
    desc: "매달 보고서는 오는데 매출은 그대로예요. 숫자가 많을수록 뭐가 문제인지 더 모르겠어요.",
  },
  {
    tag: "놓친 리드",
    title: "경쟁사로 갔습니다.",
    desc: "상담 신청이 왔는데 후속 연락을 놓쳤어요. 그 리드, 다음 날 경쟁사로 갔습니다.",
  },
];

const services = [
  {
    icon: Megaphone,
    name: "퍼포먼스",
    title: "상담 신청을 만드는 광고",
    desc: "Meta · Google · 토스 · 당근. 구매 의향 있는 사람을 찾아 행동하게 만드는 구조를 설계해요.",
  },
  {
    icon: Globe,
    name: "랜딩페이지",
    title: "이탈을 막는 페이지",
    desc: "광고 메시지와 일치하는 랜딩. 클릭한 사람이 신청 버튼을 누르게 만들어요.",
  },
  {
    icon: Mail,
    name: "CRM 자동화",
    title: "신청을 매출로 바꾸는 시퀀스",
    desc: "카카오 알림톡 · 이메일 · 문자. 쌓인 신청이 알아서 전환되는 자동화 퍼널을 설계해요.",
  },
];

const cases = [
  { metric: "ROAS 8.4×", desc: "퍼포먼스 재설계" },
  { metric: "CPA −62%", desc: "캠페인 재설계" },
  { metric: "매출 6.6배", desc: "퍼널 전체 설계" },
];

const faqs = [
  {
    q: "광고 대행사랑 뭐가 다른가요?",
    a: "일반 광고 대행사는 광고 집행만 해요. 픽셀페이지는 광고, 랜딩, CRM을 설계하고, 분석하고, 개선해요. 퍼널 전체를 보기 때문에 어디가 문제인지 바로 알 수 있어요.",
  },
  {
    q: "어떤 업종이든 가능한가요?",
    a: "네. B2B SaaS, 전문 서비스, 교육 등 상담 신청이 필요한 업종이라면 다 가능해요.",
  },
  {
    q: "마케팅 진단은 어떻게 진행되나요?",
    a: "30분 통화로 진행돼요. 현재 광고 계정, 랜딩 전환율, CRM 구조를 보고 퍼널 어디가 끊겼는지 짚어드려요. 계약 없이도 괜찮아요.",
  },
  {
    q: "대행이 아니라 방향만 잡고 싶으면요?",
    a: "컨설팅으로 진행할 수 있어요. 인하우스 팀이 직접 실행할 수 있도록 퍼널 진단 리포트와 실행 플랜을 만들어드려요.",
  },
];

const BridgeClient = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="bg-white text-foreground">
      {/* Hero */}
      <section className="pt-36 lg:pt-44 pb-24 lg:pb-32 bg-white">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12 text-center">
          <Reveal>
            <span className="inline-block text-[12px] font-semibold tracking-[0.18em] uppercase text-blue-500 bg-blue-50 px-4 py-1.5 rounded-full mb-7">
              Preview
            </span>
            <h1 className="break-keep text-[clamp(40px,7vw,84px)] font-bold leading-[1.08] tracking-[-0.035em] text-foreground mb-7">
              마케팅 대행의<br />새로운 기준
            </h1>
            <p className="text-[17px] md:text-[19px] text-muted-foreground leading-[1.85] max-w-[560px] mx-auto mb-10">
              더 이상 광고만 맡기지 마세요.<br />
              픽셀페이지가 상담 신청부터 전환까지 파이프라인을 만들어드려요.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/consult"
                className="inline-flex items-center gap-2 px-9 py-4 bg-[#0a0f1e] text-white text-[15px] font-bold rounded-xl hover:opacity-90 transition-all"
              >
                무료 마케팅 진단 받기
              </Link>
              <Link
                href="#cases"
                className="inline-flex items-center gap-1.5 px-9 py-4 border border-[#e5e7eb] text-foreground text-[15px] font-medium rounded-xl hover:bg-[#fbfbfb] transition-all"
              >
                성과 보기 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <Reveal className="text-center mb-16">
            <p className="text-[12px] tracking-[0.18em] uppercase text-blue-500 font-semibold mb-5">
              왜 파이프라인인가요
            </p>
            <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.15] tracking-[-0.03em] mb-6">
              광고만 잘 돌아가도<br />매출이 안 나오는 이유
            </h2>
            <p className="text-[17px] md:text-[18px] text-muted-foreground leading-[1.85] max-w-[540px] mx-auto">
              광고, 랜딩, CRM이 따로 놀면 퍼널이 끊겨요.<br />
              클릭은 나오는데 상담 신청이 없는 게 그 증거예요.
            </p>
          </Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pains.map((p) => (
              <div
                key={p.tag}
                className="bg-white border border-[#e5e7eb] rounded-2xl p-8 lg:p-10 shadow-sm"
              >
                <span className="inline-block text-[12px] font-semibold tracking-[0.1em] uppercase text-blue-500 bg-blue-50 px-3 py-1 rounded-full mb-5">
                  {p.tag}
                </span>
                <h3 className="text-[22px] font-bold text-foreground leading-[1.35] mb-4">
                  {p.title}
                </h3>
                <p className="text-[15px] text-muted-foreground leading-[1.85]">{p.desc}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Method */}
      <section className="py-28 lg:py-36 bg-white">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <Reveal className="text-center mb-16">
            <p className="text-[12px] tracking-[0.18em] uppercase text-blue-500 font-semibold mb-5">
              픽셀페이지의 방식
            </p>
            <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.15] tracking-[-0.03em] mb-6">
              하나의 팀이<br />처음부터 끝까지 봐요
            </h2>
            <p className="text-[17px] md:text-[18px] text-muted-foreground leading-[1.85] max-w-[540px] mx-auto">
              광고, 랜딩, CRM을 따로 맡기지 않아도 돼요.<br />
              픽셀페이지가 설계하고, 분석하고, 개선해요.
            </p>
          </Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.name}
                  className="bg-[#fbfbfb] border border-[#e5e7eb] rounded-2xl p-8 lg:p-10"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                    <Icon className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-[12px] font-semibold tracking-[0.1em] uppercase text-blue-500">
                    {s.name}
                  </span>
                  <h3 className="text-[20px] font-bold text-foreground mt-2 mb-4 leading-[1.35]">
                    {s.title}
                  </h3>
                  <p className="text-[15px] text-muted-foreground leading-[1.85]">{s.desc}</p>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* Cases */}
      <section id="cases" className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <Reveal className="text-center mb-16">
            <p className="text-[12px] tracking-[0.18em] uppercase text-blue-500 font-semibold mb-5">
              성과
            </p>
            <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.15] tracking-[-0.03em]">
              숫자로만<br />말할게요.
            </h2>
          </Reveal>
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {cases.map((c) => (
              <div
                key={c.metric}
                className="bg-white border border-[#e5e7eb] rounded-2xl p-10 lg:p-12 text-center shadow-sm"
              >
                <p className="text-[clamp(36px,4.5vw,56px)] font-bold text-foreground tracking-[-0.03em] leading-none mb-3">
                  {c.metric}
                </p>
                <p className="text-[13px] text-muted-foreground tracking-[0.05em] uppercase">
                  {c.desc}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-28 lg:py-36 bg-white">
        <div className="max-w-[840px] mx-auto px-6 lg:px-12">
          <Reveal className="text-center mb-14">
            <p className="text-[12px] tracking-[0.18em] uppercase text-blue-500 font-semibold mb-5">
              자주 묻는 질문
            </p>
            <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.15] tracking-[-0.03em]">
              궁금한 게 있으신가요.
            </h2>
          </Reveal>
          <Reveal className="space-y-3">
            {faqs.map((f, i) => {
              const open = openIdx === i;
              return (
                <div
                  key={i}
                  className="border border-[#e5e7eb] rounded-2xl bg-white overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIdx(open ? null : i)}
                    className="w-full px-7 py-6 flex items-center justify-between gap-6 text-left hover:bg-[#fbfbfb] transition-colors"
                  >
                    <span className="text-[16px] md:text-[17px] font-semibold text-foreground">
                      {f.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open && (
                    <div className="px-7 pb-6 pt-0">
                      <p className="text-[15px] text-muted-foreground leading-[1.85]">{f.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 lg:py-36" style={{ background: "#0a0f1e" }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12 text-center">
          <Reveal>
            <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-white leading-[1.15] tracking-[-0.03em] mb-6">
              파이프라인,<br />어디서 새는지 찾아드려요.
            </h2>
            <p className="text-[17px] md:text-[19px] text-white/60 leading-[1.85] max-w-[560px] mx-auto mb-10">
              무료 마케팅 진단 — 30분이면 됩니다.<br />
              계약 없이도 괜찮아요. 진단 후 대행이 필요하면 대행을,<br />
              방향만 필요하면 컨설팅을 제안드려요.
            </p>
            <Link
              href="/consult"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-[#0a0f1e] text-[15px] font-bold rounded-xl hover:opacity-90 transition-all"
            >
              무료 마케팅 진단 신청하기 <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default BridgeClient;

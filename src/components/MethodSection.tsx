"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Eye, BarChart3, Send, CheckCheck, MessageSquare, Users, MousePointerClick, ChevronsUpDown } from "lucide-react";
import Reveal from "@/components/Reveal";
import metaLogo from "@/assets/meta-logo.png";

/* ─────────────────────────────────────────────────────────────
   Mac Window Shell
───────────────────────────────────────────────────────────── */
const MacWindow = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl overflow-hidden shadow-2xl bg-[#1e1e1e] border border-white/10">
    <div className="flex items-center gap-2 px-4 py-3 bg-[#2d2d2d] border-b border-white/5">
      <div className="flex gap-[7px]">
        <div className="w-[13px] h-[13px] rounded-full bg-[#ff5f57]" />
        <div className="w-[13px] h-[13px] rounded-full bg-[#febc2e]" />
        <div className="w-[13px] h-[13px] rounded-full bg-[#28c840]" />
      </div>
      <span className="ml-3 text-[12px] text-neutral-400 font-mono truncate">{title}</span>
    </div>
    {children}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   1. Performance Mockup — Meta 광고 관리자
───────────────────────────────────────────────────────────── */
const PerformanceMockup = () => (
  <MacWindow title="Meta 광고 관리자 — pixelpage">
    <div className="text-[10px] lg:text-[11px] bg-white flex">
      <div className="w-8 bg-white border-r border-neutral-200 flex-col items-center py-2 gap-3 flex-shrink-0 hidden lg:flex">
        <img src={metaLogo.src} alt="Meta" className="w-5 h-5 object-contain mb-1" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-4 h-4 rounded bg-neutral-100" />
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <div className="px-3 py-2 border-b border-neutral-200 flex items-center gap-2">
          <span className="text-neutral-900 font-semibold text-[12px]">캠페인</span>
          <span className="text-neutral-400 text-[9px]">&#x2295; 픽셀페이지</span>
          <span className="bg-[#e8f5e9] text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-full ml-1 font-medium">85</span>
          <span className="text-neutral-400 text-[9px]">광고 최적화 지수</span>
        </div>
        <div className="flex items-center gap-0 px-3 border-b border-neutral-200 text-[10px]">
          <span className="text-[#1877f2] font-medium px-2 py-1.5 border-b-2 border-[#1877f2]">모든 광고</span>
          <span className="text-neutral-500 px-2 py-1.5">게재 중</span>
          <span className="text-neutral-500 px-2 py-1.5">작업</span>
          <span className="text-neutral-400 px-2 py-1.5">+ 더 보기</span>
        </div>
        <div className="grid grid-cols-[18px_1fr_52px_60px_72px_56px] gap-px px-3 py-1.5 bg-[#f5f6f7] border-b border-neutral-200 text-neutral-500 text-[9px] font-medium">
          <span></span>
          <span>캠페인</span>
          <span>결과</span>
          <span>결과당 비용</span>
          <span>지출 금액</span>
          <span>노출</span>
        </div>
        {[
          { name: "260412_브랜드_전환 - B", on: true, results: "122", cost: "₩7,816", spent: "₩953,551", imp: "16,897", checked: true },
          { name: "260412_브랜드_전환", on: true, results: "570", cost: "₩4,415", spent: "₩2,516,573", imp: "55,096", checked: false },
          { name: "브랜드_인지도_참여", on: true, results: "15,805", cost: "₩93", spent: "₩1,470,022", imp: "288,562", checked: false },
          { name: "260405_리타겟", on: false, results: "598", cost: "₩6,689", spent: "₩4,000,000", imp: "80,157", checked: false },
          { name: "260329_부트캠프 - B", on: false, results: "162", cost: "₩6,638", spent: "₩1,075,355", imp: "21,004", checked: false },
          { name: "260329_부트캠프", on: false, results: "432", cost: "₩6,694", spent: "₩2,891,714", imp: "47,465", checked: false },
          { name: "260322_숏폼_바이럴", on: false, results: "669", cost: "₩6,856", spent: "₩4,586,756", imp: "99,086", checked: false },
        ].map((c) => (
          <div key={c.name} className={`grid grid-cols-[18px_1fr_52px_60px_72px_56px] gap-px px-3 py-[6px] border-b border-neutral-100 text-neutral-700 ${c.checked ? "bg-[#e7f3ff]" : ""}`}>
            <span className="flex items-center">
              <div className={`w-[18px] h-[10px] rounded-full flex-shrink-0 ${c.on ? "bg-[#1877f2]" : "bg-neutral-800"}`}>
                <div className={`w-[8px] h-[8px] rounded-full bg-white mt-[1px] transition-all ${c.on ? "ml-[9px]" : "ml-[1px]"}`} />
              </div>
            </span>
            <span className="text-[#0064d1] truncate font-medium">{c.name}</span>
            <span className="text-neutral-900">{c.results}</span>
            <span>{c.cost}</span>
            <span>{c.spent}</span>
            <span>{c.imp}</span>
          </div>
        ))}
        <div className="px-3 py-1.5 text-neutral-400 text-[9px]">캠페인 281개 결과</div>
      </div>
    </div>
  </MacWindow>
);

/* ─────────────────────────────────────────────────────────────
   2. Landing Analytics Mockup — Clarity 스타일 분석 대시보드
───────────────────────────────────────────────────────────── */
const LandingAnalyticsMockup = () => (
  <MacWindow title="analytics.pixelpage.io — 랜딩 분석">
    <div className="bg-[#f4f6fb] p-4 lg:p-5 text-[12px]">
      {/* Top metrics */}
      <div className="grid grid-cols-4 gap-2 lg:gap-3 mb-3 lg:mb-4">
        {[
          { label: "세션", value: "675", sub: "25 봇 세션은 제외됩니다." },
          { label: "세션당 페이지 수", value: "1.11", sub: "평균" },
          { label: "스크롤 깊이", value: "44.98%", sub: "평균" },
          { label: "소요된 활성 시간", value: "1.0 분", sub: "총 시간 1.2 분 중" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-lg p-2.5 lg:p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] lg:text-[10px] text-neutral-500">{m.label}</span>
              <span className="text-[#4f46e5] text-[10px]">↗</span>
            </div>
            <div className="text-[16px] lg:text-[19px] font-bold text-[#1a1f36] tracking-[-0.02em]">{m.value}</div>
            <div className="text-[8px] lg:text-[9px] text-neutral-400 italic mt-0.5">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Two panels */}
      <div className="grid grid-cols-2 gap-2 lg:gap-3">
        {/* 사용자 개요 */}
        <div className="bg-white rounded-lg p-2.5 lg:p-3">
          <div className="flex items-center gap-2 mb-2 lg:mb-3">
            <span className="text-[10px] lg:text-[11px] font-semibold text-[#1a1f36]">사용자 개요</span>
            <span className="text-[9px] text-neutral-400">모든 사용자</span>
          </div>
          <div className="bg-[#f4f6fb] rounded p-2 mb-1.5 flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center">
              <span className="text-[9px] text-emerald-600">●</span>
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-[#1a1f36] leading-none">1</div>
              <div className="text-[9px] text-neutral-500">라이브 사용자 · 1분 전</div>
            </div>
          </div>
          <div className="bg-[#f4f6fb] rounded p-2 mb-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center">
              <Users className="w-3 h-3 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-[#1a1f36] leading-none">643</div>
              <div className="text-[9px] text-neutral-500">고유 사용자</div>
            </div>
          </div>
          <div className="flex h-1.5 rounded-full overflow-hidden mb-2">
            <div className="bg-[#e879f9]" style={{ width: "86.37%" }} />
            <div className="bg-[#818cf8]" style={{ width: "13.63%" }} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px] lg:text-[10px]">
              <span className="flex items-center gap-1.5 text-neutral-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e879f9]" />신규 세션
              </span>
              <span className="text-neutral-500">86.37% · 583</span>
            </div>
            <div className="flex items-center justify-between text-[9px] lg:text-[10px]">
              <span className="flex items-center gap-1.5 text-neutral-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]" />복귀 세션
              </span>
              <span className="text-neutral-500">13.63% · 92</span>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-white rounded-lg p-2.5 lg:p-3">
          <div className="flex items-center gap-2 mb-2 lg:mb-3">
            <span className="text-[10px] lg:text-[11px] font-semibold text-[#1a1f36]">Insights</span>
          </div>
          {[
            { label: "빠른 클릭", value: "0.44%", sub: "3 세션", icon: MousePointerClick, bg: "bg-orange-100", color: "text-orange-600" },
            { label: "배달 못 한 클릭", value: "10.52%", sub: "71 세션", icon: MousePointerClick, bg: "bg-purple-100", color: "text-purple-600" },
            { label: "과도한 스크롤", value: "0%", sub: "0 세션", icon: ChevronsUpDown, bg: "bg-violet-100", color: "text-violet-600" },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="bg-[#f4f6fb] rounded p-2 mb-1.5 last:mb-0 flex items-center gap-2">
                <div className={`w-6 h-6 rounded ${m.bg} flex items-center justify-center`}>
                  <Icon className={`w-3 h-3 ${m.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] text-neutral-500">{m.label}</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[13px] font-bold text-[#1a1f36] leading-none">{m.value}</span>
                    <span className="text-[8px] text-neutral-400">· {m.sub}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </MacWindow>
);

/* ─────────────────────────────────────────────────────────────
   3. CRM Mockup — 자동화 시퀀스
───────────────────────────────────────────────────────────── */
const CrmMockup = () => (
  <MacWindow title="crm-automation.pixelpage.io">
    <div className="p-5 lg:p-6 text-[13px] bg-white">
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        {[
          { label: "활성 시퀀스", value: "4", icon: Send, color: "text-[#1877f2]" },
          { label: "발송 완료", value: "12,840", icon: CheckCheck, color: "text-emerald-600" },
          { label: "오픈율", value: "68.2%", icon: Eye, color: "text-amber-600" },
          { label: "전환율", value: "4.8%", icon: BarChart3, color: "text-violet-600" },
        ].map((m) => (
          <div key={m.label} className="bg-[#f5f7fa] rounded-lg p-2.5 border border-neutral-100">
            <div className="flex items-center gap-1 text-neutral-500 text-[10px] mb-0.5">
              <m.icon className="w-3 h-3" />{m.label}
            </div>
            <div className={`font-semibold text-[16px] ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#f5f7fa] rounded-lg p-3.5 border border-neutral-100">
        <div className="text-neutral-500 text-[10px] uppercase tracking-wider mb-2.5 font-medium">자동화 퍼널 · 온보딩</div>
        <div className="space-y-0">
          {[
            { step: "1", channel: "카카오", msg: "환영합니다! 무료 체험 안내", delay: "즉시", sent: "3,210", rate: "92%", chColor: "bg-[#fee500] text-neutral-800" },
            { step: "2", channel: "이메일", msg: "다른 분들의 후기를 확인하세요", delay: "48시간 후", sent: "3,048", rate: "71%", chColor: "bg-blue-50 text-blue-700" },
            { step: "3", channel: "문자", msg: "지금 등록하면 20% 할인", delay: "7일 후", sent: "2,890", rate: "58%", chColor: "bg-emerald-50 text-emerald-700" },
            { step: "4", channel: "이메일", msg: "마지막 기회 — 내일 마감", delay: "14일 후", sent: "2,692", rate: "44%", chColor: "bg-blue-50 text-blue-700" },
          ].map((s, i) => (
            <div key={s.step} className="flex items-start gap-2.5 py-2.5 border-b border-neutral-100 last:border-0">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-[11px] font-bold">{s.step}</div>
                {i < 3 && <div className="w-[1px] h-5 bg-neutral-200 mt-1" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] ${s.chColor} px-2 py-0.5 rounded font-medium`}>{s.channel}</span>
                  <span className="text-[10px] text-neutral-400">{s.delay}</span>
                </div>
                <div className="text-neutral-800 text-[12px] mt-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                  <span className="truncate">{s.msg}</span>
                </div>
              </div>
              <div className="text-right text-[10px] flex-shrink-0">
                <div className="text-neutral-500">{s.sent}</div>
                <div className="text-emerald-600 font-medium">{s.rate}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </MacWindow>
);

/* ─────────────────────────────────────────────────────────────
   Service blocks data
───────────────────────────────────────────────────────────── */
const blocks = [
  {
    id: "performance",
    tag: "퍼포먼스 마케팅",
    title: "광고 기획과 마케팅 집행",
    items: [
      {
        head: "최적의 메시지를 발굴해요",
        body: "브랜드와 잠재고객을 연결할 수 있는 가장 효율적인 마케팅 소구점과 USP를 발굴/기획합니다.",
      },
      {
        head: "사람들이 원하는 포맷을 기획해요",
        body: "채널과 광고 소재의 트렌드를 파악하고 타겟에게 도달 가능한 형태의 포맷을 개발합니다.",
      },
      {
        head: "스케일업까지의 구조를 설계해요",
        body: "광고 최적화 이후 매출을 수직 상승시킬 수 있는 구조의 퍼포먼스를 진행합니다.",
      },
    ],
    Mockup: PerformanceMockup,
  },
  {
    id: "landing",
    tag: "랜딩페이지",
    title: "리드 수집과 최적화",
    items: [
      {
        head: "고객이 몰려왔을 때 준비가 됐는지 점검해요",
        body: "상세페이지 최적화 작업과 데이터베이스 시스템의 안정성 확보를 먼저 완료합니다.",
      },
      {
        head: "광고와 브랜드 메시지와의 연계성을 잡아요",
        body: "광고로 들어온 고객이 이탈하지 않도록 명확한 타겟 페인포인트와 소구점을 녹여냅니다.",
      },
      {
        head: "실제 전환이 되는 UI/UX로 발전시켜요",
        body: "스크롤과 클릭, 체류시간을 모니터링하며 최적의 랜딩페이지로 디벨롭시킵니다.",
      },
    ],
    Mockup: LandingAnalyticsMockup,
  },
  {
    id: "crm",
    tag: "CRM 자동화",
    title: "고객 온도를 높이는 시퀀스",
    items: [
      {
        head: "잠재고객을 모으고 분류해요",
        body: "광고로 유입된 고객을 데이터베이스 세그먼트별로 관리합니다.",
      },
      {
        head: "AI로 필요한 메시지를 보내요",
        body: "분류된 고객은 세그먼트의 특징에 따라 최적화된 커스텀 메시지를 발송합니다.",
      },
      {
        head: "고객의 관여도를 높여요",
        body: "카카오 알림톡 · 이메일 · 문자로 쌓인 DB의 리드 온도를 높입니다.",
      },
    ],
    Mockup: CrmMockup,
  },
];

/* ─────────────────────────────────────────────────────────────
   Accordion sub-component
───────────────────────────────────────────────────────────── */
const AccordionBlock = ({
  tag,
  title,
  items,
}: {
  tag: string;
  title: string;
  items: { head: string; body: string }[];
}) => {
  const [openIdx, setOpenIdx] = useState<number>(0);
  return (
    <div>
      <span className="inline-block text-[12px] font-semibold tracking-[0.08em] text-blue-500 bg-blue-50 px-3.5 py-1.5 rounded-full mb-5">
        {tag}
      </span>
      <h3 className="break-keep text-[clamp(26px,3vw,40px)] font-bold text-foreground leading-[1.18] tracking-[-0.025em] mb-8">
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((it, i) => {
          const open = openIdx === i;
          return (
            <div
              key={i}
              className={`rounded-xl border transition-colors ${open ? "border-foreground/20 bg-[#fbfbfb]" : "border-[#e5e7eb] bg-white"}`}
            >
              <button
                onClick={() => setOpenIdx(open ? -1 : i)}
                className="w-full px-5 py-4 lg:px-6 lg:py-5 flex items-center justify-between gap-4 text-left"
              >
                <span className="text-[15px] lg:text-[16px] font-bold text-foreground">{it.head}</span>
                <Plus
                  className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ height: { duration: 0.32, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.22, ease: "easeInOut" } }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="px-5 pb-5 lg:px-6 lg:pb-6 pt-0">
                      <p className="text-[14px] lg:text-[15px] text-muted-foreground leading-[1.85]">{it.body}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Main Section
───────────────────────────────────────────────────────────── */
const MethodSection = () => (
  <section className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-20 lg:mb-28">
        <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.18] tracking-[-0.03em] mb-6">
          하나의 팀이<br />처음부터 끝까지
        </h2>
        <p className="text-[17px] md:text-[18px] text-muted-foreground leading-[1.85] max-w-[520px] mx-auto">
          광고, 랜딩, CRM을 분산하지 않아도 돼요.<br />
          픽셀페이지가 설계하고, 분석하고, 개선해요.
        </p>
      </Reveal>

      <div className="space-y-28 lg:space-y-36">
        {blocks.map((b, i) => {
          const Mockup = b.Mockup;
          const reverse = i % 2 === 1;
          return (
            <Reveal key={b.id}>
              <div
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                  reverse ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <AccordionBlock tag={b.tag} title={b.title} items={b.items} />
                <div>
                  <Mockup />
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);

export default MethodSection;

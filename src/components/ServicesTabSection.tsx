"use client";

import { useState } from "react";
import iconFolder from "@/assets/icon-folder.svg";
import Link from "next/link";
import {
  ArrowRight, Megaphone, Video, Search, Mail, Globe,
  Play, Eye, Clock, BarChart3,
  Send, CheckCheck, MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/Reveal";
import metaLogo from "@/assets/meta-logo.png";
import charMale from "@/assets/char-male.png";

/* -- Mac Window Shell -- */
const MacWindow = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl overflow-hidden shadow-2xl bg-[#1e1e1e] border border-white/10">
    <div className="flex items-center gap-2 px-4 py-3 bg-[#2d2d2d] border-b border-white/5">
      <div className="flex gap-[7px]">
        <div className="w-[13px] h-[13px] rounded-full bg-[#ff5f57]" />
        <div className="w-[13px] h-[13px] rounded-full bg-[#febc2e]" />
        <div className="w-[13px] h-[13px] rounded-full bg-[#28c840]" />
      </div>
      <span className="ml-3 text-[13px] text-neutral-400 font-mono">{title}</span>
    </div>
    {children}
  </div>
);

/* -- 01. 퍼포먼스: 메타 광고관리자 -- */
const PerformanceMockup = () => (
  <MacWindow title="Meta 광고 관리자 — pixelpage">
    <div className="text-[10px] lg:text-[11px] bg-white flex">
      <div className="w-8 bg-white border-r border-neutral-200 flex flex-col items-center py-2 gap-3 flex-shrink-0 hidden lg:flex">
        <img src={metaLogo.src} alt="Meta" className="w-5 h-5 object-contain mb-1" />
        <div className="w-4 h-4 rounded bg-neutral-100" />
        <div className="w-4 h-4 rounded bg-neutral-100" />
        <div className="w-4 h-4 rounded bg-neutral-100" />
        <div className="w-4 h-4 rounded bg-neutral-100" />
        <div className="w-4 h-4 rounded bg-neutral-100" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="px-3 py-2 border-b border-neutral-200 flex items-center gap-2">
          <span className="text-neutral-900 font-semibold text-[12px]">캠페인</span>
          <span className="text-neutral-400 text-[9px]">&#x2295; 픽셀페이지 (927461038204753)</span>
          <span className="bg-[#e8f5e9] text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-full ml-1 font-medium">85</span>
          <span className="text-neutral-400 text-[9px]">광고 최적화 지수</span>
        </div>
        <div className="flex items-center gap-0 px-3 border-b border-neutral-200 text-[10px]">
          <span className="text-[#1877f2] font-medium px-2 py-1.5 border-b-2 border-[#1877f2]">&#x25A0; 모든 광고</span>
          <span className="text-neutral-500 px-2 py-1.5">&#x25B7; 게재 중인 광고</span>
          <span className="text-neutral-500 px-2 py-1.5">&#x2299; 작업</span>
          <span className="text-neutral-500 px-2 py-1.5">&#x2727; 게재됨</span>
          <span className="text-neutral-400 px-2 py-1.5">+ 더 보기</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-neutral-200 flex-wrap">
          <span className="flex items-center gap-1 text-[9px]">
            <span className="text-[#1877f2]">&#x25B2;</span> <strong>캠페인</strong>
            <span className="bg-[#1877f2] text-white text-[8px] px-1.5 py-0.5 rounded ml-0.5">1개 선택함 &#x2715;</span>
          </span>
          <span className="flex items-center gap-1 text-[9px]">
            <span>&#x229E;</span> <strong>광고 세트</strong>
            <span className="bg-[#0e8a6e] text-white text-[8px] px-1.5 py-0.5 rounded ml-0.5">1개 선택함 &#x2715;</span>
          </span>
          <span className="flex items-center gap-1 text-[9px]">
            <span>&#x2610;</span> <strong>광고</strong>
            <span className="bg-[#0e8a6e] text-white text-[8px] px-1.5 py-0.5 rounded ml-0.5">1개 선택함 &#x2715;</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-neutral-200 text-[9px]">
          <span className="bg-[#0e8a6e] text-white px-2 py-1 rounded text-[9px] font-medium">+ 만들기</span>
          <span className="border border-neutral-300 px-2 py-1 rounded text-neutral-600">&#x1F4CB; 복제</span>
          <span className="border border-neutral-300 px-2 py-1 rounded text-neutral-600">&#x270F; 수정</span>
          <span className="border border-neutral-300 px-1.5 py-1 rounded text-neutral-600">&#x1F5D1;</span>
          <span className="border border-neutral-300 px-2 py-1 rounded text-neutral-600">&#x1F170; A/B 테스트</span>
          <span className="border border-neutral-300 px-2 py-1 rounded text-neutral-600">더 보기 &#x25BE;</span>
        </div>
        <div className="grid grid-cols-[16px_20px_1fr_52px_52px_62px_62px_72px_52px] gap-px px-3 py-1.5 bg-[#f5f6f7] border-b border-neutral-200 text-neutral-500 text-[9px] font-medium">
          <span></span><span>해제</span><span>캠페인 &#x21C5;</span><span>게재 &#x2191;</span><span>결과 &#x21C5;</span><span>결과당 비용</span><span>예산 &#x21C5;</span><span>지출 금액 &#x21C5;</span><span>노출 &#x21C5;</span>
        </div>
        {[
          { name: "260412_스피치특강_전환 - B", on: true, results: "122", cost: "\u20A97,816", budget: "\u20A9940,000", spent: "\u20A9953,551", imp: "16,897", checked: true, badge: "추천 2개" },
          { name: "260412_스피치특강_전환", on: true, results: "570", cost: "\u20A94,415", budget: "\u20A9940,000", spent: "\u20A92,516,573", imp: "55,096", checked: false, badge: "추천 2개" },
          { name: "브랜드_인지도_참여", on: true, results: "15,805", cost: "\u20A993", budget: "\u20A910,000", spent: "\u20A91,470,022", imp: "288,562", checked: false, badge: "\u26A0 경고 1개", badgeColor: true },
          { name: "260405_노마드클래스_리타겟", on: false, results: "598", cost: "\u20A96,689", budget: "\u20A91,170,000", spent: "\u20A94,000,000", imp: "80,157", checked: false },
          { name: "260329_B2B_부트캠프 - B", on: false, results: "162", cost: "\u20A96,638", budget: "\u20A91,060,000", spent: "\u20A91,075,355", imp: "21,004", checked: false },
          { name: "260329_B2B_부트캠프", on: false, results: "432", cost: "\u20A96,694", budget: "\u20A9910,000", spent: "\u20A92,891,714", imp: "47,465", checked: false },
          { name: "260322_숏폼_바이럴 - B", on: false, results: "40", cost: "\u20A913,479", budget: "\u20A9690,000", spent: "\u20A9539,156", imp: "9,795", checked: false },
          { name: "260322_숏폼_바이럴", on: false, results: "669", cost: "\u20A96,856", budget: "\u20A91,060,000", spent: "\u20A94,586,756", imp: "99,086", checked: false },
        ].map((c) => (
          <div key={c.name} className={`grid grid-cols-[16px_20px_1fr_52px_52px_62px_62px_72px_52px] gap-px px-3 py-[6px] border-b border-neutral-100 hover:bg-neutral-50 transition-colors text-neutral-700 ${c.checked ? 'bg-[#e7f3ff]' : ''}`}>
            <span className="flex items-center">
              <div className={`w-3 h-3 rounded-sm border flex-shrink-0 ${c.checked ? 'bg-[#1877f2] border-[#1877f2]' : 'border-neutral-300'}`} />
            </span>
            <span className="flex items-center">
              <div className={`w-[18px] h-[10px] rounded-full flex-shrink-0 ${c.on ? 'bg-[#1877f2]' : 'bg-neutral-800'}`}>
                <div className={`w-[8px] h-[8px] rounded-full bg-white mt-[1px] transition-all ${c.on ? 'ml-[9px]' : 'ml-[1px]'}`} />
              </div>
            </span>
            <span className="text-[#0064d1] truncate font-medium">{c.name}</span>
            <span className={`flex items-center gap-0.5 ${c.on ? 'text-emerald-700' : 'text-neutral-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${c.on ? 'bg-emerald-600' : 'bg-neutral-400'}`} />
              {c.on ? '활동 중' : '꺼짐'}
            </span>
            <span className="text-neutral-900">{c.results}</span>
            <span>{c.cost}</span>
            <span>{c.budget}</span>
            <span>{c.spent}</span>
            <span>{c.imp}</span>
          </div>
        ))}
        <div className="px-3 py-1.5 text-neutral-400 text-[9px]">캠페인 281개 결과 &#x24D8;</div>
      </div>
    </div>
  </MacWindow>
);

/* -- 02. 브랜디드: 유튜브 채널 페이지 -- */
const BrandedMockup = () => (
  <MacWindow title="youtube.com/@pixelpage-studio">
    <div className="text-[13px] bg-white">
      <div className="px-5 pt-5 pb-0 border-b border-neutral-200">
        <div className="flex items-center gap-4">
          <img src={charMale.src} alt="PIXELPAGE" className="w-14 h-14 rounded-full object-cover object-[center_20%] flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-neutral-900 font-bold text-[18px] flex items-center gap-1.5">PIXELPAGE Studio <span className="text-neutral-400 text-[14px]">&#x2713;</span></div>
            <div className="text-neutral-500 text-[12px]">@pixelpage-studio &middot; 구독자 2.4만명 &middot; 동영상 86개</div>
            <div className="text-neutral-500 text-[12px] mt-0.5 truncate">무형 서비스 마케팅 전문 채널입니다. 교육&middot;컨설팅&middot;코칭 비즈니스의...</div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button className="bg-neutral-900 text-white text-[13px] px-4 py-1.5 rounded-full font-medium">구독중</button>
          <button className="bg-neutral-100 text-neutral-700 text-[13px] px-4 py-1.5 rounded-full font-medium">가입</button>
        </div>
        <div className="flex gap-6 mt-3 text-[14px]">
          <span className="text-neutral-900 font-semibold border-b-2 border-neutral-900 pb-2.5">동영상</span>
          <span className="text-neutral-500 pb-2.5">Shorts</span>
          <span className="text-neutral-500 pb-2.5">라이브</span>
          <span className="text-neutral-500 pb-2.5">재생목록</span>
          <span className="text-neutral-500 pb-2.5">게시물</span>
        </div>
      </div>
      <div className="px-5 pt-3 pb-2 flex gap-2">
        <span className="bg-neutral-900 text-white text-[12px] px-3 py-1 rounded-lg">최신순</span>
        <span className="bg-neutral-100 text-neutral-700 text-[12px] px-3 py-1 rounded-lg">회원 전용</span>
        <span className="bg-neutral-100 text-neutral-700 text-[12px] px-3 py-1 rounded-lg">공개</span>
      </div>
      <div className="px-5 pb-4 pt-1 grid grid-cols-3 gap-3">
        {[
          { title: "온라인 교육, 왜 안 팔릴까? 마케터가 말하는 3가지 핵심", views: "1.4만회", time: "5시간 전", dur: "20:54", color: "from-rose-400 to-orange-400" },
          { title: "무형 서비스 가격 책정의 비밀 — 고객이 비싸다고 안 느끼게", views: "15만회", time: "7일 전", dur: "15:10", color: "from-blue-400 to-cyan-400" },
          { title: "코칭 사업 매출 6배 만든 브랜딩 전략 대공개", views: "5.9만회", time: "9일 전", dur: "20:37", color: "from-emerald-400 to-teal-400" },
        ].map((v) => (
          <div key={v.title}>
            <div className={`aspect-video rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center relative overflow-hidden`}>
              <Play className="w-8 h-8 text-white/80" />
              <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">{v.dur}</span>
            </div>
            <div className="mt-2 text-neutral-900 text-[12px] font-medium leading-tight line-clamp-2">{v.title}</div>
            <div className="text-neutral-500 text-[11px] mt-1">조회수 {v.views} &middot; {v.time}</div>
          </div>
        ))}
      </div>
    </div>
  </MacWindow>
);

/* -- 03. SEO: 구글 검색 결과 -- */
const SeoMockup = () => (
  <MacWindow title="google.com/search?q=무형+서비스+마케팅">
    <div className="bg-white p-5 lg:p-6 text-[13px]">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-0">
          <span className="text-[20px] font-bold" style={{ color: '#4285f4' }}>G</span>
          <span className="text-[20px] font-bold" style={{ color: '#ea4335' }}>o</span>
          <span className="text-[20px] font-bold" style={{ color: '#fbbc05' }}>o</span>
          <span className="text-[20px] font-bold" style={{ color: '#4285f4' }}>g</span>
          <span className="text-[20px] font-bold" style={{ color: '#34a853' }}>l</span>
          <span className="text-[20px] font-bold" style={{ color: '#ea4335' }}>e</span>
        </div>
        <div className="flex-1 border border-neutral-300 rounded-full px-4 py-2 text-neutral-800 text-[14px] shadow-sm flex items-center">
          무형 서비스 마케팅
          <span className="ml-auto text-neutral-400 text-[16px]">&#x2715;</span>
        </div>
      </div>
      <div className="space-y-5">
        {[
          { favicon: "P", site: "pixelpage.io", url: "https://pixelpage.io \u203A services", title: "무형 서비스 마케팅 전문 — PIXELPAGE", desc: "교육\u00B7컨설팅\u00B7코칭 등 보이지 않는 서비스를 파는 마케팅. 퍼포먼스 광고부터 브랜디드 콘텐츠, SEO, CRM까지 원스톱 마케팅 설계.", color: "bg-violet-100 text-violet-700" },
          { favicon: "P", site: "pixelpage.io", url: "https://pixelpage.io \u203A cases", title: "마케팅 성공 사례 | 매출 6배 성장 비결 — PIXELPAGE", desc: "무형 서비스 업종 마케팅 성공 사례 모음. 온라인 교육 브랜드 A사 매출 6배 성장, 컨설팅 B사 리드 단가 40% 절감 등 실제 데이터 기반 결과.", color: "bg-violet-100 text-violet-700" },
          { favicon: "b", site: "블로그", url: "https://m.blog.naver.com \u203A pixelpage", title: "무형 서비스 마케팅, 어떻게 시작해야 할까? — 네이버 블로그", desc: "무형 서비스란 만질 수 없는 상품을 의미합니다. 교육, 컨설팅, 코칭 등의 서비스는 일반 제품과 다른 마케팅 전략이 필요합니다...", color: "bg-emerald-100 text-emerald-700" },
        ].map((r, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-6 h-6 rounded-full ${r.color} flex items-center justify-center text-[11px] font-bold flex-shrink-0`}>{r.favicon}</div>
              <div className="min-w-0">
                <div className="text-neutral-800 text-[13px] font-medium">{r.site}</div>
                <div className="text-neutral-500 text-[11px] truncate">{r.url}</div>
              </div>
            </div>
            <div className="text-[#1a0dab] text-[16px] leading-snug hover:underline cursor-pointer font-medium">{r.title}</div>
            <div className="text-neutral-600 text-[13px] mt-1 leading-relaxed">{r.desc}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-neutral-200">
        <div className="text-neutral-900 font-semibold text-[15px] mb-2">관련 질문</div>
        {["무형 서비스 마케팅 비용은 얼마인가요?", "교육 사업 마케팅은 어떻게 하나요?", "컨설팅 광고 효과 있나요?"].map((q) => (
          <div key={q} className="flex items-center justify-between py-2.5 border-b border-neutral-100 text-neutral-700 text-[14px]">
            <span>{q}</span>
            <span className="text-neutral-400 text-[12px]">&#x25BE;</span>
          </div>
        ))}
      </div>
    </div>
  </MacWindow>
);

/* -- 04. CRM: 자동화 메시지 관리 -- */
const CrmMockup = () => (
  <MacWindow title="crm-automation.pixelpage.io">
    <div className="p-5 lg:p-6 text-[13px] lg:text-[14px] bg-white">
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "활성 시퀀스", value: "4", icon: Send, color: "text-[#1877f2]" },
          { label: "발송 완료", value: "12,840", icon: CheckCheck, color: "text-emerald-600" },
          { label: "오픈율", value: "68.2%", icon: Eye, color: "text-amber-600" },
          { label: "전환율", value: "4.8%", icon: BarChart3, color: "text-violet-600" },
        ].map((m) => (
          <div key={m.label} className="bg-[#f5f7fa] rounded-lg p-3 border border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[12px] mb-1">
              <m.icon className="w-3.5 h-3.5" />{m.label}
            </div>
            <div className={`font-semibold text-[18px] ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#f5f7fa] rounded-lg p-4 border border-neutral-100">
        <div className="text-neutral-500 text-[12px] uppercase tracking-wider mb-3 font-medium">자동화 퍼널 &middot; 온보딩 시퀀스</div>
        <div className="space-y-0">
          {[
            { step: "1", channel: "카카오", msg: "환영합니다! 무료 체험 안내 \u2192", delay: "즉시", sent: "3,210", rate: "92%", chColor: "bg-[#fee500] text-neutral-800" },
            { step: "2", channel: "이메일", msg: "다른 수강생들의 후기를 확인하세요", delay: "48시간 후", sent: "3,048", rate: "71%", chColor: "bg-blue-50 text-blue-700" },
            { step: "3", channel: "문자", msg: "지금 등록하면 20% 할인!", delay: "7일 후", sent: "2,890", rate: "58%", chColor: "bg-emerald-50 text-emerald-700" },
            { step: "4", channel: "이메일", msg: "마지막 기회 — 내일 마감됩니다", delay: "14일 후", sent: "2,692", rate: "44%", chColor: "bg-blue-50 text-blue-700" },
          ].map((s, i) => (
            <div key={s.step} className="flex items-start gap-3 py-3 border-b border-neutral-100 last:border-0">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[12px] font-bold">{s.step}</div>
                {i < 3 && <div className="w-[1px] h-6 bg-neutral-200 mt-1" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] ${s.chColor} px-2 py-0.5 rounded font-medium`}>{s.channel}</span>
                  <span className="text-[11px] text-neutral-400">{s.delay}</span>
                </div>
                <div className="text-neutral-800 text-[13px] mt-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                  <span className="truncate">{s.msg}</span>
                </div>
              </div>
              <div className="text-right text-[12px] flex-shrink-0">
                <div className="text-neutral-500">{s.sent}건</div>
                <div className="text-emerald-600 font-medium">오픈 {s.rate}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </MacWindow>
);

/* -- 05. 웹 빌드: 실제 코드 -- */
const WebBuildMockup = () => (
  <MacWindow title="landing-page.tsx">
    <div className="p-5 lg:p-6 font-mono text-[13px] lg:text-[14px] leading-[1.85] overflow-x-auto">
      {[
        { text: 'import { Hero, Social, CTA } from "@/components";', color: "text-sky-400" },
        { text: "", color: "" },
        { text: "// 전환 최적화 랜딩 페이지", color: "text-neutral-500" },
        { text: "export default function LandingPage() {", color: "text-amber-400" },
        { text: "  return (", color: "text-neutral-300" },
        { text: '    <main className="conversion-optimized">', color: "text-emerald-400" },
        { text: "      {/* 3초 안에 핵심 가치 전달 */}", color: "text-neutral-500" },
        { text: '      <Hero headline="만질 수 없는 것을 파는 일" />', color: "text-emerald-400" },
        { text: "", color: "" },
        { text: "      {/* 신뢰 지표 — 전환율 +40% */}", color: "text-neutral-500" },
        { text: "      <Social reviews={142} rating={4.9} />", color: "text-emerald-400" },
        { text: "", color: "" },
        { text: "      {/* 명확한 CTA — 이탈 방지 */}", color: "text-neutral-500" },
        { text: '      <CTA label="무료 상담 신청" variant="primary" />', color: "text-emerald-400" },
        { text: "    </main>", color: "text-emerald-400" },
        { text: "  );", color: "text-neutral-300" },
        { text: "}", color: "text-amber-400" },
        { text: "", color: "" },
        { text: "// Lighthouse 98  |  LCP 1.2s  |  전환율 3.2\u00D7 \u2191", color: "text-primary" },
      ].map((line, i) => (
        <div key={i} className={line.color || "text-neutral-300"}>
          {line.text || "\u00A0"}
        </div>
      ))}
    </div>
  </MacWindow>
);

/* -- Services Data -- */
const services = [
  {
    id: "performance", icon: Megaphone, tab: "퍼포먼스",
    name: "퍼포먼스 마케팅", sub: "Performance Marketing",
    desc: "Meta \u00B7 Google \u00B7 토스 \u00B7 당근 \u00B7 TikTok — 주요 광고 플랫폼에서 \u2018구매 의향이 있는 사람\u2019을 정밀하게 찾아냅니다.",
    href: "/services/performance",
    tags: ["Meta Ads", "Google Ads", "토스애즈", "당근마켓", "TikTok"],
    Mockup: PerformanceMockup,
  },
  {
    id: "branded", icon: Video, tab: "브랜디드",
    name: "브랜디드 콘텐츠", sub: "Branded Content",
    desc: "무형을 파는 일은 결국 감각을 번역하는 일입니다. 브랜디드 유튜브와 숏폼으로 24시간 일하는 영업사원을 만듭니다.",
    href: "/services/branded",
    tags: ["브랜디드 유튜브", "숏폼", "광고 소재 제작"],
    Mockup: BrandedMockup,
  },
  {
    id: "seo", icon: Search, tab: "SEO",
    name: "검색엔진 최적화", sub: "SEO",
    desc: "SEO는 돈을 쓰지 않아도 찾아오게 만드는 것입니다. 네이버 생태계 전체를 활용해 콘텐츠 기반 장기 신뢰를 구축합니다.",
    href: "/services/seo",
    tags: ["네이버 SEO", "구글 SEO"],
    Mockup: SeoMockup,
  },
  {
    id: "crm", icon: Mail, tab: "CRM",
    name: "CRM 마케팅", sub: "CRM Automation",
    desc: "퍼포먼스 광고가 관객을 데려온다면, CRM은 그들이 떠나지 않도록 붙잡습니다. 4단계 자동화 퍼널을 설계합니다.",
    href: "/services/crm",
    tags: ["카카오 알림톡", "이메일 시퀀스", "문자 자동화"],
    Mockup: CrmMockup,
  },
  {
    id: "webbuild", icon: Globe, tab: "웹 빌드",
    name: "웹 빌드", sub: "Web Build",
    desc: "보여주기 위한 웹이 아닌, 파는 웹. 전환이 일어나도록 설계합니다.",
    href: "/services/webbuild",
    tags: ["랜딩 페이지", "브랜드 사이트", "엔터프라이즈"],
    Mockup: WebBuildMockup,
  },
];

/* -- Main Section -- */
const ServicesTabSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = services[activeIndex];

  return (
    <section className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center">
          <img src={iconFolder.src} alt="Services" className="w-10 h-10 mb-5 mx-auto" />
          <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em]">
            5가지 서비스,<br />하나의 마케팅 설계.
          </h2>
          <p className="text-[19px] text-muted-foreground mt-4 max-w-[480px] mx-auto leading-[1.9]">
            각각 독립적으로 강하고, 함께할 때 가장 강력합니다.
          </p>
        </Reveal>

        <Reveal className="mt-14">
          <div className="flex flex-wrap justify-center gap-2">
            {services.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === activeIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveIndex(i)}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-[16px] font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-foreground text-background shadow-lg"
                      : "bg-background/60 text-muted-foreground hover:bg-background hover:text-foreground border border-border"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {s.tab}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="mt-12 relative">
          <div className="bg-background/30 backdrop-blur-sm rounded-2xl border border-border p-6 lg:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-10 items-start"
              >
                <active.Mockup />
                <div className="flex flex-col justify-start pt-2">
                  <span className="text-[14px] tracking-[0.15em] uppercase text-muted-foreground">
                    {active.sub}
                  </span>
                  <h3 className="text-[clamp(24px,2.5vw,36px)] font-medium text-foreground mt-2 mb-4">
                    {active.name}
                  </h3>
                  <p className="text-[17px] text-muted-foreground leading-[1.9] mb-6">
                    {active.desc}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {active.tags.map((t) => (
                      <span key={t} className="text-[14px] text-foreground/80 bg-[#e8e5e0] px-4 py-1.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={active.href}
                    className="inline-flex items-center gap-2 text-[16px] font-medium text-primary hover:translate-x-1 transition-transform w-fit"
                  >
                    자세히 보기 <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesTabSection;

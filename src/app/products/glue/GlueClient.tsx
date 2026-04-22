"use client";

import { ArrowRight, ArrowLeft, Users, Mail, MessageSquare, BarChart3, Zap, Target, Database, FileText, Globe, Link2, Bell, Send, Layers } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/Reveal";

const GlueClient = () => (
  <div>
    {/* Hero */}
    <section className="pt-32 pb-24 lg:pb-32 bg-[#0a0f1e] text-white">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-white/50 hover:text-blue-500 transition-colors mb-10">
          <ArrowLeft className="w-3 h-3" /> 홈으로
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <p className="text-[13px] tracking-[0.25em] uppercase text-blue-500 mb-6">Product · gloooo</p>
            <h1 className="break-keep text-[clamp(36px,6vw,72px)] font-bold text-white leading-[1.12] tracking-[-0.03em] mb-6">
              글루<span className="text-blue-500">.</span>
            </h1>
            <p className="text-[22px] text-white/90 font-medium leading-[1.6] mb-4">
              리드 수집부터 메시지 발송까지,<br />한 곳에서.
            </p>
            <p className="text-[17px] text-white/50 leading-[1.85] max-w-[480px] mb-8">
              리드를 모으고, 그룹으로 관리하고, 문자 · 알림톡 · 친구톡 · 이메일을 자동 발송하는 올인원 CRM SaaS.<br />
              복잡한 도구 없이 5분 안에 첫 시나리오를 시작하세요.
            </p>
            <div className="flex flex-wrap gap-2">
              {["리드 수집", "메시지 캠페인", "CRM 시나리오", "성과 분석"].map(t => (
                <span key={t} className="text-[12px] text-white/50 bg-white/10 border border-white/15 px-3 py-1 rounded-full">{t}</span>
              ))}
            </div>
          </Reveal>
          <div className="hidden lg:flex justify-center items-center relative h-[400px]">
            <div className="relative">
              <div className="w-[200px] h-[200px] rounded-full bg-blue-500/20 blur-[60px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="relative z-10 grid grid-cols-2 gap-4">
                {[
                  { icon: Target, label: "리드 수집" },
                  { icon: Database, label: "리드 관리" },
                  { icon: Send, label: "메시지 발송" },
                  { icon: BarChart3, label: "성과 분석" },
                ].map((item, i) => (
                  <div key={i} className={`w-[140px] h-[100px] border border-white/15 rounded-lg bg-[#0a0f1e]/80 backdrop-blur flex flex-col items-center justify-center gap-2 animate-float stagger-${i + 1}`}>
                    <item.icon className="w-5 h-5 text-blue-500" />
                    <span className="text-[12px] text-white/50">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="absolute top-[50px] left-[140px] w-4 h-px bg-blue-500/30" />
              <div className="absolute top-[150px] left-[140px] w-4 h-px bg-blue-500/30" />
              <div className="absolute left-[70px] top-[100px] w-px h-4 bg-blue-500/30" />
              <div className="absolute left-[214px] top-[100px] w-px h-4 bg-blue-500/30" />
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* KPI */}
    <section className="py-16 border-t border-[#e5e7eb]" style={{ background: "#fbfbfb" }}>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="flex flex-wrap justify-between gap-8">
          {[
            { n: "5", u: "min", l: "첫 시나리오 셋업" },
            { n: "4", u: "ch", l: "멀티채널 발송" },
            { n: "D+N", u: "", l: "자동 시퀀스" },
            { n: "24/7", u: "", l: "자동 메시지 발송" },
          ].map(k => (
            <div key={k.l} className="text-center">
              <span className="text-[36px] font-normal text-foreground tracking-[-0.02em]">{k.n}<span className="text-[16px] text-muted-foreground ml-0.5">{k.u}</span></span>
              <span className="block text-[11px] text-muted-foreground tracking-[0.08em] uppercase mt-1">{k.l}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* Why */}
    <section className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="text-[13px] tracking-[0.25em] uppercase text-blue-500 mb-6">왜 글루인가요?</p>
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em] mb-8 max-w-[600px]">
            광고로 데려온 리드,<br />엑셀에서 관리하고 계신가요?
          </h2>
        </Reveal>
        <div className="mt-3 mb-12 w-16 h-px bg-blue-500" />
        <Reveal>
          <div className="max-w-[720px] space-y-6">
            <p className="text-[18px] text-muted-foreground leading-[1.85]">
              Facebook 리드 광고, 랜딩 페이지 폼, Google Sheets — 리드가 들어오는 경로는 다양한데, 관리는 여전히 수동입니다. 엑셀에 복붙하고, 한 명씩 문자 보내고, 누구한테 뭘 보냈는지 기억에 의존합니다. 리드가 100개를 넘는 순간, 이 방식은 무너집니다.
            </p>
            <p className="text-[18px] text-muted-foreground leading-[1.85]">
              <strong className="text-foreground font-medium">글루는 이 전체 과정을 하나로 묶습니다.</strong> 리드가 수집되는 순간 자동으로 그룹 분류되고, 설계해 둔 시나리오에 따라 문자 · 알림톡 · 친구톡 · 이메일이 자동 발송됩니다. 복잡한 마케팅 도구 없이, 5분이면 시작할 수 있습니다.
            </p>
          </div>
        </Reveal>
      </div>
    </section>

    {/* Core Features */}
    <section className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="text-[13px] tracking-[0.25em] uppercase text-blue-500 mb-6">핵심 기능</p>
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em]">
            글루가 하는 일
          </h2>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[
            { icon: Target, t: "스마트 리드 수집", d: "Facebook 리드 광고, Google Sheets, 웹훅, 커스텀 폼 — 4가지 채널에서 리드를 자동으로 수집합니다. 유입 소스가 자동 태그됩니다." },
            { icon: Users, t: "리드 관리 · 그룹", d: "수집된 리드를 한 곳에서 관리합니다. 커스텀 그룹으로 세그먼트하고, 상태별 · 소스별로 필터링합니다. 이름, 연락처, 이메일을 변수로 활용합니다." },
            { icon: Globe, t: "랜딩페이지 · 폼 빌더", d: "코드 없이 리드 수집 랜딩페이지와 폼을 직접 만듭니다. 이미지 업로드, 커스텀 필드, 공개 URL 생성까지 — 광고 랜딩으로 바로 연결합니다." },
            { icon: Send, t: "멀티채널 메시지 캠페인", d: "문자(SMS/LMS), 카카오 알림톡, 친구톡, 이메일을 한 곳에서 발송합니다. 전체 리드, 특정 그룹, 특정 소스 등 유연한 수신자 타겟팅을 지원합니다." },
            { icon: Zap, t: "CRM 시나리오 자동화", d: "D+0, D+1, D+2 — 리드 등록일 기준으로 자동 시퀀스를 설계합니다. 리드가 수집되면 자동 등록되어 순차적으로 메시지가 발송됩니다." },
            { icon: BarChart3, t: "성과 분석 대시보드", d: "총 리드 수, 발송 메시지 수, 성공률, 시나리오 완료율을 실시간 추적합니다. 일별 발송 트렌드와 채널별 분포를 차트로 확인합니다." },
          ].map(f => (
            <div key={f.t} className="border border-[#e5e7eb] rounded-2xl p-7 hover:shadow-md transition-shadow shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-5">
                <f.icon className="w-5 h-5 text-blue-500" />
              </div>
              <h4 className="text-[15px] font-medium text-foreground mb-3">{f.t}</h4>
              <p className="text-[14px] text-muted-foreground leading-[1.9]">{f.d}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* How it works */}
    <section className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="text-[13px] tracking-[0.25em] uppercase text-blue-500 mb-6">작동 방식</p>
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em]">
            5분이면 시작합니다
          </h2>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {[
            { s: "01", t: "리드 수집 연결", d: "Facebook 광고, Google Sheets, 웹훅, 또는 글루 폼 빌더를 연결합니다. 리드가 자동으로 들어오기 시작합니다." },
            { s: "02", t: "그룹 · 세그먼트", d: "수집된 리드를 그룹으로 분류합니다. 소스별, 관심사별, 상태별로 나누어 타겟팅 정밀도를 높입니다." },
            { s: "03", t: "시나리오 설계", d: "D+0에 알림톡, D+1에 이메일, D+3에 문자 — 일자별 자동 시퀀스를 만듭니다. 리드 등록 시 자동 발동됩니다." },
            { s: "04", t: "발송 · 분석", d: "메시지가 자동 발송되고, 대시보드에서 성공률과 시나리오 완료율을 실시간으로 확인합니다." },
          ].map(p => (
            <div key={p.s} className="border-t-2 border-blue-500 pt-8 pr-8 pb-8">
              <span className="text-[13px] text-blue-500 tracking-[0.1em]">{p.s}</span>
              <h3 className="text-[18px] font-medium text-foreground mt-4 mb-4">{p.t}</h3>
              <p className="text-[15px] text-muted-foreground leading-[2]">{p.d}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* Lead Collection Channels */}
    <section className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="text-[13px] tracking-[0.25em] uppercase text-blue-500 mb-6">리드 수집</p>
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em]">
            리드가 들어오는 4가지 경로
          </h2>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { icon: Layers, name: "Facebook 리드 광고", desc: "Facebook 리드 광고에서 수집된 리드를 자동 연동합니다. 광고 캠페인과 실시간으로 동기화됩니다." },
            { icon: FileText, name: "Google Sheets", desc: "Google Sheets에서 리드 데이터를 자동으로 가져옵니다. 기존에 쌓아둔 데이터도 바로 활용할 수 있습니다." },
            { icon: Link2, name: "웹훅 연동", desc: "외부 서비스에서 웹훅 URL로 리드를 자동 전송합니다. 어떤 폼 빌더, 어떤 서비스와도 연결됩니다." },
            { icon: Globe, name: "글루 폼 빌더", desc: "직접 리드 수집 폼을 만들어 랜딩페이지에 연결합니다. 커스텀 필드, 이미지 업로드, 공개 URL까지 지원합니다." },
          ].map(p => (
            <div key={p.name} className="border border-[#e5e7eb] rounded-2xl p-7 hover:shadow-md transition-shadow shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <p.icon className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-[16px] font-medium text-foreground">{p.name}</span>
              </div>
              <p className="text-[14px] text-muted-foreground leading-[1.9]">{p.desc}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* Message Channels */}
    <section className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="text-[13px] tracking-[0.25em] uppercase text-blue-500 mb-6">메시지 채널</p>
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em]">
            4가지 채널, 하나의 발송
          </h2>
          <p className="text-[18px] text-muted-foreground mt-5 max-w-[520px] leading-[1.85]">
            캠페인이든 시나리오든, 한 곳에서 모든 채널로 발송합니다.
          </p>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: MessageSquare, name: "문자 SMS/LMS", desc: "짧은 한 줄로 즉각적인 행동을 유도합니다. 프로모션, 마감 안내에 최적입니다." },
            { icon: Bell, name: "카카오 알림톡", desc: "승인된 템플릿 기반. 예약 확인, 결제 안내 등 중요 메시지를 90%+ 오픈율로 전달합니다." },
            { icon: Send, name: "카카오 친구톡", desc: "브랜드 채널을 통한 마케팅 메시지. 이미지와 버튼을 활용한 풍부한 콘텐츠를 발송합니다." },
            { icon: Mail, name: "이메일", desc: "뉴스레터, 프로모션, 교육 시퀀스 등 세그먼트별 맞춤 메시지를 발송합니다." },
          ].map(p => (
            <div key={p.name} className="border border-[#e5e7eb] rounded-2xl p-6 hover:shadow-sm transition-shadow shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-blue-500" />
              </div>
              <span className="block text-[14px] font-medium text-foreground mb-2">{p.name}</span>
              <p className="text-[14px] text-muted-foreground leading-[1.9]">{p.desc}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* Use cases */}
    <section className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="text-[13px] tracking-[0.25em] uppercase text-blue-500 mb-6">활용 사례</p>
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em]">
            이런 상황이라면, 글루
          </h2>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { t: "광고는 돌리는데, 리드가 엑셀에 쌓이기만 할 때", d: "Facebook 리드 광고나 폼에서 들어온 데이터를 수동으로 옮기느라 시간을 쓰고 계신다면 — 글루가 자동으로 수집하고 분류합니다." },
            { t: "한 명씩 문자 보내기가 한계에 부딪혔을 때", d: "리드 100명에게 같은 메시지를 보내려면 반나절이 걸립니다. 글루에서 그룹 선택 후 한 번에 발송하세요." },
            { t: "상담 후 후속 메시지를 까먹을 때", d: "D+1에 감사 메시지, D+3에 후기 요청, D+7에 프로모션 안내 — 시나리오를 한 번 만들면 글루가 자동으로 보냅니다." },
            { t: "발송 성과를 한눈에 보고 싶을 때", d: "문자, 알림톡, 친구톡, 이메일의 성공률과 시나리오 완료율을 대시보드 하나에서 실시간으로 확인합니다." },
          ].map(item => (
            <div key={item.t} className="border border-[#e5e7eb] rounded-2xl p-8 hover:shadow-md transition-shadow shadow-sm">
              <h4 className="text-[16px] font-medium text-foreground mb-3">{item.t}</h4>
              <p className="text-[15px] text-muted-foreground leading-[1.9]">{item.d}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* CTA */}
    <section className="py-28 lg:py-36 text-center" style={{ background: "#ffffff" }}>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="text-[13px] tracking-[0.25em] uppercase text-blue-500 mb-6">도입 문의</p>
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em] mb-4">
            글루, 우리 브랜드에도 될까?
          </h2>
          <p className="text-[18px] text-muted-foreground mb-10 max-w-[480px] mx-auto leading-[1.85]">
            현재 리드 관리 방식과 발송 규모를 함께 진단하고,<br />우리 브랜드에 맞는 글루 활용 시나리오를 제안드립니다.
          </p>
          <Link href="/consult" className="inline-flex items-center gap-2 px-9 py-4 bg-[#0a0f1e] text-white text-[14px] font-bold rounded-xl tracking-[0.05em] hover:bg-[#0a0f1e]/80 transition-all hover:-translate-y-0.5">
            도입 문의하기 <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  </div>
);

export default GlueClient;

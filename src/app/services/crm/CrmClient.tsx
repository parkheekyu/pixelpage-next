"use client";

import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import illustCrm from "@/assets/illust-crm.png";

const CrmClient = () => (
  <div>
    {/* Hero */}
    <section className="pt-32 pb-24 lg:pb-32 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary transition-colors mb-10">
          <ArrowLeft className="w-3 h-3" /> 홈으로
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">04 · CRM Marketing</p>
            <h1 className="font-serif break-keep text-[clamp(36px,5vw,64px)] font-medium text-foreground leading-[1.15] tracking-[-0.02em] mb-6">
              CRM 마케팅
            </h1>
            <p className="text-[17px] text-muted-foreground leading-[1.85] max-w-[480px] mb-8">
              리드 수집부터 육성, 전환, 그리고 팬덤 설계까지. <strong className="text-foreground font-medium">관객이 브랜드를 발견한 순간부터 충성 고객이 되는 전 과정을 함께 만듭니다.</strong>
            </p>
            <div className="flex flex-wrap gap-2">
              {["카카오 알림톡", "이메일 시퀀스", "문자 자동화"].map(t => (
                <span key={t} className="text-[12px] text-muted-foreground bg-secondary border border-border px-3 py-1 rounded-full">{t}</span>
              ))}
            </div>
          </Reveal>
          <div className="hidden lg:flex justify-center">
            <img src={illustCrm.src} alt="CRM 마케팅" className="w-[300px] animate-float" loading="lazy" />
          </div>
        </div>
      </div>
    </section>

    {/* Why CRM */}
    <section className="py-32 lg:py-40 bg-dark text-cream">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">왜 CRM인가요?</p>
          <h2 className="font-serif break-keep text-[clamp(28px,4vw,48px)] font-medium text-cream leading-[1.15] tracking-[-0.02em] mb-8 max-w-[600px]">
            광고비의 70%는<br />&apos;관심만 있는 사람&apos;에게 쓰입니다.
          </h2>
        </Reveal>
        <div className="mt-3 mb-12 w-16 h-px bg-primary" />
        <Reveal>
          <div className="max-w-[720px] space-y-6">
            <p className="text-[16px] text-cream/70 leading-[2]">
              무형 서비스의 구매 여정은 깁니다. 광고를 클릭하고 &apos;괜찮은데?&apos;라고 생각했지만, 바로 구매하지는 않습니다. 이 과정에서 대부분의 잠재 고객이 이탈합니다.
            </p>
            <p className="text-[16px] text-cream/70 leading-[2]">
              PIXELPAGE는 이 전 과정을 설계합니다. 리드를 어디서 모을지, 어떤 메시지로 육성할지, 언제 전환시킬지, 그리고 <strong className="text-cream font-medium">한 번 온 고객이 팬이 되는 구조</strong>까지 함께 만듭니다.
            </p>
          </div>
        </Reveal>
      </div>
    </section>

    {/* 4-step funnel */}
    <section className="py-32 lg:py-40 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">CRM Flow</p>
          <h2 className="font-serif break-keep text-[clamp(28px,4vw,48px)] font-medium text-foreground leading-[1.15] tracking-[-0.02em]">
            리드 수집부터 팬덤 설계까지, 4단계
          </h2>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {[
            { s: "01", t: "리드 수집", d: "광고 클릭 → 랜딩 → 폼 작성 → DB 자동 연동. 유입 소스별로 리드를 자동 분류합니다." },
            { s: "02", t: "육성 자동화", d: "카카오 알림톡 → 이메일 → 문자 시퀀스가 자동 발동. 행동과 관심사에 따라 메시지가 분기됩니다." },
            { s: "03", t: "전환 최적화", d: "메시지 A/B 테스트, 발송 시간 최적화, CTA 문구 테스트를 자동으로 실행합니다." },
            { s: "04", t: "리텐션 · 팬덤", d: "수강 완료 후 후속 안내, VIP 혜택, 추천인 리워드 등 장기 관계를 설계합니다." },
          ].map(p => (
            <div key={p.s} className="border-t-2 border-primary pt-8 pr-8 pb-8">
              <span className="text-[13px] font-display text-primary tracking-[0.1em]">{p.s}</span>
              <h3 className="text-[18px] font-medium text-foreground mt-4 mb-4">{p.t}</h3>
              <p className="text-[15px] text-muted-foreground leading-[2]">{p.d}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* Channels */}
    <section className="py-32 lg:py-40 bg-dark text-cream">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">Channels & Tools</p>
          <h2 className="font-serif break-keep text-[clamp(28px,4vw,48px)] font-medium text-cream leading-[1.15] tracking-[-0.02em]">
            어떤 채널과 도구를 사용하나요?
          </h2>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { t: "카카오 알림톡", d: "국내 메시지 채널 중 가장 높은 90%+ 오픈율. 예약 확인, 결제 안내 등 중요한 메시지를 전달합니다." },
            { t: "이메일 마케팅", d: "뉴스레터, 프로모션, 교육 시퀀스 등 세그먼트별 맞춤 메시지를 설계합니다." },
            { t: "문자 (SMS/LMS)", d: "짧은 한 줄로 즉각적인 행동을 유도합니다. 시간 민감한 프로모션에 최적입니다." },
            { t: "푸시 알림", d: "장바구니 이탈, 수강 미완료 등 실시간 리인게이지먼트에 활용합니다." },
            { t: "리드 대시보드", d: "리드 상태, 채널별 전환율, 시퀀스별 성과를 한눈에 볼 수 있습니다." },
            { t: "A/B 테스트 자동화", d: "메시지 문구, 발송 타이밍, CTA를 자동으로 테스트하고 승자 버전을 채택합니다." },
          ].map(f => (
            <div key={f.t} className="border border-cream/10 rounded-lg p-6 hover:bg-cream/5 transition-colors">
              <h4 className="text-[15px] font-medium text-cream mb-2">{f.t}</h4>
              <p className="text-[14px] text-cream/55 leading-[1.9]">{f.d}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* Use cases */}
    <section className="py-32 lg:py-40 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">Use Cases</p>
          <h2 className="font-serif break-keep text-[clamp(28px,4vw,48px)] font-medium text-foreground leading-[1.15] tracking-[-0.02em]">
            이런 상황에서 효과적입니다
          </h2>
        </Reveal>
        <Reveal className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { t: "광고는 돌리는데, 구매까지 이어지지 않을 때", d: "관심을 보인 사람에게 적절한 타이밍에 후속 메시지를 보내면 전환율이 2-3배 올라갑니다." },
            { t: "한 번 온 고객이 재구매하지 않을 때", d: "수강 완료 시점에 맞춰 후속 과정을 안내하면 고객 생애가치(LTV)가 크게 올라갑니다." },
            { t: "리드는 많은데, 수동으로 관리가 안 될 때", d: "CRM 자동화를 도입하면 리드 관리 시간을 90% 줄이면서 전환율은 높일 수 있습니다." },
            { t: "여러 채널의 성과를 통합해서 보고 싶을 때", d: "다양한 채널에서 유입되는 리드를 하나의 대시보드에서 통합 관리합니다." },
          ].map(item => (
            <div key={item.t} className="border border-border rounded-lg p-8 hover:shadow-card-hover transition-shadow">
              <h4 className="text-[16px] font-medium text-foreground mb-3">{item.t}</h4>
              <p className="text-[15px] text-muted-foreground leading-[1.9]">{item.d}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 bg-dark text-center">
      <div className="max-w-[1240px] mx-auto px-6">
        <Reveal>
          <h2 className="font-serif break-keep text-[clamp(24px,3vw,36px)] font-medium text-cream mb-4">리드 수집부터 팬덤까지, 함께 설계할까요?</h2>
          <p className="text-[15px] text-cream/60 mb-8 max-w-[440px] mx-auto leading-[1.9]">무료 상담에서 현재 고객 여정을 진단하고, 우리 브랜드에 맞는 CRM 전략을 제안드립니다.</p>
          <Link href="/consult" className="inline-flex items-center gap-2 px-9 py-4 bg-primary text-primary-foreground text-[14px] font-bold tracking-[0.05em] hover:bg-gold-light transition-all hover:-translate-y-0.5">
            무료 상담 신청 <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  </div>
);

export default CrmClient;

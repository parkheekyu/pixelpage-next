"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const WEBHOOK_URL = "https://heekyu.app.n8n.cloud/webhook/fb10c3b0-a33e-4996-a25e-9f070184efb5";

const services = [
  { id: "performance", label: "퍼포먼스 마케팅" },
  { id: "branded", label: "브랜디드 콘텐츠" },
  { id: "seo", label: "검색엔진 최적화 (SEO)" },
  { id: "crm", label: "CRM 마케팅" },
  { id: "webbuild", label: "웹 빌드" },
  { id: "unsure", label: "아직 잘 모르겠어요" },
];

const ConsultClient = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [marketingStatus, setMarketingStatus] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name,
      company,
      phone,
      email,
      category,
      marketingStatus,
      budget,
      services: selectedServices.map((id) => services.find((s) => s.id === id)?.label ?? id),
      message,
      submittedAt: new Date().toISOString(),
    };

    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // 웹훅 실패해도 사용자에게는 완료 화면을 보여줌
    }

    setSubmitting(false);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return (
      <div>
        <section className="min-h-screen flex items-center pt-32 pb-20 bg-background">
          <div className="max-w-[1240px] mx-auto px-6 lg:px-12 w-full text-center">
            <Reveal>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-serif break-keep text-[clamp(32px,5vw,56px)] font-normal text-foreground leading-[1.15] tracking-[-0.02em] mb-6">
                신청이 완료되었습니다.
              </h1>
              <p className="text-[17px] text-muted-foreground leading-[1.85] max-w-[460px] mx-auto mb-10">
                보통 24시간 이내에 담당자가 연락드립니다.<br />
                빠른 상담이 필요하시면 아래 이메일로 직접 문의해 주세요.
              </p>
              <a href="mailto:contact@pixelpage.co.kr" className="block font-serif text-[20px] text-foreground hover:text-primary transition-colors mb-10">
                contact@pixelpage.co.kr
              </a>
              <Link href="/" className="inline-flex items-center gap-2 text-[14px] font-medium text-primary hover:translate-x-[-2px] transition-transform">
                <ArrowLeft className="w-4 h-4" /> 홈으로 돌아가기
              </Link>
            </Reveal>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="pt-32 pb-24 lg:pb-32 bg-dark text-cream">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-cream/50 hover:text-primary transition-colors mb-10">
            <ArrowLeft className="w-3 h-3" /> 홈으로
          </Link>
          <Reveal>
            <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">Free Consultation</p>
            <h1 className="font-serif break-keep text-[clamp(36px,5vw,64px)] font-normal text-cream leading-[1.15] tracking-[-0.02em] mb-6">
              무료 상담 신청
            </h1>
            <p className="text-[17px] text-cream/70 leading-[1.85] max-w-[520px]">
              지금 당장 계약이 목표가 아닙니다.<br />
              브랜드를 함께 진단하고, 어떻게 팔 수 있는지<br />
              생각해 보는 것부터 시작합니다.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Form */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-20">

            {/* Left: Form */}
            <form onSubmit={handleSubmit}>
              {/* 기본 정보 */}
              <Reveal>
                <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">01 · 기본 정보</p>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13px] font-medium text-foreground mb-2">이름 / 담당자명 *</label>
                      <Input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="홍길동"
                        className="h-12 border-border bg-background text-[15px] placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-foreground mb-2">브랜드 / 회사명 *</label>
                      <Input
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="픽셀페이지"
                        className="h-12 border-border bg-background text-[15px] placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13px] font-medium text-foreground mb-2">연락처 *</label>
                      <Input
                        required
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="010-0000-0000"
                        className="h-12 border-border bg-background text-[15px] placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-foreground mb-2">이메일 *</label>
                      <Input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="h-12 border-border bg-background text-[15px] placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* 브랜드 정보 */}
              <Reveal className="mt-16">
                <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">02 · 브랜드 정보</p>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[13px] font-medium text-foreground mb-2">업종 / 카테고리 *</label>
                    <Select required onValueChange={setCategory}>
                      <SelectTrigger className="h-12 border-border bg-background text-[15px]">
                        <SelectValue placeholder="선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="교육 (온·오프라인)">교육 (온·오프라인)</SelectItem>
                        <SelectItem value="코칭 · 컨설팅">코칭 · 컨설팅</SelectItem>
                        <SelectItem value="체험 · 문화 · 여행">체험 · 문화 · 여행</SelectItem>
                        <SelectItem value="지식 서비스 · B2B">지식 서비스 · B2B</SelectItem>
                        <SelectItem value="건강 · 뷰티 · 웰니스">건강 · 뷰티 · 웰니스</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-foreground mb-2">현재 마케팅 상황</label>
                    <Select onValueChange={setMarketingStatus}>
                      <SelectTrigger className="h-12 border-border bg-background text-[15px]">
                        <SelectValue placeholder="선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="마케팅을 아직 해본 적 없어요">마케팅을 아직 해본 적 없어요</SelectItem>
                        <SelectItem value="자체적으로 하고 있어요">자체적으로 하고 있어요</SelectItem>
                        <SelectItem value="다른 대행사와 일하고 있어요">다른 대행사와 일하고 있어요</SelectItem>
                        <SelectItem value="이전에 했지만 지금은 중단">이전에 했지만 지금은 중단</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-foreground mb-2">월 예상 마케팅 예산</label>
                    <Select onValueChange={setBudget}>
                      <SelectTrigger className="h-12 border-border bg-background text-[15px]">
                        <SelectValue placeholder="선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100만 원 이하">100만 원 이하</SelectItem>
                        <SelectItem value="100 ~ 300만 원">100 ~ 300만 원</SelectItem>
                        <SelectItem value="300 ~ 500만 원">300 ~ 500만 원</SelectItem>
                        <SelectItem value="500 ~ 1,000만 원">500 ~ 1,000만 원</SelectItem>
                        <SelectItem value="1,000만 원 이상">1,000만 원 이상</SelectItem>
                        <SelectItem value="아직 정하지 않았어요">아직 정하지 않았어요</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Reveal>

              {/* 관심 서비스 */}
              <Reveal className="mt-16">
                <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">03 · 관심 서비스</p>
                <p className="text-[14px] text-muted-foreground mb-5">관심 있는 서비스를 모두 선택해주세요. (복수 선택 가능)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleService(s.id)}
                      className={`flex items-center gap-3 px-5 py-4 border rounded-lg text-left transition-all ${
                        selectedServices.includes(s.id)
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-foreground/30"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        selectedServices.includes(s.id) ? "border-primary bg-primary" : "border-foreground/20"
                      }`}>
                        {selectedServices.includes(s.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <span className="text-[14px] font-medium">{s.label}</span>
                    </button>
                  ))}
                </div>
              </Reveal>

              {/* 추가 메시지 */}
              <Reveal className="mt-16">
                <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">04 · 추가 메시지</p>
                <div>
                  <label className="block text-[13px] font-medium text-foreground mb-2">
                    브랜드 소개, 고민, 원하시는 방향 등 자유롭게 적어주세요.
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="예: 온라인 교육 브랜드를 운영 중인데, 광고를 해본 적이 없어서 어디서부터 시작해야 할지 모르겠습니다."
                    className="min-h-[160px] border-border bg-background text-[15px] placeholder:text-muted-foreground/50 leading-[1.8]"
                  />
                </div>
              </Reveal>

              {/* Submit */}
              <Reveal className="mt-14">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground text-[14px] font-bold tracking-[0.05em] hover:bg-gold-light transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {submitting ? "전송 중..." : "상담 신청하기"} {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
                <p className="text-[13px] text-muted-foreground mt-4">
                  보통 24시간 이내에 담당자가 연락드립니다.
                </p>
              </Reveal>
            </form>

            {/* Right: Side info */}
            <div className="hidden lg:block">
              <Reveal>
                <div className="sticky top-32 space-y-8">
                  <div className="border border-border rounded-lg p-8">
                    <h3 className="font-serif text-[20px] font-normal text-foreground mb-4">상담은 이렇게 진행됩니다</h3>
                    <div className="space-y-5">
                      {[
                        { s: "01", t: "신청서 확인", d: "작성해 주신 내용을 바탕으로 브랜드를 사전 분석합니다." },
                        { s: "02", t: "담당자 배정", d: "업종과 니즈에 맞는 담당자가 배정됩니다." },
                        { s: "03", t: "진단 미팅", d: "30분 내외의 무료 진단 미팅을 진행합니다." },
                        { s: "04", t: "전략 제안", d: "최적의 서비스 조합과 예산안을 제안드립니다." },
                      ].map((step) => (
                        <div key={step.s} className="flex gap-4">
                          <span className="text-[12px] font-display text-primary tracking-[0.1em] mt-0.5 flex-shrink-0">{step.s}</span>
                          <div>
                            <h4 className="text-[14px] font-medium text-foreground mb-1">{step.t}</h4>
                            <p className="text-[13px] text-muted-foreground leading-[1.8]">{step.d}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-border rounded-lg p-8">
                    <h3 className="font-serif text-[20px] font-normal text-foreground mb-3">직접 연락하기</h3>
                    <p className="text-[14px] text-muted-foreground leading-[1.8] mb-4">
                      폼 대신 이메일로 바로 문의하셔도 됩니다.
                    </p>
                    <a href="mailto:contact@pixelpage.co.kr" className="text-[15px] font-medium text-primary hover:underline">
                      contact@pixelpage.co.kr
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default ConsultClient;

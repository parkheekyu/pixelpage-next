"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Star, Users, Zap, Shield, ChevronRight, Play, Quote } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/Reveal";

/* ============================================================
   DEMO LANDING PAGE — "MindFlow Academy"
   가상의 온라인 교육 브랜드 웹사이트 샘플
   PIXELPAGE 웹 빌드 서비스가 만드는 결과물을 보여줍니다.
   ============================================================ */

const DemoClient = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen">
      {/* Back to PIXELPAGE banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground text-center py-2 text-[13px] font-medium">
        이 페이지는 PIXELPAGE 웹 빌드 샘플입니다.{" "}
        <Link href="/services/webbuild" className="underline font-bold ml-1">웹 빌드 서비스 보기 &rarr;</Link>
      </div>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center pt-20 pb-20 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[15%] right-[10%] w-[400px] h-[400px] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-[1200px] mx-auto w-full px-6 lg:px-12 pt-12">
          <div className="text-center max-w-[800px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[13px] text-white/60">2026 신규 기수 모집중</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[clamp(40px,6vw,76px)] font-bold leading-[1.1] tracking-[-0.03em] mb-7"
            >
              생각하는 방식을<br />
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">완전히 바꾸는</span> 교육
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[18px] text-white/50 leading-[1.8] max-w-[540px] mx-auto mb-10"
            >
              12주 안에 사고의 프레임을 리셋합니다. 1,200명의 수료생이 증명한 커리큘럼.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center justify-center gap-4"
            >
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0a0a0a] text-[16px] font-semibold rounded-xl hover:bg-white/90 transition-all">
                무료 체험 신청 <ArrowRight className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-4 border border-white/20 text-white/70 text-[16px] rounded-xl hover:bg-white/5 transition-all">
                <Play className="w-4 h-4" /> 소개 영상
              </button>
            </motion.div>

            {/* Trust numbers */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center justify-center gap-10 mt-16"
            >
              {[
                { n: "1,200+", l: "수료생" },
                { n: "97%", l: "만족도" },
                { n: "4.9", l: "평균 평점" },
              ].map(k => (
                <div key={k.l} className="text-center">
                  <span className="text-[28px] font-bold text-white tracking-[-0.02em]">{k.n}</span>
                  <span className="block text-[12px] text-white/30 mt-1">{k.l}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── PAIN ─── */}
      <section className="py-24 bg-[#0f0f0f]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <Reveal className="text-center mb-14">
            <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-[1.2] tracking-[-0.02em]">
              이런 고민,<br /><span className="text-white/40">혼자 하고 계셨죠?</span>
            </h2>
          </Reveal>

          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[700px] mx-auto">
              {[
                "책은 많이 읽는데 적용이 안 됩니다",
                "강의를 들어도 다음 날이면 잊어버립니다",
                "혼자 공부하니 방향을 모르겠습니다",
                "실무에 바로 쓸 수 있는 게 없습니다",
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-violet-400" />
                  </div>
                  <span className="text-[15px] text-white/70">{t}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <Reveal className="text-center mb-16">
            <span className="text-[13px] text-violet-400 font-semibold tracking-[0.1em] uppercase mb-4 block">Features</span>
            <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-[1.2] tracking-[-0.02em]">
              왜 MindFlow인가
            </h2>
          </Reveal>

          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <Zap className="w-6 h-6" />, t: "12주 집중 커리큘럼", d: "이론이 아닌 실전. 매주 과제와 피드백으로 사고 체계를 리셋합니다.", color: "from-violet-500/20 to-violet-600/5" },
                { icon: <Users className="w-6 h-6" />, t: "소규모 코호트", d: "15명 이하 그룹. 동료와 함께 성장하고, 멘토가 1:1로 피드백합니다.", color: "from-blue-500/20 to-blue-600/5" },
                { icon: <Shield className="w-6 h-6" />, t: "100% 환불 보장", d: "2주 안에 만족하지 못하면 전액 환불. 리스크 없이 시작하세요.", color: "from-emerald-500/20 to-emerald-600/5" },
              ].map(f => (
                <div key={f.t} className={`bg-gradient-to-b ${f.color} border border-white/[0.06] rounded-2xl p-8`}>
                  <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center mb-6 text-white/70">
                    {f.icon}
                  </div>
                  <h3 className="text-[18px] font-semibold mb-3">{f.t}</h3>
                  <p className="text-[15px] text-white/45 leading-[1.8]">{f.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 bg-[#0f0f0f]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <Reveal className="text-center mb-14">
            <span className="text-[13px] text-violet-400 font-semibold tracking-[0.1em] uppercase mb-4 block">Reviews</span>
            <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-[1.2] tracking-[-0.02em]">
              수료생이 직접 말합니다
            </h2>
          </Reveal>

          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "김서연", role: "마케터 3년차", text: "강의 듣고 바로 다음 날 회의에서 써먹었어요. 상사가 깜짝 놀랐습니다." },
                { name: "이준혁", role: "스타트업 대표", text: "혼자 고민하던 문제가 2주 만에 풀렸습니다. 코호트 동료들 덕분이에요." },
                { name: "박지은", role: "프리랜서 기획자", text: "12주 뒤에 클라이언트가 '사고방식이 달라졌다'고 하더라고요. 진짜 바뀝니다." },
              ].map(r => (
                <div key={r.name} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7">
                  <Quote className="w-5 h-5 text-violet-400/40 mb-4" />
                  <p className="text-[15px] text-white/60 leading-[1.8] mb-6">&ldquo;{r.text}&rdquo;</p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                    </div>
                  </div>
                  <p className="text-[13px] text-white/40 mt-2">{r.name} &middot; {r.role}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <Reveal className="text-center mb-14">
            <span className="text-[13px] text-violet-400 font-semibold tracking-[0.1em] uppercase mb-4 block">Pricing</span>
            <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-[1.2] tracking-[-0.02em]">
              단 하나의 플랜
            </h2>
          </Reveal>

          <Reveal>
            <div className="max-w-[420px] mx-auto bg-gradient-to-b from-violet-500/10 to-transparent border border-white/[0.08] rounded-2xl p-10 text-center">
              <span className="text-[14px] text-violet-400 font-semibold">MindFlow 12주</span>
              <div className="mt-4 mb-6">
                <span className="text-[48px] font-bold tracking-[-0.03em]">890,000</span>
                <span className="text-[18px] text-white/40 ml-1">원</span>
              </div>
              <ul className="space-y-3 text-left mb-8">
                {["12주 라이브 세션 (주 1회)", "1:1 멘토 피드백", "코호트 커뮤니티 영구 접근", "실전 과제 12개 + 템플릿", "수료증 발급", "2주 내 100% 환불 보장"].map(f => (
                  <li key={f} className="flex items-center gap-3 text-[14px] text-white/60">
                    <Check className="w-4 h-4 text-violet-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 bg-white text-[#0a0a0a] text-[16px] font-semibold rounded-xl hover:bg-white/90 transition-all">
                무료 체험 신청하기
              </button>
              <p className="text-[12px] text-white/25 mt-3">3개월 무이자 할부 가능</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-24 bg-[#0f0f0f]">
        <div className="max-w-[700px] mx-auto px-6 lg:px-12">
          <Reveal className="text-center mb-14">
            <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-[1.2] tracking-[-0.02em]">
              자주 묻는 질문
            </h2>
          </Reveal>

          <Reveal>
            <div className="space-y-3">
              {[
                { q: "어떤 분들이 수강하나요?", a: "마케터, 기획자, 창업자 등 사고력을 높이고 싶은 모든 분이 대상입니다. 비전공자도 문제없습니다." },
                { q: "시간을 많이 투자해야 하나요?", a: "주 1회 라이브(90분) + 과제(약 2시간) 정도입니다. 직장인도 무리 없이 병행 가능합니다." },
                { q: "환불은 어떻게 되나요?", a: "수강 시작 후 2주 이내 요청 시 100% 전액 환불됩니다. 조건 없습니다." },
                { q: "다음 기수는 언제 시작하나요?", a: "매월 첫째 주 월요일에 새 기수가 시작됩니다. 현재 모집 중인 기수는 상단에서 확인하세요." },
              ].map((faq, i) => (
                <div key={i} className="border border-white/[0.06] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-[15px] font-medium text-white/80">{faq.q}</span>
                    <ChevronRight className={`w-4 h-4 text-white/30 transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5">
                      <p className="text-[14px] text-white/45 leading-[1.8]">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-28 bg-[#0a0a0a] text-center">
        <div className="max-w-[600px] mx-auto px-6">
          <Reveal>
            <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-[1.2] tracking-[-0.02em] mb-5">
              12주 뒤,<br />다른 사람이 됩니다
            </h2>
            <p className="text-[17px] text-white/40 leading-[1.8] mb-10">
              무료 체험으로 먼저 경험해보세요. 부담 없이 시작할 수 있습니다.
            </p>
            <button className="inline-flex items-center gap-2 px-10 py-4 bg-white text-[#0a0a0a] text-[16px] font-semibold rounded-xl hover:bg-white/90 transition-all">
              무료 체험 신청 <ArrowRight className="w-4 h-4" />
            </button>
          </Reveal>
        </div>
      </section>

      {/* ─── Back to PIXELPAGE ─── */}
      <section className="py-12 bg-[#0f0f0f] border-t border-white/[0.06] text-center">
        <p className="text-[13px] text-white/25 mb-3">이 페이지는 PIXELPAGE 웹 빌드 서비스 샘플입니다.</p>
        <Link href="/services/webbuild" className="inline-flex items-center gap-2 text-[14px] text-violet-400 hover:text-violet-300 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> 웹 빌드 서비스 보기
        </Link>
      </section>
    </div>
  );
};

export default DemoClient;

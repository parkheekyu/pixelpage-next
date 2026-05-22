"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Reveal from "@/components/Reveal";

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
  {
    q: "대행과 컨설팅 중 어떤 게 맞을지 모르겠어요.",
    a: "무료 마케팅 진단으로 시작하세요. 진단 결과를 보고 어떤 서비스가 맞는지 함께 판단해드려요.",
  },
];

const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState<number>(0);
  return (
    <section className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
      <div className="max-w-[840px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-14">
          <p className="text-[12px] font-semibold tracking-[0.18em] uppercase text-blue-500 mb-5">
            자주 묻는 질문
          </p>
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.18] tracking-[-0.03em]">
            궁금한 게 있으신가요.
          </h2>
        </Reveal>
        <Reveal className="space-y-3">
          {faqs.map((f, i) => {
            const open = openIdx === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border transition-colors ${open ? "border-foreground/20 bg-white" : "border-[#e5e7eb] bg-white"}`}
              >
                <button
                  onClick={() => setOpenIdx(open ? -1 : i)}
                  className="w-full px-6 py-5 lg:px-7 lg:py-6 flex items-center justify-between gap-6 text-left"
                >
                  <span className="text-[16px] lg:text-[17px] font-semibold text-foreground">
                    {f.q}
                  </span>
                  <Plus
                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? "rotate-45" : ""}`}
                  />
                </button>
                {open && (
                  <div className="px-6 pb-5 lg:px-7 lg:pb-6 pt-0">
                    <p className="text-[14px] lg:text-[15px] text-muted-foreground leading-[1.85]">
                      {f.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
};

export default FAQSection;

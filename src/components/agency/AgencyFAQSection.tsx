"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import Reveal from "@/components/Reveal";

const faqs = [
  {
    q: "세 개를 다 맡겨야 하나요?",
    a: "꼭 그렇지 않아요. 무료 진단 후 현재 상황에서 가장 필요한 것부터 시작해요. 퍼포먼스만 먼저 할 수도 있고, 파이프라인 전체를 한 번에 할 수도 있어요.",
  },
  {
    q: "소재 제작도 포함되나요?",
    a: "네. 카피·이미지·영상 모두 인하우스에서 직접 제작해요. 외주 없이 빠르게 테스트할 수 있어요.",
  },
  {
    q: "지금 대행사가 있는데 바꿔야 하나요?",
    a: "꼭 그렇지 않아요. 먼저 무료 진단을 받아보세요. 현재 구조의 문제점을 파악한 뒤 어떻게 할지 함께 판단해요.",
  },
  {
    q: "계약 후에도 계속 소통이 되나요?",
    a: "네. 주간 최적화 보고와 월간 성과 보고로 계속 소통해요. 영업 담당과 실행 담당이 분리되지 않아요. 처음 만난 사람이 끝까지 함께해요.",
  },
];

const AgencyFAQSection = () => {
  const [openIdx, setOpenIdx] = useState<number>(0);
  return (
    <section className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
      <div className="max-w-[840px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-14">
          <p className="text-[12px] font-semibold tracking-[0.18em] text-blue-500 mb-5">
            자주 묻는 질문
          </p>
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.18] tracking-[-0.03em]">
            궁금한 게 있으신가요?
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
                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
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
                      <div className="px-6 pb-5 lg:px-7 lg:pb-6 pt-0">
                        <p className="text-[14px] lg:text-[15px] text-muted-foreground leading-[1.85]">
                          {f.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
};

export default AgencyFAQSection;

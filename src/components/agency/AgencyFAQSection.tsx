"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import Reveal from "@/components/Reveal";

const faqs = [
  {
    q: "DB를 건당 비용으로 납품받는 것과 무슨 차이가 있나요?",
    a: "일반적인 DB 납품은 건당 공급가와 실제 광고 원가의 차이에서 수익을 남기는 구조입니다.\n\n픽셀페이지는 다릅니다. 저희는 DB를 비싸게 판매하는 공급사가 아니라, 고객사의 DB 획득 구조를 함께 만드는 파트너형 실행사입니다.\n\n광고비와 실제 성과를 투명하게 확인하며, 고객사의 상담과 매출이 성장해야 저희도 함께 성장하는 구조를 지향합니다.",
  },
  {
    q: "광고 소재와 랜딩페이지 제작에 따로 비용이 드나요?",
    a: "별도의 제작비를 받지 않습니다.\n\n이미지 광고 소재 제작과 랜딩페이지 구축·개선은 운영비에 포함되어 있으며, 한번 만들어놓고 끝내는 것이 아니라 실제 광고 데이터를 바탕으로 지속적으로 테스트하고 수정합니다.\n\n성과가 떨어지면 소재를 바꾸고, 랜딩페이지 전환율이 낮으면 퍼널을 다시 손봅니다.",
  },
  {
    q: "광고비는 별도인가요?",
    a: "네. 광고비는 Meta, Google 등 각 광고 매체에 직접 지불하는 비용으로 별도입니다.\n\n픽셀페이지는 광고비와 별도로 DB 수집 시스템을 운영하는 대행 수수료를 받습니다.\n\n즉, 광고비를 대신 받아 마진을 붙이는 방식이 아니라 실제 사용된 광고비를 기준으로 함께 성과를 관리합니다.",
  },
  {
    q: "제 업종도 진행할 수 있을까요?",
    a: "상담 신청, 견적 문의, 예약 등 DB 수집이 필요한 대부분의 업종에서 진행 가능합니다.\n\n다만 업종마다 광고 정책과 고객 획득 구조가 다르기 때문에 상담 후 진행 가능 여부를 먼저 검토합니다.\n\n불법·편법적인 상품이나 광고 플랫폼 정책상 정상적인 운영이 어려운 업종은 진행하지 않습니다.",
  },
  {
    q: "성과가 나오지 않으면 어떻게 하나요?",
    a: "광고를 단순히 계속 집행하는 방식으로 운영하지 않습니다.\n\n소재, 타겟, 랜딩페이지, 신청폼 등 어디에서 전환이 막히고 있는지 데이터를 기반으로 원인을 찾아 계속 개선합니다.\n\n그럼에도 3개월 이내 합의한 목표 KPI에 도달하지 못한다면, 현재 방식으로 광고비를 계속 소진하기보다 계약을 종료하거나 기존 구조를 버리고 퍼널을 전면 재설계하는 방향을 협의합니다.",
  },
  {
    q: "장기 계약을 해야 하나요?",
    a: "저희의 목표는 고객사를 계약으로 묶어두는 것이 아니라 계속 함께할 이유가 있는 성과를 만드는 것입니다.\n\n초기에는 충분한 데이터를 확보하고 개선하기 위해 일정 기간이 필요하지만, 장기 계약 자체를 목적으로 운영하지 않습니다. 성과와 방향성이 맞는 파트너사와 오래 함께하는 것을 지향합니다.",
  },
];

type Variant = "light" | "dark";

const AgencyFAQSection = ({ variant = "light" }: { variant?: Variant } = {}) => {
  const [openIdx, setOpenIdx] = useState<number>(0);
  const isDark = variant === "dark";
  return (
    <section className="py-28 lg:py-36" style={{ background: isDark ? "#0a0f1e" : "#ffffff" }}>
      <div className="max-w-[840px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-14">
          <span
            className={`inline-flex items-center px-4 py-1.5 mb-5 rounded-full text-[14px] font-semibold tracking-[0.18em] uppercase border ${
              isDark
                ? "text-blue-400 border-blue-400/40 bg-blue-400/[0.08]"
                : "text-blue-500 border-blue-500/40 bg-blue-500/[0.08]"
            }`}
          >
            FAQ
          </span>
          <h2 className={`break-keep text-[clamp(30px,4.5vw,52px)] font-bold leading-[1.2] tracking-[-0.03em] ${isDark ? "text-white" : "text-foreground"}`}>
            <span className={`font-normal ${isDark ? "text-white/40" : "text-foreground/40"}`}>궁금한 게</span><br />
            <span className="font-extrabold">있으신가요?</span>
          </h2>
        </Reveal>
        <Reveal className="space-y-3">
          {faqs.map((f, i) => {
            const open = openIdx === i;
            const borderCls = isDark
              ? open ? "border-white/20 bg-[#0f1425]" : "border-white/[0.08] bg-[#0f1425]"
              : open ? "border-foreground/20 bg-white" : "border-[#e5e7eb] bg-white";
            return (
              <div
                key={i}
                className={`rounded-2xl border transition-colors ${borderCls}`}
              >
                <button
                  onClick={() => setOpenIdx(open ? -1 : i)}
                  className="w-full px-6 py-5 lg:px-7 lg:py-6 flex items-center justify-between gap-6 text-left"
                >
                  <span className={`text-[16px] lg:text-[17px] font-semibold ${isDark ? "text-white" : "text-foreground"}`}>
                    {f.q}
                  </span>
                  <Plus
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isDark ? "text-white/40" : "text-muted-foreground"} ${open ? "rotate-45" : ""}`}
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
                        <p className={`text-[14px] lg:text-[15px] leading-[1.85] whitespace-pre-line ${isDark ? "text-white/55" : "text-muted-foreground"}`}>
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

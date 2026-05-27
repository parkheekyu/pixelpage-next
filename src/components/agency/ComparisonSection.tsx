"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import Reveal from "@/components/Reveal";

const rows = [
  { ord: "광고만 집행해요", pp: "광고, 랜딩, CRM을 하나의 구조로 봐요" },
  { ord: "클릭률, 노출수 보고서", pp: "CPA · 전환율 · 매출로 증명해요" },
  { ord: "영업 담당 따로, 실행 담당 따로", pp: "처음부터 끝까지 같은 팀이에요" },
  { ord: "광고 집행 후 DB 방치", pp: "CRM 자동화로 전환까지 연결해요" },
  { ord: "계약 후 연락이 끊겨요", pp: "주간 최적화 + 월간 성과 보고로 계속 소통해요" },
];

const ComparisonSection = () => (
  <section className="py-28 lg:py-36" style={{ background: "#fbfbfb" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-16 lg:mb-20">
        <p className="text-[12px] font-semibold tracking-[0.18em] text-blue-500 mb-5">
          픽셀페이지는 다릅니다
        </p>
        <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.18] tracking-[-0.03em]">
          다른 대행사와<br />무엇이 다른가요?
        </h2>
      </Reveal>

      <Reveal>
        <div className="max-w-[980px] mx-auto rounded-3xl border border-[#e5e7eb] overflow-hidden bg-white shadow-[0_20px_60px_-24px_rgba(10,15,30,0.12)]">
          {/* 헤더 행 */}
          <div className="grid grid-cols-2 border-b border-[#e5e7eb]">
            <div className="px-6 py-5 lg:px-8 lg:py-6 bg-[#f5f6f7]">
              <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                일반 대행사
              </span>
            </div>
            <div className="px-6 py-5 lg:px-8 lg:py-6 bg-blue-500 text-white">
              <span className="text-[11px] font-semibold tracking-[0.18em] uppercase">
                PIXELPAGE
              </span>
            </div>
          </div>
          {/* 비교 행 */}
          {rows.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.07, ease: "easeOut" }}
              className={`grid grid-cols-2 ${i < rows.length - 1 ? "border-b border-[#e5e7eb]" : ""}`}
            >
              <div className="px-6 py-6 lg:px-8 lg:py-7 flex items-start gap-3 border-r border-[#e5e7eb] bg-white">
                <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 text-neutral-400" strokeWidth={2.5} />
                </div>
                <p className="text-[15px] lg:text-[16px] text-muted-foreground leading-[1.7]">
                  {r.ord}
                </p>
              </div>
              <div className="px-6 py-6 lg:px-8 lg:py-7 flex items-start gap-3 bg-white">
                <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-blue-500" strokeWidth={2.5} />
                </div>
                <p className="text-[15px] lg:text-[16px] font-semibold text-foreground leading-[1.7]">
                  {r.pp}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

export default ComparisonSection;

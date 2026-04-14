"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/* -- Tall rounded card container -- */
const MockupCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl bg-[#f5f0ea] overflow-hidden h-[420px] flex items-center justify-center p-6">
    {children}
  </div>
);

/* -- 1. Audience Overlap (Venn) -- */
export const AudienceOverlapMockup = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <MockupCard>
      <div ref={ref} className="w-full max-w-[380px]">
        <div className="grid grid-cols-2 gap-3">
          {/* Left: separate */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-col items-center"
          >
            <span className="text-[13px] font-semibold text-neutral-700 mb-5">따로 운영할 때</span>
            <div className="relative h-[140px] w-full flex items-center justify-center">
              <div className="absolute left-[5%] w-[100px] h-[100px] rounded-full border-2 border-[#93c5fd] bg-[#93c5fd]/15 flex items-center justify-center">
                <span className="text-[18px] font-bold text-[#3b82f6]">A</span>
              </div>
              <div className="absolute right-[5%] w-[100px] h-[100px] rounded-full border-2 border-[#93c5fd] bg-[#93c5fd]/15 flex items-center justify-center">
                <span className="text-[18px] font-bold text-[#3b82f6]">B</span>
              </div>
              <div className="absolute z-10 bg-white/90 px-2 py-1 rounded-md shadow-sm">
                <span className="text-[12px] font-bold text-red-500 block text-center">겹침</span>
                <span className="text-[10px] text-red-400 block text-center">자기 경쟁</span>
              </div>
            </div>
            <span className="text-[11px] text-red-500 font-semibold mt-3 text-center">입찰 경쟁 발생 &rarr;<br />CPA 상승</span>
          </motion.div>

          {/* Right: merged */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="flex flex-col items-center"
          >
            <span className="text-[13px] font-semibold text-neutral-700 mb-5">하나로 합치면</span>
            <div className="h-[140px] w-full flex items-center justify-center">
              <div className="w-[120px] h-[120px] rounded-full border-2 border-[#10b981] bg-[#10b981]/12 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-[22px] font-bold text-[#10b981] block">C</span>
                  <span className="text-[10px] text-[#10b981]">자기 경쟁 없음</span>
                </div>
              </div>
            </div>
            <span className="text-[11px] text-[#10b981] font-semibold mt-3 text-center">CPA 자연 하락 &rarr;<br />효율 &uarr;</span>
          </motion.div>
        </div>

        {/* Bottom summary */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mt-5 grid grid-cols-2 gap-2"
        >
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
            <span className="text-[11px] font-bold text-red-600">70%+ 중복 시</span>
            <span className="block text-[10px] text-red-400">예산 낭비</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-center">
            <span className="text-[11px] font-bold text-emerald-600">중복 제거 후</span>
            <span className="block text-[10px] text-emerald-400">더 넓은 도달</span>
          </div>
        </motion.div>
      </div>
    </MockupCard>
  );
};

/* -- 2. Budget Scaling Timeline -- */
export const BudgetScalingMockup = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <MockupCard>
      <div ref={ref} className="w-full max-w-[380px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-center mb-4"
        >
          <span className="text-[14px] font-bold text-neutral-800">예산 스케일링</span>
        </motion.div>

        <div className="relative h-[180px] border-l-2 border-b-2 border-neutral-300 ml-6 mr-2">
          <div className="absolute -left-7 top-0 bottom-0 flex flex-col justify-between text-[9px] text-neutral-400 font-medium">
            <span>$120</span><span>$60</span><span>$10</span>
          </div>

          <motion.svg
            viewBox="0 0 360 160"
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
            preserveAspectRatio="none"
          >
            <motion.path
              d="M 5,148 L 70,148 L 90,125 L 150,120 L 170,85 L 210,80 L 230,55 L 290,50 L 310,20 L 355,15"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.3 }}
            />
            <motion.path
              d="M 5,25 L 50,30 L 90,50 L 130,65 L 170,70 L 195,55 L 215,65 L 250,75 L 290,90 L 330,100 L 355,110"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="5 3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.5 }}
            />
          </motion.svg>
        </div>

        <div className="flex justify-between ml-6 mr-2 mt-1 text-[9px] text-neutral-400 font-medium">
          <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span><span>Week 6~8</span>
        </div>

        <div className="flex items-center justify-center gap-5 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-[2px] bg-[#6366f1] rounded" />
            <span className="text-[10px] text-neutral-500 font-medium">일 예산</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-[2px] border-t-[2px] border-dashed border-[#10b981]" />
            <span className="text-[10px] text-neutral-500 font-medium">CPA 추이</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="flex gap-1.5 mt-3 justify-center flex-wrap"
        >
          {[
            { label: "\u2460 테스트", color: "#6366f1" },
            { label: "\u2461 안정화", color: "#6366f1" },
            { label: "\u2462 수직확장", color: "#f59e0b" },
            { label: "\u2463 수평확장", color: "#10b981" },
          ].map(p => (
            <span key={p.label} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white shadow-sm" style={{ color: p.color }}>
              {p.label}
            </span>
          ))}
        </motion.div>
      </div>
    </MockupCard>
  );
};

/* -- 3. Creative Lifecycle -- */
export const CreativeLifecycleMockup = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <MockupCard>
      <div ref={ref} className="w-full max-w-[380px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-center mb-4"
        >
          <span className="text-[14px] font-bold text-neutral-800">소재 생애주기</span>
        </motion.div>

        <div className="relative h-[180px] border-l-2 border-b-2 border-neutral-300 ml-2 mr-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="absolute inset-0 flex"
          >
            <div className="flex-1 bg-violet-100/50 flex items-start justify-center pt-2">
              <span className="text-[10px] font-bold text-violet-500">학습</span>
            </div>
            <div className="flex-1 bg-emerald-100/50 flex items-start justify-center pt-2">
              <span className="text-[10px] font-bold text-emerald-500">최고 성과</span>
            </div>
            <div className="flex-1 bg-amber-100/50 flex items-start justify-center pt-2">
              <span className="text-[10px] font-bold text-amber-500">피로</span>
            </div>
            <div className="flex-1 bg-red-100/50 flex items-start justify-center pt-2">
              <span className="text-[10px] font-bold text-red-400">교체 필요</span>
            </div>
          </motion.div>

          <motion.svg
            viewBox="0 0 360 160"
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.3 }}
            preserveAspectRatio="none"
          >
            <line x1="0" y1="100" x2="360" y2="100" stroke="#9ca3af" strokeWidth="1" strokeDasharray="5 3" />

            <motion.path
              d="M 8,145 C 35,140 55,115 90,50 C 120,5 140,10 165,20 C 195,30 225,65 255,90 C 285,115 315,135 352,148"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 1.5, delay: 0.4 }}
            />

            <circle cx="8" cy="145" r="4" fill="#6366f1" />
            <circle cx="135" cy="12" r="5" fill="#10b981" />
            <circle cx="255" cy="90" r="4" fill="#dc2626" />
            <circle cx="352" cy="148" r="4" fill="#dc2626" />
          </motion.svg>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 1.2 }}
          >
            <span className="absolute top-[1%] left-[33%] text-[10px] text-[#10b981] font-bold bg-white/80 px-1.5 py-0.5 rounded">최저 CPA &uarr;</span>
            <span className="absolute top-[48%] right-[22%] text-[10px] text-[#dc2626] font-bold bg-white/80 px-1.5 py-0.5 rounded">교체 신호 &rarr;</span>
          </motion.div>
        </div>

        <div className="flex justify-between mx-2 mt-1 text-[9px] text-neutral-400 font-medium">
          <span>0일</span><span>7일</span><span>14일</span><span>21일</span><span>28일</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, delay: 1.4 }}
          className="mt-3 bg-neutral-800 text-white rounded-xl px-4 py-2.5 text-center"
        >
          <span className="text-[12px] font-bold">CPA 30~50% &uarr; = 교체 시점</span>
        </motion.div>
      </div>
    </MockupCard>
  );
};

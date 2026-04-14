"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/* -- Clean white card -- */
const MockupCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl bg-white border border-neutral-200/60 overflow-hidden h-[400px] flex items-center justify-center p-8">
    {children}
  </div>
);

/* -- 1. Audience Overlap -- */
export const AudienceOverlapMockup = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <MockupCard>
      <div ref={ref} className="w-full flex flex-col items-center">
        {/* Before → After */}
        <div className="flex items-center gap-6 w-full justify-center">
          {/* Before: overlapping circles */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-[120px] h-[90px]">
              <div className="absolute left-0 top-[5px] w-[75px] h-[75px] rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center">
                <span className="text-[14px] font-bold text-red-400">A</span>
              </div>
              <div className="absolute right-0 top-[5px] w-[75px] h-[75px] rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center">
                <span className="text-[14px] font-bold text-red-400">B</span>
              </div>
              {/* Overlap indicator */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">!</span>
                </div>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-red-500 mt-3">자기 경쟁</span>
          </motion.div>

          {/* Arrow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M6 16h18M20 10l6 6-6 6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>

          {/* After: single clean circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center"
          >
            <div className="w-[90px] h-[90px] rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center">
              <div className="text-center">
                <span className="text-[20px] font-bold text-emerald-500 block leading-none">A+B</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-500 mt-3">효율 극대화</span>
          </motion.div>
        </div>

        {/* Bottom metrics */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mt-8 flex gap-3 w-full"
        >
          <div className="flex-1 bg-red-50 rounded-xl py-3 text-center">
            <span className="text-[20px] font-bold text-red-500 block">70%</span>
            <span className="text-[10px] text-red-400">오디언스 중복</span>
          </div>
          <div className="flex-1 bg-emerald-50 rounded-xl py-3 text-center">
            <span className="text-[20px] font-bold text-emerald-500 block">-40%</span>
            <span className="text-[10px] text-emerald-400">CPA 절감</span>
          </div>
        </motion.div>
      </div>
    </MockupCard>
  );
};

/* -- 2. Budget Scaling -- */
export const BudgetScalingMockup = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const steps = [
    { label: "테스트", budget: "10만", h: 25, color: "#a78bfa" },
    { label: "안정", budget: "30만", h: 45, color: "#818cf8" },
    { label: "수직확장", budget: "80만", h: 70, color: "#6366f1" },
    { label: "수평확장", budget: "150만+", h: 95, color: "#4f46e5" },
  ];

  return (
    <MockupCard>
      <div ref={ref} className="w-full flex flex-col items-center">
        {/* Bars */}
        <div className="flex items-end gap-4 h-[180px] w-full justify-center">
          {steps.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={inView ? { opacity: 1, scaleY: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.12 }}
              style={{ originY: 1 }}
              className="flex flex-col items-center"
            >
              <span className="text-[11px] font-bold mb-2" style={{ color: s.color }}>{s.budget}</span>
              <div
                className="w-[52px] rounded-xl"
                style={{ height: `${s.h * 1.6}px`, backgroundColor: s.color }}
              />
              <span className="text-[10px] text-neutral-500 font-medium mt-2">{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Growth arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="mt-5 flex items-center gap-2"
        >
          <svg width="120" height="20" viewBox="0 0 120 20" fill="none">
            <path d="M5 15 Q30 5 60 10 Q90 15 115 5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M108 3 L116 5 L110 10" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span className="text-[11px] font-bold text-indigo-500">단계별 확장</span>
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
      <div ref={ref} className="w-full flex flex-col items-center">
        {/* Lifecycle curve */}
        <motion.svg
          viewBox="0 0 280 160"
          className="w-full max-w-[280px] h-[160px]"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Phase backgrounds */}
          <rect x="0" y="0" width="70" height="160" fill="#ede9fe" rx="0" opacity="0.5"/>
          <rect x="70" y="0" width="70" height="160" fill="#d1fae5" rx="0" opacity="0.5"/>
          <rect x="140" y="0" width="70" height="160" fill="#fef3c7" rx="0" opacity="0.5"/>
          <rect x="210" y="0" width="70" height="160" fill="#fee2e2" rx="0" opacity="0.5"/>

          {/* Phase labels */}
          <text x="35" y="15" textAnchor="middle" fill="#7c3aed" fontSize="9" fontWeight="700">학습</text>
          <text x="105" y="15" textAnchor="middle" fill="#059669" fontSize="9" fontWeight="700">최고성과</text>
          <text x="175" y="15" textAnchor="middle" fill="#d97706" fontSize="9" fontWeight="700">피로</text>
          <text x="245" y="15" textAnchor="middle" fill="#dc2626" fontSize="9" fontWeight="700">교체</text>

          {/* Curve */}
          <motion.path
            d="M 10,140 C 30,130 50,80 90,30 C 120,5 140,15 160,40 C 185,70 210,110 250,145"
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.3 }}
          />

          {/* Peak dot */}
          <motion.circle
            cx="90" cy="28" r="6" fill="#10b981"
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.8 }}
          />

          {/* Death dot */}
          <motion.circle
            cx="250" cy="145" r="6" fill="#ef4444"
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.3, delay: 1.0 }}
          />
        </motion.svg>

        {/* Labels */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, delay: 1.0 }}
          className="mt-6 flex gap-3 w-full"
        >
          <div className="flex-1 flex items-center gap-2 bg-emerald-50 rounded-xl py-2.5 px-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[11px] font-semibold text-emerald-600">최저 CPA 구간</span>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-red-50 rounded-xl py-2.5 px-3">
            <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
            <span className="text-[11px] font-semibold text-red-500">교체 시점</span>
          </div>
        </motion.div>

        {/* Bottom callout */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, delay: 1.2 }}
          className="mt-3 bg-neutral-900 text-white rounded-xl px-5 py-2.5 text-center w-full"
        >
          <span className="text-[12px] font-bold">CPA 30~50% 상승 = 즉시 교체</span>
        </motion.div>
      </div>
    </MockupCard>
  );
};

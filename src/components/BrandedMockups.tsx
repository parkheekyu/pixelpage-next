"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/* -- Container: 통일된 둥근 박스 -- */
const MockupBox = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-neutral-200 bg-white shadow-card overflow-hidden mx-auto ${className}`}>
    {children}
  </div>
);

/* ============================================================
   YouTube Studio Analytics Mockup
   ============================================================ */
export const YouTubeStudioMockup = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <MockupBox>
      <div ref={ref}>
        {/* Top bar — YouTube Studio 스타일 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <div className="w-5 h-3.5 bg-red-500 rounded-sm flex items-center justify-center">
                <div className="w-0 h-0 border-l-[4px] border-l-white border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent ml-0.5" />
              </div>
              <span className="text-[12px] font-medium text-neutral-700 ml-1">Studio</span>
            </div>
            <span className="text-[11px] text-neutral-400 ml-2">채널 분석</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-neutral-200" />
            <div className="w-2 h-2 rounded-full bg-neutral-200" />
            <div className="w-2 h-2 rounded-full bg-neutral-200" />
          </div>
        </div>

        <div className="p-5 lg:p-6">
          {/* Channel header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="flex items-center gap-3 mb-5"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
                <rect width="18" height="13" rx="3" fill="white"/>
                <path d="M7 4L12 6.5L7 9V4Z" fill="#dc2626"/>
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-neutral-800">내 채널</p>
              <p className="text-[11px] text-neutral-400">최근 28일</p>
            </div>
            <div className="ml-auto flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1L9 7H1L5 1Z" fill="currentColor"/></svg>
              성장 중
            </div>
          </motion.div>

          {/* Key metrics */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.35, delay: 0.25 }}
            className="grid grid-cols-3 gap-2 mb-5"
          >
            {[
              { label: "조회수", val: "44.0만", delta: "+891%", color: "text-emerald-600" },
              { label: "구독자", val: "2,500", delta: "+3,324%", color: "text-emerald-600" },
              { label: "시청시간", val: "12.4K", delta: "+1,120%", color: "text-emerald-600", unit: "시간" },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 6 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
                className="bg-neutral-50 rounded-lg p-3"
              >
                <p className="text-[10px] text-neutral-500 mb-1">{m.label}</p>
                <p className="text-[16px] font-bold text-neutral-900">{m.val}{m.unit && <span className="text-[10px] font-normal text-neutral-400 ml-0.5">{m.unit}</span>}</p>
                <p className={`text-[10px] font-semibold ${m.color} mt-1`}>&uarr; {m.delta}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-neutral-50 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-neutral-700">구독자 추이</span>
              <span className="text-[10px] text-neutral-400">28일</span>
            </div>
            <div className="relative h-[90px]">
              <svg viewBox="0 0 280 90" className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="75" x2="280" y2="75" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2 3" />
                <line x1="0" y1="45" x2="280" y2="45" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2 3" />
                <line x1="0" y1="15" x2="280" y2="15" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2 3" />

                {/* Area fill */}
                <motion.path
                  d="M 0,82 L 20,80 L 40,76 L 60,70 L 80,62 L 100,55 L 120,45 L 140,35 L 160,28 L 180,22 L 200,16 L 220,12 L 240,8 L 260,5 L 280,3 L 280,90 L 0,90 Z"
                  fill="url(#gradientFill)"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.8 }}
                />

                {/* Line */}
                <motion.path
                  d="M 0,82 L 20,80 L 40,76 L 60,70 L 80,62 L 100,55 L 120,45 L 140,35 L 160,28 L 180,22 L 200,16 L 220,12 L 240,8 L 260,5 L 280,3"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 1.4, delay: 0.6 }}
                />

                <defs>
                  <linearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* End dot */}
                <motion.circle
                  cx="280" cy="3" r="3.5" fill="#ef4444"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.3, delay: 2.0 }}
                />
              </svg>
            </div>
          </motion.div>

          {/* Recent video */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3, delay: 1.0 }}
            className="flex items-center gap-3 p-2.5 bg-neutral-50 rounded-lg"
          >
            <div className="w-12 h-8 rounded bg-gradient-to-br from-orange-400 to-red-600 shrink-0 flex items-center justify-center">
              <div className="w-0 h-0 border-l-[5px] border-l-white border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent ml-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-neutral-800 truncate">최근 업로드 영상</p>
              <p className="text-[10px] text-neutral-400">조회수 12.8만 &middot; 2주 전</p>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">HIT</span>
          </motion.div>
        </div>
      </div>
    </MockupBox>
  );
};

/* ============================================================
   Before / After Growth Infographic
   ============================================================ */
export const BeforeAfterMockup = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <MockupBox>
      <div ref={ref} className="p-5 lg:p-7">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="text-center mb-5"
        >
          <span className="text-[11px] font-semibold text-neutral-500 tracking-[0.08em] uppercase">구독자 성장 추이</span>
          <p className="text-[12px] text-neutral-400 mt-1">대행 시작 이전 vs 이후</p>
        </motion.div>

        {/* Big chart area */}
        <div className="relative h-[180px] mb-5">
          <svg viewBox="0 0 400 180" className="w-full h-full" preserveAspectRatio="none">
            {/* Grid */}
            <line x1="0" y1="150" x2="400" y2="150" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="100" x2="400" y2="100" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="2 3" />
            <line x1="0" y1="50" x2="400" y2="50" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="2 3" />

            {/* Vertical divider at transition point */}
            <line x1="180" y1="20" x2="180" y2="150" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 3" />

            {/* Before line — flat near bottom */}
            <motion.path
              d="M 10,145 L 40,144 L 70,145 L 100,143 L 130,144 L 160,142 L 180,141"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 1.0, delay: 0.3 }}
            />

            {/* After line — steep growth */}
            <motion.path
              d="M 180,141 L 210,130 L 240,110 L 270,85 L 300,60 L 330,40 L 360,25 L 390,15"
              fill="none"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 1.5, delay: 1.3 }}
            />

            {/* After area fill */}
            <motion.path
              d="M 180,141 L 210,130 L 240,110 L 270,85 L 300,60 L 330,40 L 360,25 L 390,15 L 390,150 L 180,150 Z"
              fill="url(#afterGradient)"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 1.8 }}
            />

            <defs>
              <linearGradient id="afterGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Start point */}
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 1.4 }}
            >
              <circle cx="180" cy="141" r="5" fill="white" stroke="#94a3b8" strokeWidth="2" />
            </motion.g>

            {/* End point */}
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 2.8 }}
            >
              <circle cx="390" cy="15" r="6" fill="#ef4444" />
              <circle cx="390" cy="15" r="10" fill="#ef4444" opacity="0.2" />
            </motion.g>

            {/* Labels */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 1.6 }}
            >
              <text x="90" y="170" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="500">BEFORE</text>
              <text x="90" y="128" textAnchor="middle" fontSize="11" fill="#475569" fontWeight="600">73명</text>
            </motion.g>
            <motion.g
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 3.0 }}
            >
              <text x="290" y="170" textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="600">AFTER</text>
              <text x="390" y="8" textAnchor="end" fontSize="12" fill="#ef4444" fontWeight="700">2,500명</text>
            </motion.g>
          </svg>
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: "34×", label: "구독자 증가", color: "text-red-500", bg: "bg-red-50" },
            { val: "10×", label: "조회수 성장", color: "text-orange-500", bg: "bg-orange-50" },
            { val: "4.5×", label: "상담 전환", color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 6 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: 3.2 + i * 0.1 }}
              className={`${s.bg} rounded-lg p-3 text-center`}
            >
              <p className={`text-[20px] font-bold ${s.color}`}>{s.val}</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Timeline labels */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-neutral-400" />
            <span className="text-[10px] text-neutral-500">직접 운영 1년 6개월</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] text-neutral-700 font-semibold">대행 2개월</span>
          </div>
        </div>
      </div>
    </MockupBox>
  );
};

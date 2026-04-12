"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Reveal from "@/components/Reveal";
import iconOk from "@/assets/icon-ok.svg";
import metaLogo from "@/assets/meta-ads-logo.png";

/* -- Container: 통일된 둥근 박스 -- */
const MockupBox = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-neutral-200 bg-white shadow-card overflow-hidden mx-auto">
    {children}
  </div>
);

/* -- 1. Notion 페이지 목업 -- */
const NotionMockup = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const contentItems = [
    { icon: "\u2B50", text: "브랜드 전략 (USP 개발)" },
    { icon: "\uD83C\uDFAF", text: "콘텐츠 전략 \u00B7 메시지 설계" },
    { icon: "\uD83D\uDCC2", text: "채널 기획 \u00B7 타겟 세그먼트" },
    { icon: "\u2757", text: "[필독] 경쟁사 분석 리포트" },
  ];

  const frameworkItems = [
    { icon: "\uD83D\uDCC4", text: "고객 페르소나 정의" },
    { icon: "\uD83D\uDCC4", text: "핵심 메시지 프레임워크" },
    { icon: "\uD83D\uDCC4", text: "포지셔닝 맵 \u00B7 차별화 전략" },
  ];

  return (
    <MockupBox>
      <div ref={ref} className="p-5 lg:p-7">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="mb-4"
        >
          <div className="bg-[#fbf3db] px-4 py-2 rounded-md border-l-[3px] border-[#e8c44a] mb-2">
            <span className="text-[14px] font-semibold text-neutral-800">1. 시장 조사 &middot; USP 개발</span>
          </div>
          <div className="bg-[#e8f0fe] rounded-md px-4 py-3">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[13px]">&#x1F9D1;&#x200D;&#x1F4BC;</span>
              <span className="text-[13px] font-semibold text-neutral-800">브랜드 전략 워크스페이스</span>
            </div>
            {contentItems.map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -8 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.25, delay: 0.25 + i * 0.1 }}
                className="flex items-center gap-2 py-[3px] pl-5"
              >
                <span className="text-[12px]">{item.icon}</span>
                <span className="text-[13px] text-neutral-600">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, delay: 0.5 }}
        >
          <div className="px-1 mb-2">
            <span className="text-[14px] font-semibold text-neutral-800">메시지 프레임워크</span>
          </div>
          <div className="bg-[#e8f0fe] rounded-md px-4 py-3">
            {frameworkItems.map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -8 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.25, delay: 0.65 + i * 0.1 }}
                className="flex items-center gap-2 py-[3px] pl-5"
              >
                <span className="text-[12px]">{item.icon}</span>
                <span className="text-[13px] text-neutral-600">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </MockupBox>
  );
};

/* -- 2. Google Sheets 목업 -- */
const SpreadsheetMockup = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const headers = ["", "A", "B", "C", "D", "E", "F", "G"];
  const headerLabels = ["", "collected_date", "channel_name", "followers", "type", "likes", "engagement(%)", "videoPlayCount"];

  const rows = [
    { n: "2260", cells: ["2026-03-06", "aim_ing_", "100,865", "Sidecar", "247", "0.26%", "0"] },
    { n: "2261", cells: ["2026-03-06", "soraofficial", "277,782", "Video", "143", "0.06%", "5,612"] },
    { n: "2262", cells: ["2026-03-06", "storyboard.co.th", "175,382", "Video", "111", "0.07%", "7,702"] },
    { n: "2263", cells: ["2026-03-06", "aim_ing_", "100,865", "Sidecar", "81", "0.08%", "0"] },
    { n: "2264", cells: ["2026-03-06", "ai_ing_", "46,036", "Sidecar", "68", "0.15%", "0"] },
    { n: "2265", cells: ["2026-03-06", "aim_ing_", "100,865", "Sidecar", "39", "0.04%", "0"] },
    { n: "2266", cells: ["2026-03-07", "aitrendz.xyz", "321,993", "Video", "-1", "0.02%", "6,092"] },
    { n: "2267", cells: ["2026-03-07", "aitrendz.xyz", "321,993", "Video", "-1", "0.01%", "7,012"] },
    { n: "2268", cells: ["2026-03-07", "ai.trend.kr", "105,288", "Video", "15,956", "15.19%", "497,997"], highlight: true },
    { n: "2269", cells: ["2026-03-07", "openai", "4,165,499", "Sidecar", "8,977", "0.23%", "0"] },
    { n: "2270", cells: ["2026-03-07", "claudeai", "416,673", "Video", "7,569", "1.85%", "233,579"] },
    { n: "2271", cells: ["2026-03-07", "meta.ai", "3,586,218", "Video", "4,480", "0.13%", "1,333,408"] },
  ];

  const typeColor = (t: string) =>
    t === "Sidecar" ? "bg-[#f4c77b]/80 text-neutral-800" :
    t === "Video" ? "bg-[#6ba4e0] text-white" :
    "bg-neutral-100 text-neutral-600";

  return (
    <MockupBox>
      <div ref={ref}>
        <div className="flex items-center gap-2.5 px-4 py-2 bg-[#f0f4f8] border-b border-neutral-200">
          <div className="w-6 h-6 rounded bg-[#0f9d58] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[11px] font-bold">S</span>
          </div>
          <span className="text-[13px] font-medium text-neutral-700">레드캣픽_인스타수집</span>
          <div className="ml-auto flex items-center gap-2 text-[11px] text-neutral-400">
            <span>파일</span><span>수정</span><span>보기</span><span>삽입</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-white border-b border-neutral-200 text-[11px] text-neutral-500">
          <span className="bg-neutral-100 px-2 py-0.5 rounded text-[10px] font-mono">A1</span>
          <span className="text-neutral-300">|</span>
          <span className="italic">fx</span>
          <span className="text-neutral-700 font-mono">collected_date</span>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="grid grid-cols-[32px_repeat(7,1fr)] text-[9px] lg:text-[10px] font-bold text-neutral-600 bg-[#f8f9fa] border-b border-neutral-300"
        >
          {headers.map((h, i) => (
            <div key={i} className="px-1.5 py-1.5 border-r border-neutral-200 text-center">{h}</div>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="grid grid-cols-[32px_repeat(7,1fr)] text-[8px] lg:text-[9px] font-semibold text-neutral-700 bg-[#e8f0fe] border-b border-neutral-300"
        >
          {headerLabels.map((h, i) => (
            <div key={i} className={`px-1.5 py-1.5 border-r border-neutral-200 truncate ${i === 0 ? 'bg-[#f8f9fa] text-center' : ''}`}>
              {i === 0 ? "1" : h}
            </div>
          ))}
        </motion.div>

        <div className="max-h-[320px] overflow-hidden">
          {rows.map((row, i) => (
            <motion.div
              key={row.n}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.2, delay: 0.25 + i * 0.06 }}
              className={`grid grid-cols-[32px_repeat(7,1fr)] text-[8px] lg:text-[9px] border-b border-neutral-100 ${row.highlight ? 'bg-emerald-50 border-b-emerald-400 border-b-2' : 'hover:bg-blue-50/20'}`}
            >
              <div className="px-1.5 py-1 bg-[#f8f9fa] border-r border-neutral-200 text-neutral-400 text-center font-mono">{row.n}</div>
              {row.cells.map((cell, j) => (
                <div key={j} className={`px-1.5 py-1 border-r border-neutral-100 truncate ${row.highlight && j === 5 ? 'text-emerald-700 font-bold' : 'text-neutral-700'} ${j === 1 ? 'text-blue-600' : ''}`}>
                  {j === 3 ? (
                    <span className={`text-[7px] lg:text-[8px] px-1.5 py-0.5 rounded ${typeColor(cell)}`}>{cell}</span>
                  ) : cell}
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </MockupBox>
  );
};

/* -- 3. 메타 광고 알림 팝업 -- */
const MetaNotificationsMockup = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const notifications = [
    { percent: "83%", time: "오전 12:37" },
    { percent: "80%", time: "오전 12:47" },
    { percent: "79%", time: "오전 12:51" },
    { percent: "73%", time: "오전 12:55" },
  ];

  return (
    <MockupBox>
      <div ref={ref} className="bg-neutral-50">
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <img src={metaLogo.src} alt="Meta" className="w-5 h-5 rounded" />
            <span className="text-[13px] font-semibold text-neutral-700">광고 관리자</span>
          </div>
          <span className="text-[11px] text-neutral-400">&#x02C7; 간략히 보기</span>
        </div>

        <div className="p-3 space-y-2">
          {notifications.map((n, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.4,
                delay: 0.15 + i * 0.15,
                type: "spring",
                damping: 22,
                stiffness: 220,
              }}
              className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 border border-neutral-100 shadow-sm"
            >
              <img src={metaLogo.src} alt="Meta" className="w-9 h-9 rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px]">&#x1F44D;</span>
                    <span className="text-[12px] font-semibold text-neutral-800">광고 성과가 좋습니다</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 flex-shrink-0 ml-2">{n.time}</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  결과당 비용이 동종 업계보다 <span className="font-semibold text-neutral-700">{n.percent}</span> 낮습니다.
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MockupBox>
  );
};

/* -- Philosophy Section -- */
interface PhilosophySectionProps {
  heading?: React.ReactNode;
  icon?: string;
  iconAlt?: string;
}

const PhilosophySection = ({
  heading = <>일반 마케팅 회사와는<br />조금 다릅니다.</>,
  icon = iconOk.src,
  iconAlt = "Philosophy",
}: PhilosophySectionProps) => {
  const rows = [
    {
      num: "01",
      title: "하나의 메시지를 만듭니다.",
      body: "눈에 보이지 않는 서비스일수록, 고객이 \u2018왜 이걸 선택해야 하는지\u2019가 명확해야 합니다. 철저한 시장 조사와 경쟁사 분석으로 브랜드만의 USP를 개발하고, 타겟을 정밀하게 세분화하여 단 하나의 차별화된 메시지를 설계합니다.",
      mockup: <NotionMockup />,
      imageFirst: true,
    },
    {
      num: "02",
      title: "사람들이 반응하는\n포맷을 찾습니다.",
      body: "무형의 가치를 전달하려면, 사람들이 실제로 멈춰서 보는 포맷이어야 합니다. 자체 데이터 수집\u00B7분석 기술로 지금 가장 반응이 높은 콘텐츠 유형을 선별합니다. 감이 아니라 데이터로 결정합니다.",
      mockup: <SpreadsheetMockup />,
      imageFirst: false,
    },
    {
      num: "03",
      title: "동종 업계보다\n나은 결과를 만듭니다.",
      body: "보이지 않는 상품도 제대로 된 전략과 포맷이면 팔립니다. 함께한 브랜드들은 동종 업계 평균보다 꾸준히 낮은 결과당 비용을 기록하고 있습니다.",
      mockup: <MetaNotificationsMockup />,
      imageFirst: true,
    },
  ];

  return (
    <section className="py-28 lg:py-36 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal className="text-center mb-20 lg:mb-28">
          <img src={icon} alt={iconAlt} className="w-10 h-10 mb-5 mx-auto" />
          <h2 className="font-serif text-[clamp(36px,5vw,64px)] font-semibold text-foreground leading-[1.2] tracking-[-0.02em]">
            {heading}
          </h2>
        </Reveal>

        <div className="space-y-24 lg:space-y-36">
          {rows.map((row) => (
            <Reveal key={row.num}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                <div className={`${row.imageFirst ? 'lg:order-1' : 'lg:order-2'}`}>
                  {row.mockup}
                </div>
                <div className={`${row.imageFirst ? 'lg:order-2' : 'lg:order-1'}`}>
                  <span className="text-[28px] lg:text-[36px] font-serif font-bold text-primary/20 tracking-tight">{row.num}</span>
                  <h3 className="font-serif text-[clamp(26px,3.5vw,36px)] font-semibold text-foreground mt-3 mb-5 leading-[1.35] tracking-[-0.01em] whitespace-pre-line">
                    {row.title}
                  </h3>
                  <p className="text-[17px] text-muted-foreground leading-[2] max-w-[460px]">
                    {row.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhilosophySection;

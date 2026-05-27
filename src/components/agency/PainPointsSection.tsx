"use client";

import { motion } from "framer-motion";
import Reveal from "@/components/Reveal";

const pains = [
  {
    tag: "소통 부재",
    bold: "담당자가 우리 사업을 모릅니다.",
    body: "물어봐도 기계적인 답변만 반복해요. 전문적인 제언이 없고, 광고주 의도와 다른 방향으로 캠페인이 흘러가요.",
    emoji: "/emojis/confused.svg",
  },
  {
    tag: "영업 집중",
    bold: "계약하고 나면 연락이 끊겨요.",
    body: "영업할 때랑 계약 후가 달라요. 실행 담당자는 처음 듣는 사람이고, 약속한 내용은 어느새 흐지부지돼요.",
    emoji: "/emojis/sad.svg",
  },
  {
    tag: "허영 지표",
    bold: "보고서엔 클릭률, 노출수가 가득해요.",
    body: "숫자는 화려한데 매출은 그대로예요. 뭐가 문제인지 설명해주는 대행사가 없어요.",
    emoji: "/emojis/worried.svg",
  },
  {
    tag: "DB 방치",
    bold: "리드는 쌓이는데 전환이 안 돼요.",
    body: "광고로 신청은 받아놓고 후속 관리가 없어요. 어렵게 모은 리드가 그냥 묻혀요.",
    emoji: "/emojis/crying.svg",
  },
  {
    tag: "파편화",
    bold: "광고, 랜딩, CRM이 따로 놀아요.",
    body: "광고 대행사는 랜딩 탓, 랜딩 제작사는 광고 탓. 어느 쪽도 퍼널 전체를 보지 않아요.",
    emoji: "/emojis/shocked.svg",
  },
];

const PainPointsSection = () => (
  <section className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-16 lg:mb-20">
        <p className="text-[12px] font-semibold tracking-[0.18em] text-blue-500 mb-5">
          이런 경험 있으신가요
        </p>
        <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.18] tracking-[-0.03em] mb-6">
          대행사를 써봤는데<br />또 실망했다면
        </h2>
        <p className="text-[17px] md:text-[18px] text-muted-foreground leading-[1.85] max-w-[520px] mx-auto">
          대행사에 대한 불신, 이유가 있어요.
        </p>
      </Reveal>

      <div className="max-w-[840px] mx-auto space-y-7 lg:space-y-9">
        {pains.map((p, i) => {
          const emojiLeft = i % 2 === 0;
          return (
            <motion.div
              key={p.tag}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`flex items-center gap-5 md:gap-8 ${emojiLeft ? "" : "flex-row-reverse"}`}
            >
              <div className="shrink-0 w-[80px] h-[80px] md:w-[104px] md:h-[104px] rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center shadow-sm">
                <img src={p.emoji} alt="" className="w-12 h-12 md:w-14 md:h-14" />
              </div>
              <div className="flex-1 bg-white border border-[#e5e7eb] rounded-2xl px-6 py-5 md:px-8 md:py-7 shadow-sm">
                <span className="inline-block text-[11px] font-semibold tracking-[0.08em] text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full mb-3">
                  {p.tag}
                </span>
                <p className="text-[16px] md:text-[17px] font-bold text-foreground leading-[1.5] mb-2">
                  {p.bold}
                </p>
                <p className="text-[14px] md:text-[15px] text-muted-foreground leading-[1.8]">
                  {p.body}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default PainPointsSection;

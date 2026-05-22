"use client";

import { motion } from "framer-motion";
import Reveal from "@/components/Reveal";

const pains = [
  {
    tag: "책임 회피",
    body: "광고 성과가 안 나오면 랜딩페이지 문제라고 해요. 랜딩 제작사는 광고 탓을 하고요. 어느 쪽도 퍼널 전체를 보지 않아요.",
  },
  {
    tag: "의미 없는 보고서",
    body: "매달 보고서는 오는데 매출은 그대로예요. 노출수, 클릭율은 많은데 숫자가 많을수록 뭐가 문제인지 더 모르겠어요.",
  },
  {
    tag: "DB 관리 부실",
    body: "상담 신청이 왔는데 후속 연락을 놓쳤어요. 그 이후 묵묵부답입니다.",
  },
];

const PainSection = () => (
  <section className="py-28 lg:py-36" style={{ background: "#ffffff" }}>
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <Reveal className="text-center mb-16">
        <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.18] tracking-[-0.03em]">
          대행사와 함께해도 매출이 늘지 않았다면<br />
          고객 여정에 구멍이 있기 때문입니다.
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {pains.map((p, i) => (
          <motion.div
            key={p.tag}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#fbfbfb] border border-[#e5e7eb] rounded-2xl p-9 lg:p-10"
          >
            <span className="inline-block text-[12px] font-semibold tracking-[0.08em] text-blue-500 bg-blue-50 px-3 py-1 rounded-full mb-6">
              {p.tag}
            </span>
            <p className="text-[15px] lg:text-[16px] text-foreground/80 leading-[1.85]">
              {p.body}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PainSection;

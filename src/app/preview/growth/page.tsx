import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "픽셀페이지 — 상담 전환 중심 퍼포먼스 마케팅 (가안)",
  description: "내부 검토용 가안 페이지.",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null },
};

/* 타겟: 마케팅은 알지만 상담 신청(DB) 중심 퍼포먼스 광고를 본격 확대하지 않은, 영업 조직을 갖춘 기업의 의사결정자 */

const CASES = [
  { industry: "교육 · 온라인 강의", period: "90일", leads: "20,482건", cpl: "6,570원", note: "예산을 월 4천만 원대로 키우는 동안 획득 비용은 유지" },
  { industry: "시공 · 설비", period: "90일", leads: "1,108건", cpl: "8,507원", note: "검색 광고만 쓰던 고객사에 상담 신청 채널을 추가" },
  { industry: "교육 · 부트캠프", period: "90일", leads: "910건", cpl: "12,289원", note: "세트별 비교로 비효율 소재를 당일 교체" },
];

const FAQ = [
  ["우리 업종도 온라인 광고로 상담 DB가 나올까요?", "교육, 시공·설비, 병의원, 분양, 보험·금융, 프랜차이즈 등 상담을 거쳐 계약하는 업종이면 됩니다. 진단 단계에서 같은 업종의 획득 비용 범위를 먼저 보여드리고, 그 숫자가 사업성에 맞지 않으면 진행하지 않습니다."],
  ["광고비 대비 계약은 얼마나 기대할 수 있나요?", "상담 신청 수만이 아니라 통화 연결, 상담, 계약까지 리드마다 기록합니다. 4~8주 검증 기간이 지나면 '광고비 → 유효 상담 → 계약'이 숫자로 나오고, 그 비율로 확대 여부를 판단합니다."],
  ["성과가 나오면 물량을 얼마나 늘릴 수 있나요?", "획득 비용이 유지되는 구간까지입니다. 소재와 세트를 계속 교체하면서 예산을 단계적으로 올리고, 비용이 튀기 시작하는 지점에서 멈춥니다. 교육 고객사는 이 방식으로 90일 2만 건까지 갔습니다."],
  ["기존 대행사나 내부 마케팅팀과 병행할 수 있나요?", "가능합니다. 상담 신청 채널만 저희가 맡고, 브랜드·검색 광고는 기존대로 두는 구성이 가장 많습니다. 계정은 귀사 명의라 데이터가 섞이거나 빠져나갈 일이 없습니다."],
  ["계약 기간과 비용 구조는 어떻게 되나요?", "첫 1~2개월은 검증 기간으로, 광고비 실비와 운영비로 진행합니다. 이후 유효 상담당 단가 계약 또는 운영비 계약 중 사업 구조에 맞는 쪽을 택합니다. 선납은 받지 않습니다."],
];

export default function Page() {
  return (
    <main className="bg-[#07090f] text-white">
      {/* 히어로 */}
      <section className="relative overflow-hidden px-6 pt-28 pb-24 md:pt-36 md:pb-32">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 900px 520px at 50% -10%, rgba(67,150,248,0.22) 0%, transparent 60%)" }} />
        <div className="relative max-w-[980px] mx-auto text-center">
          <p className="text-[12px] font-semibold tracking-[0.22em] uppercase text-sky-300/80 mb-6">Performance Marketing for Consultation-Driven Business</p>
          <h1 className="break-keep text-[clamp(34px,5.6vw,66px)] font-bold leading-[1.15] tracking-[-0.035em]">
            광고비를 쓰는 것보다 중요한 건,<br />실제 상담으로 이어지는 성과입니다.
          </h1>
          <p className="mt-7 text-[17px] md:text-[19px] text-white/60 leading-[1.8] max-w-[640px] mx-auto break-keep">
            노출과 클릭을 넘어 잠재고객이 직접 상담을 신청하도록. 픽셀페이지는 광고, 랜딩페이지, 상담 신청, CRM을 하나로 연결해 상담 전환 중심의 퍼포먼스 마케팅을 설계하고 운영합니다.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/consult" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-black text-[16px] font-semibold hover:bg-white/90 transition">상담 전환 구조 진단 받기 <ArrowRight className="w-4 h-4" /></Link>
            <a href="#cases" className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/20 text-white/85 text-[16px] font-medium hover:bg-white/5 transition">성과 사례 보기</a>
          </div>
          <p className="mt-5 text-[13px] text-white/40">진단은 계약과 무관하며, 같은 업종의 획득 비용 범위를 먼저 보여드립니다.</p>
        </div>
      </section>

      {/* 세 가지 질문 */}
      <section className="px-6 py-20 md:py-24 border-t border-white/[0.06]">
        <div className="max-w-[1040px] mx-auto">
          <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-sky-300/70 mb-4">Before you decide</p>
          <h2 className="break-keep text-[clamp(26px,3.6vw,40px)] font-bold leading-[1.25] tracking-[-0.03em] max-w-[760px]">상담 신청 광고를 검토할 때, 결국 세 가지를 확인하게 됩니다.</h2>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {[
              ["우리 업종도 상담 DB가 나올까?", "상담을 거쳐 계약하는 업종이면 나옵니다. 문제는 '나오느냐'가 아니라 '얼마에, 얼마나 유효하게 나오느냐'입니다. 진단에서 같은 업종의 실제 획득 비용 범위를 먼저 보여드립니다."],
              ["광고비 대비 계약은 얼마나?", "상담 신청 수로 끝내면 알 수 없습니다. 통화 연결, 상담 진행, 계약, 드랍 사유까지 리드마다 기록해야 '광고비 → 계약' 비율이 나옵니다. 그 구조를 처음부터 갖추고 시작합니다."],
              ["성과가 나오면 얼마나 늘릴 수 있나?", "획득 비용이 유지되는 구간까지 단계적으로 확대합니다. 소재·세트 교체 없이 예산만 올리면 비용이 튑니다. 교체 주기와 기준선을 운영 루틴으로 고정해 둡니다."],
            ].map(([q, a]) => (
              <div key={q} className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
                <p className="text-[18px] font-bold leading-[1.4] tracking-[-0.02em] mb-4">{q}</p>
                <p className="text-[15px] text-white/60 leading-[1.8] break-keep">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 문제 제기 */}
      <section className="px-6 py-20 md:py-24 border-t border-white/[0.06] bg-[#0a0d16]">
        <div className="max-w-[1040px] mx-auto grid md:grid-cols-[1fr_1.1fr] gap-12 items-start">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-sky-300/70 mb-4">The gap</p>
            <h2 className="break-keep text-[clamp(26px,3.6vw,40px)] font-bold leading-[1.25] tracking-[-0.03em]">노출과 클릭은 보고받는데,<br />계약으로 이어진 광고비는 아무도 모릅니다.</h2>
          </div>
          <div className="space-y-6 text-[16px] text-white/65 leading-[1.85] break-keep">
            <p>브랜드 광고와 검색 광고로 인지도는 쌓였습니다. 그런데 신규 고객 유입을 더 늘리려고 하면 선택지가 막힙니다. 검색 광고는 키워드 수요가 천장이고, 브랜드 광고는 상담으로 바로 이어지지 않습니다.</p>
            <p>상담 신청 광고를 시도해 본 곳도 비슷한 벽을 만납니다. 신청은 들어오는데 통화가 안 되거나, 되더라도 계약까지의 비율을 아무도 집계하지 않습니다. 광고 보고서는 클릭에서 끝나고, 영업 쪽 결과는 따로 돌아다닙니다.</p>
            <p>결국 "광고비를 더 써도 되는가"에 답할 숫자가 없어서 확대를 못 합니다. 대표에게는 신규 매출 기회가, 마케팅 책임자에게는 적격 리드와 전환 비용이 보이지 않는 상태입니다.</p>
          </div>
        </div>
      </section>

      {/* 서비스 */}
      <section className="px-6 py-20 md:py-24 border-t border-white/[0.06]">
        <div className="max-w-[1040px] mx-auto">
          <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-sky-300/70 mb-4">What we run</p>
          <h2 className="break-keep text-[clamp(26px,3.6vw,40px)] font-bold leading-[1.25] tracking-[-0.03em] max-w-[760px]">광고 기획부터 실제 상담 전환까지 한 팀이 통합 운영합니다.</h2>
          <p className="mt-5 text-[16px] text-white/60 leading-[1.8] max-w-[700px] break-keep">광고 운영 대행이 아니라 신규 고객 확보 성과를 만드는 일입니다. 그래서 광고만 맡지 않고, 상담이 들어와 계약되는 지점까지를 하나의 운영 단위로 봅니다.</p>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ["광고", "메타·구글·유튜브. 업종별 위너 소재를 기준으로 주 단위 소재 교체, 세트별 획득 비용 비교, 기준선 초과 시 당일 중단."],
              ["랜딩·상담 신청", "상담 신청에 최적화된 랜딩페이지와 폼. 신청 즉시 영업 담당자에게 전달되고, 신청 정보가 통화 전에 정리되어 보입니다."],
              ["CRM·대시보드", "리드마다 연락, 상담, 계약, 드랍 사유와 매출을 기록하는 전용 대시보드. 귀사 영업팀이 그대로 쓰고, 저희가 그 데이터로 광고를 조정합니다."],
              ["성과 분석·보고", "매일 아침 전날 성과와 당일 조치를 슬랙으로 보고. 주간 단위로 광고비 → 유효 상담 → 계약 비율을 정리해 확대 여부를 함께 판단합니다."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-[17px] font-bold mb-3 tracking-[-0.02em]">{t}</p>
                <p className="text-[14.5px] text-white/60 leading-[1.8] break-keep">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-2xl border border-sky-400/20 bg-sky-400/[0.06] p-7 md:p-8">
            <p className="text-[15px] font-semibold text-sky-200 mb-4">운영 원칙</p>
            <ul className="grid md:grid-cols-3 gap-4 text-[15px] text-white/75 leading-[1.7] break-keep">
              {["광고 계정과 데이터는 귀사 명의입니다. 종료 후에도 소재, 픽셀, 상담 데이터가 그대로 남습니다.", "유효 상담 기준(결번·중복·본인 부인 제외)을 계약서에 명시하고, 그 기준으로 성과를 집계합니다.", "대표가 직접 운영하고 담당자가 바뀌지 않습니다. 동시에 맡는 고객사 수를 제한합니다."].map((t) => (
                <li key={t} className="flex gap-3"><Check className="w-4 h-4 mt-1.5 shrink-0 text-sky-300" />{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 사례 */}
      <section id="cases" className="px-6 py-20 md:py-24 border-t border-white/[0.06] bg-[#0a0d16]">
        <div className="max-w-[1040px] mx-auto">
          <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-sky-300/70 mb-4">Results</p>
          <h2 className="break-keep text-[clamp(26px,3.6vw,40px)] font-bold leading-[1.25] tracking-[-0.03em]">업종이 달라도 보는 숫자는 같습니다.<br />유효 상담 수와 획득 비용.</h2>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {CASES.map((c) => (
              <div key={c.industry} className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
                <p className="text-[13px] text-white/50 mb-5">{c.industry} · {c.period}</p>
                <div className="flex items-baseline gap-2 mb-1"><span className="text-[34px] font-bold tracking-[-0.03em]">{c.leads}</span><span className="text-[13px] text-white/50">유효 상담</span></div>
                <div className="flex items-baseline gap-2 mb-5"><span className="text-[22px] font-semibold tracking-[-0.02em]">{c.cpl}</span><span className="text-[13px] text-white/50">상담당 획득 비용</span></div>
                <p className="text-[14px] text-white/60 leading-[1.7] break-keep">{c.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[13px] text-white/40">고객사명과 계정 화면은 상담 시 직접 보여드립니다. 수치는 Meta 광고 계정 기준 집계입니다.</p>
        </div>
      </section>

      {/* 프로세스 */}
      <section className="px-6 py-20 md:py-24 border-t border-white/[0.06]">
        <div className="max-w-[1040px] mx-auto">
          <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-sky-300/70 mb-4">How it goes</p>
          <h2 className="break-keep text-[clamp(26px,3.6vw,40px)] font-bold leading-[1.25] tracking-[-0.03em]">투자 대비 성과가 검증되면, 그때 광고 규모를 확대합니다.</h2>
          <div className="mt-12 grid md:grid-cols-5 gap-3">
            {[
              ["01", "진단", "현재 채널과 상담 전환 구조 점검. 같은 업종 획득 비용 범위 제시."],
              ["02", "설계", "타깃·소재·랜딩·폼·CRM 연결 설계. 유효 상담 기준 합의."],
              ["03", "라이브", "계약 후 1~2주 내 집행 시작. 상담은 첫날부터 대시보드로."],
              ["04", "검증", "4~8주. 광고비 → 유효 상담 → 계약 비율 확정."],
              ["05", "확대", "획득 비용이 유지되는 구간까지 단계적 예산 증액."],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-[12px] text-sky-300/70 font-semibold mb-2">{n}</p>
                <p className="text-[17px] font-bold mb-2">{t}</p>
                <p className="text-[13.5px] text-white/60 leading-[1.7] break-keep">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 md:py-24 border-t border-white/[0.06] bg-[#0a0d16]">
        <div className="max-w-[860px] mx-auto">
          <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-sky-300/70 mb-4">FAQ</p>
          <h2 className="break-keep text-[clamp(26px,3.6vw,40px)] font-bold leading-[1.25] tracking-[-0.03em]">자주 받는 질문</h2>
          <div className="mt-10 divide-y divide-white/10">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="cursor-pointer list-none flex justify-between items-start gap-6 text-[17px] font-semibold leading-[1.5] break-keep">{q}<span className="text-white/40 group-open:rotate-45 transition text-[22px] leading-none">+</span></summary>
                <p className="mt-3 text-[15px] text-white/60 leading-[1.85] break-keep">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 md:py-32 border-t border-white/[0.06]">
        <div className="max-w-[760px] mx-auto text-center">
          <h2 className="break-keep text-[clamp(28px,4vw,44px)] font-bold leading-[1.2] tracking-[-0.035em]">신규 고객 확보 채널을 검토하고 계신가요?</h2>
          <p className="mt-6 text-[16px] md:text-[17px] text-white/60 leading-[1.8] break-keep">현재 광고 구조와 상담 전환 흐름을 30분 안에 점검하고, 같은 업종의 획득 비용 범위를 보여드립니다. 숫자가 사업성에 맞지 않으면 진행을 권하지 않습니다.</p>
          <Link href="/consult" className="mt-9 inline-flex items-center gap-2 px-9 py-4 rounded-xl bg-white text-black text-[16px] font-semibold hover:bg-white/90 transition">상담 전환 구조 진단 받기 <ArrowRight className="w-4 h-4" /></Link>
          <p className="mt-4 text-[13px] text-white/40">평균 회신 3시간 이내 · 동시 운영 고객사 수 제한</p>
        </div>
      </section>
    </main>
  );
}

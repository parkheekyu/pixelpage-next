import { Metadata } from "next";
import AgencyClient from "./AgencyClient";

export const metadata: Metadata = {
  title: "마케팅 대행 — 광고비는 줄이고 매출은 폭발시키세요 | 픽셀페이지",
  description:
    "광고·랜딩·CRM을 하나의 팀이 운영합니다. 감이 아닌 데이터로 판단하고, 매출 파이프라인을 함께 설계해요.",
  openGraph: {
    title: "마케팅 대행 — 광고비는 줄이고 매출은 폭발시키세요 | 픽셀페이지",
    description:
      "광고·랜딩·CRM을 하나의 팀이 운영합니다. 감이 아닌 데이터로 판단하고, 매출 파이프라인을 함께 설계해요.",
    url: "https://pixelpage.co.kr/services/agency",
  },
  alternates: { canonical: "https://pixelpage.co.kr/services/agency" },
};

export default function Page() {
  return <AgencyClient />;
}

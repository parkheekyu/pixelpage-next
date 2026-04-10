import { Metadata } from "next";
import CasesClient from "./CasesClient";

export const metadata: Metadata = {
  title: "성과 · 서비스 소개서 | 픽셀페이지",
  description: "무형 서비스 브랜드와 함께한 실제 성과와 서비스별 소개서를 확인하세요. CTR 3.93%, ROAS 500%, 매출 6.6배 성장.",
};

export default function Page() {
  return <CasesClient />;
}

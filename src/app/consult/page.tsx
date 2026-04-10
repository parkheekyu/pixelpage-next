import { Metadata } from "next";
import ConsultClient from "./ConsultClient";

export const metadata: Metadata = {
  title: "무료 상담 신청 | 픽셀페이지",
  description: "브랜드를 함께 진단하고, 어떻게 팔 수 있는지 생각해 보는 것부터 시작합니다. 24시간 이내 담당자가 연락드립니다.",
};

export default function Page() {
  return <ConsultClient />;
}

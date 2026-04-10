import { Metadata } from "next";
import PerformanceClient from "./PerformanceClient";

export const metadata: Metadata = {
  title: "퍼포먼스 마케팅 | 픽셀페이지",
  description: "Meta·Google·토스·당근·TikTok — 무형 서비스에 특화된 서사형 광고로 구매 의향이 있는 관객을 정밀하게 찾아 전환합니다.",
};

export default function Page() {
  return <PerformanceClient />;
}

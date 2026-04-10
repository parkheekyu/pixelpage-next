import { Metadata } from "next";
import CrmClient from "./CrmClient";

export const metadata: Metadata = {
  title: "CRM 마케팅 | 픽셀페이지",
  description: "리드 수집부터 육성 자동화, 전환 최적화, 리텐션까지. 광고로 데려온 관객이 떠나지 않도록 4단계 자동화 퍼널을 설계합니다.",
};

export default function Page() {
  return <CrmClient />;
}

import { Metadata } from "next";
import ConsultingClient from "./ConsultingClient";

export const metadata: Metadata = {
  title: "마케팅 컨설팅 — 방향만 잡고 가셔도 괜찮습니다 | 픽셀페이지",
  description:
    "퍼널 진단부터 실행 플랜까지 — 인하우스 팀이 직접 실행할 수 있도록 돕는 마케팅 컨설팅.",
  openGraph: {
    title: "마케팅 컨설팅 — 방향만 잡고 가셔도 괜찮습니다 | 픽셀페이지",
    description:
      "퍼널 진단부터 실행 플랜까지 — 인하우스 팀이 직접 실행할 수 있도록 돕는 마케팅 컨설팅.",
    url: "https://pixelpage.co.kr/services/consulting",
  },
  alternates: { canonical: "https://pixelpage.co.kr/services/consulting" },
};

export default function Page() {
  return <ConsultingClient />;
}

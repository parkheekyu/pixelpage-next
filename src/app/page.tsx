import { Metadata } from "next";
import IndexClient from "./IndexClient";

export const metadata: Metadata = {
  title: "픽셀페이지 — 무형의 가치를 파는 브랜드 전담 에이전시",
  description: "교육·지식·경험·문화 — 만질 수 없는 가치를 파는 브랜드의 전담 마케팅 파트너. 퍼포먼스 광고, 브랜디드 콘텐츠, SEO, CRM 자동화, 웹 빌드.",
};

export default function Page() {
  return <IndexClient />;
}

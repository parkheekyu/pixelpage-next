import { Metadata } from "next";
import IndexClient from "./IndexClient";

export const metadata: Metadata = {
  title: "픽셀페이지 — AI 시대 한 걸음 앞서가세요",
  description: "AI 시대, 한 걸음 앞서가는 브랜드를 위한 전담 마케팅 파트너. 퍼포먼스 광고, 브랜디드 콘텐츠, SEO, CRM 자동화, 웹 빌드.",
};

export default function Page() {
  return <IndexClient />;
}

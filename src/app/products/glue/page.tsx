import { Metadata } from "next";
import GlueClient from "./GlueClient";

export const metadata: Metadata = {
  title: "글루 — 리드 수집 · 메시지 자동화 CRM SaaS | 픽셀페이지",
  description: "리드를 모으고, 그룹으로 관리하고, 문자·알림톡·친구톡·이메일을 자동 발송하는 올인원 CRM SaaS. 5분이면 시작합니다.",
};

export default function Page() {
  return <GlueClient />;
}

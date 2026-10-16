import type { Metadata } from "next";
import DbClient from "./DbClient";

export const metadata: Metadata = {
  title: "DB 마케팅 전문팀, 픽셀페이지",
  description: "성과 내는 기업엔 공통점이 있습니다. DB 마케팅을 제대로 한다는 것. 대표가 직접 운영하는 DB 마케팅 전문팀.",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null },
  openGraph: { title: "DB 마케팅 전문팀, 픽셀페이지", description: "성과 내는 기업엔 공통점이 있습니다. DB 마케팅을 제대로 한다는 것.", url: "https://pixelpage.co.kr/db", siteName: "픽셀페이지", locale: "ko_KR", type: "website" },
};

export default function Page() {
  return <DbClient />;
}

import type { Metadata } from "next";
import LpClient from "./LpClient";
import { getPublishedArticles } from "@/lib/notion";

export const metadata: Metadata = {
  title: "픽셀페이지 · DB 마케팅 전담 파트너 | 광고비 줄이고 매출 폭발",
  description:
    "교육·코칭·전문 서비스 브랜드 전담 DB 마케팅. 3개월 안에 문의량 3배, 광고비 대비 매출로만 증명합니다. 무료 진단 신청.",
  robots: { index: false, follow: false, nocache: true },
};

export const revalidate = 3600;

export default async function Page() {
  const articles = await getPublishedArticles();
  const recentArticles = articles.filter((a) => a.slug).slice(0, 3);
  return <LpClient articles={recentArticles} />;
}

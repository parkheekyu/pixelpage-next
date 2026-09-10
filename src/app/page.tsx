import type { Metadata } from "next";
import LpClient from "./lp/LpClient";
import { getPublishedArticles } from "@/lib/notion";

export const metadata: Metadata = {
  title: "픽셀페이지 · DB 마케팅 전담 파트너 | 매출 성장의 진짜 파트너",
  description:
    "교육·코칭·전문 서비스 브랜드 전담 DB 마케팅. 광고·랜딩·CRM을 하나의 팀이 설계·분석·개선합니다. 파트너형 DB 도입 문의.",
};

export const revalidate = 3600;

export default async function Page() {
  const articles = await getPublishedArticles();
  const recentArticles = articles.filter((a) => a.slug).slice(0, 3);
  return <LpClient articles={recentArticles} />;
}

import type { Metadata } from "next";
import LpClient from "./lp/LpClient";
import { getPublishedArticles } from "@/lib/notion";

export const metadata: Metadata = {
  title: "픽셀페이지 · 매출 성장을 함께 달리는 DB 파트너",
  description:
    "매출 성장의 진짜 파트너가 되겠습니다. 광고·랜딩·CRM을 하나의 팀이 설계·분석·개선하는 파트너형 DB 마케팅.",
};

export const revalidate = 3600;

export default async function Page() {
  const articles = await getPublishedArticles();
  const recentArticles = articles.filter((a) => a.slug).slice(0, 3);
  return <LpClient articles={recentArticles} />;
}

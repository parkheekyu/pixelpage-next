import { Metadata } from "next";
import { getPublishedArticles } from "@/lib/notion";
import ColumnsClient from "./ColumnsClient";

export const metadata: Metadata = {
  title: "칼럼 | 픽셀페이지",
  description:
    "무형 서비스 마케팅에 대한 인사이트와 실전 가이드. 교육, 코칭, 컨설팅 브랜드를 위한 마케팅 칼럼.",
};

export const revalidate = 3600;

export default async function Page() {
  const articles = await getPublishedArticles();
  return <ColumnsClient articles={articles} />;
}

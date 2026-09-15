import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublishedArticles,
  getArticleBySlug,
  getArticleContent,
} from "@/lib/notion";
import ArticleClient from "./ArticleClient";

export const revalidate = 3600;

/** 한글 slug는 퍼센트 인코딩된 채로 들어온다 → Notion의 원문 slug와 맞추기 위해 디코딩 */
function decodeSlug(raw: string): string {
  try { return decodeURIComponent(raw); } catch { return raw; }
}
export const dynamicParams = true;

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = decodeSlug((await params).slug);
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "칼럼 | 픽셀페이지" };
  }

  return {
    title: `${article.title} | 픽셀페이지`,
    description: article.description || undefined,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = decodeSlug((await params).slug);
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const [content, allArticles] = await Promise.all([
    getArticleContent(article.id),
    getPublishedArticles(),
  ]);

  const recentArticles = allArticles
    .filter((a) => a.slug && a.slug !== slug)
    .slice(0, 5);

  return <ArticleClient article={article} content={content} recentArticles={recentArticles} />;
}

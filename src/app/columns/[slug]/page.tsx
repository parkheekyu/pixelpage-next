import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublishedArticles,
  getArticleBySlug,
  getArticleContent,
} from "@/lib/notion";
import ArticleClient from "./ArticleClient";
import { isAscii, toAsciiSlug } from "@/lib/slug";

export const revalidate = 3600;

/** 퍼센트 인코딩 해제 + 한글이면 로마자 slug 로 정규화 (Notion 에는 ASCII slug 만 저장한다) */
function decodeSlug(raw: string): string {
  let s = raw;
  try { s = decodeURIComponent(raw); } catch {}
  return isAscii(s) ? s : toAsciiSlug(s);
}
export const dynamicParams = true;

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.filter((a) => a.slug && isAscii(a.slug)).map((a) => ({ slug: a.slug }));
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

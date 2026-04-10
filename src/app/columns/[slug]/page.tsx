import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublishedArticles,
  getArticleBySlug,
  getArticleContent,
} from "@/lib/notion";
import ArticleClient from "./ArticleClient";

export const revalidate = 3600;
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
  const { slug } = await params;
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
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const content = await getArticleContent(article.id);

  return <ArticleClient article={article} content={content} />;
}

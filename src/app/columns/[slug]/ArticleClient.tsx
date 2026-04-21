"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Reveal from "@/components/Reveal";
import type { Article } from "@/lib/notion";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

interface Props {
  article: Article;
  content: string;
}

const ArticleClient = ({ article, content }: Props) => (
  <div>
    {/* Hero */}
    <section className="pt-32 pb-24 lg:pb-32 bg-[#0a0f1e] text-white">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Link
          href="/columns"
          className="inline-flex items-center gap-1.5 text-[12px] text-white/50 hover:text-blue-500 transition-colors mb-10"
        >
          <ArrowLeft className="w-3 h-3" /> 칼럼 목록
        </Link>
        <Reveal>
          {article.category && (
            <p className="text-[12px] tracking-[0.1em] uppercase text-blue-500 mb-6">
              {article.category}
            </p>
          )}
          <h1 className="break-keep text-[clamp(36px,6vw,72px)] font-bold text-white leading-[1.12] tracking-[-0.03em] mb-6">
            {article.title}
          </h1>
          {article.date && (
            <p className="text-[14px] text-white/50">{formatDate(article.date)}</p>
          )}
        </Reveal>
      </div>
    </section>

    {/* Content */}
    <section className="py-28 lg:py-36 bg-white">
      <div className="max-w-[760px] mx-auto px-6 lg:px-12">
        <Reveal>
          <div className="article-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </Reveal>

        <Reveal className="mt-20 pt-10 border-t border-[#e5e7eb]">
          <Link
            href="/columns"
            className="inline-flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-blue-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 칼럼 목록으로 돌아가기
          </Link>
        </Reveal>
      </div>
    </section>

    {/* CTA */}
    <section className="py-28 lg:py-36 bg-[#fbfbfb] text-center border-t border-[#e5e7eb]">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <h2 className="break-keep text-[clamp(32px,4.5vw,56px)] font-bold text-foreground leading-[1.12] tracking-[-0.03em] mb-4">
            우리 브랜드에 맞는 전략이 궁금하신가요?
          </h2>
          <p className="text-[18px] text-muted-foreground mb-8 max-w-[440px] mx-auto leading-[1.85]">
            무료 상담에서 브랜드를 함께 진단하고, 최적의 서비스 조합을 제안드립니다.
          </p>
          <Link
            href="/consult"
            className="inline-flex items-center gap-2 px-9 py-4 bg-[#0a0f1e] text-white text-[14px] font-bold tracking-[0.05em] rounded-xl hover:opacity-90 transition-all hover:-translate-y-0.5"
          >
            무료 상담 신청 <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  </div>
);

export default ArticleClient;

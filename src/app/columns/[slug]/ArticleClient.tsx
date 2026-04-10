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
    <section className="pt-32 pb-24 lg:pb-32 bg-dark text-cream">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Link
          href="/columns"
          className="inline-flex items-center gap-1.5 text-[12px] text-cream/50 hover:text-primary transition-colors mb-10"
        >
          <ArrowLeft className="w-3 h-3" /> 칼럼 목록
        </Link>
        <Reveal>
          {article.category && (
            <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">
              {article.category}
            </p>
          )}
          <h1 className="font-serif break-keep text-[clamp(30px,4.5vw,52px)] font-normal text-cream leading-[1.2] tracking-[-0.02em] mb-6">
            {article.title}
          </h1>
          {article.date && (
            <p className="text-[14px] text-cream/50">{formatDate(article.date)}</p>
          )}
        </Reveal>
      </div>
    </section>

    {/* Content */}
    <section className="py-32 lg:py-40 bg-background">
      <div className="max-w-[760px] mx-auto px-6 lg:px-12">
        <Reveal>
          <div className="article-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </Reveal>

        <Reveal className="mt-20 pt-10 border-t border-border">
          <Link
            href="/columns"
            className="inline-flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 칼럼 목록으로 돌아가기
          </Link>
        </Reveal>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 bg-background text-center border-t border-border">
      <div className="max-w-[1240px] mx-auto px-6">
        <Reveal>
          <h2 className="font-serif break-keep text-[clamp(24px,3vw,36px)] font-normal text-foreground mb-4">
            우리 브랜드에 맞는 전략이 궁금하신가요?
          </h2>
          <p className="text-[15px] text-muted-foreground mb-8 max-w-[440px] mx-auto leading-[1.9]">
            무료 상담에서 브랜드를 함께 진단하고, 최적의 서비스 조합을 제안드립니다.
          </p>
          <Link
            href="/consult"
            className="inline-flex items-center gap-2 px-9 py-4 bg-primary text-primary-foreground text-[14px] font-bold tracking-[0.05em] hover:bg-gold-light transition-all hover:-translate-y-0.5"
          >
            무료 상담 신청 <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  </div>
);

export default ArticleClient;

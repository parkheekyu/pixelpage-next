"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import type { Article } from "@/lib/notion";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

const ColumnsClient = ({ articles }: { articles: Article[] }) => (
  <div>
    {/* Hero */}
    <section className="pt-32 pb-24 lg:pb-32 bg-dark text-cream">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[12px] text-cream/50 hover:text-primary transition-colors mb-10"
        >
          <ArrowLeft className="w-3 h-3" /> 홈으로
        </Link>
        <Reveal>
          <p className="font-display text-[13px] tracking-[0.25em] uppercase text-primary mb-6">
            Column
          </p>
          <h1 className="font-serif break-keep text-[clamp(36px,5vw,64px)] font-normal text-cream leading-[1.15] tracking-[-0.02em] mb-6">
            칼럼
          </h1>
          <p className="text-[17px] text-cream/70 leading-[1.85] max-w-[520px]">
            무형 서비스 마케팅에 대한 인사이트와 실전 가이드.
          </p>
        </Reveal>
      </div>
    </section>

    {/* Article Grid */}
    <section className="py-32 lg:py-40 bg-background">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        {articles.length === 0 ? (
          <Reveal>
            <p className="text-center text-muted-foreground text-[17px] py-20">
              준비 중입니다.
            </p>
          </Reveal>
        ) : (
          <Reveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/columns/${article.slug}`}
                className="group border border-border rounded-lg p-8 hover:shadow-card-hover transition-shadow flex flex-col"
              >
                {article.category && (
                  <span className="text-[12px] font-medium tracking-[0.08em] uppercase text-primary mb-3">
                    {article.category}
                  </span>
                )}
                <h3 className="font-serif break-keep text-[20px] font-normal text-foreground leading-[1.4] mb-3 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                {article.description && (
                  <p className="text-[14px] text-muted-foreground leading-[1.85] mb-4 line-clamp-3 flex-1">
                    {article.description}
                  </p>
                )}
                {article.date && (
                  <span className="text-[12px] text-muted-foreground/60 mt-auto">
                    {formatDate(article.date)}
                  </span>
                )}
              </Link>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  </div>
);

export default ColumnsClient;

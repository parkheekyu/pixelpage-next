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
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(d.getDate()).padStart(2, "0")}`;
}

interface Props {
  article: Article;
  content: string;
}

const ArticleClient = ({ article, content }: Props) => (
  <div>
    {/* Hero — generic "무료 칼럼" 헤더 */}
    <section className="pt-32 pb-14 lg:pb-20 bg-[#0a0f1e] text-white">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Link
          href="/columns"
          className="inline-flex items-center gap-1.5 text-[12px] text-white/50 hover:text-blue-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-3 h-3" /> 칼럼 목록
        </Link>
        <Reveal>
          <p className="text-[12px] font-semibold tracking-[0.22em] uppercase text-blue-400 mb-4">
            Free Column
          </p>
          <h2 className="break-keep text-[clamp(28px,4.5vw,44px)] font-bold text-white leading-[1.2] tracking-[-0.03em]">
            무료 칼럼
          </h2>
          <p className="mt-3 text-[14px] md:text-[15px] text-white/50">
            픽셀페이지가 실제 굴린 인사이트를 매주 공유해요.
          </p>
        </Reveal>
      </div>
    </section>

    {/* Naver blog style article card */}
    <section className="py-12 lg:py-16 bg-[#f6f8fb]">
      <div className="max-w-[820px] mx-auto px-4 lg:px-6">
        <article className="bg-white rounded-2xl border border-[#e5e7eb] shadow-[0_4px_18px_-8px_rgba(15,23,41,0.08)] overflow-hidden">
          {/* 카테고리 + 제목 + 메타 */}
          <header className="px-6 md:px-10 lg:px-14 pt-10 md:pt-14 pb-6">
            {article.category && (
              <span className="inline-flex items-center text-[11.5px] font-semibold tracking-[0.06em] text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-5">
                {article.category}
              </span>
            )}
            <h1 className="break-keep text-[clamp(24px,3.6vw,34px)] font-bold text-[#0a0f1e] leading-[1.35] tracking-[-0.025em] mb-5">
              {article.title}
            </h1>
            <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
              <span className="font-semibold text-[#0a0f1e]">픽셀페이지</span>
              <span className="w-px h-3 bg-[#e5e7eb]" />
              <span className="font-mono tabular-nums">{formatDate(article.date)}</span>
            </div>
          </header>

          {/* 커버 이미지 (있으면) */}
          {article.coverImage && (
            <div className="px-6 md:px-10 lg:px-14">
              <div className="rounded-xl overflow-hidden border border-[#e5e7eb] bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-auto block"
                />
              </div>
            </div>
          )}

          {/* 본문 */}
          <div className="px-6 md:px-10 lg:px-14 py-10 md:py-14">
            <div className="article-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          </div>

          {/* 하단 액션 */}
          <footer className="px-6 md:px-10 lg:px-14 py-6 border-t border-[#e5e7eb] bg-[#fbfbfb] flex items-center justify-between">
            <Link
              href="/columns"
              className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 칼럼 목록
            </Link>
            <Link
              href="/consult"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              무료 상담 신청 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </footer>
        </article>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 lg:py-32 bg-white text-center border-t border-[#e5e7eb]">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Reveal>
          <h2 className="break-keep text-[clamp(28px,4vw,44px)] font-bold text-foreground leading-[1.2] tracking-[-0.03em] mb-4">
            우리 브랜드에 맞는 전략이<br />궁금하신가요?
          </h2>
          <p className="text-[16px] text-muted-foreground mb-8 max-w-[440px] mx-auto leading-[1.85]">
            무료 상담에서 브랜드를 함께 진단하고,<br />최적의 서비스 조합을 제안드립니다.
          </p>
          <Link
            href="/consult"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0a0f1e] text-white text-[14px] font-bold tracking-[0.05em] rounded-xl hover:opacity-90 transition-all hover:-translate-y-0.5"
          >
            무료 상담 신청 <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  </div>
);

export default ArticleClient;

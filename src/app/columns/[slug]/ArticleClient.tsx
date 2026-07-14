"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, MoreVertical, Link2, Check } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Reveal from "@/components/Reveal";
import logoDark from "@/assets/logo-dark.png";
import type { Article } from "@/lib/notion";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}

// ReactMarkdown이 한글 사이 `**볼드**` 파싱을 놓치는 이슈 우회
function preprocessMarkdown(md: string): string {
  return md.replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>");
}

interface Props {
  article: Article;
  content: string;
  recentArticles?: Article[];
}

const ArticleClient = ({ article, content, recentArticles = [] }: Props) => {
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* noop */ }
  };

  return (
    <div className="bg-white">
      {/* Hero — 무료 칼럼 (고정) */}
      <section className="pt-32 pb-14 lg:pb-16 bg-[#0a0f1e] text-white">
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

      {/* Article — 네이버 블로그 스타일 */}
      <section className="pt-14 pb-16 lg:pt-20 lg:pb-24 bg-white">
        <article className="max-w-[820px] mx-auto px-6 lg:px-8">
          {/* 카테고리 (작은 회색) */}
          {article.category && (
            <p className="text-[13px] text-[#8b95a1] mb-3">{article.category}</p>
          )}

          {/* 제목 (큰 폰트, 살짝 세리프 느낌 대신 굵은 산세리프) */}
          <h1 className="break-keep text-[clamp(26px,4vw,38px)] font-bold text-[#1c1f23] leading-[1.35] tracking-[-0.02em] mb-8">
            {article.title}
          </h1>

          {/* 작성자 행 */}
          <div className="flex items-center gap-3 pb-5 border-b border-[#e5e7eb]">
            <div className="w-10 h-10 rounded-full bg-white border border-[#e5e7eb] flex-shrink-0 flex items-center justify-center overflow-hidden p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoDark.src} alt="픽셀페이지" className="w-full h-auto object-contain" />
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-2 text-[13px] text-[#1c1f23]">
              <span className="font-semibold">픽셀페이지</span>
              <span className="text-[#c4c9d1]">·</span>
              <span className="text-[#8b95a1] font-mono tabular-nums">{formatDate(article.date)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#6b7280]">
              <button
                onClick={copyUrl}
                className="inline-flex items-center gap-1 text-[12px] px-2.5 py-1.5 rounded hover:bg-[#f3f4f6] transition-colors"
                aria-label="URL 복사"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Link2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? "복사됨" : "URL 복사"}</span>
              </button>
              <button
                type="button"
                className="p-1.5 rounded hover:bg-[#f3f4f6] transition-colors"
                aria-label="더보기"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 커버 이미지 (본문 상단) */}
          {article.coverImage && (
            <div className="mt-8">
              <div className="rounded-xl overflow-hidden bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.coverImage} alt={article.title} className="w-full h-auto block" />
              </div>
            </div>
          )}

          {/* 본문 */}
          <div className="article-content mt-10">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {preprocessMarkdown(content)}
            </ReactMarkdown>
          </div>

          {/* 하단 액션 */}
          <div className="mt-14 pt-6 border-t border-[#e5e7eb] flex items-center justify-between">
            <Link
              href="/columns"
              className="inline-flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 칼럼 목록
            </Link>
            <Link
              href="/consult"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue-600 hover:text-blue-700"
            >
              무료 상담 신청 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 최근 칼럼 5개 */}
          {recentArticles.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-[#1c1f23]">이 블로그의 최근 글</h3>
                <Link
                  href="/columns"
                  className="text-[12px] text-[#8b95a1] hover:text-blue-600 transition-colors"
                >
                  전체보기 →
                </Link>
              </div>
              <ul className="border-t border-[#e5e7eb]">
                {recentArticles.map((a) => (
                  <li key={a.id} className="border-b border-[#f0f2f5]">
                    <Link
                      href={`/columns/${a.slug}`}
                      className="group grid grid-cols-[1fr_100px] gap-4 py-3.5 items-center hover:bg-[#fafbfc] px-2 -mx-2 rounded transition-colors"
                    >
                      <span className="text-[14px] text-[#1c1f23] group-hover:text-blue-600 transition-colors truncate">
                        {a.title}
                      </span>
                      <span className="text-right text-[12px] text-[#8b95a1] font-mono tabular-nums">
                        {formatDate(a.date)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-[#fbfbfb] text-center border-t border-[#e5e7eb]">
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
};

export default ArticleClient;

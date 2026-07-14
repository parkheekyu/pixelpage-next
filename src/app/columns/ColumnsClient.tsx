"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
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
    <section className="pt-32 pb-20 lg:pb-28 bg-[#0a0f1e] text-white">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[12px] text-white/50 hover:text-blue-400 transition-colors mb-10"
        >
          <ArrowLeft className="w-3 h-3" /> 홈으로
        </Link>
        <Reveal>
          <p className="text-[12px] font-semibold tracking-[0.22em] uppercase text-blue-400 mb-6">
            Column
          </p>
          <h1 className="break-keep text-[clamp(36px,6vw,64px)] font-bold text-white leading-[1.12] tracking-[-0.03em] mb-6">
            매출로 이어지는<br />마케팅 실전 칼럼
          </h1>
          <p className="text-[16px] md:text-[17px] text-white/55 leading-[1.85] max-w-[540px]">
            픽셀페이지가 실제 광고비를 굴리며 검증한 인사이트를 정리해요.<br />
            대표님이 시행착오에 들일 시간을 아껴 드릴게요.
          </p>
        </Reveal>
      </div>
    </section>

    {/* Bulletin board list */}
    <section className="py-20 lg:py-24 bg-white">
      <div className="max-w-[960px] mx-auto px-6 lg:px-12">
        {articles.length === 0 ? (
          <Reveal>
            <p className="text-center text-muted-foreground text-[18px] leading-[1.85] py-20">
              준비 중입니다.
            </p>
          </Reveal>
        ) : (
          <Reveal>
            {/* 헤더 (데스크톱) */}
            <div className="hidden md:grid grid-cols-[64px_88px_1fr_100px] gap-6 items-center px-5 py-4 border-b-2 border-[#0a0f1e] text-[12px] font-bold tracking-[0.12em] uppercase text-[#0a0f1e]">
              <span className="text-center">No.</span>
              <span>카테고리</span>
              <span>제목</span>
              <span className="text-right">작성일</span>
            </div>

            {/* 행 */}
            <ul>
              {articles.map((article, idx) => (
                <li key={article.id} className="border-b border-[#e5e7eb]">
                  <Link
                    href={`/columns/${article.slug}`}
                    className="group grid grid-cols-[1fr_80px] md:grid-cols-[64px_88px_1fr_100px] gap-3 md:gap-6 items-start md:items-center px-3 md:px-5 py-5 md:py-6 hover:bg-[#f6f8fb] transition-colors"
                  >
                    {/* 번호 (데스크톱만) */}
                    <span className="hidden md:block text-center text-[13px] font-mono text-muted-foreground tabular-nums">
                      {String(articles.length - idx).padStart(2, "0")}
                    </span>

                    {/* 카테고리 (데스크톱만) */}
                    <span className="hidden md:inline-flex items-center justify-center text-[11px] font-semibold tracking-[0.06em] text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit">
                      {article.category || "칼럼"}
                    </span>

                    {/* 제목 + description */}
                    <div className="min-w-0 col-span-1">
                      {/* 모바일: 카테고리 위에 */}
                      <span className="md:hidden inline-flex text-[11px] font-semibold tracking-[0.06em] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-2">
                        {article.category || "칼럼"}
                      </span>
                      <h3 className="text-[16px] md:text-[17px] font-semibold text-foreground leading-[1.5] group-hover:text-blue-600 transition-colors line-clamp-2 tracking-[-0.015em]">
                        {article.title}
                      </h3>
                      {article.description && (
                        <p className="text-[13px] md:text-[13.5px] text-muted-foreground/80 mt-1.5 line-clamp-1 leading-[1.65]">
                          {article.description}
                        </p>
                      )}
                    </div>

                    {/* 날짜 */}
                    <span className="text-right text-[12px] md:text-[13px] font-mono text-muted-foreground tabular-nums self-start md:self-center">
                      {formatDate(article.date)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* 총 개수 */}
            <div className="mt-8 flex items-center justify-between px-3 md:px-5 text-[12px] text-muted-foreground">
              <span>총 <strong className="text-foreground">{articles.length}</strong>개의 칼럼</span>
              <Link
                href="/consult"
                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold"
              >
                무료 상담 신청 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  </div>
);

export default ColumnsClient;

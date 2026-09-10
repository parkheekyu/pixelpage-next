"use client";

import Image from "next/image";
import { MessageSquare } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";

type Props = {
  /**
   * true → anchor links resolve on-page (`#solution`).
   * false → anchor links resolve to root (`/#solution`) so they work from /columns etc.
   */
  onLp?: boolean;
};

const anchor = (onLp: boolean, id: string) => (onLp ? `#${id}` : `/#${id}`);

export default function LpNavbar({ onLp = false }: Props) {
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1120px,calc(100%-24px))]">
      <div className="rounded-full bg-[#0e0e18]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_18px_50px_-20px_rgba(0,0,0,0.7)] px-5 py-2.5 flex items-center gap-2">
        <a href="/" className="flex items-center gap-2 pl-1 pr-3">
          <Image src={logoWhite} alt="PixelPage" width={100} height={20} className="h-5 w-auto" />
        </a>
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center text-[16px]">
          <a href={anchor(onLp, "solution")} className="px-3.5 py-2 rounded-full text-white/60 hover:text-white">소개</a>
          <a href={anchor(onLp, "process")} className="px-3.5 py-2 rounded-full text-white/60 hover:text-white">진행 방식</a>
          <a href={anchor(onLp, "faq")} className="px-3.5 py-2 rounded-full text-white/60 hover:text-white">FAQ</a>
          <a href="/columns" className="px-3.5 py-2 rounded-full text-white/60 hover:text-white">무료 칼럼</a>
        </nav>
        <a
          href={anchor(onLp, "cta")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-400/40 text-white text-[16px] font-medium"
        >
          <span className="w-6 h-6 rounded-full bg-sky-500/25 flex items-center justify-center">
            <MessageSquare className="w-3 h-3 text-sky-300" />
          </span>
          파트너형 DB 도입
        </a>
      </div>
    </header>
  );
}

"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
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
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // 히어로(대략 첫 화면) 지나면 하단 + 블루 그라디언트로 전환
      setPastHero(window.scrollY > window.innerHeight * 0.75);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed left-1/2 -translate-x-1/2 z-50 w-[min(1120px,calc(100%-24px))] transition-[top,bottom] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        pastHero ? "top-auto bottom-4" : "top-4 bottom-auto"
      }`}
    >
      <div
        className="rounded-full backdrop-blur-xl shadow-[0_18px_50px_-20px_rgba(0,0,0,0.7)] px-5 py-2.5 flex items-center gap-2 border transition-[background,border-color] duration-500 ease-out"
        style={{
          background: pastHero
            ? "linear-gradient(90deg, #4396F8 0%, #4FAFF9 50%, #59C3FA 100%)"
            : "rgba(14, 14, 24, 0.85)",
          borderColor: pastHero ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
        }}
      >
        <a href="/" className="flex items-center gap-2 pl-1 pr-3">
          <Image src={logoWhite} alt="PixelPage" width={100} height={20} className="h-5 w-auto" />
        </a>
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center text-[16px]">
          <a href={anchor(onLp, "solution")} className="px-3.5 py-2 rounded-full text-white/80 hover:text-white">소개</a>
          <a href={anchor(onLp, "process")} className="px-3.5 py-2 rounded-full text-white/80 hover:text-white">진행 방식</a>
          <a href={anchor(onLp, "faq")} className="px-3.5 py-2 rounded-full text-white/80 hover:text-white">FAQ</a>
          <a href="/columns" className="px-3.5 py-2 rounded-full text-white/80 hover:text-white">무료 칼럼</a>
        </nav>
        <a
          href={anchor(onLp, "cta")}
          className={`ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-[15px] md:text-[16px] font-medium whitespace-nowrap border transition-colors duration-500 ${
            pastHero ? "border-white/50 bg-white/10 hover:bg-white/20" : "border-sky-400/40 hover:border-sky-300/60"
          }`}
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-500 ${
              pastHero ? "bg-white/25" : "bg-sky-500/25"
            }`}
          >
            <MessageSquare className={`w-3 h-3 transition-colors duration-500 ${pastHero ? "text-white" : "text-sky-300"}`} />
          </span>
          파트너형 DB 도입
        </a>
      </div>
    </header>
  );
}

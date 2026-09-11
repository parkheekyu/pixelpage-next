"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const [offsetY, setOffsetY] = useState(16);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handleMq = () => setIsMobile(mq.matches);
    handleMq();
    mq.addEventListener("change", handleMq);

    const recompute = () => {
      const scrolledPastHero = window.scrollY > window.innerHeight * 0.75;
      setPastHero(scrolledPastHero);
      const isMobileNow = mq.matches;
      const navH = shellRef.current?.offsetHeight ?? 56;
      if (isMobileNow && scrolledPastHero) {
        setOffsetY(window.innerHeight - navH - 16);
      } else {
        setOffsetY(16);
      }
    };
    window.addEventListener("scroll", recompute, { passive: true });
    window.addEventListener("resize", recompute);
    recompute();

    return () => {
      mq.removeEventListener("change", handleMq);
      window.removeEventListener("scroll", recompute);
      window.removeEventListener("resize", recompute);
    };
  }, []);

  const bottomMode = isMobile && pastHero;

  return (
    <header
      className="fixed left-1/2 z-50 w-[min(1120px,calc(100%-24px))] will-change-transform"
      style={{
        top: 0,
        transform: `translate3d(-50%, ${offsetY}px, 0)`,
        transition:
          "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div
        ref={shellRef}
        className="rounded-full backdrop-blur-xl shadow-[0_18px_50px_-20px_rgba(0,0,0,0.7)] px-5 py-2.5 flex items-center gap-2 border"
        style={{
          background: bottomMode
            ? "linear-gradient(90deg, #4396F8 0%, #4FAFF9 50%, #59C3FA 100%)"
            : "rgba(14, 14, 24, 0.85)",
          borderColor: bottomMode ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
          transition: "background 700ms ease-out, border-color 700ms ease-out",
        }}
      >
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
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-400/40 text-white text-[15px] md:text-[16px] font-medium whitespace-nowrap"
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

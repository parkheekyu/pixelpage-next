"use client";

import { usePathname } from "next/navigation";

const HIDDEN_PATHS = ["/info"];
const KAKAO_URL = "http://pf.kakao.com/_cxccdX/chat";

const KakaoFloatButton = () => {
  const pathname = usePathname();
  if (HIDDEN_PATHS.includes(pathname)) return null;

  return (
    <a
      href={KAKAO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="카카오톡 채널 상담하기"
      className="fixed bottom-5 right-5 md:bottom-7 md:right-7 z-[100] group"
    >
      <div
        className="relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-[0_10px_28px_-6px_rgba(0,0,0,0.28)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_32px_-6px_rgba(0,0,0,0.35)]"
        style={{ background: "#FEE500" }}
      >
        {/* KakaoTalk 로고 — 노란 말풍선 + 검정 TALK */}
        <svg
          viewBox="0 0 40 40"
          className="w-8 h-8 md:w-9 md:h-9"
          aria-hidden="true"
        >
          {/* 말풍선 (검정) */}
          <path
            fill="#181600"
            d="M20 6C11.2 6 4 11.6 4 18.5c0 4.5 3.1 8.4 7.7 10.6l-1.5 5.5c-.2.7.5 1.2 1.1.9l6.6-4.4c.7.1 1.4.1 2.1.1 8.8 0 16-5.6 16-12.7C36 11.6 28.8 6 20 6z"
          />
          {/* TALK 텍스트 (노란색으로 뚫음) */}
          <text
            x="20"
            y="22.5"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="900"
            fontFamily="Arial Black, sans-serif"
            fill="#FEE500"
            letterSpacing="-0.5"
          >
            TALK
          </text>
        </svg>

        {/* 은은한 펄스 링 */}
        <span
          className="absolute inset-0 rounded-full pointer-events-none opacity-70"
          style={{
            boxShadow: "0 0 0 0 rgba(254,229,0,0.6)",
            animation: "kakao-pulse 2.4s ease-out infinite",
          }}
        />
      </div>

      {/* 툴팁 — 데스크톱에서만 hover 시 노출 */}
      <span className="hidden md:inline-flex absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#0a0f1e] text-white text-[13px] font-semibold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        카카오톡 상담
      </span>

      <style jsx>{`
        @keyframes kakao-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(254, 229, 0, 0.55);
          }
          70% {
            box-shadow: 0 0 0 14px rgba(254, 229, 0, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(254, 229, 0, 0);
          }
        }
      `}</style>
    </a>
  );
};

export default KakaoFloatButton;

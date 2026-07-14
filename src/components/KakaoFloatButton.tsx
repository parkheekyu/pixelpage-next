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
        {/* KakaoTalk 스타일 말풍선 SVG */}
        <svg
          viewBox="0 0 24 24"
          className="w-7 h-7 md:w-8 md:h-8"
          fill="#181600"
          aria-hidden="true"
        >
          <path d="M12 3C6.48 3 2 6.48 2 10.77c0 2.73 1.83 5.13 4.6 6.5-.2.7-.72 2.54-.83 2.94-.13.5.18.5.38.36.16-.1 2.53-1.72 3.56-2.42.75.11 1.52.17 2.29.17 5.52 0 10-3.48 10-7.55C22 6.48 17.52 3 12 3z" />
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

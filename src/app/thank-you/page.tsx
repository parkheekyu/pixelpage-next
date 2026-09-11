import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, ArrowRight, MessageSquare, UserPlus } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";

const KAKAO_CHAT_URL = "http://pf.kakao.com/_cxccdX/chat";
const KAKAO_CHANNEL_URL = "http://pf.kakao.com/_cxccdX";

export const metadata: Metadata = {
  title: "신청 완료 · 픽셀페이지",
  description: "파트너형 DB 마케팅 도입 문의 신청이 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.",
  robots: { index: false, follow: false, nocache: true },
};

export default function Page() {
  return (
    <main className="bg-[#08080d] text-white min-h-screen relative overflow-hidden flex items-center justify-center px-6 py-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 900px 500px at 50% 0%, rgba(56,189,248,0.18) 0%, transparent 60%), radial-gradient(ellipse 700px 400px at 20% 100%, rgba(37,99,235,0.16) 0%, transparent 65%)",
        }}
      />

      <div className="relative max-w-[560px] mx-auto text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-16">
          <Image src={logoWhite} alt="PixelPage" width={120} height={24} className="h-6 w-auto opacity-90" />
        </Link>

        <div className="w-16 h-16 mx-auto mb-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#4090f7" }}>
          <Check className="w-8 h-8 text-white" strokeWidth={3} />
        </div>

        <h1 className="break-keep text-[clamp(28px,5vw,44px)] font-extrabold leading-[1.2] tracking-[-0.03em] mb-4">
          <span className="font-normal text-white/40">신청이</span><br />
          <span className="text-white">접수되었습니다.</span>
        </h1>
        <p className="text-[16px] md:text-[17px] text-white/60 leading-[1.85] mb-10">
          빠른 시일 내에 연락드리겠습니다.<br />
          아래 카카오톡 채널을 추가해두시면 놓치지 않고 안내받으실 수 있습니다.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <a
            href={KAKAO_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#FEE500] text-[#181600] text-[15px] font-bold whitespace-nowrap hover:brightness-95"
          >
            <UserPlus className="w-4 h-4" /> 카카오톡 채널 추가하기
          </a>
          <a
            href={KAKAO_CHAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#FEE500]/60 text-[#FEE500] text-[15px] font-semibold whitespace-nowrap hover:bg-[#FEE500]/10 transition-colors"
          >
            <MessageSquare className="w-4 h-4" /> 카카오톡으로 바로 문의
          </a>
        </div>

        <div className="mb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[14px] text-white/50 hover:text-white transition-colors"
          >
            홈으로 돌아가기 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="pt-10 border-t border-white/[0.06] text-left">
          <p className="text-[12px] font-semibold tracking-[0.18em] uppercase text-white/40 mb-3">
            Next Steps
          </p>
          <ul className="space-y-3 text-[14.5px] text-white/70 leading-[1.7]">
            <li className="flex items-start gap-2.5">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
              담당 매니저가 신청 내용을 확인 후 연락드립니다.
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
              현재 광고 계정·랜딩·CRM 구조를 함께 진단합니다.
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
              계약 없이 진단만 받으셔도 괜찮습니다.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

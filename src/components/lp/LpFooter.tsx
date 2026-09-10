import Image from "next/image";
import logoWhite from "@/assets/logo-white.png";

const KAKAO_URL = "http://pf.kakao.com/_cxccdX/chat";

type Props = {
  /** true → anchors resolve on-page; false → anchors resolve to root. */
  onLp?: boolean;
};

const anchor = (onLp: boolean, id: string) => (onLp ? `#${id}` : `/#${id}`);

export default function LpFooter({ onLp = false }: Props) {
  return (
    <footer className="pt-16 pb-16 bg-[#06060a] border-t border-white/[0.05] text-white/45">
      <div className="max-w-[1120px] mx-auto px-6 lg:px-8">
        {/* Top: 로고 · 링크 */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr] gap-10 md:gap-12 pb-10 border-b border-white/[0.06]">
          <div>
            <a href="/" className="inline-flex items-center gap-2">
              <Image src={logoWhite} alt="PixelPage" width={110} height={22} className="h-5 w-auto opacity-90" />
            </a>
            <p className="mt-5 text-[14px] text-white/50 leading-[1.85] max-w-[360px]">
              매출 성장의 진짜 파트너가 되겠습니다.
            </p>
          </div>

          <div>
            <p className="text-[12px] font-semibold tracking-[0.18em] uppercase text-white/60 mb-4">
              Company
            </p>
            <ul className="space-y-2 text-[14px]">
              <li><a href={anchor(onLp, "solution")} className="hover:text-white">소개</a></li>
              <li><a href={anchor(onLp, "process")} className="hover:text-white">진행 방식</a></li>
              <li><a href={anchor(onLp, "faq")} className="hover:text-white">FAQ</a></li>
              <li><a href="/columns" className="hover:text-white">무료 칼럼</a></li>
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-semibold tracking-[0.18em] uppercase text-white/60 mb-4">
              Contact
            </p>
            <ul className="space-y-2 text-[14px]">
              <li>
                <a href="mailto:contact@pixelpage.co.kr" className="hover:text-white">
                  contact@pixelpage.co.kr
                </a>
              </li>
              <li>
                <a href={KAKAO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  카카오톡 상담
                </a>
              </li>
              <li>
                <a href={anchor(onLp, "cta")} className="hover:text-white">파트너형 DB 도입 문의</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom: 사업자 정보 · 카피라이트 */}
        <div className="pt-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between text-[13px] leading-[1.75] text-white/35">
          <div className="space-y-1">
            <p>
              <span className="text-white/55 font-semibold">픽셀페이지</span>
              <span className="mx-2 text-white/15">|</span>
              대표 박희규
              <span className="mx-2 text-white/15">|</span>
              사업자등록번호 <span className="tabular-nums">477-11-01530</span>
            </p>
            <p>
              경기도 용인시 수지구 광교중앙로296번길 10, 207호-제24호 (상현동, 광교 리치안 오피스텔)
            </p>
          </div>
          <p className="text-white/30 whitespace-nowrap">© 2026 PIXELPAGE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

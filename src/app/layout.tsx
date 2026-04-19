import type { Metadata } from "next";
import { Noto_Serif_KR, Noto_Sans_KR, Cormorant_Garamond, Playfair_Display } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "픽셀페이지 — 무형의 가치를 파는 브랜드 전담 에이전시",
  description: "교육·지식·경험·문화 — 만질 수 없는 가치를 파는 브랜드의 전담 마케팅 파트너. 퍼포먼스 광고, 브랜디드 콘텐츠, SEO, CRM 자동화, 웹 빌드까지.",
  authors: [{ name: "픽셀페이지" }],
  keywords: "픽셀페이지, 퍼포먼스마케팅, 교육마케팅, 코칭마케팅, 무형서비스마케팅, 메타광고, 구글광고, 브랜디드콘텐츠, CRM자동화, SEO, 학원마케팅, 온라인교육광고, 글루, CRM SaaS",
  openGraph: {
    type: "website",
    url: "https://pixelpage.co.kr/",
    siteName: "픽셀페이지",
    title: "픽셀페이지 — 무형의 가치를 파는 브랜드 전담 에이전시",
    description: "교육·지식·경험·문화 — 만질 수 없는 가치를 파는 브랜드의 전담 마케팅 파트너. 퍼포먼스 광고, 브랜디드 콘텐츠, SEO, CRM 자동화, 웹 빌드까지.",
    images: "https://pixelpage.co.kr/og-image.png",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "픽셀페이지 — 무형의 가치를 파는 브랜드 전담 에이전시",
    description: "교육·지식·경험·문화 — 만질 수 없는 가치를 파는 브랜드의 전담 마케팅 파트너.",
    images: "https://pixelpage.co.kr/og-image.png",
  },
  verification: {
    google: "eNS3KglVLCZfmwbuOH434mH3vivjhcWT2UP1272V3BU",
    other: {
      "naver-site-verification": "70b03dc1edd5b4feb33cdecd5f0e2094e643ec02",
    },
  },
  icons: {
    icon: "/favicon.png",
  },
  alternates: {
    canonical: "https://pixelpage.co.kr/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSerifKr.variable} ${notoSansKr.variable} ${cormorant.variable} ${playfair.variable}`}
    >
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
      </head>
      <body className="font-sans" style={{ fontFamily: "'Pretendard', var(--font-noto-sans-kr), -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const GA_ID = "G-WP9F397H8P";

/** GA4 (gtag.js). 내부 대시보드(/app)는 집계에서 제외. */
export default function GoogleAnalytics() {
  const pathname = usePathname() ?? "";
  if (pathname === "/app" || pathname.startsWith("/app/")) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}');
      `}</Script>
    </>
  );
}

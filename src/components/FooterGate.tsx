"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

const hiddenChromePages = ["/", "/info", "/thank-you"];
const hiddenPrefixes = ["/columns", "/app"];

const isHidden = (pathname: string | null | undefined) => {
  if (!pathname) return true; // SSR / 초기 렌더에서는 안전하게 숨김
  if (hiddenChromePages.includes(pathname)) return true;
  return hiddenPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
};

const FooterGate = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  if (isHidden(pathname)) return null;
  return <Footer />;
};

export default FooterGate;

"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const hiddenChromePages = ["/", "/info", "/thank-you"];
const hiddenPrefixes = ["/columns"];

const FooterGate = () => {
  const pathname = usePathname();
  if (hiddenChromePages.includes(pathname) || hiddenPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;
  return <Footer />;
};

export default FooterGate;

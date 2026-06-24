"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const hiddenChromePages = ["/info"];

const FooterGate = () => {
  const pathname = usePathname();
  if (hiddenChromePages.includes(pathname)) return null;
  return <Footer />;
};

export default FooterGate;

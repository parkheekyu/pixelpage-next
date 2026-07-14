"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import logoDark from "@/assets/logo-dark.png";
import logoWhite from "@/assets/logo-white.png";

const darkHeroPages = ["/", "/consult", "/cases", "/products/glue", "/columns", "/services/agency", "/services/consulting", "/services/performance", "/services/branded", "/services/crm", "/services/seo", "/services/webbuild"];

const hiddenChromePages = ["/info"];

const navItems: {
  label: string;
  href: string;
  dropdown?: { title: string; sub: string; href: string; isNew?: boolean }[];
}[] = [
  {
    label: "서비스",
    href: "/services/agency",
    dropdown: [
      { title: "마케팅 대행", sub: "광고·랜딩·CRM 풀패키지 운영", href: "/services/agency" },
      { title: "마케팅 컨설팅", sub: "퍼널 진단 + 실행 플랜", href: "/services/consulting" },
    ],
  },
  { label: "칼럼", href: "/columns" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isDarkHero =
    darkHeroPages.includes(pathname) ||
    pathname.startsWith("/columns/") ||
    pathname.startsWith("/services/");
  const useLight = isDarkHero && !scrolled;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  if (hiddenChromePages.includes(pathname)) return null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/96 backdrop-blur-lg shadow-sm" : ""
    }`}>
      <div className="max-w-[1240px] mx-auto h-[72px] flex items-center px-6 lg:px-12">
        <Link href="/" className="mr-auto">
          <img src={useLight ? logoWhite.src : logoDark.src} alt="PixelPage" className="h-6 transition-opacity duration-300" />
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => (
            <div key={item.label} className="relative group">
              <Link href={item.href} className={`text-[15.5px] font-normal transition-colors ${useLight ? "text-white/70 hover:text-white" : "text-foreground/70 hover:text-foreground"}`}>
                {item.label}
              </Link>
              {item.dropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                  <div className="bg-white shadow-[0_20px_50px_-12px_rgba(10,15,30,0.18)] ring-1 ring-[#e5e7eb] w-[320px] p-2 rounded-2xl">
                    {item.dropdown.map((d) => (
                      <Link
                        key={d.href}
                        href={d.href}
                        className="group/item block px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors"
                      >
                        <span className="flex items-center gap-2 text-[14px] font-bold text-foreground group-hover/item:text-blue-500 transition-colors">
                          {d.title}
                          {d.isNew && (
                            <span className="text-[10px] font-bold tracking-[0.05em] text-blue-500 bg-blue-50 group-hover/item:bg-white px-1.5 py-0.5 rounded transition-colors">
                              NEW
                            </span>
                          )}
                        </span>
                        <span className="block text-[12px] text-muted-foreground mt-1 leading-[1.5]">{d.sub}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <Link href="/consult" className={`text-[13px] font-bold tracking-[0.03em] px-6 py-2.5 rounded-md transition-colors ${
            useLight
              ? "bg-white text-black hover:bg-white/90"
              : "bg-[#0a0f1e] text-white hover:bg-[#0a0f1e]/80"
          }`}>
            무료 상담 신청
          </Link>
        </div>

        <button className="lg:hidden p-1.5" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className={`w-5 h-5 ${useLight ? "text-white" : "text-foreground"}`} /> : <Menu className={`w-5 h-5 ${useLight ? "text-white" : "text-foreground"}`} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-[#e5e7eb]">
          <div className="max-w-[1200px] mx-auto px-6 py-5 flex flex-col gap-1">
            {navItems.map((item) => (
              <div key={item.label} className="pb-1">
                <Link href={item.href} className="block px-3 py-2.5 rounded-xl text-[14px] font-bold text-foreground hover:bg-blue-50 hover:text-blue-500 transition-colors">
                  {item.label}
                </Link>
                {item.dropdown?.map((d) => (
                  <Link
                    key={d.href}
                    href={d.href}
                    className="block px-3 py-2 ml-3 rounded-lg text-[13px] text-muted-foreground hover:bg-blue-50 hover:text-blue-500 transition-colors"
                  >
                    {d.title}
                  </Link>
                ))}
              </div>
            ))}
            <Link href="/consult" className="mt-3 text-center text-[13px] font-bold px-5 py-3 bg-[#0a0f1e] text-white rounded-xl hover:bg-[#0a0f1e]/80 transition-colors">
              상담 신청
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

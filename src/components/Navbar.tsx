"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import logoDark from "@/assets/logo-dark.png";
import logoWhite from "@/assets/logo-white.png";

const darkHeroPages = ["/", "/consult", "/cases", "/products/glue", "/columns", "/services/performance", "/services/branded"];

const navItems: {
  label: string;
  href: string;
  dropdown?: { title: string; sub: string; href: string; isNew?: boolean }[];
}[] = [
  {
    label: "서비스",
    href: "/services/performance",
    dropdown: [
      { title: "퍼포먼스 마케팅", sub: "Meta · Google · 토스 · 당근 · TikTok", href: "/services/performance" },
      { title: "브랜디드 콘텐츠", sub: "브랜디드 유튜브 · 숏폼", href: "/services/branded" },
      { title: "검색엔진 최적화", sub: "네이버 SEO · 구글 SEO", href: "/services/seo" },
      { title: "CRM 마케팅", sub: "퍼널 자동화 · 리텐션", href: "/services/crm" },
      { title: "웹 빌드", sub: "랜딩 · 브랜드 사이트", href: "/services/webbuild" },
    ],
  },
  {
    label: "제품",
    href: "/products/glue",
    dropdown: [
      { title: "글루", sub: "리드 수집 · 메시지 자동화 SaaS", href: "/products/glue", isNew: true },
    ],
  },
  { label: "성과", href: "/cases" },
  { label: "칼럼", href: "/columns" },
  { label: "데모", href: "/demo" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isDarkHero = darkHeroPages.includes(pathname);
  const useLight = isDarkHero && !scrolled;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-background/96 backdrop-blur-lg shadow-subtle" : ""
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
                  <div className="bg-card shadow-card-hover border border-border w-[280px] p-1.5 rounded-lg">
                    {item.dropdown.map((d) => (
                      <Link key={d.href} href={d.href} className="block px-3.5 py-2.5 rounded-md hover:bg-background transition-colors">
                        <span className="flex items-center gap-2 text-[14px] font-medium text-foreground">
                          {d.title}
                          {d.isNew && <span className="text-[10px] font-bold tracking-[0.05em] text-primary bg-primary/10 px-1.5 py-0.5 rounded">NEW</span>}
                        </span>
                        <span className="block text-[11px] text-muted-foreground mt-0.5">{d.sub}</span>
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
        <div className="lg:hidden bg-card border-t border-border">
          <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link href={item.href} className="block py-2 text-[14px] font-medium text-foreground">{item.label}</Link>
                {item.dropdown?.map((d) => (
                  <Link key={d.href} href={d.href} className="block py-1.5 pl-4 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                    {d.title}
                  </Link>
                ))}
              </div>
            ))}
            <Link href="/consult" className="mt-3 text-center text-[13px] font-bold px-5 py-2.5 bg-[#0a0f1e] text-white rounded-md hover:bg-[#0a0f1e]/80 transition-colors">
              상담 신청
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

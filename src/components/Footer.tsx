import Link from "next/link";
import logoDark from "@/assets/logo-dark.png";

const Footer = () => (
  <footer className="border-t border-border py-16">
    <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
        <div className="col-span-2 md:col-span-1">
          <img src={logoDark.src} alt="PixelPage" className="h-5" />
          <p className="font-display italic text-[12px] text-primary mt-1.5">Selling what you can&apos;t touch.</p>
        </div>
        <div>
          <h5 className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground/60 mb-4">서비스</h5>
          <div className="flex flex-col gap-2">
            {[
              { label: "퍼포먼스 마케팅", href: "/services/performance" },
              { label: "브랜디드 콘텐츠", href: "/services/branded" },
              { label: "검색엔진 최적화", href: "/services/seo" },
              { label: "CRM 마케팅", href: "/services/crm" },
              { label: "웹 빌드", href: "/services/webbuild" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="text-[13px] text-muted-foreground hover:text-primary transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
        <div>
          <h5 className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground/60 mb-4">회사</h5>
          <div className="flex flex-col gap-2">
            <Link href="/#cases" className="text-[13px] text-muted-foreground hover:text-primary transition-colors">성과</Link>
            <Link href="/#contact" className="text-[13px] text-muted-foreground hover:text-primary transition-colors">연락</Link>
          </div>
        </div>
        <div>
          <h5 className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground/60 mb-4">연락처</h5>
          <a href="mailto:contact@pixelpage.co.kr" className="text-[13px] text-muted-foreground hover:text-primary transition-colors block">contact@pixelpage.co.kr</a>
        </div>
      </div>
      <div className="border-t border-border pt-5 flex justify-between items-center">
        <p className="text-[11px] text-muted-foreground/50">&copy; 2026 PIXELPAGE</p>
        <p className="text-[11px] text-muted-foreground/50">Meta Business Partner</p>
      </div>
    </div>
  </footer>
);

export default Footer;

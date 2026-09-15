import type { Metadata } from "next";
import "./dash.css";

export const metadata: Metadata = {
  title: "픽셀페이지 대시보드",
  robots: { index: false, follow: false },
};

export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="pp-dash">{children}</div>;
}

import type { Metadata } from "next";
import "./dash.css";

export const metadata: Metadata = {
  title: "픽셀페이지 대시보드",
  robots: { index: false, follow: false },
};

/** 저장된 테마를 화면이 그려지기 전에 적용한다 (밝은 화면이 번쩍였다가 어두워지는 것을 막는다). 테마는 TopBar 의 버튼이 바꾼다. */
const THEME_SCRIPT = `try{if(localStorage.getItem("pp-theme")==="dark")document.currentScript.parentElement.dataset.theme="dark"}catch(e){}`;

export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pp-dash" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      {children}
    </div>
  );
}

import { Metadata } from "next";
import StyleGuideClient from "./StyleGuideClient";

export const metadata: Metadata = {
  title: "스타일 가이드 | 픽셀페이지",
  description: "PIXELPAGE 디자인 시스템 스타일 가이드",
};

export default function Page() {
  return <StyleGuideClient />;
}

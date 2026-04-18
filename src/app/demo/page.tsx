import { Metadata } from "next";
import DemoClient from "./DemoClient";

export const metadata: Metadata = {
  title: "데모 | 픽셀페이지",
  description: "PIXELPAGE 웹 빌드 샘플 페이지입니다.",
};

export default function Page() {
  return <DemoClient />;
}

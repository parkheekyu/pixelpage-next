import { Metadata } from "next";
import DemoClient from "./DemoClient";

export const metadata: Metadata = {
  title: "웹 빌드 데모 | 픽셀페이지",
  description: "PIXELPAGE가 만드는 웹사이트 샘플입니다. 전환이 일어나는 웹을 직접 경험해보세요.",
};

export default function Page() {
  return <DemoClient />;
}

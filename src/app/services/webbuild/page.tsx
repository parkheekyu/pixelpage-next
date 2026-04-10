import { Metadata } from "next";
import WebBuildClient from "./WebBuildClient";

export const metadata: Metadata = {
  title: "웹 빌드 | 픽셀페이지",
  description: "보여주기 위한 웹이 아닌, 파는 웹. 랜딩 페이지부터 브랜드 사이트, 엔터프라이즈까지 전환이 일어나는 웹을 설계합니다.",
};

export default function Page() {
  return <WebBuildClient />;
}

import { Metadata } from "next";
import SeoClient from "./SeoClient";

export const metadata: Metadata = {
  title: "검색엔진 최적화 (SEO) | 픽셀페이지",
  description: "네이버 생태계 전체를 활용한 콘텐츠 기반 장기 신뢰 구축. 광고비 없이도 찾아오게 만드는 SEO 전략.",
};

export default function Page() {
  return <SeoClient />;
}

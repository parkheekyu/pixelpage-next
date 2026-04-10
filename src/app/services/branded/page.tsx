import { Metadata } from "next";
import BrandedClient from "./BrandedClient";

export const metadata: Metadata = {
  title: "브랜디드 콘텐츠 | 픽셀페이지",
  description: "브랜디드 유튜브와 숏폼으로 24시간 일하는 영업사원을 만듭니다. 무형 서비스의 감각을 영상으로 번역합니다.",
};

export default function Page() {
  return <BrandedClient />;
}

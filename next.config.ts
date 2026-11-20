import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 대시보드에서 방금 본 화면으로 돌아갈 때 30초 동안은 다시 불러오지 않는다 (탭 전환 체감 속도). 값을 고치면 서버 액션이 캐시를 비운다.
  experimental: { staleTimes: { dynamic: 30 } },
};

export default nextConfig;

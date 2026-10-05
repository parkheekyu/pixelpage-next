import type { Metadata } from "next";
import { COMPANY, Doc, H, P } from "../_doc";
export const metadata: Metadata = { title: "메타 광고 자동화 앱 서비스 약관 | 픽셀페이지", robots: { index: false, follow: false, nocache: true } };
export default function Page() {
  return (
    <Doc title="픽셀페이지 메타 광고 자동화 앱 서비스 약관">
      <H>1. 목적</H>
      <P>본 약관은 {COMPANY.name}(대표 {COMPANY.ceo}, 이하 &quot;회사&quot;)이 운영하는 메타 광고 자동화 앱(앱 ID {COMPANY.appId}, 이하 &quot;앱&quot;)의 이용 조건을 정합니다.</P>
      <H>2. 이용 범위</H>
      <P>앱은 회사 및 회사와 광고 대행 계약을 체결한 고객사의 Meta 광고 계정을 운영하기 위한 내부 도구입니다. 회사가 승인한 운영 담당자만 사용할 수 있으며, 제3자에게 제공되지 않습니다.</P>
      <H>3. 제공 기능</H>
      <P>광고 캠페인·광고·크리에이티브·잠재고객 양식의 생성 및 수정, 광고 성과 조회, 성과 기준에 따른 광고 중단 및 교체, 변경 내역 보고.</P>
      <H>4. 이용자의 의무</H>
      <P>이용자는 Meta 광고 정책 및 플랫폼 약관을 준수해야 하며, 본인이 관리 권한을 보유한 광고 계정과 페이지에 대해서만 앱을 사용해야 합니다.</P>
      <H>5. 데이터 처리</H>
      <P>앱의 데이터 처리에 관한 사항은 <a href="/legal/meta/privacy" style={{ color: "#1d4ed8" }}>개인정보처리방침</a>을 따릅니다. 데이터 삭제는 <a href="/legal/meta/data-deletion" style={{ color: "#1d4ed8" }}>사용자 데이터 삭제 안내</a>에 따라 요청할 수 있습니다.</P>
      <H>6. 책임의 한계</H>
      <P>회사는 Meta 플랫폼의 장애, 정책 변경, API 제한으로 인한 광고 운영 결과에 대해 책임지지 않습니다.</P>
      <H>7. 약관의 변경</H>
      <P>회사는 필요 시 약관을 변경할 수 있으며, 변경 시 본 페이지에 게시합니다.</P>
      <H>8. 연락처</H>
      <P>{COMPANY.name} / 이메일 {COMPANY.email} / 주소 {COMPANY.address}</P>
    </Doc>
  );
}

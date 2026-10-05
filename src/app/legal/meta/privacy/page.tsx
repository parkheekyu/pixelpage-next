import type { Metadata } from "next";
import { COMPANY, Doc, H, P, UL } from "../_doc";
export const metadata: Metadata = { title: "메타 광고 자동화 앱 개인정보처리방침 | 픽셀페이지", robots: { index: false, follow: false, nocache: true } };
export default function Page() {
  return (
    <Doc title="픽셀페이지 메타 광고 자동화 앱 개인정보처리방침">
      <H>1. 개요</H>
      <P>본 앱(앱 ID {COMPANY.appId}, 이하 &quot;앱&quot;)은 {COMPANY.name}(대표 {COMPANY.ceo}, 이하 &quot;회사&quot;)이 자사 및 광고 대행 고객사의 Meta 광고 계정을 운영하기 위해 사용하는 내부 자동화 도구입니다. 외부 일반 사용자에게 제공되지 않으며, 회사 소속 운영 담당자만 사용합니다.</P>
      <H>2. 수집·이용하는 정보</H>
      <P>앱은 Meta Marketing API를 통해 다음 정보에 접근합니다.</P>
      <UL items={[
        "앱 사용자(회사 운영 담당자)의 Meta 사용자 ID와 이름: 작업 수행자 확인 및 변경 이력 기록",
        "회사가 관리하는 Facebook 페이지의 ID와 이름: 광고 게재 페이지 확인",
        "광고 계정의 캠페인, 광고 세트, 광고, 크리에이티브, 잠재고객 양식 정보: 캠페인 생성·수정·중단",
        "광고 성과 지표(지출, 노출, 클릭, 리드 수 등 집계 데이터): 일일 성과 진단",
      ]} />
      <P>앱은 잠재고객 양식을 통해 수집된 개인의 이름·이메일·전화번호를 읽거나 저장하지 않습니다.</P>
      <H>3. 이용 목적</H>
      <P>광고 캠페인의 생성, 성과 모니터링, 성과 기준에 따른 광고 중단 및 교체, 변경 내역의 담당자 보고에만 사용합니다.</P>
      <H>4. 보관 및 파기</H>
      <P>성과 지표와 변경 이력은 회사 내부 서버에 캠페인 종료 후 최대 1년간 보관 후 파기합니다. Meta 액세스 토큰은 암호화된 저장소에 보관하며 만료 시 즉시 폐기합니다.</P>
      <H>5. 제3자 제공</H>
      <P>수집한 정보를 제3자에게 판매·제공하지 않습니다. 광고 성과 지표는 해당 광고 계정의 소유자(고객사)에게만 보고합니다.</P>
      <H>6. 이용자 권리 및 삭제 요청</H>
      <P>앱 사용자는 회사에 자신의 정보 열람·삭제를 요청할 수 있습니다. 요청은 아래 연락처로 보내주시면 10일 이내 처리합니다. 삭제 절차는 <a href="/legal/meta/data-deletion" style={{ color: "#1d4ed8" }}>사용자 데이터 삭제 안내</a>를 따릅니다.</P>
      <H>7. 연락처</H>
      <P>{COMPANY.name} / 담당자 {COMPANY.ceo} / 이메일 {COMPANY.email} / 주소 {COMPANY.address}</P>
    </Doc>
  );
}

import type { Metadata } from "next";
import { COMPANY, Doc, H, P, UL } from "../_doc";
export const metadata: Metadata = { title: "사용자 데이터 삭제 안내 | 픽셀페이지", robots: { index: false, follow: false, nocache: true } };
export default function Page() {
  return (
    <Doc title="픽셀페이지 메타 광고 자동화 앱 사용자 데이터 삭제 안내">
      <H>1. 적용 범위</H>
      <P>본 안내는 {COMPANY.name}(이하 &quot;회사&quot;)의 메타 광고 자동화 앱(앱 ID {COMPANY.appId})이 Meta Marketing API를 통해 접근·보관하는 데이터의 삭제 절차를 설명합니다. 앱은 회사 소속 운영 담당자만 사용하는 내부 도구이며, 잠재고객 양식으로 수집된 개인의 이름·이메일·전화번호는 읽거나 저장하지 않습니다.</P>
      <H>2. 삭제 대상 데이터</H>
      <UL items={[
        "앱 사용자(운영 담당자)의 Meta 사용자 ID, 이름, 작업 수행 이력",
        "광고 계정·페이지의 식별 정보와 캠페인·광고·크리에이티브·잠재고객 양식의 설정 정보",
        "광고 성과 지표(지출, 노출, 클릭, 리드 수 등 집계 데이터)와 변경 이력",
        "Meta 액세스 토큰",
      ]} />
      <H>3. 삭제 요청 방법</H>
      <P>다음 중 한 가지 방법으로 요청하면 됩니다.</P>
      <UL items={[
        <>이메일: <a href={`mailto:${COMPANY.email}?subject=${encodeURIComponent("[메타 앱] 데이터 삭제 요청")}`} style={{ color: "#1d4ed8" }}>{COMPANY.email}</a> 로 제목에 &quot;데이터 삭제 요청&quot;을 적고, 본인 확인을 위해 Meta 사용자 이름(또는 사용자 ID)과 관련 광고 계정 ID를 함께 보내 주세요.</>,
        <>Facebook 앱 연결 해제: Facebook <strong>설정 및 개인정보 → 설정 → 앱 및 웹사이트</strong>에서 &quot;픽셀페이지&quot; 앱을 삭제하면 회사는 해당 사용자의 토큰과 사용자 식별 정보를 삭제합니다.</>,
      ]} />
      <H>4. 처리 절차와 기간</H>
      <UL items={[
        "요청 접수 후 영업일 기준 1일 이내 접수 확인 메일을 보냅니다.",
        "본인 확인 후 10일 이내 해당 데이터를 삭제하고 완료 사실을 회신합니다.",
        "광고 계정 소유자(고객사)의 광고 성과 지표는 해당 고객사의 요청에 따라 삭제하며, 법령상 보관 의무가 있는 거래·정산 기록은 그 기간 동안 분리 보관합니다.",
      ]} />
      <H>5. 자동 파기</H>
      <P>삭제 요청이 없더라도 성과 지표와 변경 이력은 캠페인 종료 후 최대 1년이 지나면 파기하고, Meta 액세스 토큰은 만료 시 즉시 폐기합니다.</P>
      <H>6. 연락처</H>
      <P>{COMPANY.name} / 담당자 {COMPANY.ceo} / 이메일 {COMPANY.email} / 주소 {COMPANY.address}</P>
    </Doc>
  );
}

/** 매출·지출 장부 */
export const LEDGER_KINDS = ["income", "expense", "excluded"] as const;
export type LedgerKind = (typeof LEDGER_KINDS)[number];
export const KIND_LABEL: Record<LedgerKind, string> = { income: "매출", expense: "지출", excluded: "제외" };
export interface LedgerRow { id: string; date: string; kind: LedgerKind; category: string; method: string | null; amount: number; fixed: boolean; title: string; memo: string | null }
export type LedgerInput = Omit<LedgerRow, "id">;
/** 새 항목을 넣을 때 고를 수 있는 기본 분류. 이미 쓰인 분류는 여기에 더해진다. */
export const LEDGER_CATEGORIES = ["클라이언트 매출", "PG·플랫폼 정산", "이자·환급", "AI 도구", "개발·인프라", "디자인·콘텐츠 툴", "구독·멤버십", "마케팅·광고", "외주·용역", "세금", "세무·행정", "통신·보험", "카드대금", "식비·카페", "교통", "여행", "쇼핑·생활", "교육·콘텐츠", "가족·대여", "본인 이체", "기타"];
export const LEDGER_METHODS = ["카카오뱅크", "삼성카드", "삼성카드(해외)", "롯데카드", "현금"];

export type Role = "staff" | "client";

export const STATUSES = ["신규", "연락중", "상담완료", "전환", "드랍"] as const;
export type LeadStatus = (typeof STATUSES)[number];

export const DROPS = ["부재", "노쇼", "가격", "타상품", "자격미달", "관심없음", "허위정보", "중복"] as const;
export type DropReason = (typeof DROPS)[number];
/** 리드 품질(광고/타겟) 문제로 분류되는 드랍 사유 */
export const QUALITY_DROPS = new Set<string>(["자격미달", "허위정보", "관심없음", "부재"]);

export const PAYS = ["결제확정", "예약금", "가계약", "환불"] as const;
export type PayType = (typeof PAYS)[number];

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  created_at: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  is_own: boolean;
  active: boolean;
  created_at: string;
}

export interface Creative {
  id: string;
  project_id: string;
  creative_id: string;
  source: string;
  medium: string | null;
  campaign: string | null;
  term: string | null;
  landing_id: string | null;
  active: boolean;
}

export interface AdSpend {
  id: string;
  project_id: string;
  date: string; // YYYY-MM-DD
  creative_id: string;
  source: string;
  impressions: number;
  clicks: number;
  cost: number;
}

export interface Lead {
  id: string;
  project_id: string;
  submitted_at: string;
  name: string | null;
  phone: string | null;
  phone_norm: string | null;
  email: string | null;
  message: string | null;
  utm_source: string;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  landing_id: string | null;
  landing_url: string | null;
  status: LeadStatus;
  drop_reason: DropReason | null;
  assignee: string | null;
  first_contact_at: string | null;
  consulted_at: string | null;
  converted_on: string | null;
  revenue: number;
  pay_type: PayType | null;
  memo: string | null;
  is_duplicate: boolean;
  original_lead_id: string | null;
  created_at: string;
  updated_at: string;
}

/** 고객사 화면에서 수정 가능한 필드 */
export interface LeadPatch {
  status?: LeadStatus;
  drop_reason?: DropReason | null;
  revenue?: number;
  pay_type?: PayType | null;
  converted_on?: string | null;
  memo?: string | null;
}

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

export const CUSTOM_TYPES = ["text", "number", "date", "select"] as const;
export type CustomType = (typeof CUSTOM_TYPES)[number];
export interface CustomField { key: string; label: string; type: CustomType; options?: string[] }

export interface Project {
  id: string;
  slug: string;
  name: string;
  is_own: boolean;
  /** 리드 구글 시트가 연결돼 있다 (리드 탭은 시트를 읽어서 보여 준다) */
  has_lead_sheet?: boolean;
  active: boolean;
  created_at: string;
  custom_fields: CustomField[];
  hidden_columns: string[];
  landing_url: string | null;
  research_input: ResearchInput;
  webhook_token: string | null;
  /** 객단가(원). 전환했는데 매출액이 비어 있는 리드의 매출을 이 값으로 추정한다. */
  avg_order_value?: number | null;
  /** 개요 퍼널을 어느 단계까지 보여 줄지. 비어 있으면 전환까지. */
  funnel_end?: FunnelEnd | null;
  /** 개요 퍼널을 GA4 행동 단계로 짜는 브랜드(온라인 판매형). 있으면 기본 퍼널 대신 이 단계를 순서대로 센다. */
  funnel_ga4?: Ga4FunnelStep[] | null;
  /** 개요 상단에 보여 줄 지표(최대 5개). 비어 있으면 기본 구성. */
  overview_kpis?: string[] | null;
}

/** 개요 상단 지표는 다섯 개까지만 고른다 */
export const OVERVIEW_KPI_MAX = 5;

/** GA4 퍼널 한 단계: 이벤트 이름과, 필요하면 이벤트 매개변수(page_location 등)에 들어 있어야 하는 글자 */
export interface Ga4FunnelStep { name: string; event: string; param?: string; value?: string; note?: string }

/** 개요 퍼널의 마지막 단계 (브랜드별 설정) */
export const FUNNEL_ENDS = ["leads", "contacted", "consulted", "conv"] as const;
export type FunnelEnd = (typeof FUNNEL_ENDS)[number];

/** 리드 탭은 자사 프로젝트에만 있다 (고객사 리드 수집을 중단하면서 고객사 쪽 탭은 뺐다). 프로젝트를 열 때의 첫 화면. */
export const projectHome = (p: Pick<Project, "id" | "is_own">) => `/app/overview/${p.id}`;

export interface ResearchInput {
  product?: string;      // 상품/서비스 설명
  target?: string;       // 타깃 고객
  price?: string;        // 가격/결제 구조
  offer?: string;        // 오퍼(무료 상담, 체험, 보장 등)
  proof?: string;        // 보유한 증거(사례, 수치, 자격, 미디어)
  competitors?: string;  // 경쟁사/대안
  objections?: string;   // 상담에서 실제로 듣는 반박·거절 이유
  notes?: string;        // 기타
  pre_research?: string; // 퍼플렉시티 등에서 직접 조사해 붙여 넣은 자료 (1차 근거)
}

export interface ProjectIntegrations {
  project_id: string;
  meta_ad_account_id: string | null;
  meta_goal: "lead" | "purchase";
  ga4_property_id: string | null;
  clarity_project_id: string | null;
  clarity_api_token: string | null;
  google_sheet_id: string | null;
  google_sheet_tab: string | null;
  airtable_base_id: string | null;
  airtable_table: string | null;
  airtable_token: string | null;
  lead_sync_enabled: boolean;
  sync_pull: boolean;
  sync_push: boolean;
  slack_channel_id: string | null;
  updated_at: string;
}

export type AnalysisKind = "research" | "market" | "ads" | "landing";
export interface Analysis {
  id: string;
  project_id: string;
  kind: AnalysisKind;
  status: "queued" | "running" | "done" | "error";
  title: string | null;
  input: Record<string, unknown> | null;
  result_md: string | null;
  error: string | null;
  model: string | null;
  created_by: string | null;
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
  /** 광고 플랫폼(Meta)이 집계한 결과 수 (리드, 판매 캠페인은 구매). Meta 에서 읽은 행에만 있다. */
  platform_leads?: number | null;
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
  company: string | null;
  industry: string | null;
  budget: string | null;
  services: string | null;
  marketing_status: string | null;
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
  custom: Record<string, string | number | null>;
  manual_order: number | null;
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
  custom?: Record<string, string | number | null>;
}

export type Engine = "claude" | "codex";
export interface CreativeVariant { id: string; angle: string; format: string; headline: string; primary_text: string; cta: string; visual: string; hook?: string; why: string }
export interface Proposal {
  id: string; project_id: string; kind: string;
  status: "queued" | "running" | "proposed" | "approved" | "rejected" | "error";
  engine: Engine; title: string | null;
  brief: { goal?: string; formats?: string[]; count?: number; notes?: string } | null;
  variants: CreativeVariant[] | null;
  feedback: string | null; parent_id: string | null; job_id: string | null; error: string | null;
  created_by: string | null; decided_by: string | null; decided_at: string | null; created_at: string;
}

export type MetaGoalLike = "lead" | "purchase";

// ---------- 클라이언트(계약) 관리 ----------
export const CONTRACT_TYPES = ["markup", "revshare", "cpa", "own"] as const;
export type ContractType = (typeof CONTRACT_TYPES)[number];
export const CONTRACT_TYPE_LABEL: Record<ContractType, string> = { markup: "마크업", revshare: "수익쉐어", cpa: "CPA", own: "자사" };
export const CLIENT_STATUSES = ["active", "ended"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];
export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = { active: "진행중", ended: "종료" };
export const CLIENT_CATEGORIES = ["db", "sales"] as const;
export type ClientCategory = (typeof CLIENT_CATEGORIES)[number];
export const CLIENT_CATEGORY_LABEL: Record<ClientCategory, string> = { db: "DB", sales: "판매" };
export interface Client {
  id: string;
  name: string;
  project_id: string | null;
  contract_type: ContractType | null;
  status: ClientStatus;
  contract_date: string | null;
  end_date: string | null;
  revenue_model: string | null;
  logo_url: string | null;
  category: ClientCategory | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
}
export type ClientPatch = Partial<Pick<Client, "name" | "project_id" | "contract_type" | "status" | "contract_date" | "end_date" | "revenue_model" | "memo" | "category">>;

// ---------- 업무 관리 (프로젝트 → 마일스톤 → 할 일) ----------
export const PRIORITIES = ["high", "mid", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];
export const PRIORITY_LABEL: Record<Priority, string> = { high: "높음", mid: "보통", low: "낮음" };
export const TASK_STATUSES = ["todo", "done", "hold"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export const TASK_STATUS_LABEL: Record<TaskStatus, string> = { todo: "진행", done: "완료", hold: "보류" };
export interface WorkProject {
  id: string;
  name: string;
  goal: string | null;
  deadline: string | null;
  client_id: string | null;
  status: "active" | "done";
  created_at: string;
}
export interface WorkMilestone { id: string; project_id: string; title: string; position: number }
export interface WorkTask {
  id: string;
  title: string;
  client_id: string | null;
  project_id: string | null;
  milestone_id: string | null;
  deadline: string | null;
  /** 하는 날. 업무 관리(할 일 목록)에서 이 날짜의 할 일로 보인다. 마감일과는 별개. */
  do_date: string | null;
  priority: Priority;
  status: TaskStatus;
  hold_reason: string | null;
  done_at: string | null;
  /** 프로젝트(마일스톤) 안에서의 순서. 끌어서 바꾼다. */
  position: number;
  created_at: string;
}
export type WorkTaskPatch = Partial<Pick<WorkTask, "title" | "client_id" | "project_id" | "milestone_id" | "deadline" | "do_date" | "priority" | "status" | "hold_reason">>;
export type WorkProjectPatch = Partial<Pick<WorkProject, "name" | "goal" | "deadline" | "client_id" | "status">>;

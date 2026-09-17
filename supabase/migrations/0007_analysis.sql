-- 리서치 / 광고 / 랜딩페이지 분석 기능
-- 프로젝트 공개 설정 (고객사도 볼 수 있음)
alter table dash.projects
  add column if not exists landing_url text,
  add column if not exists research_input jsonb not null default '{}'::jsonb;

-- 연동 정보 (직원만 읽기/쓰기: 광고 계정 ID, GA4 속성, Clarity 프로젝트/토큰)
create table if not exists dash.project_integrations (
  project_id uuid primary key references dash.projects(id) on delete cascade,
  meta_ad_account_id text,
  ga4_property_id text,
  clarity_project_id text,
  clarity_api_token text,
  updated_at timestamptz not null default now()
);
alter table dash.project_integrations enable row level security;
drop policy if exists integrations_staff_all on dash.project_integrations;
create policy integrations_staff_all on dash.project_integrations
  for all using (dash.is_staff()) with check (dash.is_staff());

-- AI 분석 결과 (직원 생성, 배정 고객사 열람)
create table if not exists dash.analyses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references dash.projects(id) on delete cascade,
  kind text not null check (kind in ('research','ads','landing')),
  status text not null default 'done' check (status in ('running','done','error')),
  title text,
  input jsonb,
  result_md text,
  error text,
  model text,
  created_by uuid references dash.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists analyses_project_kind on dash.analyses (project_id, kind, created_at desc);
alter table dash.analyses enable row level security;
drop policy if exists analyses_read on dash.analyses;
create policy analyses_read on dash.analyses
  for select using (dash.is_staff() or dash.is_member(project_id));
drop policy if exists analyses_staff_write on dash.analyses;
create policy analyses_staff_write on dash.analyses
  for all using (dash.is_staff()) with check (dash.is_staff());

grant all on all tables in schema dash to anon, authenticated, service_role;
grant select on all tables in schema dash to supabase_realtime_admin;

-- 픽셀페이지 고객사 대시보드 스키마 (전용 스키마 `dash`)
-- Supabase SQL Editor 또는 관리 API로 실행. 다른 앱의 public 테이블과 충돌하지 않도록 분리.
-- 실행 후 Settings > API > Exposed schemas 에 `dash` 추가 (또는 관리 API postgrest.db_schema).

create extension if not exists "pgcrypto";
create schema if not exists dash;
grant usage on schema dash to anon, authenticated, service_role;
alter default privileges in schema dash grant all on tables to anon, authenticated, service_role;
alter default privileges in schema dash grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema dash grant execute on functions to anon, authenticated, service_role;

-- ---------- 프로필 / 역할 ----------
create table if not exists dash.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text not null default 'client' check (role in ('staff', 'client')),
  created_at timestamptz not null default now()
);

-- auth.users 생성 시 프로필 자동 생성 (role은 user_metadata.role 우선, 기본 client)
create or replace function dash.handle_new_user()
returns trigger language plpgsql security definer set search_path = dash, public as $$
begin
  insert into dash.profiles (id, email, name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, ''), '@', 1)),
    case when new.raw_user_meta_data->>'role' = 'staff' then 'staff' else 'client' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists dash_on_auth_user_created on auth.users;
create trigger dash_on_auth_user_created
  after insert on auth.users
  for each row execute function dash.handle_new_user();

-- ---------- 프로젝트 (고객사) ----------
create table if not exists dash.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  is_own boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists dash.project_members (
  project_id uuid not null references dash.projects(id) on delete cascade,
  user_id uuid not null references dash.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

-- ---------- 소재 (UTM 마스터) ----------
create table if not exists dash.creatives (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references dash.projects(id) on delete cascade,
  creative_id text not null,              -- = utm_content
  source text not null default 'unknown', -- meta / google / naver / youtube / daangn / kakao
  medium text,
  campaign text,
  term text,
  landing_id text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (project_id, creative_id)
);

-- ---------- 광고비 (일별 · 소재별) ----------
create table if not exists dash.ad_spend (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references dash.projects(id) on delete cascade,
  date date not null,
  creative_id text not null,
  source text not null default 'unknown',
  impressions integer not null default 0,
  clicks integer not null default 0,
  cost numeric(14,0) not null default 0,
  platform_leads integer,
  unique (project_id, creative_id, date)
);
create index if not exists ad_spend_project_date on dash.ad_spend (project_id, date);

-- ---------- 리드 ----------
create table if not exists dash.leads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references dash.projects(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  name text,
  phone text,
  phone_norm text,
  email text,
  message text,
  utm_source text not null default 'unknown',
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  landing_id text,
  landing_url text,
  status text not null default '신규' check (status in ('신규','연락중','상담완료','전환','드랍')),
  drop_reason text check (drop_reason is null or drop_reason in ('부재','노쇼','가격','타상품','자격미달','관심없음','허위정보','중복')),
  assignee text,
  first_contact_at timestamptz,
  consulted_at timestamptz,
  converted_on date,
  revenue numeric(14,0) not null default 0,
  pay_type text check (pay_type is null or pay_type in ('결제확정','예약금','가계약','환불')),
  memo text,
  is_duplicate boolean not null default false,
  original_lead_id uuid references dash.leads(id) on delete set null,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_project_submitted on dash.leads (project_id, submitted_at desc);
create index if not exists leads_project_phone on dash.leads (project_id, phone_norm);

create or replace function dash.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists leads_set_updated_at on dash.leads;
create trigger leads_set_updated_at before update on dash.leads
  for each row execute function dash.set_updated_at();

-- ---------- 권한 헬퍼 ----------
create or replace function dash.is_staff()
returns boolean language sql stable security definer set search_path = dash, public as $$
  select exists (select 1 from dash.profiles where id = auth.uid() and role = 'staff');
$$;

create or replace function dash.is_member(p_project uuid)
returns boolean language sql stable security definer set search_path = dash, public as $$
  select exists (select 1 from dash.project_members where project_id = p_project and user_id = auth.uid());
$$;

-- 고객사 계정은 리드의 상태 관련 컬럼만 수정 가능
create or replace function dash.guard_client_lead_update()
returns trigger language plpgsql as $$
begin
  if dash.is_staff() then return new; end if;
  if new.project_id      is distinct from old.project_id
  or new.submitted_at    is distinct from old.submitted_at
  or new.name            is distinct from old.name
  or new.phone           is distinct from old.phone
  or new.phone_norm      is distinct from old.phone_norm
  or new.email           is distinct from old.email
  or new.message         is distinct from old.message
  or new.utm_source      is distinct from old.utm_source
  or new.utm_medium      is distinct from old.utm_medium
  or new.utm_campaign    is distinct from old.utm_campaign
  or new.utm_content     is distinct from old.utm_content
  or new.utm_term        is distinct from old.utm_term
  or new.landing_id      is distinct from old.landing_id
  or new.landing_url     is distinct from old.landing_url
  or new.assignee        is distinct from old.assignee
  or new.is_duplicate    is distinct from old.is_duplicate
  or new.original_lead_id is distinct from old.original_lead_id
  or new.raw_payload     is distinct from old.raw_payload
  then
    raise exception '고객사 계정은 상태·매출·메모만 수정할 수 있습니다';
  end if;
  return new;
end $$;
drop trigger if exists leads_guard_client_update on dash.leads;
create trigger leads_guard_client_update before update on dash.leads
  for each row execute function dash.guard_client_lead_update();

-- ---------- RLS ----------
alter table dash.profiles        enable row level security;
alter table dash.projects        enable row level security;
alter table dash.project_members enable row level security;
alter table dash.creatives       enable row level security;
alter table dash.ad_spend        enable row level security;
alter table dash.leads           enable row level security;

drop policy if exists profiles_self_or_staff_read on dash.profiles;
create policy profiles_self_or_staff_read on dash.profiles
  for select using (id = auth.uid() or dash.is_staff());
drop policy if exists profiles_staff_write on dash.profiles;
create policy profiles_staff_write on dash.profiles
  for all using (dash.is_staff()) with check (dash.is_staff());

drop policy if exists projects_read on dash.projects;
create policy projects_read on dash.projects
  for select using (dash.is_staff() or dash.is_member(id));
drop policy if exists projects_staff_write on dash.projects;
create policy projects_staff_write on dash.projects
  for all using (dash.is_staff()) with check (dash.is_staff());

drop policy if exists members_read on dash.project_members;
create policy members_read on dash.project_members
  for select using (dash.is_staff() or user_id = auth.uid());
drop policy if exists members_staff_write on dash.project_members;
create policy members_staff_write on dash.project_members
  for all using (dash.is_staff()) with check (dash.is_staff());

drop policy if exists creatives_read on dash.creatives;
create policy creatives_read on dash.creatives
  for select using (dash.is_staff() or dash.is_member(project_id));
drop policy if exists creatives_staff_write on dash.creatives;
create policy creatives_staff_write on dash.creatives
  for all using (dash.is_staff()) with check (dash.is_staff());

drop policy if exists ad_spend_read on dash.ad_spend;
create policy ad_spend_read on dash.ad_spend
  for select using (dash.is_staff() or dash.is_member(project_id));
drop policy if exists ad_spend_staff_write on dash.ad_spend;
create policy ad_spend_staff_write on dash.ad_spend
  for all using (dash.is_staff()) with check (dash.is_staff());

drop policy if exists leads_read on dash.leads;
create policy leads_read on dash.leads
  for select using (dash.is_staff() or dash.is_member(project_id));
drop policy if exists leads_member_update on dash.leads;
create policy leads_member_update on dash.leads
  for update using (dash.is_staff() or dash.is_member(project_id))
  with check (dash.is_staff() or dash.is_member(project_id));
drop policy if exists leads_staff_insert on dash.leads;
create policy leads_staff_insert on dash.leads
  for insert with check (dash.is_staff());
drop policy if exists leads_staff_delete on dash.leads;
create policy leads_staff_delete on dash.leads
  for delete using (dash.is_staff());

-- 이미 만들어진 객체에도 권한 부여
grant all on all tables in schema dash to anon, authenticated, service_role;
grant all on all sequences in schema dash to anon, authenticated, service_role;
grant execute on all functions in schema dash to anon, authenticated, service_role;

-- 1) 안 본 항목 배지: 사용자·프로젝트·종류별 마지막 확인 시각
create table if not exists dash.user_seen (
  user_id uuid not null references dash.profiles(id) on delete cascade,
  project_id uuid not null references dash.projects(id) on delete cascade,
  kind text not null check (kind in ('leads','research','ads','landing')),
  seen_at timestamptz not null default now(),
  primary key (user_id, project_id, kind)
);
alter table dash.user_seen enable row level security;
drop policy if exists user_seen_own on dash.user_seen;
create policy user_seen_own on dash.user_seen for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 프로젝트별·종류별 안 본 개수 (호출자 기준, RLS 적용)
create or replace function dash.unread_counts()
returns table (project_id uuid, kind text, unread bigint) language sql stable as $$
  with p as (select id from dash.projects where active),
  k as (select * from (values ('leads'),('research'),('ads'),('landing')) as t(kind)),
  seen as (select project_id, kind, seen_at from dash.user_seen where user_id = auth.uid())
  select p.id, k.kind, count(x.id)
  from p cross join k
  left join seen s on s.project_id = p.id and s.kind = k.kind
  left join lateral (
    select l.id from dash.leads l
     where k.kind = 'leads' and l.project_id = p.id and not l.is_duplicate
       and l.created_at > coalesce(s.seen_at, now() - interval '7 days')
    union all
    select a.id from dash.analyses a
     where k.kind <> 'leads' and a.project_id = p.id and a.status = 'done'
       and (a.kind = k.kind or (k.kind = 'research' and a.kind = 'market'))
       and a.created_at > coalesce(s.seen_at, now() - interval '7 days')
  ) x on true
  group by p.id, k.kind;
$$;
grant execute on function dash.unread_counts() to authenticated, service_role;

-- 2) 프로젝트별 웹훅 토큰
alter table dash.projects add column if not exists webhook_token text unique;
update dash.projects set webhook_token = encode(gen_random_bytes(18), 'hex') where webhook_token is null;

-- 3) 리드 연동 (구글 시트 / 에어테이블)
alter table dash.project_integrations
  add column if not exists google_sheet_id text,
  add column if not exists google_sheet_tab text,
  add column if not exists airtable_base_id text,
  add column if not exists airtable_table text,
  add column if not exists airtable_token text,
  add column if not exists lead_sync_enabled boolean not null default false;

-- 리드 ↔ 외부 행 매핑 (푸시한 리드의 외부 ID 기록, 중복 방지·양방향 기준)
create table if not exists dash.lead_sync (
  lead_id uuid not null references dash.leads(id) on delete cascade,
  target text not null check (target in ('sheets','airtable')),
  external_id text,
  synced_at timestamptz not null default now(),
  primary key (lead_id, target)
);
alter table dash.lead_sync enable row level security;
drop policy if exists lead_sync_staff on dash.lead_sync;
create policy lead_sync_staff on dash.lead_sync for all using (dash.is_staff()) with check (dash.is_staff());
grant all on all tables in schema dash to anon, authenticated, service_role;
grant select on all tables in schema dash to supabase_realtime_admin;

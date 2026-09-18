-- Meta 광고 계정 스냅샷 캐시 (큰 계정은 조회에 1~2분 → 30분 캐시)
create table if not exists dash.meta_snapshots (
  project_id uuid not null references dash.projects(id) on delete cascade,
  date_preset text not null,
  fetched_at timestamptz not null default now(),
  data jsonb not null,
  primary key (project_id, date_preset)
);
alter table dash.meta_snapshots enable row level security;
drop policy if exists meta_snapshots_staff on dash.meta_snapshots;
create policy meta_snapshots_staff on dash.meta_snapshots for all using (dash.is_staff()) with check (dash.is_staff());
grant all on all tables in schema dash to anon, authenticated, service_role;

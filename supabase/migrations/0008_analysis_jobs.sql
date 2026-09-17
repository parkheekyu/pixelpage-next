-- AI 분석 대기열: API 키가 없을 때 로컬 워커(claude -p)가 처리
alter table dash.analyses drop constraint if exists analyses_status_check;
alter table dash.analyses add constraint analyses_status_check check (status in ('queued','running','done','error'));

create table if not exists dash.analysis_jobs (
  analysis_id uuid primary key references dash.analyses(id) on delete cascade,
  project_id uuid not null references dash.projects(id) on delete cascade,
  kind text not null,
  system_prompt text not null,
  prompt text not null,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  worker text
);
alter table dash.analysis_jobs enable row level security;
drop policy if exists jobs_staff_all on dash.analysis_jobs;
create policy jobs_staff_all on dash.analysis_jobs for all using (dash.is_staff()) with check (dash.is_staff());
grant all on all tables in schema dash to anon, authenticated, service_role;

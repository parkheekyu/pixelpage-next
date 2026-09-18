-- 범용 에이전트 작업 큐 (분석 외 모든 봇 작업) + 광고 소재 제안
create table if not exists dash.agent_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references dash.projects(id) on delete cascade,
  kind text not null,                       -- creative_proposal 등
  engine text not null default 'claude' check (engine in ('claude','codex')),
  system_prompt text not null,
  prompt text not null,
  status text not null default 'queued' check (status in ('queued','running','done','error')),
  result_text text,
  result_json jsonb,
  error text,
  created_by uuid references dash.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  finished_at timestamptz,
  worker text
);
create index if not exists agent_jobs_queue on dash.agent_jobs (status, created_at);
alter table dash.agent_jobs enable row level security;
drop policy if exists agent_jobs_staff on dash.agent_jobs;
create policy agent_jobs_staff on dash.agent_jobs for all using (dash.is_staff()) with check (dash.is_staff());

-- 소재 제안: 봇이 만들고 사람이 승인/반려 (코멘트) → 재제안
create table if not exists dash.proposals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references dash.projects(id) on delete cascade,
  kind text not null default 'creative',
  status text not null default 'queued' check (status in ('queued','running','proposed','approved','rejected','error')),
  engine text not null default 'codex',
  title text,
  brief jsonb,                 -- 요청 조건 (목표, 포맷, 개수, 참고)
  variants jsonb,              -- [{id, angle, format, headline, primary_text, cta, visual, hook, why}]
  feedback text,               -- 반려/수정 코멘트
  parent_id uuid references dash.proposals(id) on delete set null,   -- 재제안 원본
  job_id uuid references dash.agent_jobs(id) on delete set null,
  error text,
  created_by uuid references dash.profiles(id) on delete set null,
  decided_by uuid references dash.profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists proposals_project on dash.proposals (project_id, created_at desc);
alter table dash.proposals enable row level security;
drop policy if exists proposals_read on dash.proposals;
create policy proposals_read on dash.proposals for select using (dash.is_staff() or dash.is_member(project_id));
drop policy if exists proposals_staff_write on dash.proposals;
create policy proposals_staff_write on dash.proposals for all using (dash.is_staff()) with check (dash.is_staff());
grant all on all tables in schema dash to anon, authenticated, service_role;
grant select on all tables in schema dash to supabase_realtime_admin;

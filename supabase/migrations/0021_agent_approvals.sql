-- 외부 도구가 대표 승인을 기다리는 질문 (담당 직원이 슬랙에 묻고, 스레드 답으로 결정)
create table if not exists dash.agent_approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references dash.projects(id) on delete cascade,
  employee_id text not null,
  source text,
  question text not null,
  slack_channel text,
  slack_ts text,
  status text not null default 'pending',   -- pending | approved | declined | expired
  answer text,
  answered_by text,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
alter table dash.agent_approvals enable row level security;
drop policy if exists agent_approvals_staff on dash.agent_approvals; create policy agent_approvals_staff on dash.agent_approvals for all using (dash.is_staff()) with check (dash.is_staff());
grant all on all tables in schema dash to anon, authenticated, service_role;
notify pgrst, 'reload schema';

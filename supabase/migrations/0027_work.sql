-- 업무 관리: 프로젝트 → 마일스톤 → 할 일. 직원만 본다.
-- (dash.projects 는 고객사 대시보드이고, 여기 work_projects 는 내부 업무 프로젝트다)
create table if not exists dash.work_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  goal text,
  deadline date,
  client_id uuid references dash.clients(id) on delete set null,
  status text not null default 'active' check (status in ('active','done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists dash.work_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references dash.work_projects(id) on delete cascade,
  title text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists dash.work_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_id uuid references dash.clients(id) on delete set null,
  project_id uuid references dash.work_projects(id) on delete cascade,
  milestone_id uuid references dash.work_milestones(id) on delete set null,
  deadline date,
  priority text not null default 'mid' check (priority in ('high','mid','low')),
  status text not null default 'todo' check (status in ('todo','done','hold')),   -- 진행 / 완료 / 보류
  hold_reason text,
  done_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists work_tasks_project_idx on dash.work_tasks(project_id);
create index if not exists work_milestones_project_idx on dash.work_milestones(project_id, position);
do $$
declare t text;
begin
  foreach t in array array['work_projects','work_milestones','work_tasks'] loop
    execute format('alter table dash.%I enable row level security', t);
    execute format('grant all on dash.%I to service_role', t);
    execute format('grant select, insert, update, delete on dash.%I to authenticated', t);
    execute format('drop policy if exists %I on dash.%I', t || '_staff', t);
    execute format('create policy %I on dash.%I for all using (dash.is_staff()) with check (dash.is_staff())', t || '_staff', t);
  end loop;
end $$;
notify pgrst, 'reload schema';

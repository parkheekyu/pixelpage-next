-- 슬랙 AI 직원: 대화 기록·장기 기억·정기 업무. 대시보드는 데이터 창고, 직원은 슬랙에서 일한다.
alter table dash.agent_jobs alter column system_prompt set default '', alter column prompt set default '';
alter table dash.agent_jobs add column if not exists payload jsonb;

-- 봇이 보는 슬랙 메시지 전부 (채널·스레드 맥락 + 직원 발언)
create table if not exists dash.agent_messages (
  id bigserial primary key,
  channel text not null,
  channel_type text,                      -- channel | group | im
  thread_ts text,                         -- 스레드 루트 ts (없으면 null)
  ts text not null,
  user_id text,                           -- 슬랙 사용자 id (사람)
  user_name text,
  employee_id text,                       -- 직원이 말한 경우 직원 id
  project_id uuid references dash.projects(id) on delete set null,
  text text not null,
  created_at timestamptz not null default now(),
  unique (channel, ts)
);
create index if not exists agent_messages_thread on dash.agent_messages (channel, thread_ts, ts);
create index if not exists agent_messages_channel on dash.agent_messages (channel, ts desc);

-- 직원 장기 기억 (직원별·고객사별 메모, 결정 사항, 선호)
create table if not exists dash.agent_memory (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null,              -- 직원 id 또는 'team' (전원 공유)
  project_id uuid references dash.projects(id) on delete cascade,
  kind text not null default 'note',      -- note | decision | preference | todo
  content text not null,
  source text,                            -- slack:<channel>/<ts>
  importance int not null default 3,      -- 1~5
  created_at timestamptz not null default now(),
  expires_at timestamptz
);
create index if not exists agent_memory_emp on dash.agent_memory (employee_id, project_id, created_at desc);

-- 정기 업무 (출근 보고 등)
create table if not exists dash.agent_routines (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null,
  project_id uuid references dash.projects(id) on delete cascade,
  channel text not null,
  schedule text not null,                 -- 'daily 09:00' | 'weekdays 09:00' | 'weekly mon 09:00' (KST)
  prompt text not null,
  enabled boolean not null default true,
  last_run_on date,
  created_at timestamptz not null default now()
);

alter table dash.agent_messages enable row level security;
alter table dash.agent_memory enable row level security;
alter table dash.agent_routines enable row level security;
drop policy if exists agent_messages_staff on dash.agent_messages;
create policy agent_messages_staff on dash.agent_messages for all using (dash.is_staff()) with check (dash.is_staff());
drop policy if exists agent_memory_staff on dash.agent_memory;
create policy agent_memory_staff on dash.agent_memory for all using (dash.is_staff()) with check (dash.is_staff());
drop policy if exists agent_routines_staff on dash.agent_routines;
create policy agent_routines_staff on dash.agent_routines for all using (dash.is_staff()) with check (dash.is_staff());
grant all on all tables in schema dash to anon, authenticated, service_role;
grant usage, select on all sequences in schema dash to anon, authenticated, service_role;

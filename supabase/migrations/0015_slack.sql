-- 슬랙 연동: 프로젝트별 채널, 제안 메시지 위치, 스레드 코멘트
alter table dash.project_integrations add column if not exists slack_channel_id text;
alter table dash.proposals add column if not exists slack_channel text, add column if not exists slack_ts text;
create table if not exists dash.comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references dash.projects(id) on delete cascade,
  proposal_id uuid references dash.proposals(id) on delete cascade,
  source text not null default 'slack',       -- slack | dashboard | bot
  author text,                                -- 슬랙 표시 이름 또는 봇 이름
  author_id text,                             -- 슬랙 user id
  text text not null,
  slack_ts text,
  created_at timestamptz not null default now()
);
create index if not exists comments_proposal on dash.comments (proposal_id, created_at);
alter table dash.comments enable row level security;
drop policy if exists comments_read on dash.comments;
create policy comments_read on dash.comments for select using (dash.is_staff() or dash.is_member(project_id));
drop policy if exists comments_staff_write on dash.comments;
create policy comments_staff_write on dash.comments for all using (dash.is_staff()) with check (dash.is_staff());
grant all on all tables in schema dash to anon, authenticated, service_role;

-- 유튜브 채널 모니터링 → 새 롱폼 영상이면 담당 직원이 슬랙에서 대표에게 묻고, 승인 시 광고제작 파이프라인 실행
create table if not exists dash.yt_watch (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references dash.projects(id) on delete cascade,
  employee_id text not null,
  slack_channel text not null,
  handle text not null,                 -- @handle
  channel_id text,                      -- UC...
  channel_title text,
  enabled boolean not null default true,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (project_id, handle)
);
create table if not exists dash.yt_videos (
  video_id text primary key,
  project_id uuid not null references dash.projects(id) on delete cascade,
  watch_id uuid references dash.yt_watch(id) on delete set null,
  handle text,
  channel_title text,
  title text,
  url text,
  published_at timestamptz,
  duration_s int,
  kind text,                            -- long | short | live | unknown
  status text not null default 'seen',  -- seen | asked | approved | declined | producing | done | error
  slack_channel text,
  slack_ts text,
  job_id uuid,
  output_path text,
  error text,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
alter table dash.yt_watch enable row level security;
alter table dash.yt_videos enable row level security;
drop policy if exists yt_watch_staff on dash.yt_watch; create policy yt_watch_staff on dash.yt_watch for all using (dash.is_staff()) with check (dash.is_staff());
drop policy if exists yt_videos_staff on dash.yt_videos; create policy yt_videos_staff on dash.yt_videos for all using (dash.is_staff()) with check (dash.is_staff());
grant all on all tables in schema dash to anon, authenticated, service_role;

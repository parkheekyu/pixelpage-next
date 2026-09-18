-- 직원마다 슬랙 앱(봇) 하나씩. 자격 정보는 서비스 역할만 접근.
create table if not exists dash.slack_bots (
  employee_id text primary key,
  app_id text,
  client_id text,
  client_secret text,
  signing_secret text,
  bot_token text,
  bot_user_id text,
  team_id text,
  installed_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table dash.slack_bots enable row level security;
grant all on dash.slack_bots to service_role;

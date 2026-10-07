-- 문자/알림톡용 단축 링크 (긴 파라미터 링크 → /s/<id>)
create table if not exists dash.short_links (
  id text primary key,
  url text not null,
  hits int not null default 0,
  created_at timestamptz not null default now()
);
alter table dash.short_links enable row level security;
grant all on dash.short_links to service_role;
notify pgrst, 'reload schema';

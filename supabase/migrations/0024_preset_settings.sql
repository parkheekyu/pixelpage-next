-- 공용 프리셋 설정(대시보드 /app/presets/edit/<key> 에서 편집). 광고제작 파이프라인이 presets/<key>.json 위에 덮어쓴다.
create table if not exists dash.preset_settings (
  preset_key text primary key,
  params jsonb not null default '{}'::jsonb,
  updated_by uuid,
  updated_at timestamptz not null default now()
);
alter table dash.preset_settings enable row level security;
grant all on dash.preset_settings to service_role;
grant select, insert, update, delete on dash.preset_settings to authenticated;
drop policy if exists preset_settings_staff on dash.preset_settings;
create policy preset_settings_staff on dash.preset_settings for all using (dash.is_staff()) with check (dash.is_staff());
notify pgrst, 'reload schema';

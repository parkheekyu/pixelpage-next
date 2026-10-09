-- 고객사별 소재 프리셋 + 에셋 (대시보드 /app/presets/<project>)
-- client_presets: 공용 프리셋(광고제작/presets/<key>.json)을 고객사에 가져온 인스턴스
-- preset_assets : 그 프리셋에 쓰는 요소(배경 영상·카드·로고·사진·BGM·폰트). 사람이 드래그앤드롭으로 올리거나(upload) 광고제작 파이프라인이 넣는다(generated)
create table if not exists dash.client_presets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references dash.projects(id) on delete cascade,
  preset_key text not null,
  name text not null,
  notes text,
  params jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists client_presets_project_idx on dash.client_presets(project_id, created_at desc);

create table if not exists dash.preset_assets (
  id uuid primary key default gen_random_uuid(),
  client_preset_id uuid not null references dash.client_presets(id) on delete cascade,
  kind text not null check (kind in ('bg','card','logo','photo','audio','font','other')),
  label text,
  path text not null,
  url text not null,
  mime text,
  size bigint,
  source text not null default 'upload' check (source in ('upload','generated')),
  meta jsonb not null default '{}'::jsonb,
  sort int not null default 0,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index if not exists preset_assets_cp_idx on dash.preset_assets(client_preset_id, kind, sort, created_at);

alter table dash.client_presets enable row level security;
alter table dash.preset_assets enable row level security;
grant all on dash.client_presets to service_role;
grant all on dash.preset_assets to service_role;
grant select, insert, update, delete on dash.client_presets to authenticated;
grant select, insert, update, delete on dash.preset_assets to authenticated;

drop policy if exists client_presets_read on dash.client_presets;
create policy client_presets_read on dash.client_presets
  for select using (dash.is_staff() or dash.is_member(project_id));
drop policy if exists client_presets_staff_write on dash.client_presets;
create policy client_presets_staff_write on dash.client_presets
  for all using (dash.is_staff()) with check (dash.is_staff());

drop policy if exists preset_assets_read on dash.preset_assets;
create policy preset_assets_read on dash.preset_assets
  for select using (dash.is_staff() or exists (select 1 from dash.client_presets cp where cp.id = client_preset_id and dash.is_member(cp.project_id)));
drop policy if exists preset_assets_staff_write on dash.preset_assets;
create policy preset_assets_staff_write on dash.preset_assets
  for all using (dash.is_staff()) with check (dash.is_staff());

notify pgrst, 'reload schema';

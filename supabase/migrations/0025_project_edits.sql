-- 소재 편집기(대시보드 캡컷식 편집): 광고제작 프로젝트의 렌더 데이터(data.json)를 미디어 URL 과 함께 올려 두고, 사용자가 브라우저 Remotion Player 로 보며 수정한 결과를 data 에 저장.
-- 광고제작 파이프라인(pipeline/editor_pull.py)이 edited data 를 받아 export_remotion 에 적용해 렌더한다.
create table if not exists dash.project_edits (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references dash.projects(id) on delete cascade,
  name text not null,                       -- 광고제작 프로젝트명 (예: abq_bgtalk)
  preset_key text not null,
  composition text not null,                -- Remotion 컴포지션 (BgTalk 등)
  data jsonb not null,                      -- 현재(편집 반영) 렌더 데이터
  original jsonb not null,                  -- 파이프라인이 올린 원본
  media_base text,                          -- 미디어 공개 URL 접두
  assets jsonb not null default '[]'::jsonb,-- 교체 가능한 카드/로고 후보 [{label,url,aspect}]
  edited_at timestamptz,
  render_requested_at timestamptz,
  rendered_at timestamptz,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, name)
);
alter table dash.project_edits enable row level security;
grant all on dash.project_edits to service_role;
grant select, insert, update, delete on dash.project_edits to authenticated;
drop policy if exists project_edits_staff on dash.project_edits;
create policy project_edits_staff on dash.project_edits for all using (dash.is_staff()) with check (dash.is_staff());
notify pgrst, 'reload schema';

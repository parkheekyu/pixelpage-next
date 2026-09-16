-- 시트 행/열 편집: 프로젝트별 사용자 정의 열 + 기본 열 숨김 + 리드 수동 추가
alter table dash.projects
  add column if not exists custom_fields jsonb not null default '[]'::jsonb,   -- [{key,label,type,options?}]
  add column if not exists hidden_columns text[] not null default '{}';
alter table dash.leads
  add column if not exists custom jsonb not null default '{}'::jsonb;          -- {key: value}

-- 고객사 계정도 자기 프로젝트에 리드를 수동 추가할 수 있다 (삭제는 직원만)
drop policy if exists leads_member_insert on dash.leads;
create policy leads_member_insert on dash.leads
  for insert with check (dash.is_staff() or dash.is_member(project_id));
drop policy if exists leads_staff_insert on dash.leads;

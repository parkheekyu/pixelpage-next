-- 시트/에어테이블 자동 동기화 옵션: 가져오기는 기본 켜짐, 내보내기(대시보드→외부 쓰기)는 명시적으로 켠 고객사만
alter table dash.project_integrations add column if not exists sync_pull boolean not null default true;
alter table dash.project_integrations add column if not exists sync_push boolean not null default false;

-- 리드 시트 드래그 정렬 (직접 정렬 모드)
alter table dash.leads add column if not exists manual_order integer;
create index if not exists leads_project_manual_order on dash.leads (project_id, manual_order);

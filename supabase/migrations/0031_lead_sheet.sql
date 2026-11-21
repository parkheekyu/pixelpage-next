-- 리드는 구글 시트가 원본이다. 시트를 연결한 프로젝트는 대시보드가 시트를 읽어서 보여 주기만 한다.
-- 탭 표시 여부를 프로젝트 목록만으로 알 수 있게 표시 열을 둔다 (연동 설정 표는 직원만 읽을 수 있다).
alter table dash.projects add column if not exists has_lead_sheet boolean not null default false;
update dash.projects p set has_lead_sheet = exists (select 1 from dash.project_integrations i where i.project_id = p.id and i.google_sheet_id is not null);

-- 업무 관리(할 일 목록): 할 일마다 '하는 날'을 둔다. 마감일(deadline)과는 별개다.
-- 프로젝트 관리의 할 일을 가져오면 그 할 일의 do_date 가 채워진다 (복사하지 않는다).
alter table dash.work_tasks add column if not exists do_date date;
create index if not exists work_tasks_do_date_idx on dash.work_tasks(do_date);
notify pgrst, 'reload schema';

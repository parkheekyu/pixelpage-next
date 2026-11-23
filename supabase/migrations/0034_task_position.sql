-- 프로젝트 안 할 일의 순서를 끌어서 바꿀 수 있게 position 을 둔다 (마일스톤 안에서 1, 2, 3 …)
alter table dash.work_tasks add column if not exists position int not null default 0;
-- 기존 할 일은 지금 보이는 순서(만든 시각 → 이름)대로 번호를 매긴다
with o as (
  select id, row_number() over (partition by project_id, milestone_id order by created_at, title, id) n
  from dash.work_tasks where project_id is not null
)
update dash.work_tasks t set position = o.n from o where o.id = t.id and t.position = 0;
notify pgrst, 'reload schema';

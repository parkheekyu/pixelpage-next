-- 클라이언트 구분: DB(리드 수집형) / 판매(커머스·판매형). 자사는 계약 형태 'own' 으로 구분하므로 비워 둔다.
alter table dash.clients add column if not exists category text check (category in ('db','sales'));
update dash.clients set category = 'db' where category is null and contract_type is distinct from 'own';
update dash.clients set category = 'sales' where name = '디하북스';

-- 클라이언트는 모두 고객사(대시보드 프로젝트)로도 둔다: 연결이 없는 클라이언트에 프로젝트를 만들어 잇는다.
with ins as (
  insert into dash.projects (name, slug, is_own)
  select c.name, v.slug, false
  from dash.clients c join (values ('디하북스','dihabooks'), ('(주)버틀러','butler')) v(name, slug) on v.name = c.name
  where c.project_id is null and not exists (select 1 from dash.projects p where p.slug = v.slug)
  returning id, name
)
update dash.clients c set project_id = ins.id from ins where ins.name = c.name;
notify pgrst, 'reload schema';

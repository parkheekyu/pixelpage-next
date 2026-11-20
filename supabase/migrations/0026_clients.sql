-- 클라이언트(계약) 관리: 고객사별 계약 형태·상태·계약일·수익구조. 직원만 본다.
-- 대시보드 프로젝트(dash.projects)와는 선택적으로 연결한다 (대시보드 없이 계약만 있는 고객사도 있음).
create table if not exists dash.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  project_id uuid unique references dash.projects(id) on delete set null,
  contract_type text check (contract_type in ('markup','revshare','cpa','own')),  -- 마크업 / 수익쉐어 / CPA / 자사
  status text not null default 'active' check (status in ('active','ended')),     -- 진행중 / 종료
  contract_date date,
  end_date date,
  revenue_model text,                        -- 수익구조 (자유 서술: 예) 광고비의 15%, 건당 3만원)
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table dash.clients enable row level security;
grant all on dash.clients to service_role;
grant select, insert, update, delete on dash.clients to authenticated;
drop policy if exists clients_staff on dash.clients;
create policy clients_staff on dash.clients for all using (dash.is_staff()) with check (dash.is_staff());

-- 기존 프로젝트를 클라이언트로 옮겨 둔다 (자사 프로젝트는 계약 형태 '자사')
insert into dash.clients (name, project_id, contract_type)
select p.name, p.id, case when p.is_own then 'own' end
from dash.projects p
where p.active and not exists (select 1 from dash.clients c where c.project_id = p.id);
notify pgrst, 'reload schema';

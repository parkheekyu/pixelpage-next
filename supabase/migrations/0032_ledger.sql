-- 수입·지출 내역: 계좌·카드 거래를 한곳에 모은 장부. 직원만 본다.
create table if not exists dash.ledger (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  kind text not null check (kind in ('income','expense','excluded')),   -- 수입 / 지출 / 제외(본인 이체·대여금 등 합계에서 빼는 것)
  category text not null default '기타',
  method text,                                                          -- 결제수단 (카카오뱅크, 삼성카드 …)
  amount bigint not null check (amount >= 0),                           -- 원화
  fixed boolean not null default false,                                 -- 고정비 여부
  title text not null,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ledger_date_idx on dash.ledger(date desc);
alter table dash.ledger enable row level security;
drop policy if exists ledger_staff on dash.ledger;
create policy ledger_staff on dash.ledger for all using ((select dash.is_staff())) with check ((select dash.is_staff()));
grant select, insert, update, delete on dash.ledger to authenticated;
grant all on dash.ledger to service_role;

-- 속도 개선.
-- 1) RLS 정책의 dash.is_staff() / auth.uid() 를 (select …) 로 감싼다. 뜻은 같지만 행마다 함수를 부르지 않고 쿼리당 한 번만 계산한다.
do $$
declare r record; q text; w text;
begin
  for r in
    select c.relname, p.polname, pg_get_expr(p.polqual, p.polrelid) q, pg_get_expr(p.polwithcheck, p.polrelid) w
    from pg_policy p join pg_class c on c.oid = p.polrelid join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'dash'
  loop
    if coalesce(r.q, '') ~* 'select (dash\.is_staff|auth\.uid)' or coalesce(r.w, '') ~* 'select (dash\.is_staff|auth\.uid)' then continue; end if; -- 이미 적용됨
    q := replace(replace(r.q, 'dash.is_staff()', '(select dash.is_staff())'), 'auth.uid()', '(select auth.uid())');
    w := replace(replace(r.w, 'dash.is_staff()', '(select dash.is_staff())'), 'auth.uid()', '(select auth.uid())');
    if q is not null and q <> r.q then execute format('alter policy %I on dash.%I using (%s)', r.polname, r.relname, q); end if;
    if w is not null and w <> r.w then execute format('alter policy %I on dash.%I with check (%s)', r.polname, r.relname, w); end if;
  end loop;
end $$;

-- 2) 사이드바의 '안 본 개수' 는 모든 페이지에서 매번 계산된다. 리드를 created_at 으로 바로 찾도록 색인을 둔다.
create index if not exists leads_project_created_live on dash.leads (project_id, created_at) where not is_duplicate;
analyze dash.leads;

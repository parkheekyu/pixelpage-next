-- 리드 시트 실시간 반영: dash.leads 변경을 Realtime 으로 발행 (RLS 적용)
alter table dash.leads replica identity full;
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'dash' and tablename = 'leads') then
    alter publication supabase_realtime add table dash.leads;
  end if;
end $$;

-- Realtime 이 RLS 를 평가할 때 dash 스키마를 읽을 수 있어야 INSERT/UPDATE 이벤트가 전달된다
grant usage on schema dash to supabase_realtime_admin;
grant select on all tables in schema dash to supabase_realtime_admin;
grant execute on all functions in schema dash to supabase_realtime_admin;
alter default privileges in schema dash grant select on tables to supabase_realtime_admin;

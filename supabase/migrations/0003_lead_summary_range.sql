-- 리드 요약: 시작·종료 범위 지정 (지정 날짜 범위 필터)
drop function if exists dash.lead_summary(uuid, timestamptz);
create or replace function dash.lead_summary(p_project uuid, p_since timestamptz, p_until timestamptz)
returns jsonb language sql stable as $$
  with L as (
    select * from dash.leads where project_id = p_project and submitted_at >= p_since and submitted_at <= p_until
  )
  select jsonb_build_object(
    'all',  (select count(*) from L where not is_duplicate),
    'todo', (select count(*) from L where not is_duplicate and status in ('신규','연락중')),
    'conv', (select count(*) from L where not is_duplicate and status = '전환'),
    'need', (select count(*) from L where not is_duplicate and status = '전환' and coalesce(revenue,0) = 0),
    'drop', (select count(*) from L where not is_duplicate and status = '드랍'),
    'dup',  (select count(*) from L where is_duplicate),
    'revenue', (select coalesce(sum(revenue),0) from L where not is_duplicate and status = '전환' and pay_type = '결제확정')
  );
$$;
grant execute on function dash.lead_summary(uuid, timestamptz, timestamptz) to anon, authenticated, service_role;

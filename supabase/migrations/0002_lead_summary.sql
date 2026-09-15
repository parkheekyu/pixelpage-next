-- 리드 시트 상단 요약 + 뷰별 건수 (RLS 적용: security invoker)
create or replace function dash.lead_summary(p_project uuid, p_since timestamptz)
returns jsonb language sql stable as $$
  with L as (
    select * from dash.leads where project_id = p_project and submitted_at > p_since
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
grant execute on function dash.lead_summary(uuid, timestamptz) to anon, authenticated, service_role;

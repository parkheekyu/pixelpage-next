-- 홈페이지/LP 문의 폼 항목을 별도 열로 (문의내용에 몰아넣지 않음)
alter table dash.leads
  add column if not exists company text,
  add column if not exists industry text,
  add column if not exists budget text,
  add column if not exists services text,
  add column if not exists marketing_status text;

-- 고객사 계정 수정 금지 목록에 추가
create or replace function dash.guard_client_lead_update()
returns trigger language plpgsql as $$
begin
  if dash.is_staff() then return new; end if;
  if new.project_id      is distinct from old.project_id
  or new.submitted_at    is distinct from old.submitted_at
  or new.name            is distinct from old.name
  or new.phone           is distinct from old.phone
  or new.phone_norm      is distinct from old.phone_norm
  or new.email           is distinct from old.email
  or new.message         is distinct from old.message
  or new.company         is distinct from old.company
  or new.industry        is distinct from old.industry
  or new.budget          is distinct from old.budget
  or new.services        is distinct from old.services
  or new.marketing_status is distinct from old.marketing_status
  or new.utm_source      is distinct from old.utm_source
  or new.utm_medium      is distinct from old.utm_medium
  or new.utm_campaign    is distinct from old.utm_campaign
  or new.utm_content     is distinct from old.utm_content
  or new.utm_term        is distinct from old.utm_term
  or new.landing_id      is distinct from old.landing_id
  or new.landing_url     is distinct from old.landing_url
  or new.assignee        is distinct from old.assignee
  or new.is_duplicate    is distinct from old.is_duplicate
  or new.original_lead_id is distinct from old.original_lead_id
  or new.raw_payload     is distinct from old.raw_payload
  then
    raise exception '고객사 계정은 상태·매출·메모만 수정할 수 있습니다';
  end if;
  return new;
end $$;

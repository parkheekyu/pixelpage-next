-- 고객사별 광고 전환 목표: lead(리드/상담) 또는 purchase(구매/매출)
alter table dash.project_integrations add column if not exists meta_goal text not null default 'lead' check (meta_goal in ('lead','purchase'));

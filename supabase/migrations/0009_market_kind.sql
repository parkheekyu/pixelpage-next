-- 리서치 2종: research(본능분석·반박제거) + market(시장 리서치 브리핑, 웹 검색)
alter table dash.analyses drop constraint if exists analyses_kind_check;
alter table dash.analyses add constraint analyses_kind_check check (kind in ('research','market','ads','landing'));

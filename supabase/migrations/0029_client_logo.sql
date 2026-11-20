-- 클라이언트 로고(패비콘): 클라이언트 표와 사이드바 고객사 이름 앞에 보여 준다.
alter table dash.clients add column if not exists logo_url text;
update dash.clients set logo_url = '/client-logos/dihabooks.png'    where name = '디하북스' and logo_url is null;
update dash.clients set logo_url = '/client-logos/bettermoment.png' where name like '%베러모먼트코퍼레이션%' and logo_url is null;
update dash.clients set logo_url = '/client-logos/beforest.png'     where name = '비포레스트' and logo_url is null;
update dash.clients set logo_url = '/client-logos/gymcompany.png'   where name like '%짐컴퍼니%' and logo_url is null;
update dash.clients set logo_url = '/client-logos/plusspeech.png'   where project_id = (select id from dash.projects where slug = 'plusspeech') and logo_url is null;
update dash.clients set logo_url = '/client-logos/pixelpage.png'    where name = '픽셀페이지' and logo_url is null;
notify pgrst, 'reload schema';
update dash.clients set logo_url = '/client-logos/butler.png' where name like '%버틀러%' and logo_url is null;

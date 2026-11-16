-- 管理者數據：放在獨立的 admin 區，網站和一般使用者都讀不到，只有從 Supabase 後台看得到。
-- 四個檢視表：admin."1_使用者總覽"、admin."2_每日打卡"、admin."3_整體數字"、admin."4_回饋內容"
-- 完整內容已套用在 Supabase（migration 名稱 create_admin_views）。
create schema if not exists admin;
revoke all on schema admin from anon, authenticated;

create view admin."1_使用者總覽" as
select
  split_part(u.email, '@', 1) as "帳號",
  (u.created_at at time zone 'Asia/Taipei')::date as "註冊日期",
  (select count(*) from public.supplements s where s.user_id = u.id and s.deleted_at is null) as "保健食品數",
  (select count(distinct c.day) from public.checkins c where c.user_id = u.id) as "有打卡的天數",
  (select count(distinct c.day) from public.checkins c
     where c.user_id = u.id
       and c.day > (now() at time zone 'Asia/Taipei')::date - 7
       and c.day <= (now() at time zone 'Asia/Taipei')::date) as "最近7天有打卡的天數",
  (select max(c.day) from public.checkins c where c.user_id = u.id) as "最後打卡日",
  (select count(*) from public.feedback f where f.user_id = u.id) as "回饋則數"
from auth.users u
order by u.created_at;

create view admin."2_每日打卡" as
select
  c.day as "日期",
  split_part(u.email, '@', 1) as "帳號",
  count(*) as "打卡次數"
from public.checkins c
join auth.users u on u.id = c.user_id
group by c.day, u.email
order by c.day desc, u.email;

create view admin."3_整體數字" as
with per_user as (
  select
    u.id,
    exists (select 1 from public.supplements s where s.user_id = u.id) as has_supplement,
    (select count(distinct c.day) from public.checkins c where c.user_id = u.id) as days_all,
    (select count(distinct c.day) from public.checkins c
       where c.user_id = u.id
         and c.day > (now() at time zone 'Asia/Taipei')::date - 7
         and c.day <= (now() at time zone 'Asia/Taipei')::date) as days_7
  from auth.users u
)
select
  count(*) as "註冊人數",
  count(*) filter (where has_supplement) as "有新增保健食品的人數",
  count(*) filter (where days_all >= 1) as "打過卡的人數",
  count(*) filter (where days_7 >= 1) as "最近7天至少打卡1天",
  count(*) filter (where days_7 >= 3) as "最近7天至少打卡3天",
  count(*) filter (where days_7 >= 5) as "最近7天至少打卡5天",
  count(*) filter (where days_7 = 7) as "最近7天每天都打卡",
  (select round(avg(score), 2) from public.feedback) as "回饋平均分數",
  (select count(*) from public.feedback) as "回饋則數"
from per_user;

create view admin."4_回饋內容" as
select
  (f.created_at at time zone 'Asia/Taipei')::timestamp(0) as "時間",
  split_part(u.email, '@', 1) as "帳號",
  f.score as "分數",
  f.comment as "想說的話"
from public.feedback f
join auth.users u on u.id = f.user_id
order by f.created_at desc;

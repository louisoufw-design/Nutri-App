create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  supplement_id uuid not null references public.supplements(id) on delete cascade,
  slot text not null check (slot in ('before_breakfast','after_breakfast','after_lunch','after_dinner','bedtime')),
  day date not null,
  created_at timestamptz not null default now(),
  unique (user_id, supplement_id, slot, day)
);

comment on table public.checkins is '打卡紀錄：某人某天某個時段吃了某個保健食品。day 是使用者手機上的當地日期。取消打卡會刪除該列。';

create index checkins_user_day_idx on public.checkins (user_id, day);
create index checkins_supplement_id_idx on public.checkins (supplement_id);

alter table public.checkins enable row level security;

create policy "checkins_select_own" on public.checkins
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "checkins_insert_own" on public.checkins
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.supplements s where s.id = supplement_id and s.user_id = (select auth.uid()))
  );
create policy "checkins_delete_own" on public.checkins
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.checkins from anon;

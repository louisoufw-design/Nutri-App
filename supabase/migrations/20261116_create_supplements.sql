create table public.supplements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  dose text not null check (char_length(dose) between 1 and 30),
  -- [{ "slot": "after_breakfast", "time": "08:30" }, ...]
  times jsonb not null check (jsonb_typeof(times) = 'array' and jsonb_array_length(times) between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.supplements is '使用者自己填寫的保健食品。刪除是標記 deleted_at，不真的移除，保留試用統計。';

create index supplements_user_id_idx on public.supplements (user_id);

alter table public.supplements enable row level security;

create policy "supplements_select_own" on public.supplements
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "supplements_insert_own" on public.supplements
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "supplements_update_own" on public.supplements
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.supplements from anon;

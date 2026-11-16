create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 500),
  created_at timestamptz not null default now()
);

comment on table public.feedback is '試用回饋：1–5 分與一段文字。同一個人可以送出多次。';

create index feedback_user_id_idx on public.feedback (user_id);

alter table public.feedback enable row level security;

create policy "feedback_select_own" on public.feedback
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "feedback_insert_own" on public.feedback
  for insert to authenticated with check ((select auth.uid()) = user_id);

revoke all on public.feedback from anon;

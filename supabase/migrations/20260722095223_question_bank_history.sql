-- Cross-device Question Bank history. Exam attempts and the Review Bank used to
-- live only in localStorage, so a second device showed zero progress. Mirror
-- them to owner-scoped tables; the client keeps localStorage as an offline cache
-- and syncs both ways on login.
create table if not exists public.qb_attempts (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  product_slug text not null,
  bank_type text not null,
  mode text not null,
  score int not null,
  correct int not null,
  total int not null,
  passed boolean not null,
  pass_mark int not null,
  date_iso timestamptz not null default now(),
  duration_sec int not null default 0,
  category_breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);
alter table public.qb_attempts enable row level security;
drop policy if exists qb_attempts_owner on public.qb_attempts;
create policy qb_attempts_owner on public.qb_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.qb_review_bank (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  product_slug text not null,
  bank_type text not null,
  category text not null,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer int not null,
  explanation text not null default '',
  status text not null,
  date_iso timestamptz not null default now(),
  correct_streak int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);
alter table public.qb_review_bank enable row level security;
drop policy if exists qb_review_bank_owner on public.qb_review_bank;
create policy qb_review_bank_owner on public.qb_review_bank
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

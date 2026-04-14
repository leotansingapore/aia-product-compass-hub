-- Question bank questions table: stores all exam and study questions per product
create table public.question_bank_questions (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  bank_type text not null check (bank_type in ('study', 'exam')),
  category text not null check (category in ('product-facts', 'sales-angles', 'objection-handling', 'roleplay')),
  question text not null,
  options jsonb not null,
  correct_answer integer not null,
  explanation text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_qbq_product_bank on public.question_bank_questions (product_slug, bank_type);
create index idx_qbq_category on public.question_bank_questions (category);

alter table public.question_bank_questions enable row level security;

-- All authenticated users can read questions
create policy "Authenticated users can read questions"
  on public.question_bank_questions for select
  to authenticated using (true);

-- Admins can insert questions
create policy "Admins can insert questions"
  on public.question_bank_questions for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_admin_roles
      where user_id = auth.uid()::text
      and admin_role in ('admin', 'master_admin')
    )
  );

-- Admins can update questions
create policy "Admins can update questions"
  on public.question_bank_questions for update
  to authenticated
  using (
    exists (
      select 1 from public.user_admin_roles
      where user_id = auth.uid()::text
      and admin_role in ('admin', 'master_admin')
    )
  );

-- Admins can delete questions
create policy "Admins can delete questions"
  on public.question_bank_questions for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_admin_roles
      where user_id = auth.uid()::text
      and admin_role in ('admin', 'master_admin')
    )
  );

-- Auto-update updated_at
create or replace function update_qbq_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger question_bank_questions_updated_at
  before update on public.question_bank_questions
  for each row execute function update_qbq_updated_at();

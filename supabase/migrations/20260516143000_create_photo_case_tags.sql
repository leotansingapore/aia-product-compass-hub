-- Photo ↔ case-study tag bindings. Many-to-many: one photo can belong to
-- multiple cases AND stay bound to concept cards. Purely additive metadata.
create table if not exists public.photo_case_tags (
  id uuid primary key default gen_random_uuid(),
  photo_url text not null,
  case_id text not null,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (photo_url, case_id)
);

create index if not exists photo_case_tags_case_id_idx on public.photo_case_tags (case_id);
create index if not exists photo_case_tags_photo_url_idx on public.photo_case_tags (photo_url);

alter table public.photo_case_tags enable row level security;

-- Anyone authed can read (so the CaseVault page can show them).
drop policy if exists "photo_case_tags read for all authed" on public.photo_case_tags;
create policy "photo_case_tags read for all authed"
  on public.photo_case_tags
  for select
  to authenticated
  using (true);

-- Only admins/master_admins can insert (matches concept_cards admin gating).
-- Note: user_admin_roles.user_id is text + column is admin_role.
drop policy if exists "photo_case_tags admin insert" on public.photo_case_tags;
create policy "photo_case_tags admin insert"
  on public.photo_case_tags
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_admin_roles r
      where r.user_id = auth.uid()::text
        and r.admin_role in ('admin', 'master_admin')
    )
  );

drop policy if exists "photo_case_tags admin delete" on public.photo_case_tags;
create policy "photo_case_tags admin delete"
  on public.photo_case_tags
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_admin_roles r
      where r.user_id = auth.uid()::text
        and r.admin_role in ('admin', 'master_admin')
    )
  );

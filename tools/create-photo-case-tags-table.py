#!/usr/bin/env python3
"""
create-photo-case-tags-table.py — one-shot DDL helper that creates the
`photo_case_tags` table for tagging enhanced photos against case-study
IDs. Idempotent (safe to re-run; uses CREATE TABLE IF NOT EXISTS).

The table holds many-to-many bindings between an enhanced photo URL and a
case_id from src/data/caseVault.ts (string id like "apa-a"). A photo can
be bound to multiple cases AND stay bound to concept cards — this table
is purely additive metadata.

Run:
    python tools/create-photo-case-tags-table.py
"""
import importlib.util
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path("/Users/leo/Documents/New project/aia-product-compass-hub")
spec = importlib.util.spec_from_file_location("bh", ROOT / "tools/binding-helper.py")
bh = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bh)

PROJECT_REF = bh.PROJECT_REF

DDL = """
-- Photo ↔ case-study tag bindings. Many-to-many (one photo can belong to
-- multiple cases; one case can reference multiple photos). Photo URLs are
-- raw public storage URLs (same format as concept_cards.image_url).
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

-- Only admins/master_admins can insert/delete (matches concept_cards admin
-- gating pattern via user_admin_roles).
drop policy if exists "photo_case_tags admin insert" on public.photo_case_tags;
create policy "photo_case_tags admin insert"
  on public.photo_case_tags
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_admin_roles r
      where r.user_id = auth.uid()
        and r.role in ('admin', 'master_admin')
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
      where r.user_id = auth.uid()
        and r.role in ('admin', 'master_admin')
    )
  );
"""


def get_pat() -> str:
    import base64
    import subprocess
    raw = subprocess.check_output(
        ["security", "find-generic-password", "-s", "Supabase CLI", "-a", "supabase", "-w"],
        stderr=subprocess.DEVNULL,
    ).decode().strip()
    return base64.b64decode(raw.replace("go-keyring-base64:", "")).decode()


def exec_sql(sql: str) -> None:
    pat = get_pat()
    url = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query"
    req = urllib.request.Request(
        url,
        method="POST",
        headers={
            "Authorization": f"Bearer {pat}",
            "Content-Type": "application/json",
        },
        data=json.dumps({"query": sql}).encode(),
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            body = r.read().decode()
            print(body[:400], file=sys.stderr)
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode()}", file=sys.stderr)
        raise


if __name__ == "__main__":
    print("Creating photo_case_tags table + RLS policies...", file=sys.stderr)
    exec_sql(DDL)
    print("Done.", file=sys.stderr)

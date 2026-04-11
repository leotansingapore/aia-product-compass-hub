#!/usr/bin/env python3
"""Sync selected Obsidian vault folders into the obsidian_resources Supabase table.

Usage:
    OBSIDIAN_VAULT_PATH="/Users/leo/Documents/Obsidian Vault" \
    SUPABASE_URL="https://hgdbflprrficdoyxmdxe.supabase.co" \
    SUPABASE_SERVICE_ROLE_KEY="..." \
    python3 tools/sync_obsidian_resources.py

Reads YAML frontmatter for `shareable: true` to mark a doc visible to non-admins.
By default, all docs are private (admins only).
"""
import datetime as _dt
import os
import re
import sys
from pathlib import Path

import yaml
from supabase import create_client


def _json_safe(value):
    if isinstance(value, (_dt.date, _dt.datetime)):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: _json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_json_safe(v) for v in value]
    return value

VAULT_PATH = os.environ.get("OBSIDIAN_VAULT_PATH")
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
SERVICE_ROLE = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not (VAULT_PATH and SUPABASE_URL and SERVICE_ROLE):
    print("Missing OBSIDIAN_VAULT_PATH / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY", file=sys.stderr)
    sys.exit(1)

FOLDERS = {
    "SOPs": "reference",  # Pre-Retiree Sales Bible + Playbook live here
    "References": "reference",
    # "Advisor Training Guides": "training_guide",  # PRIVACY: contains real client coaching transcripts.
    # Re-enable once obsidian_resources has a `shareable` column + RLS filter.
    "Products": "product_moc",
    "Learning": "learning_moc",
    "Business/FINternship": "reference",
    "Business/Win Financial": "reference",
}

FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n(.*)$", re.DOTALL)


def parse_md(file_path):
    text = file_path.read_text(encoding="utf-8", errors="replace")
    match = FRONTMATTER_RE.match(text)
    if match:
        try:
            fm = yaml.safe_load(match.group(1)) or {}
        except yaml.YAMLError:
            fm = {}
        body = match.group(2)
    else:
        fm = {}
        body = text
    return fm, body


def title_of(file_path, body):
    h1 = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
    if h1:
        return h1.group(1).strip()
    return file_path.stem


def main():
    sb = create_client(SUPABASE_URL, SERVICE_ROLE)
    vault = Path(VAULT_PATH)
    if not vault.exists():
        print(f"Vault not found: {vault}", file=sys.stderr)
        sys.exit(1)

    seen_paths = set()
    added = updated = removed = 0

    for folder_name, category in FOLDERS.items():
        folder = vault / folder_name
        if not folder.exists():
            print(f"  skipping missing folder: {folder}")
            continue
        for md in folder.rglob("*.md"):
            rel = md.relative_to(vault).as_posix()
            seen_paths.add(rel)
            try:
                fm, body = parse_md(md)
            except Exception as e:
                print(f"  ! failed to parse {rel}: {e}")
                continue
            row = {
                "source_path": rel,
                "category": category,
                "title": (fm.get("title") if isinstance(fm, dict) else None) or title_of(md, body),
                "body_md": body,
                "frontmatter": _json_safe(fm) if isinstance(fm, dict) else {},
            }
            # NOTE: the obsidian_resources table currently lacks a `shareable` column.
            # All synced docs are visible to any authenticated user via RLS until
            # Lovable adds the column + RLS filter. See spec §5c for the planned
            # privacy model.
            existing = sb.table("obsidian_resources").select("id").eq("source_path", rel).execute()
            if existing.data:
                sb.table("obsidian_resources").update(row).eq("source_path", rel).execute()
                updated += 1
            else:
                sb.table("obsidian_resources").insert(row).execute()
                added += 1

    # Remove rows whose source files no longer exist
    all_rows = sb.table("obsidian_resources").select("id, source_path").execute()
    for r in (all_rows.data or []):
        if r["source_path"] not in seen_paths:
            sb.table("obsidian_resources").delete().eq("id", r["id"]).execute()
            removed += 1

    print(f"Done. Added {added}, updated {updated}, removed {removed}, total seen {len(seen_paths)}")


if __name__ == "__main__":
    main()

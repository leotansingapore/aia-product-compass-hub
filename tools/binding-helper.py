#!/usr/bin/env python3
"""
binding-helper.py

Two-mode helper for binding enhanced photos to concept cards without
clicking through the /admin/assign-drawings UI 241 times.

Mode 1 (dump):
    python tools/binding-helper.py dump > .tmp/binding-state.json

  Writes a JSON containing:
    {
      "cards": [{id, title, tags[], content_text, image_urls[], image_url}, ...],
      "photos": [{name, url, bound_to: [card_id, ...]}, ...]
    }
  Used as input for an AI/manual matching pass.

Mode 2 (apply):
    python tools/binding-helper.py apply .tmp/binding-decisions.json

  Reads a decisions JSON of the form:
    {
      "bindings": [
        {"card_id": "uuid", "add_photo_urls": ["https://.../enhanced_X.png"]},
        ...
      ]
    }
  And PATCHes each row's image_urls array (append-only, dedup).
  image_url (legacy single field) gets set to the first image so old
  renderers still find one.

Uses the macOS-keychain Supabase PAT + Management API to fetch the
service_role key on each run; no secrets in repo. Same pattern as
enhance-handwritten-drawings.py.
"""

import argparse
import base64
import json
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

PROJECT_REF = "hgdbflprrficdoyxmdxe"
SUPABASE_URL = f"https://{PROJECT_REF}.supabase.co"
STORAGE_BUCKET = "concept-card-images"
STORAGE_FOLDER = "enhanced"


def get_service_role_key() -> str:
    raw = subprocess.check_output(
        ["security", "find-generic-password", "-s", "Supabase CLI", "-a", "supabase", "-w"],
        stderr=subprocess.DEVNULL,
    ).decode().strip()
    pat = base64.b64decode(raw.replace("go-keyring-base64:", "")).decode()
    api_url = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/api-keys?reveal=true"
    req = urllib.request.Request(
        api_url,
        headers={
            "Authorization": f"Bearer {pat}",
            "User-Agent": "compass-hub-binding-helper/1.0",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        keys = json.loads(r.read())
    for k in keys:
        if k.get("name") == "service_role":
            return k["api_key"]
    raise SystemExit("service_role key not found in Management API response")


def supabase_get(path: str, service_role: str, params: dict | None = None) -> list | dict:
    url = SUPABASE_URL + path
    if params:
        url += "?" + urllib.parse.urlencode(params, doseq=True)
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {service_role}",
            "apikey": service_role,
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def supabase_patch(path: str, service_role: str, body: dict) -> dict | list:
    req = urllib.request.Request(
        SUPABASE_URL + path,
        method="PATCH",
        headers={
            "Authorization": f"Bearer {service_role}",
            "apikey": service_role,
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
        data=json.dumps(body).encode(),
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def list_storage_objects(service_role: str, folder: str) -> list[dict]:
    """List all files under STORAGE_BUCKET/<folder>, paginated."""
    url = f"{SUPABASE_URL}/storage/v1/object/list/{STORAGE_BUCKET}"
    out = []
    offset = 0
    page = 100
    while True:
        body = {
            "prefix": folder,
            "limit": page,
            "offset": offset,
            "sortBy": {"column": "created_at", "order": "desc"},
        }
        req = urllib.request.Request(
            url,
            method="POST",
            headers={
                "Authorization": f"Bearer {service_role}",
                "apikey": service_role,
                "Content-Type": "application/json",
            },
            data=json.dumps(body).encode(),
        )
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.loads(r.read())
        if not data:
            break
        for f in data:
            out.append({
                "name": f["name"],
                "created_at": f.get("created_at"),
                "url": f"{SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET}/{folder}/{f['name']}",
            })
        if len(data) < page:
            break
        offset += page
    return out


def dump(args):
    sr = get_service_role_key()
    cards = supabase_get(
        "/rest/v1/concept_cards",
        sr,
        params={
            "select": "id,title,description,tags,audience,product_type,image_url,image_urls,original_image_url,sort_order",
            "order": "sort_order.asc",
        },
    )
    photos = list_storage_objects(sr, STORAGE_FOLDER)

    # Reverse index: photo_url -> [card_id, ...]
    url_to_cards = {}
    for c in cards:
        urls = list(c.get("image_urls") or [])
        if c.get("image_url"):
            urls.append(c["image_url"])
        for u in urls:
            if not u:
                continue
            url_to_cards.setdefault(u, []).append(c["id"])

    for p in photos:
        p["bound_to"] = url_to_cards.get(p["url"], [])

    out = {
        "cards": cards,
        "photos": photos,
        "summary": {
            "total_cards": len(cards),
            "cards_with_images": sum(
                1 for c in cards
                if (c.get("image_urls") and len(c["image_urls"]) > 0) or c.get("image_url")
            ),
            "total_photos": len(photos),
            "unbound_photos": sum(1 for p in photos if not p["bound_to"]),
        },
    }
    print(json.dumps(out, indent=2))


def apply(args):
    decisions_path = Path(args.decisions)
    decisions = json.loads(decisions_path.read_text())
    sr = get_service_role_key()

    # Snapshot cards once so we can append to existing image_urls without re-querying.
    cards = supabase_get(
        "/rest/v1/concept_cards",
        sr,
        params={"select": "id,title,image_url,image_urls"},
    )
    card_by_id = {c["id"]: c for c in cards}

    results = []
    for b in decisions.get("bindings", []):
        cid = b["card_id"]
        adds = b.get("add_photo_urls", [])
        card = card_by_id.get(cid)
        if not card:
            results.append({"card_id": cid, "status": "skipped", "reason": "card_not_found"})
            continue
        existing = list(card.get("image_urls") or [])
        # Migrate legacy single field into the array if missing
        if card.get("image_url") and card["image_url"] not in existing:
            existing.append(card["image_url"])
        merged = list(existing)
        for u in adds:
            if u not in merged:
                merged.append(u)
        if merged == existing:
            results.append({"card_id": cid, "status": "noop"})
            continue
        try:
            updated = supabase_patch(
                f"/rest/v1/concept_cards?id=eq.{cid}",
                sr,
                {"image_urls": merged, "image_url": merged[0] if merged else None},
            )
            results.append({
                "card_id": cid,
                "title": card.get("title"),
                "status": "ok",
                "image_urls_count": len(merged),
            })
        except urllib.error.HTTPError as e:
            results.append({
                "card_id": cid,
                "status": "error",
                "code": e.code,
                "body": e.read().decode()[:200],
            })
        except Exception as e:
            results.append({"card_id": cid, "status": "error", "msg": str(e)})

    ok = sum(1 for r in results if r["status"] == "ok")
    err = sum(1 for r in results if r["status"] == "error")
    noop = sum(1 for r in results if r["status"] == "noop")
    print(json.dumps({"summary": {"ok": ok, "noop": noop, "error": err}, "results": results}, indent=2))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("dump", help="Print concept_cards + enhanced photos as JSON")
    ap_apply = sub.add_parser("apply", help="Read decisions JSON and PATCH concept_cards")
    ap_apply.add_argument("decisions", help="Path to decisions JSON")
    args = ap.parse_args()
    if args.cmd == "dump":
        dump(args)
    elif args.cmd == "apply":
        apply(args)


if __name__ == "__main__":
    main()

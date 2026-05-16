#!/usr/bin/env python3
"""
prune-card-images.py — dedupe and cap the photos bound to each concept card.

For every card with more than --keep images bound:
  1. Group its image_urls by source-filename key (the part after
     "enhanced_<timestamp>_" in the storage object name). Two different
     enhanced timestamps of the same source filename are treated as
     duplicates — keep only the highest-confidence variant.
  2. Within the deduped list, sort by classifier confidence
     (high > medium > low > unranked) and take the top --keep.
  3. PATCH the card so image_urls + image_url reflect the pruned set.

The pruned-off URLs are unbound (the photos stay in storage; nothing is
deleted from the bucket — Leo can re-bind any of them via
/admin/assign-drawings if he changes his mind).

Run:
    python tools/prune-card-images.py --dry-run         # preview
    python tools/prune-card-images.py --keep 5 --apply  # actually patch

Outputs .tmp/prune-plan.json with full before/after per card.
"""
import argparse
import base64
import json
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

PROJECT_REF = "hgdbflprrficdoyxmdxe"
SUPABASE_URL = f"https://{PROJECT_REF}.supabase.co"
ROOT = Path("/Users/leo/Documents/New project/aia-product-compass-hub")


def get_service_role_key() -> str:
    raw = subprocess.check_output(
        ["security", "find-generic-password", "-s", "Supabase CLI", "-a", "supabase", "-w"],
        stderr=subprocess.DEVNULL,
    ).decode().strip()
    pat = base64.b64decode(raw.replace("go-keyring-base64:", "")).decode()
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{PROJECT_REF}/api-keys?reveal=true",
        headers={
            "Authorization": f"Bearer {pat}",
            "User-Agent": "compass-hub-prune-tool/1.0",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        keys = json.loads(r.read())
    for k in keys:
        if k.get("name") == "service_role":
            return k["api_key"]
    raise SystemExit("service_role key not found")


def supabase_patch(path: str, service_role: str, body: dict):
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


URL_NAME_RE = re.compile(r"/enhanced/(enhanced_\d+_(.+))\.png(?:\?.*)?$")


def url_to_source_key(url: str) -> tuple[str, str]:
    """Return (full_filename, source_key) for a storage URL.
    source_key is everything after `enhanced_<ts>_` up to `.png`."""
    m = URL_NAME_RE.search(urllib.parse.unquote(url))
    if not m:
        return (url, url)  # weird URL — treat as its own key
    return (m.group(1), m.group(2))


CONF_RANK = {"high": 0, "medium": 1, "low": 2}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--keep", type=int, default=5, help="Max images per card after pruning (default 5)")
    ap.add_argument("--dry-run", action="store_true", help="Print plan but don't PATCH")
    ap.add_argument("--apply", action="store_true", help="Actually PATCH Supabase")
    args = ap.parse_args()
    if not args.dry_run and not args.apply:
        sys.exit("specify --dry-run or --apply")

    state = json.loads((ROOT / ".tmp/binding-state.json").read_text())
    results = json.loads((ROOT / ".tmp/classify-results.json").read_text())

    # Build URL → classifier confidence
    url_conf = {}
    for r in results:
        if "result" not in r:
            continue
        url_conf[r["url"]] = r["result"].get("confidence")

    plan = []
    for card in state["cards"]:
        urls = list(card.get("image_urls") or [])
        # legacy image_url that isn't in image_urls
        if card.get("image_url") and card["image_url"] not in urls:
            urls.append(card["image_url"])
        if len(urls) <= args.keep:
            continue

        # Group by source_key, keep best variant per group
        by_key: dict[str, list[str]] = {}
        for u in urls:
            _, src_key = url_to_source_key(u)
            by_key.setdefault(src_key, []).append(u)
        # Pick best variant per group: highest confidence wins; ties broken by URL alpha
        deduped = []
        for src_key, group in by_key.items():
            group.sort(key=lambda u: (CONF_RANK.get(url_conf.get(u), 9), u))
            deduped.append(group[0])

        # Sort deduped list by confidence, take top --keep
        deduped.sort(key=lambda u: (CONF_RANK.get(url_conf.get(u), 9), u))
        keep = deduped[: args.keep]
        drop = [u for u in urls if u not in keep]
        plan.append({
            "card_id": card["id"],
            "card_title": card["title"],
            "before": len(urls),
            "after": len(keep),
            "removed": len(drop),
            "keep_urls": keep,
            "drop_urls": drop,
        })

    (ROOT / ".tmp/prune-plan.json").write_text(json.dumps(plan, indent=2))
    if not plan:
        print(f"nothing to prune — every card already at or under {args.keep} images")
        return

    print(f"prune plan ({len(plan)} cards over the {args.keep}-image cap):")
    for p in sorted(plan, key=lambda x: -x["removed"]):
        print(f"  {p['card_title']:<55}  {p['before']:>3} → {p['after']:>2}  (drops {p['removed']:>2})")

    if args.dry_run:
        print(f"\nDry-run only. Plan written to .tmp/prune-plan.json. Re-run with --apply to PATCH.")
        return

    sr = get_service_role_key()
    print(f"\nApplying...")
    for p in plan:
        try:
            supabase_patch(
                f"/rest/v1/concept_cards?id=eq.{p['card_id']}",
                sr,
                {"image_urls": p["keep_urls"], "image_url": p["keep_urls"][0] if p["keep_urls"] else None},
            )
            print(f"  ok  {p['card_title']:<55}  → {len(p['keep_urls'])}")
        except urllib.error.HTTPError as e:
            print(f"  ERR {p['card_title']}: HTTP {e.code} {e.read().decode()[:200]}")


if __name__ == "__main__":
    main()

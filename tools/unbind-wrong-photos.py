#!/usr/bin/env python3
"""
unbind-wrong-photos.py — read .tmp/binding-audit.json, remove every
binding the vision audit flagged as matches="no", plus the one broken
base64 data URL. Updates each card's image_urls array and the legacy
image_url field in Supabase.

Run:
    python tools/unbind-wrong-photos.py             # dry-run
    python tools/unbind-wrong-photos.py --apply     # actually patch
"""
import argparse
import json
import sys
from pathlib import Path

import importlib.util

ROOT = Path("/Users/leo/Documents/New project/aia-product-compass-hub")

# Reuse binding-helper's Supabase plumbing
spec = importlib.util.spec_from_file_location("bh", ROOT / "tools/binding-helper.py")
bh = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bh)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--apply", action="store_true", help="actually PATCH; default is dry-run")
    args = ap.parse_args()

    audit = json.loads((ROOT / ".tmp/binding-audit.json").read_text())
    state = json.loads((ROOT / ".tmp/binding-state.json").read_text())
    cards_by_id = {c["id"]: c for c in state["cards"]}

    # Build set of (card_id, url) to unbind
    to_unbind = set()
    for r in audit:
        if r.get("matches") == "no":
            to_unbind.add((r["card_id"], r["url"]))

    # Also unbind the broken base64 data URL
    for c in state["cards"]:
        for u in c.get("image_urls") or []:
            if u.startswith("data:") or u.startswith("/concept-card-images/originals/"):
                # plain data: URI is broken; the originals/ paths are bare bucket paths
                # (not full URLs), some may render some may not — flag for review
                if u.startswith("data:"):
                    to_unbind.add((c["id"], u))
                    print(f"[base64-broken] {c['title']}", file=sys.stderr)

    print(f"\nWill unbind {len(to_unbind)} (card, url) pairs from {len(set(cid for cid,_ in to_unbind))} cards\n")

    # Group by card → compute new image_urls array
    by_card = {}
    for cid, u in to_unbind:
        by_card.setdefault(cid, set()).add(u)

    if not args.apply:
        print("DRY RUN — pass --apply to actually patch.\n")

    service_role = bh.get_service_role_key() if args.apply else None

    patched = 0
    cleared = 0
    for cid, remove_urls in by_card.items():
        card = cards_by_id[cid]
        old = list(card.get("image_urls") or [])
        new = [u for u in old if u not in remove_urls]
        legacy_old = card.get("image_url")
        # Legacy: clear if it equals a removed url OR use first remaining
        if new:
            legacy_new = new[0]
        else:
            legacy_new = None

        print(f"\n[{cid[:8]}] {card['title']}")
        print(f"  image_urls: {len(old)} → {len(new)}  (removed {len(remove_urls)})")
        if legacy_old != legacy_new:
            print(f"  image_url:  {str(legacy_old)[-50:] if legacy_old else 'NULL'}  →  {str(legacy_new)[-50:] if legacy_new else 'NULL'}")

        if args.apply:
            patch_body = {"image_urls": new, "image_url": legacy_new}
            bh.supabase_patch(
                f"/rest/v1/concept_cards?id=eq.{cid}",
                service_role,
                patch_body,
            )
            patched += 1
            if not new:
                cleared += 1

    print(f"\n{'PATCHED' if args.apply else 'WOULD PATCH'} {len(by_card)} cards", file=sys.stderr)
    if args.apply:
        print(f"  → {cleared} cards now have zero photos and need fresh drawings", file=sys.stderr)


if __name__ == "__main__":
    main()

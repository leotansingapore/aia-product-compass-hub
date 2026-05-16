#!/usr/bin/env python3
"""
build-matching-brief.py

Combine .tmp/binding-state.json (concept cards + photos from Supabase) with
.tmp/photo-contexts.json (Telegram export context) to produce a single
human-readable .tmp/matching-brief.md that lists every unbound, date-stamped
photo together with its Telegram context, ready for a fast classification
pass against the cards-still-missing-images list.

Run:
    python tools/build-matching-brief.py > .tmp/matching-brief.md
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path("/Users/leo/Documents/New project/aia-product-compass-hub")


def main():
    state = json.loads((ROOT / ".tmp/binding-state.json").read_text())
    contexts = json.loads((ROOT / ".tmp/photo-contexts.json").read_text())

    # Cards still missing images
    missing_cards = [
        c for c in state["cards"]
        if not ((c.get("image_urls") and len(c["image_urls"]) > 0) or c.get("image_url"))
    ]
    print("# Drawing matching brief\n")
    print(f"_Generated from binding-state.json + photo-contexts.json._\n")
    print(f"## Cards still missing images ({len(missing_cards)})\n")
    for c in missing_cards:
        desc = (c.get("description") or "").replace("\n", " ")
        print(f"- **{c['title']}** — `{c['id']}` — {desc[:160]}")
    print("\n---\n")

    # Index photos by stem (without .png/.jpg) to join with Telegram context.
    # Bucket name is like "enhanced_<ts>_photo_2025-12-28_08-59-25.png" or
    # "enhanced_<ts>_photo_2025-12-21_06-38-11 (3).png" — we extract the
    # date-stamped key after the timestamp.
    stem_re = re.compile(r"enhanced_\d+_(.+)\.png$")
    space_re = re.compile(r" \((\d+)\)$")

    unbound = []
    for p in state["photos"]:
        if p["bound_to"]:
            continue
        m = stem_re.match(p["name"])
        if not m:
            continue
        stem = m.group(1)
        ctx = contexts.get(stem)
        unbound.append({"name": p["name"], "url": p["url"], "stem": stem, "ctx": ctx})

    print(f"## Unbound photos: {len(unbound)}\n")
    print("Each photo is listed with the surrounding Telegram conversation. Use the context to map to one of the cards above. Photos without context (or with only operational notes) are flagged as `[no useful context]`.\n")
    print("---\n")

    # Sort by date for readability
    def sort_key(u):
        return u["stem"]
    unbound.sort(key=sort_key)

    for u in unbound:
        ctx = u["ctx"]
        print(f"### {u['stem']}")
        print(f"![]({u['url']})")
        if ctx is None:
            print("\n[no context found in Telegram export]\n\n---\n")
            continue
        print(f"\n_{ctx['date']}, {ctx['ts']} — **{ctx['sender']}**_")
        if ctx.get("reply_to"):
            print(f"_(in reply to: {ctx['reply_to'][:120]}...)_")
        if ctx["own_text"]:
            print(f"\n**own:** {ctx['own_text']}")
        if ctx["context_before"]:
            print("\n**before:**")
            for b in ctx["context_before"][-3:]:
                txt = b["text"].replace("\n", " ")[:400]
                print(f"- [{b['sender']}] {txt}")
        if ctx["context_after"]:
            print("\n**after:**")
            for a in ctx["context_after"][:2]:
                txt = a["text"].replace("\n", " ")[:400]
                print(f"- [{a['sender']}] {txt}")
        print("\n---\n")


if __name__ == "__main__":
    main()

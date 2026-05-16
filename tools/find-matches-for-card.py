#!/usr/bin/env python3
"""
find-matches-for-card.py — given a card title and a free-text description
of what the drawing should show, search the 205 unbound photo descriptions
and return the best candidates.

Usage:
    python tools/find-matches-for-card.py \\
        --card "The 1/3 Rule circle" \\
        --desc "pie chart split into 3 equal thirds for ST/MT/LT"
"""
import argparse
import json
import re
from pathlib import Path

ROOT = Path("/Users/leo/Documents/New project/aia-product-compass-hub")


def tokens(s: str) -> set:
    return set(re.findall(r"\w+", s.lower()))


def score(desc: dict, keywords: set, must_include: set) -> float:
    text = (
        desc.get("one_line_summary", "") + " " +
        " ".join(desc.get("topics", [])) + " " +
        " ".join(desc.get("key_numbers", []))
    ).lower()
    text_toks = tokens(text)
    # Hard requirements
    for must in must_include:
        if must.lower() not in text:
            return -1
    overlap = len(keywords & text_toks)
    bonus = 0
    # Bonus for hand-drawn / generic teaching diagrams
    if desc.get("kind") == "hand_drawn_concept":
        bonus += 2
    if desc.get("client_or_generic") == "generic":
        bonus += 1
    return overlap + bonus


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--card", required=True)
    ap.add_argument("--desc", required=True, help="free-text description of the drawing")
    ap.add_argument("--must", default="", help="comma-sep substrings that MUST appear")
    ap.add_argument("--top", type=int, default=8)
    args = ap.parse_args()

    state = json.loads((ROOT / ".tmp/binding-state.json").read_text())
    descs = json.loads((ROOT / ".tmp/photo-descriptions.json").read_text())

    bound = set()
    for c in state["cards"]:
        for u in c.get("image_urls") or []:
            bound.add(u)
        if c.get("image_url"):
            bound.add(c["image_url"])

    keywords = tokens(args.desc)
    must = set(s.strip() for s in args.must.split(",") if s.strip())

    # Dedup by URL
    seen = set()
    scored = []
    for d in descs:
        url = d["url"]
        if url in seen or url in bound:
            continue
        seen.add(url)
        s = score(d, keywords, must)
        if s >= 0:
            scored.append((s, d))

    scored.sort(key=lambda x: -x[0])

    target_card = next((c for c in state["cards"] if c["title"] == args.card), None)
    print(f"Card: {args.card}")
    if target_card:
        print(f"  id: {target_card['id']}")
    print(f"Description: {args.desc}")
    print(f"Must include: {sorted(must) if must else 'none'}")
    print(f"\nTop {args.top} candidates:\n")
    for i, (s, d) in enumerate(scored[:args.top], 1):
        print(f"{i:2}. [score={s:.0f}] {d.get('one_line_summary','')[:100]}")
        print(f"     kind={d.get('kind','?')}  topics={d.get('topics',[])[:4]}")
        print(f"     URL: {d['url']}")
        print()


if __name__ == "__main__":
    main()

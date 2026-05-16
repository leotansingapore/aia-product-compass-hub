#!/usr/bin/env python3
"""
Read .tmp/classify-results.json, build a binding-decisions.json with the
HIGH-confidence card matches + the best MEDIUM-confidence matches per
card (capped per card to avoid pollution), and a review-queue.md for the
LOW-confidence matches that need Leo's eyes.
"""
import json
from pathlib import Path
from collections import defaultdict

ROOT = Path("/Users/leo/Documents/New project/aia-product-compass-hub")
results = json.loads((ROOT / ".tmp/classify-results.json").read_text())
state = json.loads((ROOT / ".tmp/binding-state.json").read_text())

CARDS_BY_ID = {c["id"]: c for c in state["cards"]}
MAX_PHOTOS_PER_CARD = 3  # don't flood a card with 10+ similar photos

# Group classifier results by card_id
per_card = defaultdict(list)  # card_id → [{conf, url, photo, reasoning, ...}]
for r in results:
    if "result" not in r:
        continue
    inner = r["result"]
    cid = inner.get("card_id")
    if not cid:
        continue
    per_card[cid].append({
        "conf": inner.get("confidence"),
        "title": inner.get("card_title"),
        "reasoning": inner.get("reasoning", ""),
        "photo": r["photo"],
        "url": r["url"],
    })

# Sort each card's matches: high > medium > low
CONF_RANK = {"high": 0, "medium": 1, "low": 2}
for cid in per_card:
    per_card[cid].sort(key=lambda x: CONF_RANK.get(x["conf"], 9))

# Build decisions: take up to MAX_PHOTOS_PER_CARD where conf is high or medium
bindings = []
review = []
for cid, matches in per_card.items():
    card = CARDS_BY_ID.get(cid)
    if not card:
        continue
    # Skip cards that already have images bound (we still want to AUGMENT but
    # be conservative — only add HIGH matches for already-bound cards).
    already_bound = bool((card.get("image_urls") and len(card["image_urls"]) > 0) or card.get("image_url"))

    accepted = []
    if already_bound:
        # Conservative: only HIGH for already-bound cards, max 2 augments
        accepted = [m for m in matches if m["conf"] == "high"][:2]
    else:
        # Aggressive: HIGH + MEDIUM, capped
        accepted = [m for m in matches if m["conf"] in ("high", "medium")][:MAX_PHOTOS_PER_CARD]
        # If only LOW matches exist, take the BEST one
        if not accepted and matches:
            accepted = [matches[0]]

    if accepted:
        bindings.append({
            "card_id": cid,
            "card_title": card["title"],
            "already_bound_images": len(card.get("image_urls") or []) + (1 if card.get("image_url") else 0),
            "add_photo_urls": [m["url"] for m in accepted],
            "notes": f"Classifier matches: " + "; ".join(
                f"[{m['conf']}] {m['reasoning'][:120]}" for m in accepted
            ),
        })

    # Surface all LOW matches + any MEDIUM not in accepted to review queue
    rejected = [m for m in matches if m not in accepted]
    if rejected:
        review.append({"card_id": cid, "card_title": card["title"], "rejected": rejected[:6]})

decisions = {"_comment": "Round 3 — Claude CLI vision classifier auto-binds. Apply via tools/binding-helper.py apply.", "bindings": bindings}
(ROOT / ".tmp/binding-decisions.json").write_text(json.dumps(decisions, indent=2))
print(f"decisions: {len(bindings)} cards (auto-bind), {sum(len(b['add_photo_urls']) for b in bindings)} photo URLs total")

# Build review queue
out = ["# Round 3 classifier review queue\n"]
out.append(f"Auto-bound: {len(bindings)} cards / {sum(len(b['add_photo_urls']) for b in bindings)} photos. Below are the matches I didn't auto-bind — either lower-confidence or duplicates of accepted matches. Eyeball them in `/admin/assign-drawings` if you want extra variants.\n")
for r in review:
    out.append(f"\n## {r['card_title']}  (`{r['card_id']}`)")
    for m in r["rejected"]:
        out.append(f"- **[{m['conf']}]** {m['photo'][-50:]}")
        out.append(f"  - {m['reasoning'][:300]}")
        out.append(f"  - {m['url']}")
(ROOT / ".tmp/round3-review-queue.md").write_text("\n".join(out))
print(f"review queue: {len(review)} cards with rejected matches → .tmp/round3-review-queue.md")

#!/usr/bin/env python3
"""
Uncapped variant of build-decisions-from-classifier.py.

Per Leo's request "for every concept there is a few versions of a drawing to
refer to":
  - bind ALL classifier matches (high + medium + low with card_id), no cap
  - for each classified photo, also bind its variants (other enhanced
    timestamps of the same source-key) to the same card
  - only null-card classifications stay unbound (the not-a-concept-drawing
    bucket)

Writes .tmp/binding-decisions.json. Apply with binding-helper.py.
"""
import json
import re
from pathlib import Path
from collections import defaultdict

ROOT = Path("/Users/leo/Documents/New project/aia-product-compass-hub")
results = json.loads((ROOT / ".tmp/classify-results.json").read_text())
state = json.loads((ROOT / ".tmp/binding-state.json").read_text())

CARDS_BY_ID = {c["id"]: c for c in state["cards"]}

# Build source-key → list of all photo URLs in the bucket.
# Source key is everything after "enhanced_<ts>_" up to ".png" (so
# enhanced_X_photo_Y.png and enhanced_Z_photo_Y.png share key "photo_Y").
stem_re = re.compile(r"enhanced_\d+_(.+)\.png$")
key_to_urls = defaultdict(list)
for p in state["photos"]:
    m = stem_re.match(p["name"])
    if not m:
        continue
    key_to_urls[m.group(1)].append(p["url"])

# Group classifier results by card_id. Keep ALL non-null matches.
per_card = defaultdict(list)  # card_id → [{conf, url, photo, reasoning}, ...]
for r in results:
    if "result" not in r:
        continue
    inner = r["result"]
    cid = inner.get("card_id")
    if not cid:
        continue
    photo_name = Path(r["photo"]).name
    m = stem_re.match(photo_name)
    src_key = m.group(1) if m else None
    per_card[cid].append({
        "conf": inner.get("confidence"),
        "reasoning": inner.get("reasoning", ""),
        "url": r["url"],
        "src_key": src_key,
    })

CONF_RANK = {"high": 0, "medium": 1, "low": 2}

bindings = []
for cid, matches in per_card.items():
    card = CARDS_BY_ID.get(cid)
    if not card:
        continue
    matches.sort(key=lambda x: CONF_RANK.get(x["conf"], 9))

    # Expand each match to include its duplicate enhanced variants.
    all_urls = []
    seen = set()
    for m in matches:
        # The classified URL itself
        if m["url"] not in seen:
            all_urls.append(m["url"])
            seen.add(m["url"])
        # Sister enhancements of the same source key
        if m["src_key"]:
            for sister_url in key_to_urls.get(m["src_key"], []):
                if sister_url not in seen:
                    all_urls.append(sister_url)
                    seen.add(sister_url)

    if not all_urls:
        continue
    bindings.append({
        "card_id": cid,
        "card_title": card["title"],
        "add_photo_urls": all_urls,
        "match_count": len(matches),
        "expanded_count": len(all_urls),
        "by_confidence": {
            "high": sum(1 for m in matches if m["conf"] == "high"),
            "medium": sum(1 for m in matches if m["conf"] == "medium"),
            "low": sum(1 for m in matches if m["conf"] == "low"),
        },
    })

decisions = {
    "_comment": "Uncapped variant — bind ALL classifier matches + their enhanced-variant duplicates so each card carries every available version of its drawing.",
    "bindings": bindings,
}
(ROOT / ".tmp/binding-decisions.json").write_text(json.dumps(decisions, indent=2))
total = sum(len(b["add_photo_urls"]) for b in bindings)
print(f"decisions: {len(bindings)} cards, {total} photo URLs total (incl. duplicate variants)")
print()
print(f"Per-card breakdown:")
for b in sorted(bindings, key=lambda x: -x["expanded_count"]):
    c = b["by_confidence"]
    print(f"  +{b['expanded_count']:>2}  {b['card_title']:<50}  classifier: {c['high']}H/{c['medium']}M/{c['low']}L")

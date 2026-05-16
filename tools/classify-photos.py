#!/usr/bin/env python3
"""
classify-photos.py — use the claude CLI to classify unbound enhanced photos
against the concept cards still missing images.

For each unbound photo:
  1. Cache to .tmp/photo-cache/ if not already there.
  2. Spawn `claude -p --model sonnet --json-schema <schema>` with a prompt
     that lists all missing cards (id + title + description) and asks the
     model to pick the best match, with confidence.
  3. Collect results into .tmp/classify-results.json.

Run small first:
  python3 tools/classify-photos.py --limit 10

Then full run:
  python3 tools/classify-photos.py
"""

import argparse
import concurrent.futures
import json
import os
import re
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path("/Users/leo/Documents/New project/aia-product-compass-hub")
CACHE = ROOT / ".tmp/photo-cache"
CACHE.mkdir(parents=True, exist_ok=True)
RESULTS = ROOT / ".tmp/classify-results.json"


def cache_photo(url: str, name: str) -> Path:
    """Download photo to cache if not present. Returns local path."""
    out = CACHE / name
    if out.exists() and out.stat().st_size > 0:
        return out
    # Storage URLs include the original filename, which may contain `(1)` and
    # literal spaces — encode the path segment before urlopen.
    import urllib.parse
    parsed = urllib.parse.urlsplit(url)
    safe_path = urllib.parse.quote(parsed.path, safe="/")
    safe_url = urllib.parse.urlunsplit(
        (parsed.scheme, parsed.netloc, safe_path, parsed.query, parsed.fragment)
    )
    req = urllib.request.Request(safe_url, headers={"User-Agent": "classify/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r, open(out, "wb") as f:
        f.write(r.read())
    return out


def build_prompt(missing_cards: list[dict], photo_path: Path) -> str:
    cards_lines = []
    for c in missing_cards:
        desc = (c.get("description") or "").strip().replace("\n", " ")
        cards_lines.append(f"- id: {c['id']} | title: {c['title']} | description: {desc[:300]}")
    cards_block = "\n".join(cards_lines)
    return f"""Read the image at {photo_path} and classify it against the concept cards below.

Each card represents a hand-drawn or screenshot training drawing for an AIA financial-advisory training app. The image is an enhanced version of an iPad / whiteboard / slide / portfolio screenshot that a financial consultant captured during an appointment.

Your job: pick the SINGLE card whose drawing the image most closely represents, or pick null if the image is a client-portfolio screenshot (Manulife / Pru policy cards, premium tables) / scheduling spreadsheet / generic text / not a concept-drawing at all.

Cards available ({len(missing_cards)}):
{cards_block}

Confidence calibration — read carefully:
- **high** — the image is unambiguously a representation of this card. Two or more distinctive elements from the description are clearly visible. You would defend this match in a code review.
- **medium** — the image shows the same concept the card teaches, even if the visual style differs from the description. Most details match. The reviewer would say "yes that fits".
- **low** — you're guessing because nothing else fits better, but you couldn't defend the match strongly.

When the same financial concept could be represented two ways (e.g. a "$3k → $10k/mo → $2.4M" math walkthrough is **The 25-year-old anchor** specifically; a "1/3 short-term / 1/3 mid-term / 1/3 long-term" pie is **The 1/3 Rule circle** even if the card is currently bound or not in this list), prefer the more specific card. If the most specific card isn't in the list, return card_id=null rather than a worse second-best.

If the image is a policy summary card (Manulife/Pru/AIA with policy numbers and effective dates), premium quote screenshot, list of appointments, generic spreadsheet, or otherwise NOT a hand-drawn / annotated concept diagram, return card_id=null with confidence="high" and reasoning="not_a_concept_drawing".

Output ONLY JSON matching the schema. No surrounding prose.
"""


SCHEMA = {
    "type": "object",
    "properties": {
        "card_id": {"type": ["string", "null"]},
        "card_title": {"type": ["string", "null"]},
        "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
        "reasoning": {"type": "string"},
    },
    "required": ["card_id", "confidence", "reasoning"],
}


def classify_one(photo_path: Path, missing_cards: list[dict]) -> dict:
    prompt = build_prompt(missing_cards, photo_path)
    cmd = [
        "claude",
        "-p",
        "--model", "sonnet",
        "--output-format", "json",
        "--json-schema", json.dumps(SCHEMA),
        "--dangerously-skip-permissions",
        prompt,
    ]
    t0 = time.time()
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    dur = time.time() - t0
    if proc.returncode != 0:
        return {"photo": str(photo_path), "error": proc.stderr[-500:], "dur": dur}
    try:
        outer = json.loads(proc.stdout)
        # With --json-schema, the validated payload lands in `structured_output`.
        inner = outer.get("structured_output")
        if not inner:
            # Fall back to parsing `result` (no schema mode)
            result_str = outer.get("result", "")
            result_str = re.sub(r"^```(?:json)?\s*|\s*```$", "", result_str.strip(), flags=re.S)
            inner = json.loads(result_str) if result_str else None
        if not inner:
            return {"photo": photo_path.name, "error": "no structured_output", "raw": proc.stdout[:500], "dur": dur}
        return {"photo": photo_path.name, "result": inner, "dur": round(dur, 1), "cost_usd": outer.get("total_cost_usd")}
    except Exception as e:
        return {"photo": photo_path.name, "error": f"parse: {e}", "raw": proc.stdout[:500], "dur": dur}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--limit", type=int, default=None, help="Only process first N unbound photos")
    ap.add_argument("--workers", type=int, default=4, help="Concurrent claude CLI calls")
    ap.add_argument("--resume", action="store_true", help="Skip photos already in classify-results.json")
    args = ap.parse_args()

    state = json.loads((ROOT / ".tmp/binding-state.json").read_text())
    missing_cards = [
        c for c in state["cards"]
        if not ((c.get("image_urls") and len(c["image_urls"]) > 0) or c.get("image_url"))
    ]
    print(f"missing cards: {len(missing_cards)}", file=sys.stderr)

    # Dedupe photos by original-key suffix so we only classify one variant per
    # source drawing (the same Telegram photo uploaded multiple times always
    # produces the same enhancement up to AI noise).
    stem_re = re.compile(r"enhanced_\d+_(.+)\.png$")
    seen = set()
    unbound = []
    for p in state["photos"]:
        if p["bound_to"]:
            continue
        m = stem_re.match(p["name"])
        if not m:
            continue
        key = m.group(1)
        if key in seen:
            continue
        seen.add(key)
        unbound.append(p)
    if args.limit:
        unbound = unbound[: args.limit]

    # Load existing results to support --resume
    prior = {}
    if args.resume and RESULTS.exists():
        try:
            prior = {r["photo"]: r for r in json.loads(RESULTS.read_text())}
        except Exception:
            pass
    print(f"unbound (unique): {len(unbound)};  already classified: {len(prior)}", file=sys.stderr)

    # Cache downloads first (cheap, sequential, retry once on timeout)
    to_run = []
    download_failures = 0
    for p in unbound:
        if args.resume and p["name"] in prior:
            continue
        try:
            local = cache_photo(p["url"], p["name"])
        except Exception as e:
            try:
                local = cache_photo(p["url"], p["name"])  # one retry
            except Exception as e2:
                download_failures += 1
                print(f"  download fail (skipped): {p['name']}: {e2}", file=sys.stderr)
                continue
        to_run.append((p, local))
    print(f"to classify this run: {len(to_run)} (download failures skipped: {download_failures})", file=sys.stderr)

    # Run in parallel
    results = list(prior.values())
    t_start = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as ex:
        futs = {
            ex.submit(classify_one, local, missing_cards): (p, local)
            for p, local in to_run
        }
        for i, fut in enumerate(concurrent.futures.as_completed(futs), 1):
            p, local = futs[fut]
            res = fut.result()
            res["url"] = p["url"]
            results.append(res)
            # Persist incrementally so a crash doesn't lose progress
            RESULTS.write_text(json.dumps(results, indent=2))
            elapsed = time.time() - t_start
            if "result" in res:
                card = res["result"].get("card_title") or "(none)"
                conf = res["result"].get("confidence")
                print(f"  [{i}/{len(to_run)}] {local.name[-40:]} → {card} ({conf})  {res['dur']}s  total {elapsed:.0f}s", file=sys.stderr)
            else:
                print(f"  [{i}/{len(to_run)}] {local.name[-40:]} → ERROR  {res.get('error','')[:80]}", file=sys.stderr)

    # Summary
    ok = [r for r in results if "result" in r]
    high = [r for r in ok if r["result"].get("confidence") == "high" and r["result"].get("card_id")]
    print(f"\nDone. total={len(results)} ok={len(ok)} high-confidence-with-card={len(high)}", file=sys.stderr)
    print(json.dumps({"total": len(results), "ok": len(ok), "high": len(high)}))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
audit-card-bindings.py — vision-verify every photo currently bound to a
concept card. For each (card_id, photo_url) pair, ask claude to compare
the photo to the card's title + one-line summary and report:
  - matches: yes | partial | no
  - confidence: high | medium | low
  - reasoning: short explanation

Writes .tmp/binding-audit.json and prints a list of likely-wrong bindings.

Run:
    python tools/audit-card-bindings.py --workers 6 --resume
"""
import argparse
import concurrent.futures
import json
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path("/Users/leo/Documents/New project/aia-product-compass-hub")
CACHE = ROOT / ".tmp/photo-cache"
CACHE.mkdir(parents=True, exist_ok=True)
RESULTS = ROOT / ".tmp/binding-audit.json"

SCHEMA = {
    "type": "object",
    "properties": {
        "matches": {"type": "string", "enum": ["yes", "partial", "no"]},
        "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
        "what_photo_shows": {"type": "string"},
        "reasoning": {"type": "string"},
    },
    "required": ["matches", "confidence", "what_photo_shows", "reasoning"],
}

URL_NAME_RE = re.compile(r"/(?:enhanced|originals)/(.+?\.(?:png|jpg|jpeg))(?:\?.*)?$")


def url_to_filename(url: str) -> str:
    m = URL_NAME_RE.search(urllib.parse.unquote(url))
    return m.group(1) if m else url.rsplit("/", 1)[-1]


def cache_photo(url: str) -> Path:
    name = url_to_filename(url)
    out = CACHE / name
    if out.exists() and out.stat().st_size > 0:
        return out
    parsed = urllib.parse.urlsplit(url)
    safe_path = urllib.parse.quote(parsed.path, safe="/")
    safe_url = urllib.parse.urlunsplit(
        (parsed.scheme, parsed.netloc, safe_path, parsed.query, parsed.fragment)
    )
    req = urllib.request.Request(safe_url, headers={"User-Agent": "audit/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r, open(out, "wb") as f:
        f.write(r.read())
    return out


def audit_one(card, photo_path: Path) -> dict:
    title = card["title"]
    summary = card.get("one_line_summary") or card.get("summary") or ""
    prompt = f"""Read the image at {photo_path} and judge whether it actually depicts the financial-advisory concept described below.

CONCEPT CARD
Title: {title}
Summary: {summary}

Context: this image is currently bound to that card in a training app. Your
job is to flag wrong bindings so a human can re-do them.

Rules:
  - "yes"     = the image clearly depicts THIS specific concept
  - "partial" = the image is related (same product/topic family) but is not
                actually this specific drawing/concept (e.g. PWV brochure when
                the card is about PWV dividends)
  - "no"      = the image is about a completely different concept, or is a
                client policy screenshot / spreadsheet / random photo

Output JSON only:
  - matches: "yes" | "partial" | "no"
  - confidence: "high" | "medium" | "low"
  - what_photo_shows: 1 sentence — what is actually in the image
  - reasoning: 1 sentence — why it matches or doesn't
"""
    cmd = [
        "claude", "-p", "--model", "sonnet",
        "--output-format", "json",
        "--json-schema", json.dumps(SCHEMA),
        "--dangerously-skip-permissions",
        prompt,
    ]
    t0 = time.time()
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    except subprocess.TimeoutExpired:
        return {"error": "timeout", "dur": time.time() - t0}
    dur = time.time() - t0
    if proc.returncode != 0:
        return {"error": proc.stderr[-200:], "dur": dur}
    try:
        outer = json.loads(proc.stdout)
        inner = outer.get("structured_output")
        if not inner:
            return {"error": "no structured_output", "raw": proc.stdout[:300], "dur": dur}
        return {"result": inner, "dur": round(dur, 1)}
    except Exception as e:
        return {"error": f"parse: {e}", "raw": proc.stdout[:200], "dur": dur}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--resume", action="store_true")
    args = ap.parse_args()

    state = json.loads((ROOT / ".tmp/binding-state.json").read_text())
    cards = state["cards"]

    pairs = []  # (card, url)
    for c in cards:
        urls = c.get("image_urls") or []
        for u in urls:
            pairs.append((c, u))
    print(f"bindings to audit: {len(pairs)}", file=sys.stderr)

    prior = {}
    if args.resume and RESULTS.exists():
        try:
            for r in json.loads(RESULTS.read_text()):
                key = (r["card_id"], r["url"])
                if "matches" in r:
                    prior[key] = r
        except Exception:
            pass
    print(f"resume: {len(prior)} already audited", file=sys.stderr)

    # Cache all photos first (sequential, cheap)
    to_run = []
    for c, u in pairs:
        key = (c["id"], u)
        if key in prior:
            continue
        try:
            local = cache_photo(u)
        except Exception:
            try:
                local = cache_photo(u)
            except Exception as e:
                print(f"  download fail: {u}: {e}", file=sys.stderr)
                continue
        to_run.append((c, u, local))
    print(f"to audit: {len(to_run)}", file=sys.stderr)

    results = list(prior.values())
    t_start = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as ex:
        futs = {ex.submit(audit_one, c, local): (c, u, local) for c, u, local in to_run}
        for i, fut in enumerate(concurrent.futures.as_completed(futs), 1):
            c, u, local = futs[fut]
            res = fut.result()
            row = {"card_id": c["id"], "card_title": c["title"], "url": u, "photo": local.name}
            if "result" in res:
                row.update(res["result"])
                m = res["result"]["matches"]
                flag = "OK " if m == "yes" else ("?? " if m == "partial" else "XX ")
                shows = res["result"]["what_photo_shows"][:70]
                print(f"  [{i}/{len(to_run)}] {flag} {c['title'][:40]}  ← {shows}  ({res['dur']}s, total {time.time()-t_start:.0f}s)", file=sys.stderr)
            else:
                row["error"] = res.get("error", "?")[:120]
                print(f"  [{i}/{len(to_run)}] !! {c['title'][:40]}  ERROR {row['error'][:60]}", file=sys.stderr)
            results.append(row)
            RESULTS.write_text(json.dumps(results, indent=2))

    # Summary
    yes = sum(1 for r in results if r.get("matches") == "yes")
    partial = sum(1 for r in results if r.get("matches") == "partial")
    no = sum(1 for r in results if r.get("matches") == "no")
    err = sum(1 for r in results if "error" in r)
    print(f"\nAUDIT SUMMARY", file=sys.stderr)
    print(f"  YES     (correct binding): {yes}", file=sys.stderr)
    print(f"  PARTIAL (related but wrong): {partial}", file=sys.stderr)
    print(f"  NO      (wrong binding):     {no}", file=sys.stderr)
    print(f"  ERROR:                       {err}", file=sys.stderr)
    print(f"\nLIKELY-WRONG BINDINGS:", file=sys.stderr)
    for r in results:
        if r.get("matches") in ("partial", "no"):
            print(f"\n  CARD:   {r['card_title']}", file=sys.stderr)
            print(f"  PHOTO:  {r['photo']}", file=sys.stderr)
            print(f"  STATUS: {r['matches'].upper()}  ({r.get('confidence','?')})", file=sys.stderr)
            print(f"  SHOWS:  {r.get('what_photo_shows','')[:120]}", file=sys.stderr)
            print(f"  WHY:    {r.get('reasoning','')[:120]}", file=sys.stderr)


if __name__ == "__main__":
    main()

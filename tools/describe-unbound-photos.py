#!/usr/bin/env python3
"""
describe-unbound-photos.py — for every photo still unbound after the 3
binding rounds + prune, ask claude CLI for a one-sentence description of
what the image actually shows.

The descriptions are stored in .tmp/photo-descriptions.json keyed by URL
so Leo can later search "what unbound drawings cover X concept" — useful
for case-study reference.

Run:
    python tools/describe-unbound-photos.py --workers 6 --resume
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
RESULTS = ROOT / ".tmp/photo-descriptions.json"

SCHEMA = {
    "type": "object",
    "properties": {
        "kind": {
            "type": "string",
            "enum": [
                "hand_drawn_concept",
                "slide_screenshot",
                "policy_summary",
                "premium_quote",
                "spreadsheet",
                "calculator_screenshot",
                "text_notes",
                "other",
            ],
        },
        "topics": {"type": "array", "items": {"type": "string"}},
        "key_numbers": {"type": "array", "items": {"type": "string"}},
        "client_or_generic": {"type": "string", "enum": ["client_specific", "generic"]},
        "one_line_summary": {"type": "string"},
    },
    "required": ["kind", "topics", "key_numbers", "client_or_generic", "one_line_summary"],
}


def cache_photo(url: str, name: str) -> Path:
    out = CACHE / name
    if out.exists() and out.stat().st_size > 0:
        return out
    parsed = urllib.parse.urlsplit(url)
    safe_path = urllib.parse.quote(parsed.path, safe="/")
    safe_url = urllib.parse.urlunsplit(
        (parsed.scheme, parsed.netloc, safe_path, parsed.query, parsed.fragment)
    )
    req = urllib.request.Request(safe_url, headers={"User-Agent": "describe/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r, open(out, "wb") as f:
        f.write(r.read())
    return out


def describe_one(photo_path: Path) -> dict:
    prompt = f"""Read the image at {photo_path} and describe what it shows.

Context: this is a photo from a financial-advisor training Telegram chat
("Case study screenshots & Drawings"). Photos are typically (a) hand-drawn
whiteboard / iPad concept diagrams an FC drew during an appointment,
(b) screenshots of presenter slides, (c) screenshots of a client's
existing policies (Manulife / Pru / AIA), (d) premium quote text, or
(e) scheduling spreadsheets.

Required output:
  - kind: which category above
  - topics: short list of financial concepts visible (e.g. "retirement gap",
    "CI vs ECI", "1/3 budgeting", "dividend mode"); empty if not a financial
    concept
  - key_numbers: any concrete dollar amounts, percentages, ages visible
    (e.g. "$2.4M", "8%", "age 65"); empty if none
  - client_or_generic: "client_specific" if the image references a specific
    client's policy / portfolio / appointment details; "generic" if it's a
    teaching diagram with placeholder numbers
  - one_line_summary: a single sentence describing what's in the image
    well enough that a future search would find it ("Hand-drawn whiteboard
    showing $3k → $10k/mo at 65 retirement math with $2.4M target pot")

Output ONLY JSON. No surrounding prose.
"""
    cmd = [
        "claude", "-p", "--model", "sonnet",
        "--output-format", "json",
        "--json-schema", json.dumps(SCHEMA),
        "--dangerously-skip-permissions",
        prompt,
    ]
    t0 = time.time()
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    dur = time.time() - t0
    if proc.returncode != 0:
        return {"photo": photo_path.name, "error": proc.stderr[-300:], "dur": dur}
    try:
        outer = json.loads(proc.stdout)
        inner = outer.get("structured_output")
        if not inner:
            return {"photo": photo_path.name, "error": "no structured_output", "raw": proc.stdout[:300], "dur": dur}
        return {"photo": photo_path.name, "result": inner, "dur": round(dur, 1)}
    except Exception as e:
        return {"photo": photo_path.name, "error": f"parse: {e}", "raw": proc.stdout[:300], "dur": dur}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--resume", action="store_true")
    ap.add_argument("--limit", type=int, default=None)
    args = ap.parse_args()

    state = json.loads((ROOT / ".tmp/binding-state.json").read_text())
    # Dedupe by source key — same enhancement of same source = same drawing
    stem_re = re.compile(r"enhanced_\d+_(.+)\.png$")
    seen_keys = set()
    unbound = []
    for p in state["photos"]:
        if p["bound_to"]:
            continue
        m = stem_re.match(p["name"])
        if not m:
            continue
        key = m.group(1)
        if key in seen_keys:
            continue
        seen_keys.add(key)
        unbound.append(p)
    if args.limit:
        unbound = unbound[: args.limit]
    print(f"unbound (unique): {len(unbound)}", file=sys.stderr)

    prior = {}
    if args.resume and RESULTS.exists():
        try:
            for r in json.loads(RESULTS.read_text()):
                prior[r["photo"]] = r
        except Exception:
            pass

    to_run = []
    download_failures = 0
    for p in unbound:
        if args.resume and p["name"] in prior:
            continue
        try:
            local = cache_photo(p["url"], p["name"])
        except Exception:
            try:
                local = cache_photo(p["url"], p["name"])
            except Exception as e:
                download_failures += 1
                continue
        to_run.append((p, local))
    print(f"to describe: {len(to_run)} (download failures: {download_failures})", file=sys.stderr)

    results = list(prior.values())
    t_start = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as ex:
        futs = {ex.submit(describe_one, local): (p, local) for p, local in to_run}
        for i, fut in enumerate(concurrent.futures.as_completed(futs), 1):
            p, local = futs[fut]
            res = fut.result()
            res["url"] = p["url"]
            results.append(res)
            RESULTS.write_text(json.dumps(results, indent=2))
            elapsed = time.time() - t_start
            if "result" in res:
                summary = res["result"].get("one_line_summary", "")[:80]
                print(f"  [{i}/{len(to_run)}] {res['photo'][-40:]} → {summary}  {res['dur']}s  total {elapsed:.0f}s", file=sys.stderr)
            else:
                print(f"  [{i}/{len(to_run)}] {res['photo'][-40:]} → ERROR {res.get('error','')[:80]}", file=sys.stderr)

    print(f"\nDone. described {len([r for r in results if 'result' in r])}/{len(results)}", file=sys.stderr)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
describe-clusters.py — for each cluster from cluster-photos.py, run the
claude CLI vision describer ONCE on the representative photo and apply
the resulting description to ALL cluster members.

Reads:  .tmp/photo-clusters.json  + photo-cache/
Writes: .tmp/photo-descriptions.json   (per-URL description, dedup-aware)

Format of photo-descriptions.json:
  [
    {
      "url": "...",
      "cluster_id": 7,
      "cluster_size": 4,
      "is_representative": true | false,
      "kind": "hand_drawn_concept" | ...,
      "topics": [...],
      "key_numbers": [...],
      "client_or_generic": "...",
      "one_line_summary": "..."
    }
  ]

Run:
    python tools/describe-clusters.py --workers 6 --resume
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
CLUSTERS = ROOT / ".tmp/photo-clusters.json"
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

URL_NAME_RE = re.compile(r"/enhanced/(enhanced_\d+_(.+))\.png(?:\?.*)?$")


def url_to_filename(url: str) -> str:
    m = URL_NAME_RE.search(urllib.parse.unquote(url))
    return f"{m.group(1)}.png" if m else url.rsplit("/", 1)[-1]


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
    req = urllib.request.Request(safe_url, headers={"User-Agent": "describe-clusters/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r, open(out, "wb") as f:
        f.write(r.read())
    return out


def describe_one(photo_path: Path) -> dict:
    prompt = f"""Read the image at {photo_path} and describe what it shows.

Context: this is from a financial-advisor training Telegram chat
("Case study screenshots & Drawings"). Photos are typically (a) hand-drawn
whiteboard / iPad concept diagrams an FC drew during an appointment,
(b) screenshots of presenter slides, (c) screenshots of a client's
existing policies (Manulife / Pru / AIA), (d) premium quote text, or
(e) scheduling spreadsheets.

Output JSON only:
  - kind: which category above
  - topics: short list of financial concepts visible (e.g. "retirement gap",
    "CI vs ECI", "1/3 budgeting"); empty if not a financial concept
  - key_numbers: any concrete dollar amounts, percentages, ages visible
    (e.g. "$2.4M", "8%", "age 65"); empty if none
  - client_or_generic: "client_specific" if it references a specific
    client's policy / portfolio; "generic" if teaching diagram with
    placeholder numbers
  - one_line_summary: a single sentence describing what's in the image well
    enough that a future search would find it
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
        return {"error": proc.stderr[-200:], "dur": dur}
    try:
        outer = json.loads(proc.stdout)
        inner = outer.get("structured_output")
        if not inner:
            return {"error": "no structured_output", "raw": proc.stdout[:200], "dur": dur}
        return {"result": inner, "dur": round(dur, 1)}
    except Exception as e:
        return {"error": f"parse: {e}", "raw": proc.stdout[:200], "dur": dur}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--resume", action="store_true")
    args = ap.parse_args()

    clusters = json.loads(CLUSTERS.read_text())
    print(f"clusters: {len(clusters)}", file=sys.stderr)

    # Resume: index by representative URL
    prior_by_rep = {}
    if args.resume and RESULTS.exists():
        try:
            prior = json.loads(RESULTS.read_text())
            # Find existing rep descriptions by url
            for r in prior:
                if r.get("is_representative") and "kind" in r:
                    prior_by_rep[r["url"]] = {
                        "kind": r["kind"], "topics": r["topics"],
                        "key_numbers": r["key_numbers"],
                        "client_or_generic": r["client_or_generic"],
                        "one_line_summary": r["one_line_summary"],
                    }
        except Exception:
            pass
    print(f"resume: {len(prior_by_rep)} clusters already described", file=sys.stderr)

    # Cache all rep photos first (sequential, cheap)
    to_run = []
    for c in clusters:
        rep_url = c["representative_url"]
        if rep_url in prior_by_rep:
            continue
        try:
            local = cache_photo(rep_url)
        except Exception:
            try:
                local = cache_photo(rep_url)
            except Exception as e:
                print(f"  download fail: {rep_url}: {e}", file=sys.stderr)
                continue
        to_run.append((c, local))
    print(f"to describe: {len(to_run)} clusters", file=sys.stderr)

    rep_results = dict(prior_by_rep)
    t_start = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as ex:
        futs = {ex.submit(describe_one, local): (c, local) for c, local in to_run}
        for i, fut in enumerate(concurrent.futures.as_completed(futs), 1):
            c, local = futs[fut]
            res = fut.result()
            if "result" in res:
                rep_results[c["representative_url"]] = res["result"]
                summary = res["result"].get("one_line_summary", "")[:90]
                print(f"  [{i}/{len(to_run)}] cluster {c['cluster_id']} ({c['members']}x) → {summary}  {res['dur']}s  total {time.time()-t_start:.0f}s", file=sys.stderr)
            else:
                print(f"  [{i}/{len(to_run)}] cluster {c['cluster_id']} → ERROR {res.get('error','')[:80]}", file=sys.stderr)

            # Persist after every cluster
            out = []
            for cc in clusters:
                rep = cc["representative_url"]
                desc = rep_results.get(rep)
                if not desc:
                    continue
                for member_url in cc["member_urls"]:
                    out.append({
                        "url": member_url,
                        "cluster_id": cc["cluster_id"],
                        "cluster_size": cc["members"],
                        "is_representative": member_url == rep,
                        **desc,
                    })
            RESULTS.write_text(json.dumps(out, indent=2))

    print(f"\nDone. clusters described: {len(rep_results)}/{len(clusters)}; photo descriptions written: {sum(c['members'] for c in clusters if c['representative_url'] in rep_results)}", file=sys.stderr)


if __name__ == "__main__":
    main()

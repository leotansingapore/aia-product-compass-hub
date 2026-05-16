#!/usr/bin/env python3
"""
cluster-photos.py — perceptual-hash all enhanced photos, group near-duplicates
into clusters, and write a representative-per-cluster manifest that can be
fed to the claude-CLI classifier ONCE per cluster (instead of per photo).

Strategy:
  1. pHash each photo in .tmp/photo-cache/. Photos that aren't cached get
     downloaded first.
  2. Build a similarity graph using Hamming distance ≤ --threshold.
  3. Find connected components — each component is a cluster of
     near-identical drawings.
  4. Pick a representative per cluster (the smallest filename for stability).
  5. Write .tmp/photo-clusters.json with:
        [{cluster_id, representative_url, member_urls[], members: int},...]

Run:
    python tools/cluster-photos.py --threshold 8
"""
import argparse
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path
from collections import defaultdict

import imagehash
from PIL import Image

ROOT = Path("/Users/leo/Documents/New project/aia-product-compass-hub")
CACHE = ROOT / ".tmp/photo-cache"
CACHE.mkdir(parents=True, exist_ok=True)


def cache_photo(url: str, name: str) -> Path:
    out = CACHE / name
    if out.exists() and out.stat().st_size > 0:
        return out
    parsed = urllib.parse.urlsplit(url)
    safe_path = urllib.parse.quote(parsed.path, safe="/")
    safe_url = urllib.parse.urlunsplit(
        (parsed.scheme, parsed.netloc, safe_path, parsed.query, parsed.fragment)
    )
    req = urllib.request.Request(safe_url, headers={"User-Agent": "cluster/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r, open(out, "wb") as f:
        f.write(r.read())
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument(
        "--threshold", type=int, default=8,
        help="Hamming distance threshold to group photos (default 8). Lower = stricter; the 64-bit pHash maxes at 64."
    )
    ap.add_argument(
        "--unbound-only", action="store_true",
        help="Cluster only photos not currently bound to any concept card"
    )
    args = ap.parse_args()

    state = json.loads((ROOT / ".tmp/binding-state.json").read_text())

    # Pick which photos to cluster
    photos = []
    for p in state["photos"]:
        if args.unbound_only and p["bound_to"]:
            continue
        photos.append(p)
    print(f"photos to cluster: {len(photos)}", file=sys.stderr)

    # Download (with retry) + hash
    hashes = {}   # url -> 64-bit pHash int
    failures = 0
    for i, p in enumerate(photos):
        try:
            local = cache_photo(p["url"], p["name"])
        except Exception:
            try:
                local = cache_photo(p["url"], p["name"])
            except Exception as e:
                failures += 1
                continue
        try:
            with Image.open(local) as im:
                h = imagehash.phash(im, hash_size=8)
            hashes[p["url"]] = int(str(h), 16)
        except Exception as e:
            failures += 1
            print(f"  hash fail {local.name}: {e}", file=sys.stderr)
        if (i + 1) % 25 == 0:
            print(f"  hashed {i+1}/{len(photos)}", file=sys.stderr)
    print(f"hashed: {len(hashes)} (failures: {failures})", file=sys.stderr)

    # Union-find to merge near-duplicate pairs into clusters.
    urls = list(hashes.keys())
    parent = {u: u for u in urls}

    def find(u):
        while parent[u] != u:
            parent[u] = parent[parent[u]]
            u = parent[u]
        return u

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb

    # Pairwise compare. 291 photos → ~42K pairs, trivial.
    for i in range(len(urls)):
        ha = hashes[urls[i]]
        for j in range(i + 1, len(urls)):
            hb = hashes[urls[j]]
            # Hamming distance via XOR + popcount
            d = bin(ha ^ hb).count("1")
            if d <= args.threshold:
                union(urls[i], urls[j])

    # Collect clusters
    by_root = defaultdict(list)
    for u in urls:
        by_root[find(u)].append(u)
    clusters = sorted(by_root.values(), key=lambda c: -len(c))

    # Build manifest
    URL_NAME_RE = re.compile(r"/enhanced/(enhanced_\d+_(.+))\.png(?:\?.*)?$")
    out = []
    for i, members in enumerate(clusters):
        # Representative = smallest filename (stable + usually the earliest enhancement)
        def fname(u):
            m = URL_NAME_RE.search(urllib.parse.unquote(u))
            return m.group(1) if m else u
        members_sorted = sorted(members, key=fname)
        rep = members_sorted[0]
        out.append({
            "cluster_id": i,
            "representative_url": rep,
            "representative_name": fname(rep),
            "members": len(members),
            "member_urls": members_sorted,
            "member_names": [fname(u) for u in members_sorted],
        })

    (ROOT / ".tmp/photo-clusters.json").write_text(json.dumps(out, indent=2))
    print(f"\nclusters: {len(out)}", file=sys.stderr)
    print(f"distribution:", file=sys.stderr)
    from collections import Counter
    sizes = Counter(c["members"] for c in out)
    for sz in sorted(sizes):
        print(f"  {sz}-photo clusters: {sizes[sz]}", file=sys.stderr)
    print(f"\nTotal photos: {len(urls)}; unique drawings (clusters): {len(out)}", file=sys.stderr)
    print(f"Reduction: classifier needs to look at {len(out)} images instead of {len(urls)}", file=sys.stderr)
    print(json.dumps({"clusters": len(out), "photos": len(urls)}))


if __name__ == "__main__":
    main()

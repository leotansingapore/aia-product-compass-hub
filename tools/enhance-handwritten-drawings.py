#!/usr/bin/env python3
"""
enhance-handwritten-drawings.py

Batch-enhance handwritten drawing photos using the existing
`enhance-concept-image` Supabase edge function (Lovable AI →
google/gemini-3.1-flash-image-preview).

The same pipeline that fires when you upload a photo via the
/concept-cards admin UI with "AI Enhance On" — just runnable from
a folder of photos instead of one-at-a-time clicks.

Output: writes an `enhanced-manifest.json` with {original_path, enhanced_url}
entries you can then map to concept_cards via the admin UI or by passing
through `--update-card-by-title` to match by filename.

Usage:
    # Enhance every .jpg/.png in a folder and write manifest.
    python tools/enhance-handwritten-drawings.py \\
        --input ../aia-product-sales/case-studies/_attachments/case-study-screenshots-drawings \\
        --output enhanced-manifest.json

    # Dry-run (no API calls — just lists which files would be processed).
    python tools/enhance-handwritten-drawings.py --input <path> --dry-run

Prereq: macOS keychain entry for the Supabase CLI PAT
(installed by `supabase login`). Service-role key is fetched via
the Management API. No secrets in repo.

Credits: each enhance call uses Lovable AI credits. If
the edge function returns 500 with "payment_required", top up the
Lovable AI workspace before re-running.
"""

import argparse
import base64
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

PROJECT_REF = "hgdbflprrficdoyxmdxe"
SUPABASE_URL = f"https://{PROJECT_REF}.supabase.co"
ENHANCE_PATH = "/functions/v1/enhance-concept-image"


def get_service_role_key() -> str:
    """Fetch service_role key for the compass-hub project via the macOS keychain PAT."""
    raw = subprocess.check_output(
        ["security", "find-generic-password", "-s", "Supabase CLI", "-a", "supabase", "-w"],
        stderr=subprocess.DEVNULL,
    ).decode().strip()
    pat = base64.b64decode(raw.replace("go-keyring-base64:", "")).decode()
    api_url = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/api-keys?reveal=true"
    # Cloudflare in front of the Supabase Management API blocks the default
    # Python User-Agent ("Python-urllib/..."). Set a sane UA to get through.
    req = urllib.request.Request(
        api_url,
        headers={
            "Authorization": f"Bearer {pat}",
            "User-Agent": "compass-hub-enhance-tool/1.0",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        keys = json.loads(r.read())
    for k in keys:
        if k.get("name") == "service_role":
            return k["api_key"]
    raise SystemExit("service_role key not found in Management API response")


def enhance_one(image_path: Path, service_role: str) -> dict:
    """Send one image to the edge function. Returns {ok, url, error?} dict."""
    img_bytes = image_path.read_bytes()
    ext = image_path.suffix.lower().lstrip(".") or "jpg"
    mime = "image/png" if ext == "png" else "image/jpeg"
    b64 = "data:" + mime + ";base64," + base64.b64encode(img_bytes).decode()
    payload = json.dumps({"imageBase64": b64, "fileName": image_path.name}).encode()
    req = urllib.request.Request(
        SUPABASE_URL + ENHANCE_PATH,
        method="POST",
        headers={
            "Authorization": f"Bearer {service_role}",
            "apikey": service_role,
            "Content-Type": "application/json",
        },
        data=payload,
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            resp = json.loads(r.read())
        url = resp.get("enhancedUrl")
        if url:
            return {"ok": True, "url": url}
        return {"ok": False, "error": resp.get("error", "no enhancedUrl in response")}
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ""
        return {"ok": False, "error": f"HTTP {e.code}: {body[:300]}"}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def iter_images(input_dir: Path):
    """Yield image paths from a directory, deterministic order."""
    exts = {".jpg", ".jpeg", ".png", ".webp"}
    for p in sorted(input_dir.iterdir()):
        if p.is_file() and p.suffix.lower() in exts:
            yield p


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--input", required=True, help="Directory of handwritten photos")
    ap.add_argument("--output", default="enhanced-manifest.json", help="Output manifest JSON path")
    ap.add_argument("--limit", type=int, default=None, help="Process at most N images (testing)")
    ap.add_argument("--skip", type=int, default=0, help="Skip first N images (resume after a failure)")
    ap.add_argument("--dry-run", action="store_true", help="List files only, no API calls")
    ap.add_argument("--sleep", type=float, default=1.0, help="Seconds between calls (default 1.0)")
    args = ap.parse_args()

    input_dir = Path(args.input).expanduser().resolve()
    if not input_dir.is_dir():
        sys.exit(f"Not a directory: {input_dir}")
    files = list(iter_images(input_dir))[args.skip:]
    if args.limit:
        files = files[: args.limit]
    print(f"Found {len(files)} images in {input_dir}")
    if args.dry_run:
        for f in files:
            print("  ", f.name)
        return

    service_role = get_service_role_key()
    print(f"Got service_role key (length {len(service_role)})")

    results = []
    out_path = Path(args.output)
    # Load existing manifest if resuming
    if out_path.exists():
        try:
            results = json.loads(out_path.read_text())
            print(f"  Resuming — manifest had {len(results)} prior entries")
        except Exception:
            results = []

    done_paths = {entry["original"] for entry in results if entry.get("ok")}
    for i, p in enumerate(files):
        rel = str(p.relative_to(input_dir.parent))
        if rel in done_paths:
            print(f"  [{i+1}/{len(files)}] {p.name} — already enhanced, skipping")
            continue
        print(f"  [{i+1}/{len(files)}] {p.name} — sending...", flush=True)
        res = enhance_one(p, service_role)
        entry = {"original": rel, **res}
        results.append(entry)
        # Persist after every call so a crash doesn't lose progress
        out_path.write_text(json.dumps(results, indent=2))
        if res["ok"]:
            print(f"     ✓ {res['url']}")
        else:
            print(f"     ✗ {res['error']}")
            # If we hit payment_required, stop early
            if "payment_required" in str(res.get("error", "")).lower():
                print("\nLovable AI credits exhausted. Top up and re-run; manifest is preserved.")
                sys.exit(2)
        time.sleep(args.sleep)

    ok = sum(1 for r in results if r.get("ok"))
    fail = sum(1 for r in results if not r.get("ok"))
    print(f"\nDone. ok={ok} fail={fail}. Manifest at {out_path}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
match-photos-to-cases.py — given the parsed Telegram-export context for
every photo (photo-contexts.json) and the curated case-vault entries
(src/data/caseVault.ts), score each client-specific photo against each
case and produce suggestions for attaching reference photos to cases.

Approach: build a keyword fingerprint per case from product mentions,
prospect descriptors, plays, and tag terms; build a search corpus per
photo from own_text + ±3 messages of context + AI summary; rank by
keyword-overlap score.

Output: .tmp/photo-case-matches.json with:
  [{case_id, case_title, top_photos: [{url, score, evidence, summary}, ...]}]

Run:
    python tools/match-photos-to-cases.py --min-score 3
"""
import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path("/Users/leo/Documents/New project/aia-product-compass-hub")
CASE_VAULT_TS = ROOT / "src/data/caseVault.ts"
CONTEXTS_JSON = ROOT / ".tmp/photo-contexts.json"
DESCS_JSON = ROOT / ".tmp/photo-descriptions.json"
OUT = ROOT / ".tmp/photo-case-matches.json"

# A product → aliases dictionary; matching any alias counts as a
# product-mention hit. Aliases are intentionally STRICT to avoid substring
# collisions ("pru" → PUW/PruLink/PruActiveTerm; "tokio" → unrelated text;
# "ifa" → iFast vs Independent Financial Adviser). Each alias must be the
# distinguishing exact phrase for that product.
PRODUCT_ALIASES = {
    "pru_active_life": ["pru active life", "pruactive life"],
    "pruvantage": ["pruvantage"],
    "pru_active_term": ["pru active term", "pruactive term"],
    "pru_active_protect": ["pru active protect", "pruactive protect"],
    "prulink": ["prulink", "pru link"],
    "fwd_invest_first": ["fwd invest first", "fwd invest first summit"],
    "fwd_invest_plus": ["fwd invest plus"],
    "fwd_big_3": ["fwd big 3"],
    "manulife_investready": ["manulife investready", "manuready", "investready"],
    "manulife_lifefinity": ["manulife lifefinity", "lifefinity"],
    "manulife_retireready": ["retireready", "retire ready"],
    "manulife_smartretire": ["smartretire", "smart retire"],
    "manulife_manuregular": ["manuregular", "manu regular"],
    "manulife_manuflexi": ["manuflexi", "manu flexi"],
    "manulife": ["manulife"],   # generic Manulife mention — last resort
    "great_eastern": ["great eastern", " ge ", "ge flexi", "ge whole life", "ge endowment"],
    "ntuc_income": ["ntuc income", "ntuc living", "ntuc"],
    "singlife": ["singlife"],
    "tokio_marine": ["tokio marine"],   # NOT just "tokio" — too ambiguous
    "allianz_elastiq": ["allianz elastiq", "elastiq"],
    "allianz": ["allianz"],
    "aviva": ["aviva"],
    "ifast": ["ifast", "i-fast", "i fast"],   # the broker, NOT IFA channel
    "endowus": ["endowus"],
    "tiger_broker": ["tiger broker", "tiger brokers"],
    "ibkr": ["ibkr", "interactive broker"],
    "citibank_piw": ["citibank piw", "citi piw"],
    "dbs": [" dbs ", "dbs banker"],
}

# Tag terms that are too generic / ambiguous to use for matching on their
# own. The matcher already gives full weight to product names + specific
# dollar amounts; tag overlap is supplementary at best.
AMBIGUOUS_TAGS = {
    "ifa", "ilp", "term", "ci", "eci", "ge", "manulife", "pru",
    "restructure", "play-a", "play-b", "play-c", "duration-matched",
    "fee-attack", "consolidation", "decoupling", "rider", "young-adult",
    "pre-retiree", "redirect", "couple", "family",
}

PLAY_KEYWORDS = {
    "Play A — Whole-life / endowment restructure": ["whole life", "endowment", "paid up", "cash value", "restructure"],
    "Play B — ILP fee + structure attack": ["ilp", "supplementary charge", "perpetual fee", "fee attack"],
    "Play C — BTIR fresh start": ["btir", "buy term invest"],
    "Consolidation": ["consolidat", "multiple policies", "fragmented"],
    "Net-yield attack": ["net yield", "actual return"],
    "DIY supplement": ["diy", "etf", "s&p"],
    "Decoupling": ["decoupl", "standalone ci"],
    "Coverage upgrade": ["coverage upgrade", "rider"],
    "Retirement income": ["retirement income", "dividend mode", "dividends in retirement"],
    "Legacy floor": ["legacy", "bequest", "inheritance"],
}


def parse_cases() -> list[dict]:
    """Parse the TS file just enough to extract id, title, prospect, play,
    anchor, headline, tags from each CASES entry. Brittle but works for
    the existing well-formed file."""
    src = CASE_VAULT_TS.read_text()
    cases = []
    # Match each object inside CASES array
    obj_re = re.compile(r"\{\s*id:\s*\"([^\"]+)\".*?\n\s*\}", re.S)
    field_re = lambda name: re.compile(rf"\b{name}:\s*\"([^\"]+)\"")
    tags_re = re.compile(r"tags:\s*\[([^\]]*)\]", re.S)
    for m in obj_re.finditer(src):
        block = m.group(0)
        def field(n):
            mm = field_re(n).search(block)
            return mm.group(1) if mm else ""
        tags_m = tags_re.search(block)
        tags = []
        if tags_m:
            tags = [t.strip().strip('"').strip("'") for t in tags_m.group(1).split(",") if t.strip()]
        cases.append({
            "id": m.group(1),
            "title": field("title"),
            "prospect": field("prospect"),
            "play": field("play"),
            "anchor": field("anchor"),
            "headline": field("headline"),
            "tags": tags,
        })
    return cases


def fingerprint_for_case(c: dict) -> dict:
    """Build the set of keywords to look for in a photo's context.
    Returns dict {category: [keyword, ...]} so we can weight matches."""
    text = " ".join([c["title"], c["prospect"], c["anchor"], c["headline"], " ".join(c["tags"])]).lower()

    products = []
    for prod, aliases in PRODUCT_ALIASES.items():
        for a in aliases:
            if a in text:
                products.append((prod, a))
                break

    # Specific numbers from anchor + headline (premiums, lump-sums)
    numbers = set(re.findall(r"\$?\s?[\d,]+(?:\.\d+)?\s?[kKmM](?:ill)?", c["anchor"] + " " + c["headline"]))
    numbers |= set(re.findall(r"\d+\s?(?:years?|yrs?|y/o|-yo|-year-old)", c["anchor"] + " " + c["prospect"]))

    play_kws = PLAY_KEYWORDS.get(c["play"], [])
    tag_kws = [t.replace("-", " ") for t in c["tags"]]
    return {
        "products": products,
        "numbers": list(numbers),
        "play_kws": play_kws,
        "tag_kws": tag_kws,
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--min-score", type=int, default=3, help="Minimum match score to include in output (default 3)")
    ap.add_argument("--per-case", type=int, default=8, help="Max suggested photos per case (default 8)")
    args = ap.parse_args()

    cases = parse_cases()
    contexts = json.loads(CONTEXTS_JSON.read_text())
    descs = json.loads(DESCS_JSON.read_text())
    desc_by_url = {d["url"]: d for d in descs}
    print(f"cases: {len(cases)}, photos with context: {len(contexts)}, descriptions: {len(descs)}", file=sys.stderr)

    # Build per-photo search corpus
    stem_re = re.compile(r"enhanced_\d+_(.+)\.png$")
    photo_corpus = []  # list of {url, stem, text, summary, topics}
    for d in descs:
        url = d["url"]
        fn = url.rsplit("/", 1)[-1].replace(".png", "")
        m = re.match(r"enhanced_\d+_(.+)", fn)
        if not m:
            continue
        stem = m.group(1)
        ctx = contexts.get(stem)
        text_parts = [
            d["one_line_summary"],
            " ".join(d["topics"]),
            " ".join(d["key_numbers"]),
        ]
        if ctx:
            if ctx.get("own_text"):
                text_parts.append(ctx["own_text"])
            for b in ctx.get("context_before", []):
                text_parts.append(b["text"])
            for a in ctx.get("context_after", []):
                text_parts.append(a["text"])
        photo_corpus.append({
            "url": url,
            "stem": stem,
            "text": " ".join(text_parts).lower(),
            "summary": d["one_line_summary"],
            "topics": d["topics"],
            "kind": d["kind"],
            "client_or_generic": d["client_or_generic"],
        })

    # A number is "specific" if it's large enough to actually disambiguate
    # the case. $10K-$30K appears in too many premium discussions; bump to
    # ≥ $50K for k-suffix and ≥ $0.5M for m-suffix.
    def is_specific_num(num: str) -> bool:
        m = re.search(r"(\d+(?:[.,]\d+)?)\s?([kKmM])", num)
        if not m:
            return False
        amt = float(m.group(1).replace(",", ""))
        suf = m.group(2).lower()
        if suf == "m":
            return amt >= 0.5
        if suf == "k":
            return amt >= 50
        return False

    # Score each photo against each case
    out = []
    for case in cases:
        fp = fingerprint_for_case(case)
        candidates = []
        for ph in photo_corpus:
            score = 0
            evidence = []
            has_strong = False  # at least one product / specific number / multi-tag must hit
            # Product mention is strongest (~4 pts each)
            for prod, _alias in fp["products"]:
                for a in PRODUCT_ALIASES[prod]:
                    if a in ph["text"]:
                        score += 4
                        evidence.append(f"product:{a.strip()}")
                        has_strong = True
                        break
            # Play keywords (~2 pts each, max ~3 unique)
            play_hits = []
            for kw in fp["play_kws"]:
                if kw in ph["text"]:
                    play_hits.append(kw)
            for kw in play_hits[:3]:
                score += 2
                evidence.append(f"play:{kw}")
            # Tag keywords (~1 pt each, capped). Drop ambiguous tags
            # (ifa, ilp, term, ge, manulife, restructure, etc.) — they
            # produce too many false positives via substring collision.
            tag_hits = []
            for kw in fp["tag_kws"]:
                if not kw or kw in AMBIGUOUS_TAGS:
                    continue
                if kw in ph["text"]:
                    tag_hits.append(kw)
            for kw in tag_hits[:3]:
                score += 1
                evidence.append(f"tag:{kw}")
            # Specific number match (~3 pts each; ignore generic $1K-$10K)
            for num in fp["numbers"]:
                if not is_specific_num(num):
                    continue
                clean = num.replace("$", "").replace(" ", "").lower()
                if clean and clean in ph["text"]:
                    score += 3
                    evidence.append(f"num:{num.strip()}")
                    has_strong = True
            # Client-specific photos get a small boost
            if ph["client_or_generic"] == "client_specific":
                score += 1
            # Strong-signal only: require a product mention OR specific dollar
            # amount match. Generic tag/play overlap on its own produces too
            # many false positives — better to leave a case empty than fill
            # it with photos that just happen to mention "ILP" or "restructure".
            if not has_strong:
                continue
            if score >= args.min_score:
                candidates.append({
                    "url": ph["url"],
                    "score": score,
                    "has_strong_signal": has_strong,
                    "evidence": evidence[:8],
                    "summary": ph["summary"][:200],
                    "client_or_generic": ph["client_or_generic"],
                })
        candidates.sort(key=lambda x: (-x["has_strong_signal"], -x["score"]))
        out.append({
            "case_id": case["id"],
            "case_title": case["title"],
            "case_prospect": case["prospect"],
            "case_play": case["play"],
            "fingerprint_products": [p for p, _ in fp["products"]],
            "candidate_count": len(candidates),
            "top_photos": candidates[: args.per_case],
        })

    OUT.write_text(json.dumps(out, indent=2))
    n_matched_cases = sum(1 for o in out if o["top_photos"])
    n_total_photos = sum(len(o["top_photos"]) for o in out)
    print(f"\ncases with at least one match: {n_matched_cases} / {len(cases)}", file=sys.stderr)
    print(f"total photo suggestions: {n_total_photos}", file=sys.stderr)
    print()
    for o in sorted(out, key=lambda x: -len(x["top_photos"])):
        if not o["top_photos"]:
            continue
        prods = ",".join(o["fingerprint_products"]) or "—"
        print(f"  {o['case_id']:>8}  {o['case_title'][:48]:48}  [{prods}]  matches:{len(o['top_photos'])}")


if __name__ == "__main__":
    main()

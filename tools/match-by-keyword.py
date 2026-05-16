#!/usr/bin/env python3
"""match-by-keyword.py — search matching-brief for card-defining keywords,
weight by signal quality (own_text + immediate after), only print photos
that uniquely match ONE card."""
import re
from pathlib import Path
from collections import defaultdict
import json

ROOT = Path("/Users/leo/Documents/New project/aia-product-compass-hub")
contexts = json.loads((ROOT / ".tmp/photo-contexts.json").read_text())
state = json.loads((ROOT / ".tmp/binding-state.json").read_text())

# Build unbound-photo index by stem (the part after "enhanced_<ts>_" up to .png)
stem_re = re.compile(r"enhanced_\d+_(.+)\.png$")
unbound_by_stem = {}
for p in state["photos"]:
    if p["bound_to"]:
        continue
    m = stem_re.match(p["name"])
    if not m:
        continue
    unbound_by_stem.setdefault(m.group(1), []).append(p["url"])

# For each photo with context, build a "focus_text" — high-signal text close
# to the photo. own_text is highest-signal; then the FIRST message after
# (often a one-liner caption); then the LAST message before (setup).
def focus_text(stem):
    ctx = contexts.get(stem)
    if not ctx:
        return ""
    parts = []
    if ctx.get("own_text"):
        parts.append(ctx["own_text"])
    if ctx.get("context_after"):
        parts.append(ctx["context_after"][0]["text"])
    if ctx.get("context_before"):
        parts.append(ctx["context_before"][-1]["text"])
    return "\n".join(parts).lower()

# Patterns: keyword sets that are highly specific to each card.
# Only TIGHT phrases — avoid generic words.
patterns = {
    "The 1/3 Rule circle": [
        r"rule of one third",
        r"1/3 short term.*1/3 medium term",
        r"short term, medium term, long term",
        r"set aside 1/3 for short term",
        r"three buckets",
    ],
    "The 25-year-old anchor": [
        r"\$3,?000 today",
        r"\$10,?000/mo at 65",
        r"\$2\.4 ?(m|mill|million)",
        r"inflation.*40 yrs",
    ],
    "The retirement-gap calculation": [
        r"retirement timeline",
        r"shortfall will be \$",
        r"cpf life gives.*\$",
        r"need.*\$3\.?\d ?mill for retirement",
        r"pot needed",
    ],
    "Hospital plan with / without rider": [
        r"importance of rider",
        r"deductibles? (are )?waived",
        r"co.?insurance.*5%.*cap",
        r"5% co.?insurance.*\$3k cap",
    ],
    "CPF Life FRS / ERS / BRS": [
        r"\bBRS\b.*\bFRS\b",
        r"\bFRS\b.*\bERS\b",
        r"cpf life.*payout",
    ],
    "The Welcome + Loyalty bonus stack": [
        r"bonus structure.*5%.*8%",
        r"5% per year after 10 years.*8% per year",
        r"welcome bonus.*15%.*18%.*20%",
        r"first three years.*15%.*18%.*20%",
    ],
    "AIA APA vs S&P 500 / DIY — structural list": [
        r"aia vs s&p",
        r"no dividend tax.*no estate tax",
        r"currency risk.*estate tax",
    ],
    "The before / after restructure": [
        r"old vs new",
        r"summary of changes today",
        r"before.*after.*premium",
    ],
    "The supplementary charge curve": [
        r"supplementary charge",
        r"3\.9%.*after.*year.*10",
    ],
    "Early CI vs Major CI definitions": [
        r"carcinoma in situ",
        r"early stages.*major stages",
        r"stage 0.*stage 3",
        r"early ci policy",
    ],
    "Accident vs hospital coverage scope": [
        r"accident plan.*hospital plan",
        r"warded.*6 hours",
        r"6 hours warding",
        r"accident coverage.*medical reimbursement",
    ],
    "Plan A vs B vs C ward comparison": [
        r"plan a.*plan b.*plan c",
        r"a ward.*b ward",
        r"hsg a.*hsg b",
        r"private.*public.*ward",
    ],
    "Source-of-funds vs needs (LHS / RHS ledger)": [
        r"sources of funds",
        r"lhs.*rhs",
        r"source.*funds.*needs",
    ],
    "Whole-life cash-value redirect (pre-retiree)": [
        r"cash value.*paid.?up",
        r"redirect.*whole.?life",
        r"existing whole.?life",
    ],
    "Pulsar / Tokio / Manulife net-yield exposure": [
        r"pulsar",
        r"tokio.*marine",
        r"net.?yield exposure",
    ],
    "Retirement healthcare funding angle": [
        r"retirement funding angle",
        r"oa savings deplete",
        r"do nothing.*lose.*\$",
        r"healthcare.*funding angle",
    ],
    "CI / ECI / Relapse buffet analogy": [
        r"\bci.*eci.*relapse\b",
        r"buffet",
        r"1\s?\+\s?1.*claim",
        r"relapse.*claim",
    ],
    "The diversified portfolio pie chart": [
        r"diversif.*countries",
        r"countries.*sectors.*asset",
        r"us.*china.*japan.*tech",
        r"diversified portfolio",
    ],
    "Cost-of-delay compounding (APA bonus stack)": [
        r"cost of delay",
        r"wait \d+ years.*premium.*doubl",
        r"delay.*5 years.*\$",
    ],
    "The procrastination compounding curve": [
        r"procrastinat",
        r"start at 25 vs 35",
        r"two compounding curves",
    ],
    "Decoupling — term + standalone CI + pure invest": [
        r"decoupl.*term",
        r"standalone ci",
        r"buy term invest",
        r"btir",
    ],
    "Dividend mode mechanic": [
        r"dividend mode",
        r"accumulation phase.*payout",
        r"switch to dividend",
    ],
    "Lump sum vs dividend mode ('3 birds' reveal)": [
        r"3 birds",
        r"three birds.*one stone",
        r"income.*capital.*legacy",
    ],
    "Savings vs investing comparison": [
        r"savings vs invest",
        r"bank.*0?\.5%.*invest.*8%",
        r"\$480k.*40 ?years",
    ],
    "Income / expense waterfall": [
        r"income waterfall",
        r"expenses.*flow.*out",
        r"investable surplus",
    ],
    "The 4-quadrant coverage grid": [
        r"4.?quadrant",
        r"death/tpd.*ci/eci.*hospital.*accident",
        r"cst opener",
    ],
    "The 4-ratio liquidity grid": [
        r"liquidity ratio.*savings ratio",
        r"4.?ratio.*grid",
        r"invested assets to net worth",
    ],
    "The Three Cost Circles": [
        r"three cost circles",
        r"three overlapping circles",
        r"insurance.*investment.*lifestyle",
    ],
    "Option A / B close": [
        r"option a.*option b",
        r"\$500/mo.*\$800/mo",
    ],
    "Free-advisor / zero-fees structure": [
        r"wellington",
        r"blackrock",
        r"baillie gifford",
        r"capital group",
        r"free.?advisor",
    ],
    "The hospital-income 'pit' drawing": [
        r"hospital income.*\$100/day",
        r"hospital.?income pit",
        r"warded.*30 days",
    ],
    "Dividend income vs lump-sum drawdown": [
        r"4%.*withdraw.*\$",
        r"lump.?sum drawdown",
        r"sustainable withdrawal",
    ],
    "168% / 120% startup-bonus gimmick exposure": [
        r"168%",
        r"120%.*bonus",
        r"startup bonus.*gimmick",
    ],
    "Presenting UCC Quotes": [
        r"ucc quote",
        r"ultimate critical cover",
    ],
}
compiled = {c: [re.compile(p, re.I) for p in pats] for c, pats in patterns.items()}

# For each unbound photo, score matches.
photo_matches = []
for stem, urls in unbound_by_stem.items():
    text = focus_text(stem)
    if not text:
        continue
    hits = []
    for card, pats in compiled.items():
        for p in pats:
            if p.search(text):
                hits.append(card)
                break
    if hits:
        photo_matches.append({"stem": stem, "urls": urls, "matches": hits, "text": text[:300]})

# Unique-match: photos matching exactly one card → high confidence
unique = [p for p in photo_matches if len(p["matches"]) == 1]
multi = [p for p in photo_matches if len(p["matches"]) > 1]

out = []
out.append(f"# Keyword-match report")
out.append(f"unique-match photos: {len(unique)}")
out.append(f"multi-match photos:  {len(multi)}")
out.append(f"unbound photos with NO match: {len(unbound_by_stem) - len(photo_matches)}")
out.append("")
out.append("## UNIQUE matches — high confidence")
by_card_unique = defaultdict(list)
for p in unique:
    by_card_unique[p["matches"][0]].append(p)
for card, ps in sorted(by_card_unique.items(), key=lambda kv: -len(kv[1])):
    out.append(f"\n### {card}  ({len(ps)} photos)")
    for p in ps[:8]:
        out.append(f"  - {p['stem']}")
        out.append(f"    text: {p['text'][:180].replace(chr(10),' / ')}")
        out.append(f"    url:  {p['urls'][0]}")

out.append("\n\n## MULTI matches — needs review")
by_card_multi = defaultdict(list)
for p in multi:
    for c in p["matches"]:
        by_card_multi[c].append(p)
for card, ps in sorted(by_card_multi.items(), key=lambda kv: -len(kv[1])):
    out.append(f"\n### {card}  ({len(ps)} photos)")
    for p in ps[:5]:
        out.append(f"  - {p['stem']}  [matches: {', '.join(p['matches'])}]")

(ROOT / ".tmp/keyword-matches.txt").write_text("\n".join(out))
print(f"wrote {len(out)} lines to .tmp/keyword-matches.txt")
print(f"unique-match cards: {len(by_card_unique)}, total unique photos: {len(unique)}")

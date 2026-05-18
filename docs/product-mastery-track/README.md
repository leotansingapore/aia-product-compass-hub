# Product Mastery Track — DERIVED MIRROR (do not hand-edit)

> **One-page cheat sheets per product:** [/cheat-sheets/product-mastery/](../cheat-sheets/product-mastery/) — 7 screenshot-worthy product cards (Pro Achiever, PLP, GPP, UCC, HSGM, Solitaire PA, PWV) with specs, openers, objection clusters, cross-sell ladders, and numbers worth memorising. Master index at [/cheat-sheets/](../cheat-sheets/index.md).

## STOP — do not edit any file in this folder by hand.

This entire `docs/product-mastery-track/` folder is **derived content**. The
canonical source lives in the **`aia-product-sales`** repo under each
product folder (`pro-achiever/day-01..05.md`, `pro-lifetime-protector/day-01..05.md`,
etc).

The day files in this folder exist only so the FINternship learner app
(this repo's Vite + React app) can load them via `import.meta.glob` at
runtime — see `src/features/product-mastery-track/content.ts`.

## To edit a day file

1. Open the corresponding file in `aia-product-sales/<product>/day-NN.md`
   (or in Obsidian under `Content/product-sales/<product>/day-NN.md`).
2. Save your edit.
3. Commit + push in `aia-product-sales`.
4. Run the forward generator from the workspace root:

   ```bash
   python3 "/Users/leo/Documents/New project/tools/aia-curriculum-sync/regenerate_compass_hub.py"
   ```

5. Commit + push the regenerated files in this repo.

## Mapping

| Compass-hub | Canonical source (aia-product-sales) |
|---|---|
| `week-1/day-01..05.md` | `pro-achiever/day-01..05.md` |
| `week-2/day-06..10.md` | `pro-lifetime-protector/day-01..05.md` |
| `week-3/day-11..15.md` | `guaranteed-protect-plus/day-01..05.md` |
| `week-4/day-16..20.md` | `ultimate-critical-cover/day-01..05.md` |
| `week-5/day-21..25.md` | `healthshield-gold-max/day-01..05.md` |
| `week-6/day-26..30.md` | `solitaire-pa/day-01..05.md` |
| `week-7/day-31..35.md` | `platinum-wealth-venture/day-01..05.md` |

## Why this structure exists

The original day files lived in two places — here (week-based, app-consumed)
and in `aia-product-sales/<product>/` (per-product, deep-reference with
co-located study-bank, exam-questions, _source-resources). Edits drifted
between them. On 2026-05-14 the fork was resolved by:

1. Merging the latest compass-hub body content back into product-sales
   (preserving product-sales's richer frontmatter and co-located wikilinks)
2. Designating product-sales as the canonical hand-edit surface
3. Generating this folder from product-sales via the regenerator script

If you find this README out of date or the workflow has changed, update
both this file and the relevant memory note.

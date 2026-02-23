

## Add New Initial Text Script for Pre-Retirees

### What Will Be Added

A new script in the **Initial Texts** category, targeting **pre-retirees**, with the Golden Year Partners branding.

**Title:** Initial Text -- Golden Year Partners (Retirement Planning Interest)

**Content:** The message the user provided, formatted in markdown with the consultation link.

**Details:**
- Category: `initial-text`
- Target Audience: `pre-retiree`
- Script Role: `consultant`
- Tags: `text-message`, `initial-text`, `retirement`, `cpf`, `passive-income`
- Sort Order: `13` (next after current max of 12)

### Technical Steps

1. **Insert one row** into the `scripts` table via a database INSERT with:
   - The script content stored in the `versions` JSON array (single version, authored as "Golden Year Partners -- Retirement Interest")
   - `stage` field set to the script title (this is how existing scripts store the display title)
   - All metadata fields populated as above

No file changes are needed -- this is a data-only operation.


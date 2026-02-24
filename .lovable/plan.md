

# Smart Duplicate Detection: Staged Search Strategy

## Approach: Narrow-First, Then Widen

### Why Your Method is Better Than "Search All"

| | Search All First | Pipeline + Audience First |
|---|---|---|
| Speed | Slow (scans entire DB) | Fast (small subset) |
| Relevance | Noisy -- a cold-call and follow-up sharing words triggers false match | High -- only compares scripts that serve the same purpose |
| User experience | More "similar scripts found" warnings to dismiss | Fewer, more meaningful matches |

### Proposed Search Flow

```text
User pastes script
       |
  AI classifies -> pipeline stage + target audience
       |
  TIER 1: Search scripts matching SAME pipeline stage + SAME audience
       |
  Found matches? --> Show them (high confidence)
       |
  No matches?
       |
  TIER 2: Search scripts matching SAME pipeline stage (any audience)
       |
  Found matches? --> Show them (medium confidence)
       |
  No matches? --> Proceed directly to review (no duplicates)
```

No cross-pipeline search is needed. A post-call text is never a duplicate of an initial text.

### What Changes

**`src/components/scripts/ScriptEditorDialog.tsx`** -- `checkForDuplicates` function:

1. **Tier 1 query**: Filter by both `category` (pipeline stage) AND `target_audience`
   - If matches found at >40% similarity, show them immediately
2. **Tier 2 query** (only runs if Tier 1 finds nothing): Filter by `category` only, any audience
   - Catches cases like a "Young Adults" script that's similar to a "Working Adults" one in the same pipeline stage
3. Keep the three-tier similarity response from the previously approved plan (>80% blocks, 40-80% suggests merge, <40% proceeds)
4. Add "Add as Version" merge action per the approved plan

**`classify-script` edge function** -- no changes needed, it already returns `category` and `target_audience`

### Similarity Badge Enhancement

Each match card will show which tier it came from:
- Tier 1 matches: badge says "Same stage and audience"
- Tier 2 matches: badge says "Same stage, different audience"

This gives the user context on why a match surfaced.

### Summary of All Changes

- Modify `checkForDuplicates()` in `ScriptEditorDialog.tsx` to use two-tier sequential search instead of single-category search
- Add "Add as Version" button on each match card (calls `seed-scripts` with `mode: "append-version"`)
- Add confirmation dialog for near-identical (>80%) override
- Remove the old single `.eq("category")` query
- No database changes, no new edge functions


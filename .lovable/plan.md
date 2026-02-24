

# Sync All Training Videos to Vector Store

## Problem
There are 139 training video chunks and 212 script chunks already in the database, but **zero have embeddings** due to 504/503 timeouts. The `process-knowledge` function calls `generate-embeddings` which calls the LLM for keyword extraction, and this chain exceeds Supabase's edge function timeout limit.

Additionally, there is no UI or batch mechanism to trigger sync for all products at once.

## Root Cause
- `process-knowledge` calls `generate-embeddings` synchronously for every batch of 5 chunks
- `generate-embeddings` calls the Lovable AI gateway for keyword extraction per text
- This chain regularly times out (504/503 errors in logs)

## Solution

### 1. Add `sync_all_training_videos` action to `process-knowledge`

Add a new action that:
- Fetches all products with training videos
- For each product, processes training videos into chunks (delete old, insert new)
- Generates embeddings in smaller batches with retry logic
- Returns a summary of products processed and total chunks created

Key improvements:
- Process embedding generation with individual retries (not batch-or-nothing)
- Add a timeout per embedding call to prevent cascade failures
- Use `AbortSignal.timeout()` for fetch calls to the embedding service

### 2. Fix embedding timeout issues in `generate-embeddings`

- Add timeout handling for the LLM keyword extraction call
- If LLM call times out, immediately fall back to the `fallbackKeywords()` function (no LLM needed)
- This ensures embeddings are always generated, even if slower/less semantic

### 3. Fix `process-knowledge` embedding storage

- Reduce batch size from 5 to 2 to prevent timeouts
- Add per-chunk error handling so one failed embedding doesn't block the rest
- Add timeout to the fetch call to `generate-embeddings`

### 4. Create an admin UI button to trigger bulk sync

- Add a "Sync All to AI" button in the Knowledge Base admin panel
- Shows progress as products are synced
- Calls `process-knowledge` with `action: sync_all_training_videos`

### 5. Also re-embed existing chunks that have null embeddings

- Add a `reembed_missing` action that finds chunks with null embeddings and generates them
- This fixes the 351 existing chunks that were created but never got embeddings

## Technical Details

### Edge Function Changes

**`supabase/functions/generate-embeddings/index.ts`**
- Add 15-second timeout to the LLM keyword extraction fetch call
- On timeout, use `fallbackKeywords()` immediately

**`supabase/functions/process-knowledge/index.ts`**
- Add `sync_all_training_videos` action (no `product_id` required)
- Add `reembed_missing` action to backfill null embeddings
- Reduce embedding batch size to 2
- Add 25-second timeout to embedding generation fetch calls
- Add per-chunk error handling

### New UI Component

**Admin Knowledge Base section** - Add a "Sync Training Videos to AI" button that:
- Calls the edge function with `action: sync_all_training_videos`
- Shows a loading state with toast notifications
- Reports success/failure count

### Files to Create/Modify

| File | Change |
|------|--------|
| `supabase/functions/generate-embeddings/index.ts` | Add timeout to LLM call, faster fallback |
| `supabase/functions/process-knowledge/index.ts` | Add `sync_all_training_videos` and `reembed_missing` actions, fix batch sizes and timeouts |
| `src/components/admin/KnowledgeSyncButton.tsx` | NEW - Admin button to trigger bulk sync |
| Admin page (where knowledge base panel lives) | Add the sync button |


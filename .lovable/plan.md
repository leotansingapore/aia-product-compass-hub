

# RAG Pipeline Refinements and Improvements

## Current State Assessment

The RAG pipeline is functional but has several significant issues that limit its effectiveness:

1. **Fake embeddings**: The `generate-embeddings` function asks an LLM to "pretend" to generate a 768-dimensional vector. These are not real embeddings -- they are random-looking numbers with no actual semantic meaning, making vector search essentially useless.
2. **No automatic sync trigger**: Training videos must be manually synced; there is no trigger when lectures are saved.
3. **No product scoping for documents**: Uploaded knowledge documents have no `product_id` association, so document chunks cannot be filtered per product during retrieval.
4. **Conversation history bloat**: The full message history is sent to the AI every time, with no truncation or summarization.
5. **No embedding quality validation**: Zero vectors are silently accepted as valid embeddings, polluting search results.
6. **No admin visibility**: No UI to see embedding status, chunk counts per product, or trigger reprocessing.

---

## Proposed Improvements

### 1. Use a Real Embedding Model (Critical Fix)

**Problem:** The current approach asks `gemini-2.5-flash-lite` to output 768 numbers. This produces meaningless vectors -- semantic search cannot work.

**Solution:** Use the Lovable AI gateway with a proper embedding-capable model. Since the gateway follows the OpenAI API format, we can use the `/v1/embeddings` endpoint if available, or use a deterministic hashing approach as fallback.

**Recommended approach:** Switch `generate-embeddings` to use the chat model with a **consistent hashing strategy**:
- Instead of asking the model to produce raw numbers, use a two-step approach:
  1. Ask the model to produce a **semantic summary/keywords** for each chunk (deterministic, grounded)
  2. Use a local deterministic hash-based embedding (e.g., random projection with fixed seed from the summary text) to produce consistent 768-dim vectors

Alternatively, check if the Lovable AI gateway supports an `/v1/embeddings` endpoint directly -- this would be the cleanest solution.

**Fallback if no embedding endpoint exists:** Use TF-IDF style keyword extraction via the LLM + a simple bag-of-words vector approach stored in the database. This is less powerful than true embeddings but far better than fake random vectors.

### 2. Associate Knowledge Documents with Products

**Problem:** Uploaded documents go into `knowledge_chunks` with `source_id = document_id` (the document's own UUID), not the product ID. So `match_knowledge_chunks` filtering by `filter_product_id` never finds document chunks.

**Solution:**
- Add a `product_id` column to `knowledge_documents` table
- Update the admin upload UI to require selecting a product when uploading
- When processing documents, set `source_id = product_id` on the chunks (or add a separate `product_id` column to `knowledge_chunks`)
- Update the fallback query in `product-knowledge-chat` to also search by document chunks

**Database change:**
```text
ALTER TABLE knowledge_documents ADD COLUMN product_id text;
ALTER TABLE knowledge_chunks ADD COLUMN product_id text;
```

### 3. Auto-Sync Training Videos on Save

**Problem:** Admins must manually trigger `sync_training_videos`. New lecture content is not automatically indexed.

**Solution:**
- Add a "Sync to AI" button in the training video editor that calls `process-knowledge` with `action: sync_training_videos`
- Alternatively, auto-trigger sync when the product's `training_videos` JSON is updated (call from the save handler in the admin UI)
- Show a toast confirming "Training content synced to AI knowledge base"

### 4. Conversation History Management

**Problem:** All messages are sent on every request with no limit, which will hit token limits for long conversations.

**Solution:**
- Keep only the last 10 messages in the API payload
- For conversations longer than 10 messages, include a summary of earlier messages as the first user message
- This keeps context relevant without overwhelming the token budget

### 5. Embedding Health Dashboard (Admin)

**Problem:** Admins have no way to see if embeddings are working, how many chunks exist per product, or which chunks have zero/null embeddings.

**Solution:** Add a simple admin panel showing:
- Total chunks per product (with/without embeddings)
- A "Re-embed All" button per product
- Last sync timestamp
- Embedding coverage percentage

### 6. Chunk Quality Improvements

**Problem:** Current chunking splits only on double newlines with a fixed 1500-char window. This can split mid-sentence or mid-concept.

**Solution:**
- Add sentence-boundary awareness to the chunker (split on `.` or `\n` near the boundary rather than mid-word)
- Prepend each chunk with contextual metadata: `"Product: Pro Achiever | Source: Lecture 3 - Fund Selection | "` so the embedding captures product context
- Filter out chunks shorter than 50 characters (likely noise)

---

## Technical Details

### Database Migration

```text
1. Add product_id to knowledge_documents:
   ALTER TABLE knowledge_documents ADD COLUMN product_id text;

2. Add product_id to knowledge_chunks:
   ALTER TABLE knowledge_chunks ADD COLUMN product_id text;

3. Create index on product_id:
   CREATE INDEX idx_knowledge_chunks_product_id ON knowledge_chunks(product_id);
```

### Edge Functions to Modify

| Function | Changes |
|----------|---------|
| `generate-embeddings` | Replace fake LLM-generated vectors with a real embedding strategy |
| `process-knowledge` | Set `product_id` on chunks during document processing; improve chunking logic |
| `product-knowledge-chat` | Limit conversation history to last 10 messages; query by `product_id` column |

### New UI Components

| Component | Purpose |
|-----------|---------|
| Product selector on document upload | Associate documents with specific products |
| "Sync to AI" button on lecture editor | Trigger training video ingestion |
| Embedding health panel in admin | Show chunk/embedding stats per product |

### Implementation Order

1. **Fix embeddings** -- without this, semantic search is non-functional (highest priority)
2. **Add product_id to documents/chunks** -- enables per-product document retrieval
3. **Auto-sync on lecture save** -- ensures new content is immediately searchable
4. **Conversation history limits** -- prevents token overflow on long chats
5. **Admin dashboard** -- gives visibility into knowledge base health
6. **Chunk quality improvements** -- incremental quality gains




# Smarter RAG Pipeline for Product Knowledge Chatbot

## Problem
The current chatbot dumps ALL training content into the system prompt on every request. This works for small knowledge bases but will degrade as content grows -- hitting token limits, diluting relevance, and slowing responses.

## Proposed Improvements (in priority order)

---

### 1. Vector Embeddings with Semantic Search

**What:** Generate embeddings for each knowledge chunk and use cosine similarity to retrieve only the most relevant chunks per user query.

**How:**
- Add an `embedding` column (type `vector(768)`) to the `knowledge_chunks` table using Supabase's `pgvector` extension
- Create a new edge function `generate-embeddings` that calls the Lovable AI gateway (or a dedicated embedding model) to generate embeddings when chunks are created/updated
- Modify `process-knowledge` to call `generate-embeddings` after chunking
- Add a Postgres function `match_knowledge_chunks(query_embedding vector, match_count int, product_id text)` that performs cosine similarity search
- Modify `product-knowledge-chat` to:
  1. Embed the user's latest message
  2. Retrieve top 8-10 most relevant chunks (instead of all 20+)
  3. Include only those in the system prompt

**Database changes:**
- Enable `pgvector` extension
- Add column `embedding vector(768)` to `knowledge_chunks`
- Create index `CREATE INDEX ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops)`
- Create RPC function `match_knowledge_chunks`

---

### 2. Smart Context Window Management

**What:** Instead of dumping all transcripts, score and rank content sections by relevance to the current question.

**How:**
- Break training video transcripts into chunks at ingestion time (not at query time)
- Store them in `knowledge_chunks` with `source_type = 'training_video'` and `source_id = product_id`
- At query time, retrieve only the top-K relevant chunks across all sources (documents + transcripts + scripts)
- Add a "context budget" system: allocate ~60% to most relevant chunks, ~20% to product overview, ~20% to conversation history

---

### 3. Auto-Ingest Training Videos into Knowledge Chunks

**What:** When a training video's transcript/notes are saved, automatically chunk and store them in `knowledge_chunks` so they participate in vector search.

**How:**
- Add a new action `sync_training_videos` to the `process-knowledge` edge function
- Trigger it from the admin UI when a lecture is saved (or via a database trigger on `products.training_videos` update)
- Each video section becomes chunks with metadata: `{ source: "training_video", video_title: "...", product_id: "..." }`

---

### 4. Hybrid Search (Keyword + Semantic)

**What:** Combine vector similarity with keyword/BM25 matching for better recall -- semantic search alone can miss exact product names or numerical terms.

**How:**
- Use Supabase's `pgroonga` or `tsvector` for full-text search alongside vector search
- At query time, run both searches in parallel, merge and re-rank results
- Weight exact keyword matches higher for product-specific terminology (e.g., "premium pass", "lock-in period")

---

### 5. Query-Aware Chunk Retrieval with Reranking

**What:** After initial retrieval, use the AI model itself to rerank chunks by relevance before including them in context.

**How:**
- Retrieve top 20 chunks via vector search
- Send them to a fast model (e.g., `gemini-2.5-flash-lite`) with the query asking: "Rank these by relevance to the question, return top 8"
- Include only the reranked top 8 in the final prompt
- This adds one extra API call but dramatically improves context quality

---

## Technical Details

### Updated Architecture Flow

```text
User Question
    |
    v
[Embed Query] --> vector(768)
    |
    v
[Supabase pgvector search] --> top 15 chunks
    |
    v
[Rerank with fast LLM] --> top 8 chunks
    |
    v
[Build System Prompt]
  - Product overview (always included)
  - Top 8 relevant chunks
  - Conversation history
    |
    v
[Gemini 3 Flash] --> Streaming response
```

### Database Migration Required

```text
1. Enable pgvector:        CREATE EXTENSION IF NOT EXISTS vector;
2. Add embedding column:   ALTER TABLE knowledge_chunks ADD COLUMN embedding vector(768);
3. Create IVFFlat index:   CREATE INDEX ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
4. Create match function:  match_knowledge_chunks(query_embedding, match_count, filter_product_id)
```

### Edge Functions to Create/Modify

| Function | Change |
|----------|--------|
| `generate-embeddings` | NEW -- accepts text, returns embedding via Lovable AI gateway |
| `process-knowledge` | MODIFY -- call generate-embeddings after chunking; add sync_training_videos action |
| `product-knowledge-chat` | MODIFY -- embed query, retrieve top-K chunks instead of dumping all content |

### Embedding Model Options

The Lovable AI gateway supports Gemini models which can generate embeddings. Alternatively, use the `text-embedding` endpoint if available, or call Gemini with a structured output request to produce embeddings.

---

## Recommended Implementation Order

1. **Phase 1**: Auto-ingest training videos into `knowledge_chunks` (no new infra needed)
2. **Phase 2**: Add pgvector + embeddings + semantic search (biggest impact)
3. **Phase 3**: Smart context window management (token budget)
4. **Phase 4**: Hybrid search for exact term matching
5. **Phase 5**: Reranking for precision (optional, nice-to-have)

Each phase is independently deployable and improves on the previous one.


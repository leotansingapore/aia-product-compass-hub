
-- Hybrid search: combines vector similarity with keyword matching using Reciprocal Rank Fusion (RRF)
-- This ensures exact product terms like "premium pass" or "lock-in period" always surface,
-- even if the vector embedding doesn't capture them well.

CREATE OR REPLACE FUNCTION public.hybrid_search_knowledge_chunks(
  query_embedding extensions.vector,
  query_text text DEFAULT '',
  match_count integer DEFAULT 10,
  filter_product_id text DEFAULT NULL,
  vector_weight double precision DEFAULT 0.6,
  keyword_weight double precision DEFAULT 0.4,
  rrf_k integer DEFAULT 60
)
RETURNS TABLE(
  id uuid,
  content text,
  source_type text,
  source_id text,
  metadata jsonb,
  similarity double precision,
  keyword_rank double precision,
  combined_score double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sanitized_query text;
BEGIN
  -- Sanitize query for ILIKE usage
  sanitized_query := trim(query_text);

  RETURN QUERY
  WITH
  -- 1. Vector similarity search (top 20 candidates)
  vector_results AS (
    SELECT
      kc.id,
      kc.content,
      kc.source_type,
      kc.source_id,
      kc.metadata,
      1 - (kc.embedding <=> query_embedding) AS sim,
      ROW_NUMBER() OVER (ORDER BY kc.embedding <=> query_embedding) AS vec_rank
    FROM knowledge_chunks kc
    WHERE kc.embedding IS NOT NULL
      AND (filter_product_id IS NULL OR kc.source_id = filter_product_id OR kc.product_id = filter_product_id)
    ORDER BY kc.embedding <=> query_embedding
    LIMIT 20
  ),
  -- 2. Keyword search using ILIKE for exact substring matching
  keyword_results AS (
    SELECT
      kc.id,
      kc.content,
      kc.source_type,
      kc.source_id,
      kc.metadata,
      -- Simple relevance: count how many query words appear in content
      (
        SELECT COUNT(*)::double precision
        FROM unnest(string_to_array(lower(sanitized_query), ' ')) AS word
        WHERE length(word) > 2 AND kc.content ILIKE '%' || word || '%'
      ) / GREATEST(array_length(string_to_array(lower(sanitized_query), ' '), 1), 1)::double precision AS kw_score,
      ROW_NUMBER() OVER (
        ORDER BY (
          SELECT COUNT(*)
          FROM unnest(string_to_array(lower(sanitized_query), ' ')) AS word
          WHERE length(word) > 2 AND kc.content ILIKE '%' || word || '%'
        ) DESC
      ) AS kw_rank
    FROM knowledge_chunks kc
    WHERE sanitized_query <> ''
      AND (filter_product_id IS NULL OR kc.source_id = filter_product_id OR kc.product_id = filter_product_id)
      AND (
        -- At least one query word must match
        EXISTS (
          SELECT 1
          FROM unnest(string_to_array(lower(sanitized_query), ' ')) AS word
          WHERE length(word) > 2 AND kc.content ILIKE '%' || word || '%'
        )
        -- OR the exact phrase matches
        OR kc.content ILIKE '%' || sanitized_query || '%'
      )
    LIMIT 20
  ),
  -- 3. Reciprocal Rank Fusion to merge both result sets
  combined AS (
    SELECT
      COALESCE(v.id, k.id) AS id,
      COALESCE(v.content, k.content) AS content,
      COALESCE(v.source_type, k.source_type) AS source_type,
      COALESCE(v.source_id, k.source_id) AS source_id,
      COALESCE(v.metadata, k.metadata) AS metadata,
      COALESCE(v.sim, 0) AS similarity,
      COALESCE(k.kw_score, 0) AS keyword_rank,
      -- RRF formula: weight * 1/(k + rank) for each signal
      vector_weight * (1.0 / (rrf_k + COALESCE(v.vec_rank, 1000)))
      + keyword_weight * (1.0 / (rrf_k + COALESCE(k.kw_rank, 1000)))
      AS combined_score
    FROM vector_results v
    FULL OUTER JOIN keyword_results k ON v.id = k.id
  )
  SELECT
    c.id, c.content, c.source_type, c.source_id, c.metadata,
    c.similarity, c.keyword_rank, c.combined_score
  FROM combined c
  ORDER BY c.combined_score DESC
  LIMIT match_count;
END;
$$;

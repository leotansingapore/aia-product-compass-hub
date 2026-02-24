
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Add embedding column to knowledge_chunks
ALTER TABLE public.knowledge_chunks ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create index for cosine similarity search (using HNSW which doesn't require training data like IVFFlat)
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding 
ON public.knowledge_chunks 
USING hnsw (embedding vector_cosine_ops);

-- Create match function for semantic search
CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  query_embedding vector(768),
  match_count int DEFAULT 10,
  filter_product_id text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  source_type text,
  source_id text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.content,
    kc.source_type,
    kc.source_id,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM knowledge_chunks kc
  WHERE kc.embedding IS NOT NULL
    AND (filter_product_id IS NULL OR kc.source_id = filter_product_id)
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

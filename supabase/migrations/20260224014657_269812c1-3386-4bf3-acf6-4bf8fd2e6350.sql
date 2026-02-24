
-- Add product_id to knowledge_documents for product association
ALTER TABLE public.knowledge_documents ADD COLUMN IF NOT EXISTS product_id text;

-- Add product_id to knowledge_chunks for direct product filtering
ALTER TABLE public.knowledge_chunks ADD COLUMN IF NOT EXISTS product_id text;

-- Index for fast product_id lookups on chunks
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_product_id ON public.knowledge_chunks(product_id);

-- Index for fast product_id lookups on documents
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_product_id ON public.knowledge_documents(product_id);

-- Update the match_knowledge_chunks function to also filter by product_id column
CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  query_embedding extensions.vector(768),
  match_count integer DEFAULT 10,
  filter_product_id text DEFAULT NULL
)
RETURNS TABLE(id uuid, content text, source_type text, source_id text, metadata jsonb, similarity double precision)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    AND (filter_product_id IS NULL OR kc.source_id = filter_product_id OR kc.product_id = filter_product_id)
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

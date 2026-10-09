-- Product knowledge search works again: both search functions can see pgvector's operators.
--
-- WHY. The vector extension lives in the `extensions` schema, but both functions are pinned to
-- `search_path = public`, so `embedding <=> query_embedding` fails with
-- "operator does not exist: extensions.vector <=> extensions.vector" (reproduced 2026-10-09 on
-- 3,573 embedded chunks). product-knowledge-chat has been falling back to keyword search.
--
-- Only the functions' search_path changes: bodies, grants (20261003010000) and SECURITY settings stay
-- as they are. `public` stays first, so table names resolve exactly as before. Idempotent.

ALTER FUNCTION public.match_knowledge_chunks(vector, integer, text)
  SET search_path = public, extensions;

ALTER FUNCTION public.hybrid_search_knowledge_chunks(vector, text, integer, text, double precision, double precision, integer)
  SET search_path = public, extensions;

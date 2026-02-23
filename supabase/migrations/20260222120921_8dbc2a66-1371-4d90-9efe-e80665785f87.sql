-- Table for uploaded knowledge documents
CREATE TABLE public.knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  chunk_count integer DEFAULT 0,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view knowledge documents" ON public.knowledge_documents
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert knowledge documents" ON public.knowledge_documents
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

CREATE POLICY "Admins can update knowledge documents" ON public.knowledge_documents
  FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

CREATE POLICY "Admins can delete knowledge documents" ON public.knowledge_documents
  FOR DELETE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

-- Table for document chunks with text content for RAG
CREATE TABLE public.knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  source_type text NOT NULL DEFAULT 'document',
  source_id text,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view knowledge chunks" ON public.knowledge_chunks
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage knowledge chunks" ON public.knowledge_chunks
  FOR ALL USING (current_setting('role') = 'service_role')
  WITH CHECK (current_setting('role') = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_knowledge_documents_updated_at
  BEFORE UPDATE ON public.knowledge_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Full-text search index on chunks
CREATE INDEX idx_knowledge_chunks_content_tsvector ON public.knowledge_chunks 
  USING gin (to_tsvector('english', content));

CREATE INDEX idx_knowledge_chunks_source ON public.knowledge_chunks (source_type, source_id);
CREATE INDEX idx_knowledge_chunks_document_id ON public.knowledge_chunks (document_id);
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdmin } from '@/hooks/useAdmin';

export interface KnowledgeDocument {
  id: string;
  title: string;
  file_path: string;
  file_type: string;
  file_size: number;
  status: string;
  chunk_count: number;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useKnowledgeDocuments() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAdmin();

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('knowledge_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
    } else {
      setDocuments((data || []) as KnowledgeDocument[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = async (file: File, title: string) => {
    if (!isAdmin) { toast.error('Admin access required'); return null; }

    const filePath = `${Date.now()}-${file.name}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('knowledge-files')
      .upload(filePath, file);

    if (uploadError) {
      toast.error('Failed to upload file');
      console.error(uploadError);
      return null;
    }

    // Create document record
    const { data: doc, error: docError } = await supabase
      .from('knowledge_documents')
      .insert([{
        title,
        file_path: filePath,
        file_type: file.type || 'application/octet-stream',
        file_size: file.size,
        status: 'pending',
      }])
      .select()
      .single();

    if (docError) {
      toast.error('Failed to create document record');
      console.error(docError);
      return null;
    }

    // Trigger processing
    try {
      await supabase.functions.invoke('process-knowledge', {
        body: { document_id: doc.id, action: 'process_document' },
      });
    } catch (e) {
      console.error('Processing trigger failed:', e);
    }

    toast.success('Document uploaded and processing started');
    fetchDocuments();
    return doc;
  };

  const deleteDocument = async (id: string, filePath: string) => {
    if (!isAdmin) { toast.error('Admin access required'); return false; }

    // Delete from storage
    await supabase.storage.from('knowledge-files').remove([filePath]);

    // Delete record (cascades to chunks)
    const { error } = await supabase.from('knowledge_documents').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete document');
      console.error(error);
      return false;
    }

    toast.success('Document deleted');
    fetchDocuments();
    return true;
  };

  const syncScripts = async () => {
    if (!isAdmin) { toast.error('Admin access required'); return; }
    
    try {
      const { data, error } = await supabase.functions.invoke('process-knowledge', {
        body: { action: 'sync_scripts' },
      });
      if (error) throw error;
      toast.success(`Scripts synced: ${data?.chunks_created || 0} chunks created`);
    } catch (e) {
      console.error('Sync failed:', e);
      toast.error('Failed to sync scripts');
    }
  };

  const reprocessDocument = async (id: string) => {
    if (!isAdmin) { toast.error('Admin access required'); return; }
    
    try {
      await supabase.functions.invoke('process-knowledge', {
        body: { document_id: id, action: 'process_document' },
      });
      toast.success('Reprocessing started');
      setTimeout(fetchDocuments, 2000);
    } catch (e) {
      console.error('Reprocess failed:', e);
      toast.error('Failed to reprocess document');
    }
  };

  return {
    documents,
    loading,
    uploadDocument,
    deleteDocument,
    syncScripts,
    reprocessDocument,
    refetch: fetchDocuments,
    isAdmin,
  };
}

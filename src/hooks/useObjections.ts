import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdmin } from '@/hooks/useAdmin';

export interface ObjectionEntry {
  id: string;
  title: string;
  category: string;
  description: string | null;
  tags: string[];
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ObjectionResponse {
  id: string;
  objection_id: string;
  content: string;
  author_name: string;
  user_id: string;
  upvotes: number;
  created_at: string;
  updated_at: string;
}

export function useObjections() {
  const [entries, setEntries] = useState<ObjectionEntry[]>([]);
  const [responses, setResponses] = useState<ObjectionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [entriesRes, responsesRes] = await Promise.all([
      supabase.from('objection_entries').select('*').order('sort_order').order('created_at'),
      supabase.from('objection_responses').select('*').order('created_at', { ascending: true }),
    ]);

    if (entriesRes.error) {
      console.error('Error fetching objection entries:', entriesRes.error);
    } else {
      setEntries((entriesRes.data || []).map(d => ({
        ...d,
        tags: (d as any).tags || [],
      })));
    }

    if (responsesRes.error) {
      console.error('Error fetching objection responses:', responsesRes.error);
    } else {
      setResponses(responsesRes.data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { entries, responses, loading, refetch: fetchAll };
}

export function useObjectionMutations() {
  const { isAdmin } = useAdmin();

  const createEntry = async (entry: { title: string; category: string; description?: string; tags?: string[]; sort_order?: number }) => {
    if (!isAdmin) { toast.error('Admin access required'); return null; }
    const { data, error } = await supabase
      .from('objection_entries')
      .insert([{
        title: entry.title,
        category: entry.category,
        description: entry.description || null,
        tags: entry.tags || [],
        sort_order: entry.sort_order || 0,
      }])
      .select()
      .single();
    if (error) { toast.error('Failed to create objection'); console.error(error); return null; }
    toast.success('Objection created');
    return data;
  };

  const updateEntry = async (id: string, updates: Partial<ObjectionEntry>) => {
    if (!isAdmin) { toast.error('Admin access required'); return false; }
    const payload: Record<string, unknown> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.sort_order !== undefined) payload.sort_order = updates.sort_order;

    const { error } = await supabase.from('objection_entries').update(payload).eq('id', id);
    if (error) { toast.error('Failed to update'); console.error(error); return false; }
    toast.success('Updated');
    return true;
  };

  const deleteEntry = async (id: string) => {
    if (!isAdmin) { toast.error('Admin access required'); return false; }
    const { error } = await supabase.from('objection_entries').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); console.error(error); return false; }
    toast.success('Deleted');
    return true;
  };

  const addResponse = async (objectionId: string, content: string, authorName: string, userId: string) => {
    const { data, error } = await supabase
      .from('objection_responses')
      .insert([{ objection_id: objectionId, content, author_name: authorName, user_id: userId }])
      .select()
      .single();
    if (error) { toast.error('Failed to add response'); console.error(error); return null; }
    toast.success('Response added');
    return data;
  };

  const updateResponse = async (id: string, content: string) => {
    const { error } = await supabase.from('objection_responses').update({ content }).eq('id', id);
    if (error) { toast.error('Failed to update response'); console.error(error); return false; }
    toast.success('Response updated');
    return true;
  };

  const deleteResponse = async (id: string) => {
    const { error } = await supabase.from('objection_responses').delete().eq('id', id);
    if (error) { toast.error('Failed to delete response'); console.error(error); return false; }
    toast.success('Response deleted');
    return true;
  };

  return { createEntry, updateEntry, deleteEntry, addResponse, updateResponse, deleteResponse, isAdmin };
}

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdmin } from '@/hooks/useAdmin';

export interface ScriptVersion {
  author: string;
  content: string;
  title?: string;
}

export interface ScriptAttachment {
  label: string;
  url: string;
  type?: 'image' | 'pdf' | 'link';
}

export interface ScriptEntry {
  id: string;
  stage: string;
  category: string;
  target_audience: string;
  script_role?: string;
  tags?: string[];
  versions: ScriptVersion[];
  sort_order: number;
  attachments?: ScriptAttachment[];
  related_script_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function useScripts() {
  const [scripts, setScripts] = useState<ScriptEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScripts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching scripts:', error);
      toast.error('Failed to load scripts');
    } else {
      setScripts((data || []).map(d => ({
        ...d,
        target_audience: (d.target_audience as string) || 'general',
        script_role: (d as any).script_role || 'consultant',
        tags: (d as any).tags || [],
        // jsonb can come back as an object (or null) if a row was written by
        // hand — `|| []` wouldn't catch that and every .map/.some downstream
        // would throw while typing in the search box.
        versions: Array.isArray(d.versions) ? (d.versions as unknown as ScriptVersion[]) : [],
        attachments: Array.isArray((d as any).attachments) ? ((d as any).attachments as ScriptAttachment[]) : [],
        related_script_id: (d as any).related_script_id || null,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  return { scripts, loading, refetch: fetchScripts };
}

/**
 * Script writes REJECT on failure (after toasting) instead of returning a
 * falsy value. Callers used to ignore the return value and close their dialog
 * / fire a success toast even when the row never changed — the user lost the
 * edit and never knew. Every caller must await inside try/catch.
 */
export function useScriptsMutations() {
  const { isAdmin } = useAdmin();

  const createScript = async (script: Omit<ScriptEntry, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('scripts')
      .insert([{
        stage: script.stage,
        category: script.category,
        target_audience: script.target_audience,
        script_role: (script as any).script_role || 'consultant',
        tags: script.tags || [],
        versions: JSON.parse(JSON.stringify(script.versions)),
        sort_order: script.sort_order,
        related_script_id: script.related_script_id || null,
        // `attachments` is a live jsonb column; types.ts may not list it yet.
        ...(script.attachments !== undefined
          ? { attachments: JSON.parse(JSON.stringify(script.attachments)) }
          : {}),
      } as any])
      .select()
      .single();
    if (error) { toast.error('Failed to create script'); console.error(error); throw error; }
    toast.success('Script created');
    return data;
  };

  const updateScript = async (id: string, updates: Partial<Omit<ScriptEntry, 'id' | 'created_at' | 'updated_at'>>) => {
    const payload: Record<string, unknown> = {};
    if (updates.stage !== undefined) payload.stage = updates.stage;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.target_audience !== undefined) payload.target_audience = updates.target_audience;
    if (updates.script_role !== undefined) payload.script_role = updates.script_role;
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.versions !== undefined) payload.versions = JSON.parse(JSON.stringify(updates.versions));
    if (updates.sort_order !== undefined) payload.sort_order = updates.sort_order;
    if (updates.related_script_id !== undefined) payload.related_script_id = updates.related_script_id || null;
    // Only sent when the caller supplied it, so metadata-only saves (inline
    // title/tag edits, merges) never wipe an existing attachment list.
    if (updates.attachments !== undefined) payload.attachments = JSON.parse(JSON.stringify(updates.attachments));

    const { error } = await supabase.from('scripts').update(payload).eq('id', id);
    if (error) { toast.error('Failed to update script'); console.error(error); throw error; }
    toast.success('Script updated');
    return true;
  };

  const deleteScript = async (id: string) => {
    if (!isAdmin) { toast.error('Admin access required'); throw new Error('Admin access required'); }
    const { error } = await supabase.from('scripts').delete().eq('id', id);
    if (error) { toast.error('Failed to delete script'); console.error(error); throw error; }
    toast.success('Script deleted');
    return true;
  };

  return { createScript, updateScript, deleteScript, isAdmin };
}

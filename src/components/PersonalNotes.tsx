import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Check, Loader2, NotebookPen } from 'lucide-react';

interface PersonalNotesProps {
  productId: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved';

export function PersonalNotes({ productId }: PersonalNotesProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [noteId, setNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestContentRef = useRef(content);

  // Keep ref in sync
  useEffect(() => { latestContentRef.current = content; }, [content]);

  // Load existing note
  useEffect(() => {
    if (!user || !productId) { setLoading(false); return; }

    async function load() {
      try {
        const { data } = await supabase
          .from('user_notes')
          .select('*')
          .eq('user_id', user!.id)
          .eq('product_id', productId)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (data) {
          setNoteId(data.id);
          setContent(data.content || '');
        }
      } catch (e) {
        console.error('Failed to load note', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, productId]);

  const persistNote = useCallback(async (text: string) => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      if (noteId) {
        await supabase
          .from('user_notes')
          .update({ content: text })
          .eq('id', noteId);
      } else {
        const { data } = await supabase
          .from('user_notes')
          .insert({ user_id: user.id, product_id: productId, content: text, order: 0 })
          .select()
          .single();
        if (data) setNoteId(data.id);
      }
      setSaveStatus('saved');
      // Reset to idle after 2s
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error('Failed to save note', e);
      setSaveStatus('idle');
    }
  }, [user, noteId, productId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    setSaveStatus('saving');

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      persistNote(latestContentRef.current);
    }, 800);
  };

  // Save on unmount if pending
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        persistNote(latestContentRef.current);
      }
    };
  }, [persistNote]);

  if (!user) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Sign in to take personal notes on this product.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">My Notes</span>
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1 h-5 transition-all">
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving…
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <Check className="h-3 w-3 text-primary" />
              Saved
            </>
          )}
          {saveStatus === 'idle' && content && (
            <span className="opacity-50">Auto-saves as you type</span>
          )}
        </span>
      </div>

      {/* The note pad */}
      {loading ? (
        <div className="h-48 rounded-lg border bg-muted/30 animate-pulse" />
      ) : (
        <textarea
          className="w-full min-h-[240px] resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-colors font-[inherit]"
          placeholder={"Start typing your notes here…\n\nCapture key points, questions, or anything you want to remember about this product. Changes save automatically."}
          value={content}
          onChange={handleChange}
          spellCheck
        />
      )}
    </div>
  );
}

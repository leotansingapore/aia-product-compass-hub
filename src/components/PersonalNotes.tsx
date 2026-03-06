import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Check, Loader2, NotebookPen, Paperclip, X, FileText } from 'lucide-react';
import { MinimalRichEditor } from './MinimalRichEditor';
import { toast } from 'sonner';

interface PersonalNotesProps {
  productId: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved';

interface Attachment {
  name: string;
  url: string;
  type: 'pdf' | 'file';
}

export function PersonalNotes({ productId }: PersonalNotesProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [noteId, setNoteId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestContentRef = useRef(content);
  const latestAttachmentsRef = useRef(attachments);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { latestContentRef.current = content; }, [content]);
  useEffect(() => { latestAttachmentsRef.current = attachments; }, [attachments]);

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
          // Attachments stored in content as JSON comment at the end
          try {
            const match = data.content?.match(/<!--attachments:(.+?)-->/s);
            if (match) setAttachments(JSON.parse(match[1]));
          } catch {}
        }
      } catch (e) {
        console.error('Failed to load note', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, productId]);

  const buildStoredContent = useCallback((md: string, atts: Attachment[]) => {
    // Strip any previous attachment metadata
    const clean = md.replace(/\n?<!--attachments:.+?-->/s, '');
    if (atts.length === 0) return clean;
    return clean + `\n<!--attachments:${JSON.stringify(atts)}-->`;
  }, []);

  const persistNote = useCallback(async (md: string, atts: Attachment[]) => {
    if (!user) return;
    const stored = buildStoredContent(md, atts);
    setSaveStatus('saving');
    try {
      if (noteId) {
        await supabase.from('user_notes').update({ content: stored }).eq('id', noteId);
      } else {
        const { data } = await supabase
          .from('user_notes')
          .insert({ user_id: user.id, product_id: productId, content: stored, order: 0 })
          .select()
          .single();
        if (data) setNoteId(data.id);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error('Failed to save note', e);
      setSaveStatus('idle');
    }
  }, [user, noteId, productId, buildStoredContent]);

  const scheduleAutoSave = useCallback((md?: string, atts?: Attachment[]) => {
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      persistNote(
        md ?? latestContentRef.current,
        atts ?? latestAttachmentsRef.current
      );
    }, 800);
  }, [persistNote]);

  const handleContentChange = useCallback((md: string) => {
    setContent(md);
    scheduleAutoSave(md);
  }, [scheduleAutoSave]);

  // Save on unmount
  useEffect(() => () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      persistNote(latestContentRef.current, latestAttachmentsRef.current);
    }
  }, [persistNote]);

  const handleFileAttach = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File must be under 20 MB');
      return;
    }
    setIsUploadingFile(true);
    try {
      const ext = file.name.split('.').pop() || 'bin';
      const path = `note-attachments/${user!.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('knowledge-files').upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('knowledge-files').getPublicUrl(path);
      const att: Attachment = {
        name: file.name,
        url: data.publicUrl,
        type: file.type === 'application/pdf' ? 'pdf' : 'file',
      };
      const next = [...latestAttachmentsRef.current, att];
      setAttachments(next);
      scheduleAutoSave(undefined, next);
      toast.success(`"${file.name}" attached`);
    } catch (e) {
      toast.error('Failed to upload file');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const removeAttachment = (idx: number) => {
    const next = attachments.filter((_, i) => i !== idx);
    setAttachments(next);
    scheduleAutoSave(undefined, next);
  };

  if (!user) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Sign in to take personal notes on this product.
      </div>
    );
  }

  // Strip hidden attachment metadata before passing to editor
  const editorContent = content.replace(/\n?<!--attachments:.+?-->/s, '');

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">My Notes</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Attach file button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingFile}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Attach PDF or file"
          >
            {isUploadingFile
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Paperclip className="h-3.5 w-3.5" />
            }
            <span className="hidden sm:inline">Attach</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFileAttach(file);
              e.target.value = '';
            }}
          />

          {/* Save status */}
          <span className="text-xs text-muted-foreground flex items-center gap-1 h-5 transition-all min-w-[80px] justify-end">
            {saveStatus === 'saving' && (
              <><Loader2 className="h-3 w-3 animate-spin" />Saving…</>
            )}
            {saveStatus === 'saved' && (
              <><Check className="h-3 w-3 text-primary" />Saved</>
            )}
            {saveStatus === 'idle' && content && (
              <span className="opacity-40">Auto-saved</span>
            )}
          </span>
        </div>
      </div>

      {/* Editor */}
      {loading ? (
        <div className="h-48 rounded-lg border bg-muted/30 animate-pulse" />
      ) : (
        <div className="rounded-lg border border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden">
          <MinimalRichEditor
            value={editorContent}
            onChange={handleContentChange}
            placeholder={"Start typing your notes…\n\nUse the toolbar above for bold, headings, links, and images. Paste images directly or drag them in."}
            autoFocus={false}
            showToolbar={true}
          />
        </div>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-muted/40 text-xs group hover:border-primary/40 transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary max-w-[160px] truncate"
              >
                {att.name}
              </a>
              <button
                onClick={() => removeAttachment(idx)}
                className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                title="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

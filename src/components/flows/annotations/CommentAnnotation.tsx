import { useState, useRef } from 'react';
import { MessageSquare, X, Send, CheckCircle, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { FlowAnnotation } from '@/hooks/useFlowAnnotations';

interface Props {
  annotation: FlowAnnotation;
  replies: FlowAnnotation[];
  onUpdate: (updates: Partial<FlowAnnotation> & { id: string }) => void;
  onDelete: (id: string) => void;
  onReply: (parentId: string, content: string) => void;
  zoom: number;
  canEdit: boolean;
  panX: number;
  panY: number;
  currentUserId: string | undefined;
}

export function CommentAnnotation({ annotation, replies, onUpdate, onDelete, onReply, zoom, canEdit, panX, panY, currentUserId }: Props) {
  const [open, setOpen] = useState(true);
  const [replyText, setReplyText] = useState('');
  const dragStart = useRef<{ mx: number; my: number; x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const screenX = annotation.x * zoom + panX;
  const screenY = annotation.y * zoom + panY;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canEdit) return;
    if ((e.target as HTMLElement).closest('textarea, button, input')) return;
    e.stopPropagation();
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, x: annotation.x, y: annotation.y };

    const onMove = (ev: MouseEvent) => {
      if (!dragStart.current) return;
      const dx = (ev.clientX - dragStart.current.mx) / zoom;
      const dy = (ev.clientY - dragStart.current.my) / zoom;
      onUpdate({ id: annotation.id, x: dragStart.current.x + dx, y: dragStart.current.y + dy });
    };
    const onUp = () => {
      setDragging(false);
      dragStart.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const submitReply = () => {
    if (!replyText.trim()) return;
    onReply(annotation.id, replyText.trim());
    setReplyText('');
  };

  return (
    <div
      className={cn(
        'absolute select-none',
        dragging && 'cursor-grabbing',
        !dragging && canEdit && 'cursor-grab',
      )}
      style={{ left: screenX, top: screenY, zIndex: 25, width: 220 * zoom }}
      onMouseDown={handleMouseDown}
    >
      {/* Bubble icon */}
      <div
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-t-lg text-white font-semibold text-xs shadow cursor-pointer"
        style={{ backgroundColor: annotation.color, borderRadius: open ? '8px 8px 0 0' : 8 }}
        onClick={() => setOpen(!open)}
      >
        <MessageSquare className="h-3.5 w-3.5" />
        <span className="truncate flex-1">{annotation.author_name}</span>
        {annotation.resolved
          ? <CheckCircle className="h-3 w-3 opacity-80" />
          : <Circle className="h-3 w-3 opacity-50" />
        }
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {canEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(annotation.id); }}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {open && (
        <div className="bg-background border border-t-0 rounded-b-lg shadow-lg overflow-hidden" style={{ borderColor: annotation.color + '66' }}>
          {/* Root comment */}
          <div className="px-2.5 py-2 text-xs text-foreground/80 leading-snug border-b border-border/40">
            {annotation.content || <em className="opacity-40">No content</em>}
          </div>

          {/* Replies */}
          {replies.length > 0 && (
            <div className="max-h-32 overflow-y-auto divide-y divide-border/30">
              {replies.map(r => (
                <div key={r.id} className="px-2.5 py-1.5 flex gap-1.5">
                  <div
                    className="w-1 rounded-full shrink-0 self-stretch"
                    style={{ backgroundColor: annotation.color }}
                  />
                  <div>
                    <span className="text-[10px] font-semibold text-muted-foreground">{r.author_name}</span>
                    <p className="text-xs leading-snug text-foreground/75">{r.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply input */}
          <div className="flex items-center gap-1.5 px-2 py-1.5 border-t border-border/40">
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onMouseDown={e => e.stopPropagation()}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitReply(); } }}
              rows={1}
              placeholder="Reply…"
              className="flex-1 text-xs resize-none bg-transparent border-none outline-none text-foreground/80 placeholder:text-muted-foreground/50"
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 shrink-0"
              onClick={submitReply}
              disabled={!replyText.trim()}
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>

          {/* Resolve */}
          {canEdit && (
            <div className="px-2.5 pb-1.5">
              <button
                onClick={() => onUpdate({ id: annotation.id, resolved: !annotation.resolved })}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                {annotation.resolved ? <Circle className="h-2.5 w-2.5" /> : <CheckCircle className="h-2.5 w-2.5" />}
                {annotation.resolved ? 'Reopen' : 'Resolve'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

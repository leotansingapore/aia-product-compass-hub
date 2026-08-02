import { useState, useRef, useEffect } from 'react';
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
  const dragStart = useRef<{ pointerId: number; mx: number; my: number; x: number; y: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const justDragged = useRef(false);
  // Local position while dragging — persist once on mouseup instead of one
  // Supabase UPDATE per mousemove.
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => { setDragPos(null); }, [annotation.x, annotation.y]);

  const screenX = (dragPos?.x ?? annotation.x) * zoom + panX;
  const screenY = (dragPos?.y ?? annotation.y) * zoom + panY;

  // Pointer events cover mouse, touch and stylus in one path; pointer capture
  // keeps move/up coming to this element even when the finger leaves it.
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canEdit) return;
    if ((e.target as HTMLElement).closest('textarea, button, input, a')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (!e.isPrimary || dragStart.current) return;
    e.stopPropagation();
    setDragging(true);
    dragStart.current = { pointerId: e.pointerId, mx: e.clientX, my: e.clientY, x: annotation.x, y: annotation.y, moved: false };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* capture unsupported */ }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    if (!start || start.pointerId !== e.pointerId) return;
    if (Math.abs(e.clientX - start.mx) > 3 || Math.abs(e.clientY - start.my) > 3) start.moved = true;
    setDragPos({ x: start.x + (e.clientX - start.mx) / zoom, y: start.y + (e.clientY - start.my) / zoom });
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>, commit: boolean) => {
    const start = dragStart.current;
    if (!start || start.pointerId !== e.pointerId) return;
    dragStart.current = null;
    setDragging(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    const dx = (e.clientX - start.mx) / zoom;
    const dy = (e.clientY - start.my) / zoom;
    // Persist once, on release — never one write per move
    if (commit && (start.moved || (e.pointerType === 'mouse' && (dx !== 0 || dy !== 0)))) {
      if (start.moved) justDragged.current = true;
      onUpdate({ id: annotation.id, x: start.x + dx, y: start.y + dy });
      return;
    }
    setDragPos(null);
  };

  // Dragging by the header must not also collapse the thread
  const toggleOpen = () => {
    if (justDragged.current) {
      justDragged.current = false;
      return;
    }
    setOpen(o => !o);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(annotation.id);
      return;
    }
    setConfirmDelete(true);
    setTimeout(() => setConfirmDelete(false), 3000);
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
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={e => endDrag(e, true)}
      onPointerCancel={e => endDrag(e, false)}
    >
      {/* Bubble icon — also the drag handle, so it owns the touch gesture */}
      <div
        className={cn(
          'flex items-center gap-1.5 px-2 py-1.5 rounded-t-lg text-white font-semibold text-xs shadow cursor-pointer',
          canEdit && 'touch-none'
        )}
        style={{ backgroundColor: annotation.color, borderRadius: open ? '8px 8px 0 0' : 8 }}
        onClick={toggleOpen}
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
            onClick={handleDeleteClick}
            className={cn(
              'transition-all rounded',
              confirmDelete ? 'bg-destructive p-0.5' : 'hover:opacity-70'
            )}
            title={confirmDelete ? 'Click again to confirm delete (removes replies too)' : 'Delete comment'}
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
              onPointerDown={e => e.stopPropagation()}
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

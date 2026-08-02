import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlowAnnotation } from '@/hooks/useFlowAnnotations';

interface Props {
  annotation: FlowAnnotation;
  onUpdate: (updates: Partial<FlowAnnotation> & { id: string }) => void;
  onDelete: (id: string) => void;
  zoom: number;
  canEdit: boolean;
  panX: number;
  panY: number;
}

export function TextLabelAnnotation({ annotation, onUpdate, onDelete, zoom, canEdit, panX, panY }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(annotation.content || '');
  const dragStart = useRef<{ pointerId: number; mx: number; my: number; x: number; y: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Local position while dragging — persist once on mouseup instead of one
  // Supabase UPDATE per mousemove.
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const cancelled = useRef(false);

  useEffect(() => { setDragPos(null); }, [annotation.x, annotation.y]);

  const screenX = (dragPos?.x ?? annotation.x) * zoom + panX;
  const screenY = (dragPos?.y ?? annotation.y) * zoom + panY;

  // Pointer events cover mouse, touch and stylus in one path; pointer capture
  // keeps move/up coming to this element even when the finger leaves it.
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canEdit || editing) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (!e.isPrimary || dragStart.current) return;
    // Never capture the pointer when a control was hit — that would swallow its click
    if ((e.target as HTMLElement).closest('button, textarea, input, a')) return;
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
    if (!commit) {
      setDragPos(null);
      return;
    }
    const dx = (e.clientX - start.mx) / zoom;
    const dy = (e.clientY - start.my) / zoom;
    // Persist once, on release — never one write per move
    if (start.moved || (e.pointerType === 'mouse' && (dx !== 0 || dy !== 0))) {
      onUpdate({ id: annotation.id, x: start.x + dx, y: start.y + dy });
      return;
    }
    setDragPos(null);
    // A tap that never moved is the touch equivalent of double-click-to-edit
    if (e.pointerType !== 'mouse' && canEdit) setEditing(true);
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

  const saveEdit = () => {
    onUpdate({ id: annotation.id, content: draft });
    setEditing(false);
    rootRef.current?.focus();
  };

  const cancelEdit = () => {
    // Blur-to-save must not fire after an explicit cancel
    cancelled.current = true;
    setDraft(annotation.content || '');
    setEditing(false);
    rootRef.current?.focus();
  };

  const handleBlur = () => {
    if (cancelled.current) {
      cancelled.current = false;
      return;
    }
    saveEdit();
  };

  // Keyboard equivalent of double-click / tap to edit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (editing) return;
    if (e.key === 'Enter' || e.key === ' ') {
      if (!canEdit) return;
      e.preventDefault();
      e.stopPropagation();
      setEditing(true);
    }
  };

  const label = `Text label by ${annotation.author_name}: ${annotation.content || 'empty'}${canEdit ? '. Press Enter to edit.' : ''}`;

  return (
    <div
      ref={rootRef}
      role={canEdit && !editing ? 'button' : undefined}
      tabIndex={canEdit && !editing ? 0 : undefined}
      aria-label={canEdit && !editing ? label : undefined}
      className={cn(
        'absolute group rounded',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        dragging && 'cursor-grabbing',
        !dragging && canEdit && 'cursor-grab',
        // Stop the browser scrolling/zooming the canvas instead of dragging the label
        canEdit && !editing && 'touch-none',
      )}
      style={{ left: screenX, top: screenY, zIndex: 25 }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={e => endDrag(e, true)}
      onPointerCancel={e => endDrag(e, false)}
      onKeyDown={handleKeyDown}
      onDoubleClick={() => canEdit && setEditing(true)}
    >
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={e => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') { e.stopPropagation(); cancelEdit(); }
          }}
          aria-label={`Label text, by ${annotation.author_name}. Press Enter to save, Escape to cancel.`}
          onPointerDown={e => e.stopPropagation()}
          className="bg-background/90 border border-primary rounded px-1.5 py-0.5 text-sm font-semibold outline-none shadow"
          style={{ color: annotation.color, minWidth: 80 }}
          placeholder="Label text…"
        />
      ) : (
        <div className="relative flex items-center gap-1">
          <span
            className="font-bold drop-shadow-sm select-none"
            style={{ color: annotation.color, fontSize: `${Math.max(12, 14 * zoom)}px` }}
          >
            {annotation.content || <em className="opacity-40 text-foreground font-normal text-xs">Label…</em>}
          </span>
          {canEdit && (
            <button
              type="button"
              className={cn(
                'transition-all p-0.5 rounded-full border shadow relative',
                // Invisible padded hit area — the icon stays 10px, the target is ~32px
                "after:absolute after:content-[''] after:-inset-[10px]",
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive',
                confirmDelete
                  ? 'opacity-100 bg-destructive border-destructive'
                  // Keyboard focus reveals it like hover does; touch has no hover, so
                  // coarse pointers get it permanently or deleting would be impossible
                  : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 [@media(pointer:coarse)]:opacity-100 bg-background/80'
              )}
              onClick={handleDeleteClick}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
              aria-label={confirmDelete ? 'Press again to confirm deleting this label' : `Delete label by ${annotation.author_name}`}
              title={confirmDelete ? 'Click again to confirm delete' : 'Delete label'}
            >
              <X className={cn('h-2.5 w-2.5', confirmDelete ? 'text-white' : 'text-muted-foreground')} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

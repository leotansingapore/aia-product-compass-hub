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
  };

  return (
    <div
      className={cn(
        'absolute group',
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
      onDoubleClick={() => canEdit && setEditing(true)}
    >
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={e => e.key === 'Enter' && saveEdit()}
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
              className={cn(
                'transition-all p-0.5 rounded-full border shadow',
                confirmDelete
                  ? 'opacity-100 bg-destructive border-destructive'
                  : 'opacity-0 group-hover:opacity-100 bg-background/80'
              )}
              onClick={handleDeleteClick}
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

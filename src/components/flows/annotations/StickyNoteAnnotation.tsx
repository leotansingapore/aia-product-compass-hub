import { useState, useRef, useEffect } from 'react';
import { X, GripHorizontal, Check } from 'lucide-react';
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

export function StickyNoteAnnotation({ annotation, onUpdate, onDelete, zoom, canEdit, panX, panY }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(annotation.content || '');
  const [dragging, setDragging] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Local position while dragging — persisting on every mousemove fired one
  // Supabase UPDATE per pixel and rubber-banded against the refetch.
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const dragStart = useRef<{ pointerId: number; mx: number; my: number; x: number; y: number; moved: boolean } | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Once the persisted position catches up, drop the local override
  useEffect(() => { setDragPos(null); }, [annotation.x, annotation.y]);

  // Convert flow coords to screen coords
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
    const dx = (e.clientX - start.mx) / zoom;
    const dy = (e.clientY - start.my) / zoom;
    if (Math.abs(e.clientX - start.mx) > 3 || Math.abs(e.clientY - start.my) > 3) start.moved = true;
    setDragPos({ x: start.x + dx, y: start.y + dy });
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
        'absolute select-none rounded-lg shadow-md border border-black/10',
        dragging && 'cursor-grabbing opacity-80',
        !dragging && canEdit && 'cursor-grab',
        !canEdit && 'cursor-default',
        // Stop the browser scrolling/zooming the canvas instead of dragging the note
        canEdit && !editing && 'touch-none'
      )}
      style={{
        left: screenX,
        top: screenY,
        width: annotation.width * zoom,
        minHeight: annotation.height * zoom,
        backgroundColor: annotation.color,
        zIndex: 25,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={e => endDrag(e, true)}
      onPointerCancel={e => endDrag(e, false)}
      onDoubleClick={() => canEdit && setEditing(true)}
    >
      {/* Header strip */}
      <div
        className="flex items-center justify-between px-2 py-1 rounded-t-lg opacity-60"
        style={{ backgroundColor: annotation.color + 'cc' }}
      >
        <GripHorizontal className="h-3 w-3 text-black/50" />
        <span className="text-[9px] font-medium text-black/50">{annotation.author_name}</span>
        {canEdit && (
          <button
            className={cn(
              'transition-all rounded',
              confirmDelete ? 'bg-destructive p-0.5' : 'hover:opacity-80'
            )}
            onClick={handleDeleteClick}
            title={confirmDelete ? 'Click again to confirm delete' : 'Delete note'}
          >
            <X className={cn('h-3 w-3', confirmDelete ? 'text-white' : 'text-black/50')} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        {editing ? (
          <div className="flex flex-col gap-1">
            <textarea
              ref={textRef}
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onPointerDown={e => e.stopPropagation()}
              className="w-full bg-transparent border-none outline-none resize-none text-black/80 text-xs leading-snug"
              style={{ minHeight: 60 * zoom }}
              rows={4}
              placeholder="Write a note..."
            />
            <button
              onClick={saveEdit}
              className="self-end p-1 rounded hover:bg-black/10 transition-colors"
            >
              <Check className="h-3 w-3 text-black/60" />
            </button>
          </div>
        ) : (
          <p className="text-black/75 text-xs leading-snug whitespace-pre-wrap break-words">
            {annotation.content || <em className="opacity-40">Double-click to edit…</em>}
          </p>
        )}
      </div>
    </div>
  );
}

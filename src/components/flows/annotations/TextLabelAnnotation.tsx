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
  const dragStart = useRef<{ mx: number; my: number; x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Local position while dragging — persist once on mouseup instead of one
  // Supabase UPDATE per mousemove.
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => { setDragPos(null); }, [annotation.x, annotation.y]);

  const screenX = (dragPos?.x ?? annotation.x) * zoom + panX;
  const screenY = (dragPos?.y ?? annotation.y) * zoom + panY;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canEdit || editing) return;
    e.stopPropagation();
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, x: annotation.x, y: annotation.y };

    const onMove = (ev: MouseEvent) => {
      if (!dragStart.current) return;
      const dx = (ev.clientX - dragStart.current.mx) / zoom;
      const dy = (ev.clientY - dragStart.current.my) / zoom;
      setDragPos({ x: dragStart.current.x + dx, y: dragStart.current.y + dy });
    };
    const onUp = (ev: MouseEvent) => {
      setDragging(false);
      if (dragStart.current) {
        const dx = (ev.clientX - dragStart.current.mx) / zoom;
        const dy = (ev.clientY - dragStart.current.my) / zoom;
        if (dx !== 0 || dy !== 0) {
          onUpdate({ id: annotation.id, x: dragStart.current.x + dx, y: dragStart.current.y + dy });
        }
      }
      dragStart.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
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
      )}
      style={{ left: screenX, top: screenY, zIndex: 25 }}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => canEdit && setEditing(true)}
    >
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={e => e.key === 'Enter' && saveEdit()}
          onMouseDown={e => e.stopPropagation()}
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

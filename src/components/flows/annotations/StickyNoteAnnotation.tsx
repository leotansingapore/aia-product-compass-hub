import { useState, useRef } from 'react';
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
  const dragStart = useRef<{ mx: number; my: number; x: number; y: number } | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Convert flow coords to screen coords
  const screenX = annotation.x * zoom + panX;
  const screenY = annotation.y * zoom + panY;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canEdit || editing) return;
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
        !canEdit && 'cursor-default'
      )}
      style={{
        left: screenX,
        top: screenY,
        width: annotation.width * zoom,
        minHeight: annotation.height * zoom,
        backgroundColor: annotation.color,
        zIndex: 25,
      }}
      onMouseDown={handleMouseDown}
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
            className="hover:opacity-80 transition-opacity"
            onClick={(e) => { e.stopPropagation(); onDelete(annotation.id); }}
          >
            <X className="h-3 w-3 text-black/50" />
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
              onMouseDown={e => e.stopPropagation()}
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

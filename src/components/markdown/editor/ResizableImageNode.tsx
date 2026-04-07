import { Node, mergeAttributes } from '@tiptap/react';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  AlignLeft, AlignCenter, AlignRight, Crop, Trash2, 
  GripVertical, RotateCcw 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── TipTap Node ──────────────────────────────────────────────
export const ResizableImageNode = Node.create({
  name: 'resizableImage',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: '' },
      width: { default: null },
      alignment: { default: 'center' },
      // crop stored as percentages (0-100)
      cropX: { default: 0 },
      cropY: { default: 0 },
      cropW: { default: 100 },
      cropH: { default: 100 },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (el) => {
          const dom = el as HTMLElement;
          return {
            src: dom.getAttribute('src'),
            alt: dom.getAttribute('alt') || '',
            width: dom.getAttribute('data-width') ? Number(dom.getAttribute('data-width')) : null,
            alignment: dom.getAttribute('data-alignment') || 'center',
            cropX: Number(dom.getAttribute('data-crop-x') || 0),
            cropY: Number(dom.getAttribute('data-crop-y') || 0),
            cropW: Number(dom.getAttribute('data-crop-w') || 100),
            cropH: Number(dom.getAttribute('data-crop-h') || 100),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(HTMLAttributes, {
        'data-width': HTMLAttributes.width,
        'data-alignment': HTMLAttributes.alignment,
        'data-crop-x': HTMLAttributes.cropX,
        'data-crop-y': HTMLAttributes.cropY,
        'data-crop-w': HTMLAttributes.cropW,
        'data-crop-h': HTMLAttributes.cropH,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

// ── Crop Modal ───────────────────────────────────────────────
function CropOverlay({
  src,
  initialCrop,
  onApply,
  onCancel,
}: {
  src: string;
  initialCrop: { x: number; y: number; w: number; h: number };
  onApply: (crop: { x: number; y: number; w: number; h: number }) => void;
  onCancel: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState(initialCrop);
  const [dragging, setDragging] = useState<string | null>(null);
  const startRef = useRef({ mx: 0, my: 0, crop: initialCrop });

  const handlePointerDown = (handle: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(handle);
    startRef.current = { mx: e.clientX, my: e.clientY, crop: { ...crop } };
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dx = ((e.clientX - startRef.current.mx) / rect.width) * 100;
      const dy = ((e.clientY - startRef.current.my) / rect.height) * 100;
      const s = startRef.current.crop;

      let nx = s.x, ny = s.y, nw = s.w, nh = s.h;

      if (dragging === 'move') {
        nx = Math.max(0, Math.min(100 - s.w, s.x + dx));
        ny = Math.max(0, Math.min(100 - s.h, s.y + dy));
        nw = s.w; nh = s.h;
      } else {
        if (dragging.includes('w')) { nx = Math.max(0, Math.min(s.x + s.w - 10, s.x + dx)); nw = s.w - (nx - s.x); }
        if (dragging.includes('e')) { nw = Math.max(10, Math.min(100 - s.x, s.w + dx)); }
        if (dragging.includes('n')) { ny = Math.max(0, Math.min(s.y + s.h - 10, s.y + dy)); nh = s.h - (ny - s.y); }
        if (dragging.includes('s')) { nh = Math.max(10, Math.min(100 - s.y, s.h + dy)); }
      }

      setCrop({ x: nx, y: ny, w: nw, h: nh });
    };
    const onUp = () => setDragging(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, [dragging]);

  const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'];
  const handlePos: Record<string, React.CSSProperties> = {
    nw: { top: 0, left: 0, cursor: 'nw-resize' },
    ne: { top: 0, right: 0, cursor: 'ne-resize' },
    sw: { bottom: 0, left: 0, cursor: 'sw-resize' },
    se: { bottom: 0, right: 0, cursor: 'se-resize' },
    n: { top: 0, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
    s: { bottom: 0, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
    w: { top: '50%', left: 0, transform: 'translateY(-50%)', cursor: 'w-resize' },
    e: { top: '50%', right: 0, transform: 'translateY(-50%)', cursor: 'e-resize' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-card rounded-xl p-4 shadow-2xl max-w-[90vw] max-h-[90vh] space-y-3" onClick={e => e.stopPropagation()}>
        <p className="text-sm font-medium text-foreground">Crop Image</p>
        <div ref={containerRef} className="relative inline-block max-w-[70vw] max-h-[60vh]">
          <img src={src} alt="" className="block max-w-full max-h-[60vh] opacity-40 select-none pointer-events-none" draggable={false} />
          {/* Visible crop region */}
          <div
            className="absolute border-2 border-primary bg-transparent cursor-move"
            style={{ left: `${crop.x}%`, top: `${crop.y}%`, width: `${crop.w}%`, height: `${crop.h}%` }}
            onPointerDown={e => handlePointerDown('move', e)}
          >
            {/* Bright image inside crop */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={src}
                alt=""
                className="select-none pointer-events-none"
                draggable={false}
                style={{
                  position: 'absolute',
                  left: `${-(crop.x / crop.w) * 100}%`,
                  top: `${-(crop.y / crop.h) * 100}%`,
                  width: `${100 / crop.w * 100}%`,
                  height: `${100 / crop.h * 100}%`,
                }}
              />
            </div>
            {handles.map(h => (
              <div
                key={h}
                className="absolute w-3 h-3 bg-primary border border-primary-foreground rounded-sm z-10"
                style={{ ...handlePos[h], margin: '-6px' }}
                onPointerDown={e => handlePointerDown(h, e)}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 text-xs rounded-md border border-border hover:bg-muted transition-colors">Cancel</button>
          <button onClick={() => onApply(crop)} className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Apply Crop</button>
        </div>
      </div>
    </div>
  );
}

// ── React NodeView ───────────────────────────────────────────
function ResizableImageComponent({ node, updateAttributes, deleteNode, selected }: any) {
  const { src, alt, width, alignment, cropX, cropY, cropW, cropH } = node.attrs;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const resizeStartRef = useRef({ x: 0, startWidth: 0 });

  const hasCrop = cropX !== 0 || cropY !== 0 || cropW !== 100 || cropH !== 100;

  const justifyClass = alignment === 'left' ? 'justify-start' : alignment === 'right' ? 'justify-end' : 'justify-center';

  // ── Resize handlers ──
  const onResizeStart = useCallback((e: React.PointerEvent, _side: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const imgEl = containerRef.current?.querySelector('img');
    resizeStartRef.current = { x: e.clientX, startWidth: imgEl?.offsetWidth || 300 };

    const onMove = (ev: PointerEvent) => {
      const parent = containerRef.current?.closest('.ProseMirror');
      if (!parent) return;
      const maxW = (parent as HTMLElement).offsetWidth - 20;
      const delta = _side === 'right'
        ? ev.clientX - resizeStartRef.current.x
        : resizeStartRef.current.x - ev.clientX;
      const newW = Math.max(80, Math.min(maxW, resizeStartRef.current.startWidth + delta));
      updateAttributes({ width: Math.round(newW) });
    };
    const onUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [updateAttributes]);

  return (
    <NodeViewWrapper className={cn('flex my-2', justifyClass)}>
      <div
        ref={containerRef}
        className={cn(
          'relative group inline-block',
          selected && 'ring-2 ring-primary rounded-md',
          isResizing && 'select-none'
        )}
        style={{ width: width ? `${width}px` : undefined, maxWidth: '100%' }}
        onMouseEnter={() => setShowToolbar(true)}
        onMouseLeave={() => !isResizing && setShowToolbar(false)}
      >
        {/* Image with optional crop */}
        <div className="overflow-hidden rounded-md" style={hasCrop ? {
          position: 'relative',
          width: '100%',
          paddingBottom: `${(cropH / cropW) * 100}%`,
        } : undefined}>
          <img
            src={src}
            alt={alt}
            draggable={false}
            className={cn(
              'select-none',
              hasCrop ? 'absolute' : 'block w-full rounded-md'
            )}
            style={hasCrop ? {
              left: `${-(cropX / cropW) * 100}%`,
              top: `${-(cropY / cropH) * 100}%`,
              width: `${100 / cropW * 100}%`,
              height: `${100 / cropH * 100}%`,
            } : undefined}
          />
        </div>

        {/* Resize handles */}
        <div
          className={cn(
            'absolute top-0 left-0 w-2 h-full cursor-w-resize opacity-0 group-hover:opacity-100 transition-opacity',
            'flex items-center justify-center'
          )}
          onPointerDown={e => onResizeStart(e, 'left')}
        >
          <div className="w-1 h-8 rounded-full bg-primary/70" />
        </div>
        <div
          className={cn(
            'absolute top-0 right-0 w-2 h-full cursor-e-resize opacity-0 group-hover:opacity-100 transition-opacity',
            'flex items-center justify-center'
          )}
          onPointerDown={e => onResizeStart(e, 'right')}
        >
          <div className="w-1 h-8 rounded-full bg-primary/70" />
        </div>

        {/* Drag handle */}
        <div
          data-drag-handle
          className={cn(
            'absolute -left-7 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-8 rounded bg-popover border border-border shadow-sm cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-20'
          )}
          title="Drag to reorder"
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </div>

        {/* Floating toolbar */}
        {(showToolbar || selected) && !isResizing && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1 py-0.5 rounded-lg bg-popover border border-border shadow-lg z-20">
            <button
              onClick={() => updateAttributes({ alignment: 'left' })}
              className={cn('p-1 rounded hover:bg-muted transition-colors', alignment === 'left' && 'bg-muted text-primary')}
              title="Align left"
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => updateAttributes({ alignment: 'center' })}
              className={cn('p-1 rounded hover:bg-muted transition-colors', alignment === 'center' && 'bg-muted text-primary')}
              title="Align center"
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => updateAttributes({ alignment: 'right' })}
              className={cn('p-1 rounded hover:bg-muted transition-colors', alignment === 'right' && 'bg-muted text-primary')}
              title="Align right"
            >
              <AlignRight className="h-3.5 w-3.5" />
            </button>
            <div className="w-px h-4 bg-border mx-0.5" />
            <button
              onClick={() => setShowCrop(true)}
              className="p-1 rounded hover:bg-muted transition-colors"
              title="Crop image"
            >
              <Crop className="h-3.5 w-3.5" />
            </button>
            {hasCrop && (
              <button
                onClick={() => updateAttributes({ cropX: 0, cropY: 0, cropW: 100, cropH: 100 })}
                className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
                title="Reset crop"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="w-px h-4 bg-border mx-0.5" />
            <button
              onClick={deleteNode}
              className="p-1 rounded hover:bg-destructive/20 text-destructive transition-colors"
              title="Remove image"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

      </div>
      {/* Crop modal */}
      {showCrop && (
        <CropOverlay
          src={src}
          initialCrop={{ x: cropX, y: cropY, w: cropW, h: cropH }}
          onApply={(c) => {
            updateAttributes({ cropX: c.x, cropY: c.y, cropW: c.w, cropH: c.h });
            setShowCrop(false);
          }}
          onCancel={() => setShowCrop(false)}
        />
      )}
    </NodeViewWrapper>
  );
}

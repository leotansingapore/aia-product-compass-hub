import { useState, useRef, useEffect, useCallback } from 'react';
import { Eraser, Pencil, Undo2, Redo2, X, Check, Move } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tool = 'eraser' | 'pen' | 'select';

// Selection state phases
type SelectPhase = 'idle' | 'selecting' | 'selected' | 'dragging';

interface Rect { x: number; y: number; w: number; h: number }

export function InlineImageEditor({
  imageUrl,
  onApply,
  onCancel,
}: {
  imageUrl: string;
  onApply: (editedBase64: string) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('eraser');
  const [strokeSize, setStrokeSize] = useState(18);
  const isDrawingRef = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);

  // Selection state
  const selectPhaseRef = useRef<SelectPhase>('idle');
  const selRectRef = useRef<Rect | null>(null);       // canvas-pixel rect
  const selStartRef = useRef<{ x: number; y: number } | null>(null);
  const selImageDataRef = useRef<ImageData | null>(null); // captured pixels
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const [selRect, setSelRect] = useState<Rect | null>(null); // for overlay render

  // Cursor overlay
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const toolRef = useRef(tool);
  const strokeSizeRef = useRef(strokeSize);
  useEffect(() => { toolRef.current = tool; }, [tool]);
  useEffect(() => { strokeSizeRef.current = strokeSize; }, [strokeSize]);

  // Load image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyRef.current = [snap];
      historyIndexRef.current = 0;
    };
    img.src = imageUrl.includes('?') ? `${imageUrl}&_cors=1` : `${imageUrl}?_cors=1`;
  }, [imageUrl]);

  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(snap);
    if (historyRef.current.length > 40) {
      historyRef.current.shift();
    } else {
      historyIndexRef.current++;
    }
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')!.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    selRectRef.current = null; setSelRect(null); selImageDataRef.current = null;
    selectPhaseRef.current = 'idle';
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')!.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    selRectRef.current = null; setSelRect(null); selImageDataRef.current = null;
    selectPhaseRef.current = 'idle';
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); redo(); }
      if (e.key === 'Escape') { selRectRef.current = null; setSelRect(null); selImageDataRef.current = null; selectPhaseRef.current = 'idle'; }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  // --- Coordinate helpers ---
  // Always measure against the drawing canvas rect so cursor + strokes align.
  const getClientXY = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    return { clientX: (e as React.MouseEvent).clientX, clientY: (e as React.MouseEvent).clientY };
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const { clientX, clientY } = getClientXY(e);
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  // Returns display-space (CSS px) position relative to the canvas element
  const getDisplayPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const { clientX, clientY } = getClientXY(e);
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const getDisplayRadius = () => {
    const canvas = canvasRef.current;
    if (!canvas) return strokeSize / 2;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    return strokeSizeRef.current / scaleX / 2;
  };

  // Draw selection overlay (dashed marching ants rect)
  const drawOverlay = useCallback((r: Rect | null) => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    if (!overlay || !canvas) return;
    overlay.width = canvas.width;
    overlay.height = canvas.height;
    const ctx = overlay.getContext('2d')!;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    if (!r) return;
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    // light fill
    ctx.fillStyle = 'rgba(37,99,235,0.08)';
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }, []);

  useEffect(() => { drawOverlay(selRect); }, [selRect, drawOverlay]);

  // ---- Mouse handlers ----

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getPos(e);

    if (toolRef.current === 'select') {
      const phase = selectPhaseRef.current;
      const r = selRectRef.current;

      // If there's an existing selection and we click inside it → start drag
      if ((phase === 'selected' || phase === 'dragging') && r) {
        const inside = pos.x >= r.x && pos.x <= r.x + r.w && pos.y >= r.y && pos.y <= r.y + r.h;
        if (inside) {
          // Capture the region and clear it on canvas
          if (phase === 'selected') {
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d')!;
            selImageDataRef.current = ctx.getImageData(r.x, r.y, r.w, r.h);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(r.x, r.y, r.w, r.h);
          }
          selectPhaseRef.current = 'dragging';
          dragStartRef.current = pos;
          return;
        }
      }

      // Otherwise start a new selection
      if (selImageDataRef.current && selRectRef.current) {
        // Commit floating selection first
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        const r2 = selRectRef.current;
        ctx.putImageData(selImageDataRef.current, r2.x, r2.y);
        saveSnapshot();
        selImageDataRef.current = null;
      }
      selectPhaseRef.current = 'selecting';
      selStartRef.current = pos;
      selRectRef.current = { x: pos.x, y: pos.y, w: 0, h: 0 };
      setSelRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
      isDrawingRef.current = true;
      return;
    }

    // Pen / eraser
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const color = toolRef.current === 'eraser' ? '#ffffff' : '#1a1a1a';
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, strokeSizeRef.current / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    isDrawingRef.current = true;
    lastPos.current = pos;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setCursorPos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });

    const pos = getPos(e);

    if (toolRef.current === 'select') {
      const phase = selectPhaseRef.current;

      if (phase === 'selecting' && isDrawingRef.current && selStartRef.current) {
        const r: Rect = {
          x: Math.min(selStartRef.current.x, pos.x),
          y: Math.min(selStartRef.current.y, pos.y),
          w: Math.abs(pos.x - selStartRef.current.x),
          h: Math.abs(pos.y - selStartRef.current.y),
        };
        selRectRef.current = r;
        setSelRect({ ...r });
        return;
      }

      if (phase === 'dragging' && dragStartRef.current && selRectRef.current && selImageDataRef.current) {
        const dx = pos.x - dragStartRef.current.x;
        const dy = pos.y - dragStartRef.current.y;
        const r = selRectRef.current;
        const newRect: Rect = { x: r.x + dx, y: r.y + dy, w: r.w, h: r.h };
        selRectRef.current = newRect;
        setSelRect({ ...newRect });
        dragStartRef.current = pos;

        // Re-render: clear + restore base + draw floating
        const ctx = canvas.getContext('2d')!;
        // Restore base from last history snapshot (before the lift)
        const baseSnap = historyRef.current[historyIndexRef.current];
        if (baseSnap) ctx.putImageData(baseSnap, 0, 0);
        // White out the old position
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(r.x, r.y, r.w, r.h);
        // Draw floating at new position
        ctx.putImageData(selImageDataRef.current, newRect.x, newRect.y);
        return;
      }
      return;
    }

    // Pen / eraser draw
    if (!isDrawingRef.current || !lastPos.current) return;
    const ctx = canvas.getContext('2d')!;
    const color = toolRef.current === 'eraser' ? '#ffffff' : '#1a1a1a';
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeSizeRef.current;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const handleMouseUp = () => {
    const phase = selectPhaseRef.current;

    if (toolRef.current === 'select') {
      if (phase === 'selecting') {
        const r = selRectRef.current;
        if (!r || r.w < 4 || r.h < 4) {
          selRectRef.current = null; setSelRect(null);
          selectPhaseRef.current = 'idle';
        } else {
          selectPhaseRef.current = 'selected';
        }
      } else if (phase === 'dragging') {
        selectPhaseRef.current = 'selected';
        dragStartRef.current = null;
      }
      isDrawingRef.current = false;
      return;
    }

    if (isDrawingRef.current) saveSnapshot();
    isDrawingRef.current = false;
    lastPos.current = null;
  };

  const handleMouseLeave = () => {
    setCursorPos(null);
    handleMouseUp();
  };

  const handleApply = () => {
    // Commit any floating selection first
    if (selImageDataRef.current && selRectRef.current) {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(selImageDataRef.current, selRectRef.current.x, selRectRef.current.y);
    }
    const canvas = canvasRef.current; if (!canvas) return;
    const flat = document.createElement('canvas');
    flat.width = canvas.width; flat.height = canvas.height;
    const fctx = flat.getContext('2d')!;
    fctx.fillStyle = '#ffffff';
    fctx.fillRect(0, 0, flat.width, flat.height);
    fctx.drawImage(canvas, 0, 0);
    onApply(flat.toDataURL('image/png'));
  };

  const displayRadius = cursorPos ? getDisplayRadius() : 0;
  const cursorClass = tool === 'select'
    ? (selectPhaseRef.current === 'dragging' ? 'cursor-grabbing' : 'cursor-crosshair')
    : 'cursor-none';

  return (
    <div className="rounded-xl border-2 border-primary/40 bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b flex-wrap">
        <span className="text-xs font-semibold text-foreground">Edit image</span>
        <div className="flex items-center gap-1 ml-2">
          {(['eraser', 'pen', 'select'] as const).map(t => (
            <button
              key={t}
              onClick={() => {
                setTool(t);
                if (t !== 'select') {
                  // commit floating selection on tool switch
                  if (selImageDataRef.current && selRectRef.current) {
                    const canvas = canvasRef.current!;
                    const ctx = canvas.getContext('2d')!;
                    ctx.putImageData(selImageDataRef.current, selRectRef.current.x, selRectRef.current.y);
                    saveSnapshot();
                    selImageDataRef.current = null;
                  }
                  selRectRef.current = null; setSelRect(null);
                  selectPhaseRef.current = 'idle';
                }
              }}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-colors",
                tool === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/60"
              )}
            >
              {t === 'eraser' ? <Eraser className="h-3 w-3" /> : t === 'pen' ? <Pencil className="h-3 w-3" /> : <Move className="h-3 w-3" />}
              {t === 'select' ? 'Move' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        {tool !== 'select' && (
          <div className="flex items-center gap-1 ml-1">
            {[10, 20, 35].map(s => (
              <button
                key={s}
                onClick={() => setStrokeSize(s)}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center border transition-colors",
                  strokeSize === s ? "border-primary bg-primary/10" : "border-border hover:border-primary/60"
                )}
              >
                <div className="rounded-full bg-foreground" style={{ width: Math.max(3, s / 5), height: Math.max(3, s / 5) }} />
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={undo} title="Undo (Ctrl+Z)" className="p-1.5 rounded border border-border text-muted-foreground hover:border-primary/60 hover:text-foreground transition-colors">
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={redo} title="Redo" className="p-1.5 rounded border border-border text-muted-foreground hover:border-primary/60 hover:text-foreground transition-colors">
            <Redo2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={onCancel} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-border text-muted-foreground hover:border-destructive/60 hover:text-destructive transition-colors ml-1">
            <X className="h-3 w-3" /> Cancel
          </button>
          <button onClick={handleApply} className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs border border-primary bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Check className="h-3 w-3" /> Apply
          </button>
        </div>
      </div>
      <div className="relative overflow-hidden max-h-64">
        <canvas ref={canvasRef} className="w-full h-full object-contain touch-none max-h-64 block" />
        {/* Selection overlay canvas */}
        <canvas
          ref={overlayRef}
          className={cn("absolute inset-0 w-full h-full object-contain touch-none max-h-64", cursorClass)}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleMouseDown as never}
          onTouchMove={handleMouseMove as never}
          onTouchEnd={handleMouseUp}
        />
        {/* Brush cursor circle */}
        {cursorPos && tool !== 'select' && (
          <div
            className="pointer-events-none absolute rounded-full border-2 border-dashed"
            style={{
              left: cursorPos.x - displayRadius,
              top: cursorPos.y - displayRadius,
              width: displayRadius * 2,
              height: displayRadius * 2,
              borderColor: tool === 'eraser' ? '#ef4444' : '#1a1a1a',
            }}
          />
        )}
      </div>
      <p className="text-[10px] text-muted-foreground px-3 py-1.5 bg-muted/20 border-t">
        {tool === 'select'
          ? selRect ? 'Drag inside selection to move it · Esc to deselect' : 'Drag to select a region'
          : tool === 'eraser' ? 'Erasing — draw over areas to remove' : 'Drawing — add black marks'
        } · Ctrl+Z to undo
      </p>
    </div>
  );
}

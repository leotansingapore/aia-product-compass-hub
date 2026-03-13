import { useState, useRef, useEffect, useCallback } from 'react';
import { Eraser, Pencil, Undo2, Redo2, X, Check, Move, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tool = 'eraser' | 'pen' | 'select' | 'text';

// Selection state phases
type SelectPhase = 'idle' | 'selecting' | 'selected' | 'dragging';

interface Rect { x: number; y: number; w: number; h: number }

interface TextInput {
  x: number;   // canvas px
  y: number;   // canvas px
  dispX: number; // display px (for positioning the input box)
  dispY: number;
}

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
  const textInputRef = useRef<HTMLInputElement>(null);
  const [tool, setTool] = useState<Tool>('eraser');
  const [strokeSize, setStrokeSize] = useState(18);
  const [fontSize, setFontSize] = useState(24);
  const [textInput, setTextInput] = useState<TextInput | null>(null);
  const [textValue, setTextValue] = useState('');
  const isDrawingRef = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);

  // Selection state
  const selectPhaseRef = useRef<SelectPhase>('idle');
  const selRectRef = useRef<Rect | null>(null);
  const selStartRef = useRef<{ x: number; y: number } | null>(null);
  const selImageDataRef = useRef<ImageData | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const origSelRectRef = useRef<Rect | null>(null);
  const [selRect, setSelRect] = useState<Rect | null>(null);

  // Cursor overlay
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const toolRef = useRef(tool);
  const strokeSizeRef = useRef(strokeSize);
  const fontSizeRef = useRef(fontSize);
  useEffect(() => { toolRef.current = tool; }, [tool]);
  useEffect(() => { strokeSizeRef.current = strokeSize; }, [strokeSize]);
  useEffect(() => { fontSizeRef.current = fontSize; }, [fontSize]);

  // Focus text input when it appears
  useEffect(() => {
    if (textInput) {
      setTimeout(() => textInputRef.current?.focus(), 30);
    }
  }, [textInput]);

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

  // Commit typed text to canvas
  const commitText = useCallback((ti: TextInput, value: string) => {
    if (!value.trim()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.font = `bold ${fontSizeRef.current}px sans-serif`;
    ctx.fillStyle = '#1a1a1a';
    ctx.textBaseline = 'top';
    ctx.fillText(value.trim(), ti.x, ti.y);
    saveSnapshot();
  }, [saveSnapshot]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); redo(); }
      if (e.key === 'Escape') {
        setTextInput(null); setTextValue('');
        selRectRef.current = null; setSelRect(null); selImageDataRef.current = null; selectPhaseRef.current = 'idle';
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  // --- Coordinate helpers ---
  const getClientXY = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    return { clientX: (e as React.MouseEvent).clientX, clientY: (e as React.MouseEvent).clientY };
  };

  const getContentRect = (canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const canvasAspect = canvas.width / canvas.height;
    const boxAspect = rect.width / rect.height;
    let renderWidth: number, renderHeight: number, offsetX: number, offsetY: number;
    if (canvasAspect > boxAspect) {
      renderWidth = rect.width;
      renderHeight = rect.width / canvasAspect;
      offsetX = 0;
      offsetY = (rect.height - renderHeight) / 2;
    } else {
      renderHeight = rect.height;
      renderWidth = rect.height * canvasAspect;
      offsetX = (rect.width - renderWidth) / 2;
      offsetY = 0;
    }
    return { renderWidth, renderHeight, offsetX, offsetY, rect };
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const { renderWidth, renderHeight, offsetX, offsetY, rect } = getContentRect(canvas);
    const scaleX = canvas.width / renderWidth;
    const scaleY = canvas.height / renderHeight;
    const { clientX, clientY } = getClientXY(e);
    return {
      x: (clientX - rect.left - offsetX) * scaleX,
      y: (clientY - rect.top - offsetY) * scaleY,
    };
  };

  const getDisplayPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const { offsetX, offsetY, rect } = getContentRect(canvas);
    const { clientX, clientY } = getClientXY(e);
    return { x: clientX - rect.left - offsetX, y: clientY - rect.top - offsetY };
  };

  const getDisplayRadius = () => {
    const canvas = canvasRef.current;
    if (!canvas) return strokeSize / 2;
    const { renderWidth } = getContentRect(canvas);
    const scaleX = canvas.width / renderWidth;
    return strokeSizeRef.current / scaleX / 2;
  };

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
    ctx.fillStyle = 'rgba(37,99,235,0.08)';
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }, []);

  useEffect(() => { drawOverlay(selRect); }, [selRect, drawOverlay]);

  // ---- Mouse handlers ----

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getPos(e);
    const dp = getDisplayPos(e);

    // Text tool: commit previous text then open new input at click position
    if (toolRef.current === 'text') {
      if (textInput && textValue.trim()) {
        commitText(textInput, textValue);
      }
      setTextInput({ x: pos.x, y: pos.y, dispX: dp.x, dispY: dp.y });
      setTextValue('');
      return;
    }

    if (toolRef.current === 'select') {
      const phase = selectPhaseRef.current;
      const r = selRectRef.current;

      if ((phase === 'selected' || phase === 'dragging') && r) {
        const inside = pos.x >= r.x && pos.x <= r.x + r.w && pos.y >= r.y && pos.y <= r.y + r.h;
        if (inside) {
          if (phase === 'selected') {
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d')!;
            selImageDataRef.current = ctx.getImageData(r.x, r.y, r.w, r.h);
            origSelRectRef.current = { ...r };
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(r.x, r.y, r.w, r.h);
          }
          selectPhaseRef.current = 'dragging';
          dragStartRef.current = pos;
          return;
        }
      }

      if (selImageDataRef.current && selRectRef.current) {
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
    const dp = getDisplayPos(e);
    setCursorPos({ x: dp.x, y: dp.y });

    const pos = getPos(e);

    if (toolRef.current === 'text' || toolRef.current === 'select') {
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

          const ctx = canvas.getContext('2d')!;
          const baseSnap = historyRef.current[historyIndexRef.current];
          if (baseSnap) ctx.putImageData(baseSnap, 0, 0);
          // Erase the ORIGINAL position (not the intermediate drag position)
          const orig = origSelRectRef.current ?? r;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(orig.x, orig.y, orig.w, orig.h);
          ctx.putImageData(selImageDataRef.current, newRect.x, newRect.y);
          return;
        }
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

    if (toolRef.current === 'text') return;

    if (isDrawingRef.current) saveSnapshot();
    isDrawingRef.current = false;
    lastPos.current = null;
  };

  const handleMouseLeave = () => {
    setCursorPos(null);
    if (tool !== 'text') handleMouseUp();
  };

  const handleApply = () => {
    // Commit any floating selection or pending text first
    if (selImageDataRef.current && selRectRef.current) {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(selImageDataRef.current, selRectRef.current.x, selRectRef.current.y);
    }
    if (textInput && textValue.trim()) {
      commitText(textInput, textValue);
    }
    setTextInput(null); setTextValue('');
    const canvas = canvasRef.current; if (!canvas) return;
    const flat = document.createElement('canvas');
    flat.width = canvas.width; flat.height = canvas.height;
    const fctx = flat.getContext('2d')!;
    fctx.fillStyle = '#ffffff';
    fctx.fillRect(0, 0, flat.width, flat.height);
    fctx.drawImage(canvas, 0, 0);
    onApply(flat.toDataURL('image/png'));
  };

  const switchTool = (t: Tool) => {
    // Commit text if switching away from text tool
    if (tool === 'text' && textInput && textValue.trim()) {
      commitText(textInput, textValue);
    }
    setTextInput(null); setTextValue('');

    if (t !== 'select') {
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
    setTool(t);
  };

  const displayRadius = cursorPos ? getDisplayRadius() : 0;
  const cursorClass = tool === 'select'
    ? (selectPhaseRef.current === 'dragging' ? 'cursor-grabbing' : 'cursor-crosshair')
    : tool === 'text'
      ? 'cursor-text'
      : 'cursor-none';

  // Compute text input display position (in CSS px within the canvas container)
  const getTextInputDisplayPos = () => {
    const canvas = canvasRef.current;
    if (!canvas || !textInput) return { left: 0, top: 0 };
    const { renderWidth, offsetX, offsetY } = getContentRect(canvas);
    const scale = renderWidth / canvas.width;
    return {
      left: offsetX + textInput.x * scale,
      top: offsetY + textInput.y * scale,
    };
  };

  return (
    <div className="rounded-xl border-2 border-primary/40 bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b flex-wrap">
        <span className="text-xs font-semibold text-foreground">Edit image</span>
        <div className="flex items-center gap-1 ml-2">
          {(['eraser', 'pen', 'text', 'select'] as const).map(t => (
            <button
              key={t}
              onClick={() => switchTool(t)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-colors",
                tool === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/60"
              )}
            >
              {t === 'eraser' ? <Eraser className="h-3 w-3" />
                : t === 'pen' ? <Pencil className="h-3 w-3" />
                : t === 'text' ? <Type className="h-3 w-3" />
                : <Move className="h-3 w-3" />}
              {t === 'select' ? 'Move' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Size controls — stroke size for pen/eraser, font size for text */}
        {tool === 'text' ? (
          <div className="flex items-center gap-1 ml-1">
            {[16, 24, 36].map(s => (
              <button
                key={s}
                onClick={() => setFontSize(s)}
                className={cn(
                  "px-2 py-0.5 rounded border text-xs font-medium transition-colors",
                  fontSize === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/60"
                )}
              >
                {s === 16 ? 'S' : s === 24 ? 'M' : 'L'}
              </button>
            ))}
          </div>
        ) : tool !== 'select' ? (
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
        ) : null}

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

        {/* Floating text input — appears where user clicks in text mode */}
        {tool === 'text' && textInput && (() => {
          const { left, top } = getTextInputDisplayPos();
          return (
            <div
              className="absolute pointer-events-auto"
              style={{ left, top, zIndex: 20 }}
            >
              <input
                ref={textInputRef}
                value={textValue}
                onChange={e => setTextValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitText(textInput, textValue);
                    setTextInput(null); setTextValue('');
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setTextInput(null); setTextValue('');
                  }
                }}
                placeholder="Type here…"
                className="border border-primary bg-primary/5 rounded px-1.5 py-0.5 outline-none text-foreground min-w-[80px]"
                style={{
                  fontSize: (() => {
                    const canvas = canvasRef.current;
                    if (!canvas) return fontSize;
                    const { renderWidth } = getContentRect(canvas);
                    const scale = renderWidth / canvas.width;
                    return Math.max(10, fontSize * scale);
                  })(),
                  fontWeight: 'bold',
                  fontFamily: 'sans-serif',
                  lineHeight: 1.2,
                }}
              />
              <p className="text-[9px] text-muted-foreground mt-0.5">Enter to stamp · Esc to cancel</p>
            </div>
          );
        })()}

        {/* Brush cursor circle */}
        {cursorPos && tool !== 'select' && tool !== 'text' && (() => {
          const canvas = canvasRef.current;
          const contentOffset = canvas ? getContentRect(canvas) : { offsetX: 0, offsetY: 0 };
          return (
            <div
              className="pointer-events-none absolute rounded-full border-2 border-dashed"
              style={{
                left: contentOffset.offsetX + cursorPos.x - displayRadius,
                top: contentOffset.offsetY + cursorPos.y - displayRadius,
                width: displayRadius * 2,
                height: displayRadius * 2,
                borderColor: tool === 'eraser' ? '#ef4444' : '#1a1a1a',
              }}
            />
          );
        })()}
      </div>

      <p className="text-[10px] text-muted-foreground px-3 py-1.5 bg-muted/20 border-t">
        {tool === 'select'
          ? selRect ? 'Drag inside selection to move it · Esc to deselect' : 'Drag to select a region'
          : tool === 'text'
            ? textInput ? 'Type then press Enter to stamp · click elsewhere for a new line' : 'Click anywhere on the image to add text'
            : tool === 'eraser' ? 'Erasing — draw over areas to remove' : 'Drawing — add black marks'
        } · Ctrl+Z to undo
      </p>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { Eraser, Pencil, Undo2, Redo2, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [tool, setTool] = useState<'eraser' | 'pen'>('eraser');
  const [strokeSize, setStrokeSize] = useState(18);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
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
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')!.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    const me = e as React.MouseEvent;
    return { x: me.nativeEvent.offsetX * scaleX, y: me.nativeEvent.offsetY * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e);
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, strokeSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : '#1a1a1a';
    ctx.fill();
    setIsDrawing(true);
    lastPos.current = pos;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !lastPos.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e);
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : '#1a1a1a';
    ctx.lineWidth = strokeSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      if (canvas) canvas.getContext('2d')!.globalCompositeOperation = 'source-over';
      saveSnapshot();
    }
    setIsDrawing(false);
    lastPos.current = null;
  };

  const handleApply = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const flat = document.createElement('canvas');
    flat.width = canvas.width;
    flat.height = canvas.height;
    const fctx = flat.getContext('2d')!;
    fctx.fillStyle = '#ffffff';
    fctx.fillRect(0, 0, flat.width, flat.height);
    fctx.drawImage(canvas, 0, 0);
    onApply(flat.toDataURL('image/png'));
  };

  return (
    <div className="rounded-xl border-2 border-primary/40 bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b flex-wrap">
        <span className="text-xs font-semibold text-foreground">Edit image</span>
        <div className="flex items-center gap-1 ml-2">
          {(['eraser', 'pen'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTool(t)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-colors",
                tool === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/60"
              )}
            >
              {t === 'eraser' ? <Eraser className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
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
        <canvas
          ref={canvasRef}
          className={cn(
            "w-full h-full object-contain touch-none max-h-64",
            tool === 'eraser' ? "cursor-cell" : "cursor-crosshair"
          )}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
      <p className="text-[10px] text-muted-foreground px-3 py-1.5 bg-muted/20 border-t">
        {tool === 'eraser' ? 'Erasing — draw over areas to remove' : 'Drawing — add black marks'} · Ctrl+Z to undo
      </p>
    </div>
  );
}

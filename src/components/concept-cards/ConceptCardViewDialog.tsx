import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ZoomIn, ZoomOut, Pencil, Eraser, Trash2, Loader2,
  Sparkles, CheckCircle, AlertCircle, TrendingUp, Lightbulb,
  RotateCcw, Eye, Columns2, Undo2, Redo2, Crop, Type,
} from 'lucide-react';
import { ConceptCard } from '@/hooks/useConceptCards';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ImageCropper } from './ImageCropper';

interface Props {
  card: ConceptCard | null;
  onClose: () => void;
  initialTab?: 'view' | 'draw';
}

interface CompareResult {
  score: number;
  grade: 'Excellent' | 'Good' | 'Fair' | 'Partial' | 'Needs Work';
  summary: string;
  strengths: string[];
  improvements: string[];
  tip: string;
}

const GRADE_COLORS: Record<string, string> = {
  Excellent: 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800',
  Good: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800',
  Fair: 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800',
  Partial: 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800',
  'Needs Work': 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800',
};

const SCORE_COLOR = (score: number) => {
  if (score >= 90) return 'text-green-600 dark:text-green-400';
  if (score >= 70) return 'text-blue-600 dark:text-blue-400';
  if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
  if (score >= 30) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
};

// ─── Whiteboard ─────────────────────────────────────────────────────────────
type WhiteboardTool = 'pen' | 'eraser' | 'text';

interface TextOverlay {
  x: number;   // CSS pixels relative to canvas element
  y: number;
  canvasX: number; // canvas pixel coords
  canvasY: number;
}

function Whiteboard({
  onCompare,
  comparing,
  referenceImageUrl,
}: {
  onCompare: (base64: string) => void;
  comparing: boolean;
  referenceImageUrl?: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<WhiteboardTool>('pen');
  const [penSize, setPenSize] = useState(3);
  const [eraserSize, setEraserSize] = useState(20);
  const [fontSize, setFontSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showRef, setShowRef] = useState(false);
  const [textOverlay, setTextOverlay] = useState<TextOverlay | null>(null);
  const [textValue, setTextValue] = useState('');
  const textInputRef = useRef<HTMLInputElement>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);

  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(snap);
    historyIndexRef.current = historyRef.current.length - 1;
    if (historyRef.current.length > 30) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    setHasDrawn(historyIndexRef.current > 0);
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    setHasDrawn(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveSnapshot();
  }, [saveSnapshot]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, redo]);

  // Focus text input when overlay appears
  useEffect(() => {
    if (textOverlay) {
      setTimeout(() => textInputRef.current?.focus(), 50);
    }
  }, [textOverlay]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const t = e.touches[0];
      return {
        cssX: t.clientX - rect.left,
        cssY: t.clientY - rect.top,
        x: (t.clientX - rect.left) * scaleX,
        y: (t.clientY - rect.top) * scaleY,
      };
    }
    const me = e as React.MouseEvent;
    return {
      cssX: me.nativeEvent.offsetX,
      cssY: me.nativeEvent.offsetY,
      x: me.nativeEvent.offsetX * scaleX,
      y: me.nativeEvent.offsetY * scaleY,
    };
  };

  const applyToolSettings = (ctx: CanvasRenderingContext2D) => {
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = eraserSize;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = penSize;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const stampText = useCallback((text: string, canvasX: number, canvasY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !text.trim()) return;
    const ctx = canvas.getContext('2d')!;
    const scale = canvas.width / (canvasRef.current?.getBoundingClientRect().width ?? canvas.width);
    const scaledFont = Math.round(fontSize * scale);
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = `${scaledFont}px sans-serif`;
    ctx.fillStyle = '#1a1a1a';
    ctx.textBaseline = 'top';
    ctx.fillText(text, canvasX, canvasY);
    saveSnapshot();
    setHasDrawn(true);
  }, [fontSize, saveSnapshot]);

  const commitText = useCallback(() => {
    if (textOverlay && textValue.trim()) {
      stampText(textValue, textOverlay.canvasX, textOverlay.canvasY);
    }
    setTextOverlay(null);
    setTextValue('');
  }, [textOverlay, textValue, stampText]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (tool === 'text') {
      const pos = getPos(e, canvas);
      // dismiss existing overlay first
      if (textOverlay && textValue.trim()) {
        stampText(textValue, textOverlay.canvasX, textOverlay.canvasY);
      }
      setTextValue('');
      setTextOverlay({ x: pos.cssX, y: pos.cssY, canvasX: pos.x, canvasY: pos.y });
      return;
    }

    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);
    applyToolSettings(ctx);
    ctx.beginPath();
    if (tool === 'eraser') {
      ctx.arc(pos.x, pos.y, eraserSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.arc(pos.x, pos.y, penSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a1a';
      ctx.fill();
    }
    setIsDrawing(true);
    lastPos.current = pos;
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !lastPos.current || tool === 'text') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);
    applyToolSettings(ctx);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d')!;
        ctx.globalCompositeOperation = 'source-over';
      }
      saveSnapshot();
    }
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveSnapshot();
    setHasDrawn(false);
    setTextOverlay(null);
    setTextValue('');
  };

  const handleCompare = () => {
    // Commit any pending text first
    if (textOverlay && textValue.trim()) {
      stampText(textValue, textOverlay.canvasX, textOverlay.canvasY);
      setTextOverlay(null);
      setTextValue('');
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const flat = document.createElement('canvas');
    flat.width = canvas.width;
    flat.height = canvas.height;
    const fctx = flat.getContext('2d')!;
    fctx.fillStyle = '#ffffff';
    fctx.fillRect(0, 0, flat.width, flat.height);
    fctx.drawImage(canvas, 0, 0);
    onCompare(flat.toDataURL('image/png'));
  };

  const PEN_SIZES = [2, 4, 7];
  const ERASER_SIZES = [10, 20, 40, 70];
  const FONT_SIZES = [14, 20, 28, 36];

  const cursorStyle = tool === 'text' ? 'text' : tool === 'eraser' ? 'cell' : 'crosshair';

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30 flex-wrap shrink-0">
        {/* Tool buttons */}
        {([
          { id: 'pen', icon: Pencil, label: 'Pen' },
          { id: 'eraser', icon: Eraser, label: 'Eraser' },
          { id: 'text', icon: Type, label: 'Text' },
        ] as const).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => { setTool(id); setTextOverlay(null); setTextValue(''); }}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border",
              tool === id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/60"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}

        {/* Size pickers — contextual per tool */}
        {tool === 'pen' && (
          <div className="flex items-center gap-1.5 ml-1">
            {PEN_SIZES.map(s => (
              <button
                key={s}
                onClick={() => setPenSize(s)}
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center border transition-colors",
                  penSize === s ? "border-primary bg-primary/10" : "border-border hover:border-primary/60"
                )}
              >
                <div className="rounded-full bg-foreground" style={{ width: s + 2, height: s + 2 }} />
              </button>
            ))}
          </div>
        )}

        {tool === 'eraser' && (
          <div className="flex items-center gap-1.5 ml-1">
            {ERASER_SIZES.map(s => (
              <button
                key={s}
                onClick={() => setEraserSize(s)}
                title={`Eraser ${s}px`}
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center border transition-colors",
                  eraserSize === s ? "border-primary bg-primary/10" : "border-border hover:border-primary/60"
                )}
              >
                <div className="rounded-full bg-foreground/30 border border-foreground/40"
                  style={{ width: Math.min(s / 3 + 4, 22), height: Math.min(s / 3 + 4, 22) }} />
              </button>
            ))}
          </div>
        )}

        {tool === 'text' && (
          <div className="flex items-center gap-1.5 ml-1">
            {FONT_SIZES.map(s => (
              <button
                key={s}
                onClick={() => setFontSize(s)}
                className={cn(
                  "min-w-[28px] h-7 px-1.5 rounded-lg flex items-center justify-center border text-xs font-medium transition-colors",
                  fontSize === s ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/60 text-muted-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 ml-2 border-l border-border/50 pl-2">
          <button
            onClick={undo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary/60 hover:text-foreground transition-colors"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={redo}
            title="Redo (Ctrl+Shift+Z)"
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary/60 hover:text-foreground transition-colors"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1" />

        {referenceImageUrl && (
          <button
            onClick={() => setShowRef(v => !v)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border",
              showRef
                ? "bg-primary/10 text-primary border-primary/40"
                : "bg-background text-muted-foreground border-border hover:border-primary/60"
            )}
          >
            <Columns2 className="h-3.5 w-3.5" />
            {showRef ? 'Hide ref' : 'Show ref'}
          </button>
        )}

        <button
          onClick={clearCanvas}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border hover:border-destructive/60 hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>

        <Button size="sm" onClick={handleCompare} disabled={!hasDrawn || comparing} className="text-xs h-8">
          {comparing
            ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Comparing...</>
            : <><Sparkles className="h-3.5 w-3.5 mr-1.5" />Compare with AI</>
          }
        </Button>
      </div>

      <div className={cn("flex-1 overflow-hidden flex", showRef ? "flex-row" : "flex-col")}>
        <div className={cn("relative overflow-hidden", showRef ? "w-1/2 border-r" : "flex-1")} style={{ background: '#ffffff' }}>
          <canvas
            ref={canvasRef}
            width={900}
            height={600}
            className="w-full h-full touch-none"
            style={{ background: '#ffffff', cursor: cursorStyle }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {/* Floating text input overlay */}
          {tool === 'text' && textOverlay && (
            <div
              className="absolute z-20"
              style={{ left: textOverlay.x, top: textOverlay.y, transform: 'translateY(-2px)' }}
            >
              <input
                ref={textInputRef}
                value={textValue}
                onChange={e => setTextValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); commitText(); }
                  if (e.key === 'Escape') { setTextOverlay(null); setTextValue(''); }
                }}
                onBlur={commitText}
                placeholder="Type here…"
                className="bg-white/95 border-2 border-primary rounded px-2 py-0.5 outline-none shadow-lg min-w-[120px] max-w-[240px]"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: 1.2,
                  color: '#1a1a1a',
                  fontFamily: 'sans-serif',
                }}
              />
              <div className="text-[9px] text-muted-foreground mt-0.5 bg-background/80 rounded px-1">
                Enter to stamp · Esc to cancel
              </div>
            </div>
          )}

          {!hasDrawn && !textOverlay && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-2 opacity-40">
                {tool === 'text'
                  ? <Type className="h-8 w-8 mx-auto text-muted-foreground" />
                  : <Pencil className="h-8 w-8 mx-auto text-muted-foreground" />
                }
                <p className="text-sm text-muted-foreground">
                  {tool === 'text' ? 'Tap anywhere to type text' : 'Draw here, then tap "Compare with AI"'}
                </p>
              </div>
            </div>
          )}
          {showRef && (
            <div className="absolute top-2 left-2 text-[10px] font-semibold text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded-md border border-border/40">
              Your drawing
            </div>
          )}
        </div>

        {showRef && referenceImageUrl && (
          <div className="w-1/2 bg-muted/20 overflow-auto flex items-center justify-center relative">
            <div className="absolute top-2 left-2 text-[10px] font-semibold text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded-md border border-border/40">
              Reference
            </div>
            <img
              src={referenceImageUrl}
              alt="Reference"
              className="max-w-full max-h-full object-contain p-3"
            />
          </div>
        )}
      </div>
    </div>
  );
}

  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(snap);
    historyIndexRef.current = historyRef.current.length - 1;
    if (historyRef.current.length > 30) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    setHasDrawn(historyIndexRef.current > 0);
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    setHasDrawn(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveSnapshot();
  }, [saveSnapshot]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, redo]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    // Use offsetX/offsetY — already relative to the canvas element, unaffected by
    // parent CSS transforms (e.g. Dialog animations) that throw off clientX - rect.left.
    const me = e as React.MouseEvent;
    return { x: me.nativeEvent.offsetX * scaleX, y: me.nativeEvent.offsetY * scaleY };
  };

  const applyToolSettings = (ctx: CanvasRenderingContext2D) => {
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = eraserSize;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = penSize;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);
    applyToolSettings(ctx);
    ctx.beginPath();
    if (tool === 'eraser') {
      ctx.arc(pos.x, pos.y, eraserSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.arc(pos.x, pos.y, penSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a1a';
      ctx.fill();
    }
    setIsDrawing(true);
    lastPos.current = pos;
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !lastPos.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);
    applyToolSettings(ctx);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d')!;
        ctx.globalCompositeOperation = 'source-over';
      }
      saveSnapshot();
    }
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveSnapshot();
    setHasDrawn(false);
  };

  const handleCompare = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const flat = document.createElement('canvas');
    flat.width = canvas.width;
    flat.height = canvas.height;
    const fctx = flat.getContext('2d')!;
    fctx.fillStyle = '#ffffff';
    fctx.fillRect(0, 0, flat.width, flat.height);
    fctx.drawImage(canvas, 0, 0);
    onCompare(flat.toDataURL('image/png'));
  };

  const PEN_SIZES = [2, 4, 7];
  const ERASER_SIZES = [10, 20, 40, 70];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30 flex-wrap shrink-0">
        {(['pen', 'eraser'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTool(t)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border",
              tool === t
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/60"
            )}
          >
            {t === 'pen' ? <Pencil className="h-3.5 w-3.5" /> : <Eraser className="h-3.5 w-3.5" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}

        {/* Size pickers — contextual per tool */}
        {tool === 'pen' ? (
          <div className="flex items-center gap-1.5 ml-1">
            {PEN_SIZES.map(s => (
              <button
                key={s}
                onClick={() => setPenSize(s)}
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center border transition-colors",
                  penSize === s ? "border-primary bg-primary/10" : "border-border hover:border-primary/60"
                )}
              >
                <div className="rounded-full bg-foreground" style={{ width: s + 2, height: s + 2 }} />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 ml-1">
            {ERASER_SIZES.map(s => (
              <button
                key={s}
                onClick={() => setEraserSize(s)}
                title={`Eraser ${s}px`}
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center border transition-colors",
                  eraserSize === s ? "border-primary bg-primary/10" : "border-border hover:border-primary/60"
                )}
              >
                <div className="rounded-full bg-foreground/30 border border-foreground/40"
                  style={{ width: Math.min(s / 3 + 4, 22), height: Math.min(s / 3 + 4, 22) }} />
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 ml-2 border-l border-border/50 pl-2">
          <button
            onClick={undo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary/60 hover:text-foreground transition-colors"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={redo}
            title="Redo (Ctrl+Shift+Z)"
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary/60 hover:text-foreground transition-colors"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1" />

        {referenceImageUrl && (
          <button
            onClick={() => setShowRef(v => !v)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border",
              showRef
                ? "bg-primary/10 text-primary border-primary/40"
                : "bg-background text-muted-foreground border-border hover:border-primary/60"
            )}
          >
            <Columns2 className="h-3.5 w-3.5" />
            {showRef ? 'Hide ref' : 'Show ref'}
          </button>
        )}

        <button
          onClick={clearCanvas}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border hover:border-destructive/60 hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>

        <Button size="sm" onClick={handleCompare} disabled={!hasDrawn || comparing} className="text-xs h-8">
          {comparing
            ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Comparing...</>
            : <><Sparkles className="h-3.5 w-3.5 mr-1.5" />Compare with AI</>
          }
        </Button>
      </div>

      <div className={cn("flex-1 overflow-hidden flex", showRef ? "flex-row" : "flex-col")}>
        <div className={cn("relative overflow-hidden", showRef ? "w-1/2 border-r" : "flex-1")} style={{ background: '#ffffff' }}>
          <canvas
            ref={canvasRef}
            width={900}
            height={600}
            className="w-full h-full cursor-crosshair touch-none"
            style={{ background: '#ffffff' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          {!hasDrawn && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-2 opacity-40">
                <Pencil className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Draw here, then tap "Compare with AI"</p>
              </div>
            </div>
          )}
          {showRef && (
            <div className="absolute top-2 left-2 text-[10px] font-semibold text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded-md border border-border/40">
              Your drawing
            </div>
          )}
        </div>

        {showRef && referenceImageUrl && (
          <div className="w-1/2 bg-muted/20 overflow-auto flex items-center justify-center relative">
            <div className="absolute top-2 left-2 text-[10px] font-semibold text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded-md border border-border/40">
              Reference
            </div>
            <img
              src={referenceImageUrl}
              alt="Reference"
              className="max-w-full max-h-full object-contain p-3"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Score Display ─────────────────────────────────────────────────────────
function CompareResultPanel({
  result,
  onRetry,
  referenceImageUrl,
  userDrawingBase64,
}: {
  result: CompareResult;
  onRetry: () => void;
  referenceImageUrl?: string | null;
  userDrawingBase64?: string | null;
}) {
  const gradeClass = GRADE_COLORS[result.grade] || GRADE_COLORS['Needs Work'];
  const scoreColor = SCORE_COLOR(result.score);

  return (
    <div className="flex-1 overflow-auto">
      {referenceImageUrl && userDrawingBase64 && (
        <div className="grid grid-cols-2 gap-0 border-b">
          <div className="relative bg-muted/20 flex items-center justify-center p-3 border-r min-h-[140px]">
            <div className="absolute top-1.5 left-2 text-[10px] font-semibold text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded border border-border/40">
              Reference
            </div>
            <img src={referenceImageUrl} alt="Reference" className="max-h-36 object-contain" />
          </div>
          <div className="relative bg-white flex items-center justify-center p-3 min-h-[140px]">
            <div className="absolute top-1.5 left-2 text-[10px] font-semibold text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded border border-border/40">
              Your drawing
            </div>
            <img src={userDrawingBase64} alt="Your drawing" className="max-h-36 object-contain" />
          </div>
        </div>
      )}

      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
          <div className="text-center min-w-[60px]">
            <div className={cn("text-4xl font-bold tabular-nums", scoreColor)}>{result.score}</div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
          <div className="flex-1">
            <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold border mb-1.5", gradeClass)}>
              {result.grade}
            </div>
            <p className="text-sm text-muted-foreground leading-snug">{result.summary}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                result.score >= 70 ? "bg-green-500" : result.score >= 50 ? "bg-yellow-500" : "bg-red-500"
              )}
              style={{ width: `${result.score}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0</span><span>50</span><span>100</span>
          </div>
        </div>

        {result.strengths.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-green-700 dark:text-green-400">
              <CheckCircle className="h-4 w-4" /> What you got right
            </div>
            <ul className="space-y-1">
              {result.strengths.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.improvements.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-yellow-700 dark:text-yellow-400">
              <TrendingUp className="h-4 w-4" /> To improve
            </div>
            <ul className="space-y-1">
              {result.improvements.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-yellow-500 shrink-0 mt-0.5" />{s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.tip && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{result.tip}</p>
          </div>
        )}

        <Button variant="outline" size="sm" onClick={onRetry} className="w-full">
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Try again
        </Button>
      </div>
    </div>
  );
}

// ─── Main Dialog ───────────────────────────────────────────────────────────
export function ConceptCardViewDialog({ card, onClose, initialTab = 'view' }: Props) {
  const [zoom, setZoom] = useState(1);
  const [comparing, setComparing] = useState(false);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [lastUserDrawing, setLastUserDrawing] = useState<string | null>(null);
  const [whiteboardKey, setWhiteboardKey] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Normalise image list
  const allImages: string[] = card
    ? (card.image_urls && card.image_urls.length > 0 ? card.image_urls : card.image_url ? [card.image_url] : [])
    : [];
  const baseImageUrl = allImages[activeImgIndex] ?? null;
  const displayImageUrl = croppedImageUrl || baseImageUrl || null;

  if (!card) return null;

  const handleClose = () => {
    setCompareResult(null);
    setLastUserDrawing(null);
    setWhiteboardKey(k => k + 1);
    setIsCropping(false);
    setCroppedImageUrl(null);
    onClose();
  };

  const handleCompare = async (userDrawingBase64: string) => {
    if (!displayImageUrl) { toast.error('No reference image to compare against'); return; }
    setComparing(true);
    setCompareResult(null);
    setLastUserDrawing(userDrawingBase64);
    try {
      const { data, error } = await supabase.functions.invoke('compare-concept-drawing', {
        body: { userDrawingBase64, referenceImageUrl: displayImageUrl, cardTitle: card.title },
      });
      if (error || !data) { toast.error(error?.message || 'Comparison failed'); return; }
      if (data.error) { toast.error(data.error); return; }
      setCompareResult(data as CompareResult);
    } catch (e) {
      toast.error('Comparison failed — please try again');
      console.error(e);
    } finally {
      setComparing(false);
    }
  };

  const handleRetry = () => {
    setCompareResult(null);
    setLastUserDrawing(null);
    setWhiteboardKey(k => k + 1);
  };

  const handleCropApply = (croppedUrl: string) => {
    setCroppedImageUrl(croppedUrl);
    setIsCropping(false);
    toast.success('Image cropped');
  };

  return (
    <Dialog open={!!card} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full max-h-[92vh] p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b bg-card flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1 flex-1 min-w-0">
            <h2 className="font-bold text-base sm:text-lg leading-snug">{card.title}</h2>
            {card.description && <p className="text-sm text-muted-foreground">{card.description}</p>}
            <div className="flex flex-wrap gap-1 pt-1">
              {card.audience.map(a => <Badge key={a} variant="outline" className="text-xs">{a}</Badge>)}
              {card.product_type.map(p => (
                <Badge key={p} className="text-xs bg-primary/10 text-primary border-primary/20">{p}</Badge>
              ))}
              {card.tags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={initialTab} className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="mx-4 mt-3 self-start shrink-0">
            <TabsTrigger value="view" className="text-xs sm:text-sm gap-1.5">
              <Eye className="h-3.5 w-3.5" /> View Drawing
            </TabsTrigger>
            <TabsTrigger value="draw" className="text-xs sm:text-sm gap-1.5">
              <Pencil className="h-3.5 w-3.5" /> Draw & Compare
            </TabsTrigger>
          </TabsList>

          {/* VIEW TAB */}
          <TabsContent value="view" className="flex flex-col flex-1 overflow-hidden mt-0 p-0">
            {isCropping && baseImageUrl ? (
              <ImageCropper
                imageUrl={croppedImageUrl || baseImageUrl}
                onCrop={handleCropApply}
                onCancel={() => setIsCropping(false)}
              />
            ) : (
              <>
                {/* Multi-image selector tabs */}
                {allImages.length > 1 && (
                  <div className="flex gap-1.5 px-4 pt-3 pb-1 overflow-x-auto shrink-0">
                    {allImages.map((url, i) => (
                      <button
                        key={url}
                        onClick={() => { setActiveImgIndex(i); setCroppedImageUrl(null); setZoom(1); }}
                        className={cn(
                          "shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden transition-all",
                          i === activeImgIndex ? "border-primary shadow-sm" : "border-border/40 opacity-60 hover:opacity-100"
                        )}
                      >
                        <img src={url} alt={`Drawing ${i + 1}`} className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex-1 overflow-auto bg-muted/20">
                  {displayImageUrl ? (
                    <div className="p-4 flex items-center justify-center min-h-[300px]">
                      <img
                        src={displayImageUrl}
                        alt={card.title}
                        style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.2s' }}
                        className="max-w-full rounded-lg shadow-sm"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                      No drawing attached yet
                    </div>
                  )}
                </div>
                {displayImageUrl && (
                  <div className="flex items-center justify-center gap-2 py-3 border-t bg-card shrink-0">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground ml-2" onClick={() => setZoom(1)}>
                      Reset
                    </Button>
                    <div className="w-px h-5 bg-border mx-1" />
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5"
                      onClick={() => setIsCropping(true)}
                    >
                      <Crop className="h-3.5 w-3.5" /> Crop
                    </Button>
                    {croppedImageUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground"
                        onClick={() => setCroppedImageUrl(null)}
                      >
                        Reset crop
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* DRAW & COMPARE TAB */}
          <TabsContent value="draw" className="flex-1 overflow-hidden mt-0 p-0 flex flex-col">
            {compareResult ? (
              <CompareResultPanel
                result={compareResult}
                onRetry={handleRetry}
                referenceImageUrl={displayImageUrl}
                userDrawingBase64={lastUserDrawing}
              />
            ) : (
              <Whiteboard
                key={whiteboardKey}
                onCompare={handleCompare}
                comparing={comparing}
                referenceImageUrl={displayImageUrl}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

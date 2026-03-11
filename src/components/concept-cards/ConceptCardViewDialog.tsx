import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  X, ZoomIn, ZoomOut, Pencil, Eraser, Trash2, Loader2,
  Sparkles, CheckCircle, AlertCircle, TrendingUp, Lightbulb,
  RotateCcw, Eye
} from 'lucide-react';
import { ConceptCard } from '@/hooks/useConceptCards';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  card: ConceptCard | null;
  onClose: () => void;
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

// ─── Whiteboard Component ──────────────────────────────────────────────────
function Whiteboard({
  onCompare,
  comparing,
}: {
  onCompare: (base64: string) => void;
  comparing: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [strokeSize, setStrokeSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = strokeSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [strokeSize]);

  useEffect(() => {
    initCanvas();
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, strokeSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === 'eraser' ? '#ffffff' : '#1a1a1a';
    ctx.fill();
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

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : '#1a1a1a';
    ctx.lineWidth = tool === 'eraser' ? strokeSize * 4 : strokeSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleCompare = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base64 = canvas.toDataURL('image/png');
    onCompare(base64);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30 flex-wrap">
        <button
          onClick={() => setTool('pen')}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border",
            tool === 'pen'
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:border-primary/60"
          )}
        >
          <Pencil className="h-3.5 w-3.5" /> Pen
        </button>
        <button
          onClick={() => setTool('eraser')}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border",
            tool === 'eraser'
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:border-primary/60"
          )}
        >
          <Eraser className="h-3.5 w-3.5" /> Eraser
        </button>

        {/* Stroke size */}
        <div className="flex items-center gap-1.5 ml-1">
          {[2, 4, 7].map(s => (
            <button
              key={s}
              onClick={() => setStrokeSize(s)}
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center border transition-colors",
                strokeSize === s
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/60"
              )}
            >
              <div
                className="rounded-full bg-foreground"
                style={{ width: s + 2, height: s + 2 }}
              />
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <button
          onClick={clearCanvas}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border hover:border-destructive/60 hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>

        <Button
          size="sm"
          onClick={handleCompare}
          disabled={!hasDrawn || comparing}
          className="text-xs h-8"
        >
          {comparing
            ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Comparing...</>
            : <><Sparkles className="h-3.5 w-3.5 mr-1.5" />Compare with AI</>
          }
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-white overflow-hidden relative">
        <canvas
          ref={canvasRef}
          width={900}
          height={600}
          className="w-full h-full cursor-crosshair touch-none"
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
              <p className="text-sm text-muted-foreground">Draw your concept here, then click "Compare with AI"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Score Display ─────────────────────────────────────────────────────────
function CompareResultPanel({ result, onRetry }: { result: CompareResult; onRetry: () => void }) {
  const gradeClass = GRADE_COLORS[result.grade] || GRADE_COLORS['Needs Work'];
  const scoreColor = SCORE_COLOR(result.score);

  return (
    <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
      {/* Score hero */}
      <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
        <div className="text-center">
          <div className={cn("text-4xl font-bold tabular-nums", scoreColor)}>
            {result.score}
          </div>
          <div className="text-xs text-muted-foreground">/ 100</div>
        </div>
        <div className="flex-1">
          <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold border mb-1", gradeClass)}>
            {result.grade}
          </div>
          <p className="text-sm text-muted-foreground leading-snug">{result.summary}</p>
        </div>
      </div>

      {/* Score bar */}
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
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* Strengths */}
      {result.strengths.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
            <CheckCircle className="h-4 w-4" /> What you got right
          </div>
          <ul className="space-y-1">
            {result.strengths.map((s, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>{s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {result.improvements.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-700">
            <TrendingUp className="h-4 w-4" /> To improve
          </div>
          <ul className="space-y-1">
            {result.improvements.map((s, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />{s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tip */}
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
  );
}

// ─── Main Dialog ───────────────────────────────────────────────────────────
export function ConceptCardViewDialog({ card, onClose }: Props) {
  const [zoom, setZoom] = useState(1);
  const [comparing, setComparing] = useState(false);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [whiteboardKey, setWhiteboardKey] = useState(0); // force re-mount to reset canvas

  if (!card) return null;

  const handleClose = () => {
    setCompareResult(null);
    setWhiteboardKey(k => k + 1);
    onClose();
  };

  const handleCompare = async (userDrawingBase64: string) => {
    if (!card.image_url) {
      toast.error('No reference image to compare against');
      return;
    }
    setComparing(true);
    setCompareResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('compare-concept-drawing', {
        body: {
          userDrawingBase64,
          referenceImageUrl: card.image_url,
          cardTitle: card.title,
        },
      });
      if (error || !data) {
        toast.error(error?.message || 'Comparison failed');
        return;
      }
      if (data.error) {
        toast.error(data.error);
        return;
      }
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
    setWhiteboardKey(k => k + 1);
  };

  return (
    <Dialog open={!!card} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full max-h-[92vh] p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b bg-card flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1 flex-1 min-w-0">
            <h2 className="font-bold text-base sm:text-lg leading-snug">{card.title}</h2>
            {card.description && (
              <p className="text-sm text-muted-foreground">{card.description}</p>
            )}
            <div className="flex flex-wrap gap-1 pt-1">
              {card.audience.map(a => (
                <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
              ))}
              {card.product_type.map(p => (
                <Badge key={p} className="text-xs bg-primary/10 text-primary border-primary/20">{p}</Badge>
              ))}
              {card.tags.map(t => (
                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
              ))}
            </div>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabbed body */}
        <Tabs defaultValue="view" className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="mx-4 mt-3 self-start shrink-0">
            <TabsTrigger value="view" className="text-xs sm:text-sm gap-1.5">
              <Eye className="h-3.5 w-3.5" /> View Drawing
            </TabsTrigger>
            <TabsTrigger value="draw" className="text-xs sm:text-sm gap-1.5">
              <Pencil className="h-3.5 w-3.5" /> Draw & Compare
            </TabsTrigger>
          </TabsList>

          {/* ── VIEW TAB ── */}
          <TabsContent value="view" className="flex flex-col flex-1 overflow-hidden mt-0 p-0">
            <div className="flex-1 overflow-auto bg-muted/20 relative">
              {card.image_url ? (
                <div className="p-4 flex items-center justify-center min-h-[300px]">
                  <img
                    src={card.image_url}
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
            {card.image_url && (
              <div className="flex items-center justify-center gap-2 py-3 border-t bg-card shrink-0">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground ml-2" onClick={() => setZoom(1)}>Reset</Button>
              </div>
            )}
          </TabsContent>

          {/* ── DRAW & COMPARE TAB ── */}
          <TabsContent value="draw" className="flex-1 overflow-hidden mt-0 p-0 flex flex-col">
            {compareResult ? (
              <CompareResultPanel result={compareResult} onRetry={handleRetry} />
            ) : (
              <Whiteboard
                key={whiteboardKey}
                onCompare={handleCompare}
                comparing={comparing}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

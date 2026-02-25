import { StickyNote, Type, MessageSquare, Pen, X, Palette, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

export type AnnotationTool = 'none' | 'sticky' | 'text' | 'comment' | 'drawing';

const STICKY_COLORS = [
  '#fef08a', // yellow
  '#bbf7d0', // green
  '#bfdbfe', // blue
  '#fecaca', // red
  '#e9d5ff', // purple
  '#fed7aa', // orange
  '#f0abfc', // pink
];

const PEN_COLORS = [
  '#1e293b', // dark
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#a855f7', // purple
];

interface AnnotationToolbarProps {
  activeTool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  activeColor: string;
  onColorChange: (color: string) => void;
  penWidth: number;
  onPenWidthChange: (w: number) => void;
  onClose: () => void;
}

export function AnnotationToolbar({
  activeTool,
  onToolChange,
  activeColor,
  onColorChange,
  penWidth,
  onPenWidthChange,
  onClose,
}: AnnotationToolbarProps) {
  const tools: { key: AnnotationTool; icon: React.ReactNode; label: string }[] = [
    { key: 'sticky', icon: <StickyNote className="h-4 w-4" />, label: 'Sticky Note' },
    { key: 'text', icon: <Type className="h-4 w-4" />, label: 'Text Label' },
    { key: 'comment', icon: <MessageSquare className="h-4 w-4" />, label: 'Comment Thread' },
    { key: 'drawing', icon: <Pen className="h-4 w-4" />, label: 'Freehand Draw' },
  ];

  const colors = activeTool === 'drawing' ? PEN_COLORS : STICKY_COLORS;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-background/95 backdrop-blur border border-border rounded-2xl px-3 py-2 shadow-lg">
      {/* Tools */}
      {tools.map(t => (
        <Tooltip key={t.key}>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === t.key ? 'default' : 'ghost'}
              size="sm"
              className={cn('h-8 w-8 p-0 rounded-xl', activeTool === t.key && 'shadow-sm')}
              onClick={() => onToolChange(activeTool === t.key ? 'none' : t.key)}
            >
              {t.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">{t.label}</TooltipContent>
        </Tooltip>
      ))}

      {/* Divider */}
      <div className="w-px h-6 bg-border mx-1" />

      {/* Colors */}
      {(activeTool === 'sticky' || activeTool === 'text' || activeTool === 'comment' || activeTool === 'drawing') && (
        <>
          <Palette className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex gap-1">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => onColorChange(c)}
                className={cn(
                  'w-5 h-5 rounded-full border-2 transition-transform hover:scale-110',
                  activeColor === c ? 'border-foreground scale-110' : 'border-transparent'
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </>
      )}

      {/* Pen width */}
      {activeTool === 'drawing' && (
        <>
          <div className="w-px h-6 bg-border mx-1" />
          <Minus className="h-3 w-3 text-muted-foreground" />
          <Slider
            value={[penWidth]}
            onValueChange={([v]) => onPenWidthChange(v)}
            min={1}
            max={8}
            step={1}
            className="w-20"
          />
          <Plus className="h-3 w-3 text-muted-foreground" />
        </>
      )}

      {/* Divider */}
      <div className="w-px h-6 bg-border mx-1" />

      {/* Close */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Close annotations</TooltipContent>
      </Tooltip>
    </div>
  );
}

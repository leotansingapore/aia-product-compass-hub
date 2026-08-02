import { useEffect, useRef } from 'react';
import { StickyNote, Type, MessageSquare, Pen, X, Palette, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

export type AnnotationTool = 'none' | 'sticky' | 'text' | 'comment' | 'drawing';

const STICKY_COLORS = [
  { value: '#fef08a', name: 'Yellow' },
  { value: '#bbf7d0', name: 'Green' },
  { value: '#bfdbfe', name: 'Blue' },
  { value: '#fecaca', name: 'Red' },
  { value: '#e9d5ff', name: 'Purple' },
  { value: '#fed7aa', name: 'Orange' },
  { value: '#f0abfc', name: 'Pink' },
];

const PEN_COLORS = [
  { value: '#1e293b', name: 'Dark' },
  { value: '#ef4444', name: 'Red' },
  { value: '#3b82f6', name: 'Blue' },
  { value: '#22c55e', name: 'Green' },
  { value: '#f59e0b', name: 'Amber' },
  { value: '#a855f7', name: 'Purple' },
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
  const barRef = useRef<HTMLDivElement>(null);

  // Entering annotate mode unmounts the trigger button, so move focus here or a
  // keyboard user is left on document.body with nothing to tab from.
  useEffect(() => {
    barRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
  }, []);

  // Escape always gets you out — first it disarms the tool, then it closes the bar
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const el = e.target as HTMLElement | null;
      if (el?.closest('input, textarea, [contenteditable="true"]')) return;
      if (activeTool !== 'none') onToolChange('none');
      else onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeTool, onToolChange, onClose]);

  return (
    <div
      ref={barRef}
      role="toolbar"
      data-annotation-toolbar
      aria-label="Annotation tools. Press Escape to exit."
      // z-50 keeps the bar above the annotation layer (z-35 armed, z-40 drawing);
      // below that, arming a tool made every toolbar click drop an annotation instead.
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 bg-background/95 backdrop-blur border border-border rounded-2xl px-3 py-2 shadow-lg"
    >
      {/* Tools */}
      {tools.map(t => (
        <Tooltip key={t.key}>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === t.key ? 'default' : 'ghost'}
              size="sm"
              aria-label={t.label}
              aria-pressed={activeTool === t.key}
              className={cn('h-9 w-9 p-0 rounded-xl', activeTool === t.key && 'shadow-sm')}
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
          <div className="flex gap-1.5" role="radiogroup" aria-label="Annotation colour">
            {colors.map(c => (
              <button
                key={c.value}
                type="button"
                role="radio"
                aria-checked={activeColor === c.value}
                aria-label={c.name}
                title={c.name}
                onClick={() => onColorChange(c.value)}
                className={cn(
                  'w-6 h-6 rounded-full border-2 transition-transform hover:scale-110',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                  activeColor === c.value ? 'border-foreground scale-110' : 'border-transparent'
                )}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </>
      )}

      {/* Pen width */}
      {activeTool === 'drawing' && (
        <>
          <div className="w-px h-6 bg-border mx-1" />
          <div role="group" aria-label="Pen width" className="flex items-center gap-1.5">
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
          </div>
        </>
      )}

      {/* Divider */}
      <div className="w-px h-6 bg-border mx-1" />

      {/* Close */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" aria-label="Close annotations" className="h-9 w-9 p-0 rounded-xl" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Close annotations</TooltipContent>
      </Tooltip>
    </div>
  );
}

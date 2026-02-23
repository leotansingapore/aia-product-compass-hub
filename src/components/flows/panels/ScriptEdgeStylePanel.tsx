import { useState, useEffect } from 'react';
import type { Edge } from 'reactflow';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { NODE_COLOR_PRESETS, getContrastTextColor } from '@/utils/flowColorUtils';
import { cn } from '@/lib/utils';

interface ScriptEdgeStylePanelProps {
  edge: Edge | null;
  onUpdateEdge: (id: string, data: Record<string, any>) => void;
  onDeleteEdge: (id: string) => void;
}

const CONDITION_OPTIONS = [
  { value: '_none', label: 'None', color: '' },
  { value: 'yes', label: 'Yes', color: '#22c55e' },
  { value: 'no', label: 'No', color: '#ef4444' },
  { value: 'no-reply', label: 'No Reply', color: '#f59e0b' },
  { value: 'custom', label: 'Custom', color: '#8b5cf6' },
] as const;

export function ScriptEdgeStylePanel({
  edge,
  onUpdateEdge,
  onDeleteEdge,
}: ScriptEdgeStylePanelProps) {
  const [label, setLabel] = useState('');
  const [condition, setCondition] = useState('_none');
  const [edgeType, setEdgeType] = useState('smoothstep');
  const [lineStyle, setLineStyle] = useState('solid');
  const [animated, setAnimated] = useState(false);
  const [color, setColor] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (edge) {
      setLabel(edge.data?.label || edge.label || '');
      setCondition(edge.data?.condition || '_none');
      setEdgeType(edge.data?.edgeType || 'smoothstep');
      setLineStyle(edge.data?.lineStyle || 'solid');
      setAnimated(!!edge.data?.animated);
      setColor(edge.data?.color || '');
      setConfirmDelete(false);
    }
  }, [edge?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!edge) return null;

  const handleLabelChange = (val: string) => {
    setLabel(val);
    onUpdateEdge(edge.id, { label: val });
  };

  const handleConditionChange = (val: string) => {
    setCondition(val);
    onUpdateEdge(edge.id, { condition: val === '_none' ? undefined : val });
  };

  const handleEdgeTypeChange = (val: string) => {
    setEdgeType(val);
    onUpdateEdge(edge.id, { edgeType: val });
  };

  const handleLineStyleChange = (val: string) => {
    setLineStyle(val);
    onUpdateEdge(edge.id, { lineStyle: val });
  };

  const handleAnimatedChange = (val: boolean) => {
    setAnimated(val);
    onUpdateEdge(edge.id, { animated: val });
  };

  const handleColorChange = (val: string) => {
    setColor(val);
    onUpdateEdge(edge.id, { color: val || undefined });
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDeleteEdge(edge.id);
  };

  return (
    <div
      className={cn(
        'absolute right-2 top-2 w-64 bg-background border rounded-lg shadow-lg p-3 z-20 max-h-[calc(100vh-300px)] overflow-y-auto',
        'animate-in fade-in-0 slide-in-from-right-2 duration-200'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Edit Connection</h3>
        <button
          onClick={() => onUpdateEdge(edge.id, {})}
          className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Label */}
        <div>
          <Label className="text-xs">Label</Label>
          <Input
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="e.g. Yes, No, Day 2"
            className="h-8 text-sm"
          />
        </div>

        {/* Condition type */}
        <div>
          <Label className="text-xs">Condition Type</Label>
          <Select value={condition} onValueChange={handleConditionChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-2">
                    {opt.color && (
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: opt.color }}
                      />
                    )}
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Edge type */}
        <div>
          <Label className="text-xs">Path Type</Label>
          <div className="flex gap-1 mt-1">
            {[
              { value: 'smoothstep', label: 'Smooth' },
              { value: 'bezier', label: 'Bezier' },
              { value: 'straight', label: 'Straight' },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => handleEdgeTypeChange(t.value)}
                className={cn(
                  'flex-1 py-1 text-[10px] rounded border transition-colors',
                  edgeType === t.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 border-border hover:bg-muted'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Line style */}
        <div>
          <Label className="text-xs">Line Style</Label>
          <div className="flex gap-1 mt-1">
            {(['solid', 'dashed', 'dotted'] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleLineStyleChange(s)}
                className={cn(
                  'flex-1 py-1 text-[10px] rounded border transition-colors capitalize',
                  lineStyle === s
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 border-border hover:bg-muted'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Color presets */}
        <div>
          <Label className="text-xs">Color Override</Label>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {NODE_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleColorChange(preset.value)}
                className={cn(
                  'w-5 h-5 rounded-full border-2 transition-all',
                  'hover:scale-110 focus:outline-none',
                  color === preset.value
                    ? 'border-foreground scale-110'
                    : 'border-border'
                )}
                style={{ backgroundColor: preset.value || 'hsl(var(--muted))' }}
                title={preset.label}
              >
                {color === preset.value && (
                  <span
                    className="flex items-center justify-center text-[8px] font-bold"
                    style={{ color: preset.value ? getContrastTextColor(preset.value) : 'hsl(var(--foreground))' }}
                  >
                    &#10003;
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Animated */}
        <div className="flex items-center justify-between">
          <Label className="text-xs">Animated</Label>
          <Switch checked={animated} onCheckedChange={handleAnimatedChange} />
        </div>

        {/* Delete */}
        <Button
          variant={confirmDelete ? 'destructive' : 'outline'}
          size="sm"
          className={cn(
            'w-full justify-start gap-2 text-xs',
            !confirmDelete && 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
          )}
          onClick={handleDelete}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {confirmDelete ? 'Click again to confirm' : 'Delete Connection'}
        </Button>
      </div>
    </div>
  );
}

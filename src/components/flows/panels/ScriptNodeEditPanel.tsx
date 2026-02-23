import { useState, useEffect } from 'react';
import type { Node } from 'reactflow';
import { X, Expand, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NODE_COLOR_PRESETS, getContrastTextColor } from '@/utils/flowColorUtils';
import { cn } from '@/lib/utils';

interface ScriptNodeEditPanelProps {
  node: Node | null;
  scripts: { id: string; stage: string }[];
  onUpdateNode: (id: string, data: Record<string, any>) => void;
  onDeleteNode: (id: string) => void;
  onOpenFullEditor: (nodeId: string) => void;
}

export function ScriptNodeEditPanel({
  node,
  scripts,
  onUpdateNode,
  onDeleteNode,
  onOpenFullEditor,
}: ScriptNodeEditPanelProps) {
  const [label, setLabel] = useState('');
  const [scriptId, setScriptId] = useState('');
  const [color, setColor] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync local state when the selected node changes
  useEffect(() => {
    if (node) {
      setLabel(node.data?.label || '');
      setScriptId(node.data?.scriptId || '');
      setColor(node.data?.color || '');
      setConfirmDelete(false);
    }
  }, [node?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!node) return null;

  const nodeType = node.data?.type || node.type;
  const showScriptLink = nodeType === 'script' || nodeType === 'action';

  const handleLabelChange = (val: string) => {
    setLabel(val);
    onUpdateNode(node.id, { label: val });
  };

  const handleScriptChange = (val: string) => {
    const resolved = val === '_none' ? '' : val;
    setScriptId(resolved);
    onUpdateNode(node.id, { scriptId: resolved || null });
  };

  const handleColorChange = (val: string) => {
    setColor(val);
    onUpdateNode(node.id, { color: val });
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDeleteNode(node.id);
  };

  return (
    <div
      className={cn(
        'absolute right-2 top-2 w-64 bg-background border rounded-lg shadow-lg p-3 z-20',
        'animate-in fade-in-0 slide-in-from-right-2 duration-200'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Edit Node</h3>
        <button
          onClick={() => onUpdateNode(node.id, {})}
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
            placeholder="Node label"
            className="h-8 text-sm"
          />
        </div>

        {/* Script link */}
        {showScriptLink && (
          <div>
            <Label className="text-xs">Link to Script</Label>
            <Select
              value={scriptId || '_none'}
              onValueChange={handleScriptChange}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select a script..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="_none">-- None --</SelectItem>
                {scripts.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Color picker */}
        <div>
          <Label className="text-xs">Color</Label>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {NODE_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleColorChange(preset.value)}
                className={cn(
                  'w-6 h-6 rounded-full border-2 transition-all',
                  'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
                  color === preset.value
                    ? 'border-foreground ring-1 ring-foreground/30 scale-110'
                    : 'border-border'
                )}
                style={{
                  backgroundColor: preset.value || 'hsl(var(--muted))',
                }}
                title={preset.label}
                aria-label={`Set color to ${preset.label}`}
              >
                {color === preset.value && (
                  <span
                    className="flex items-center justify-center text-[10px] font-bold"
                    style={{
                      color: preset.value
                        ? getContrastTextColor(preset.value)
                        : 'hsl(var(--foreground))',
                    }}
                  >
                    &#10003;
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Full editor button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-xs"
          onClick={() => onOpenFullEditor(node.id)}
        >
          <Expand className="w-3.5 h-3.5" />
          Full Editor
        </Button>

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
          {confirmDelete ? 'Click again to confirm' : 'Delete Node'}
        </Button>
      </div>
    </div>
  );
}

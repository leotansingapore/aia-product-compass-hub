import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Node } from 'reactflow';
import { X, Expand, Trash2, ChevronDown, RotateCcw, FileText, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { NODE_COLOR_PRESETS, getContrastTextColor } from '@/utils/flowColorUtils';
import { cn } from '@/lib/utils';
import type { ScriptEntry } from '@/hooks/useScripts';

interface ScriptNodeEditPanelProps {
  node: Node | null;
  scripts: ScriptEntry[];
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
  const navigate = useNavigate();
  const [label, setLabel] = useState('');
  const [scriptId, setScriptId] = useState('');
  const [color, setColor] = useState('');
  const [borderStyle, setBorderStyle] = useState<string>('solid');
  const [fontSize, setFontSize] = useState(14);
  const [opacity, setOpacity] = useState(1);
  const [shadow, setShadow] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ basic: true, colors: false, style: false });
  const [expandedVersion, setExpandedVersion] = useState<number>(0);
  const [scriptSearch, setScriptSearch] = useState('');

  useEffect(() => {
    if (node) {
      setLabel(node.data?.label || '');
      setScriptId(node.data?.scriptId || '');
      setColor(node.data?.color || '');
      setBorderStyle(node.data?.borderStyle || 'solid');
      setFontSize(node.data?.fontSize || 14);
      setOpacity(node.data?.opacity ?? 1);
      setShadow(node.data?.shadow !== false);
      setConfirmDelete(false);
      setExpandedVersion(0);
    }
  }, [node?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!node) return null;

  const nodeType = node.data?.nodeType || node.type;
  const showScriptLink = ['script', 'action', 'hexagon', 'parallelogram', 'cylinder', 'document'].includes(nodeType);
  const filteredScripts = scriptSearch.trim()
    ? scripts.filter(s => s.stage.toLowerCase().includes(scriptSearch.toLowerCase()) || s.category.toLowerCase().includes(scriptSearch.toLowerCase()))
    : scripts;
  const linkedScript = scriptId ? scripts.find(s => s.id === scriptId) : null;

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLabelChange = (val: string) => {
    setLabel(val);
    onUpdateNode(node.id, { label: val });
  };

  const handleScriptChange = (val: string) => {
    const resolved = val === '_none' ? '' : val;
    setScriptId(resolved);
    setExpandedVersion(0);
    // Also store the script name on the node for display
    const selected = scripts.find(s => s.id === resolved);
    onUpdateNode(node.id, { scriptId: resolved || null, scriptName: selected?.stage || null });
  };

  const handleColorChange = (val: string) => {
    setColor(val);
    onUpdateNode(node.id, { color: val });
  };

  const handleBorderStyleChange = (val: string) => {
    setBorderStyle(val);
    onUpdateNode(node.id, { borderStyle: val });
  };

  const handleFontSizeChange = (val: number[]) => {
    const v = val[0];
    setFontSize(v);
    onUpdateNode(node.id, { fontSize: v });
  };

  const handleOpacityChange = (val: number[]) => {
    const v = val[0];
    setOpacity(v);
    onUpdateNode(node.id, { opacity: v });
  };

  const handleShadowChange = (val: boolean) => {
    setShadow(val);
    onUpdateNode(node.id, { shadow: val });
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
        'absolute right-2 top-2 w-72 bg-background border rounded-lg shadow-lg z-20 max-h-[calc(100vh-200px)] overflow-y-auto',
        'animate-in fade-in-0 slide-in-from-right-2 duration-200'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 pb-0">
        <h3 className="text-sm font-semibold text-foreground">Edit Node</h3>
        <button
          onClick={() => onUpdateNode(node.id, {})}
          className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 space-y-1">
        {/* Section: Basic */}
        <button
          onClick={() => toggleSection('basic')}
          className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground uppercase tracking-wider py-1"
        >
          Basic
          <ChevronDown className={cn('w-3 h-3 transition-transform', !openSections.basic && '-rotate-90')} />
        </button>
        {openSections.basic && (
          <div className="space-y-3 pb-2">
            <div>
              <Label className="text-xs">Label</Label>
              <Input
                value={label}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="Node label"
                className="h-8 text-sm"
              />
            </div>

            {showScriptLink && (
              <div className="space-y-2">
                <Label className="text-xs">Link to Script</Label>
                <Select value={scriptId || '_none'} onValueChange={(val) => { handleScriptChange(val); setScriptSearch(''); }}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select a script..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <div className="sticky top-0 px-1 pb-1 bg-popover z-10">
                      <Input
                        value={scriptSearch}
                        onChange={(e) => setScriptSearch(e.target.value)}
                        placeholder="Search scripts..."
                        className="h-7 text-xs"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    <SelectItem value="_none">-- None --</SelectItem>
                    {filteredScripts.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="truncate">{s.stage}</span>
                        <span className="text-[9px] text-muted-foreground ml-1">({s.category})</span>
                      </SelectItem>
                    ))}
                    {filteredScripts.length === 0 && scriptSearch && (
                      <p className="text-xs text-muted-foreground text-center py-2">No scripts match</p>
                    )}
                  </SelectContent>
                </Select>

                {/* Inline script preview — shows automatically when a script is linked */}
                {linkedScript && (
                  <div className="rounded-md border border-primary/20 bg-muted/30 overflow-hidden">
                    {/* Script meta */}
                    <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-border/40 bg-primary/5">
                      <FileText className="h-3 w-3 text-primary shrink-0" />
                      <span className="text-xs font-medium text-foreground truncate flex-1">{linkedScript.stage}</span>
                      <button
                        onClick={() => navigate(`/scripts/${scriptId}`)}
                        className="text-primary hover:text-primary/80 shrink-0 p-0.5 rounded hover:bg-primary/10 transition-colors"
                        title="Open full script page"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </button>
                      <Badge variant="secondary" className="text-[9px] shrink-0 px-1">{linkedScript.category}</Badge>
                    </div>

                    {/* Versions */}
                    {linkedScript.versions.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground italic px-2.5 py-2">No content yet.</p>
                    ) : (
                      <div>
                        {(linkedScript.versions as Array<{ author: string; content: string }>).map((version, i) => (
                          <div key={i} className="border-b border-border/30 last:border-0">
                            <button
                              onClick={() => setExpandedVersion(expandedVersion === i ? -1 : i)}
                              className="flex items-center justify-between w-full px-2.5 py-1.5 text-left hover:bg-muted/50 transition-colors"
                            >
                              <span className="text-[11px] font-medium text-foreground">
                                {version.author || `Version ${i + 1}`}
                              </span>
                              <ChevronRight className={cn(
                                'h-3 w-3 text-muted-foreground transition-transform shrink-0',
                                expandedVersion === i && 'rotate-90'
                              )} />
                            </button>
                            {expandedVersion === i && (
                              <ScrollArea className="max-h-[220px]">
                                <div className="px-2.5 pb-2.5 text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
                                  {version.content || <em>No content.</em>}
                                </div>
                              </ScrollArea>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs"
              onClick={() => onOpenFullEditor(node.id)}
            >
              <Expand className="w-3.5 h-3.5" />
              Full Editor
            </Button>
          </div>
        )}

        {/* Section: Colors */}
        <button
          onClick={() => toggleSection('colors')}
          className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground uppercase tracking-wider py-1"
        >
          Colors
          <ChevronDown className={cn('w-3 h-3 transition-transform', !openSections.colors && '-rotate-90')} />
        </button>
        {openSections.colors && (
          <div className="space-y-2 pb-2">
            <div className="flex flex-wrap gap-1.5">
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
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 h-7"
              onClick={() => handleColorChange('')}
            >
              <RotateCcw className="w-3 h-3" /> Reset to default
            </Button>
          </div>
        )}

        {/* Section: Style */}
        <button
          onClick={() => toggleSection('style')}
          className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground uppercase tracking-wider py-1"
        >
          Style
          <ChevronDown className={cn('w-3 h-3 transition-transform', !openSections.style && '-rotate-90')} />
        </button>
        {openSections.style && (
          <div className="space-y-3 pb-2">
            {/* Border style */}
            <div>
              <Label className="text-xs">Border</Label>
              <div className="flex gap-1 mt-1">
                {(['solid', 'dashed', 'dotted'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleBorderStyleChange(s)}
                    className={cn(
                      'flex-1 py-1 text-[10px] rounded border transition-colors capitalize',
                      borderStyle === s
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/50 border-border hover:bg-muted'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Font size */}
            <div>
              <Label className="text-xs">Font Size: {fontSize}px</Label>
              <Slider
                value={[fontSize]}
                onValueChange={handleFontSizeChange}
                min={10}
                max={24}
                step={1}
                className="mt-1"
              />
            </div>

            {/* Opacity */}
            <div>
              <Label className="text-xs">Opacity: {Math.round(opacity * 100)}%</Label>
              <Slider
                value={[opacity]}
                onValueChange={handleOpacityChange}
                min={0.3}
                max={1}
                step={0.05}
                className="mt-1"
              />
            </div>

            {/* Shadow */}
            <div className="flex items-center justify-between">
              <Label className="text-xs">Drop Shadow</Label>
              <Switch checked={shadow} onCheckedChange={handleShadowChange} />
            </div>
          </div>
        )}

        {/* Delete */}
        <Button
          variant={confirmDelete ? 'destructive' : 'outline'}
          size="sm"
          className={cn(
            'w-full justify-start gap-2 text-xs mt-2',
            !confirmDelete && 'text-destructive hover:text-destructive hover:bg-destructive/10'
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

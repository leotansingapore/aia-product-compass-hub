import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MinimalRichEditor } from '@/components/MinimalRichEditor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, Search, X, Check, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlowNode } from '@/hooks/useScriptFlows';
import type { ScriptEntry } from '@/hooks/useScripts';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (node: Partial<FlowNode>) => void;
  node: FlowNode | null;
  scripts: ScriptEntry[];
}

interface AISuggestion {
  script_id: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  low: 'bg-muted text-muted-foreground border-border',
};

export function NodeEditorDialog({ open, onClose, onSave, node, scripts }: Props) {
  const [label, setLabel] = useState(node?.label || '');
  const [type, setType] = useState<FlowNode['type']>(node?.type || 'script');
  const [scriptId, setScriptId] = useState(node?.scriptId || '');
  const [customText, setCustomText] = useState(node?.customText || '');

  const [scriptTab, setScriptTab] = useState<'search' | 'ai'>('search');
  const [search, setSearch] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);

  // Reset when node changes
  const [prevNode, setPrevNode] = useState(node);
  if (node !== prevNode) {
    setPrevNode(node);
    setLabel(node?.label || '');
    setType(node?.type || 'script');
    setScriptId(node?.scriptId || '');
    setCustomText(node?.customText || '');
    setSearch('');
    setAiSuggestions([]);
    setAiError('');
    setPreviewId(null);
  }

  // Filtered scripts based on search
  const filteredScripts = useMemo(() => {
    if (!search.trim()) return scripts;
    const q = search.toLowerCase();
    return scripts.filter(s =>
      s.stage.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      (s.target_audience || '').toLowerCase().includes(q) ||
      (s.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }, [scripts, search]);

  const selectedScript = scripts.find(s => s.id === scriptId);
  const previewScript = previewId ? scripts.find(s => s.id === previewId) : null;

  const getAISuggestions = async () => {
    if (!label.trim() || scripts.length === 0) return;
    setAiLoading(true);
    setAiError('');
    setAiSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-node-script', {
        body: {
          nodeLabel: label,
          nodeType: type,
          flowContext: 'financial advisory sales sequence',
          availableScripts: scripts.map(s => ({
            id: s.id,
            stage: s.stage,
            category: s.category,
            target_audience: s.target_audience,
            tags: s.tags,
          })),
        },
      });
      if (error) throw error;
      if (data?.error) {
        setAiError(data.error);
        toast.error(data.error);
        return;
      }
      setAiSuggestions(data?.suggestions || []);
    } catch (e: any) {
      const msg = e.message || 'Failed to get AI suggestions';
      setAiError(msg);
      toast.error(msg);
    } finally {
      setAiLoading(false);
    }
  };

  // Auto-fetch AI suggestions when switching to AI tab (intentionally only on tab switch)
  useEffect(() => {
    if (scriptTab === 'ai' && aiSuggestions.length === 0 && !aiLoading && label.trim()) {
      getAISuggestions();
    }
  }, [scriptTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectScript = (id: string) => {
    setScriptId(id === scriptId ? '' : id);
    setPreviewId(null);
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-3 border-b shrink-0">
          <DialogTitle>{node ? 'Edit Node' : 'Add Node'}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Label + Type row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Label</Label>
              <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="Node label" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Type</Label>
              <Select value={type} onValueChange={v => setType(v as FlowNode['type'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="start">🟢 Start</SelectItem>
                  <SelectItem value="script">📄 Script</SelectItem>
                  <SelectItem value="decision">🔀 Decision</SelectItem>
                  <SelectItem value="action">⏳ Action / Wait</SelectItem>
                  <SelectItem value="end">🔴 End</SelectItem>
                  <SelectItem value="hexagon">⬡ Hexagon</SelectItem>
                  <SelectItem value="parallelogram">▱ Input/Output</SelectItem>
                  <SelectItem value="cylinder">🛢 Storage</SelectItem>
                  <SelectItem value="document">📋 Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Script linker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Link to Script</Label>
              {selectedScript && (
                <button
                  onClick={() => setScriptId('')}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            {/* Selected script pill */}
            {selectedScript && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{selectedScript.stage}</p>
                  <p className="text-xs text-muted-foreground">{selectedScript.category}</p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex rounded-lg border bg-muted/30 p-1 gap-1">
              <button
                onClick={() => setScriptTab('search')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
                  scriptTab === 'search' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Search className="h-3.5 w-3.5" /> Browse
              </button>
              <button
                onClick={() => setScriptTab('ai')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
                  scriptTab === 'ai' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sparkles className="h-3.5 w-3.5" /> AI Suggest
              </button>
            </div>

            {/* Browse tab */}
            {scriptTab === 'search' && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, category, audience, tag..."
                    className="pl-8 h-8 text-xs"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <ScrollArea className="h-[180px] rounded-lg border">
                  <div className="p-1">
                    <button
                      onClick={() => selectScript('')}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-xs transition-colors",
                        !scriptId ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      — No linked script —
                    </button>
                    {filteredScripts.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No scripts match</p>
                    ) : filteredScripts.map(s => (
                      <ScriptPickerRow
                        key={s.id}
                        script={s}
                        selected={scriptId === s.id}
                        previewing={previewId === s.id}
                        onSelect={() => selectScript(s.id)}
                        onPreview={() => setPreviewId(previewId === s.id ? null : s.id)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* AI Suggest tab */}
            {scriptTab === 'ai' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Suggestions based on <span className="font-medium text-foreground">"{label || 'this node'}"</span>
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs gap-1.5"
                    onClick={getAISuggestions}
                    disabled={aiLoading || !label.trim()}
                  >
                    {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    {aiLoading ? 'Thinking...' : 'Refresh'}
                  </Button>
                </div>

                {aiLoading && (
                  <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-xs">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    AI is analysing your node context...
                  </div>
                )}

                {aiError && !aiLoading && (
                  <div className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{aiError}</div>
                )}

                {!aiLoading && aiSuggestions.length > 0 && (
                  <ScrollArea className="h-[180px] rounded-lg border">
                    <div className="p-1 space-y-1">
                      {aiSuggestions.map((sug) => {
                        const script = scripts.find(s => s.id === sug.script_id);
                        if (!script) return null;
                        return (
                          <div
                            key={sug.script_id}
                            className={cn(
                              "group flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all border",
                              scriptId === sug.script_id
                                ? "bg-primary/10 border-primary/30"
                                : "hover:bg-muted/50 border-transparent hover:border-border"
                            )}
                            onClick={() => selectScript(sug.script_id)}
                          >
                            <div className="shrink-0 mt-0.5">
                              {scriptId === sug.script_id ? (
                                <Check className="h-4 w-4 text-primary" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary/50 transition-colors" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-medium truncate">{script.stage}</span>
                                <Badge
                                  variant="outline"
                                  className={cn("text-[9px] px-1.5 py-0 h-4 border", CONFIDENCE_COLORS[sug.confidence])}
                                >
                                  {sug.confidence}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-relaxed">{sug.reason}</p>
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-muted-foreground/60 bg-muted px-1.5 rounded">
                                  {script.category}
                                </span>
                                {script.target_audience && script.target_audience !== 'general' && (
                                  <span className="text-[9px] text-muted-foreground/60 bg-muted px-1.5 rounded">
                                    {script.target_audience}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}

                {!aiLoading && !aiError && aiSuggestions.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                    <Sparkles className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground">Click Refresh to get AI suggestions</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Script preview inline */}
          {previewScript && scriptTab === 'search' && (
            <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">{previewScript.stage}</p>
                <button onClick={() => setPreviewId(null)}>
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
              <ScrollArea className="max-h-28">
                <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {(previewScript.versions?.[0] as any)?.content?.slice(0, 400) || 'No content preview available.'}
                  {((previewScript.versions?.[0] as any)?.content?.length || 0) > 400 ? '…' : ''}
                </p>
              </ScrollArea>
              <Button size="sm" className="w-full h-7 text-xs" onClick={() => selectScript(previewScript.id)}>
                {scriptId === previewScript.id ? '✓ Selected' : 'Use this script'}
              </Button>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Notes / Custom Text</Label>
            <div className="border rounded-md overflow-hidden">
              <MinimalRichEditor
                value={customText}
                onChange={setCustomText}
                placeholder="Add formatted notes, tips, or talking points..."
                showToolbar={true}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => { onSave({ label, type, scriptId: scriptId || null, customText }); onClose(); }}
            disabled={!label.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ScriptPickerRow({
  script,
  selected,
  previewing,
  onSelect,
  onPreview,
}: {
  script: ScriptEntry;
  selected: boolean;
  previewing: boolean;
  onSelect: () => void;
  onPreview: () => void;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all",
        selected ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
      )}
    >
      <div className="flex-1 min-w-0" onClick={onSelect}>
        <p className="text-xs font-medium truncate">{script.stage}</p>
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          <span className="text-[9px] text-muted-foreground bg-muted px-1.5 rounded">{script.category}</span>
          {script.target_audience && script.target_audience !== 'general' && (
            <span className="text-[9px] text-muted-foreground bg-muted px-1.5 rounded">{script.target_audience}</span>
          )}
          {(script.tags || []).slice(0, 2).map(t => (
            <span key={t} className="text-[9px] text-muted-foreground bg-muted px-1.5 rounded">{t}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onPreview}
          className={cn(
            "hidden group-hover:flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors",
            previewing && "flex text-primary"
          )}
        >
          <ChevronRight className="h-3 w-3" />
        </button>
        {selected && <Check className="h-4 w-4 text-primary" />}
      </div>
    </div>
  );
}

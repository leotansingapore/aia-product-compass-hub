import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, ChevronDown, Trash2, Loader2, GripVertical, Copy, Check, Plus, Sparkles, Pencil } from "lucide-react";
import { usePlaybooks, usePlaybookItems } from "@/hooks/usePlaybooks";
import { useScripts } from "@/hooks/useScripts";
import { useScriptsMutations } from "@/hooks/useScripts";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { MinimalRichEditor } from "@/components/MinimalRichEditor";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markdownComponents } from "@/lib/markdown-config";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1 text-xs"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

interface SortableScriptCardProps {
  item: any;
  index: number;
  isOwner: boolean;
  onRemove: (id: string) => void;
  onInlineSave: (scriptId: string, versions: any[]) => Promise<void>;
  isAuthenticated: boolean;
}

function SortableScriptCard({ item, index, isOwner, onRemove, onInlineSave, isAuthenticated }: SortableScriptCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const [editingVersionIdx, setEditingVersionIdx] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  const startInlineEdit = (versionIdx: number) => {
    setEditingVersionIdx(versionIdx);
    setEditContent(item.script?.versions?.[versionIdx]?.content || "");
  };

  const cancelInlineEdit = () => {
    setEditingVersionIdx(null);
    setEditContent("");
  };

  const saveInlineEdit = async () => {
    if (editingVersionIdx === null) return;
    setIsSaving(true);
    const updatedVersions = item.script.versions.map((v: any, i: number) =>
      i === editingVersionIdx ? { ...v, content: editContent } : v
    );
    await onInlineSave(item.script_id, updatedVersions);
    setEditingVersionIdx(null);
    setEditContent("");
    setIsSaving(false);
  };

  return (
    <Card ref={setNodeRef} style={style} className={isDragging ? "shadow-lg ring-2 ring-primary/30" : ""}>
      <Collapsible>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 px-3 sm:px-6">
            <div className="flex items-start gap-2 sm:gap-3">
              {isOwner && (
                <button
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground p-1 -ml-1 mt-0.5"
                  onClick={e => e.stopPropagation()}
                >
                  <GripVertical className="h-4 w-4" />
                </button>
              )}
              <span className="text-xs text-muted-foreground font-mono w-5 text-center mt-0.5 shrink-0">{index + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-medium leading-snug">
                    {item.script?.stage}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    {isAuthenticated && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); startInlineEdit(0); }} title="Edit script">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                </div>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">{item.script?.category}</Badge>
                  {item.script?.target_audience && item.script.target_audience !== 'general' && (
                    <Badge variant="outline" className="text-[10px]">{item.script.target_audience}</Badge>
                  )}
                </div>
                {isOwner && (
                  <div className="mt-2" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-destructive hover:text-destructive" onClick={() => onRemove(item.id)}>
                      <Trash2 className="h-3 w-3" /> Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-3 sm:px-6">
            {item.script?.versions?.map((version: any, vi: number) => (
              <div key={vi} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">{version.author || `Version ${vi + 1}`}</Badge>
                  <div className="flex items-center gap-1">
                    {isAuthenticated && editingVersionIdx !== vi && (
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => startInlineEdit(vi)}>
                        <Pencil className="h-3 w-3" /> Edit
                      </Button>
                    )}
                    <CopyButton text={version.content || ""} />
                  </div>
                </div>
                {editingVersionIdx === vi ? (
                  <div className="space-y-2">
                    <div className="border rounded-lg overflow-hidden">
                      <MinimalRichEditor
                        value={editContent}
                        onChange={setEditContent}
                        onSave={saveInlineEdit}
                        onCancel={cancelInlineEdit}
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={cancelInlineEdit} disabled={isSaving}>Cancel</Button>
                      <Button size="sm" onClick={saveInlineEdit} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 rounded-lg p-3 sm:p-4 overflow-x-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                      {version.content || ""}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
export default function PlaybookDetail() {
  const { playbookId } = useParams();
  const navigate = useNavigate();
  const { user } = useSimplifiedAuth();
  const { playbooks } = usePlaybooks();
  const { items, isLoading, removeItem, reorderItems } = usePlaybookItems(playbookId || null);
  const { scripts, loading: scriptsLoading, refetch } = useScripts();
  const { updateScript } = useScriptsMutations();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<{ script_id: string; reason: string; suggested_position: string }[] | null>(null);
  const [aiSummary, setAiSummary] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const playbook = playbooks.find(p => p.id === playbookId);
  const isOwner = user?.id === playbook?.created_by;

  const itemsWithScripts = useMemo(() => {
    return items.map(item => ({
      ...item,
      script: scripts.find(s => s.id === item.script_id),
    })).filter(item => item.script);
  }, [items, scripts]);

  const availableScripts = useMemo(() => {
    const usedIds = new Set(items.map(i => i.script_id));
    let filtered = scripts.filter(s => !usedIds.has(s.id));
    if (addSearch.trim()) {
      const q = addSearch.toLowerCase();
      filtered = filtered.filter(s => s.stage.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }
    return filtered;
  }, [scripts, items, addSearch]);

  const { addItem } = usePlaybookItems(playbookId || null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = itemsWithScripts.findIndex(i => i.id === active.id);
    const newIndex = itemsWithScripts.findIndex(i => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...itemsWithScripts];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const updates = reordered.map((item, i) => ({ id: item.id, sort_order: i }));
    reorderItems.mutate(updates);
  };

  const handleInlineSave = useCallback(async (scriptId: string, versions: any[]) => {
    // Save version history snapshot before updating
    const currentScript = scripts.find(s => s.id === scriptId);
    if (currentScript && user) {
      try {
        await supabase
          .from('script_version_history' as any)
          .insert({
            script_id: scriptId,
            versions: JSON.parse(JSON.stringify(currentScript.versions)),
            edited_by: user.id,
            editor_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Unknown',
          } as any);
      } catch (e) {
        console.error('Failed to save version history:', e);
      }
    }
    await updateScript(scriptId, { versions });
    refetch();
  }, [updateScript, refetch, scripts, user]);


    const usedIds = new Set(items.map(i => i.script_id));
    const available = scripts.filter(s => !usedIds.has(s.id));
    if (available.length === 0) {
      toast.info("All scripts are already in this playbook");
      return;
    }

    setIsAiLoading(true);
    setAiSuggestions(null);
    setAiSummary("");
    try {
      const existingScripts = itemsWithScripts.map(i => ({
        stage: i.script?.stage,
        category: i.script?.category,
        target_audience: i.script?.target_audience,
      }));
      const availableScripts = available.map(s => ({
        id: s.id,
        stage: s.stage,
        category: s.category,
        target_audience: s.target_audience,
        tags: s.tags,
      }));

      const { data, error } = await supabase.functions.invoke("suggest-playbook-scripts", {
        body: {
          playbookTitle: playbook?.title,
          playbookDescription: playbook?.description,
          existingScripts,
          availableScripts,
        },
      });

      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }

      setAiSuggestions(data.suggestions || []);
      setAiSummary(data.summary || "");
    } catch (err: any) {
      console.error("AI suggestion error:", err);
      toast.error(err.message || "Failed to get AI suggestions");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!playbook && !isLoading) {
    return (
      <PageLayout title="Playbook Not Found" description="The requested playbook was not found">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-12 text-center">
          <h2 className="text-xl font-semibold mb-2">Playbook not found</h2>
          <Button variant="outline" onClick={() => navigate("/playbooks")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Playbooks
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={playbook?.title || "Playbook"} description={playbook?.description || "Script playbook detail"}>
      <div className="px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 pt-4 sm:pt-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate("/playbooks")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold leading-snug">{playbook?.title}</h1>
              {playbook?.description && (
                <p className="text-muted-foreground text-sm mt-1">{playbook.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                By {playbook?.creator_name} · {items.length} script{items.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {isOwner && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={handleAISuggest} disabled={isAiLoading} className="gap-1.5 flex-1 sm:flex-initial">
                {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                AI Suggest
              </Button>
              <Button onClick={() => setAddDialogOpen(true)} className="gap-2 flex-1 sm:flex-initial">
                <Plus className="h-4 w-4" /> Add Scripts
              </Button>
            </div>
          )}
        </div>

        {/* AI Suggestions Panel */}
        {(aiSuggestions || isAiLoading) && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Suggestions
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setAiSuggestions(null); setAiSummary(""); }}>
                  Dismiss
                </Button>
              </div>
              {aiSummary && <p className="text-xs text-muted-foreground mt-1">{aiSummary}</p>}
            </CardHeader>
            <CardContent className="pt-0">
              {isAiLoading ? (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing your playbook and finding the best scripts...
                </div>
              ) : aiSuggestions && aiSuggestions.length > 0 ? (
                <div className="space-y-2">
                  {aiSuggestions.map((suggestion, i) => {
                    const script = scripts.find(s => s.id === suggestion.script_id);
                    if (!script) return null;
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-background">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{script.stage}</p>
                          <div className="flex gap-1.5 mt-1 flex-wrap">
                            <Badge variant="secondary" className="text-[10px]">{script.category}</Badge>
                            <Badge variant="outline" className="text-[10px]">{suggestion.suggested_position}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5">{suggestion.reason}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0 gap-1"
                          onClick={() => {
                            addItem.mutate({ scriptId: suggestion.script_id });
                            setAiSuggestions(prev => prev?.filter(s => s.script_id !== suggestion.script_id) || null);
                          }}
                        >
                          <Plus className="h-3 w-3" /> Add
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-2">No additional scripts suggested for this playbook.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Scripts List */}
        {isLoading || scriptsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : itemsWithScripts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No scripts in this playbook yet.</p>
              {isOwner && (
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Scripts
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={itemsWithScripts.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {itemsWithScripts.map((item, index) => (
                  <SortableScriptCard
                    key={item.id}
                    item={item}
                    index={index}
                    isOwner={isOwner}
                    onRemove={(id) => removeItem.mutate(id)}
                    onInlineSave={handleInlineSave}
                    isAuthenticated={!!user}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add Scripts Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] mx-2 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Add Scripts to Playbook</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search scripts..."
            value={addSearch}
            onChange={e => setAddSearch(e.target.value)}
            className="mb-3"
          />
          <div className="overflow-y-auto max-h-[50vh] space-y-2">
            {availableScripts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {addSearch ? "No matching scripts found" : "All scripts are already in this playbook"}
              </p>
            ) : (
              availableScripts.map(script => (
                <div key={script.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{script.stage}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="secondary" className="text-[10px]">{script.category}</Badge>
                      {script.target_audience && script.target_audience !== 'general' && (
                        <Badge variant="outline" className="text-[10px]">{script.target_audience}</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2 shrink-0"
                    onClick={() => addItem.mutate({ scriptId: script.id })}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

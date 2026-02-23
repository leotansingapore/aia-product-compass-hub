import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, ChevronDown, ChevronUp, Trash2, Loader2, GripVertical, Copy, Check, Plus } from "lucide-react";
import { usePlaybooks, usePlaybookItems } from "@/hooks/usePlaybooks";
import { useScripts } from "@/hooks/useScripts";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markdownComponents } from "@/lib/markdown-config";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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

export default function PlaybookDetail() {
  const { playbookId } = useParams();
  const navigate = useNavigate();
  const { user } = useSimplifiedAuth();
  const { playbooks } = usePlaybooks();
  const { items, isLoading, removeItem, reorderItems } = usePlaybookItems(playbookId || null);
  const { scripts, loading: scriptsLoading } = useScripts();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addSearch, setAddSearch] = useState("");

  const playbook = playbooks.find(p => p.id === playbookId);
  const isOwner = user?.id === playbook?.created_by;

  // Map script data to items
  const itemsWithScripts = useMemo(() => {
    return items.map(item => ({
      ...item,
      script: scripts.find(s => s.id === item.script_id),
    })).filter(item => item.script);
  }, [items, scripts]);

  // Scripts not yet in playbook for the add dialog
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

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...itemsWithScripts];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newItems.length) return;
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
    const reordered = newItems.map((item, i) => ({ id: item.id, sort_order: i }));
    reorderItems.mutate(reordered);
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
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pt-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/playbooks")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{playbook?.title}</h1>
            {playbook?.description && (
              <p className="text-muted-foreground mt-1">{playbook.description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              By {playbook?.creator_name} · {items.length} script{items.length !== 1 ? 's' : ''}
            </p>
          </div>
          {isOwner && (
            <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add Scripts
            </Button>
          )}
        </div>

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
          <div className="space-y-3">
            {itemsWithScripts.map((item, index) => (
              <Card key={item.id}>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground font-mono w-6 text-center">{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium truncate">
                            {item.script?.stage}
                          </CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-[10px]">{item.script?.category}</Badge>
                            {item.script?.target_audience && item.script.target_audience !== 'general' && (
                              <Badge variant="outline" className="text-[10px]">{item.script.target_audience}</Badge>
                            )}
                          </div>
                        </div>
                        {isOwner && (
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} onClick={() => moveItem(index, 'up')}>
                              <ChevronUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === itemsWithScripts.length - 1} onClick={() => moveItem(index, 'down')}>
                              <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem.mutate(item.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4">
                      {item.script?.versions?.map((version: any, vi: number) => (
                        <div key={vi} className="mb-4 last:mb-0">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-xs">{version.author || `Version ${vi + 1}`}</Badge>
                            <CopyButton text={version.content || ""} />
                          </div>
                          <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 rounded-lg p-4">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                              {version.content || ""}
                            </ReactMarkdown>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Scripts Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh]">
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
                <div key={script.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
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

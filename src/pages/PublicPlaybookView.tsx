import { useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Loader2, BookOpen, MessageSquare, Copy, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markdownComponents } from "@/lib/markdown-config";
import { toast } from "sonner";

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

function InlineEditor({ initialValue, onSave, onCancel }: { initialValue: string; onSave: (val: string) => Promise<void>; onCancel: () => void }) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(value);
    setSaving(false);
  };

  return (
    <div className="space-y-2">
      <textarea
        className="w-full min-h-[200px] p-3 rounded-lg border bg-background text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
      />
      <div className="flex items-center gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
          Save
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground">Edits are saved to this playbook only — they don't affect the original script.</p>
    </div>
  );
}

export default function PublicPlaybookView() {
  const { shareToken } = useParams();
  const queryClient = useQueryClient();

  const { data: playbook, isLoading: playbookLoading } = useQuery({
    queryKey: ['public-playbook', shareToken],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('script_playbooks')
        .select('*')
        .eq('share_token', shareToken!)
        .eq('is_public', true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!shareToken,
  });

  const allowEdit = !!(playbook as any)?.allow_public_edit;

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['public-playbook-items', playbook?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('script_playbook_items')
        .select('*')
        .eq('playbook_id', playbook!.id)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!playbook?.id,
  });

  const scriptIds = items.filter(i => i.item_type === 'script' && i.script_id).map(i => i.script_id!);
  const objectionIds = items.filter(i => i.item_type === 'objection' && i.objection_id).map(i => i.objection_id!);

  const { data: scripts = [] } = useQuery({
    queryKey: ['public-playbook-scripts', scriptIds],
    queryFn: async () => {
      if (scriptIds.length === 0) return [];
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .in('id', scriptIds);
      if (error) throw error;
      return data;
    },
    enabled: scriptIds.length > 0,
  });

  const { data: objections = [] } = useQuery({
    queryKey: ['public-playbook-objections', objectionIds],
    queryFn: async () => {
      if (objectionIds.length === 0) return [];
      const { data, error } = await supabase
        .from('objection_entries')
        .select('*')
        .in('id', objectionIds);
      if (error) throw error;
      return data;
    },
    enabled: objectionIds.length > 0,
  });

  const itemsWithData = useMemo(() => {
    return items.map(item => {
      const script = item.item_type === 'script' ? scripts.find((s: any) => s.id === item.script_id) : undefined;
      const objection = item.item_type === 'objection' ? objections.find((o: any) => o.id === item.objection_id) : undefined;

      // If custom_content exists for a script item, override the versions
      let displayScript = script;
      const customContent = (item as any).custom_content;
      if (script && customContent && typeof customContent === 'object') {
        displayScript = { ...script, versions: customContent };
      }

      return {
        ...item,
        script: displayScript,
        originalScript: script,
        objection,
      };
    }).filter(item => item.script || item.objection);
  }, [items, scripts, objections]);

  const [editingItem, setEditingItem] = useState<{ itemId: string; versionIdx: number } | null>(null);

  const handleSaveEdit = useCallback(async (itemId: string, versionIdx: number, newContent: string) => {
    const item = itemsWithData.find(i => i.id === itemId);
    if (!item?.originalScript) return;

    // Build custom_content: take existing custom_content or original versions, update the specific version
    const existing = (item as any).custom_content || (item.originalScript as any).versions;
    const updated = (existing as any[]).map((v: any, i: number) =>
      i === versionIdx ? { ...v, content: newContent } : v
    );

    const { error } = await supabase
      .from('script_playbook_items')
      .update({ custom_content: updated } as any)
      .eq('id', itemId);

    if (error) {
      toast.error('Failed to save edit');
      console.error(error);
      return;
    }

    toast.success('Edit saved to this playbook');
    setEditingItem(null);
    queryClient.invalidateQueries({ queryKey: ['public-playbook-items', playbook?.id] });
  }, [itemsWithData, playbook?.id, queryClient]);

  const isLoading = playbookLoading || itemsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!playbook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-bold mb-2">Playbook not found</h1>
          <p className="text-muted-foreground text-sm">This playbook may no longer be shared publicly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">Shared Playbook</Badge>
            {allowEdit && (
              <Badge variant="outline" className="text-xs gap-1">
                <Pencil className="h-3 w-3" /> Editable
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{playbook.title}</h1>
          {playbook.description && (
            <p className="text-muted-foreground mt-2">{playbook.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {itemsWithData.length} item{itemsWithData.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Items */}
        {itemsWithData.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">This playbook has no items yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {itemsWithData.map((item, index) => (
              item.item_type === 'objection' && item.objection ? (
                <Card key={item.id}>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 px-4">
                        <div className="flex items-start gap-3">
                          <span className="text-xs text-muted-foreground font-mono w-5 text-center mt-0.5">{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                {item.objection.title}
                              </CardTitle>
                              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            </div>
                            <div className="flex gap-1.5 mt-1.5 flex-wrap">
                              <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Objection</Badge>
                              <Badge variant="outline" className="text-[10px]">{item.objection.category}</Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-4 px-4">
                        {item.objection.description && (
                          <p className="text-sm text-muted-foreground">{item.objection.description}</p>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ) : item.script ? (
                <Card key={item.id}>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 px-4">
                        <div className="flex items-start gap-3">
                          <span className="text-xs text-muted-foreground font-mono w-5 text-center mt-0.5">{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-sm font-medium">{item.script.stage}</CardTitle>
                              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            </div>
                            <div className="flex gap-1.5 mt-1.5 flex-wrap">
                              <Badge variant="secondary" className="text-[10px]">{item.script.category}</Badge>
                              {item.script.target_audience && item.script.target_audience !== 'general' && (
                                <Badge variant="outline" className="text-[10px]">{item.script.target_audience}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-4 px-4">
                        {(item.script.versions as any[])?.map((version: any, vi: number) => {
                          const isEditing = editingItem?.itemId === item.id && editingItem?.versionIdx === vi;
                          return (
                            <div key={vi} className="mb-4 last:mb-0">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-xs">{version.author || `Version ${vi + 1}`}</Badge>
                                <div className="flex items-center gap-1">
                                  {allowEdit && !isEditing && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 gap-1 text-xs"
                                      onClick={() => setEditingItem({ itemId: item.id, versionIdx: vi })}
                                    >
                                      <Pencil className="h-3 w-3" /> Edit
                                    </Button>
                                  )}
                                  <CopyButton text={version.content || ""} />
                                </div>
                              </div>
                              {isEditing ? (
                                <InlineEditor
                                  initialValue={version.content || ""}
                                  onSave={(val) => handleSaveEdit(item.id, vi, val)}
                                  onCancel={() => setEditingItem(null)}
                                />
                              ) : (
                                <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 rounded-lg p-3 sm:p-4 overflow-x-auto">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                                    {version.content || ""}
                                  </ReactMarkdown>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ) : null
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

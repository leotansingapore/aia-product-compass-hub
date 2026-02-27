import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Loader2, BookOpen, MessageSquare, Copy, Check, Pencil, Heading1, Heading2, Heading3, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markdownComponents } from "@/lib/markdown-config";
import { toast } from "sonner";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

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

function SectionAnchorLink({ anchor }: { anchor: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}${window.location.pathname}#${anchor}`;
  return (
    <button
      title="Copy link to this section"
      onClick={() => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="opacity-0 group-hover/section:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Link className="h-3.5 w-3.5" />}
    </button>
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
  const didScrollRef = useRef(false);

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
      if (item.item_type === 'section') {
        return { ...item, script: undefined, originalScript: undefined, objection: undefined };
      }
      const script = item.item_type === 'script' ? scripts.find((s: any) => s.id === item.script_id) : undefined;
      const objection = item.item_type === 'objection' ? objections.find((o: any) => o.id === item.objection_id) : undefined;
      let displayScript = script;
      const customContent = (item as any).custom_content;
      if (script && customContent && typeof customContent === 'object' && !customContent.label) {
        displayScript = { ...script, versions: customContent };
      }
      return { ...item, script: displayScript, originalScript: script, objection };
    }).filter(item => item.item_type === 'section' || item.script || item.objection);
  }, [items, scripts, objections]);

  // Scroll to hash anchor after items load
  useEffect(() => {
    if (!didScrollRef.current && itemsWithData.length > 0 && window.location.hash) {
      const anchor = window.location.hash.slice(1);
      const el = document.getElementById(anchor);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
        didScrollRef.current = true;
      }
    }
  }, [itemsWithData]);

  const [editingItem, setEditingItem] = useState<{ itemId: string; versionIdx: number } | null>(null);

  const handleSaveEdit = useCallback(async (itemId: string, versionIdx: number, newContent: string) => {
    const item = itemsWithData.find(i => i.id === itemId);
    if (!item?.originalScript) return;
    const existing = (item as any).custom_content || (item.originalScript as any).versions;
    const updated = (existing as any[]).map((v: any, i: number) =>
      i === versionIdx ? { ...v, content: newContent } : v
    );
    const { error } = await supabase
      .from('script_playbook_items')
      .update({ custom_content: updated } as any)
      .eq('id', itemId);
    if (error) { toast.error('Failed to save edit'); return; }
    toast.success('Edit saved to this playbook');
    setEditingItem(null);
    queryClient.invalidateQueries({ queryKey: ['public-playbook-items', playbook?.id] });
  }, [itemsWithData, playbook?.id, queryClient]);

  const isLoading = playbookLoading || itemsLoading;

  // Build table of contents from sections
  const sections = useMemo(() => {
    return itemsWithData
      .filter(i => i.item_type === 'section')
      .map(i => ({
        id: i.id,
        label: (i as any).custom_content?.label || "Section",
        anchor: slugify((i as any).custom_content?.label || "section"),
      }));
  }, [itemsWithData]);

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

  // Track script index across sections
  let scriptCounter = 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">Shared Playbook</Badge>
            {allowEdit ? (
              <Badge variant="outline" className="text-xs gap-1 border-primary/40 text-primary">
                <Pencil className="h-3 w-3" /> Edit enabled
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
                View only
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{playbook.title}</h1>
          {playbook.description && (
            <p className="text-muted-foreground mt-2">{playbook.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {itemsWithData.filter(i => i.item_type !== 'section').length} item{itemsWithData.filter(i => i.item_type !== 'section').length !== 1 ? 's' : ''}
            {sections.length > 0 && ` · ${sections.length} section${sections.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Table of Contents */}
        {sections.length > 1 && (
          <div className="mb-8 p-4 rounded-xl border bg-muted/30">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Contents</p>
            <div className="space-y-1">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.anchor}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(sec.anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    window.history.replaceState(null, "", `#${sec.anchor}`);
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5"
                >
                  <Heading1 className="h-3.5 w-3.5 text-primary shrink-0" />
                  {sec.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        {itemsWithData.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">This playbook has no items yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {itemsWithData.map((item) => {
              // ─── Section header ───────────────────────────────────────────
              if (item.item_type === 'section') {
                const label = (item as any).custom_content?.label || "Section";
                const level: 1 | 2 | 3 = (item as any).custom_content?.level || 1;
                const anchor = slugify(label);
                const lvlCfg = {
                  1: { iconClass: "h-5 w-5", textClass: "text-lg font-bold", topMargin: "mt-8", indent: "" },
                  2: { iconClass: "h-4 w-4", textClass: "text-base font-semibold", topMargin: "mt-5", indent: "ml-0" },
                  3: { iconClass: "h-3.5 w-3.5", textClass: "text-sm font-medium text-muted-foreground", topMargin: "mt-3", indent: "ml-2" },
                }[level];
                const LvlIcon = level === 1 ? Heading1 : level === 2 ? Heading2 : Heading3;
                return (
                  <div
                    key={item.id}
                    id={anchor}
                    className={`group/section flex items-center gap-2 ${lvlCfg.topMargin} mb-1 scroll-mt-6 ${lvlCfg.indent}`}
                  >
                    <LvlIcon className={`${lvlCfg.iconClass} text-primary shrink-0`} />
                    <span className={`${lvlCfg.textClass} leading-none flex-1`}>{label}</span>
                    <SectionAnchorLink anchor={anchor} />
                    <div className="flex-1 h-px bg-border ml-1" />
                  </div>
                );
              }

              // ─── Objection ────────────────────────────────────────────────
              if (item.item_type === 'objection' && item.objection) {
                const idx = scriptCounter++;
                return (
                  <Card key={item.id}>
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 px-4">
                          <div className="flex items-start gap-3">
                            <span className="text-xs text-muted-foreground font-mono w-5 text-center mt-0.5">{idx + 1}</span>
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
                );
              }

              // ─── Script ───────────────────────────────────────────────────
              if (item.script) {
                const idx = scriptCounter++;
                return (
                  <Card key={item.id}>
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 px-4">
                          <div className="flex items-start gap-3">
                            <span className="text-xs text-muted-foreground font-mono w-5 text-center mt-0.5">{idx + 1}</span>
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
                                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs"
                                        onClick={() => setEditingItem({ itemId: item.id, versionIdx: vi })}>
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
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

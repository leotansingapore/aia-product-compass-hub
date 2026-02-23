import { useState, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markdownComponents } from "@/lib/markdown-config";
import { MinimalRichEditor } from "@/components/MinimalRichEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, Plus, Pencil, Trash2, Search, X, Filter, Loader2, MessageSquare, Shield, Send, User } from "lucide-react";
import { useObjections, useObjectionMutations } from "@/hooks/useObjections";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ObjectionEntry, ObjectionResponse } from "@/hooks/useObjections";
import { ObjectionEditorDialog } from "./ObjectionEditorDialog";

// Fuzzy matching: checks if all characters of query appear in order in target
function fuzzyMatch(target: string, query: string): { match: boolean; score: number } {
  const t = target.toLowerCase();
  const q = query.toLowerCase();
  if (!q) return { match: true, score: 0 };
  if (t.includes(q)) return { match: true, score: 100 + q.length }; // Exact substring = highest
  let ti = 0;
  let qi = 0;
  let score = 0;
  let consecutiveBonus = 0;
  while (ti < t.length && qi < q.length) {
    if (t[ti] === q[qi]) {
      score += 1 + consecutiveBonus;
      consecutiveBonus += 1;
      qi++;
    } else {
      consecutiveBonus = 0;
    }
    ti++;
  }
  return { match: qi === q.length, score };
}

function fuzzyIncludes(target: string, query: string): boolean {
  return fuzzyMatch(target, query).match;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  // Try exact substring highlight first
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  if (parts.length > 1) {
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-700/60 rounded-sm px-0.5">{part}</mark> : part
    );
  }
  // Fuzzy highlight: mark individual matched characters
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  let qi = 0;
  const result: React.ReactNode[] = [];
  let buffer = "";
  for (let i = 0; i < text.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      if (buffer) { result.push(buffer); buffer = ""; }
      result.push(<mark key={`f${i}`} className="bg-yellow-200/70 dark:bg-yellow-700/40 rounded-sm">{text[i]}</mark>);
      qi++;
    } else {
      buffer += text[i];
    }
  }
  if (qi < q.length) return text; // No fuzzy match
  if (buffer) result.push(buffer);
  // Append remaining text
  const lastMatchIndex = text.toLowerCase().indexOf(q[q.length - 1], text.length - (text.length - result.length));
  // Simpler: rebuild with remaining chars
  let matchedCount = 0;
  const finalResult: React.ReactNode[] = [];
  let buf = "";
  let qj = 0;
  for (let i = 0; i < text.length; i++) {
    if (qj < q.length && t[i] === q[qj]) {
      if (buf) { finalResult.push(buf); buf = ""; }
      finalResult.push(<mark key={`h${i}`} className="bg-yellow-200/70 dark:bg-yellow-700/40 rounded-sm">{text[i]}</mark>);
      qj++;
      matchedCount++;
    } else {
      buf += text[i];
    }
  }
  if (buf) finalResult.push(buf);
  if (matchedCount < q.length) return text;
  return finalResult;
}

const categoryConfig: Record<string, { label: string; icon: string; color: string }> = {
  generic: { label: "Generic Objections", icon: "🧠", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  tactical: { label: "Tactical Objections", icon: "⚡", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  product: { label: "Product-Specific", icon: "📦", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  pricing: { label: "Pricing & Fees", icon: "💰", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  trust: { label: "Trust & Credibility", icon: "🤝", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" },
  timing: { label: "Timing & Delay", icon: "⏳", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
};

interface ObjectionCardProps {
  entry: ObjectionEntry;
  responses: ObjectionResponse[];
  isAdmin: boolean;
  isAuthenticated: boolean;
  userId: string;
  userDisplayName: string;
  onEdit: () => void;
  onDelete: () => void;
  onAddResponse: (objectionId: string, content: string) => Promise<void>;
  onDeleteResponse: (id: string) => Promise<void>;
  searchQuery?: string;
  matchedResponseIds?: Set<string>;
}

function ObjectionCard({ entry, responses, isAdmin, isAuthenticated, userId, userDisplayName, onEdit, onDelete, onAddResponse, onDeleteResponse, searchQuery = "", matchedResponseIds }: ObjectionCardProps) {
  const [open, setOpen] = useState(false);
  const [newResponse, setNewResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const cat = categoryConfig[entry.category] || categoryConfig.generic;

  // Auto-expand when search matches response content
  const hasResponseMatch = matchedResponseIds && matchedResponseIds.size > 0;

  const handleSubmit = async () => {
    if (!newResponse.trim()) return;
    setSubmitting(true);
    await onAddResponse(entry.id, newResponse.trim());
    setNewResponse("");
    setSubmitting(false);
  };

  return (
    <Collapsible open={open || !!hasResponseMatch} onOpenChange={setOpen}>
      <Card className={`overflow-hidden transition-shadow ${open ? "shadow-md ring-1 ring-primary/20" : ""}`}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 px-3 sm:py-4 sm:px-6">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm sm:text-base leading-snug">{highlightText(entry.title, searchQuery)}</CardTitle>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-0.5 ${open ? "rotate-180" : ""}`} />
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 flex-wrap">
                  <Badge variant="secondary" className={`text-[10px] ${cat.color}`}>
                    {cat.icon} {cat.label}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {responses.length} {responses.length === 1 ? "response" : "responses"}
                  </Badge>
                  {(entry.tags || []).slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-[10px] font-normal">#{tag}</Badge>
                  ))}
                  {(entry.tags || []).length > 3 && (
                    <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">+{(entry.tags || []).length - 3}</Badge>
                  )}
                </div>
                {entry.description && !open && !hasResponseMatch && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{highlightText(entry.description, searchQuery)}</p>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 px-3 sm:px-6 pb-4">
            {entry.description && (
              <div className="mb-4 p-3 bg-muted/40 rounded-lg border">
                <p className="text-sm text-muted-foreground italic">{entry.description}</p>
              </div>
            )}

            {/* Responses */}
            <div className="space-y-3">
              {responses.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No responses yet. Be the first to contribute!</p>
              )}
              {responses.map((resp) => (
                <div key={resp.id} className={`border rounded-lg p-3 bg-card ${matchedResponseIds?.has(resp.id) ? 'ring-2 ring-yellow-400/60 dark:ring-yellow-500/40' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">{resp.author_name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(resp.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {(resp.user_id === userId || isAdmin) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => onDeleteResponse(resp.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents as any}>
                      {resp.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>

            {/* Add response */}
            {isAuthenticated && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Add your response</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <MinimalRichEditor
                      value={newResponse}
                      onChange={setNewResponse}
                      placeholder="Share how you handle this objection..."
                      onSave={handleSubmit}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={!newResponse.trim() || submitting}
                      className="gap-1.5"
                    >
                      {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                      Submit
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Admin actions */}
            {isAdmin && (
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Button variant="outline" size="sm" onClick={onEdit} className="gap-1 text-xs">
                  <Pencil className="h-3 w-3" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={onDelete} className="gap-1 text-xs text-destructive hover:text-destructive">
                  <Trash2 className="h-3 w-3" /> Delete
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function ObjectionHandlingDatabase() {
  const { entries, responses, loading, refetch } = useObjections();
  const { createEntry, updateEntry, deleteEntry, addResponse, deleteResponse, isAdmin } = useObjectionMutations();
  const { user } = useSimplifiedAuth();
  const isMobile = useIsMobile();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ObjectionEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ObjectionEntry | null>(null);

  // Editor form state (now managed by ObjectionEditorDialog)

  const openEditor = (entry?: ObjectionEntry) => {
    setEditingEntry(entry || null);
    setEditorOpen(true);
  };

  const handleSave = async (data: { title: string; category: string; description?: string; tags?: string[]; initialResponse?: string }) => {
    if (editingEntry) {
      await updateEntry(editingEntry.id, { title: data.title, category: data.category, description: data.description || null, tags: data.tags });
    } else {
      const created = await createEntry({ title: data.title, category: data.category, description: data.description, tags: data.tags });
      // If there's an initial response and user is logged in, add it
      if (created && data.initialResponse && user) {
        const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "Anonymous";
        await addResponse(created.id, data.initialResponse, displayName, user.id);
      }
    }
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteEntry(deleteTarget.id);
    setDeleteTarget(null);
    refetch();
  };

  const handleAddResponse = useCallback(async (objectionId: string, content: string) => {
    if (!user) return;
    const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "Anonymous";
    await addResponse(objectionId, content, displayName, user.id);
    refetch();
  }, [user, addResponse, refetch]);

  const handleDeleteResponse = useCallback(async (id: string) => {
    await deleteResponse(id);
    refetch();
  }, [deleteResponse, refetch]);

  // Track which response IDs matched the search for highlighting
  const matchedResponseIdsMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    if (!searchQuery.trim()) return map;
    const qLower = searchQuery.trim().toLowerCase();
    const words = qLower.split(/\s+/).filter(w => w.length > 0);
    responses.forEach(r => {
      const content = r.content.toLowerCase();
      const author = r.author_name.toLowerCase();
      const allText = content + " " + author;
      // Full phrase or all words must appear
      const matches = allText.includes(qLower) || (words.length > 1 && words.every(w => allText.includes(w)));
      if (matches) {
        if (!map[r.objection_id]) map[r.objection_id] = new Set();
        map[r.objection_id].add(r.id);
      }
    });
    return map;
  }, [responses, searchQuery]);

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (activeCategory !== "all") {
      result = result.filter(e => e.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const qLower = searchQuery.trim().toLowerCase();
      // Split into individual words for multi-word matching
      const words = qLower.split(/\s+/).filter(w => w.length > 0);

      const scored = result.map(e => {
        let score = 0;
        const titleLower = e.title.toLowerCase();
        const descLower = (e.description || "").toLowerCase();
        const tagsLower = (e.tags || []).map(t => t.toLowerCase());
        const catLabel = (categoryConfig[e.category]?.label || e.category).toLowerCase();

        // Full phrase exact match (highest priority)
        if (titleLower.includes(qLower)) score += 500;
        if (descLower.includes(qLower)) score += 300;
        tagsLower.forEach(t => { if (t.includes(qLower)) score += 200; });
        if (catLabel.includes(qLower)) score += 100;

        // If no full-phrase match, try individual word matching (all words must appear somewhere)
        if (score === 0 && words.length > 1) {
          const allFields = [titleLower, descLower, ...tagsLower, catLabel].join(" ");
          const allWordsMatch = words.every(w => allFields.includes(w));
          if (allWordsMatch) {
            // Boost based on where words appear
            words.forEach(w => {
              if (titleLower.includes(w)) score += 100;
              if (descLower.includes(w)) score += 60;
              tagsLower.forEach(t => { if (t.includes(w)) score += 40; });
            });
          }
        }

        // Single-word query: require substring match in at least one field
        if (score === 0 && words.length === 1) {
          const w = words[0];
          if (titleLower.includes(w)) score += 100;
          if (descLower.includes(w)) score += 60;
          tagsLower.forEach(t => { if (t.includes(w)) score += 40; });
          if (catLabel.includes(w)) score += 30;
        }

        // Response content matches
        if (matchedResponseIdsMap[e.id]) score += 50 * matchedResponseIdsMap[e.id].size;

        return { entry: e, score };
      }).filter(s => s.score > 0);

      scored.sort((a, b) => b.score - a.score);
      result = scored.map(s => s.entry);
    }
    return result;
  }, [entries, activeCategory, searchQuery, matchedResponseIdsMap]);

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = { all: entries.length };
    Object.keys(categoryConfig).forEach(key => {
      c[key] = entries.filter(e => e.category === key).length;
    });
    return c;
  }, [entries]);

  const responsesMap = useMemo(() => {
    const map: Record<string, ObjectionResponse[]> = {};
    responses.forEach(r => {
      if (!map[r.objection_id]) map[r.objection_id] = [];
      map[r.objection_id].push(r);
    });
    return map;
  }, [responses]);

  return (
    <div>
      {/* Search + Add */}
      <div className="mb-4 sm:mb-6 flex gap-2 sm:gap-3 items-start">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search objections, responses, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-10 text-sm border-2 focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {isAdmin && (
          <Button onClick={() => openEditor()} size="sm" className="gap-1.5 shrink-0 h-10">
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add Objection</span>
          </Button>
        )}
      </div>

      {/* Category filter */}
      <div className="mb-4 sm:mb-6">
        {isMobile ? (
          /* Mobile: dropdown select */
          <div>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Category
            </span>
            <Select value={activeCategory} onValueChange={setActiveCategory}>
              <SelectTrigger className="h-9 text-xs bg-background">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All ({categoryCounts.all})</SelectItem>
                {Object.entries(categoryConfig).filter(([key]) => categoryCounts[key] > 0).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.icon} {config.label} ({categoryCounts[key]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          /* Desktop: pill buttons */
          <>
            <div className="flex items-center gap-2 mb-1">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin -mx-1 px-1">
              <Button
                variant={activeCategory === "all" ? "default" : "outline"}
                size="sm"
                className="text-xs shrink-0 h-8 px-3"
                onClick={() => setActiveCategory("all")}
              >
                All ({categoryCounts.all})
              </Button>
              {Object.entries(categoryConfig).filter(([key]) => categoryCounts[key] > 0).map(([key, config]) => (
                <Button
                  key={key}
                  variant={activeCategory === key ? "default" : "outline"}
                  size="sm"
                  className="text-xs shrink-0 h-8 gap-1 px-3"
                  onClick={() => setActiveCategory(key)}
                >
                  {config.icon} {config.label} ({categoryCounts[key]})
                </Button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Results count */}
      <div className="mb-3 flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="text-xs font-medium px-2.5 py-1">
          {filteredEntries.length} objection{filteredEntries.length !== 1 ? "s" : ""}
          {entries.length > 0 && filteredEntries.length !== entries.length && (
            <span className="text-muted-foreground ml-1">of {entries.length}</span>
          )}
        </Badge>
        {searchQuery.trim() && (
          <>
            <span className="text-xs text-muted-foreground">
              matching "<span className="font-medium text-foreground">{searchQuery}</span>"
            </span>
            {Object.keys(matchedResponseIdsMap).length > 0 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                <MessageSquare className="h-3 w-3 mr-1" />
                {Object.values(matchedResponseIdsMap).reduce((sum, s) => sum + s.size, 0)} response match{Object.values(matchedResponseIdsMap).reduce((sum, s) => sum + s.size, 0) !== 1 ? "es" : ""}
              </Badge>
            )}
          </>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Entries list */}
      {!loading && (
        <div className="space-y-3">
          {filteredEntries.length > 0 ? (
            filteredEntries.map(entry => (
              <ObjectionCard
                key={entry.id}
                entry={entry}
                responses={responsesMap[entry.id] || []}
                isAdmin={isAdmin}
                isAuthenticated={!!user}
                userId={user?.id || ""}
                userDisplayName={user?.user_metadata?.display_name || user?.email?.split("@")[0] || ""}
                onEdit={() => openEditor(entry)}
                onDelete={() => setDeleteTarget(entry)}
                onAddResponse={handleAddResponse}
                onDeleteResponse={handleDeleteResponse}
                searchQuery={searchQuery}
                matchedResponseIds={matchedResponseIdsMap[entry.id]}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No objections found</p>
              <p className="text-sm">
                {entries.length === 0
                  ? "Start building the objection handling database by adding common objections."
                  : "Try adjusting your search or category filter."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Editor Dialog */}
      <ObjectionEditorDialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        editingEntry={editingEntry}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Objection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? All responses will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

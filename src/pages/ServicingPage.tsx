import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { ScriptsTabBar } from "@/components/scripts/ScriptsTabBar";
import { ScriptEditorDialog } from "@/components/scripts/ScriptEditorDialog";
import { useScripts, useScriptsMutations, ScriptEntry, ScriptVersion } from "@/hooks/useScripts";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useScriptFavourites } from "@/hooks/useScriptFavourites";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, X, ChevronDown, Pencil, Trash2, Copy, Heart, Users, Filter } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markdownComponents } from "@/lib/markdown-config";
import { MinimalRichEditor } from "@/components/MinimalRichEditor";

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICING_ROLES = [
  { value: "consultant", label: "Consultant" },
  { value: "va", label: "VA" },
];

const roleColors: Record<string, string> = {
  consultant: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  va: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
};

const categoryLabels: Record<string, string> = {
  "premium-payments": "Premium Payments",
  "new-business": "New Business",
  "claims": "Claims",
  "policy-services": "Policy Services",
  "travel-insurance": "Travel Insurance",
  "texting-campaigns": "Texting Campaigns",
  "festive-greetings": "Festive Greetings",
  "referrals": "Referrals",
  "annual-reviews": "Annual Reviews",
  "general-education": "General Education",
};

const audienceLabels: Record<string, string> = {
  clients: "Clients",
};

const roleLabels: Record<string, string> = {
  consultant: "Consultant",
  va: "VA",
};

// ─── Script Card ──────────────────────────────────────────────────────────────

function ServicingScriptCard({
  script, isAdmin, onEdit, onDelete, isOpenByUrl, onInlineSave, onMetadataSave, isFavourite, onToggleFavourite,
}: {
  script: ScriptEntry; isAdmin: boolean; onEdit: () => void; onDelete: () => void;
  isOpenByUrl: boolean;
  onInlineSave?: (scriptId: string, versions: ScriptVersion[]) => Promise<void>;
  onMetadataSave?: (scriptId: string, updates: Partial<ScriptEntry>) => Promise<void>;
  isFavourite?: boolean; onToggleFavourite?: () => void;
}) {
  const [open, setOpen] = useState(isOpenByUrl);
  const [editingVersionIdx, setEditingVersionIdx] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(script.stage);
  const [editingRole, setEditingRole] = useState(false);
  const [editingVersionTitle, setEditingVersionTitle] = useState<number | null>(null);
  const [versionTitleDraft, setVersionTitleDraft] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const saveMetaField = async (updates: Partial<ScriptEntry>) => {
    if (!onMetadataSave) return;
    setIsSaving(true);
    await onMetadataSave(script.id, updates);
    setIsSaving(false);
  };

  useEffect(() => {
    if (isOpenByUrl) {
      setOpen(true);
      setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [isOpenByUrl]);

  const currentRole = script.script_role || "consultant";
  const currentRoleLabel = SERVICING_ROLES.find(r => r.value === currentRole)?.label || "Consultant";

  // Derive a readable category tag from the script's tags
  const categoryTag = (script.tags || []).find(t => categoryLabels[t]);
  const categoryLabel = categoryTag ? categoryLabels[categoryTag] : null;

  return (
    <Card ref={cardRef} className="overflow-hidden">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 px-3 sm:py-4 sm:px-6">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  {editingTitle && isAdmin ? (
                    <div className="flex items-center gap-1.5 flex-1" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={titleDraft}
                        onChange={(e) => setTitleDraft(e.target.value)}
                        className="h-7 text-sm font-semibold"
                        autoFocus
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') { e.preventDefault(); await saveMetaField({ stage: titleDraft }); setEditingTitle(false); }
                          else if (e.key === 'Escape') { setTitleDraft(script.stage); setEditingTitle(false); }
                        }}
                        onBlur={async () => { if (titleDraft !== script.stage) await saveMetaField({ stage: titleDraft }); setEditingTitle(false); }}
                      />
                    </div>
                  ) : (
                    <CardTitle
                      className={`text-sm sm:text-base leading-snug ${isAdmin && onMetadataSave ? 'cursor-text hover:underline decoration-dashed decoration-muted-foreground/40 underline-offset-4' : ''}`}
                      onClick={(e) => { if (isAdmin && onMetadataSave) { e.stopPropagation(); setTitleDraft(script.stage); setEditingTitle(true); } }}
                    >
                      {script.stage}
                    </CardTitle>
                  )}
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-0.5 ${open ? "rotate-180" : ""}`} />
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 flex-wrap">
                  {/* Role badge — editable for admin */}
                  {editingRole && isAdmin ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={currentRole}
                        onValueChange={async (val) => { await saveMetaField({ script_role: val }); setEditingRole(false); }}
                        open={true}
                        onOpenChange={(o) => { if (!o) setEditingRole(false); }}
                      >
                        <SelectTrigger className="h-5 text-[10px] w-auto min-w-[100px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {SERVICING_ROLES.map(({ value, label }) => (
                            <SelectItem key={value} value={value} className="text-xs">{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <Badge
                      variant="outline"
                      className={`text-[10px] border-0 ${roleColors[currentRole] || ""} ${isAdmin && onMetadataSave ? 'cursor-pointer hover:ring-1 ring-primary/40' : ''}`}
                      onClick={(e) => { if (isAdmin && onMetadataSave) { e.stopPropagation(); setEditingRole(true); } }}
                    >
                      {currentRoleLabel}
                    </Badge>
                  )}
                  {categoryLabel && (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">{categoryLabel}</Badge>
                  )}
                  {script.versions.length > 1 && (
                    <Badge variant="secondary" className="text-[10px]">{script.versions.length} versions</Badge>
                  )}
                </div>
              </div>
              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                {onToggleFavourite && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleFavourite}>
                    <Heart className={`h-3.5 w-3.5 ${isFavourite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                )}
                {isAdmin && (
                  <>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 sm:px-6 sm:pb-6">
            <Tabs defaultValue="0">
              {script.versions.length > 1 && (
                <TabsList className="mb-3 flex-wrap h-auto gap-1 w-full justify-start">
                  {script.versions.map((v, i) => (
                    <TabsTrigger key={i} value={String(i)} className="text-xs relative group">
                      {editingVersionTitle === i && isAdmin ? (
                        <span onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={versionTitleDraft}
                            onChange={(e) => setVersionTitleDraft(e.target.value)}
                            className="h-5 text-[11px] w-24 px-1"
                            autoFocus
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const newVersions = script.versions.map((ver, idx) => idx === i ? { ...ver, author: versionTitleDraft, title: versionTitleDraft } : ver);
                                if (onInlineSave) await onInlineSave(script.id, newVersions);
                                setEditingVersionTitle(null);
                              } else if (e.key === 'Escape') setEditingVersionTitle(null);
                            }}
                            onBlur={async () => {
                              if (versionTitleDraft !== v.author) {
                                const newVersions = script.versions.map((ver, idx) => idx === i ? { ...ver, author: versionTitleDraft, title: versionTitleDraft } : ver);
                                if (onInlineSave) await onInlineSave(script.id, newVersions);
                              }
                              setEditingVersionTitle(null);
                            }}
                          />
                        </span>
                      ) : (
                        <span
                          className={isAdmin && onMetadataSave ? 'cursor-text' : ''}
                          onDoubleClick={(e) => { if (isAdmin && onMetadataSave) { e.stopPropagation(); setVersionTitleDraft(v.title || v.author); setEditingVersionTitle(i); } }}
                        >
                          {v.title || v.author}
                        </span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              )}
              {script.versions.map((v, i) => (
                <TabsContent key={i} value={String(i)}>
                  {editingVersionIdx === i ? (
                    <div className="space-y-2">
                      <MinimalRichEditor value={editContent} onChange={setEditContent} />
                      <div className="flex gap-2">
                        <Button size="sm" disabled={isSaving} onClick={async () => {
                          setIsSaving(true);
                          const updatedVersions = script.versions.map((ver, idx) => idx === i ? { ...ver, content: editContent } : ver);
                          if (onInlineSave) await onInlineSave(script.id, updatedVersions);
                          setEditingVersionIdx(null); setEditContent(""); setIsSaving(false);
                        }}>
                          {isSaving ? "Saving..." : "Save"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditingVersionIdx(null); setEditContent(""); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                          {v.content}
                        </ReactMarkdown>
                      </div>
                      <div className="flex gap-1 mt-3">
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => {
                          navigator.clipboard.writeText(v.content);
                          toast.success("Copied to clipboard");
                        }}>
                          <Copy className="h-3 w-3" /> Copy
                        </Button>
                        {isAdmin && (
                          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => { setEditingVersionIdx(i); setEditContent(v.content); }}>
                            <Pencil className="h-3 w-3" /> Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicingPage() {
  const navigate = useNavigate();
  const { scriptId } = useParams();
  const { scripts: dbScripts, loading, refetch } = useScripts();
  const { updateScript, deleteScript, createScript, isAdmin } = useScriptsMutations();
  const { user } = useSimplifiedAuth();
  const { favouriteIds, toggleFavourite } = useScriptFavourites();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeAudience, setActiveAudience] = useState("all");
  const [activeRole, setActiveRole] = useState("all");
  const [activeTag, setActiveTag] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<ScriptEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScriptEntry | null>(null);

  // Base: all servicing scripts
  const servicingBase = useMemo(() => dbScripts.filter(s => s.category === "servicing"), [dbScripts]);

  // Dynamic tags derived from the live database
  const allTags = useMemo(() => {
    const set = new Set<string>();
    servicingBase.forEach(s => (s.tags || []).forEach(t => {
      // Exclude tags that are also category keys or redundant meta-tags
      if (!categoryLabels[t] && t !== "servicing") set.add(t);
    }));
    return Array.from(set).sort();
  }, [servicingBase]);

  // filterExcluding: apply all filters except one dimension (for dynamic counts)
  const filterExcluding = useCallback((exclude: 'category' | 'audience' | 'role' | 'tag') => {
    let result = servicingBase;
    if (exclude !== 'category' && activeCategory !== "all") {
      result = result.filter(s => (s.tags || []).includes(activeCategory));
    }
    if (exclude !== 'audience' && activeAudience !== "all") {
      result = result.filter(s => (s.target_audience || "clients") === activeAudience);
    }
    if (exclude !== 'role' && activeRole !== "all") {
      result = result.filter(s => (s.script_role || "consultant") === activeRole);
    }
    if (exclude !== 'tag' && activeTag !== "all") {
      result = result.filter(s => (s.tags || []).includes(activeTag));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.stage.toLowerCase().includes(q) ||
        s.versions.some(v => v.content.toLowerCase().includes(q) || v.author.toLowerCase().includes(q))
      );
    }
    return result;
  }, [servicingBase, activeCategory, activeAudience, activeRole, activeTag, searchQuery]);

  // Counts per dimension
  const categoryCounts = useMemo(() => {
    const base = filterExcluding('category');
    const c: Record<string, number> = { all: base.length };
    Object.keys(categoryLabels).forEach(key => {
      c[key] = base.filter(s => (s.tags || []).includes(key)).length;
    });
    return c;
  }, [filterExcluding]);

  const audienceCounts = useMemo(() => {
    const base = filterExcluding('audience');
    const c: Record<string, number> = { all: base.length };
    Object.keys(audienceLabels).forEach(key => {
      c[key] = base.filter(s => (s.target_audience || "clients") === key).length;
    });
    return c;
  }, [filterExcluding]);

  const roleCounts = useMemo(() => {
    const base = filterExcluding('role');
    const c: Record<string, number> = { all: base.length };
    Object.keys(roleLabels).forEach(key => {
      c[key] = base.filter(s => (s.script_role || "consultant") === key).length;
    });
    return c;
  }, [filterExcluding]);

  const tagCounts = useMemo(() => {
    const base = filterExcluding('tag');
    const c: Record<string, number> = {};
    allTags.forEach(tag => { c[tag] = base.filter(s => (s.tags || []).includes(tag)).length; });
    return c;
  }, [filterExcluding, allTags]);

  // Final filtered list
  const filteredScripts = useMemo(() => {
    let result = servicingBase;
    if (activeCategory !== "all") result = result.filter(s => (s.tags || []).includes(activeCategory));
    if (activeAudience !== "all") result = result.filter(s => (s.target_audience || "clients") === activeAudience);
    if (activeRole !== "all") result = result.filter(s => (s.script_role || "consultant") === activeRole);
    if (activeTag !== "all") result = result.filter(s => (s.tags || []).includes(activeTag));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.stage.toLowerCase().includes(q) ||
        s.versions.some(v => v.content.toLowerCase().includes(q) || v.author.toLowerCase().includes(q)) ||
        (s.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [servicingBase, activeCategory, activeAudience, activeRole, activeTag, searchQuery]);

  const hasActiveFilters = activeCategory !== "all" || activeAudience !== "all" || activeRole !== "all" || activeTag !== "all" || !!searchQuery;

  const handleInlineSave = useCallback(async (scriptId: string, versions: ScriptVersion[]) => {
    await updateScript(scriptId, { versions });
    refetch();
  }, [updateScript, refetch]);

  const handleMetadataSave = useCallback(async (scriptId: string, updates: Partial<ScriptEntry>) => {
    await updateScript(scriptId, updates);
    refetch();
  }, [updateScript, refetch]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await deleteScript(deleteTarget.id);
    if (ok) refetch();
    setDeleteTarget(null);
  };

  // Active categories that actually have scripts
  const activeCategoriesWithData = useMemo(() =>
    Object.keys(categoryLabels).filter(key => categoryCounts[key] > 0 || isAdmin),
    [categoryCounts, isAdmin]
  );

  return (
    <PageLayout
      title="Servicing Templates - FINternship"
      description="Text templates for servicing and communicating with clients."
    >
      <BrandedPageHeader
        title="🛎️ Servicing Templates"
        subtitle="Text templates for client communication and policy servicing"
        showBackButton
        onBack={() => navigate("/")}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Servicing" }]}
      />

      <div className="mx-auto px-3 sm:px-6 py-3 sm:py-8 max-w-4xl">
        <ScriptsTabBar />

        {/* Search + Add */}
        <div className="mb-4 sm:mb-5 flex gap-2 sm:gap-3 items-start">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search servicing templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-10 text-sm border-2 focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button onClick={() => { setEditingScript(null); setEditorOpen(true); }} size="sm" className="gap-1.5 shrink-0 h-10">
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add Template</span>
          </Button>
        </div>

        {/* ── Filter dropdowns ── */}
        <div className="mb-4 p-3 sm:p-4 rounded-lg border bg-muted/30">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {/* Category */}
            <div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                <Filter className="h-3 w-3" />Category
              </span>
              <Select value={activeCategory} onValueChange={setActiveCategory}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All ({categoryCounts.all})</SelectItem>
                  {activeCategoriesWithData.map(key => (
                    <SelectItem key={key} value={key}>
                      {categoryLabels[key]} ({categoryCounts[key] ?? 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Audience */}
            <div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Audience</span>
              <Select value={activeAudience} onValueChange={setActiveAudience}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="All audiences" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All</SelectItem>
                  {Object.entries(audienceLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label} ({audienceCounts[key] ?? 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role */}
            <div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Role</span>
              <Select value={activeRole} onValueChange={setActiveRole}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All</SelectItem>
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label} ({roleCounts[key] ?? 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tag */}
            {allTags.length > 0 && (
              <div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Tag</span>
                <Select value={activeTag} onValueChange={setActiveTag}>
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder="All tags" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50 max-h-60">
                    <SelectItem value="all">All</SelectItem>
                    {allTags.map(tag => (
                      <SelectItem key={tag} value={tag}>
                        {tag} ({tagCounts[tag] ?? 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Active filter breadcrumbs */}
        {hasActiveFilters && (
          <div className="mb-3 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground mr-0.5">Filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="text-[10px] gap-1 pl-2 pr-1 py-0.5 h-5">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="ml-0.5 hover:text-foreground"><X className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
            {activeCategory !== "all" && (
              <Badge variant="secondary" className="text-[10px] gap-1 pl-2 pr-1 py-0.5 h-5">
                {categoryLabels[activeCategory] || activeCategory}
                <button onClick={() => setActiveCategory("all")} className="ml-0.5 hover:text-foreground"><X className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
            {activeAudience !== "all" && (
              <Badge variant="secondary" className="text-[10px] gap-1 pl-2 pr-1 py-0.5 h-5">
                {audienceLabels[activeAudience] || activeAudience}
                <button onClick={() => setActiveAudience("all")} className="ml-0.5 hover:text-foreground"><X className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
            {activeRole !== "all" && (
              <Badge variant="secondary" className="text-[10px] gap-1 pl-2 pr-1 py-0.5 h-5">
                {roleLabels[activeRole] || activeRole}
                <button onClick={() => setActiveRole("all")} className="ml-0.5 hover:text-foreground"><X className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
            {activeTag !== "all" && (
              <Badge variant="secondary" className="text-[10px] gap-1 pl-2 pr-1 py-0.5 h-5">
                #{activeTag}
                <button onClick={() => setActiveTag("all")} className="ml-0.5 hover:text-foreground"><X className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
            <button
              onClick={() => { setActiveCategory("all"); setActiveAudience("all"); setActiveRole("all"); setActiveTag("all"); setSearchQuery(""); }}
              className="text-[10px] text-muted-foreground hover:text-foreground underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Count */}
        <p className="text-xs text-muted-foreground mb-3">{filteredScripts.length} template{filteredScripts.length !== 1 ? "s" : ""}</p>

        {/* Scripts list */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filteredScripts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No servicing templates found.</p>
            {isAdmin && <p className="text-xs mt-1">Click "Add Template" to create one.</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredScripts.map((script) => (
              <ServicingScriptCard
                key={script.id}
                script={script}
                isAdmin={isAdmin}
                isOpenByUrl={scriptId === script.id}
                onEdit={() => { setEditingScript(script); setEditorOpen(true); }}
                onDelete={() => setDeleteTarget(script)}
                onInlineSave={handleInlineSave}
                onMetadataSave={handleMetadataSave}
                isFavourite={favouriteIds.has(script.id)}
                onToggleFavourite={user ? () => toggleFavourite.mutate(script.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Editor Dialog — locked to servicing context */}
      <ScriptEditorDialog
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setEditingScript(null); }}
        script={editingScript}
        lockedAudience="clients"
        lockedCategory="servicing"
        lockedRoles={SERVICING_ROLES}
        mergeNavigateBase="/servicing"
        onSave={async (scriptData) => {
          if (editingScript) {
            await updateScript(editingScript.id, scriptData);
          } else {
            await createScript({ ...scriptData, category: "servicing", target_audience: "clients" } as any);
          }
          refetch();
          setEditorOpen(false);
          setEditingScript(null);
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete "{deleteTarget?.stage}". This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}

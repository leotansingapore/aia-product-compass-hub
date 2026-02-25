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
import { Plus, Search, X, ChevronDown, Pencil, Trash2, Copy, Heart, Users, CreditCard, Briefcase, ShieldCheck, FileText, Plane, MessageSquare, PartyPopper, Gift, Megaphone, BookOpen } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markdownComponents } from "@/lib/markdown-config";
import { MinimalRichEditor } from "@/components/MinimalRichEditor";

const SERVICING_ROLES = [
  { value: "consultant", label: "Consultant" },
  { value: "va", label: "VA" },
];

const roleColors: Record<string, string> = {
  consultant: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  va: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
};

type ServicingSubcategory = "all" | "premium-payments" | "new-business" | "claims" | "policy-services" | "travel-insurance" | "texting-campaigns" | "festive-greetings" | "referrals" | "annual-reviews" | "general-education";

const servicingSubcategories: { key: ServicingSubcategory; label: string; icon: typeof CreditCard; color: string }[] = [
  { key: "all", label: "All", icon: FileText, color: "bg-secondary text-secondary-foreground" },
  { key: "premium-payments", label: "Premium Payments", icon: CreditCard, color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { key: "new-business", label: "New Business", icon: Briefcase, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { key: "claims", label: "Claims", icon: ShieldCheck, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  { key: "policy-services", label: "Policy Services", icon: FileText, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  { key: "travel-insurance", label: "Travel Insurance", icon: Plane, color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300" },
  { key: "texting-campaigns", label: "Texting Campaigns", icon: MessageSquare, color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  { key: "festive-greetings", label: "Festive Greetings", icon: PartyPopper, color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" },
  { key: "referrals", label: "Referrals", icon: Gift, color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  { key: "annual-reviews", label: "Annual Reviews", icon: BookOpen, color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300" },
  { key: "general-education", label: "General Education", icon: Megaphone, color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
];

function ServicingScriptCard({
  script, isAdmin, onEdit, onDelete, isOpenByUrl, searchQuery, onInlineSave, onMetadataSave, isFavourite, onToggleFavourite,
}: {
  script: ScriptEntry; isAdmin: boolean; onEdit: () => void; onDelete: () => void;
  isOpenByUrl: boolean; searchQuery: string;
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
  const [editingAudience, setEditingAudience] = useState(false);
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
                  {editingAudience && isAdmin ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Select value={script.script_role || "consultant"} onValueChange={async (val) => { await saveMetaField({ script_role: val }); setEditingAudience(false); }} open={true} onOpenChange={(o) => { if (!o) setEditingAudience(false); }}>
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
                      className={`text-[10px] ${roleColors[script.script_role || "consultant"] || ""} ${isAdmin && onMetadataSave ? 'cursor-pointer hover:ring-1 ring-primary/40' : ''}`}
                      onClick={(e) => { if (isAdmin && onMetadataSave) { e.stopPropagation(); setEditingAudience(true); } }}
                    >
                      {SERVICING_ROLES.find(r => r.value === (script.script_role || "consultant"))?.label || "Consultant"}
                    </Badge>
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

export default function ServicingPage() {
  const navigate = useNavigate();
  const { scriptId } = useParams();
  const { scripts: dbScripts, loading, refetch } = useScripts();
  const { updateScript, deleteScript, createScript, isAdmin } = useScriptsMutations();
  const { user } = useSimplifiedAuth();
  const { favouriteIds, toggleFavourite } = useScriptFavourites();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubcategory, setActiveSubcategory] = useState<ServicingSubcategory>("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<ScriptEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScriptEntry | null>(null);

  // Only servicing scripts
  const servicingScripts = useMemo(() => {
    let result = dbScripts.filter((s) => s.category === "servicing");
    if (activeSubcategory !== "all") {
      result = result.filter((s) => (s.tags || []).includes(activeSubcategory));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) =>
        s.stage.toLowerCase().includes(q) ||
        s.versions.some((v) => v.content.toLowerCase().includes(q) || v.author.toLowerCase().includes(q)) ||
        (s.tags || []).some((t: string) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [dbScripts, searchQuery, activeSubcategory]);

  // Count scripts per subcategory
  const subcategoryCounts = useMemo(() => {
    const allServicing = dbScripts.filter((s) => s.category === "servicing");
    const counts: Record<string, number> = { all: allServicing.length };
    for (const sub of servicingSubcategories) {
      if (sub.key === "all") continue;
      counts[sub.key] = allServicing.filter((s) => (s.tags || []).includes(sub.key)).length;
    }
    return counts;
  }, [dbScripts]);

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
        <div className="mb-4 sm:mb-6 flex gap-2 sm:gap-3 items-start">
          <div className="flex-1 relative">
            <div className="relative">
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
          </div>
          {isAdmin && (
            <Button onClick={() => { setEditingScript(null); setEditorOpen(true); }} size="sm" className="gap-1.5 shrink-0 h-10">
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add Template</span>
            </Button>
          )}
        </div>

        {/* Subcategory filter chips */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {servicingSubcategories
            .filter((sub) => sub.key === "all" || subcategoryCounts[sub.key] > 0 || isAdmin)
            .map((sub) => {
              const isActive = activeSubcategory === sub.key;
              const count = subcategoryCounts[sub.key] || 0;
              const IconComp = sub.icon;
              return (
                <Button
                  key={sub.key}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={`h-7 text-xs gap-1 ${!isActive ? sub.color + ' border-transparent' : ''}`}
                  onClick={() => setActiveSubcategory(sub.key)}
                >
                  <IconComp className="h-3 w-3" />
                  {sub.label}
                  {count > 0 && <span className="opacity-70">({count})</span>}
                </Button>
              );
            })}
        </div>

        {/* Script count */}
        <p className="text-xs text-muted-foreground mb-3">{servicingScripts.length} template{servicingScripts.length !== 1 ? "s" : ""}</p>

        {/* Scripts list */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : servicingScripts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No servicing templates yet.</p>
            {isAdmin && <p className="text-xs mt-1">Click "Add Template" to create one.</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {servicingScripts.map((script) => (
              <ServicingScriptCard
                key={script.id}
                script={script}
                isAdmin={isAdmin}
                isOpenByUrl={scriptId === script.id}
                searchQuery={searchQuery}
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

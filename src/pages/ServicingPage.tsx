import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toScriptSlug, resolveScriptSlug } from "@/lib/scriptSlug";
import { useScriptUserVersions } from "@/hooks/useScriptUserVersions";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { Plus, Search, X, ChevronDown, Trash2, Copy, Heart, Users, Filter, GripVertical, GitMerge, Loader2 } from "lucide-react";
import { useMergeScripts } from "@/hooks/useMergeScripts";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markdownComponents } from "@/lib/markdown-config";
import { MinimalRichEditor } from "@/components/MinimalRichEditor";

// Strip markdown to clean plain text (for WhatsApp/messaging copy-paste)
function markdownToPlainText(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/gs, '$1')
    .replace(/\*(.+?)\*/gs, '$1')
    .replace(/__(.+?)__/gs, '$1')
    .replace(/_(.+?)_/gs, '$1')
    .replace(/~~(.+?)~~/gs, '$1')
    .replace(/`{1,3}[^`\n]*`{1,3}/g, (m) => m.replace(/`/g, ''))
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\[(.+?)\]\(.*?\)/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/^>\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICING_ROLES = [
  { value: "consultant", label: "Consultant" },
  { value: "va", label: "VA" },
];

const roleColors: Record<string, string> = {
  consultant: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  va: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
};

// Known category labels — new ones auto-added from DB slugs
const KNOWN_CATEGORY_LABELS: Record<string, string> = {
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

// Convert a kebab-case slug to a Title Case label
function slugToLabel(slug: string): string {
  return KNOWN_CATEGORY_LABELS[slug]
    ?? slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

const audienceLabels: Record<string, string> = {
  clients: "Clients",
};

const roleLabels: Record<string, string> = {
  consultant: "Consultant",
  va: "VA",
};

// ─── Script Card ──────────────────────────────────────────────────────────────

function ServicingScriptCard({
  script, isAdmin, isAuthenticated, onEdit, onDelete, isOpenByUrl, onToggle, onInlineSave, onMetadataSave, isFavourite, onToggleFavourite, categorySlugs,
  mergeSourceId, mergeOverId, tapSelectMode,
  onMergeDragStart, onMergeDragEnd, onMergeOver, onMergeLeave, onMergeDrop,
  onTapSelect, onTapTarget,
}: {
  script: ScriptEntry; isAdmin: boolean; isAuthenticated?: boolean; onEdit: () => void; onDelete: () => void;
  isOpenByUrl: boolean;
  onToggle?: (open: boolean) => void;
  onInlineSave?: (scriptId: string, versions: ScriptVersion[]) => Promise<void>;
  onMetadataSave?: (scriptId: string, updates: Partial<ScriptEntry>) => Promise<void>;
  isFavourite?: boolean; onToggleFavourite?: () => void;
  categorySlugs?: Set<string>;
  mergeSourceId?: string | null; mergeOverId?: string | null; tapSelectMode?: boolean;
  onMergeDragStart?: (id: string) => void; onMergeDragEnd?: () => void;
  onMergeOver?: (id: string) => void; onMergeLeave?: () => void; onMergeDrop?: (targetId: string) => void;
  onTapSelect?: (id: string) => void; onTapTarget?: (id: string) => void;
}) {
  const [open, setOpen] = useState(isOpenByUrl);
  const handleOpenChange = (val: boolean) => { setOpen(val); onToggle?.(val); };
  const [editingVersionIdx, setEditingVersionIdx] = useState<number | null>(null);

  // Community user versions — shown as extra tabs
  const { userVersions, addVersion, updateVersion, deleteVersion, userId: currentUserId } = useScriptUserVersions(script.id);
  const [showNewVersionForm, setShowNewVersionForm] = useState(false);
  const [newVersionContent, setNewVersionContent] = useState("");
  const [newVersionName, setNewVersionName] = useState("");
  const [editingUserVersionId, setEditingUserVersionId] = useState<string | null>(null);
  const [editUserVersionContent, setEditUserVersionContent] = useState("");
  const [editUserVersionName, setEditUserVersionName] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(script.stage);
  const [addingTag, setAddingTag] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const [editingRole, setEditingRole] = useState(false);
  const [editingCategory, setEditingCategory] = useState(false);
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
  const catSlugsSet = categorySlugs ?? new Set(Object.keys(KNOWN_CATEGORY_LABELS));
  const categoryTag = (script.tags || []).find(t => catSlugsSet.has(t));
  const categoryLabel = categoryTag ? slugToLabel(categoryTag) : null;

  return (
    <Card
      ref={cardRef}
      className={`overflow-hidden transition-all duration-200 ${
        mergeSourceId === script.id ? "ring-2 ring-primary/60 shadow-md" : ""
      } ${
        mergeSourceId && mergeSourceId !== script.id && mergeOverId === script.id ? "ring-2 ring-primary shadow-lg scale-[1.01]" : ""
      } ${
        tapSelectMode && mergeSourceId && mergeSourceId !== script.id ? "cursor-pointer ring-1 ring-primary/30 hover:ring-primary/60" : ""
      } ${
        mergeSourceId && mergeSourceId !== script.id && !tapSelectMode ? "cursor-copy" : ""
      }`}
      draggable={!!onMergeDragStart}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; const ghost = document.createElement('div'); ghost.style.cssText = 'position:fixed;top:-1000px;width:1px;height:1px;opacity:0;'; document.body.appendChild(ghost); e.dataTransfer.setDragImage(ghost, 0, 0); setTimeout(() => document.body.removeChild(ghost), 0); onMergeDragStart?.(script.id); }}
      onDragEnd={onMergeDragEnd}
      onDragOver={(e) => { if (mergeSourceId && mergeSourceId !== script.id) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; onMergeOver?.(script.id); } }}
      onDragLeave={onMergeLeave}
      onDrop={(e) => { e.preventDefault(); if (mergeSourceId && mergeSourceId !== script.id) onMergeDrop?.(script.id); }}
      onClick={() => { if (tapSelectMode && mergeSourceId && mergeSourceId !== script.id) onTapTarget?.(script.id); }}
    >
      <Collapsible open={open} onOpenChange={handleOpenChange}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 px-3 sm:py-4 sm:px-6">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              {onMergeDragStart && (
                <div
                  className={`shrink-0 mt-0.5 sm:mt-0 p-1 rounded transition-colors ${
                    mergeSourceId === script.id && tapSelectMode
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted"
                  } cursor-grab active:cursor-grabbing`}
                  title="Drag to merge (desktop) or tap to select for merge (mobile)"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); onTapSelect?.(script.id); }}
                >
                  <GripVertical className="h-4 w-4" />
                </div>
              )}
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
                      onDoubleClick={(e) => { if (isAdmin && onMetadataSave) { e.stopPropagation(); setTitleDraft(script.stage); setEditingTitle(true); } }}
                      title={isAdmin ? "Double-click to rename" : undefined}
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
                    editingCategory && isAdmin ? (
                      <div onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={categoryTag || ""}
                          onValueChange={async (val) => {
                            const otherTags = (script.tags || []).filter(t => !(catSlugsSet.has(t)));
                            await saveMetaField({ tags: [val, ...otherTags] });
                            setEditingCategory(false);
                          }}
                          open={true}
                          onOpenChange={(o) => { if (!o) setEditingCategory(false); }}
                        >
                          <SelectTrigger className="h-5 text-[10px] w-auto min-w-[120px]"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {Array.from(catSlugsSet).sort().map(slug => (
                              <SelectItem key={slug} value={slug} className="text-xs">{slugToLabel(slug)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <Badge
                        variant="outline"
                        className={`text-[10px] text-muted-foreground ${isAdmin && onMetadataSave ? 'cursor-pointer hover:ring-1 ring-primary/40' : ''}`}
                        onClick={(e) => { if (isAdmin && onMetadataSave) { e.stopPropagation(); setEditingCategory(true); } }}
                        title={isAdmin ? "Click to change category" : undefined}
                      >
                        {categoryLabel}
                      </Badge>
                    )
                  )}
                  {script.versions.length > 1 && (
                    <Badge variant="secondary" className="text-[10px]">{script.versions.length} versions</Badge>
                  )}
                  {/* Non-category tags — admin can add/remove inline */}
                  {(script.tags || []).filter(t => !catSlugsSet.has(t)).map(tag => (
                    <Badge key={tag} variant="outline" className={`text-[10px] text-muted-foreground gap-1 ${isAdmin && onMetadataSave ? 'pr-0.5' : ''}`}>
                      {tag}
                      {isAdmin && onMetadataSave && (
                        <button
                          style={{ cursor: 'pointer' }}
                          className="ml-0.5 hover:text-destructive transition-colors"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const updated = (script.tags || []).filter(t => t !== tag);
                            await saveMetaField({ tags: updated });
                          }}
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </Badge>
                  ))}
                  {isAdmin && onMetadataSave && (
                    addingTag ? (
                      <div onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={tagDraft}
                          onChange={(e) => setTagDraft(e.target.value)}
                          placeholder="new tag…"
                          className="h-5 text-[10px] w-20 px-1.5 py-0"
                          autoFocus
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter' && tagDraft.trim()) {
                              e.preventDefault();
                              const updated = [...(script.tags || []), tagDraft.trim().toLowerCase()];
                              await saveMetaField({ tags: updated });
                              setTagDraft(""); setAddingTag(false);
                            } else if (e.key === 'Escape') { setTagDraft(""); setAddingTag(false); }
                          }}
                          onBlur={() => { setTagDraft(""); setAddingTag(false); }}
                        />
                      </div>
                    ) : (
                      <button
                        style={{ cursor: 'pointer' }}
                        className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors border border-dashed border-muted-foreground/30 rounded px-1 py-0.5"
                        onClick={(e) => { e.stopPropagation(); setAddingTag(true); }}
                        title="Add tag"
                      >
                        <Plus className="h-2.5 w-2.5" /> tag
                      </button>
                    )
                  )}
                </div>
              </div>
              {/* Action buttons — only favourite + delete remain */}
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                {onToggleFavourite && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleFavourite}>
                    <Heart className={`h-3.5 w-3.5 ${isFavourite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                )}
                {isAdmin && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 sm:px-6 sm:pb-6">
            <Tabs defaultValue="0">
              {/* Version switcher header */}
              {(script.versions.length > 1 || userVersions.length > 0 || isAuthenticated) && (
                <div className="flex items-center gap-2 flex-wrap mb-3 pb-3 border-b border-border/60">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Versions</span>
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                      {script.versions.length + userVersions.length}
                    </span>
                  </div>
                  <TabsList className="bg-transparent p-0 h-auto gap-1.5 flex-wrap justify-start">
                    {/* Official versions as pill buttons */}
                    {script.versions.map((v, i) => (
                      <TabsTrigger
                        key={i}
                        value={String(i)}
                        style={{ cursor: 'pointer' }}
                        className="text-xs px-3 py-1 h-auto rounded-full border border-border bg-muted/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-sm hover:bg-muted transition-colors"
                      >
                        {editingVersionTitle === i && isAuthenticated && onInlineSave ? (
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
                            style={{ cursor: isAuthenticated && onInlineSave ? 'text' : 'pointer' }}
                            title={isAuthenticated && onInlineSave ? "Double-click to rename" : undefined}
                            onDoubleClick={(e) => { if (isAuthenticated && onInlineSave) { e.stopPropagation(); setVersionTitleDraft(v.title || v.author); setEditingVersionTitle(i); } }}
                          >
                            {v.title || v.author || `Version ${i + 1}`}
                          </span>
                        )}
                      </TabsTrigger>
                    ))}
                    {/* Community user versions */}
                    {userVersions.map((uv) => (
                      <TabsTrigger
                        key={`uv-${uv.id}`}
                        value={`uv-${uv.id}`}
                        style={{ cursor: 'pointer' }}
                        className="text-xs px-3 py-1 h-auto rounded-full border border-border bg-muted/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-sm hover:bg-muted transition-colors"
                      >
                        {editingUserVersionId === uv.id && currentUserId === uv.user_id ? (
                          <span onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={editUserVersionName}
                              onChange={(e) => setEditUserVersionName(e.target.value)}
                              className="h-5 text-[11px] w-24 px-1"
                              autoFocus
                              onKeyDown={async (e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  updateVersion.mutate({ id: uv.id, content: uv.content, authorName: editUserVersionName || uv.author_name });
                                  setEditingUserVersionId(null);
                                } else if (e.key === 'Escape') setEditingUserVersionId(null);
                              }}
                              onBlur={async () => {
                                if (editUserVersionName !== uv.author_name) {
                                  updateVersion.mutate({ id: uv.id, content: uv.content, authorName: editUserVersionName || uv.author_name });
                                }
                                setEditingUserVersionId(null);
                              }}
                            />
                          </span>
                        ) : (
                          <span
                            style={{ cursor: currentUserId === uv.user_id ? 'text' : 'pointer' }}
                            title={currentUserId === uv.user_id ? "Double-click to rename" : undefined}
                            onDoubleClick={(e) => { if (currentUserId === uv.user_id) { e.stopPropagation(); setEditUserVersionName(uv.author_name); setEditingUserVersionId(uv.id); } }}
                          >
                            {uv.author_name}
                          </span>
                        )}
                      </TabsTrigger>
                    ))}
                    {/* Add version button */}
                    {isAuthenticated && (
                      <button
                        style={{ cursor: 'pointer' }}
                        className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                        title="Add your version"
                        onClick={(e) => { e.stopPropagation(); setShowNewVersionForm(true); }}
                      >
                        <Plus className="h-3 w-3" /> Add version
                      </button>
                    )}
                  </TabsList>
                </div>
              )}

              {/* New version form */}
              {showNewVersionForm && (
                <div className="mb-3 border rounded-lg p-3 bg-muted/20 space-y-2">
                  <Input
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    placeholder="Version name (e.g. 'My Style')"
                    className="text-sm"
                    autoFocus
                  />
                  <MinimalRichEditor
                    value={newVersionContent}
                    onChange={setNewVersionContent}
                    placeholder="Write your version... (supports markdown)"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setShowNewVersionForm(false); setNewVersionContent(""); setNewVersionName(""); }}>
                      <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" disabled={!newVersionContent.trim() || addVersion.isPending} onClick={() => {
                      addVersion.mutate(
                        { content: newVersionContent.trim(), authorName: newVersionName.trim() || "My Version" },
                        { onSuccess: () => { setShowNewVersionForm(false); setNewVersionContent(""); setNewVersionName(""); } }
                      );
                    }}>
                      {addVersion.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />Adding…</> : "Add Version"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Official version tab contents */}
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
                          {isSaving ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />Saving…</> : "Save"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditingVersionIdx(null); setEditContent(""); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`prose prose-sm dark:prose-invert max-w-none text-sm rounded-md ${isAuthenticated && onInlineSave ? 'cursor-text hover:bg-muted/30 px-2 py-1 -mx-2 -my-1 transition-colors' : ''}`}
                      onDoubleClick={() => { if (isAuthenticated && onInlineSave) { setEditingVersionIdx(i); setEditContent(v.content); } }}
                      title={isAuthenticated && onInlineSave ? "Double-click to edit" : undefined}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                        {v.content}
                      </ReactMarkdown>
                      <div className="flex gap-1 mt-3">
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => {
                          navigator.clipboard.writeText(markdownToPlainText(v.content));
                          toast.success("Copied to clipboard");
                        }}>
                          <Copy className="h-3 w-3" /> Copy
                        </Button>
                        {isAuthenticated && onInlineSave && (
                          <span className="text-[10px] text-muted-foreground self-center ml-1 italic">double-click to edit</span>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              ))}

              {/* Community user version tab contents */}
              {userVersions.map((uv) => (
                <TabsContent key={`uv-${uv.id}`} value={`uv-${uv.id}`}>
                  {editingUserVersionId === uv.id && currentUserId === uv.user_id && editUserVersionContent !== "__name_only__" ? (
                    <div className="space-y-2">
                      <MinimalRichEditor value={editUserVersionContent} onChange={setEditUserVersionContent} />
                      <div className="flex gap-2">
                        <Button size="sm" disabled={updateVersion.isPending} onClick={() => {
                          updateVersion.mutate({ id: uv.id, content: editUserVersionContent.trim(), authorName: uv.author_name });
                          setEditingUserVersionId(null); setEditUserVersionContent("");
                        }}>
                          {updateVersion.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />Saving…</> : "Save"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditingUserVersionId(null); setEditUserVersionContent(""); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`prose prose-sm dark:prose-invert max-w-none text-sm rounded-md ${currentUserId === uv.user_id ? 'cursor-text hover:bg-muted/30 px-2 py-1 -mx-2 -my-1 transition-colors' : ''}`}
                      onDoubleClick={() => { if (currentUserId === uv.user_id) { setEditUserVersionContent(uv.content); setEditingUserVersionId(uv.id); } }}
                      title={currentUserId === uv.user_id ? "Double-click to edit" : undefined}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                        {uv.content}
                      </ReactMarkdown>
                      <div className="flex gap-1 mt-3">
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => {
                          navigator.clipboard.writeText(markdownToPlainText(uv.content));
                          toast.success("Copied to clipboard");
                        }}>
                          <Copy className="h-3 w-3" /> Copy
                        </Button>
                        {currentUserId === uv.user_id && (
                          <>
                            <span className="text-[10px] text-muted-foreground self-center ml-1 italic">double-click to edit</span>
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => deleteVersion.mutate(uv.id)}>
                              <Trash2 className="h-3 w-3" /> Delete
                            </Button>
                          </>
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
  const [searchParams, setSearchParams] = useSearchParams();
  const internalNavRef = useRef(false);
  const { scripts: dbScripts, loading, refetch } = useScripts();
  const { updateScript, deleteScript, createScript, isAdmin } = useScriptsMutations();
  const { user } = useSimplifiedAuth();
  const { favouriteIds, toggleFavourite } = useScriptFavourites();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "all");
  const [activeAudience, setActiveAudience] = useState(searchParams.get("audience") || "all");
  const [activeRole, setActiveRole] = useState(searchParams.get("role") || "all");
  const [activeTag, setActiveTag] = useState(searchParams.get("tag") || "all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<ScriptEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScriptEntry | null>(null);

  // Base: all servicing scripts
  const servicingBase = useMemo(() => dbScripts.filter(s => s.category === "servicing"), [dbScripts]);

  // All category slugs found in servicing scripts (dynamic — picks up AI-created ones)
  const allCategorySlugs = useMemo(() => {
    const set = new Set<string>();
    servicingBase.forEach(s => (s.tags || []).forEach(t => {
      // A tag is treated as a "category" if it looks like a slug (contains a hyphen or is in known list)
      if (t !== "servicing" && (Object.prototype.hasOwnProperty.call(KNOWN_CATEGORY_LABELS, t) || /^[a-z]+-[a-z]/.test(t))) {
        set.add(t);
      }
    }));
    return Array.from(set).sort();
  }, [servicingBase]);

  // Dynamic tags derived from the live database (non-category tags)
  const allTags = useMemo(() => {
    const catSet = new Set(allCategorySlugs);
    const set = new Set<string>();
    servicingBase.forEach(s => (s.tags || []).forEach(t => {
      if (!catSet.has(t) && t !== "servicing") set.add(t);
    }));
    return Array.from(set).sort();
  }, [servicingBase, allCategorySlugs]);

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
    allCategorySlugs.forEach(key => {
      c[key] = base.filter(s => (s.tags || []).includes(key)).length;
    });
    return c;
  }, [filterExcluding, allCategorySlugs]);

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

  const { mergeState, pendingMerge, startDrag, endDrag, onDragOver, onDragLeave, onDrop, tapSelect, tapTarget, cancelTapSelect, confirmMerge, cancelMerge } = useMergeScripts(
    servicingBase,
    async (scriptId, versions) => { await updateScript(scriptId, { versions }); refetch(); }
  );

  const handleMetadataSave = useCallback(async (scriptId: string, updates: Partial<ScriptEntry>) => {
    await updateScript(scriptId, updates);
    refetch();
  }, [updateScript, refetch]);

  // URL sync: navigate to /servicing/:id when a card is toggled open
  const navigateToScriptInternal = useCallback((id: string) => {
    internalNavRef.current = true;
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (activeAudience !== "all") params.set("audience", activeAudience);
    if (activeRole !== "all") params.set("role", activeRole);
    if (activeTag !== "all") params.set("tag", activeTag);
    if (searchQuery) params.set("q", searchQuery);
    const qs = params.toString();
    navigate(`/servicing/${id}${qs ? `?${qs}` : ''}`, { replace: true });
  }, [navigate, activeCategory, activeAudience, activeRole, activeTag, searchQuery]);

  // Sync filter query params to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (activeAudience !== "all") params.set("audience", activeAudience);
    if (activeRole !== "all") params.set("role", activeRole);
    if (activeTag !== "all") params.set("tag", activeTag);
    setSearchParams(params, { replace: true });
  }, [searchQuery, activeCategory, activeAudience, activeRole, activeTag, setSearchParams]);

  // When navigating to a specific script via URL (external), apply URL filter params
  useEffect(() => {
    if (scriptId) {
      if (internalNavRef.current) { internalNavRef.current = false; return; }
      setActiveCategory(searchParams.get("category") || "all");
      setActiveAudience(searchParams.get("audience") || "all");
      setActiveRole(searchParams.get("role") || "all");
      setActiveTag(searchParams.get("tag") || "all");
      setSearchQuery(searchParams.get("q") || "");
    }
  }, [scriptId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await deleteScript(deleteTarget.id);
    if (ok) refetch();
    setDeleteTarget(null);
  };

  // Active categories that actually have scripts (fully dynamic — includes AI-created ones)
  const activeCategoriesWithData = useMemo(() =>
    allCategorySlugs.filter(key => (categoryCounts[key] ?? 0) > 0),
    [allCategorySlugs, categoryCounts]
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

      <div className="mx-auto px-3 md:px-6 py-3 md:py-8 max-w-4xl">
        <div className="hidden md:block"><ScriptsTabBar /></div>

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
        <div className="mb-4 p-3 md:p-4 rounded-lg border bg-muted/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
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
                      {slugToLabel(key)} ({categoryCounts[key] ?? 0})
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
                {slugToLabel(activeCategory)}
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
            {/* Tap-to-merge banner (mobile) */}
            {mergeState.tapSelectMode && mergeState.sourceId && (
              <div className="flex items-center justify-between gap-2 bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 text-sm">
                <span className="text-primary font-medium">
                  Tap another script to merge into it
                </span>
                <button onClick={cancelTapSelect} className="text-muted-foreground hover:text-foreground text-xs underline">
                  Cancel
                </button>
              </div>
            )}
            {filteredScripts.map((script) => (
              <ServicingScriptCard
                key={script.id}
                script={script}
                isAdmin={isAdmin}
                isAuthenticated={!!user}
                isOpenByUrl={scriptId === script.id}
                onEdit={() => { setEditingScript(script); setEditorOpen(true); }}
                onDelete={() => setDeleteTarget(script)}
                onToggle={(open) => {
                  if (open) {
                    navigateToScriptInternal(script.id);
                  } else if (scriptId === script.id) {
                    navigate('/servicing', { replace: true });
                  }
                }}
                 onInlineSave={handleInlineSave}
                 onMetadataSave={handleMetadataSave}
                 isFavourite={favouriteIds.has(script.id)}
                 onToggleFavourite={user ? () => toggleFavourite.mutate(script.id) : undefined}
                 categorySlugs={new Set(allCategorySlugs)}
                 mergeSourceId={mergeState.sourceId}
                 mergeOverId={mergeState.dragOverId}
                 tapSelectMode={mergeState.tapSelectMode}
                 onMergeDragStart={startDrag}
                 onMergeDragEnd={endDrag}
                 onMergeOver={onDragOver}
                 onMergeLeave={onDragLeave}
                 onMergeDrop={onDrop}
                 onTapSelect={tapSelect}
                 onTapTarget={tapTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Merge confirmation dialog */}
      <AlertDialog open={!!pendingMerge} onOpenChange={(open) => !open && cancelMerge()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <GitMerge className="h-5 w-5 text-primary" />
              Merge versions?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-1">
              <span className="block">Add all versions from <strong>"{pendingMerge?.source.stage}"</strong> into <strong>"{pendingMerge?.target.stage}"</strong>?</span>
              <span className="block text-xs text-muted-foreground">
                {pendingMerge?.source.versions.length} version{pendingMerge?.source.versions.length !== 1 ? "s" : ""} will be appended. The source script will remain unchanged.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMerge} className="gap-1.5">
              <GitMerge className="h-4 w-4" /> Merge versions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

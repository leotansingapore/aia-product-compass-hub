import { useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ChevronDown, Trash2, Loader2, GripVertical, Copy, Check, Plus, Sparkles, Pencil, MessageSquare, Share2, Globe, Heading1, Heading2, Heading3, X, Link, ChevronRight, Users, UserPlus, Clock, CheckCircle, XCircle, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { usePlaybooks, usePlaybookItems } from "@/hooks/usePlaybooks";
import { usePlaybookCollaborators } from "@/hooks/usePlaybookCollaborators";
import { useScripts } from "@/hooks/useScripts";
import { useScriptsMutations } from "@/hooks/useScripts";
import { useObjections } from "@/hooks/useObjections";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { MinimalRichEditor } from "@/components/MinimalRichEditor";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markdownComponents } from "@/lib/markdown-config";
import { AddToPlaybookDialog } from "@/components/playbooks/AddToPlaybookDialog";
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


function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function SectionAnchorLink({ anchor, shareToken }: { anchor: string; shareToken?: string | null }) {
  const [copied, setCopied] = useState(false);
  const base = shareToken
    ? `${window.location.origin}/playbooks/share/${shareToken}`
    : `${window.location.origin}${window.location.pathname}`;
  const url = `${base}#${anchor}`;
  return (
    <button
      title="Copy link to this section"
      onClick={() => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="opacity-0 group-hover/section:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-0.5"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Link className="h-3.5 w-3.5" />}
    </button>
  );
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
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

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
                    {isOwner && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setShowRemoveConfirm(true); }} title="Remove from playbook">
                        <Trash2 className="h-3 w-3" />
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
                  {item.custom_content?.version_index !== undefined && item.script?.versions?.[item.custom_content.version_index] && (
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                      {item.script.versions[item.custom_content.version_index].author || `Version ${item.custom_content.version_index + 1}`}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-3 sm:px-6">
            {(() => {
              const versionIndex = item.custom_content?.version_index;
              const versionsToRender = versionIndex !== undefined && item.script?.versions?.[versionIndex]
                ? [{ version: item.script.versions[versionIndex], originalIndex: versionIndex }]
                : (item.script?.versions || []).map((v: any, i: number) => ({ version: v, originalIndex: i }));
              return versionsToRender.map(({ version, originalIndex }: { version: any; originalIndex: number }) => (
                <div key={originalIndex} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">{version.author || `Version ${originalIndex + 1}`}</Badge>
                    <div className="flex items-center gap-1">
                      {isAuthenticated && editingVersionIdx !== originalIndex && (
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => startInlineEdit(originalIndex)}>
                          <Pencil className="h-3 w-3" /> Edit
                        </Button>
                      )}
                      <CopyButton text={version.content || ""} />
                    </div>
                  </div>
                  {editingVersionIdx === originalIndex ? (
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
              ));
            })()}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
      <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from playbook?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{item.script?.stage}" from the playbook. The original script will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => onRemove(item.id)}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

interface SortableObjectionCardProps {
  item: any;
  index: number;
  isOwner: boolean;
  onRemove: (id: string) => void;
}

function SortableObjectionCard({ item, index, isOwner, onRemove }: SortableObjectionCardProps) {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
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
                  <CardTitle className="text-sm font-medium leading-snug flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                    {item.objection?.title}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    {isOwner && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setShowRemoveConfirm(true); }} title="Remove from playbook">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                </div>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">Objection</Badge>
                  <Badge variant="outline" className="text-[10px]">{item.objection?.category}</Badge>
                  {item.objection?.tags?.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-3 sm:px-6">
            {item.objection?.description && (
              <p className="text-sm text-muted-foreground mb-3">{item.objection.description}</p>
            )}
            <p className="text-xs text-muted-foreground italic">View full objection responses in the Objection Handling database.</p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
      <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from playbook?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the objection "{item.objection?.title}" from the playbook. The original objection will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => onRemove(item.id)}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// ─── Section Header Card (collapsible group) ────────────────────────────────

interface SortableSectionCardProps {
  item: any;
  isOwner: boolean;
  onRemove: (id: string) => void;
  onRename: (id: string, label: string, level?: number) => void;
  shareToken?: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  childCount: number;
  // drag-the-group handle
  groupDragAttributes?: any;
  groupDragListeners?: any;
  isDraggingGroup?: boolean;
}

const LEVEL_CONFIG = {
  1: {
    icon: Heading1,
    textClass: "text-base font-bold",
    borderClass: "border-primary/40",
    bg: "bg-primary/5",
  },
  2: {
    icon: Heading2,
    textClass: "text-sm font-semibold",
    borderClass: "border-muted-foreground/25",
    bg: "bg-muted/40",
  },
  3: {
    icon: Heading3,
    textClass: "text-sm font-medium text-muted-foreground",
    borderClass: "border-muted-foreground/15",
    bg: "bg-muted/20",
  },
};

function SortableSectionCard({
  item, isOwner, onRemove, onRename, shareToken,
  collapsed, onToggleCollapse, childCount,
  groupDragAttributes, groupDragListeners, isDraggingGroup,
}: SortableSectionCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.custom_content?.label || "Section");

  const level: 1 | 2 | 3 = (item.custom_content?.level as 1 | 2 | 3) || 1;
  const cfg = LEVEL_CONFIG[level];
  const LevelIcon = cfg.icon;

  const commit = () => {
    const trimmed = draft.trim() || "Section";
    onRename(item.id, trimmed, level);
    setEditing(false);
  };

  const changeLevel = (newLevel: number) => {
    onRename(item.id, item.custom_content?.label || "Section", newLevel);
  };

  const anchor = slugify(item.custom_content?.label || "section");

  return (
    <div
      id={anchor}
      className={`scroll-mt-6 rounded-lg border ${cfg.borderClass} ${cfg.bg} ${isDraggingGroup ? "ring-2 ring-primary/30 shadow-lg" : ""} group/section`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Group drag handle */}
        {isOwner && (
          <button
            {...groupDragAttributes}
            {...groupDragListeners}
            className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground p-1 shrink-0"
            onClick={e => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title={collapsed ? "Expand section" : "Collapse section"}
        >
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${collapsed ? "-rotate-90" : ""}`} />
        </button>

        {/* Level icon — dropdown to change level */}
        {isOwner ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button title="Change heading level" className="text-primary hover:text-primary/70 transition-colors shrink-0">
                <LevelIcon className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-36">
              <DropdownMenuItem onClick={() => changeLevel(1)} className="gap-2">
                <Heading1 className="h-4 w-4" /> H1 — Stage
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLevel(2)} className="gap-2">
                <Heading2 className="h-4 w-4" /> H2 — Group
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLevel(3)} className="gap-2">
                <Heading3 className="h-4 w-4" /> H3 — Sub-group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <LevelIcon className="h-4 w-4 text-primary shrink-0" />
        )}

        {/* Label */}
        {editing ? (
          <Input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") { setDraft(item.custom_content?.label || "Section"); setEditing(false); }
            }}
            className={`h-7 border-0 border-b border-primary rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 ${cfg.textClass}`}
          />
        ) : (
          <span
            className={`${cfg.textClass} flex-1 leading-none truncate ${isOwner ? "cursor-pointer hover:text-primary transition-colors" : ""}`}
            onClick={() => isOwner && setEditing(true)}
          >
            {item.custom_content?.label || "Section"}
          </span>
        )}

        {/* Child count badge */}
        {childCount > 0 && collapsed && (
          <span className="text-xs text-muted-foreground bg-background/70 border rounded-full px-2 py-0.5 font-mono shrink-0">
            {childCount}
          </span>
        )}

        {/* Actions */}
        <div className="opacity-0 group-hover/section:opacity-100 transition-opacity flex items-center gap-1 shrink-0 ml-1">
          <SectionAnchorLink anchor={anchor} shareToken={shareToken} />
          {isOwner && (
            <>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditing(true)} title="Rename">
                <Pencil className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onRemove(item.id)} title="Delete section">
                <X className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PlaybookDetail() {
  const { playbookId } = useParams();
  const navigate = useNavigate();
  const { user } = useSimplifiedAuth();
  const queryClient = useQueryClient();
  const { playbooks, togglePublic } = usePlaybooks();
  const { items, isLoading, removeItem, reorderItems } = usePlaybookItems(playbookId || null);
  const { scripts, loading: scriptsLoading, refetch } = useScripts();
  const { updateScript } = useScriptsMutations();
  const { entries: objections, loading: objectionsLoading } = useObjections();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ script_id: string; reason: string; suggested_position: string }[] | null>(null);
  const [aiSummary, setAiSummary] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [collaboratorSearch, setCollaboratorSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  // Collapsed section state: maps section item id → boolean (true = collapsed)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const playbook = playbooks.find(p => p.id === playbookId);
  const { isMasterAdmin, hasRole } = usePermissions();
  const isActualOwner = user?.id === playbook?.created_by || isMasterAdmin() || hasRole('admin');

  const {
    collaborators,
    editRequests,
    myRequest,
    isCollaborator,
    addCollaborator,
    removeCollaborator,
    requestEditAccess,
    approveRequest,
    rejectRequest,
  } = usePlaybookCollaborators(playbookId);

  const isOwner = isActualOwner || isCollaborator;
  const pendingRequests = editRequests.filter(r => r.status === 'pending');

  const itemsWithData = useMemo(() => {
    return items.map(item => ({
      ...item,
      script: item.item_type === 'script' ? scripts.find(s => s.id === item.script_id) : undefined,
      objection: item.item_type === 'objection' ? objections.find(o => o.id === item.objection_id) : undefined,
    })).filter(item => item.item_type === 'section' || item.script || item.objection);
  }, [items, scripts, objections]);

  const { addItem } = usePlaybookItems(playbookId || null);

  const handleAddSection = async (level: 1 | 2 | 3 = 1) => {
    if (!playbookId) return;
    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) + 1 : 0;
    const labels = { 1: 'New Stage', 2: 'New Group', 3: 'New Sub-group' };
    await supabase.from('script_playbook_items').insert({
      playbook_id: playbookId,
      item_type: 'section',
      sort_order: maxOrder,
      custom_content: { label: labels[level], level },
    } as any);
    queryClient.invalidateQueries({ queryKey: ['playbook-items', playbookId] });
  };

  const handleRenameSection = async (itemId: string, label: string, level?: number) => {
    const existing = items.find(i => i.id === itemId);
    const existingLevel = (existing?.custom_content as any)?.level || 1;
    await supabase.from('script_playbook_items').update({ custom_content: { label, level: level ?? existingLevel } } as any).eq('id', itemId);
    queryClient.invalidateQueries({ queryKey: ['playbook-items', playbookId] });
  };

  const handleUserSearch = async (query: string) => {
    setCollaboratorSearch(query);
    if (query.length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, display_name, first_name, last_name, email')
        .or(`display_name.ilike.%${query}%,email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .limit(6);
      // Exclude already-collaborators and owner
      const existingIds = new Set([
        playbook?.created_by,
        ...collaborators.map(c => c.user_id),
      ]);
      setSearchResults((data || []).filter(p => !existingIds.has(p.user_id)));
    } finally {
      setIsSearching(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = itemsWithData.findIndex(i => i.id === active.id);
    const newIndex = itemsWithData.findIndex(i => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...itemsWithData];
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

  const handleAISuggest = async () => {
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
      const existingScripts = itemsWithData.filter(i => i.script).map(i => ({
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
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              {/* ── Share dropdown ── */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={playbook?.is_public ? "secondary" : "outline"}
                    size="sm"
                    className="gap-1.5 flex-1 sm:flex-initial"
                  >
                    {playbook?.is_public ? <Globe className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                    {playbook?.is_public ? "Shared" : "Share"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-96 p-4 max-h-[80vh] overflow-y-auto" align="end" onClick={e => e.stopPropagation()}>
                  <p className="font-semibold text-sm mb-3">Share & Collaborators</p>

                  {/* ── Collaborators section ── */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <Label className="text-sm">Editors</Label>
                      {collaborators.length > 0 && (
                        <span className="text-xs text-muted-foreground">({collaborators.length})</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Grant specific users edit access to this playbook.</p>

                    {/* Search to add */}
                    <div className="relative mb-2">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or email…"
                        value={collaboratorSearch}
                        onChange={e => handleUserSearch(e.target.value)}
                        className="h-8 pl-8 text-xs"
                      />
                    </div>

                    {/* Search results */}
                    {searchResults.length > 0 && (
                      <div className="border rounded-md overflow-hidden mb-2">
                        {searchResults.map(p => {
                          const name = p.display_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email;
                          return (
                            <div key={p.user_id} className="flex items-center justify-between px-3 py-1.5 hover:bg-muted/50 text-xs">
                              <div className="min-w-0">
                                <p className="font-medium truncate">{name}</p>
                                <p className="text-muted-foreground truncate">{p.email}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 ml-2 shrink-0 gap-1 text-xs"
                                onClick={() => {
                                  addCollaborator.mutate(p.user_id);
                                  setSearchResults([]);
                                  setCollaboratorSearch("");
                                }}
                              >
                                <UserPlus className="h-3 w-3" /> Add
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Existing collaborators list */}
                    {collaborators.length > 0 ? (
                      <div className="space-y-1">
                        {collaborators.map(c => {
                          const name = c.profile?.display_name || `${c.profile?.first_name || ''} ${c.profile?.last_name || ''}`.trim() || c.profile?.email || c.user_id;
                          return (
                            <div key={c.id} className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/50 text-xs">
                              <div className="min-w-0">
                                <p className="font-medium truncate">{name}</p>
                                <p className="text-muted-foreground truncate">{c.profile?.email}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 ml-2 shrink-0 text-destructive hover:text-destructive"
                                onClick={() => removeCollaborator.mutate(c.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No editors added yet.</p>
                    )}
                  </div>

                  {/* ── Pending edit requests ── */}
                  {pendingRequests.length > 0 && (
                    <>
                      <Separator className="mb-3" />
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          <Label className="text-sm">Edit Requests</Label>
                          <span className="text-xs bg-primary/10 text-primary rounded-full px-1.5 py-0.5 font-medium">{pendingRequests.length}</span>
                        </div>
                        <div className="space-y-1.5">
                          {pendingRequests.map(req => (
                            <div key={req.id} className="flex items-center justify-between px-2 py-1.5 rounded-md border text-xs">
                              <div className="min-w-0">
                                <p className="font-medium truncate">{req.requester_name || 'Unknown'}</p>
                                <p className="text-muted-foreground truncate">{req.requester_email}</p>
                              </div>
                              <div className="flex gap-1 ml-2 shrink-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-primary hover:text-primary"
                                  title="Approve"
                                  onClick={() => approveRequest.mutate(req)}
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  title="Reject"
                                  onClick={() => rejectRequest.mutate(req.id)}
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator className="mb-3" />

                  {/* Enable / disable public sharing */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label className="text-sm">Public link</Label>
                      <p className="text-xs text-muted-foreground">Anyone with the link can view</p>
                    </div>
                    <Switch
                      checked={!!playbook?.is_public}
                      onCheckedChange={(checked) => {
                        if (!playbook) return;
                        togglePublic.mutate({ id: playbook.id, isPublic: checked });
                      }}
                    />
                  </div>

                  {playbook?.is_public && playbook?.share_token && (
                    <>
                      {/* View-only link */}
                      <div className="space-y-1 mb-3">
                        <Label className="text-xs text-muted-foreground">View-only link</Label>
                        <div className="flex gap-1.5">
                          <Input
                            readOnly
                            value={`${window.location.origin}/playbooks/share/${playbook.share_token}`}
                            className="h-8 text-xs font-mono bg-muted border-0"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 shrink-0"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/playbooks/share/${playbook.share_token}`);
                              toast.success('Link copied');
                            }}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Allow edit toggle */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <Label className="text-sm">Allow editing</Label>
                          <p className="text-xs text-muted-foreground">Viewers can edit scripts in this playbook</p>
                        </div>
                        <Switch
                          checked={!!(playbook as any).allow_public_edit}
                          onCheckedChange={async (checked) => {
                            await supabase.from('script_playbooks').update({ allow_public_edit: checked } as any).eq('id', playbook!.id);
                            queryClient.invalidateQueries({ queryKey: ['playbooks'] });
                            toast.success(checked ? 'Editing enabled for viewers' : 'Editing disabled');
                          }}
                        />
                      </div>

                      {(playbook as any).allow_public_edit && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Edit link (same URL)</Label>
                          <div className="flex gap-1.5">
                            <Input
                              readOnly
                              value={`${window.location.origin}/playbooks/share/${playbook.share_token}`}
                              className="h-8 text-xs font-mono bg-muted border-0"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 shrink-0"
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/playbooks/share/${playbook.share_token}`);
                                toast.success('Edit link copied');
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" onClick={handleAISuggest} disabled={isAiLoading} className="gap-1.5 flex-1 sm:flex-initial">
                {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                AI Suggest
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1.5 flex-1 sm:flex-initial">
                    <Heading1 className="h-4 w-4" /> Add Section <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => handleAddSection(1)} className="gap-2">
                    <Heading1 className="h-4 w-4" /> H1 — Stage
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddSection(2)} className="gap-2">
                    <Heading2 className="h-4 w-4" /> H2 — Group
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddSection(3)} className="gap-2">
                    <Heading3 className="h-4 w-4" /> H3 — Sub-group
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => setAddDialogOpen(true)} className="gap-2 flex-1 sm:flex-initial">
                <Plus className="h-4 w-4" /> Add Items
              </Button>
            </div>
          )}
          {/* Request Edit Access — shown to non-owners who are authenticated */}
          {!isOwner && user && (
            <div className="mt-3 sm:mt-0 sm:ml-auto">
              {myRequest?.status === 'approved' ? (
                <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                  <CheckCircle className="h-3.5 w-3.5" /> Edit access granted
                </div>
              ) : myRequest?.status === 'pending' ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Clock className="h-3.5 w-3.5" /> Request pending approval
                </div>
              ) : myRequest?.status === 'rejected' ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <XCircle className="h-3.5 w-3.5" /> Request was declined
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => requestEditAccess.mutate()}
                  disabled={requestEditAccess.isPending}
                >
                  {requestEditAccess.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                  Request Edit Access
                </Button>
              )}
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
                            addItem.mutate({ scriptId: suggestion.script_id, itemType: 'script' });
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

        {/* Items List */}
        {isLoading || scriptsLoading || objectionsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : itemsWithData.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No items in this playbook yet.</p>
              {isOwner && (
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Items
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
            <SortableContext items={itemsWithData.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {(() => {
                  // Build groups: each section starts a new group; items before the first section are "ungrouped"
                  type Group = { section: any | null; children: any[] };
                  const groups: Group[] = [];
                  let current: Group = { section: null, children: [] };
                  for (const item of itemsWithData) {
                    if (item.item_type === 'section') {
                      groups.push(current);
                      current = { section: item, children: [] };
                    } else {
                      current.children.push(item);
                    }
                  }
                  groups.push(current);

                  let globalCounter = 0;
                  return groups.map((group, gi) => {
                    if (!group.section && group.children.length === 0) return null;

                    const sectionId = group.section?.id ?? `root-${gi}`;
                    const isCollapsed = group.section ? !!collapsedSections[group.section.id] : false;

                    // Drag props for the group wrapper (section item)
                    // We wrap the group in a SortableContext item for dragging by section id
                    const GroupWrapper = ({ children }: { children: React.ReactNode }) => {
                      if (!group.section) return <>{children}</>;
                      const {
                        attributes,
                        listeners,
                        setNodeRef,
                        transform,
                        transition,
                        isDragging,
                      } = useSortable({ id: group.section.id });
                      const style = {
                        transform: CSS.Transform.toString(transform),
                        transition,
                        zIndex: isDragging ? 50 : undefined,
                        opacity: isDragging ? 0.85 : 1,
                      };
                      return (
                        <div ref={setNodeRef} style={style}>
                          <SortableSectionCard
                            item={group.section}
                            isOwner={isOwner}
                            onRemove={(id) => removeItem.mutate(id)}
                            onRename={handleRenameSection}
                            shareToken={playbook?.share_token}
                            collapsed={isCollapsed}
                            onToggleCollapse={() => setCollapsedSections(prev => ({ ...prev, [group.section.id]: !prev[group.section.id] }))}
                            childCount={group.children.length}
                            groupDragAttributes={attributes}
                            groupDragListeners={listeners}
                            isDraggingGroup={isDragging}
                          />
                          {children}
                        </div>
                      );
                    };

                    const childrenEl = !isCollapsed && (
                      <div className={`space-y-2 ${group.section ? "mt-2 pl-2 border-l-2 border-muted ml-3" : ""}`}>
                        {group.children.map((item) => {
                          const idx = globalCounter++;
                          if (item.item_type === 'objection' && item.objection) {
                            return (
                              <SortableObjectionCard
                                key={item.id}
                                item={item}
                                index={idx}
                                isOwner={isOwner}
                                onRemove={(id) => removeItem.mutate(id)}
                              />
                            );
                          }
                          return (
                            <SortableScriptCard
                              key={item.id}
                              item={item}
                              index={idx}
                              isOwner={isOwner}
                              onRemove={(id) => removeItem.mutate(id)}
                              onInlineSave={handleInlineSave}
                              isAuthenticated={!!user}
                            />
                          );
                        })}
                      </div>
                    );

                    if (!group.section) {
                      return (
                        <div key={`root-${gi}`} className="space-y-2">
                          {childrenEl}
                        </div>
                      );
                    }

                    return (
                      <GroupWrapper key={group.section.id}>
                        {childrenEl}
                      </GroupWrapper>
                    );
                  });
                })()}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add to Playbook Dialog */}
      <AddToPlaybookDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        scripts={scripts}
        objections={objections}
        items={items}
        onAddScript={(id, versionIndex) => addItem.mutate({ scriptId: id, itemType: 'script', versionIndex })}
        onAddObjection={(id) => addItem.mutate({ objectionId: id, itemType: 'objection' })}
      />
    </PageLayout>
  );
}

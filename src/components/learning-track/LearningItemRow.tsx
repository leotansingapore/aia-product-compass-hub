import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Clock, Trash2, Copy, Bookmark, History, ArrowRightLeft } from "lucide-react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import {
  useUpdateItem,
  useDeleteItem,
  useDuplicateItem,
  useMoveItemToPhase,
} from "@/hooks/learning-track/useAdminLearningTrackMutations";
import { useLearningTrackPhases } from "@/hooks/learning-track/useLearningTrackPhases";
import { InlineEditableText } from "./InlineEditableText";
import { InlineEditableList } from "./InlineEditableList";
import { ContentBlockEditor } from "./ContentBlockEditor";
import { RelatedResources } from "./RelatedResources";
import { SubmissionPanel } from "./SubmissionPanel";
import { SaveAsTemplateDialog } from "./SaveAsTemplateDialog";
import { ItemHistoryDialog } from "./ItemHistoryDialog";
import { PublishToggle } from "./PublishToggle";
import type { LearningTrackItem, ItemStatus } from "@/types/learning-track";
import { cn } from "@/lib/utils";

interface LearningItemRowProps {
  item: LearningTrackItem;
  isCompleted: boolean;
  defaultExpanded?: boolean;
  readOnly?: boolean;
  viewAsUserId?: string;
}

const STATUS_ICON: Record<ItemStatus, JSX.Element> = {
  not_started: <Circle className="h-5 w-5 text-muted-foreground" />,
  in_progress: <Clock className="h-5 w-5 text-amber-500" />,
  completed: <CheckCircle2 className="h-5 w-5 text-green-600" />,
};

export function LearningItemRow({
  item,
  isCompleted,
  defaultExpanded = false,
  readOnly = false,
  viewAsUserId,
}: LearningItemRowProps) {
  const { user } = useSimplifiedAuth();
  const { isAdmin } = useAdmin();
  const targetUserId = viewAsUserId ?? user?.id;
  const { setStatus, getStatus } = useLearningTrackProgress(targetUserId);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const status = getStatus(item.id);
  const rowRef = useRef<HTMLDivElement>(null);

  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const duplicateItem = useDuplicateItem();
  const moveItem = useMoveItemToPhase();
  const prePhases = useLearningTrackPhases("pre_rnf");
  const postPhases = useLearningTrackPhases("post_rnf");
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [moveMenuOpen, setMoveMenuOpen] = useState(false);

  const allPhases = [
    ...((prePhases.data ?? []).map(p => ({ ...p, trackLabel: "Pre" }))),
    ...((postPhases.data ?? []).map(p => ({ ...p, trackLabel: "Post" }))),
  ].filter(p => p.id !== item.phase_id);

  const showAdmin = isAdmin && !readOnly;

  useEffect(() => {
    if (defaultExpanded) {
      setExpanded(true);
      const t = setTimeout(() => rowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      return () => clearTimeout(t);
    }
  }, [defaultExpanded]);

  const handleDelete = () => {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    deleteItem.mutate(item.id);
  };

  const handleDuplicate = () => {
    duplicateItem.mutate({ sourceItemId: item.id });
  };

  return (
    <div ref={rowRef} className="px-4 py-3" id={`item-${item.id}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          disabled={readOnly || setStatus.isPending}
          onClick={() => {
            const next: ItemStatus = isCompleted ? "not_started" : "completed";
            setStatus.mutate({ itemId: item.id, status: next });
          }}
          aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
          className={cn("mt-1 rounded-full p-0.5 transition-all min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center", setStatus.isPending && "opacity-50 animate-pulse")}
        >
          {STATUS_ICON[status]}
        </button>
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="w-full text-left"
            aria-expanded={expanded}
          >
            <div className="flex items-center gap-2">
              {expanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
              {showAdmin ? (
                <InlineEditableText
                  value={item.title}
                  onSave={(v) => updateItem.mutate({ id: item.id, title: v })}
                  isAdmin
                  as="h3"
                  className={cn("font-medium", isCompleted && "line-through text-muted-foreground")}
                />
              ) : (
                <h3 className={cn("font-medium", isCompleted && "line-through text-muted-foreground")}>
                  {item.title}
                </h3>
              )}
            </div>
            {showAdmin ? (
              <div className="ml-6 mt-1">
                <InlineEditableText
                  value={item.description ?? ""}
                  onSave={(v) => updateItem.mutate({ id: item.id, description: v || null })}
                  isAdmin
                  as="p"
                  className="text-sm text-muted-foreground"
                  placeholder="Add description..."
                />
              </div>
            ) : (
              item.description && (
                <p className="ml-6 mt-1 text-sm text-muted-foreground">{item.description}</p>
              )
            )}
          </button>

          {/* Admin action buttons — below title on mobile, inline on desktop */}
          {showAdmin && (
            <div className="flex items-center gap-1 mt-2 ml-6 flex-wrap">
              <PublishToggle
                publishedAt={item.published_at}
                onToggle={(next) => updateItem.mutate({ id: item.id, published_at: next })}
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setHistoryOpen(true); }}
                className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
                aria-label="View history"
                title="View version history / undo"
              >
                <History className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSaveTemplateOpen(true); }}
                className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Save as template"
                title="Save this item as a reusable template"
              >
                <Bookmark className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDuplicate(); }}
                className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Duplicate item"
                title="Duplicate this item"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMoveMenuOpen(o => !o); }}
                  className="h-7 w-7 flex items-center justify-center rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Move to another phase"
                  title="Move to another phase"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                </button>
                {moveMenuOpen && (
                  <div className="absolute left-0 top-full mt-1 z-50 bg-popover border rounded-md shadow-lg py-1 min-w-[220px] max-h-[300px] overflow-y-auto">
                    <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Move to phase…</div>
                    {allPhases.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem.mutate({ itemId: item.id, targetPhaseId: p.id });
                          setMoveMenuOpen(false);
                        }}
                      >
                        <span className="text-xs text-muted-foreground font-medium shrink-0">{p.trackLabel}</span>
                        <span className="truncate">{p.title}</span>
                      </button>
                    ))}
                    {allPhases.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">No other phases available</div>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                className="h-7 w-7 flex items-center justify-center rounded text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Delete item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="ml-8 mt-4 space-y-4">
          {/* Objectives */}
          {(item.objectives && item.objectives.length > 0) || showAdmin ? (
            <div>
              <h4 className="text-sm font-semibold">Objectives</h4>
              {showAdmin ? (
                <InlineEditableList
                  items={item.objectives ?? []}
                  onSave={(v) => updateItem.mutate({ id: item.id, objectives: v })}
                  isAdmin
                />
              ) : (
                <ul className="ml-4 list-disc text-sm">
                  {(item.objectives ?? []).map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          {/* Action items */}
          {(item.action_items && item.action_items.length > 0) || showAdmin ? (
            <div>
              <h4 className="text-sm font-semibold">Action items</h4>
              {showAdmin ? (
                <InlineEditableList
                  items={item.action_items ?? []}
                  onSave={(v) => updateItem.mutate({ id: item.id, action_items: v })}
                  isAdmin
                  bulletColor="bg-amber-500"
                />
              ) : (
                <ul className="ml-4 list-disc text-sm">
                  {(item.action_items ?? []).map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          {/* Submission toggle for admin */}
          {showAdmin && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={item.requires_submission}
                onChange={(e) => updateItem.mutate({ id: item.id, requires_submission: e.target.checked })}
                className="rounded border-muted-foreground/30"
              />
              <span className="text-muted-foreground">Requires submission</span>
            </label>
          )}

          {/* Content blocks - now with admin editing */}
          <ContentBlockEditor blocks={item.content_blocks} itemId={item.id} />

          <RelatedResources item={item} />

          {item.requires_submission && (
            <SubmissionPanel itemId={item.id} userId={targetUserId} readOnly={readOnly} />
          )}
        </div>
      )}
      <SaveAsTemplateDialog
        open={saveTemplateOpen}
        onClose={() => setSaveTemplateOpen(false)}
        itemId={item.id}
        itemTitle={item.title}
      />
      <ItemHistoryDialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        itemId={item.id}
        itemTitle={item.title}
      />
    </div>
  );
}

import { useState, useCallback, useRef, useEffect, forwardRef } from "react";
import {
  ArrowLeft,
  Trash2,
  Copy,
  Bookmark,
  History,
  ArrowRightLeft,
  Eye,
  EyeOff,
  SquarePen,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { detectVideoEmbed } from "@/lib/video-embed-utils";
import { VideoEmbed } from "@/lib/video-embed";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  useUpdateItem,
  useDeleteItem,
  useDuplicateItem,
  useMoveItemToPhase,
} from "@/hooks/learning-track/useAdminLearningTrackMutations";
import { useLearningTrackPhases } from "@/hooks/learning-track/useLearningTrackPhases";
import { MinimalRichEditor, type MinimalRichEditorHandle } from "@/components/MinimalRichEditor";
import { InlineEditableText } from "./InlineEditableText";
import { InlineEditableList } from "./InlineEditableList";
import { RelatedResources } from "./RelatedResources";
import { SubmissionPanel } from "./SubmissionPanel";
import { SaveAsTemplateDialog } from "./SaveAsTemplateDialog";
import { ItemHistoryDialog } from "./ItemHistoryDialog";
import { PublishToggle } from "./PublishToggle";
import { PrerequisiteItemPicker } from "./admin/PrerequisiteItemPicker";
import type { LearningTrackItem, LearningTrackPhase } from "@/types/learning-track";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface AdminLessonEditorProps {
  item: LearningTrackItem;
  trackPhases?: LearningTrackPhase[];
  onBack: () => void;
  /** When true, hides the "Back to lessons" top bar (desktop sidebar handles navigation). */
  hideBackButton?: boolean;
}

export function AdminLessonEditor({ item, trackPhases, onBack, hideBackButton }: AdminLessonEditorProps) {
  const [contentSaveStatus, setContentSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const contentRef = useRef<string | null>(null);
  const blockIdRef = useRef<string | null>(
    item.content_blocks?.find((b) => b.block_type === "text")?.id ?? null
  );
  const richEditorRef = useRef<MinimalRichEditorHandle>(null);
  const qc = useQueryClient();

  const handleEditorMarkdownChange = useCallback((md: string) => {
    contentRef.current = md;
  }, []);

  useEffect(() => {
    const textBlock = item.content_blocks?.find((b) => b.block_type === "text");
    blockIdRef.current = textBlock?.id ?? null;
  }, [item.id, item.content_blocks]);

  const handleSaveContent = useCallback(async () => {
    setContentSaveStatus("saving");
    let markdown: string;
    try {
      if (richEditorRef.current) {
        markdown = await richEditorRef.current.getMarkdownForSave();
      } else {
        markdown = contentRef.current ?? "";
      }
    } catch (e) {
      console.error("Editor flush failed:", e);
      markdown = contentRef.current ?? "";
    }

    try {
      if (blockIdRef.current) {
        const { error } = await supabase
          .from("learning_track_content_blocks")
          .update({ body: markdown })
          .eq("id", blockIdRef.current);
        if (error) throw error;
      } else {
        const maxOrder =
          item.content_blocks?.reduce((m, b) => Math.max(m, b.order_index), -1) ?? -1;
        const { data, error } = await supabase
          .from("learning_track_content_blocks")
          .insert({
            item_id: item.id,
            block_type: "text",
            body: markdown,
            order_index: maxOrder + 1,
          })
          .select("id")
          .single();
        if (error) throw error;
        if (data) blockIdRef.current = data.id;
      }
      setContentSaveStatus("saved");
      setIsEditingContent(false);
      await qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
    } catch (err: unknown) {
      console.error("Save failed:", err);
      setContentSaveStatus("idle");
      const message = err instanceof Error ? err.message : "Please try again.";
      toast({ title: "Failed to save", description: message, variant: "destructive" });
    }
  }, [item.id, item.content_blocks, qc]);
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const duplicateItem = useDuplicateItem();
  const moveItem = useMoveItemToPhase();
  const prePhases = useLearningTrackPhases("pre_rnf");
  const postPhases = useLearningTrackPhases("post_rnf");
  const explorerPhases = useLearningTrackPhases("explorer");
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [moveMenuOpen, setMoveMenuOpen] = useState(false);

  // Edit/preview toggle — auto-enter edit mode when content is empty
  const initialBody = item.content_blocks?.find((b) => b.block_type === "text")?.body ?? "";
  const [isEditingContent, setIsEditingContent] = useState(!initialBody.trim());

  const allPhases = [
    ...((explorerPhases.data ?? []).map(p => ({ ...p, trackLabel: "Explorer" }))),
    ...((prePhases.data ?? []).map(p => ({ ...p, trackLabel: "Pre-RNF" }))),
    ...((postPhases.data ?? []).map(p => ({ ...p, trackLabel: "Post-RNF" }))),
  ].filter(p => p.id !== item.phase_id);

  const isPublished = !!item.published_at;

  const handleDelete = () => {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    deleteItem.mutate(item.id, { onSuccess: onBack });
  };

  const handleDuplicate = () => {
    duplicateItem.mutate({ sourceItemId: item.id });
  };

  return (
    <div className="space-y-0">
      {/* Top bar: back + actions */}
      <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
        {hideBackButton ? (
          <div />
        ) : (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to lessons
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[10px] transition-colors",
            contentSaveStatus === "saving" ? "text-amber-600" : contentSaveStatus === "saved" ? "text-green-600" : "text-muted-foreground/50",
          )}>
            {contentSaveStatus === "saving" ? "Saving..." : contentSaveStatus === "saved" ? "Saved" : ""}
          </span>
          <button
            type="button"
            onClick={handleSaveContent}
            disabled={contentSaveStatus === "saving"}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
              contentSaveStatus === "saving"
                ? "bg-muted text-muted-foreground cursor-wait"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {contentSaveStatus === "saving" ? "Saving..." : "Save"}
          </button>
          <PublishToggle
            publishedAt={item.published_at}
            onToggle={(next) => updateItem.mutate({ id: item.id, published_at: next })}
          />
        </div>
      </div>

      {/* Lesson title + description */}
      <div className="px-5 py-5 space-y-3 border-b">
        <InlineEditableText
          value={item.title}
          onSave={(v) => updateItem.mutate({ id: item.id, title: v })}
          isAdmin
          as="h3"
          className="text-xl font-semibold"
        />
        <InlineEditableText
          value={item.description ?? ""}
          onSave={(v) => updateItem.mutate({ id: item.id, description: v || null })}
          isAdmin
          as="p"
          className="text-sm text-muted-foreground"
          placeholder="Add a description for this lesson..."
        />
      </div>

      {/* Content — edit/preview toggle */}
      <div className="px-5 py-5 space-y-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Content</h3>
          {isEditingContent ? (
            <button
              type="button"
              onClick={() => setIsEditingContent(false)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingContent(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <SquarePen className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
        </div>

        {isEditingContent ? (
          <LessonRichEditor
            key={item.id}
            ref={richEditorRef}
            item={item}
            onContentChange={handleEditorMarkdownChange}
          />
        ) : (
          <LessonContentPreview body={contentRef.current ?? initialBody} onEdit={() => setIsEditingContent(true)} />
        )}
        <RelatedResources item={item} />
      </div>

      {/* Objectives + Action items */}
      <div className="px-5 py-5 space-y-4 border-b">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Objectives & Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Objectives</h4>
            <InlineEditableList
              items={item.objectives ?? []}
              onSave={(v) => updateItem.mutate({ id: item.id, objectives: v })}
              isAdmin
            />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Action items</h4>
            <InlineEditableList
              items={item.action_items ?? []}
              onSave={(v) => updateItem.mutate({ id: item.id, action_items: v })}
              isAdmin
              bulletColor="bg-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="px-5 py-5 space-y-4 border-b">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settings</h3>

        <div className="flex items-center justify-between">
          <Label htmlFor="requires-submission" className="text-sm cursor-pointer">
            Requires submission
          </Label>
          <Switch
            id="requires-submission"
            checked={item.requires_submission}
            onCheckedChange={(checked) => updateItem.mutate({ id: item.id, requires_submission: checked })}
          />
        </div>

        {trackPhases && trackPhases.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Prerequisites</h4>
            <PrerequisiteItemPicker item={item} trackPhases={trackPhases} />
          </div>
        )}
      </div>

      {/* Submission panel (if applicable) */}
      {item.requires_submission && (
        <div className="px-5 py-5 border-b">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Submissions</h3>
          <SubmissionPanel itemId={item.id} userId={undefined} />
        </div>
      )}

      {/* Actions toolbar */}
      <div className="px-5 py-4 flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)} className="gap-1.5">
          <History className="h-3.5 w-3.5" />
          History
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSaveTemplateOpen(true)} className="gap-1.5">
          <Bookmark className="h-3.5 w-3.5" />
          Save as template
        </Button>
        <Button variant="outline" size="sm" onClick={handleDuplicate} className="gap-1.5">
          <Copy className="h-3.5 w-3.5" />
          Duplicate
        </Button>
        <div className="relative">
          <Button variant="outline" size="sm" onClick={() => setMoveMenuOpen((o) => !o)} className="gap-1.5">
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Move
          </Button>
          {moveMenuOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 bg-popover border rounded-lg shadow-lg py-1 min-w-[240px] max-h-[300px] overflow-y-auto">
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Move to phase…</div>
              {allPhases.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                  onClick={() => {
                    moveItem.mutate({ itemId: item.id, targetPhaseId: p.id }, { onSuccess: onBack });
                    setMoveMenuOpen(false);
                  }}
                >
                  <span className="text-xs text-muted-foreground font-medium shrink-0">{p.trackLabel}</span>
                  <span className="truncate">{p.title}</span>
                </button>
              ))}
              {allPhases.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">No other phases</div>
              )}
            </div>
          )}
        </div>

        <div className="ml-auto">
          <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1.5">
            <Trash2 className="h-3.5 w-3.5" />
            Delete lesson
          </Button>
        </div>
      </div>

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

/** Rendered preview of lesson markdown content. */
function LessonContentPreview({ body, onEdit }: { body: string; onEdit: () => void }) {
  if (!body.trim()) {
    return (
      <div
        className="min-h-[120px] rounded-lg border border-dashed bg-muted/20 flex items-center justify-center cursor-pointer hover:bg-muted/40 transition-colors"
        onClick={onEdit}
      >
        <p className="text-sm text-muted-foreground">No content yet. Click Edit to start writing.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-background p-4">
      <article className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-serif prose-a:text-primary prose-img:rounded-lg">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            a: ({ href, children, ...props }) => {
              if (href) {
                const text = String(children ?? "").trim();
                if (/^(?:youtube|vimeo|loom|mp4)\s+video$/i.test(text) || /^video$/i.test(text)) {
                  const info = detectVideoEmbed(href);
                  if (info.isVideo && info.embedUrl) {
                    return <VideoEmbed embedUrl={info.embedUrl} platform={info.platform!} />;
                  }
                }
              }
              return <a href={href} target="_blank" rel="noreferrer" {...props}>{children}</a>;
            },
          }}
        >
          {body}
        </ReactMarkdown>
      </article>
    </div>
  );
}

/** Simple rich text editor — just renders the editor and calls onContentChange with markdown. */
const LessonRichEditor = forwardRef<
  MinimalRichEditorHandle,
  { item: LearningTrackItem; onContentChange: (markdown: string) => void }
>(function LessonRichEditor({ item, onContentChange }, ref) {
  const textBlock = item.content_blocks?.find((b) => b.block_type === "text");
  const serverBody = textBlock?.body ?? "";
  const [draftBody, setDraftBody] = useState(serverBody);

  useEffect(() => {
    setDraftBody(serverBody);
    onContentChange(serverBody);
  }, [item.id, serverBody, onContentChange]);

  const handleChange = useCallback((md: string) => {
    setDraftBody(md);
    onContentChange(md);
  }, [onContentChange]);

  return (
    <div className="min-h-[200px] rounded-lg border bg-background">
      <MinimalRichEditor
        ref={ref}
        value={draftBody}
        onChange={handleChange}
        placeholder="Write your lesson content here... Use the toolbar to format text, add images, embed videos, and more."
        showToolbar
      />
    </div>
  );
});

LessonRichEditor.displayName = "LessonRichEditor";

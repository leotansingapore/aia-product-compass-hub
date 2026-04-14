import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ExternalLink, Video, Trash2, Plus, FileText, Link } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import {
  useCreateContentBlock,
  useUpdateContentBlock,
  useDeleteContentBlock,
} from "@/hooks/learning-track/useAdminLearningTrackMutations";
import { InlineEditableText } from "./InlineEditableText";
import { isVideoUrl, isImageUrl } from "@/lib/learning-track-url";
import type { LearningTrackContentBlock, BlockType } from "@/types/learning-track";

interface Props {
  blocks: LearningTrackContentBlock[];
  itemId: string;
}

const BLOCK_TYPE_OPTIONS: { value: BlockType; label: string; icon: JSX.Element }[] = [
  { value: "text", label: "Text", icon: <FileText className="h-3.5 w-3.5" /> },
  { value: "link", label: "Link", icon: <Link className="h-3.5 w-3.5" /> },
  { value: "video", label: "Video", icon: <Video className="h-3.5 w-3.5" /> },
];

export function ContentBlockEditor({ blocks, itemId }: Props) {
  const { isAdmin } = useAdmin();
  const renderable = blocks.filter((b) => b.block_type !== "resource_ref");

  const createBlock = useCreateContentBlock();
  const updateBlock = useUpdateContentBlock();
  const deleteBlock = useDeleteContentBlock();

  const [adding, setAdding] = useState<BlockType | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const handleAdd = () => {
    if (!adding) return;
    const nextOrder = blocks.length > 0 ? Math.max(...blocks.map((b) => b.order_index)) + 1 : 0;
    const trimmedUrl = newUrl.trim();
    // Auto-upgrade link → video when URL is from a known video host.
    const effectiveType: BlockType =
      adding === "link" && trimmedUrl && isVideoUrl(trimmedUrl) ? "video" : adding;
    createBlock.mutate({
      item_id: itemId,
      block_type: effectiveType,
      title: newTitle.trim() || undefined,
      body: adding === "text" ? newBody.trim() || undefined : undefined,
      url: adding !== "text" ? trimmedUrl || undefined : undefined,
      order_index: nextOrder,
    });
    setAdding(null);
    setNewTitle("");
    setNewBody("");
    setNewUrl("");
  };

  const cancelAdd = () => {
    setAdding(null);
    setNewTitle("");
    setNewBody("");
    setNewUrl("");
  };

  if (renderable.length === 0 && !isAdmin) return null;

  return (
    <div className="space-y-3">
      {(renderable.length > 0 || isAdmin) && (
        <h4 className="text-sm font-semibold">Content</h4>
      )}
      {renderable.map((b) => (
        <div key={b.id} className="rounded border bg-muted/30 p-3 group relative">
          {isAdmin && (
            <button
              onClick={() => deleteBlock.mutate(b.id)}
              className="absolute top-2 right-2 hidden group-hover:flex h-5 w-5 items-center justify-center rounded text-destructive opacity-60 hover:opacity-100"
              aria-label="Remove block"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}

          {b.title != null && (
            isAdmin ? (
              <InlineEditableText
                value={b.title}
                onSave={(v) => updateBlock.mutate({ id: b.id, title: v })}
                isAdmin
                as="span"
                className="mb-1 text-sm font-medium block"
              />
            ) : (
              <div className="mb-1 text-sm font-medium">{b.title}</div>
            )
          )}

          {b.block_type === "text" && b.body && (
            isAdmin ? (
              <InlineEditableText
                value={b.body}
                onSave={(v) => updateBlock.mutate({ id: b.id, body: v })}
                isAdmin
                as="p"
                multiline
                className="text-sm text-muted-foreground"
              />
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{b.body}</ReactMarkdown>
              </div>
            )
          )}

          {b.block_type === "link" && b.url && (
            <div className="space-y-2">
              {isImageUrl(b.url) ? (
                <a href={b.url} target="_blank" rel="noreferrer" className="block">
                  <img
                    src={b.url}
                    alt={b.title ?? "Image"}
                    className="max-h-64 rounded border object-contain bg-muted/30"
                    loading="lazy"
                  />
                </a>
              ) : (
                <a
                  href={b.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {b.title ?? b.url} <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {isAdmin && (
                <InlineEditableText
                  value={b.url}
                  onSave={(v) => updateBlock.mutate({ id: b.id, url: v })}
                  isAdmin
                  as="span"
                  className="text-xs text-muted-foreground block"
                  placeholder="Edit URL..."
                />
              )}
            </div>
          )}

          {b.block_type === "video" && b.url && (
            <div className="space-y-1">
              <a
                href={b.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Video className="h-3 w-3" /> {b.title ?? "Watch video"}
              </a>
              {isAdmin && (
                <InlineEditableText
                  value={b.url}
                  onSave={(v) => updateBlock.mutate({ id: b.id, url: v })}
                  isAdmin
                  as="span"
                  className="text-xs text-muted-foreground block"
                  placeholder="Edit URL..."
                />
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add block UI for admin */}
      {isAdmin && (
        adding ? (
          <div className="rounded border border-dashed border-primary/30 bg-primary/5 p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              {BLOCK_TYPE_OPTIONS.find((o) => o.value === adding)?.icon}
              New {adding} block
            </div>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full bg-transparent border-b border-primary/30 outline-none text-sm py-1"
              autoFocus
            />
            {adding === "text" && (
              <div>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Body text (markdown supported)"
                  className="w-full bg-transparent border-b border-primary/30 outline-none text-sm py-1 resize-none"
                  rows={3}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Markdown: <code className="px-1 rounded bg-muted">**bold**</code>{" "}
                  <code className="px-1 rounded bg-muted">*italic*</code>{" "}
                  <code className="px-1 rounded bg-muted">[link](url)</code>{" "}
                  <code className="px-1 rounded bg-muted">- bullet</code>
                </p>
              </div>
            )}
            {(adding === "link" || adding === "video") && (
              <div>
                <input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder={adding === "video" ? "Video URL (YouTube, Vimeo, Loom...)" : "URL"}
                  className="w-full bg-transparent border-b border-primary/30 outline-none text-sm py-1"
                />
                {adding === "link" && newUrl.trim() && isVideoUrl(newUrl.trim()) && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                    Detected video link — will be saved as a video block.
                  </p>
                )}
                {adding === "link" && newUrl.trim() && isImageUrl(newUrl.trim()) && (
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
                    Detected image — will render inline in the lesson.
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={adding === "text" ? !newBody.trim() : !newUrl.trim()}
                className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-40"
              >
                Add
              </button>
              <button onClick={cancelAdd} className="px-3 py-1 text-xs text-muted-foreground hover:underline">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-1">
            {BLOCK_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAdding(opt.value)}
                className="flex items-center gap-1 px-2 py-1 text-[11px] text-primary hover:bg-primary/5 rounded border border-transparent hover:border-primary/20 transition-colors"
              >
                {opt.icon}
                <Plus className="h-2.5 w-2.5" />
                {opt.label}
              </button>
            ))}
          </div>
        )
      )}
    </div>
  );
}

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Repair common paste artefacts in markdown bodies before rendering:
 * - collapse newlines inside image alt text (`![alt\n...](url)` → `![alt ...](url)`)
 *   because CommonMark requires alt text to be single-line, and Google Docs
 *   pastes frequently break this.
 * - collapse newlines inside link labels (`[label\n...](url)` → `[label ...](url)`)
 * - trim stray whitespace in URLs.
 * - drop transient Google Slides export images (lh{n}-rt.googleusercontent.com/slidesz/)
 *   that 403 for anyone but the original author, replacing them with italicised
 *   alt text so the paragraph still flows.
 */
const TRANSIENT_IMAGE_HOST = /^https:\/\/lh[0-9-]+\.googleusercontent\.com\/slidesz\//;

function repairMarkdown(src: string): string {
  if (!src) return src;
  return src
    .replace(/!\[([^\]]*)\]\(\s*([^)]+?)\s*\)/g, (_m, alt, url) => {
      const cleanAlt = String(alt).replace(/\s+/g, " ").trim();
      const cleanUrl = String(url).trim();
      if (TRANSIENT_IMAGE_HOST.test(cleanUrl)) {
        return cleanAlt ? `*${cleanAlt}*` : "";
      }
      return `![${cleanAlt}](${cleanUrl})`;
    })
    .replace(/(^|[^!])\[([^\]]*?)\]\(\s*([^)]+?)\s*\)/g, (_m, lead, text, url) =>
      `${lead}[${String(text).replace(/\s+/g, " ").trim()}](${String(url).trim()})`
    );
}
import { ExternalLink, Video, Trash2, Plus, FileText, Link, Image as ImageIcon } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import {
  useCreateContentBlock,
  useUpdateContentBlock,
  useDeleteContentBlock,
} from "@/hooks/learning-track/useAdminLearningTrackMutations";
import { InlineEditableText } from "./InlineEditableText";
import { isVideoUrl, isImageUrl } from "@/lib/learning-track-url";
import { detectVideoEmbed, VideoEmbed } from "@/lib/video-embed-utils";
import type { LearningTrackContentBlock, BlockType } from "@/types/learning-track";

interface Props {
  blocks: LearningTrackContentBlock[];
  itemId: string;
}

const BLOCK_TYPE_OPTIONS: { value: BlockType; label: string; icon: JSX.Element }[] = [
  { value: "text", label: "Text", icon: <FileText className="h-3.5 w-3.5" /> },
  { value: "link", label: "Link", icon: <Link className="h-3.5 w-3.5" /> },
  { value: "video", label: "Video", icon: <Video className="h-3.5 w-3.5" /> },
  { value: "image", label: "Image", icon: <ImageIcon className="h-3.5 w-3.5" /> },
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
    // Auto-upgrade link → video/image when URL matches a known pattern.
    let effectiveType: BlockType = adding;
    if (adding === "link" && trimmedUrl) {
      if (isVideoUrl(trimmedUrl)) effectiveType = "video";
      else if (isImageUrl(trimmedUrl)) effectiveType = "image";
    }
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

  // ---- Admin view: block-by-block editor with borders ----
  if (isAdmin) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Content</h4>
        {renderable.map((b) => (
          <div key={b.id} className="rounded border bg-muted/30 p-3 group relative">
            <button
              onClick={() => deleteBlock.mutate(b.id)}
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded text-destructive opacity-60 hover:opacity-100 sm:hidden sm:group-hover:flex"
              aria-label="Remove block"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>

            {b.title != null && (
              <InlineEditableText
                value={b.title}
                onSave={(v) => updateBlock.mutate({ id: b.id, title: v })}
                isAdmin
                as="span"
                className="mb-1 text-sm font-medium block"
              />
            )}

            {b.block_type === "text" && b.body && (
              <InlineEditableText
                value={b.body}
                onSave={(v) => updateBlock.mutate({ id: b.id, body: v })}
                isAdmin
                as="p"
                multiline
                className="text-sm text-muted-foreground"
              />
            )}

            {(b.block_type === "link" || b.block_type === "video" || b.block_type === "image") && b.url && (
              <div className="space-y-1">
                {(b.block_type === "image" || (b.block_type === "link" && isImageUrl(b.url))) && (
                  <img src={b.url} alt={b.title ?? "Image"} className="max-h-64 rounded border object-contain bg-muted/30" loading="lazy" />
                )}
                {b.block_type === "video" && (
                  <a href={b.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    <Video className="h-3 w-3" /> {b.title ?? "Watch video"}
                  </a>
                )}
                {b.block_type === "link" && !isImageUrl(b.url) && (
                  <a href={b.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    {b.title ?? b.url} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <InlineEditableText
                  value={b.url}
                  onSave={(v) => updateBlock.mutate({ id: b.id, url: v })}
                  isAdmin
                  as="span"
                  className="text-xs text-muted-foreground block"
                  placeholder="Edit URL..."
                />
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
            {(adding === "link" || adding === "video" || adding === "image") && (
              <div>
                <input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder={
                    adding === "video"
                      ? "Video URL (YouTube, Vimeo, Loom...)"
                      : adding === "image"
                      ? "Image URL"
                      : "URL"
                  }
                  className="w-full bg-transparent border-b border-primary/30 outline-none text-sm py-1"
                />
                {adding === "link" && newUrl.trim() && isVideoUrl(newUrl.trim()) && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                    Detected video link — will be saved as a video block.
                  </p>
                )}
                {adding === "link" && newUrl.trim() && isImageUrl(newUrl.trim()) && (
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
                    Detected image — will be saved as an image block.
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

  // ---- Learner view: clean flowing document (no boxes, no borders) ----
  return (
    <article className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-serif prose-a:text-primary prose-img:rounded-lg">
      {renderable.map((b) => (
        <div key={b.id}>
          {b.title && b.block_type !== "text" && (
            <h4>{b.title}</h4>
          )}

          {b.block_type === "text" && b.body && (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children, ...props }) => {
                  if (href) {
                    const text = String(children ?? "").trim();
                    // Match turndown patterns: "[platform video](url)" or "[video](url)"
                    if (/^(?:youtube|vimeo|loom|mp4)\s+video$/i.test(text) || /^video$/i.test(text)) {
                      const info = detectVideoEmbed(href);
                      if (info.isVideo && info.embedUrl) {
                        return <VideoEmbed embedUrl={info.embedUrl} platform={info.platform!} />;
                      }
                    }
                  }
                  return <a href={href} target="_blank" rel="noreferrer" {...props}>{children}</a>;
                },
                img: ({ src, alt, ...props }) => (
                  <img
                    src={src}
                    alt={alt ?? ""}
                    loading="lazy"
                    onError={(e) => {
                      // Hide broken images (e.g. expired Google Slides export URLs)
                      // rather than leaving a broken-icon placeholder.
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                    {...props}
                  />
                ),
              }}
            >
              {repairMarkdown(b.body)}
            </ReactMarkdown>
          )}

          {b.block_type === "link" && b.url && (
            isImageUrl(b.url) ? (
              <figure>
                <img src={b.url} alt={b.title ?? "Image"} loading="lazy" />
              </figure>
            ) : (
              <p>
                <a href={b.url} target="_blank" rel="noreferrer">
                  {b.title ?? b.url} <ExternalLink className="inline h-3 w-3" />
                </a>
              </p>
            )
          )}

          {b.block_type === "image" && b.url && (
            <figure>
              <img src={b.url} alt={b.title ?? "Image"} loading="lazy" />
            </figure>
          )}

          {b.block_type === "video" && b.url && (
            <p>
              <a href={b.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5">
                <Video className="h-4 w-4" /> {b.title ?? "Watch video"}
              </a>
            </p>
          )}
        </div>
      ))}
    </article>
  );
}

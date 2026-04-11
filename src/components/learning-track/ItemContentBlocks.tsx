import ReactMarkdown from "react-markdown";
import { ExternalLink, Video } from "lucide-react";
import type { LearningTrackContentBlock } from "@/types/learning-track";

interface Props {
  blocks: LearningTrackContentBlock[];
}

export function ItemContentBlocks({ blocks }: Props) {
  const renderable = blocks.filter((b) => b.block_type !== "resource_ref");
  if (renderable.length === 0) return null;
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Content</h4>
      {renderable.map((b) => (
        <div key={b.id} className="rounded border bg-muted/30 p-3">
          {b.title && <div className="mb-1 text-sm font-medium">{b.title}</div>}
          {b.block_type === "text" && b.body && (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{b.body}</ReactMarkdown>
            </div>
          )}
          {b.block_type === "link" && b.url && (
            <a
              href={b.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {b.title ?? b.url} <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {b.block_type === "video" && b.url && (
            <a
              href={b.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Video className="h-3 w-3" /> {b.title ?? "Watch video"}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

import { ExternalLink } from "lucide-react";
import type { LearningTrackItem } from "@/types/learning-track";

interface Props {
  item: LearningTrackItem;
}

/**
 * Renders only admin-curated resources (content blocks of type `resource_ref`).
 * Auto-suggestions were removed because keyword matching was too noisy on the
 * current corpus — see commit history. Re-enable once we have a better signal
 * (vector embeddings, manual tagging, or a larger corpus).
 */
export function RelatedResources({ item }: Props) {
  const curated = item.content_blocks.filter((b) => b.block_type === "resource_ref");
  if (curated.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">Related resources</h4>
      <div className="grid gap-2 sm:grid-cols-2">
        {curated.map((b) => (
          <a
            key={b.id}
            href={b.url ?? "#"}
            target={b.url?.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="rounded border bg-background p-2 text-xs hover:bg-muted"
          >
            <div className="font-medium flex items-center gap-1">
              {b.title ?? "Resource"}
              {b.url?.startsWith("http") && <ExternalLink className="h-3 w-3" />}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

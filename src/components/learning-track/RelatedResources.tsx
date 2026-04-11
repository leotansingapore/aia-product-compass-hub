import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { suggestResources, type IndexedResource } from "@/lib/learning-track/resourceIndex";
import type { LearningTrackItem } from "@/types/learning-track";

interface Props {
  item: LearningTrackItem;
}

const KIND_LABEL: Record<IndexedResource["kind"], string> = {
  product: "Product",
  kb: "Knowledge base",
  script: "Script",
  concept_card: "Concept card",
  video: "Video",
  obsidian_doc: "Reference doc",
  notebooklm: "NotebookLM",
};

export function RelatedResources({ item }: Props) {
  const [suggestions, setSuggestions] = useState<IndexedResource[]>([]);

  useEffect(() => {
    let cancelled = false;
    const queryText = [item.title, item.description ?? "", ...(item.objectives ?? [])].join(" ");
    suggestResources(queryText)
      .then((results) => {
        if (cancelled) return;
        const filtered = results.filter((r) => !item.hidden_resources.includes(r.id));
        setSuggestions(filtered);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [item]);

  const curated = item.content_blocks.filter((b) => b.block_type === "resource_ref");

  if (suggestions.length === 0 && curated.length === 0) return null;

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
            <div className="text-muted-foreground">Curated</div>
            <div className="font-medium flex items-center gap-1">
              {b.title ?? "Resource"}
              {b.url?.startsWith("http") && <ExternalLink className="h-3 w-3" />}
            </div>
          </a>
        ))}
        {suggestions.map((r) =>
          r.href.startsWith("http") ? (
            <a
              key={r.id}
              href={r.href}
              target="_blank"
              rel="noreferrer"
              className="rounded border bg-background p-2 text-xs hover:bg-muted"
            >
              <div className="text-muted-foreground">{KIND_LABEL[r.kind]}</div>
              <div className="font-medium">{r.title}</div>
            </a>
          ) : (
            <Link
              key={r.id}
              to={r.href}
              className="rounded border bg-background p-2 text-xs hover:bg-muted"
            >
              <div className="text-muted-foreground">{KIND_LABEL[r.kind]}</div>
              <div className="font-medium">{r.title}</div>
            </Link>
          )
        )}
      </div>
    </div>
  );
}

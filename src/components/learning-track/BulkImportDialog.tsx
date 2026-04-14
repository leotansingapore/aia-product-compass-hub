import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseLearningItemsMarkdown } from "@/lib/parseLearningItemsMarkdown";
import { useBulkImportItems } from "@/hooks/learning-track/useAdminLearningTrackMutations";

interface Props {
  open: boolean;
  onClose: () => void;
  phaseId: string;
  phaseTitle: string;
}

const EXAMPLE = `## Watch the product overview
Start with the foundational video before moving on.

### Objectives
- Understand the product's core value
- Know who the target client is

### Action items
- Watch the full video
- Jot down 3 takeaways

### Content
- [Product overview video](https://youtu.be/example)
- > Reflection: How would you introduce this to a new client?

## Review the client script
Use this script in your first role-play.

### Content
- [Opening script PDF](https://example.com/script.pdf)
`;

export function BulkImportDialog({ open, onClose, phaseId, phaseTitle }: Props) {
  const [text, setText] = useState("");
  const importer = useBulkImportItems();

  const parsed = useMemo(() => parseLearningItemsMarkdown(text), [text]);

  const handleImport = () => {
    if (parsed.length === 0) return;
    importer.mutate(
      { phase_id: phaseId, items: parsed },
      {
        onSuccess: () => {
          setText("");
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bulk import items into "{phaseTitle}"</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Paste a structured markdown doc. Each <code className="px-1 rounded bg-muted">##</code> becomes
            an item. Sections <code className="px-1 rounded bg-muted">### Objectives</code>,{" "}
            <code className="px-1 rounded bg-muted">### Action items</code>, and{" "}
            <code className="px-1 rounded bg-muted">### Content</code> are parsed automatically.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">
              Paste markdown here
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={16}
              placeholder={EXAMPLE}
              className="font-mono text-xs"
            />
            <button
              onClick={() => setText(EXAMPLE)}
              className="text-xs text-primary hover:underline"
            >
              Load example
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">
              Preview ({parsed.length} item{parsed.length === 1 ? "" : "s"} detected)
            </label>
            <div className="border rounded p-2 h-full max-h-96 overflow-y-auto space-y-2 text-sm bg-muted/20">
              {parsed.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Start typing or paste markdown to see a preview.
                </p>
              ) : (
                parsed.map((it, i) => (
                  <div key={i} className="rounded bg-card border p-2">
                    <div className="font-medium text-xs">{it.title}</div>
                    {it.description && (
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {it.description}
                      </div>
                    )}
                    {it.objectives.length > 0 && (
                      <div className="text-[11px] mt-1">
                        <span className="text-muted-foreground">Objectives: </span>
                        {it.objectives.length}
                      </div>
                    )}
                    {it.action_items.length > 0 && (
                      <div className="text-[11px]">
                        <span className="text-muted-foreground">Actions: </span>
                        {it.action_items.length}
                      </div>
                    )}
                    {it.content_blocks.length > 0 && (
                      <div className="text-[11px]">
                        <span className="text-muted-foreground">Blocks: </span>
                        {it.content_blocks
                          .map((b) => b.block_type)
                          .reduce<Record<string, number>>((acc, t) => {
                            acc[t] = (acc[t] ?? 0) + 1;
                            return acc;
                          }, {}) &&
                          it.content_blocks.map((b) => b.block_type).join(", ")}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleImport}
            disabled={parsed.length === 0 || importer.isPending}
          >
            {importer.isPending ? "Importing..." : `Import ${parsed.length} item${parsed.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

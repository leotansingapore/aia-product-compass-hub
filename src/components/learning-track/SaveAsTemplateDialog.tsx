import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSaveItemAsTemplate } from "@/hooks/learning-track/useCustomTemplates";
import type { TemplateCategory } from "@/data/learningItemTemplates";

interface Props {
  open: boolean;
  onClose: () => void;
  itemId: string;
  itemTitle: string;
}

const CATEGORIES: TemplateCategory[] = ["General", "Lesson", "Practice", "Assessment"];

export function SaveAsTemplateDialog({ open, onClose, itemId, itemTitle }: Props) {
  const [label, setLabel] = useState("");
  const [hint, setHint] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("Lesson");
  const save = useSaveItemAsTemplate();

  const handleSave = () => {
    if (!label.trim()) return;
    save.mutate(
      { itemId, label: label.trim(), hint: hint.trim() || undefined, category },
      {
        onSuccess: () => {
          setLabel("");
          setHint("");
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as template</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Saving "{itemTitle}" with its objectives, action items, and content blocks.
            Other instructors will see this in the template picker.
          </p>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Template name
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. 90-second elevator pitch"
              className="w-full mt-1 px-2 py-1.5 text-sm rounded border bg-background"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Short hint (optional)
            </label>
            <input
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="One line shown under the name"
              className="w-full mt-1 px-2 py-1.5 text-sm rounded border bg-background"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Category</label>
            <div className="flex gap-1 mt-1 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    category === c
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/60 hover:border-primary/50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!label.trim() || save.isPending}>
            {save.isPending ? "Saving..." : "Save template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

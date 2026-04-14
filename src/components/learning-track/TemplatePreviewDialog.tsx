import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Link as LinkIcon, Video } from "lucide-react";
import type { LearningItemTemplate } from "@/data/learningItemTemplates";

interface Props {
  template: LearningItemTemplate | null;
  onConfirm: () => void;
  onClose: () => void;
}

const BLOCK_ICON = {
  text: <FileText className="h-3 w-3" />,
  link: <LinkIcon className="h-3 w-3" />,
  video: <Video className="h-3 w-3" />,
  resource_ref: null,
};

export function TemplatePreviewDialog({ template, onConfirm, onClose }: Props) {
  if (!template) return null;

  return (
    <Dialog open={!!template} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{template.label}</span>
            <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{template.hint}</p>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-0.5">Title</div>
            <div>{template.title}</div>
          </div>

          {template.description && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-0.5">Description</div>
              <div className="text-muted-foreground">{template.description}</div>
            </div>
          )}

          {template.objectives && template.objectives.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-0.5">Objectives</div>
              <ul className="list-disc ml-4 space-y-0.5">
                {template.objectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          )}

          {template.action_items && template.action_items.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-0.5">Action items</div>
              <ul className="list-disc ml-4 space-y-0.5">
                {template.action_items.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {template.content_blocks && template.content_blocks.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-1">
                Content blocks ({template.content_blocks.length})
              </div>
              <div className="space-y-1">
                {template.content_blocks.map((b, i) => (
                  <div
                    key={i}
                    className="rounded border border-border/60 px-2 py-1.5 bg-muted/30 flex items-start gap-2"
                  >
                    <span className="mt-0.5 text-muted-foreground">{BLOCK_ICON[b.block_type]}</span>
                    <div className="min-w-0 flex-1">
                      {b.title && <div className="font-medium text-xs">{b.title}</div>}
                      {b.body && (
                        <div className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {b.body}
                        </div>
                      )}
                      {b.url && (
                        <div className="text-xs text-muted-foreground truncate">{b.url}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {template.requires_submission && (
            <Badge variant="outline" className="text-[11px]">Requires learner submission</Badge>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>Insert item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

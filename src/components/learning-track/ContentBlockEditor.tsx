import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, ExternalLink, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentBlock, ContentBlockType } from "@/data/learningTrackData";

interface ContentBlockEditorProps {
  onAdd: (block: Omit<ContentBlock, "id">) => void;
  onCancel: () => void;
}

const types: { value: ContentBlockType; label: string; icon: React.ElementType }[] = [
  { value: "text", label: "Text", icon: FileText },
  { value: "link", label: "Link", icon: ExternalLink },
  { value: "video", label: "Video", icon: Play },
];

export function ContentBlockEditor({ onAdd, onCancel }: ContentBlockEditorProps) {
  const [type, setType] = useState<ContentBlockType>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  const canSubmit =
    (type === "text" && text.trim()) ||
    (type === "link" && url.trim()) ||
    (type === "video" && url.trim());

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAdd({
      type,
      text: type === "text" ? text.trim() : undefined,
      url: type !== "text" ? url.trim() : undefined,
      label: label.trim() || undefined,
    });
  };

  return (
    <div className="rounded-md border bg-muted/30 p-3 space-y-3">
      {/* Type selector */}
      <div className="flex gap-1.5">
        {types.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors border",
                type === t.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground hover:bg-accent border-transparent"
              )}
            >
              <Icon className="h-3 w-3" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Fields */}
      {type === "text" && (
        <div className="space-y-1.5">
          <Label className="text-xs">Content</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write notes, instructions, or tips..."
            rows={3}
            className="text-sm resize-none"
          />
        </div>
      )}

      {(type === "link" || type === "video") && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs">
              {type === "video" ? "Video URL (YouTube, Vimeo, Loom)" : "URL"}
            </Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                type === "video"
                  ? "https://youtube.com/watch?v=..."
                  : "https://example.com"
              }
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Label (optional)</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Display name for this resource"
              className="text-sm"
            />
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs h-7">
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={!canSubmit} className="text-xs h-7">
          Add
        </Button>
      </div>
    </div>
  );
}

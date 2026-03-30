import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Image,
  Link2,
  Video,
  Type,
  Trash2,
  ExternalLink,
  Upload,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { useAssignmentSubmissions, SubmissionType, AssignmentSubmission } from "@/hooks/useAssignmentSubmissions";

interface AssignmentSubmissionPanelProps {
  itemId: string;
  submissionsHook: ReturnType<typeof useAssignmentSubmissions>;
}

const TYPE_META: Record<SubmissionType, { label: string; icon: React.ElementType; placeholder: string }> = {
  pdf: { label: "PDF", icon: FileText, placeholder: "Upload a PDF file" },
  image: { label: "Image", icon: Image, placeholder: "Upload an image" },
  url: { label: "URL", icon: Link2, placeholder: "https://..." },
  loom: { label: "Loom / Video URL", icon: Video, placeholder: "https://www.loom.com/share/..." },
  text: { label: "Text Note", icon: Type, placeholder: "Write a note..." },
};

export function AssignmentSubmissionPanel({ itemId, submissionsHook }: AssignmentSubmissionPanelProps) {
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<SubmissionType>("url");
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submissions = submissionsHook.getSubmissions(itemId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      submissionsHook.addSubmission(itemId, {
        type: file.type.startsWith("image/") ? "image" : "pdf",
        label: label.trim() || file.name,
        value: dataUri,
      });
      setAdding(false);
      setValue("");
      setLabel("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    submissionsHook.addSubmission(itemId, {
      type,
      label: label.trim() || (type === "text" ? value.trim().slice(0, 50) : value.trim()),
      value: value.trim(),
    });
    setValue("");
    setLabel("");
    setAdding(false);
  };

  const isFileType = type === "pdf" || type === "image";

  return (
    <div className="border-b bg-muted/20 px-4 py-3 space-y-3">
      {/* Existing submissions */}
      {submissions.length > 0 && (
        <div className="space-y-2">
          {submissions.map((sub) => (
            <SubmissionItem
              key={sub.id}
              submission={sub}
              onRemove={() => submissionsHook.removeSubmission(itemId, sub.id)}
            />
          ))}
        </div>
      )}

      {/* Add new */}
      {adding ? (
        <div className="space-y-2 rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2">
            <Select value={type} onValueChange={(v) => setType(v as SubmissionType)}>
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_META) as SubmissionType[]).map((t) => {
                  const meta = TYPE_META[t];
                  const Icon = meta.icon;
                  return (
                    <SelectItem key={t} value={t} className="text-xs">
                      <span className="flex items-center gap-1.5">
                        <Icon className="h-3 w-3" />
                        {meta.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (optional)"
              className="h-8 text-xs flex-1"
            />
          </div>

          {isFileType ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept={type === "pdf" ? ".pdf" : "image/*"}
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3 w-3" />
                Choose {type === "pdf" ? "PDF" : "Image"}
              </Button>
            </div>
          ) : type === "text" ? (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={TYPE_META[type].placeholder}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm resize-none min-h-[60px] outline-none focus:ring-1 focus:ring-ring"
              rows={3}
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={TYPE_META[type].placeholder}
              className="h-8 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => { setAdding(false); setValue(""); setLabel(""); }}
            >
              Cancel
            </Button>
            {!isFileType && (
              <Button
                size="sm"
                className="text-xs h-7"
                onClick={handleSubmit}
                disabled={!value.trim()}
              >
                Submit
              </Button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <Plus className="h-3 w-3" />
          Add submission
        </button>
      )}
    </div>
  );
}

function SubmissionItem({
  submission,
  onRemove,
}: {
  submission: AssignmentSubmission;
  onRemove: () => void;
}) {
  const meta = TYPE_META[submission.type];
  const Icon = meta.icon;
  const isLink = submission.type === "url" || submission.type === "loom";
  const isFile = submission.type === "pdf" || submission.type === "image";

  return (
    <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 group">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium truncate block">{submission.label}</span>
        <span className="text-[10px] text-muted-foreground">
          {format(new Date(submission.submittedAt), "dd MMM yyyy, HH:mm")}
        </span>
      </div>

      {isLink && (
        <a
          href={submission.value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}

      {isFile && submission.value.startsWith("data:") && (
        <a
          href={submission.value}
          download={submission.label}
          className="text-primary hover:text-primary/80"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}

      {submission.type === "text" && (
        <span className="text-xs text-muted-foreground italic truncate max-w-[120px]">
          {submission.value.slice(0, 60)}
        </span>
      )}

      <button
        onClick={onRemove}
        className="hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full text-destructive opacity-60 hover:opacity-100 shrink-0"
        aria-label="Remove submission"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface InlineEditableTextProps {
  value: string;
  onSave: (value: string) => void;
  isAdmin: boolean;
  className?: string;
  as?: "span" | "h3" | "p";
  multiline?: boolean;
  placeholder?: string;
}

export function InlineEditableText({
  value,
  onSave,
  isAdmin,
  className,
  as: Tag = "span",
  multiline = false,
  placeholder = "Click to edit...",
}: InlineEditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setDraft(value);
    }
    setEditing(false);
  };

  if (!isAdmin) {
    return <Tag className={className}>{value}</Tag>;
  }

  if (editing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); save(); }
            if (e.key === "Escape") { setDraft(value); setEditing(false); }
          }}
          className={cn(
            "w-full bg-transparent border-b border-dashed border-primary/50 outline-none resize-none",
            className
          )}
          rows={2}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        className={cn(
          "w-full bg-transparent border-b border-dashed border-primary/50 outline-none",
          className
        )}
      />
    );
  }

  return (
    <Tag
      className={cn(
        className,
        "cursor-text hover:bg-primary/5 rounded px-0.5 -mx-0.5 transition-colors border-b border-transparent hover:border-dashed hover:border-primary/30"
      )}
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      title="Click to edit"
    >
      {value || <span className="text-muted-foreground/50 italic">{placeholder}</span>}
    </Tag>
  );
}

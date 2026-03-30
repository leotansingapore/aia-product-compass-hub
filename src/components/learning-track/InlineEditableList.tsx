import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

interface InlineEditableListProps {
  items: string[];
  onSave: (items: string[]) => void;
  isAdmin: boolean;
  bulletColor?: string;
}

export function InlineEditableList({
  items,
  onSave,
  isAdmin,
  bulletColor = "bg-primary",
}: InlineEditableListProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [newDraft, setNewDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const addRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingIdx !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingIdx]);

  useEffect(() => {
    if (addingNew && addRef.current) {
      addRef.current.focus();
    }
  }, [addingNew]);

  const saveEdit = (idx: number) => {
    const trimmed = draft.trim();
    if (trimmed) {
      const updated = [...items];
      updated[idx] = trimmed;
      onSave(updated);
    }
    setEditingIdx(null);
  };

  const removeItem = (idx: number) => {
    const updated = items.filter((_, i) => i !== idx);
    onSave(updated);
  };

  const addItem = () => {
    const trimmed = newDraft.trim();
    if (trimmed) {
      onSave([...items, trimmed]);
      setNewDraft("");
    }
    setAddingNew(false);
  };

  return (
    <div className="space-y-1 pl-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 text-sm text-foreground/80 group">
          <span className={cn("mt-1.5 h-1 w-1 rounded-full shrink-0", bulletColor)} />
          {editingIdx === i ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => saveEdit(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit(i);
                if (e.key === "Escape") setEditingIdx(null);
              }}
              className="flex-1 bg-transparent border-b border-dashed border-primary/50 outline-none text-sm"
            />
          ) : (
            <span
              className="flex-1 cursor-text hover:bg-primary/5 rounded px-0.5 -mx-0.5 transition-colors border-b border-transparent hover:border-dashed hover:border-primary/30"
              onClick={(e) => {
                e.stopPropagation();
                setDraft(item);
                setEditingIdx(i);
              }}
              title="Click to edit"
            >
              {item}
            </span>
          )}
          {isAdmin && editingIdx !== i && (
            <button
              onClick={(e) => { e.stopPropagation(); removeItem(i); }}
              className="hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full text-destructive opacity-60 hover:opacity-100 shrink-0 mt-0.5"
              aria-label="Remove item"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      ))}
      {isAdmin && (
        addingNew ? (
          <div className="flex items-start gap-2 pl-3">
            <input
              ref={addRef}
              value={newDraft}
              onChange={(e) => setNewDraft(e.target.value)}
              onBlur={addItem}
              onKeyDown={(e) => {
                if (e.key === "Enter") addItem();
                if (e.key === "Escape") { setAddingNew(false); setNewDraft(""); }
              }}
              placeholder="New item..."
              className="flex-1 bg-transparent border-b border-dashed border-primary/50 outline-none text-sm"
            />
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setAddingNew(true); }}
            className="flex items-center gap-1 text-[11px] text-primary hover:underline ml-3 mt-1"
          >
            <Plus className="h-2.5 w-2.5" />
            Add
          </button>
        )
      )}
    </div>
  );
}

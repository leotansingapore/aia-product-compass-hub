import { useState } from "react";
import { Plus } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useCreatePhase } from "@/hooks/learning-track/useAdminLearningTrackMutations";
import type { Track } from "@/types/learning-track";

interface Props {
  track: Track;
  currentPhaseCount: number;
}

export function AddPhaseButton({ track, currentPhaseCount }: Props) {
  const { isAdmin } = useAdmin();
  const createPhase = useCreatePhase();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  if (!isAdmin) return null;

  const handleAdd = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    createPhase.mutate({ track, title: trimmed, order_index: currentPhaseCount });
    setTitle("");
    setAdding(false);
  };

  if (adding) {
    return (
      <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") { setAdding(false); setTitle(""); }
            }}
            placeholder="New phase title..."
            className="flex-1 bg-transparent border-b border-dashed border-primary/50 outline-none text-sm py-1"
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={!title.trim()}
            className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-40"
          >
            Add Phase
          </button>
          <button
            onClick={() => { setAdding(false); setTitle(""); }}
            className="px-3 py-1 text-xs text-muted-foreground hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setAdding(true)}
      className="w-full rounded-lg border border-dashed border-muted-foreground/30 py-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
    >
      <Plus className="h-4 w-4" />
      Add phase
    </button>
  );
}

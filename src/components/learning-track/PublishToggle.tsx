import { Eye, EyeOff } from "lucide-react";

interface Props {
  publishedAt: string | null;
  onToggle: (next: string | null) => void;
  size?: "sm" | "md";
}

/**
 * Publish/draft toggle. Non-null `published_at` = visible to learners;
 * null = draft (admins only).
 */
export function PublishToggle({ publishedAt, onToggle, size = "sm" }: Props) {
  const isPublished = publishedAt !== null;
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle(isPublished ? null : new Date().toISOString());
      }}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border transition-colors ${textSize} ${
        isPublished
          ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400 hover:bg-green-500/20"
          : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
      }`}
      aria-label={isPublished ? "Unpublish (hide from learners)" : "Publish (show to learners)"}
      title={isPublished ? "Published — click to unpublish" : "Draft — click to publish"}
    >
      {isPublished ? <Eye className={iconSize} /> : <EyeOff className={iconSize} />}
      {isPublished ? "Published" : "Draft"}
    </button>
  );
}

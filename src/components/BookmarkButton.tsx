import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  productId: string;
  className?: string;
  /** Use on `BrandedPageHeader` / gradient hero so label and icon stay readable. */
  onDarkSurface?: boolean;
}

export function BookmarkButton({ productId, className, onDarkSurface }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark, loading } = useBookmarks();

  const bookmarked = isBookmarked(productId);

  const variant = bookmarked
    ? "default"
    : onDarkSurface
      ? "heroOutline"
      : "outline";

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={() => toggleBookmark(productId)}
      disabled={loading}
      className={cn(
        "gap-2 mobile-touch-target font-medium",
        onDarkSurface &&
          bookmarked &&
          "shadow-md shadow-black/25 ring-1 ring-white/25 hover:ring-white/35",
        className
      )}
    >
      {bookmarked ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          Bookmarked
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          Bookmark
        </>
      )}
    </Button>
  );
}
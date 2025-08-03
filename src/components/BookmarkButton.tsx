import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  productId: string;
  className?: string;
}

export function BookmarkButton({ productId, className }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark, loading } = useBookmarks();

  const bookmarked = isBookmarked(productId);

  return (
    <Button
      variant={bookmarked ? "default" : "outline"}
      size="sm"
      onClick={() => toggleBookmark(productId)}
      disabled={loading}
      className={cn("gap-2 mobile-touch-target", className)}
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
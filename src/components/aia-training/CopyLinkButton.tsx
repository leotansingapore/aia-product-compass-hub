import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { absolute } from "@/features/aia-training-directory/links";

async function copyLink(path: string) {
  try {
    await navigator.clipboard.writeText(absolute(path));
    toast.success("Link copied");
  } catch {
    toast.error("Couldn't copy the link. Please try again.");
  }
}

/** Copies the full address of an in-app path, with a toast either way. */
export function CopyLinkButton({ path, label }: { path: string; label: string }) {
  return (
    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground" onClick={() => copyLink(path)} aria-label={label}>
      <Link2 className="h-4 w-4" />
      Copy link
    </Button>
  );
}

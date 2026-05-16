import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChevronsUpDown,
  Check,
  Loader2,
  Plus,
  Image as ImageIcon,
  Trash2,
  FolderInput,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { ConceptCard } from "@/hooks/useConceptCards";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photoUrl: string | null;
  photoName: string | null;
  initialDescription: string;
  cards: ConceptCard[];
  /**
   * If set, this photo is already bound to this card. Binding to a
   * different card or creating a new one will REMOVE it from this source
   * card (i.e. a move, not a copy).
   */
  sourceCardId?: string | null;
  /** Called after successful bind/create so the parent can refetch. */
  onDone: () => void;
  /** Called after the photo file is deleted/moved out of storage so the parent can drop it from the grid. */
  onDeleted?: (url: string) => void;
}

const STORAGE_BUCKET = "concept-card-images";
const ENHANCED_PREFIX = "enhanced/";
const CASE_STUDIES_PREFIX = "case-studies/";

/**
 * Pull the bucket-relative path out of a public storage URL.
 * e.g. ".../object/public/concept-card-images/enhanced/foo.png" → "enhanced/foo.png"
 */
function publicUrlToStoragePath(url: string): string | null {
  const marker = `/object/public/${STORAGE_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
}

type Mode = "pick-existing" | "create-new";

export function DescribeAndBindDialog({
  open,
  onOpenChange,
  photoUrl,
  photoName,
  initialDescription,
  cards,
  sourceCardId,
  onDone,
  onDeleted,
}: Props) {
  const [mode, setMode] = useState<Mode>("pick-existing");
  const [description, setDescription] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTags, setNewTags] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmCaseStudyOpen, setConfirmCaseStudyOpen] = useState(false);

  const sourceCard =
    sourceCardId != null ? cards.find((c) => c.id === sourceCardId) ?? null : null;

  // Helper: strip photoUrl from one card's image_urls + legacy image_url.
  const removeFromCard = async (card: ConceptCard, url: string) => {
    const newUrls = (card.image_urls ?? []).filter((u) => u !== url);
    const newLegacy = card.image_url === url ? newUrls[0] ?? null : card.image_url;
    return supabase
      .from("concept_cards")
      .update({ image_urls: newUrls, image_url: newLegacy })
      .eq("id", card.id);
  };

  // Reset state when a new photo opens.
  useEffect(() => {
    if (open) {
      setMode("pick-existing");
      setDescription(initialDescription);
      setSelectedCardId(null);
      setNewTitle("");
      setNewDescription(initialDescription);
      setNewTags("");
    }
  }, [open, initialDescription]);

  const sortedCards = useMemo(
    () => [...cards].sort((a, b) => a.title.localeCompare(b.title)),
    [cards]
  );

  const selectedCard = sortedCards.find((c) => c.id === selectedCardId) ?? null;

  /**
   * Rank cards by simple keyword-overlap with the description text. Used to
   * populate the "Suggested" chips so the user doesn't have to scroll through
   * all 55 cards to find the right one.
   * Scoring: +2 per token shared with title, +1 per token shared with tags,
   * +1 per token shared with description. Stop-words filtered.
   */
  const suggestedCards = useMemo(() => {
    const text = description.trim().toLowerCase();
    if (text.length < 8) return [] as ConceptCard[];
    const STOP = new Set([
      "the", "a", "an", "of", "for", "and", "or", "to", "in", "on",
      "with", "is", "are", "by", "at", "into", "from", "as", "be", "this",
      "that", "it", "its", "split", "shows", "showing", "hand-drawn",
      "drawn", "hand", "diagram", "chart", "drawing", "pie",
    ]);
    const tokens = new Set(
      text
        .replace(/[^a-z0-9$%\s/.-]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 2 && !STOP.has(t))
    );
    if (tokens.size === 0) return [];
    const scored = cards.map((c) => {
      const titleToks = new Set(c.title.toLowerCase().split(/\s+/));
      const tagToks = new Set(
        (c.tags ?? []).flatMap((t) => t.toLowerCase().split(/\s+/))
      );
      const descToks = new Set(
        (c.description ?? "").toLowerCase().split(/\s+/)
      );
      let score = 0;
      for (const t of tokens) {
        if (titleToks.has(t)) score += 2;
        if (tagToks.has(t)) score += 1;
        if (descToks.has(t)) score += 1;
      }
      return { card: c, score };
    });
    return scored
      .filter((s) => s.score >= 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((s) => s.card);
  }, [description, cards]);

  // ─── Bind to existing card ──────────────────────────────────────
  const handleBindToExisting = async () => {
    if (!photoUrl || !selectedCard) return;
    if (sourceCard && selectedCard.id === sourceCard.id) {
      toast.info("That's already this photo's card");
      return;
    }
    setBusy(true);
    const existing = selectedCard.image_urls ?? [];
    if (!existing.includes(photoUrl)) {
      const newUrls = [...existing, photoUrl];
      const { error } = await supabase
        .from("concept_cards")
        .update({
          image_urls: newUrls,
          image_url: selectedCard.image_url ?? newUrls[0],
        })
        .eq("id", selectedCard.id);
      if (error) {
        setBusy(false);
        toast.error("Failed to bind", { description: error.message });
        return;
      }
    }

    // If this was a reassign from another card, strip the URL there.
    if (sourceCard && sourceCard.id !== selectedCard.id) {
      const { error } = await removeFromCard(sourceCard, photoUrl);
      if (error) {
        setBusy(false);
        toast.error(`Bound to new card, but couldn't unbind from "${sourceCard.title}"`, {
          description: error.message,
        });
        return;
      }
    }
    setBusy(false);
    toast.success(
      sourceCard && sourceCard.id !== selectedCard.id
        ? `Moved from "${sourceCard.title}" → "${selectedCard.title}"`
        : `Bound to "${selectedCard.title}"`
    );
    onDone();
    onOpenChange(false);
  };

  // ─── Move photo to case-studies storage prefix ──────────────────
  // The page only lists files under enhanced/, so moving the file to
  // case-studies/ removes it from the concept-card binding pool. Strip
  // any card references first so we don't leave broken URLs.
  const handleMoveToCaseStudies = async () => {
    if (!photoUrl) return;
    const path = publicUrlToStoragePath(photoUrl);
    if (!path || !path.startsWith(ENHANCED_PREFIX)) {
      toast.error("Photo isn't in the enhanced/ folder — can't move");
      return;
    }
    setBusy(true);

    // Strip from any cards that reference it
    const referencing = cards.filter((c) => {
      const urls = [
        ...(c.image_urls ?? []),
        ...(c.image_url ? [c.image_url] : []),
      ];
      return urls.includes(photoUrl);
    });
    for (const c of referencing) {
      const { error } = await removeFromCard(c, photoUrl);
      if (error) {
        setBusy(false);
        toast.error(`Failed to strip URL from card "${c.title}"`, {
          description: error.message,
        });
        return;
      }
    }

    // Move file from enhanced/X.png → case-studies/X.png
    const newPath = CASE_STUDIES_PREFIX + path.slice(ENHANCED_PREFIX.length);
    const { error: mvErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .move(path, newPath);
    setBusy(false);
    if (mvErr) {
      toast.error("Failed to move photo", { description: mvErr.message });
      return;
    }
    toast.success(
      referencing.length > 0
        ? `Moved to case studies (removed from ${referencing.length} card${referencing.length === 1 ? "" : "s"})`
        : "Moved to case studies"
    );
    onDeleted?.(photoUrl);
    onDone();
    setConfirmCaseStudyOpen(false);
    onOpenChange(false);
  };

  // ─── Create new card + bind ─────────────────────────────────────
  const handleCreateNew = async () => {
    if (!photoUrl) return;
    const title = newTitle.trim();
    if (!title) {
      toast.error("Title is required");
      return;
    }
    setBusy(true);
    const tags = newTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const nextSortOrder = Math.max(0, ...cards.map((c) => c.sort_order ?? 0)) + 1;
    const { data, error } = await supabase
      .from("concept_cards")
      .insert([
        {
          title,
          description: newDescription.trim() || null,
          image_url: photoUrl,
          image_urls: [photoUrl],
          audience: ["General"],
          product_type: [],
          tags,
          sort_order: nextSortOrder,
        },
      ])
      .select()
      .single();
    if (error || !data) {
      setBusy(false);
      toast.error("Failed to create card", { description: error?.message });
      return;
    }

    // If this was a reassign from another card, strip the URL there.
    if (sourceCard) {
      const { error: rmErr } = await removeFromCard(sourceCard, photoUrl);
      if (rmErr) {
        setBusy(false);
        toast.error(`Created new card, but couldn't unbind from "${sourceCard.title}"`, {
          description: rmErr.message,
        });
        return;
      }
    }
    setBusy(false);
    toast.success(
      sourceCard
        ? `Moved photo from "${sourceCard.title}" → new card "${title}"`
        : `Created "${title}" and bound photo`
    );
    onDone();
    onOpenChange(false);
  };

  // ─── Delete photo from storage ─────────────────────────────────
  // Removes the file from concept-card-images/<path>. If any concept_cards
  // still reference this URL (shouldn't happen since the delete button is
  // mainly for unbound photos, but be safe), strip it from their image_urls
  // first so we don't leave broken refs.
  const handleDelete = async () => {
    if (!photoUrl) return;
    const path = publicUrlToStoragePath(photoUrl);
    if (!path) {
      toast.error("Could not parse storage path from URL");
      return;
    }
    setBusy(true);

    // Strip from any cards that reference it
    const referencingCards = cards.filter((c) => {
      const urls = [
        ...(c.image_urls ?? []),
        ...(c.image_url ? [c.image_url] : []),
      ];
      return urls.includes(photoUrl);
    });
    for (const c of referencingCards) {
      const newUrls = (c.image_urls ?? []).filter((u) => u !== photoUrl);
      const newLegacy =
        c.image_url === photoUrl ? newUrls[0] ?? null : c.image_url;
      const { error: updErr } = await supabase
        .from("concept_cards")
        .update({ image_urls: newUrls, image_url: newLegacy })
        .eq("id", c.id);
      if (updErr) {
        toast.error(`Failed to strip URL from card "${c.title}"`, {
          description: updErr.message,
        });
        setBusy(false);
        return;
      }
    }

    // Delete from storage
    const { error: rmErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);
    setBusy(false);
    if (rmErr) {
      toast.error("Failed to delete photo", { description: rmErr.message });
      return;
    }
    toast.success(
      referencingCards.length > 0
        ? `Deleted photo (and removed from ${referencingCards.length} card${referencingCards.length === 1 ? "" : "s"})`
        : "Deleted photo"
    );
    onDeleted?.(photoUrl);
    onDone();
    setConfirmDeleteOpen(false);
    onOpenChange(false);
  };

  if (!photoUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {sourceCard ? "Reassign or reclassify drawing" : "Describe and bind drawing"}
          </DialogTitle>
          <DialogDescription>
            {sourceCard ? (
              <>
                Currently bound to <strong>{sourceCard.title}</strong>. Pick a different card, create a new one, or mark it as case-study material to remove from the concept-card pool.
              </>
            ) : (
              "Tell me what this drawing shows, then either pick an existing concept card or create a new one."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Photo preview */}
          <div className="rounded-lg border bg-white p-2 flex items-center justify-center min-h-[260px]">
            <img
              src={photoUrl}
              alt={photoName ?? "drawing"}
              className="max-h-[420px] w-auto object-contain"
            />
          </div>

          {/* Description + action panel */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                What does this drawing show?
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Hand-drawn pie chart split into 3 equal thirds for ST/MT/LT income allocation"
                className="mt-1 min-h-[88px] text-sm"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Pre-filled from AI description if available. Edit freely.
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={mode === "pick-existing" ? "default" : "outline"}
                onClick={() => setMode("pick-existing")}
                className="flex-1"
              >
                Bind to existing
              </Button>
              <Button
                size="sm"
                variant={mode === "create-new" ? "default" : "outline"}
                onClick={() => setMode("create-new")}
                className="flex-1"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Create new card
              </Button>
            </div>

            {mode === "pick-existing" ? (
              <div>
                {/* Suggested matches based on the description text. Only
                    surfaces when the user has actually typed something — so
                    it stays out of the way otherwise. */}
                {suggestedCards.length > 0 && (
                  <div className="mb-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Suggested from your description
                    </label>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {suggestedCards.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCardId(c.id)}
                          className={cn(
                            "rounded-md px-2 py-1 text-[11px] border transition-colors",
                            selectedCardId === c.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/40 hover:bg-muted/50"
                          )}
                          title={c.description ?? ""}
                        >
                          {c.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <label className="text-xs font-medium text-muted-foreground">
                  {suggestedCards.length > 0
                    ? "...or pick any other card"
                    : "Pick a concept card"}
                </label>
                <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between mt-1 font-normal"
                    >
                      <span className="truncate">
                        {selectedCard?.title ?? "Search cards..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-0 w-[--radix-popover-trigger-width]"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Search by title or tag..." />
                      <CommandList className="max-h-[280px]">
                        <CommandEmpty>No cards match.</CommandEmpty>
                        <CommandGroup>
                          {sortedCards.map((c) => {
                            const photoCount =
                              (c.image_urls?.length ?? 0) ||
                              (c.image_url ? 1 : 0);
                            return (
                              <CommandItem
                                key={c.id}
                                value={`${c.title} ${c.tags?.join(" ") ?? ""}`}
                                onSelect={() => {
                                  setSelectedCardId(c.id);
                                  setPickerOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedCardId === c.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="truncate text-sm">{c.title}</div>
                                  <div className="flex gap-1 mt-0.5 flex-wrap">
                                    {c.tags?.slice(0, 3).map((t) => (
                                      <Badge
                                        key={t}
                                        variant="secondary"
                                        className="text-[10px] px-1 py-0"
                                      >
                                        {t}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <span className="ml-2 text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <ImageIcon className="h-3 w-3" />
                                  {photoCount}
                                </span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedCard && (
                  <div className="mt-2 rounded-md border bg-muted/30 p-2">
                    <p className="text-xs font-medium">{selectedCard.title}</p>
                    {selectedCard.description && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {selectedCard.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    New card title *
                  </label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. The 4-ratio liquidity grid"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Card description
                  </label>
                  <Textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="One-sentence summary of what this drawing teaches"
                    className="mt-1 min-h-[72px] text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Tags (comma-separated)
                  </label>
                  <Input
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="e.g. liquidity, retirement, ucc"
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmCaseStudyOpen(true)}
              disabled={busy}
              className="text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              title="Not concept material — belongs to a case study"
            >
              <FolderInput className="h-4 w-4 mr-1.5" />
              Move to case studies
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={busy}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete photo
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            {mode === "pick-existing" ? (
              <Button
                onClick={handleBindToExisting}
                disabled={!selectedCardId || busy}
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {sourceCard ? "Move to selected card" : "Bind to card"}
              </Button>
            ) : (
              <Button onClick={handleCreateNew} disabled={!newTitle.trim() || busy}>
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {sourceCard ? "Move to new card" : "Create card + bind"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={confirmCaseStudyOpen} onOpenChange={setConfirmCaseStudyOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to case-studies folder?</AlertDialogTitle>
            <AlertDialogDescription>
              This photo will be moved out of the concept-card binding pool and
              into <code>case-studies/</code> in storage. If any concept cards
              currently reference it, the URL is stripped from them first. The
              file itself is preserved — you can still surface it on the Case
              Vault page later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleMoveToCaseStudies();
              }}
              disabled={busy}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <FolderInput className="h-4 w-4 mr-1.5" />
              )}
              Move to case studies
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this drawing?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the file from storage. If any concept
              cards reference it, the URL is stripped from them first. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                // Prevent the default close so we can show the spinner;
                // we close manually inside handleDelete.
                e.preventDefault();
                handleDelete();
              }}
              disabled={busy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1.5" />
              )}
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MinimalRichEditor, mdToHtml, type MinimalRichEditorHandle } from "@/components/MinimalRichEditor";
import { cn } from "@/lib/utils";
import { convertImageEmbeds } from "@/features/first-60-days/parse";
import { groupParts, replaceBlocks, splitBlocks, tidyRichMarkdown, type Part } from "@/features/first-14-days/blocks";
import { hashSource, MAX_EDIT_CHARS, shownSource } from "@/features/first-14-days/edits";
import { EditConflictError, useDayEdits } from "@/hooks/first-14-days/useDayEdits";
import { lessonMarkdownComponents } from "./lessonMarkdown";

// Shared with DayEditor (the markdown view), so a draft follows the admin between the two.
const draftKey = (day: number) => `f14-edit-draft:${day}`;
const readDraft = (day: number) => {
  try {
    return localStorage.getItem(draftKey(day));
  } catch {
    return null;
  }
};
const writeDraft = (day: number, text: string | null) => {
  try {
    if (text === null) localStorage.removeItem(draftKey(day));
    else localStorage.setItem(draftKey(day), text);
  } catch {
    // Private mode: the draft just isn't kept across reloads.
  }
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-SG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** Non-space characters of `el`'s text before the point (x, y), or null when the point misses its text. */
function charsBefore(el: HTMLElement, x: number, y: number): number | null {
  const d = document as Document & { caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null };
  const p = d.caretPositionFromPoint?.(x, y);
  const r = p ? null : document.caretRangeFromPoint?.(x, y);
  const node = p?.offsetNode ?? r?.startContainer;
  if (!node || !el.contains(node)) return null;
  const range = document.createRange();
  range.setStart(el, 0);
  range.setEnd(node, p ? p.offset : r!.startOffset);
  return range.toString().replace(/\s/g, "").length;
}

type Opened = { part: number; chars: number | null; clientY?: number };

function PartEditor({
  text,
  rich,
  at,
  editorRef,
  onChange,
  onDone,
  onCancel,
}: {
  text: string;
  rich: boolean;
  at: Opened;
  editorRef: React.RefObject<MinimalRichEditorHandle>;
  onChange: (text: string) => void;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [raw, setRaw] = useState(text);

  // Once, as the part opens: the cursor goes where the click landed, at the same spot on screen.
  useEffect(() => {
    if (rich) editorRef.current?.focusAtChars(at.chars ?? 0, at.chars === null ? undefined : at.clientY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn(
        "not-prose my-3 space-y-2 rounded-xl border-2 border-primary/50 bg-background p-2 shadow-sm",
        // Paragraph and list spacing as the lesson has it, so a whole section doesn't read as one block of text.
        "[&_.ProseMirror>ol]:mb-3 [&_.ProseMirror>p]:mb-3 [&_.ProseMirror>ul]:mb-3",
      )}
    >
      {rich ? (
        <MinimalRichEditor
          ref={editorRef}
          value={text}
          onChange={onChange}
          onSave={onDone}
          onCancel={onCancel}
          // A section can run for screens; the toolbar stays in reach under the top nav (one scrolling row on phones).
          toolbarClassName="sticky top-14 z-10 rounded-t-lg bg-background max-md:flex-nowrap max-md:overflow-x-auto"
        />
      ) : (
        <textarea
          aria-label="Block text (markdown)"
          value={raw}
          autoFocus
          rows={Math.min(24, raw.split("\n").length + 1)}
          onChange={(e) => {
            setRaw(e.target.value);
            onChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onDone();
          }}
          className="w-full resize-y rounded-lg border bg-background p-2 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )}
      <div className="flex items-center justify-end gap-2">
        <span className="mr-auto hidden text-xs text-muted-foreground sm:inline">Esc to cancel, Ctrl+Enter when done</span>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

// Admin inline editing of one First 14 Days lesson: the lesson as learners see
// it, where a click opens that part for editing in place: all the prose between
// two images or diagrams at once, or the one image or diagram. Clicking another
// part keeps the edit and moves on. Changes collect in a draft (kept across
// reloads) until Publish puts them live.
export function InlineLessonEditor({
  dayNumber,
  fileSource,
  onExit,
  onOpenMarkdown,
}: {
  dayNumber: number;
  fileSource: string;
  onExit: () => void;
  onOpenMarkdown: () => void;
}) {
  const { edits, save } = useDayEdits(dayNumber);
  const live = shownSource(edits, fileSource);
  const [openedAt] = useState<number | null>(edits[0]?.id ?? null);
  const [draftBack] = useState(() => {
    const d = readDraft(dayNumber);
    return d !== null && d !== live ? d : null;
  });
  const [draft, setDraft] = useState(draftBack ?? live);
  const [open, setOpen] = useState<Opened | null>(null);
  // Latest text of the open part, so the draft and the unsaved state include what's being typed.
  const [pending, setPending] = useState<string | null>(null);
  const [conflictAt, setConflictAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<MinimalRichEditorHandle>(null);

  const { blocks } = useMemo(() => splitBlocks(draft), [draft]);
  const parts = useMemo(() => groupParts(blocks), [blocks]);
  const partText = (p: Part) =>
    blocks
      .slice(p.start, p.end)
      .map((b) => b.text)
      .join("\n\n");
  const apply = (source: string, p: Part, text: string) =>
    replaceBlocks(source, p.start, p.end, p.rich ? tidyRichMarkdown(text) : text, p.rich ? mdToHtml : undefined);
  const openPart = open ? (parts[open.part] ?? null) : null;
  const current = useMemo(
    () => (openPart && pending !== null ? apply(draft, openPart, pending) : draft),
    [draft, openPart, pending],
  );
  const dirty = current !== live;
  const tooLong = current.length > MAX_EDIT_CHARS;

  useEffect(() => {
    writeDraft(dayNumber, dirty ? current : null);
  }, [dayNumber, current, dirty]);

  /** Folds the open part into the draft and closes it; returns the new draft. */
  const commit = async () => {
    if (!openPart) return draft;
    const text = openPart.rich ? await editorRef.current?.getMarkdownForSave() : pending;
    const next = text == null ? draft : apply(draft, openPart, text);
    setDraft(next);
    setOpen(null);
    setPending(null);
    // Written now as well: Close and Markdown unmount this view before the effect would run.
    writeDraft(dayNumber, next !== live ? next : null);
    return next;
  };

  const openAt = async (i: number, e?: React.MouseEvent<HTMLElement>) => {
    if (open?.part === i) return;
    const at = e ? { chars: charsBefore(e.currentTarget, e.clientX, e.clientY), clientY: e.clientY } : { chars: null };
    const before = parts.length;
    const next = await commit();
    // An edit can split its section (a pasted image), shifting the parts after it.
    const shift = open && i > open.part ? groupParts(splitBlocks(next).blocks).length - before : 0;
    setOpen({ part: i + shift, ...at });
  };

  const discard = () => {
    setDraft(live);
    setOpen(null);
    setPending(null);
  };

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const publish = async (force = false) => {
    setError(null);
    setConflictAt(null);
    const markdown = await commit();
    if (markdown === live) {
      toast.info("No changes to publish.");
      return;
    }
    try {
      await save.mutateAsync({ markdown, baseHash: hashSource(fileSource), expectedLatestId: openedAt, force });
      writeDraft(dayNumber, null);
      toast.success(`Day ${dayNumber} published. Learners see it now.`);
      onExit();
    } catch (e) {
      if (e instanceof EditConflictError) setConflictAt(e.savedAt);
      else setError(e instanceof Error ? e.message : "Could not publish.");
    }
  };

  return (
    <div data-testid="inline-lesson-editor" className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm">
        <span className="font-medium">Click any part of the lesson to edit it.</span>
        {draftBack !== null && dirty && (
          <span className="text-muted-foreground">
            Your unsaved draft is back.{" "}
            <button type="button" className="underline" onClick={discard}>
              Discard it
            </button>
          </span>
        )}
      </div>

      <div className="prose prose-sm max-w-none rounded-2xl border border-border/60 bg-card px-5 py-6 shadow-card dark:prose-invert sm:prose-base sm:px-8 sm:py-8">
        {parts.map((p, i) =>
          i === open?.part ? (
            <PartEditor
              key={`open-${i}`}
              text={partText(p)}
              rich={p.rich}
              at={open}
              editorRef={editorRef}
              onChange={setPending}
              onDone={() => void commit()}
              onCancel={() => {
                setOpen(null);
                setPending(null);
              }}
            />
          ) : (
            <div
              key={`${i}-${p.start}-${p.end}`}
              role="button"
              tabIndex={0}
              aria-label={`Edit part ${i + 1} of the lesson`}
              // Links and images open the editor here instead of navigating away from the draft.
              onClickCapture={(e) => {
                if ((e.target as HTMLElement).closest("a")) e.preventDefault();
              }}
              onClick={(e) => void openAt(i, e)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target === e.currentTarget) void openAt(i);
              }}
              // Each part renders alone, so the lesson's first/last-child margin reset would close every gap.
              className="-mx-2 my-4 cursor-text rounded-lg px-2 transition-shadow first:mt-0 hover:ring-2 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={lessonMarkdownComponents}>
                {convertImageEmbeds(partText(p))}
              </ReactMarkdown>
            </div>
          ),
        )}
      </div>

      {/* Right margin keeps Publish clear of the floating assistant button. */}
      <div className="sticky bottom-20 z-20 mr-16 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur md:bottom-4 md:mr-20">
        {conflictAt && (
          <p className="mb-2 text-sm">
            Someone else saved Day {dayNumber} at {when(conflictAt)}, after you started.{" "}
            <button type="button" className="font-medium underline" onClick={() => void publish(true)}>
              Publish mine anyway
            </button>
          </p>
        )}
        {error && (
          <p role="alert" className="mb-2 text-sm text-destructive">
            Not published: {error} Your changes are still here, try again.
          </p>
        )}
        {tooLong && <p className="mb-2 text-sm text-destructive">Too long to publish: {current.length.toLocaleString()} of {MAX_EDIT_CHARS.toLocaleString()} characters.</p>}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-auto w-full text-sm sm:w-auto">
            {dirty ? (
              <>
                Unsaved changes.{" "}
                <button type="button" className="text-muted-foreground underline" onClick={discard}>
                  Discard
                </button>
              </>
            ) : (
              <span className="text-muted-foreground">No changes yet</span>
            )}
          </span>
          <Button size="sm" variant="ghost" onClick={() => void commit().then(onOpenMarkdown)} aria-label="Markdown and history">
            <span className="sm:hidden">Markdown</span>
            <span className="hidden sm:inline">Markdown and history</span>
          </Button>
          <Button size="sm" variant="outline" onClick={() => void commit().then(onExit)} disabled={save.isPending}>
            Close
          </Button>
          <Button size="sm" onClick={() => void publish()} disabled={(!dirty && !open) || tooLong || save.isPending}>
            {save.isPending ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}

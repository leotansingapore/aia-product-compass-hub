import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MinimalRichEditor, type MinimalRichEditorHandle } from "@/components/MinimalRichEditor";
import { cn } from "@/lib/utils";
import { convertImageEmbeds } from "@/features/first-60-days/parse";
import { blockKind, replaceBlock, splitBlocks } from "@/features/first-14-days/blocks";
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

// A trailing empty paragraph comes back from the rich-text editor as "&nbsp;".
const cleanRich = (md: string) => md.replace(/(\n\s*&nbsp;\s*)+$/g, "").replace(/^\s*&nbsp;\s*\n+/, "").trim();

function BlockEditor({ text, onDone, onCancel }: { text: string; onDone: (next: string) => void; onCancel: () => void }) {
  const rich = blockKind(text) === "rich";
  const editorRef = useRef<MinimalRichEditorHandle>(null);
  const touched = useRef(false);
  const [raw, setRaw] = useState(text);

  const done = async () => {
    if (!rich) return onDone(raw);
    // An untouched rich block keeps its exact markdown: the editor's round trip may respace lists.
    if (!touched.current) return onCancel();
    onDone(cleanRich((await editorRef.current?.getMarkdownForSave()) ?? text));
  };

  return (
    <div className="not-prose my-3 space-y-2 rounded-xl border-2 border-primary/50 bg-background p-2 shadow-sm">
      {rich ? (
        <MinimalRichEditor
          ref={editorRef}
          value={text}
          onChange={() => {
            touched.current = true;
          }}
          onSave={done}
          onCancel={onCancel}
          autoFocus
        />
      ) : (
        <textarea
          aria-label="Block text (markdown)"
          value={raw}
          autoFocus
          rows={Math.min(24, raw.split("\n").length + 1)}
          onChange={(e) => setRaw(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel();
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void done();
          }}
          className="w-full resize-y rounded-lg border bg-background p-2 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )}
      <div className="flex items-center justify-end gap-2">
        <span className="mr-auto hidden text-xs text-muted-foreground sm:inline">Esc to cancel, Ctrl+Enter when done</span>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={() => void done()}>
          Done
        </Button>
      </div>
    </div>
  );
}

// Admin inline editing of one First 14 Days lesson: the lesson as learners see
// it, where clicking any part opens it for editing in place. Changes collect
// in a draft (kept across reloads) until Publish puts them live.
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
  const [editing, setEditing] = useState<number | null>(null);
  const [conflictAt, setConflictAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { blocks } = useMemo(() => splitBlocks(draft), [draft]);
  const dirty = draft !== live;
  const tooLong = draft.length > MAX_EDIT_CHARS;

  useEffect(() => {
    writeDraft(dayNumber, dirty ? draft : null);
  }, [dayNumber, draft, dirty]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const publish = async (force = false) => {
    setError(null);
    setConflictAt(null);
    try {
      await save.mutateAsync({ markdown: draft, baseHash: hashSource(fileSource), expectedLatestId: openedAt, force });
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
            <button type="button" className="underline" onClick={() => setDraft(live)}>
              Discard it
            </button>
          </span>
        )}
      </div>

      <div className="prose prose-sm max-w-none rounded-2xl border border-border/60 bg-card px-5 py-6 shadow-card dark:prose-invert sm:prose-base sm:px-8 sm:py-8">
        {blocks.map((block, i) =>
          i === editing ? (
            <BlockEditor
              key={`edit-${i}`}
              text={block.text}
              onCancel={() => setEditing(null)}
              onDone={(next) => {
                setDraft((d) => replaceBlock(d, i, next));
                setEditing(null);
              }}
            />
          ) : (
            <div
              key={`${i}-${block.text.length}`}
              role="button"
              tabIndex={0}
              aria-label={`Edit part ${i + 1} of the lesson`}
              // Links and images open the editor here instead of navigating away from the draft.
              onClickCapture={(e) => {
                if ((e.target as HTMLElement).closest("a")) e.preventDefault();
              }}
              onClick={() => editing === null && setEditing(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target === e.currentTarget && editing === null) setEditing(i);
              }}
              className={cn(
                // Each part renders alone, so the lesson's first/last-child margin reset would close every gap.
                "-mx-2 my-4 rounded-lg px-2 transition-shadow first:mt-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                editing === null ? "cursor-text hover:ring-2 hover:ring-primary/30" : "opacity-60",
              )}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={lessonMarkdownComponents}>
                {convertImageEmbeds(block.text)}
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
        {tooLong && <p className="mb-2 text-sm text-destructive">Too long to publish: {draft.length.toLocaleString()} of {MAX_EDIT_CHARS.toLocaleString()} characters.</p>}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-auto w-full text-sm sm:w-auto">
            {editing !== null ? (
              "Click Done on the part you're editing"
            ) : dirty ? (
              <>
                Unsaved changes.{" "}
                <button type="button" className="text-muted-foreground underline" onClick={() => setDraft(live)}>
                  Discard
                </button>
              </>
            ) : (
              <span className="text-muted-foreground">No changes yet</span>
            )}
          </span>
          <Button size="sm" variant="ghost" onClick={onOpenMarkdown} disabled={editing !== null} aria-label="Markdown and history">
            <span className="sm:hidden">Markdown</span>
            <span className="hidden sm:inline">Markdown and history</span>
          </Button>
          <Button size="sm" variant="outline" onClick={onExit} disabled={save.isPending}>
            Close
          </Button>
          <Button size="sm" onClick={() => void publish()} disabled={!dirty || editing !== null || tooLong || save.isPending}>
            {save.isPending ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}

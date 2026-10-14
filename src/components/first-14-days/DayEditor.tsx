import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { convertImageEmbeds } from "@/features/first-60-days/parse";
import { hashSource, MAX_EDIT_CHARS, shownSource, type DayEdit } from "@/features/first-14-days/edits";
import { EditConflictError, useDayEdits } from "@/hooks/first-14-days/useDayEdits";
import { lessonMarkdownComponents } from "./lessonMarkdown";

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

// Admin editor for one First 14 Days lesson: the text on the left, the page as
// learners will see it on the right (Write / Preview tabs on a phone). Saves go
// live at once; every save is kept, so any earlier version can be restored.
export function DayEditor({ dayNumber, fileSource, onClose }: { dayNumber: number; fileSource: string; onClose: () => void }) {
  const { edits, save } = useDayEdits(dayNumber);
  const current = shownSource(edits, fileSource);
  // The newest edit when the editor opened: a save checks nobody saved since.
  const [openedAt] = useState<number | null>(edits[0]?.id ?? null);
  const [draftBack] = useState(() => {
    const d = readDraft(dayNumber);
    return d !== null && d !== current ? d : null;
  });
  const [text, setText] = useState(draftBack ?? current);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [conflictAt, setConflictAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = text !== current;
  const tooLong = text.length > MAX_EDIT_CHARS;

  useEffect(() => {
    writeDraft(dayNumber, dirty ? text : null);
  }, [dayNumber, text, dirty]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const submit = async (markdown: string | null, force = false, done = `Day ${dayNumber} saved. Learners see it now.`) => {
    setError(null);
    setConflictAt(null);
    try {
      await save.mutateAsync({ markdown, baseHash: hashSource(fileSource), expectedLatestId: openedAt, force });
      writeDraft(dayNumber, null);
      toast.success(done);
      onClose();
    } catch (e) {
      if (e instanceof EditConflictError) setConflictAt(e.savedAt);
      else setError(e instanceof Error ? e.message : "Could not save.");
    }
  };

  const restore = (edit: DayEdit | null) =>
    submit(edit ? edit.markdown : null, false, edit ? `Day ${dayNumber} restored to the ${when(edit.created_at)} version.` : `Day ${dayNumber} shows the lesson file again.`);

  return (
    <section aria-label={`Edit Day ${dayNumber}`} className="space-y-3 rounded-2xl border border-primary/30 bg-card p-4 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Editing Day {dayNumber}</h2>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "write" | "preview")} className="md:hidden">
          <TabsList aria-label="Editor view">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {draftBack !== null && dirty && (
        <p className="text-sm text-muted-foreground">
          Your unsaved draft is back.{" "}
          <button type="button" className="underline" onClick={() => setText(current)}>
            Discard it
          </button>
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <textarea
          aria-label="Lesson text (markdown)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck
          className={cn(
            "min-h-[60vh] w-full resize-y rounded-xl border bg-background p-3 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring",
            tab === "preview" && "hidden md:block",
          )}
        />
        <div
          aria-label="Preview"
          className={cn(
            "prose prose-sm max-h-[75vh] max-w-none overflow-y-auto rounded-xl border p-4 dark:prose-invert",
            tab === "write" && "hidden md:block",
          )}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={lessonMarkdownComponents}>
            {convertImageEmbeds(text)}
          </ReactMarkdown>
        </div>
      </div>

      {tooLong && <p className="text-sm text-destructive">Too long to save: {text.length.toLocaleString()} of {MAX_EDIT_CHARS.toLocaleString()} characters.</p>}
      {conflictAt && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <span>Someone else saved Day {dayNumber} at {when(conflictAt)}, after you opened it. Your text is still here.</span>
          <Button size="sm" variant="outline" onClick={() => submit(text, true)}>
            Save mine anyway
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          Not saved: {error} Your text is still here, try again.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={save.isPending}>
          {dirty ? "Close (draft kept)" : "Close"}
        </Button>
        <Button onClick={() => submit(text)} disabled={!dirty || !text.trim() || tooLong || save.isPending}>
          {save.isPending ? "Saving..." : "Save and publish"}
        </Button>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer font-medium">Earlier versions</summary>
        <ul className="mt-2 divide-y rounded-lg border">
          {edits.map((e, i) => (
            <li key={e.id} className="flex items-center justify-between gap-2 px-3 py-2">
              <span>
                {when(e.created_at)}: {e.markdown === null ? "lesson file" : "app edit"}
                {i === 0 && <span className="text-muted-foreground"> (live now)</span>}
              </span>
              {i > 0 && (
                <Button size="sm" variant="outline" disabled={save.isPending} onClick={() => restore(e)}>
                  Restore
                </Button>
              )}
            </li>
          ))}
          <li className="flex items-center justify-between gap-2 px-3 py-2">
            <span>The lesson file in the code{edits.length === 0 || edits[0].markdown === null ? <span className="text-muted-foreground"> (live now)</span> : null}</span>
            {edits.length > 0 && edits[0].markdown !== null && (
              <Button size="sm" variant="outline" disabled={save.isPending} onClick={() => restore(null)}>
                Restore
              </Button>
            )}
          </li>
        </ul>
      </details>
    </section>
  );
}

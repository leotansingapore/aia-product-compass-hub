import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  Quote,
  RotateCcw,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";

type Statement = { id: string; text: string; included: boolean };

const STORAGE_PREFIX = "testimonial-generator-v1";

// Experience-based starter statements (service, trust, clarity — never product
// performance or returns). FCs edit these into their own voice, add their own,
// and drop the chosen ones into a Google Form for clients to pick from.
const STARTERS: string[] = [
  "Explained everything in plain language - I finally understood what I was paying for.",
  "Never pushy - I felt they were on my side, not selling to me.",
  "Took the time to understand my situation before recommending anything.",
  "Honest - told me when what I already had was fine and didn't need changing.",
  "Quick to reply whenever I had a question.",
  "Patient with all my questions, no matter how basic.",
  "Made a stressful topic feel manageable.",
  "Helped me see gaps in my cover I didn't know I had.",
  "Followed up exactly when they said they would.",
  "Genuinely cared about my family's situation, not just the paperwork.",
  "Broke down my options clearly so I could decide for myself.",
  "Respected my budget and never oversold.",
  "Professional and well-prepared at every meeting.",
  "I trust them with my family's planning.",
  "I've already recommended them to friends and family.",
];

const QUESTION_PROMPT =
  "Which of these best describe your experience working with me? Tick any that apply.";

function uid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `s_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  }
}

function seed(): Statement[] {
  return STARTERS.map((text) => ({ id: uid(), text, included: true }));
}

export default function TestimonialGenerator() {
  const { user } = useSimplifiedAuth();
  const storageKey = `${STORAGE_PREFIX}:${user?.id ?? "anon"}`;

  const [statements, setStatements] = useState<Statement[]>([]);
  const [draft, setDraft] = useState("");
  // Client-side demo of the picker: which statements a client "ticked".
  const [previewChecked, setPreviewChecked] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage (or seed on first visit).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Statement[];
        if (Array.isArray(parsed) && parsed.length) {
          setStatements(parsed);
          setLoaded(true);
          return;
        }
      }
    } catch {
      /* ignore */
    }
    setStatements(seed());
    setLoaded(true);
  }, [storageKey]);

  // Persist on change (once loaded, so we don't clobber with the empty initial state).
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(statements));
    } catch {
      /* ignore quota errors */
    }
  }, [statements, storageKey, loaded]);

  const included = useMemo(() => statements.filter((s) => s.text.trim() && s.included), [statements]);

  const optionsText = useMemo(() => included.map((s) => s.text.trim()).join("\n"), [included]);

  const assembledPreview = useMemo(
    () =>
      included
        .filter((s) => previewChecked.has(s.id))
        .map((s) => s.text.trim())
        .join(" "),
    [included, previewChecked],
  );

  const addStatement = () => {
    const text = draft.trim();
    if (!text) return;
    setStatements((prev) => [...prev, { id: uid(), text, included: true }]);
    setDraft("");
  };

  const updateText = (id: string, text: string) =>
    setStatements((prev) => prev.map((s) => (s.id === id ? { ...s, text } : s)));

  const toggleIncluded = (id: string) =>
    setStatements((prev) => prev.map((s) => (s.id === id ? { ...s, included: !s.included } : s)));

  const remove = (id: string) => {
    setStatements((prev) => prev.filter((s) => s.id !== id));
    setPreviewChecked((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const togglePreview = (id: string) =>
    setPreviewChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const copy = async (text: string, label: string) => {
    if (!text.trim()) {
      toast.error("Nothing to copy yet");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed — select and copy manually");
    }
  };

  const resetStarters = () => {
    if (!confirm("Reset to the starter statements? Your custom edits will be replaced.")) return;
    setStatements(seed());
    setPreviewChecked(new Set());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 px-3 py-4 sm:space-y-6 sm:px-0 sm:py-6">
      <Link
        to="/learning-track/pre-rnf/assignments/marketing-kit"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Build Your Marketing Kit
      </Link>

      <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-8">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary shrink-0">
            <Quote className="h-5 w-5 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0 space-y-2">
            <h1 className="text-xl sm:text-3xl font-serif font-bold leading-tight">Testimonial Generator</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Clients don't know what to write — so let them <strong>pick</strong>, not write. Build your bank of
              short testimonial statements below, then drop them into a Google Form as a checkbox question. A client
              ticks the ones that fit them, and their picks become their testimonial in seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Statement bank editor */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 font-serif">
                <ListChecks className="h-5 w-5 text-primary" /> Your statement bank
              </CardTitle>
              <CardDescription>
                Edit these into your own voice, untick any you won't use, and add your own.{" "}
                <span className="text-foreground/70">{included.length} included</span>
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={resetStarters} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Reset to starters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {statements.map((s) => (
            <div
              key={s.id}
              className={cn(
                "flex items-start gap-2 rounded-lg border p-2 transition-colors",
                s.included ? "bg-background" : "bg-muted/40 opacity-60",
              )}
            >
              <input
                type="checkbox"
                checked={s.included}
                onChange={() => toggleIncluded(s.id)}
                aria-label="Include this statement"
                className="mt-2 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
              />
              <Input
                value={s.text}
                onChange={(e) => updateText(s.id, e.target.value)}
                className="flex-1 border-0 bg-transparent focus-visible:ring-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(s.id)}
                aria-label="Remove statement"
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-1">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addStatement()}
              placeholder="Add your own statement — in a client's voice…"
              className="flex-1"
            />
            <Button onClick={addStatement} className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Load into a Google Form */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Load it into a Google Form</CardTitle>
          <CardDescription>Three steps and clients can start picking.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">1</span>
              <div className="space-y-2">
                <p>Open a blank Google Form and add one <strong>Checkboxes</strong> question.</p>
                <a href="https://forms.new" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    Create a Google Form <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">2</span>
              <div className="flex-1 space-y-2">
                <p>Paste this as the question title:</p>
                <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3">
                  <p className="flex-1 text-sm">{QUESTION_PROMPT}</p>
                  <Button variant="ghost" size="icon" onClick={() => copy(QUESTION_PROMPT, "Question")} className="shrink-0">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">3</span>
              <div className="flex-1 space-y-2">
                <p>
                  Copy your {included.length} options, then <strong>paste them into the first option box</strong> —
                  Google Forms splits each line into its own checkbox automatically.
                </p>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs text-foreground/80">
{optionsText || "Include at least one statement above."}
                  </pre>
                  <Button
                    size="sm"
                    onClick={() => copy(optionsText, `${included.length} options`)}
                    className="mt-2 gap-1.5"
                  >
                    <Copy className="h-4 w-4" /> Copy all options
                  </Button>
                </div>
              </div>
            </li>
          </ol>
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
            <strong className="text-foreground/80">Keep it clean:</strong> add a short “Anything else to add?” text
            box and a permission checkbox (they agree you may use their picked words, with their first name /
            initials). Only ever use what a client genuinely ticked, and keep every line about the experience of
            working with you — never guaranteed returns, product performance, or “best / cheapest”. Follow your
            firm's rules on using testimonials.
          </p>
        </CardContent>
      </Card>

      {/* Client picker preview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Preview — what your client sees</CardTitle>
          <CardDescription>Tick a few to see how their selections read as a testimonial.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {included.length === 0 ? (
            <p className="text-sm text-muted-foreground">Include at least one statement to preview the picker.</p>
          ) : (
            <>
              <p className="text-sm font-medium">{QUESTION_PROMPT}</p>
              <div className="space-y-1.5">
                {included.map((s) => (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-start gap-2.5 rounded-lg border bg-background p-2.5 text-sm hover:bg-muted/40"
                  >
                    <input
                      type="checkbox"
                      checked={previewChecked.has(s.id)}
                      onChange={() => togglePreview(s.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
                    />
                    <span>{s.text}</span>
                  </label>
                ))}
              </div>
              {assembledPreview && (
                <div className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Their testimonial
                  </div>
                  <p className="text-sm italic leading-relaxed">“{assembledPreview}”</p>
                  <Button variant="outline" size="sm" onClick={() => copy(assembledPreview, "Testimonial")} className="gap-1.5">
                    <Copy className="h-3.5 w-3.5" /> Copy testimonial
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <p className="flex items-center gap-1.5 pb-4 text-xs text-muted-foreground">
        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
        Your statement bank saves automatically on this device.
      </p>
    </div>
  );
}

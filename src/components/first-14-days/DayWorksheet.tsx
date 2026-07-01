import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ReflectionPrompt } from "@/features/first-14-days/types";
import {
  useFirst14DaysProgress,
  type ReflectionAnswers,
  type DayProgress,
} from "@/hooks/first-14-days/useFirst14DaysProgress";

/**
 * Self-reflective worksheet for First 14 Days prospects.
 * Unlike First 60 Days, there's no "submit vs draft" distinction — the prospect
 * saves for their own reference. Nothing is submitted anywhere.
 */
export type WorksheetProgressAdapter = {
  getDay: (dayNumber: number) => DayProgress;
  saveReflection: (dayNumber: number, answers: ReflectionAnswers) => void;
};

type Props = {
  dayNumber: number;
  prompts: ReflectionPrompt[];
  progress?: WorksheetProgressAdapter;
};

const MIN_CHARS_PER_ANSWER = 10;

export function DayWorksheet({ dayNumber, prompts, progress: externalProgress }: Props) {
  const defaultProgress = useFirst14DaysProgress();
  const { getDay, saveReflection } = externalProgress ?? defaultProgress;
  const persisted = getDay(dayNumber);

  const initial = useMemo<ReflectionAnswers>(() => {
    const base: ReflectionAnswers = {};
    for (const p of prompts) base[String(p.index)] = "";
    return { ...base, ...(persisted.reflectionAnswers ?? {}) };
  }, [prompts, persisted.reflectionAnswers]);

  const [answers, setAnswers] = useState<ReflectionAnswers>(initial);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(
    persisted.reflectionSavedAt ?? null,
  );

  // Seed local answers only on first load or a genuine external change while the
  // learner has no unsaved edits — so live auto-save never clobbers typing.
  const serverJson = JSON.stringify(persisted.reflectionAnswers ?? {});
  const seededRef = useRef<string | null>(null);
  useEffect(() => {
    if (seededRef.current === null) {
      setAnswers(initial);
      seededRef.current = serverJson;
      return;
    }
    if (serverJson !== seededRef.current) {
      if (JSON.stringify(answers) === seededRef.current) setAnswers(initial);
      seededRef.current = serverJson;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverJson, initial]);

  // Live auto-save to the account a short moment after typing stops — no Save
  // button needed; survives refresh / logout / another device.
  useEffect(() => {
    if (JSON.stringify(answers) === serverJson) return;
    const t = window.setTimeout(() => {
      setAutoSaving(true);
      try {
        saveReflection(dayNumber, answers);
        setLastSavedAt(new Date().toISOString());
      } finally {
        setAutoSaving(false);
      }
    }, 1200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, serverJson, dayNumber]);

  if (prompts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          This day doesn&apos;t have a worksheet.
        </CardContent>
      </Card>
    );
  }

  const answeredCount = prompts.filter(
    (p) => (answers[String(p.index)] ?? "").trim().length >= MIN_CHARS_PER_ANSWER,
  ).length;
  const allAnswered = answeredCount === prompts.length;
  const hasSaved = Boolean(persisted.reflectionSavedAt);

  return (
    <div className="space-y-4">
      {hasSaved && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="flex items-center gap-2 p-4 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>
              You&apos;ve started this worksheet
              {persisted.reflectionSavedAt && (
                <> — last saved {new Date(persisted.reflectionSavedAt).toLocaleDateString()}</>
              )}
              . Only you see these answers. Keep editing anytime.
            </span>
          </CardContent>
        </Card>
      )}

      {prompts.map((p) => {
        const value = answers[String(p.index)] ?? "";
        const shortfall = value.trim().length > 0 && value.trim().length < MIN_CHARS_PER_ANSWER;
        return (
          <Card key={p.index}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-start gap-2 text-base font-semibold">
                <span className="text-muted-foreground">{p.index}.</span>
                <span>{p.question}</span>
              </CardTitle>
              {p.hint && <p className="pl-6 text-sm italic text-muted-foreground">{p.hint}</p>}
            </CardHeader>
            <CardContent>
              <Textarea
                rows={4}
                placeholder={p.hint ?? "Write what's true for you — this is only for your own eyes."}
                value={value}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [String(p.index)]: e.target.value }))
                }
                className="min-h-[100px]"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{value.trim().length} characters</span>
                {shortfall && (
                  <span className="text-amber-600">
                    Minimum {MIN_CHARS_PER_ANSWER} characters to count as answered
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant={allAnswered ? "secondary" : "outline"}>
            {answeredCount} / {prompts.length} answered
          </Badge>
          {autoSaving ? (
            <span className="inline-flex items-center gap-1 text-xs">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </span>
          ) : lastSavedAt ? (
            <span className="inline-flex items-center gap-1 text-xs">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Saved automatically
              {" · "}
              {new Date(lastSavedAt).toLocaleTimeString()}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

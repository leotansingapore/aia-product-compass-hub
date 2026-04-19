import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ReflectionPrompt } from "@/features/first-60-days/types";
import {
  useFirst60DaysProgress,
  type ReflectionAnswers,
} from "@/hooks/first-60-days/useFirst60DaysProgress";

type Props = {
  dayNumber: number;
  prompts: ReflectionPrompt[];
};

const MIN_CHARS_PER_ANSWER = 10;

export function DayReflection({ dayNumber, prompts }: Props) {
  const { getDay, saveReflection, isReflectionSubmitted } = useFirst60DaysProgress();
  const persisted = getDay(dayNumber);
  const submitted = isReflectionSubmitted(dayNumber);

  const initial = useMemo<ReflectionAnswers>(() => {
    const base: ReflectionAnswers = {};
    for (const p of prompts) base[String(p.index)] = "";
    return { ...base, ...(persisted.reflectionAnswers ?? {}) };
  }, [prompts, persisted.reflectionAnswers]);

  const [answers, setAnswers] = useState<ReflectionAnswers>(initial);
  const [busy, setBusy] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(
    persisted.reflectionAnswers ? persisted.reflectionSubmittedAt ?? null : null
  );

  useEffect(() => {
    setAnswers(initial);
  }, [initial]);

  if (prompts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          This day doesn't have a reflection worksheet.
        </CardContent>
      </Card>
    );
  }

  const allAnswered = prompts.every((p) => {
    const val = (answers[String(p.index)] ?? "").trim();
    return val.length >= MIN_CHARS_PER_ANSWER;
  });
  const dirty = JSON.stringify(answers) !== JSON.stringify(persisted.reflectionAnswers ?? initial);

  const persist = async (submit: boolean) => {
    setBusy(true);
    try {
      saveReflection(dayNumber, answers, submit);
      setLastSavedAt(new Date().toISOString());
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {submitted && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="flex items-center gap-2 p-4 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>
              Reflection submitted
              {persisted.reflectionSubmittedAt && (
                <> on {new Date(persisted.reflectionSubmittedAt).toLocaleDateString()}</>
              )}
              . You can still edit and re-save your answers.
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
              {p.hint && (
                <p className="pl-6 text-sm italic text-muted-foreground">{p.hint}</p>
              )}
            </CardHeader>
            <CardContent>
              <Textarea
                rows={4}
                placeholder={
                  p.hint ??
                  "Write your answer — don't just think it. Your mentor and admins can see this."
                }
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
            {prompts.filter((p) => (answers[String(p.index)] ?? "").trim().length >= MIN_CHARS_PER_ANSWER).length}
            {" / "}
            {prompts.length} answered
          </Badge>
          {lastSavedAt && (
            <span className="text-xs">Last saved {new Date(lastSavedAt).toLocaleTimeString()}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={busy || !dirty}
            onClick={() => persist(false)}
          >
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save draft
          </Button>
          <Button disabled={busy || !allAnswered} onClick={() => persist(true)}>
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : submitted ? (
              <Save className="mr-2 h-4 w-4" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {submitted ? "Save changes" : "Submit reflection"}
          </Button>
        </div>
      </div>
    </div>
  );
}

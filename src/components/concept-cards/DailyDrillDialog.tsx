import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Pencil,
  Timer,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Flame,
  Trophy,
  Eye,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConceptCard } from "@/hooks/useConceptCards";

const DRILL_DURATION_SECONDS = 60;
const DRILL_CARDS_PER_SESSION = 3;
const STREAK_STORAGE_KEY = "concept-card-drill-streak";

type DrillScore = "got-it" | "close" | "missed";

interface DrillStreakData {
  lastDrillDate: string; // ISO date string YYYY-MM-DD
  streak: number;
  totalDrills: number;
}

function readStreak(): DrillStreakData {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) return { lastDrillDate: "", streak: 0, totalDrills: 0 };
    return JSON.parse(raw) as DrillStreakData;
  } catch {
    return { lastDrillDate: "", streak: 0, totalDrills: 0 };
  }
}

function writeStreak(data: DrillStreakData) {
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Recompute the streak on a fresh drill completion.
 * - Same day: no change (already drilled today)
 * - Yesterday: streak + 1
 * - Older: streak resets to 1
 */
function updateStreakOnDrillComplete(prev: DrillStreakData): DrillStreakData {
  const today = todayIso();
  if (prev.lastDrillDate === today) {
    return { ...prev, totalDrills: prev.totalDrills + 1 };
  }
  const continued = prev.lastDrillDate === yesterdayIso();
  return {
    lastDrillDate: today,
    streak: continued ? prev.streak + 1 : 1,
    totalDrills: prev.totalDrills + 1,
  };
}

function pickRandomCards<T>(pool: T[], n: number): T[] {
  const arr = [...pool];
  // Fisher-Yates shuffle, take first n
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

interface DailyDrillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** All available cards — drill picks from cards tagged "tier-1". */
  cards: ConceptCard[];
}

export function DailyDrillDialog({ open, onOpenChange, cards }: DailyDrillDialogProps) {
  const tier1Cards = useMemo(
    () => cards.filter((c) => (c.tags || []).includes("tier-1")),
    [cards]
  );

  const [phase, setPhase] = useState<"intro" | "drilling" | "summary">("intro");
  const [session, setSession] = useState<ConceptCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<DrillScore[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(DRILL_DURATION_SECONDS);
  const [revealed, setRevealed] = useState(false);
  const [streakData, setStreakData] = useState<DrillStreakData>(() => readStreak());
  const timerRef = useRef<number | null>(null);

  // Reset state when the dialog opens.
  useEffect(() => {
    if (open) {
      setPhase("intro");
      setCurrentIdx(0);
      setScores([]);
      setSecondsLeft(DRILL_DURATION_SECONDS);
      setRevealed(false);
      setStreakData(readStreak());
    } else {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [open]);

  // Countdown effect — runs only during the drilling phase.
  useEffect(() => {
    if (phase !== "drilling") return;
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
    }
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase, currentIdx]);

  const startDrill = () => {
    const picked = pickRandomCards(tier1Cards, DRILL_CARDS_PER_SESSION);
    if (picked.length === 0) return;
    setSession(picked);
    setCurrentIdx(0);
    setScores([]);
    setSecondsLeft(DRILL_DURATION_SECONDS);
    setRevealed(false);
    setPhase("drilling");
  };

  const recordScore = (score: DrillScore) => {
    const newScores = [...scores, score];
    setScores(newScores);
    if (newScores.length >= session.length) {
      // Drill complete — bump streak.
      const next = updateStreakOnDrillComplete(readStreak());
      writeStreak(next);
      setStreakData(next);
      setPhase("summary");
    } else {
      setCurrentIdx((i) => i + 1);
      setSecondsLeft(DRILL_DURATION_SECONDS);
      setRevealed(false);
    }
  };

  const currentCard = session[currentIdx];
  const timerPct = (secondsLeft / DRILL_DURATION_SECONDS) * 100;
  const drilledToday = streakData.lastDrillDate === todayIso();

  // No tier-1 cards available — guard before render.
  if (open && tier1Cards.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Daily Drill unavailable</DialogTitle>
            <DialogDescription>
              No Tier 1 cards found. The drill picks from cards tagged
              <Badge variant="outline" className="mx-1 text-[10px]">tier-1</Badge>
              — make sure the concept cards are seeded with playbook tier tags.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {/* ─── Intro phase ───────────────────────────────────────────── */}
        {phase === "intro" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Timer className="h-5 w-5 text-primary" />
                <DialogTitle>Daily Drill</DialogTitle>
              </div>
              <DialogDescription>
                Pick up a pen. {DRILL_CARDS_PER_SESSION} random Tier 1 drawings.{" "}
                {DRILL_DURATION_SECONDS} seconds each. Reproduce from memory on
                paper, then self-score.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border bg-card p-4 my-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame
                    className={cn(
                      "h-5 w-5",
                      streakData.streak > 0 ? "text-orange-500" : "text-muted-foreground/40"
                    )}
                  />
                  <span className="text-sm font-medium">
                    {streakData.streak === 0
                      ? "No streak yet"
                      : `${streakData.streak}-day streak`}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {streakData.totalDrills} drill{streakData.totalDrills === 1 ? "" : "s"} all-time
                </div>
              </div>
              {drilledToday && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                  ✓ You've already drilled today — going again counts as bonus practice.
                </div>
              )}
              <div className="text-xs text-muted-foreground border-t border-border/40 pt-2">
                Bar: drill all {DRILL_CARDS_PER_SESSION} cards daily for 14 days
                to lock the Tier 1 set into muscle memory.
              </div>
            </div>

            <Button onClick={startDrill} className="w-full gap-2" size="lg">
              <Pencil className="h-4 w-4" />
              Start the {DRILL_CARDS_PER_SESSION}-card drill
            </Button>
          </>
        )}

        {/* ─── Drilling phase ─────────────────────────────────────────── */}
        {phase === "drilling" && currentCard && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between gap-2 mb-1">
                <DialogTitle className="text-base">
                  Card {currentIdx + 1} of {session.length}
                </DialogTitle>
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-mono font-semibold",
                    secondsLeft <= 10
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  <Timer className="h-3.5 w-3.5" />
                  {secondsLeft}s
                </div>
              </div>
              <Progress value={timerPct} className="h-1.5" />
              <DialogDescription className="sr-only">
                Reproduce this drawing from memory on paper.
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 space-y-3">
              <div className="rounded-xl border bg-card p-4">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Draw from memory
                </div>
                <h3 className="text-lg font-semibold leading-snug">
                  {currentCard.title}
                </h3>
                {currentCard.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {currentCard.tags.slice(0, 4).map((t) => (
                      <Badge key={t} variant="outline" className="text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Reveal panel — collapsed by default so the FC draws first. */}
              {!revealed ? (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setRevealed(true)}
                >
                  <Eye className="h-4 w-4" />
                  {secondsLeft > 0 ? "Reveal early (uses no time)" : "Reveal answer"}
                </Button>
              ) : (
                <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                  {currentCard.image_url || (currentCard.image_urls && currentCard.image_urls[0]) ? (
                    <img
                      src={currentCard.image_url || currentCard.image_urls![0]}
                      alt={currentCard.title}
                      loading="lazy"
                      className="w-full rounded-lg bg-white"
                    />
                  ) : (
                    <div className="text-xs text-muted-foreground italic">
                      No reference drawing uploaded yet — compare against the description below.
                    </div>
                  )}
                  {currentCard.description && (
                    <div className="text-sm text-foreground/90 whitespace-pre-line">
                      {currentCard.description}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Self-score row */}
            <div className="space-y-2">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Self-score
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => recordScore("got-it")}
                  className="flex-col h-auto py-3 gap-1 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="text-xs">Got it</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => recordScore("close")}
                  className="flex-col h-auto py-3 gap-1 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                >
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <span className="text-xs">Close</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => recordScore("missed")}
                  className="flex-col h-auto py-3 gap-1 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <XCircle className="h-5 w-5 text-rose-600" />
                  <span className="text-xs">Missed</span>
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ─── Summary phase ──────────────────────────────────────────── */}
        {phase === "summary" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-5 w-5 text-amber-500" />
                <DialogTitle>Drill complete</DialogTitle>
              </div>
              <DialogDescription>
                Per-card scores below. Streak updated.
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 space-y-3">
              {/* Streak callout */}
              <div className="rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900/40 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Flame className="h-6 w-6 text-orange-500" />
                  <div>
                    <div className="text-sm font-semibold text-orange-900 dark:text-orange-200">
                      {streakData.streak}-day streak
                    </div>
                    <div className="text-xs text-orange-700 dark:text-orange-400">
                      {streakData.totalDrills} total drill
                      {streakData.totalDrills === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
                {streakData.streak >= 14 && (
                  <Badge className="bg-orange-500 text-white">
                    🔥 14+ days
                  </Badge>
                )}
              </div>

              {/* Per-card scores */}
              <div className="rounded-xl border bg-card p-4 space-y-2">
                {session.map((card, i) => {
                  const score = scores[i];
                  const scoreIcon =
                    score === "got-it" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : score === "close" ? (
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    );
                  return (
                    <div key={card.id} className="flex items-center gap-2 text-sm">
                      {scoreIcon}
                      <span className="text-muted-foreground tabular-nums">
                        {i + 1}.
                      </span>
                      <span className="truncate">{card.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={startDrill}
              >
                <RotateCcw className="h-4 w-4" />
                Drill again
              </Button>
              <Button className="flex-1" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

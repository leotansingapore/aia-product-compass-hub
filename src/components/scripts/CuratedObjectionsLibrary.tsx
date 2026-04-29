import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  BookMarked,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  MessageSquare,
  Eye,
  EyeOff,
  Shuffle,
  Sparkles,
  Video,
  CheckCircle2,
  Circle,
  RotateCcw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CURATED_OBJECTIONS, FRAMEWORK_NAMES, type CuratedObjection } from "@/data/curatedObjections";
import { useToast } from "@/hooks/use-toast";

const MASTERY_KEY = "objections_mastered_v1";

const FAMILY_LABELS: Record<CuratedObjection["family"], string> = {
  "push-away": "Push-away / reflex",
  "have-policies": "Already have policies",
  "have-advisor": "Already have an advisor",
  "format": "Format / channel",
  "cost-of-delay": "Cost of delay / time",
  "product": "Product-specific (post-pitch)",
  "format-recruitment": "Recruitment-specific",
};

const FRAMEWORK_BADGE_STYLES: Record<CuratedObjection["framework"], string> = {
  A: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300/50",
  B: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-300/50",
  C: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300/50",
  "skip-q": "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border-slate-300/50",
};

function loadMastered(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(MASTERY_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed);
  } catch {
    // ignore
  }
  return new Set();
}

function saveMastered(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MASTERY_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

interface ObjectionCardProps {
  obj: CuratedObjection;
  isMastered: boolean;
  onToggleMastered: () => void;
  forceOpen?: boolean;
}

function ObjectionCard({ obj, isMastered, onToggleMastered, forceOpen }: ObjectionCardProps) {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [drillMode, setDrillMode] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Force-open when summoned by Random Drill (and scroll into view)
  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      setDrillMode(true);
      setRevealed(false);
      if (cardRef.current) {
        cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [forceOpen]);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePracticeInRoleplay = () => {
    // Copy the prospect line (the title is the prospect's actual words) so the
    // FC can paste it into the Tavus chat as the opener line if needed.
    navigator.clipboard.writeText(`"${obj.title}"`);
    toast({
      title: "Prospect line copied",
      description: `Use any roleplay scenario, drop "${obj.title}" as their opener and respond using ${FRAMEWORK_NAMES[obj.framework].split(" — ")[0]}.`,
    });
    navigate("/roleplay");
  };

  const showScripts = !drillMode || revealed;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card
        ref={cardRef}
        className={`transition-all hover:border-primary/40 ${isMastered ? "border-emerald-500/50 bg-emerald-500/[0.02]" : ""}`}
      >
        <div className="flex items-stretch">
          {/* Mastery toggle column - separate clickable area outside the trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMastered();
            }}
            className={`shrink-0 flex items-center justify-center px-3 sm:px-4 hover:bg-muted/40 transition-colors border-r border-border/40 ${
              isMastered ? "text-emerald-500" : "text-muted-foreground/60 hover:text-emerald-500"
            }`}
            aria-label={isMastered ? "Mark as not mastered" : "Mark as mastered"}
            title={isMastered ? "Mastered — click to unmark" : "Click when you've nailed this one"}
          >
            {isMastered ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-3 sm:py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-serif text-base sm:text-lg font-semibold text-foreground leading-tight">
                        "{obj.title}"
                      </h4>
                      <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${FRAMEWORK_BADGE_STYLES[obj.framework]}`}>
                        {obj.framework === "skip-q" ? "Skip-Q" : `Framework ${obj.framework}`}
                      </Badge>
                      {isMastered && (
                        <Badge className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/20">
                          Mastered
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      <span className="font-medium text-foreground/70">{FAMILY_LABELS[obj.family]} ·</span> {obj.trigger}
                    </p>
                  </div>
                  {open ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1.5" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1.5" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Drill mode controls */}
            <div className="flex flex-wrap items-center gap-2 -mt-2">
              <Button
                variant={drillMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setDrillMode((d) => !d);
                  setRevealed(false);
                }}
                className="h-8 gap-1.5 text-xs"
              >
                {drillMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {drillMode ? "Drill mode ON" : "Drill mode"}
              </Button>
              {drillMode && !revealed && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRevealed(true)}
                  className="h-8 gap-1.5 text-xs animate-in fade-in"
                >
                  Reveal answer
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handlePracticeInRoleplay}
                className="h-8 gap-1.5 text-xs ml-auto"
              >
                <Video className="h-3.5 w-3.5" />
                Practice in roleplay
              </Button>
            </div>

            {drillMode && !revealed && (
              <div className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/[0.02] p-4 sm:p-5 space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Your turn — say it out loud
                </div>
                <p className="text-sm text-foreground/80">
                  Prospect just said: <span className="font-semibold italic">"{obj.title}"</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Hint: this one wants{" "}
                  <span className="font-medium text-foreground/80">
                    {FRAMEWORK_NAMES[obj.framework]}
                  </span>
                  . Take 30 seconds. Then hit Reveal.
                </p>
              </div>
            )}

            {showScripts && (
              <>
                <div className="rounded-lg bg-muted/40 border border-border/40 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1">
                    Approach — {FRAMEWORK_NAMES[obj.framework]}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/85">{obj.approach}</p>
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3" />
                    Scripts
                  </div>
                  {obj.scripts.map((s, i) => {
                    const id = `${obj.id}-${i}`;
                    return (
                      <div key={id} className="rounded-lg border border-border/60 bg-card p-3 sm:p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs font-semibold text-primary uppercase tracking-wider">{s.label}</div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(s.content, id)}
                            className="h-7 gap-1 text-xs shrink-0"
                          >
                            {copiedId === id ? (
                              <>
                                <Check className="h-3 w-3" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" /> Copy
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-sm leading-relaxed text-foreground/90 italic whitespace-pre-line">
                          {s.content}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {obj.watchOut && (
                  <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 flex gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300 mb-1">
                        Watch out
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/85">{obj.watchOut}</p>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-border/40 flex flex-wrap gap-2 justify-between items-center">
                  <Button asChild variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
                    <Link to={obj.source.path}>
                      <BookMarked className="h-3.5 w-3.5" />
                      Source: {obj.source.day}
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </Link>
                  </Button>
                  <Button
                    variant={isMastered ? "default" : "outline"}
                    size="sm"
                    onClick={onToggleMastered}
                    className="h-8 gap-1.5 text-xs"
                  >
                    {isMastered ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Mastered
                      </>
                    ) : (
                      <>
                        <Circle className="h-3.5 w-3.5" /> Mark mastered
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function CuratedObjectionsLibrary() {
  const [open, setOpen] = useState(true);
  const [activeFamily, setActiveFamily] = useState<string>("all");
  const [mastered, setMastered] = useState<Set<string>>(() => loadMastered());
  const [randomTargetId, setRandomTargetId] = useState<string | null>(null);
  const [randomNonce, setRandomNonce] = useState(0);
  const { toast } = useToast();

  // Persist mastery whenever it changes
  useEffect(() => {
    saveMastered(mastered);
  }, [mastered]);

  const toggleMastered = useCallback((id: string) => {
    setMastered((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const familyCounts = useMemo(() => {
    const counts: Record<string, number> = { all: CURATED_OBJECTIONS.length };
    CURATED_OBJECTIONS.forEach((o) => {
      counts[o.family] = (counts[o.family] || 0) + 1;
    });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    if (activeFamily === "all") return CURATED_OBJECTIONS;
    return CURATED_OBJECTIONS.filter((o) => o.family === activeFamily);
  }, [activeFamily]);

  const masteredCount = mastered.size;
  const total = CURATED_OBJECTIONS.length;
  const masteredPct = Math.round((masteredCount / total) * 100);

  const handleRandomDrill = useCallback(() => {
    const unmastered = CURATED_OBJECTIONS.filter((o) => !mastered.has(o.id));
    const pool = unmastered.length > 0 ? unmastered : CURATED_OBJECTIONS;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!pick) return;
    // Reset family filter so the card is visible
    setActiveFamily("all");
    setOpen(true);
    setRandomTargetId(pick.id);
    setRandomNonce((n) => n + 1);
    toast({
      title: unmastered.length > 0 ? "Drill incoming" : "All mastered — sharpening anyway",
      description: `Prospect: "${pick.title}". Drill mode is on. Say your response out loud, then Reveal.`,
    });
  }, [mastered, toast]);

  const handleResetMastery = useCallback(() => {
    if (typeof window !== "undefined" && !window.confirm("Reset all mastery progress? This cannot be undone.")) {
      return;
    }
    setMastered(new Set());
  }, []);

  return (
    <Card className="mb-6 border border-border/60">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-4">
            <CardTitle className="flex items-center gap-3 text-base sm:text-lg font-serif">
              <BookMarked className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <span>Curriculum-anchored objection library</span>
                <p className="text-xs sm:text-sm text-muted-foreground font-sans font-normal mt-0.5">
                  {total} objection scripts — every one tagged to one of the 3 ARQ frameworks. Drill, master, and practise live in roleplay.
                </p>
              </div>
              {open ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0">
            {/* Mastery progress bar + random drill */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-primary/5 via-card to-card p-3 sm:p-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="relative h-9 w-9 shrink-0">
                  <Sparkles className="h-9 w-9 text-primary/30" />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums text-primary">
                    {masteredPct}%
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-tight">
                    {masteredCount} / {total} mastered
                  </div>
                  <div className="text-[11px] text-muted-foreground leading-tight">
                    {masteredCount === total
                      ? "All 27 nailed. Cycle through Random Drill weekly to stay sharp."
                      : "Tap the circle on each card when you've nailed it under live pressure."}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={handleRandomDrill}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                  Random drill
                </Button>
                {masteredCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleResetMastery}
                    className="h-8 gap-1.5 text-xs text-muted-foreground"
                    title="Reset mastery progress"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pb-1">
              <Button
                variant={activeFamily === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFamily("all")}
                className="h-8 text-xs"
              >
                All ({familyCounts.all})
              </Button>
              {Object.entries(FAMILY_LABELS).map(([key, label]) => {
                const count = familyCounts[key] || 0;
                if (count === 0) return null;
                return (
                  <Button
                    key={key}
                    variant={activeFamily === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFamily(key)}
                    className="h-8 text-xs"
                  >
                    {label} ({count})
                  </Button>
                );
              })}
            </div>

            <div className="space-y-2.5">
              {filtered.map((obj) => (
                <ObjectionCard
                  key={obj.id}
                  obj={obj}
                  isMastered={mastered.has(obj.id)}
                  onToggleMastered={() => toggleMastered(obj.id)}
                  forceOpen={obj.id === randomTargetId ? randomNonce > 0 : false}
                />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

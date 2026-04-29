import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, BookMarked, ExternalLink, Copy, Check, AlertTriangle, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { CURATED_OBJECTIONS, FRAMEWORK_NAMES, type CuratedObjection } from "@/data/curatedObjections";

const FAMILY_LABELS: Record<CuratedObjection["family"], string> = {
  "push-away": "Push-away / reflex",
  "have-policies": "Already have policies",
  "have-advisor": "Already have an advisor",
  "format": "Format / channel",
  "cost-of-delay": "Cost of delay / time",
  "format-recruitment": "Recruitment-specific",
};

const FRAMEWORK_BADGE_STYLES: Record<CuratedObjection["framework"], string> = {
  A: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300/50",
  B: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-300/50",
  C: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300/50",
  "skip-q": "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border-slate-300/50",
};

function ObjectionCard({ obj }: { obj: CuratedObjection }) {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="transition-all hover:border-primary/40">
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
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
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

            <div className="pt-2 border-t border-border/40">
              <Button asChild variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
                <Link to={obj.source.path}>
                  <BookMarked className="h-3.5 w-3.5" />
                  Source: {obj.source.day}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function CuratedObjectionsLibrary() {
  const [open, setOpen] = useState(true);
  const [activeFamily, setActiveFamily] = useState<string>("all");

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
                  {CURATED_OBJECTIONS.length} objection scripts mirrored from Day 44 + Day 40 (next-60-days), each tagged with the right ARQ framework.
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
                <ObjectionCard key={obj.id} obj={obj} />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

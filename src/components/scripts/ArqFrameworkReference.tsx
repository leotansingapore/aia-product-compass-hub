import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, BookOpen, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { FRAMEWORK_PRIMER } from "@/data/curatedObjections";

interface FrameworkBlockProps {
  letter: string;
  name: string;
  tagline: string;
  steps: string[];
  useFor: string;
  example?: string;
  watchOut?: string;
  accent: string;
}

function FrameworkBlock({ letter, name, tagline, steps, useFor, example, watchOut, accent }: FrameworkBlockProps) {
  return (
    <div className={`rounded-xl border-l-4 ${accent} bg-card/60 p-4 sm:p-5 shadow-sm`}>
      <div className="flex items-start gap-3">
        <div className="font-serif text-2xl sm:text-3xl font-bold leading-none tabular-nums text-foreground/80">
          {letter}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <h4 className="font-serif text-base sm:text-lg font-semibold leading-tight text-foreground">{name}</h4>
            <p className="text-xs sm:text-sm text-muted-foreground italic mt-0.5">{tagline}</p>
          </div>
          <ol className="space-y-1.5 text-sm">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-semibold text-primary tabular-nums shrink-0">{i + 1}.</span>
                <span className="text-foreground/85 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
              Use for: {useFor}
            </Badge>
          </div>
          {example && (
            <div className="rounded-lg border border-border/60 bg-muted/40 p-3 mt-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1">
                Example
              </div>
              <p className="text-sm leading-relaxed text-foreground/85 italic">{example}</p>
            </div>
          )}
          {watchOut && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 mt-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300 mb-1">
                Watch out
              </div>
              <p className="text-sm leading-relaxed text-foreground/85">{watchOut}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ArqFrameworkReference() {
  const [open, setOpen] = useState(true);
  const [primerOpen, setPrimerOpen] = useState(false);

  return (
    <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-4">
            <CardTitle className="flex items-center gap-3 text-base sm:text-lg font-serif">
              <Sparkles className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <span>The 3 frameworks that handle every objection</span>
                <p className="text-xs sm:text-sm text-muted-foreground font-sans font-normal mt-0.5">
                  Pick the framework first; the script second. Most objections fall into Framework A.
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
          <CardContent className="space-y-4 pt-0">
            <FrameworkBlock
              letter="A"
              name="Acknowledge → Question (ARQ) → Reframe"
              tagline="The workhorse - 70% of objections close on this alone."
              steps={[
                "Acknowledge. Don't argue. 'Fair,' 'Totally get it,' 'Most people say the same.'",
                "Question (ARQ - Asking the Right Question). Surface what the prospect actually means. Skip this step only when the reflex is unmistakably stock.",
                "Reframe. Show why the objection is exactly why the meeting matters - then close on the time ask.",
              ]}
              useFor='"Not interested," "Let me think," "Maybe later," "Send me info" - vague or rehearsed reflexes'
              example='Prospect: "Not interested." You: "Totally fair. Just so I respect your time - is that not interested in insurance specifically, not interested in talking to advisors at all, or not the right timing? Any of those is fine, I just want to know which."'
              accent="border-l-blue-500"
            />
            <FrameworkBlock
              letter="B"
              name="Feel, Felt, Found"
              tagline="The empathy frame - for objections with emotional or relationship weight."
              steps={[
                `Feel: "I understand how you feel."`,
                `Felt: "Many of my clients felt the same when I first reached out."`,
                `Found: "What they found was - having a same-life-stage second pair of eyes didn't replace what they already had, it added to it."`,
              ]}
              useFor={`"I already have an advisor (and we're family)," "I had a bad experience with an FA before," "I don't believe in insurance after watching my parents"`}
              watchOut="Tips into manipulative when overused on small reflex objections. Reserve for genuinely emotional ones."
              accent="border-l-rose-500"
            />
            <FrameworkBlock
              letter="C"
              name={`Boomerang ("that's exactly why")`}
              tagline="Turn the disqualifier into the qualifier."
              steps={[
                "Acknowledge the state they named (busy, no money, no time, already covered).",
                "Reframe so the state is the reason to meet, not the reason to skip.",
                `Close on the time ask, with the boomerang baked in: "That's exactly why - 30 minutes now saves 3 hours later."`,
              ]}
              useFor={`"I'm too busy," "I don't have money to plan," "I already have policies"`}
              watchOut={`Boomerang done badly sounds glib. The acknowledge step ("Totally get it - and") still has to land first. Skip it and the prospect feels manipulated.`}
              accent="border-l-amber-500"
            />

            <Collapsible open={primerOpen} onOpenChange={setPrimerOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between -mx-2 mt-2">
                  <span className="font-medium text-sm">The ARQ principle &amp; 3-point checklist</span>
                  {primerOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="rounded-xl border border-border/60 bg-muted/30 p-4 mt-2 space-y-3">
                  <p className="text-sm leading-relaxed text-foreground/90">
                    <span className="font-semibold">{FRAMEWORK_PRIMER.arqPrinciple}</span>
                  </p>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-2">
                      The 3-point ARQ checklist (run on every question)
                    </div>
                    <ol className="space-y-1.5 text-sm">
                      {FRAMEWORK_PRIMER.arqChecklist.map((item, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="font-semibold text-primary tabular-nums shrink-0">{i + 1}.</span>
                          <span className="text-foreground/85 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <p className="text-xs text-muted-foreground italic pt-1 border-t border-border/40">
                    If a question fails any gate, rewrite before asking. The full ARQ deep-dive lives on Day 47 (foundation) and Next 60 Days Days 43-44 (advanced).
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/40">
              <Button asChild variant="outline" size="sm" className="gap-1.5 h-8">
                <Link to="/learning-track/first-60-days/day/44">
                  <BookOpen className="h-3.5 w-3.5" />
                  Day 44 — Full framework
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-1.5 h-8">
                <Link to="/learning-track/first-60-days/day/47">
                  <BookOpen className="h-3.5 w-3.5" />
                  Day 47 — ARQ deep-dive
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-1.5 h-8">
                <Link to="/learning-track/next-60-days/day/40">
                  <BookOpen className="h-3.5 w-3.5" />
                  Day 40 (next-60) — Objection Turnaround
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, FileText, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getAllSheets,
  SECTION_META,
  SECTION_ORDER,
  type CheatSheetEntry,
  type CheatSheetSection,
} from "@/features/cheat-sheets/content";

function stripCheatSheetSuffix(title: string): string {
  return title
    .replace(/\s*-\s*One-Page Cheat Sheet$/i, "")
    .replace(/\s*-\s*Cheat Sheet$/i, "")
    .replace(/^Cheat Sheets - /i, "")
    .trim();
}

export default function CheatSheets() {
  const [allSheets, setAllSheets] = useState<CheatSheetEntry[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAllSheets().then((s) => {
      if (!cancelled) setAllSheets(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    const groups: Record<CheatSheetSection, CheatSheetEntry[]> = {
      "first-60-days": [],
      "next-60-days": [],
      "product-mastery": [],
      "core-training": [],
    };
    if (!allSheets) return groups;
    const q = query.trim().toLowerCase();
    const filter = q
      ? (s: CheatSheetEntry) =>
          stripCheatSheetSuffix(s.title).toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      : () => true;
    for (const s of allSheets) {
      if (!filter(s)) continue;
      groups[s.section].push(s);
    }
    return groups;
  }, [allSheets, query]);

  const totalCount = allSheets?.length ?? 0;
  const visibleCount = SECTION_ORDER.reduce((n, k) => n + grouped[k].length, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>Reference cards</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Cheat Sheets</h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          {totalCount} one-page reference cards distilled from the full curriculum. Open the cheat
          sheet for what you are about to do, not what you finished learning - frameworks,
          scripts, and numbers worth screenshotting before a call, fact-find, or pitch.
        </p>
      </div>

      <div className="mb-8 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by topic, framework, or product..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {query && (
          <p className="mt-2 text-xs text-muted-foreground">
            {visibleCount} of {totalCount} cards match.
          </p>
        )}
      </div>

      {!allSheets && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading cheat sheets...
        </div>
      )}

      {allSheets && (
        <div className="space-y-10">
          {SECTION_ORDER.map((section) => {
            const sheets = grouped[section];
            if (sheets.length === 0) return null;
            const meta = SECTION_META[section];
            return (
              <section key={section}>
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b pb-2">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">{meta.title}</h2>
                    <p className="text-sm text-muted-foreground">{meta.tagline}</p>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {sheets.length} {sheets.length === 1 ? "card" : "cards"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sheets.map((sheet) => (
                    <Link
                      key={`${sheet.section}/${sheet.slug}`}
                      to={`/cheat-sheets/${sheet.section}/${sheet.slug}`}
                      className="group"
                    >
                      <Card
                        className={cn(
                          "h-full transition-all hover:border-primary/50 hover:shadow-md",
                          "border-border/60",
                        )}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="line-clamp-2 text-base leading-tight">
                              {stripCheatSheetSuffix(sheet.title)}
                            </CardTitle>
                            <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                          </div>
                          {sheet.weeklyKpi && (
                            <CardDescription className="mt-1 text-xs font-medium text-primary/80">
                              KPI: {sheet.weeklyKpi}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="pt-0">
                          {sheet.description && (
                            <p className="line-clamp-3 text-xs text-muted-foreground">
                              {sheet.description}
                            </p>
                          )}
                          {sheet.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {sheet.tags
                                .filter((t) => !["cheatsheet", section].includes(t))
                                .slice(0, 3)
                                .map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="px-1.5 py-0 text-[10px] font-normal"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}

          {visibleCount === 0 && (
            <div className="rounded-lg border border-dashed bg-card p-12 text-center">
              <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No cheat sheets match "{query}".
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-12 rounded-lg border bg-muted/30 p-6">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <ArrowRight className="h-4 w-4" /> How to use
        </h3>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">About to cold-call?</strong> Open the Appointment
            Setting card plus Next 60 - Week 4.
          </li>
          <li>
            <strong className="text-foreground">Walking into a pitch?</strong> Next 60 - Week 8
            (6-phase pitch structure) plus the product card from Product Mastery.
          </li>
          <li>
            <strong className="text-foreground">Stuck on an objection?</strong> First 60 - Week 8
            (reflex/real diagnostic) plus Next 60 - Week 9 (10 stock objections + verbatim
            responses).
          </li>
        </ul>
      </div>
    </div>
  );
}

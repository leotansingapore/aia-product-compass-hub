import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { ArrowLeft, Printer, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { markdownComponents } from "@/lib/markdown-config";
import {
  getSheet,
  SECTION_META,
  SECTION_ORDER,
  type CheatSheetEntry,
  type CheatSheetSection,
} from "@/features/cheat-sheets/content";

function stripCheatSheetSuffix(title: string): string {
  return title
    .replace(/\s*-\s*One-Page Cheat Sheet$/i, "")
    .replace(/\s*-\s*Cheat Sheet$/i, "")
    .trim();
}

export default function CheatSheetDetail() {
  const { section, slug } = useParams<{ section: string; slug: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<CheatSheetEntry | null>(null);
  const [body, setBody] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!section || !slug || !SECTION_ORDER.includes(section as CheatSheetSection)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    getSheet(section as CheatSheetSection, slug).then((res) => {
      if (cancelled) return;
      if (!res) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setEntry(res.entry);
      setBody(res.body);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [section, slug]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  if (notFound || !entry) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">Cheat sheet not found.</p>
            <Button variant="outline" onClick={() => navigate("/cheat-sheets")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to cheat sheets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const meta = SECTION_META[entry.section];
  const cleanTitle = stripCheatSheetSuffix(entry.title);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 print:max-w-none print:py-0 sm:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to="/cheat-sheets"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All cheat sheets
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="gap-1.5"
        >
          <Printer className="h-3.5 w-3.5" /> Print
        </Button>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground print:hidden">
          <Sparkles className="h-3.5 w-3.5" />
          <Link to="/cheat-sheets" className="hover:text-foreground">
            Cheat Sheets
          </Link>
          <span>/</span>
          <span>{meta.title}</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{cleanTitle}</h1>
        {entry.weeklyKpi && (
          <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
            <span className="font-medium text-primary">KPI:</span>{" "}
            <span className="text-foreground">{entry.weeklyKpi}</span>
          </div>
        )}
        {entry.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 print:hidden">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <article className="prose prose-sm max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-table:text-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug]}
          components={markdownComponents}
        >
          {body}
        </ReactMarkdown>
      </article>

      <div className="mt-10 border-t pt-6 print:hidden">
        <Link
          to="/cheat-sheets"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all cheat sheets
        </Link>
      </div>
    </div>
  );
}

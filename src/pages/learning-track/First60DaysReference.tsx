import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { dayMarkdownComponents } from "@/components/first-60-days/dayMarkdownComponents";
import { loadReference, type ReferenceDoc } from "@/features/first-60-days/references";

export default function First60DaysReference() {
  const { slug } = useParams<{ slug: string }>();
  const [doc, setDoc] = useState<ReferenceDoc | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setDoc(undefined);
    loadReference(slug)
      .then((d) => {
        if (cancelled) return;
        if (!d) setNotFound(true);
        else setDoc(d);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setNotFound(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted/50" />
      </div>
    );
  }

  if (notFound || !doc) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <p className="text-sm text-muted-foreground">Reference not found.</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/learning-track/first-60-days">Back to 60-day hub</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-3 sm:space-y-6 sm:p-6" data-testid="first-60-days-reference">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
      >
        <Link
          to="/learning-track/first-60-days"
          className="transition-colors hover:text-primary"
        >
          60-day hub
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span>Reference</span>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-foreground">{doc.slug}</span>
      </nav>

      <div className="rounded-2xl border border-border/60 bg-gradient-card p-4 sm:p-7 shadow-card">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary mb-2">
          <BookOpen className="h-3 w-3" /> Reference doc
        </div>
        <h1 className="font-serif text-xl sm:text-3xl font-semibold leading-tight tracking-tight">
          {doc.title}
        </h1>
        {doc.frontmatter.captured && (
          <p className="text-xs text-muted-foreground mt-2">
            Captured {doc.frontmatter.captured}
          </p>
        )}
      </div>

      <Card className="border-border/60 shadow-card">
        <CardContent className="prose prose-sm max-w-none px-4 py-5 dark:prose-invert sm:prose-base sm:px-8 sm:py-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={dayMarkdownComponents}
          >
            {doc.body}
          </ReactMarkdown>
        </CardContent>
      </Card>

      <div className="pt-2">
        <Button asChild variant="ghost" className="-ml-3 gap-2 text-muted-foreground hover:text-foreground">
          <Link to="/learning-track/first-60-days">
            <ArrowLeft className="h-4 w-4" />
            Back to 60-day hub
          </Link>
        </Button>
      </div>
    </div>
  );
}

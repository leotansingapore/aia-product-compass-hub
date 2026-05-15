import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { ScriptsHubHeaderTabs } from "@/components/scripts/ScriptsTabBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Archive, BookOpen } from "lucide-react";

// Vite raw-import: bundles the markdown text directly into the page chunk.
// The leading underscore filename keeps it out of the day-numbered glob.
import playbookMarkdown from "../../docs/product-mastery-track/_drawings-playbook.md?raw";

// Strip frontmatter so the rendered page doesn't show YAML at the top.
function stripFrontmatter(raw: string): string {
  if (raw.startsWith("---")) {
    const end = raw.indexOf("\n---", 3);
    if (end !== -1) return raw.slice(end + 4).trimStart();
  }
  return raw;
}

export default function DrawingsPlaybookPage() {
  const [markdown, setMarkdown] = useState<string>("");

  useEffect(() => {
    setMarkdown(stripFrontmatter(playbookMarkdown));
  }, []);

  return (
    <PageLayout
      title="Drawings Playbook — FINternship"
      description="The 30+ diagrams that close cases. Methodology, scripts, and drilling protocol for every drawing in the APA appointment flow."
    >
      <BrandedPageHeader
        tone="dark"
        showOnMobile
        title="Drawings Playbook"
        subtitle="Every diagram an FC needs in an appointment — structure, script, when to use it."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Drawings Playbook" }]}
        headerTabs={<ScriptsHubHeaderTabs />}
      />

      <div className="mx-auto px-3 md:px-6 py-3 md:py-8 max-w-4xl overflow-x-hidden">
        {/* Companion-tool quick links */}
        <div className="flex flex-wrap gap-2 mb-5">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/concept-cards">
              <Pencil className="h-4 w-4" />
              Drill in Concept Cards
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/case-vault">
              <Archive className="h-4 w-4" />
              Real-receipt closes
            </Link>
          </Button>
        </div>

        {/* Markdown body */}
        <Card>
          <CardContent className="prose prose-sm max-w-none px-4 py-5 dark:prose-invert sm:prose-base sm:px-8 sm:py-8">
            {markdown ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
              >
                {markdown}
              </ReactMarkdown>
            ) : (
              <div className="space-y-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted/70" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted/70" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer cross-links */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/concept-cards"
            className="group rounded-2xl border bg-card p-4 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-primary mb-1">
              <Pencil className="h-4 w-4" />
              <span className="text-sm font-semibold">Concept Cards</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Drill every drawing as a flash card. Quiz mode + spaced repetition + focus drawing canvas.
            </p>
          </Link>
          <Link
            to="/case-vault"
            className="group rounded-2xl border bg-card p-4 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Archive className="h-4 w-4" />
              <span className="text-sm font-semibold">Case Vault</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              31 real-prospect receipts across all 7 AIA products. Each case lists the drawings used.
            </p>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}

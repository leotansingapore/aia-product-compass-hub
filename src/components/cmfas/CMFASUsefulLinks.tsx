import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { EditableLinks } from "@/components/EditableLinks";
import type { UsefulLink } from "@/hooks/useProducts";
import { useAdmin } from "@/hooks/useAdmin";
import { ChevronDown, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

/** Hub tab already says “Exam resources”; inner heading names the task, not the tab. */
const HUB_SECTION_HEADING_DEFAULT = "Official links & references";

interface CMFASUsefulLinksProps {
  links: UsefulLink[];
  onUpdate: (field: string, value: any) => Promise<void>;
  /** Hub listing uses calmer chrome + collapsible; module pages use `default`. */
  variant?: "default" | "hub";
  /** Overrides CardDescription (e.g. hub vs per-module copy). */
  description?: string;
  /** When `variant="hub"`, set false if the hub uses tabs (no nested collapsible). Default true. */
  hubCollapsible?: boolean;
  /** Visible `h2` in hub layout (avoid duplicating the tab label “Exam resources”). */
  sectionHeading?: string;
  /** DOM id for `sectionHeading` — pair with `TabsContent aria-labelledby` on the hub. */
  sectionHeadingId?: string;
}

const DEFAULT_DESCRIPTION =
  "Study materials, resources, and references for this CMFAS module";

export function CMFASUsefulLinks({
  links,
  onUpdate,
  variant = "default",
  description,
  hubCollapsible = true,
  sectionHeading = HUB_SECTION_HEADING_DEFAULT,
  sectionHeadingId = "cmf-resources-heading",
}: CMFASUsefulLinksProps) {
  const { isAdmin } = useAdmin();
  const isMobile = useIsMobile();
  const [resourcesOpen, setResourcesOpen] = useState(true);

  useEffect(() => {
    setResourcesOpen(!isMobile);
  }, [isMobile]);

  const cardDescription =
    description ?? DEFAULT_DESCRIPTION;

  const hubLinksBody = (
    <div className="rounded-lg border border-border bg-muted/20 p-3 sm:p-4">
      <EditableLinks
        links={links || []}
        onSave={isAdmin ? (newLinks) => onUpdate("useful_links", newLinks) : undefined}
        readOnly={!isAdmin}
      />
    </div>
  );

  if (variant === "hub" && !hubCollapsible) {
    return (
      <Card
        role="region"
        aria-labelledby={sectionHeadingId}
        className="border bg-card shadow-sm"
      >
        <CardHeader className="space-y-3 pb-3 sm:pb-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{cardDescription}</p>
          <h2
            id={sectionHeadingId}
            className="flex scroll-mt-4 items-center gap-2 text-base font-semibold text-foreground sm:text-lg"
          >
            <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            {sectionHeading}
          </h2>
        </CardHeader>
        <CardContent className="pt-0">{hubLinksBody}</CardContent>
      </Card>
    );
  }

  if (variant === "hub") {
    return (
      <Card className="border bg-card shadow-sm">
        <Collapsible open={resourcesOpen} onOpenChange={setResourcesOpen}>
          <CardHeader className="space-y-2 pb-2">
            <CollapsibleTrigger
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md py-1 text-left",
                "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <span
                id={sectionHeadingId}
                className="flex items-center gap-2 text-base font-semibold text-foreground"
              >
                <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                {sectionHeading}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                  resourcesOpen && "rotate-180"
                )}
                aria-hidden
              />
            </CollapsibleTrigger>
            <p className="text-sm text-muted-foreground">{cardDescription}</p>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">{hubLinksBody}</CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card via-card to-muted/20 border-2 hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <span className="text-3xl">🔗</span>
          <div>
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-bold text-xl">
              Useful Links
            </span>
          </div>
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground/80 mt-2">
          {cardDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="bg-muted/30 rounded-xl p-4 border border-muted">
          <EditableLinks
            links={links || []}
            onSave={isAdmin ? (newLinks) => onUpdate("useful_links", newLinks) : undefined}
            readOnly={!isAdmin}
          />
        </div>
      </CardContent>
    </Card>
  );
}

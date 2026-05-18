/**
 * ToolsHub
 *
 * Standalone tools listing rendered as the body of the Library "Tools" tab
 * (/library/tools). Carries no page wrapper or header — the Library layout
 * already provides those.
 *
 * Internal sub-tools that have their own page (e.g. Content Studio) link
 * into /library/tools/<slug> so they stay nested under Tools in the URL.
 */
import { Link } from "react-router-dom";
import {
  Sparkles,
  MessageSquare,
  Users,
  Presentation,
  BookOpen,
  Video,
  GraduationCap,
  ExternalLink,
  ArrowRight,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ToolBadge = "New" | "Required" | "Practice" | "Tier-gated" | "Static" | null;

interface Tool {
  id: string;
  name: string;
  tagline: string;
  href: string;
  external?: boolean;
  icon: LucideIcon;
  badge?: ToolBadge;
}

interface ToolGroup {
  id: string;
  title: string;
  blurb: string;
  tools: Tool[];
}

const TOOL_GROUPS: ToolGroup[] = [
  {
    id: "content-and-leadgen",
    title: "Content and lead-gen",
    blurb: "Find prospects and produce the content that brings them in.",
    tools: [
      {
        id: "content-studio",
        name: "Content Studio",
        tagline: "Drafts platform-specific posts (LinkedIn / Instagram / Facebook) from your pillars.",
        href: "/library/tools/content-studio",
        icon: Sparkles,
        badge: "New",
      },
      {
        id: "fads",
        name: "F.A.D.S. (Audience Differentiation)",
        tagline: "Define the audience you serve, your edge, and your one-line positioning.",
        href: "/learning-track/pre-rnf/assignments/audience-differentiation/tool",
        icon: Users,
        badge: null,
      },
      {
        id: "outreach-builder",
        name: "Outreach Builder",
        tagline: "Drafts your first 100 warm-market messages with audience and life-stage hooks.",
        href: "/learning-track/pre-rnf/assignments/outreach-playbook/tool",
        icon: MessageSquare,
        badge: "Required",
      },
    ],
  },
  {
    id: "practice-and-presenting",
    title: "Practice and presenting",
    blurb: "Rehearse the conversations you'll have on appointments.",
    tools: [
      {
        id: "day-53-practice-deck",
        name: "Day 53 Practice Deck (Insurance CST)",
        tagline: "Self-contained 20-slide Reveal.js deck to deliver to a friend in honest practice mode.",
        href: "/slides/day-53-insurance-cst-practice.html",
        external: true,
        icon: Presentation,
        badge: "Practice",
      },
      {
        id: "scripts-database",
        name: "Scripts Database",
        tagline: "Canonical openers, fact-find scripts, objection responses, and referral asks.",
        href: "/scripts",
        icon: BookOpen,
        badge: null,
      },
      {
        id: "roleplay",
        name: "Roleplay (Tavus AI)",
        tagline: "Talk through scenarios with an AI prospect on video. Get scored feedback after.",
        href: "/roleplay",
        icon: Video,
        badge: "Tier-gated",
      },
    ],
  },
  {
    id: "study",
    title: "Study",
    blurb: "Pass the exam, then keep the knowledge sharp.",
    tools: [
      {
        id: "cmfas-chatbot",
        name: "CMFAS Chatbot",
        tagline: "Module-specific tutor for M9, M9A, HI, and RES5. Ask anything.",
        href: "/cmfas/chat",
        icon: GraduationCap,
        badge: null,
      },
    ],
  },
];

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  const isExternal = !!tool.external;

  const content = (
    <article
      className={cn(
        "group relative flex h-full flex-col gap-3 rounded-xl border bg-card p-5",
        "transition-all hover:border-primary/40 hover:shadow-md",
        "focus-within:border-primary/40 focus-within:shadow-md"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        {tool.badge && (
          <Badge
            variant={tool.badge === "Required" ? "default" : "secondary"}
            className={cn(
              tool.badge === "New" &&
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
              tool.badge === "Practice" &&
                "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
              tool.badge === "Tier-gated" &&
                "bg-muted text-muted-foreground"
            )}
          >
            {tool.badge}
          </Badge>
        )}
      </div>

      <div className="flex-1 space-y-1.5">
        <h3 className="text-base font-semibold leading-tight text-foreground">
          {tool.name}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {tool.tagline}
        </p>
      </div>

      <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-primary">
        <span>Open</span>
        {isExternal ? (
          <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        ) : (
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        )}
      </div>
    </article>
  );

  if (isExternal) {
    return (
      <a
        href={tool.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`Open ${tool.name} in a new tab`}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={tool.href}
      className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Open ${tool.name}`}
    >
      {content}
    </Link>
  );
}

export function ToolsHub() {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3 rounded-xl border bg-card p-4 sm:p-5">
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 sm:flex">
          <Wrench className="h-5 w-5" aria-hidden />
        </div>
        <div className="text-sm leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">
            The apps that make your week easier.
          </p>
          <p className="mt-1">
            Bookmark them. Use them weekly. Tier-gated tools open only when your access tier unlocks them.
          </p>
        </div>
      </div>

      {TOOL_GROUPS.map((group) => (
        <section key={group.id} className="space-y-4">
          <header className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {group.title}
            </h2>
            <p className="text-sm text-muted-foreground">{group.blurb}</p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

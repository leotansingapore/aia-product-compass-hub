import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  FileText,
  GitBranch,
  BookOpen,
  Layers,
  Bot,
  GraduationCap,
  MessageCircle,
  Shield,
  Zap,
  RefreshCw,
  Plus,
  Wrench,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Video,
} from "lucide-react";

interface ChangeEntry {
  date: string;
  version?: string;
  type: "new" | "improved" | "fixed" | "removed";
  icon: React.ElementType;
  title: string;
  description: string;
  detail?: string; // extra detail shown on expand
  tag?: string;
  category: "Platform" | "AI" | "Scripts" | "Admin" | "Videos" | "New Page";
  linkTo?: string; // internal route to navigate to
}

const changeTypeConfig = {
  new: {
    label: "New",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  improved: {
    label: "Improved",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  fixed: {
    label: "Fixed",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  removed: {
    label: "Removed",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

const categoryConfig: Record<ChangeEntry["category"], { label: string; className: string }> = {
  Platform: { label: "Platform", className: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400" },
  AI: { label: "AI", className: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400" },
  Scripts: { label: "Scripts", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  Admin: { label: "Admin", className: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400" },
  Videos: { label: "Videos", className: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400" },
  "New Page": { label: "New Page", className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400" },
};

const ALL_CATEGORIES = ["All", "New Page", "Platform", "AI", "Scripts", "Videos", "Admin"] as const;

const entries: { month: string; changes: ChangeEntry[] }[] = [
  {
    month: "February 2026",
    changes: [
      {
        date: "27 Feb",
        type: "new",
        icon: FileText,
        title: "Script Categories — Fact Finding & Sales Scripts",
        description:
          "Added dedicated \"Fact Finding\" category to the Scripts Database for prospecting and discovery scripts. Sales-oriented scripts now live under their own \"Sales Scripts\" category for cleaner organisation.",
        category: "Scripts",
        linkTo: "/scripts",
      },
      {
        date: "27 Feb",
        type: "improved",
        icon: Shield,
        title: "Admin Category Management",
        description:
          "Admins can now delete script categories directly from the Scripts Database. Scripts inside a deleted category are automatically moved to Uncategorized so no content is lost.",
        category: "Admin",
      },
      {
        date: "25 Feb",
        type: "new",
        icon: GitBranch,
        title: "Script Flows — Visual Flow Builder",
        description:
          "Brand-new drag-and-drop flow builder for mapping out conversation flows, decision trees, and sales processes. Create, share, and annotate flows visually.",
        detail: "Access the flow builder at /flows. You can create templates, share flows with your team, and add sticky-note annotations directly on the canvas.",
        category: "New Page",
        linkTo: "/flows",
      },
      {
        date: "22 Feb",
        type: "new",
        icon: BookOpen,
        title: "Script Playbooks",
        description:
          "Compile your favourite scripts and objection responses into shareable playbooks. Each playbook can be shared via a public link with optional editing permissions.",
        detail: "Access at /playbooks. Playbooks support sections (like H1/H2/H3 headings), drag-and-drop reordering, and public share links with optional edit access.",
        category: "New Page",
        linkTo: "/playbooks",
      },
      {
        date: "18 Feb",
        type: "new",
        icon: FileText,
        title: "Servicing Templates Page",
        description:
          "Dedicated page for post-sale servicing scripts — renewals, policy reviews, claims guidance, and client retention scripts.",
        category: "New Page",
        linkTo: "/servicing",
      },
      {
        date: "15 Feb",
        type: "new",
        icon: FileText,
        title: "Scripts Database",
        description:
          "Central hub for all sales scripts, categorised by stage, audience, and type. Scripts support versioning, community contributions, favourites, and admin moderation.",
        detail: "Supports script versioning, community contributions, favouriting, and admin moderation. Scripts can be added to playbooks directly from the database.",
        category: "New Page",
        linkTo: "/scripts",
      },
      {
        date: "12 Feb",
        type: "new",
        icon: Layers,
        title: "Objections Tab — Community Responses",
        description:
          "The Objections subtab now aggregates common client objections with community-contributed responses. Advisors can upvote the best responses and submit their own.",
        category: "Scripts",
        linkTo: "/objections",
      },
    ],
  },
  {
    month: "January 2026",
    changes: [
      {
        date: "28 Jan",
        type: "improved",
        icon: Bot,
        title: "AI Chat — Thread Persistence",
        description:
          "AI chat conversations now persist across sessions. Your conversation history is saved per product so you can continue where you left off.",
        category: "AI",
      },
      {
        date: "25 Jan",
        type: "new",
        icon: Video,
        title: "Training Videos — Pro Achiever & Platinum Wealth Venture",
        description:
          "New training video series added for Pro Achiever and Platinum Wealth Venture products, covering product overview, key features, and objection handling.",
        detail: "Videos are accessible from each product detail page under the Training Course tab. Progress is tracked and synced to your learning profile.",
        category: "Videos",
        linkTo: "/category/investment",
      },
      {
        date: "22 Jan",
        type: "new",
        icon: BookOpen,
        title: "Knowledge Base (KB)",
        description:
          "Structured knowledge base portal for all products, organised by category. Each product page includes key highlights, useful links, explainer videos, and a direct link to its AI assistant.",
        category: "New Page",
        linkTo: "/kb",
      },
      {
        date: "20 Jan",
        type: "new",
        icon: Video,
        title: "Training Videos — Healthshield Gold Max & Solitaire PA",
        description:
          "Medical insurance product training videos added — covering plan tiers, claims process, and common client questions for Healthshield Gold Max and Solitaire PA.",
        detail: "Includes step-by-step claims walkthrough and comparison breakdowns between plan tiers.",
        category: "Videos",
        linkTo: "/category/medical",
      },
      {
        date: "18 Jan",
        type: "new",
        icon: MessageCircle,
        title: "AI Roleplay Training",
        description:
          "Practice sales conversations with a live AI avatar powered by Tavus. Choose from 4 difficulty scenarios ranging from Beginner to Advanced. Receive automated feedback with scores across communication, objection handling, and product knowledge.",
        category: "New Page",
        linkTo: "/roleplay",
      },
      {
        date: "10 Jan",
        type: "new",
        icon: GraduationCap,
        title: "CMFAS Exam Modules",
        description:
          "Study portal for CMFAS licensing exams covering M9, M9A, HI, and RES5. Each module includes learning videos with progress tracking and a dedicated AI tutor chatbot.",
        category: "New Page",
        linkTo: "/cmfas-exams",
      },
      {
        date: "5 Jan",
        type: "improved",
        icon: Zap,
        title: "Gamification — XP & Achievements",
        description:
          "Earn XP by completing quizzes, watching videos, and engaging with products. Unlock achievement badges and track your learning streak. Daily XP limits prevent farming.",
        category: "Platform",
      },
    ],
  },
  {
    month: "December 2025",
    changes: [
      {
        date: "20 Dec",
        type: "new",
        icon: Bot,
        title: "Product AI Assistants",
        description:
          "Each product now has its own AI assistant pre-trained on product-specific knowledge. Ask questions, get benefit illustrations explained, and compare scenarios — all within the product page.",
        category: "AI",
      },
      {
        date: "18 Dec",
        type: "new",
        icon: Video,
        title: "Training Videos — Guaranteed Protect Plus & Secure Flexi Term",
        description:
          "Whole life and term product training videos added for Guaranteed Protect Plus and Secure Flexi Term, including pitch walkthroughs and comparison guides.",
        category: "Videos",
        linkTo: "/category/whole-life",
      },
      {
        date: "15 Dec",
        type: "new",
        icon: Layers,
        title: "Product Categories & Detail Pages",
        description:
          "Products are organised into categories: Investment, Endowment, Whole Life, Term, and Medical. Each product has a dedicated page with training videos, useful links, highlights, and an AI chatbot.",
        category: "Platform",
      },
      {
        date: "8 Dec",
        type: "new",
        icon: Sparkles,
        title: "FINternship Platform Launch",
        description:
          "Initial launch of the FINternship Learning Platform — a centralised training and knowledge hub for financial advisors. Includes the dashboard, product library, bookmarks, and basic search.",
        category: "Platform",
      },
    ],
  },
];

const typeIconMap: Record<ChangeEntry["type"], React.ElementType> = {
  new: Plus,
  improved: RefreshCw,
  fixed: Wrench,
  removed: Wrench,
};

function ChangeCard({ change }: { change: ChangeEntry }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const TypeIcon = typeIconMap[change.type];
  const typeCfg = changeTypeConfig[change.type];
  const catCfg = categoryConfig[change.category];
  const hasDetail = !!change.detail;
  const hasLink = !!change.linkTo;

  return (
    <div className="group relative flex gap-4 rounded-xl border bg-card p-4 sm:p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-200">
      {/* Icon */}
      <div className="shrink-0 mt-0.5">
        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
          <change.icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="text-xs text-muted-foreground">{change.date}</span>
          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 font-medium ${typeCfg.className}`}>
            {typeCfg.label}
          </Badge>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-medium border-0 ${catCfg.className}`}>
            {catCfg.label}
          </Badge>
        </div>

        <h3 className="font-semibold text-sm text-foreground mb-1">{change.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{change.description}</p>

        {/* Expanded detail */}
        {hasDetail && expanded && (
          <p className="mt-2 text-sm text-foreground/80 leading-relaxed border-l-2 border-primary/40 pl-3">
            {change.detail}
          </p>
        )}

        {/* Action row */}
        {(hasDetail || hasLink) && (
          <div className="flex items-center gap-2 mt-3">
            {hasDetail && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {expanded ? (
                  <><ChevronDown className="h-3.5 w-3.5" /> Hide details</>
                ) : (
                  <><ChevronRight className="h-3.5 w-3.5" /> More details</>
                )}
              </button>
            )}
            {hasLink && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs px-2 gap-1"
                onClick={() => navigate(change.linkTo!)}
              >
                <ExternalLink className="h-3 w-3" />
                Open
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Changelog() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredEntries = entries
    .map((group) => ({
      ...group,
      changes: activeCategory === "All"
        ? group.changes
        : group.changes.filter((c) => c.category === activeCategory),
    }))
    .filter((group) => group.changes.length > 0);

  const totalCount = filteredEntries.reduce((s, g) => s + g.changes.length, 0);

  return (
    <>
      <Helmet>
        <title>Changelog · FINternship</title>
        <meta name="description" content="See what's new in FINternship — new pages, features, and improvements." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Changelog</h1>
              <p className="text-sm text-muted-foreground">What's new in FINternship</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
            All meaningful changes to the platform — new pages, features, videos, and improvements. Click entries to navigate or expand for more detail.
          </p>
        </div>

        {/* Category filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {ALL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const cfg = cat !== "All" ? categoryConfig[cat as ChangeEntry["category"]] : null;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
          {activeCategory !== "All" && (
            <span className="text-xs text-muted-foreground self-center ml-1">
              {totalCount} {totalCount === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>

        {/* Timeline */}
        {filteredEntries.length > 0 ? (
          <div className="space-y-12">
            {filteredEntries.map((group) => (
              <section key={group.month}>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-base font-semibold text-foreground whitespace-nowrap">{group.month}</h2>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground shrink-0">{group.changes.length}</span>
                </div>
                <div className="space-y-4">
                  {group.changes.map((change, i) => (
                    <ChangeCard key={i} change={change} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No entries in this category yet.</p>
            <button onClick={() => setActiveCategory("All")} className="text-xs mt-2 text-primary hover:underline">
              Show all changes
            </button>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-12 pt-6 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Changes are documented as they ship. For questions or feedback, reach out to your platform admin.
          </p>
        </div>
      </div>
    </>
  );
}

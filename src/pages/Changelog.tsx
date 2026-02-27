import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";

interface ChangeEntry {
  date: string;
  version?: string;
  type: "new" | "improved" | "fixed" | "removed";
  icon: React.ElementType;
  title: string;
  description: string;
  tag?: string;
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
        tag: "Scripts",
      },
      {
        date: "27 Feb",
        type: "improved",
        icon: Shield,
        title: "Admin Category Management",
        description:
          "Admins can now delete script categories directly from the Scripts Database. Scripts inside a deleted category are automatically moved to Uncategorized so no content is lost.",
        tag: "Admin",
      },
      {
        date: "25 Feb",
        type: "new",
        icon: GitBranch,
        title: "Script Flows — Visual Flow Builder",
        description:
          "Brand-new drag-and-drop flow builder for mapping out conversation flows, decision trees, and sales processes. Create, share, and annotate flows visually. Access at /flows.",
        tag: "New Page",
      },
      {
        date: "22 Feb",
        type: "new",
        icon: BookOpen,
        title: "Script Playbooks",
        description:
          "Compile your favourite scripts and objection responses into shareable playbooks. Each playbook can be shared via a public link with optional editing permissions. Access at /playbooks.",
        tag: "New Page",
      },
      {
        date: "18 Feb",
        type: "new",
        icon: FileText,
        title: "Servicing Templates Page",
        description:
          "Dedicated page for post-sale servicing scripts — renewals, policy reviews, claims guidance, and client retention scripts. Access at /servicing.",
        tag: "New Page",
      },
      {
        date: "15 Feb",
        type: "new",
        icon: FileText,
        title: "Scripts Database",
        description:
          "Central hub for all sales scripts, categorised by stage, audience, and type. Scripts support versioning, community contributions, favourites, and admin moderation. Access at /scripts.",
        tag: "New Page",
      },
      {
        date: "12 Feb",
        type: "new",
        icon: Layers,
        title: "Objections Tab — Community Responses",
        description:
          "The Objections subtab now aggregates common client objections with community-contributed responses. Advisors can upvote the best responses and submit their own.",
        tag: "Scripts",
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
        tag: "AI",
      },
      {
        date: "22 Jan",
        type: "new",
        icon: BookOpen,
        title: "Knowledge Base (KB)",
        description:
          "Structured knowledge base portal for all products, organised by category. Each product page includes key highlights, useful links, explainer videos, and a direct link to its AI assistant. Access at /kb.",
        tag: "New Page",
      },
      {
        date: "18 Jan",
        type: "new",
        icon: MessageCircle,
        title: "AI Roleplay Training",
        description:
          "Practice sales conversations with a live AI avatar powered by Tavus. Choose from 4 difficulty scenarios ranging from Beginner to Advanced. Receive automated feedback with scores across communication, objection handling, and product knowledge. Access at /roleplay.",
        tag: "New Page",
      },
      {
        date: "10 Jan",
        type: "new",
        icon: GraduationCap,
        title: "CMFAS Exam Modules",
        description:
          "Study portal for CMFAS licensing exams covering M9, M9A, HI, and RES5. Each module includes learning videos with progress tracking and a dedicated AI tutor chatbot. Access at /cmfas-exams.",
        tag: "New Page",
      },
      {
        date: "5 Jan",
        type: "improved",
        icon: Zap,
        title: "Gamification — XP & Achievements",
        description:
          "Earn XP by completing quizzes, watching videos, and engaging with products. Unlock achievement badges and track your learning streak. Daily XP limits prevent farming.",
        tag: "Platform",
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
        tag: "AI",
      },
      {
        date: "15 Dec",
        type: "new",
        icon: Layers,
        title: "Product Categories & Detail Pages",
        description:
          "Products are organised into categories: Investment, Endowment, Whole Life, Term, and Medical. Each product has a dedicated page with training videos, useful links, highlights, and an AI chatbot.",
        tag: "Platform",
      },
      {
        date: "8 Dec",
        type: "new",
        icon: Sparkles,
        title: "FINternship Platform Launch",
        description:
          "Initial launch of the FINternship Learning Platform — a centralised training and knowledge hub for financial advisors. Includes the dashboard, product library, bookmarks, and basic search.",
        tag: "Platform",
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

export default function Changelog() {
  return (
    <>
      <Helmet>
        <title>Changelog · FINternship</title>
        <meta name="description" content="See what's new in FINternship — new pages, features, and improvements." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-10">
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
            All meaningful changes to the platform — new pages, features, content updates, and improvements. Most recent changes appear first.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-12">
          {entries.map((group) => (
            <section key={group.month}>
              {/* Month header */}
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-base font-semibold text-foreground">{group.month}</h2>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-4">
                {group.changes.map((change, i) => {
                  const TypeIcon = typeIconMap[change.type];
                  const typeCfg = changeTypeConfig[change.type];
                  return (
                    <div
                      key={i}
                      className="group relative flex gap-4 rounded-xl border bg-card p-4 sm:p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                    >
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
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-1.5 py-0 font-medium ${typeCfg.className}`}
                          >
                            {typeCfg.label}
                          </Badge>
                          {change.tag && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {change.tag}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm text-foreground mb-1">{change.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{change.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

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

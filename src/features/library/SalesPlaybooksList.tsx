/**
 * SalesPlaybooksList
 *
 * The Sales Playbooks hub content (intro callout + section grid) rendered
 * without a page wrapper, so it can be slotted into the Library page as a
 * tab. The standalone /sales-playbooks route now redirects into the Library
 * page (the hub lives under /library/playbooks).
 */
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Wrench,
  ShieldQuestion,
  BookOpen,
  Workflow,
  Pencil,
  FolderOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CASES } from "@/data/caseVault";

interface PlaybookSection {
  key: string;
  title: string;
  path: string;
  icon: LucideIcon;
  description: string;
  useFor: string;
  badge?: string;
  accent: {
    iconBg: string;
    iconColor: string;
    accent: string;
  };
}

export function SalesPlaybooksList() {
  const caseVaultCount = useMemo(() => CASES.length, []);

  const sections: PlaybookSection[] = useMemo(
    () => [
      {
        key: "scripts",
        title: "Sales Scripts",
        path: "/scripts",
        icon: MessageSquare,
        description:
          "Cold-call openers, WhatsApp warm-ups, referral asks, follow-up sequences, email templates. Curated voice canon — copy, tweak, send.",
        useFor: "When you need the exact words to use",
        accent: {
          iconBg: "bg-blue-100 dark:bg-blue-950/40",
          iconColor: "text-blue-600 dark:text-blue-400",
          accent: "from-blue-500/10 to-transparent",
        },
      },
      {
        key: "servicing",
        title: "Servicing Scripts",
        path: "/servicing",
        icon: Wrench,
        description:
          "Post-sale and in-force touchpoints — claim follow-ups, anniversary check-ins, lapse rescues, policy-review openers, COSA conversion scripts.",
        useFor: "When the policy is already in force",
        accent: {
          iconBg: "bg-amber-100 dark:bg-amber-950/40",
          iconColor: "text-amber-600 dark:text-amber-400",
          accent: "from-amber-500/10 to-transparent",
        },
      },
      {
        key: "objections",
        title: "Objections",
        path: "/objections",
        icon: ShieldQuestion,
        description:
          "Every \"I need to think about it\" pattern, every spouse objection, every \"let me check with my agent\" — with a verified rebuttal for each.",
        useFor: "When the prospect pushes back",
        accent: {
          iconBg: "bg-rose-100 dark:bg-rose-950/40",
          iconColor: "text-rose-600 dark:text-rose-400",
          accent: "from-rose-500/10 to-transparent",
        },
      },
      {
        key: "playbooks",
        title: "Playbooks",
        path: "/playbooks",
        icon: BookOpen,
        description:
          "Multi-step plays bundled end-to-end — Goals-Mapper close, Pre-Retiree CST, BTIR restructure, MUM2BABY rider close. Each playbook is the full sequence.",
        useFor: "When you want a proven, end-to-end sequence",
        accent: {
          iconBg: "bg-violet-100 dark:bg-violet-950/40",
          iconColor: "text-violet-600 dark:text-violet-400",
          accent: "from-violet-500/10 to-transparent",
        },
      },
      {
        key: "flows",
        title: "Flows",
        path: "/flows",
        icon: Workflow,
        description:
          "Visual diagrams of decision trees — if prospect says X, branch to Y. Built for prep before tough conversations, especially objection-heavy meetings.",
        useFor: "When you want to map a conversation visually",
        accent: {
          iconBg: "bg-teal-100 dark:bg-teal-950/40",
          iconColor: "text-teal-600 dark:text-teal-400",
          accent: "from-teal-500/10 to-transparent",
        },
      },
      {
        key: "concept-cards",
        title: "Concept Cards",
        path: "/concept-cards",
        icon: Pencil,
        description:
          "Drawable explanations — Term vs Life, BTIR decoupling, 4-quadrant grid, Welcome+Loyalty stack, retirement-gap. With reference photos to copy in the meeting.",
        useFor: "When you need to draw it on paper",
        accent: {
          iconBg: "bg-emerald-100 dark:bg-emerald-950/40",
          iconColor: "text-emerald-600 dark:text-emerald-400",
          accent: "from-emerald-500/10 to-transparent",
        },
      },
      {
        key: "case-vault",
        title: "Case Vault",
        path: "/case-vault",
        icon: FolderOpen,
        description:
          "Real-prospect receipts across all 7 AIA products — what the prospect had, the play used, the close shape, and the numbers. Drill these before any appointment.",
        useFor: "When you want a real receipt to anchor the math",
        badge: `${caseVaultCount} cases`,
        accent: {
          iconBg: "bg-orange-100 dark:bg-orange-950/40",
          iconColor: "text-orange-600 dark:text-orange-400",
          accent: "from-orange-500/10 to-transparent",
        },
      },
    ],
    [caseVaultCount],
  );

  return (
    <div>
      <div className="mb-6 rounded-2xl border bg-muted/40 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold mb-1">
              Pick the asset that matches your moment
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Heading into a cold call? Open <strong>Sales Scripts</strong>.
              Got pushback last meeting? <strong>Objections</strong>. Need to
              draw the decoupling math on paper? <strong>Concept Cards</strong>.
              Want a real receipt to show the prospect what's possible?{" "}
              <strong>Case Vault</strong>. Every tab below is a full standalone
              page — click in, find what you need, copy it, ship it.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.key}
              to={s.path}
              className="group relative rounded-2xl border bg-card shadow-sm overflow-hidden transition-all hover:shadow-lg hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary flex flex-col"
            >
              <div
                className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b pointer-events-none opacity-60 ${s.accent.accent}`}
                aria-hidden="true"
              />

              <div className="relative p-5 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`rounded-xl p-2.5 ${s.accent.iconBg} ${s.accent.iconColor} shrink-0`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {s.badge && (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono shrink-0"
                    >
                      {s.badge}
                    </Badge>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-base leading-snug mb-1">
                    {s.title}
                  </h3>
                  <div className="text-[11px] font-medium text-muted-foreground/80 uppercase tracking-wide mb-2">
                    {s.useFor}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Open
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

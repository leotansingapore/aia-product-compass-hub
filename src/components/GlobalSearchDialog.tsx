import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  ClipboardList,
  Compass,
  FileQuestion,
  FileText,
  GraduationCap,
  Layers,
  Lightbulb,
  ListTree,
  MessageSquare,
  Package,
  PlayCircle,
  Search,
  Sparkles,
  Vault,
  Workflow,
} from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { scoreEntry } from "@/features/global-search/score";
import { PAGE_ENTRIES, PRODUCT_STUDY_PAGES } from "@/features/global-search/pages";
import { HEADING_INDEX, type HeadingTrack } from "@/features/global-search/headingIndex";
import {
  getDaySummaries as getF60DaySummaries,
  prefetchDay as prefetchF60Day,
  WEEK_META as F60_WEEK_META,
  WEEKS_WITH_RECAP,
} from "@/features/first-60-days/content";
import {
  getDaySummaries as getPmDaySummaries,
  prefetchDay as prefetchPmDay,
  WEEK_META as PM_WEEK_META,
} from "@/features/product-mastery-track/content";
import {
  getDaySummaries as getN60DaySummaries,
  WEEK_META as N60_WEEK_META,
} from "@/features/next-60-days/content";
import {
  getDaySummaries as getF14DaySummaries,
  WEEK_META as F14_WEEK_META,
} from "@/features/first-14-days/content";
import { loadAllAssignments, type Assignment } from "@/features/first-60-days/assignments";
import {
  loadAllAssignments as loadN60Assignments,
  type Assignment as N60Assignment,
} from "@/features/next-60-days/assignments";
import { listReferences, type ReferenceListItem } from "@/features/first-60-days/references";
import { getAllSheets, type CheatSheetEntry } from "@/features/cheat-sheets/content";
import { cmfasModuleVideos, getCMFASModuleName } from "@/data/cmfasModuleData";
import { CASES } from "@/data/caseVault";
import { useScripts } from "@/hooks/useScripts";
import { usePlaybooks } from "@/hooks/usePlaybooks";
import { useScriptFlows } from "@/hooks/useScriptFlows";
import { useConceptCards } from "@/hooks/useConceptCards";
import { useAllProducts } from "@/hooks/useProducts";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useAdmin } from "@/hooks/useAdmin";
import { useFirst60DaysProgress } from "@/hooks/first-60-days/useFirst60DaysProgress";
import { useProductMasteryProgress } from "@/hooks/product-mastery-track/useProductMasteryProgress";
import { useNext60DaysProgress } from "@/hooks/next-60-days/useNext60DaysProgress";
import { useFirst14DaysProgress } from "@/hooks/first-14-days/useFirst14DaysProgress";
import { FEATURES, type FeatureKey } from "@/lib/tiers";

type SearchEntry = {
  /** Unique cmdk value — also the primary string the scorer matches. */
  value: string;
  title: string;
  meta: string;
  href: string;
  keywords: string[];
  onWarm?: () => void;
};

type GroupDef = {
  heading: string;
  icon: typeof Search;
  entries: SearchEntry[];
  /** Result cap when a query is active. */
  cap?: number;
};

const CMFAS_MODULE_IDS = ["onboarding", "m9", "m9a", "hi", "res5"] as const;

const RECENTS_KEY = "global-search-recents";
const MAX_RECENTS = 8;

function readRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string").slice(0, MAX_RECENTS) : [];
  } catch {
    return [];
  }
}

function saveRecent(query: string): void {
  const q = query.trim();
  if (q.length < 2) return;
  try {
    const next = [q, ...readRecents().filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, MAX_RECENTS);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* quota/private mode — recents are a nicety */
  }
}

const TRACK_ROUTES: Record<HeadingTrack, string> = {
  f60: "/learning-track/first-60-days/day/",
  pm: "/learning-track/product-mastery/day/",
  n60: "/learning-track/next-60-days/day/",
  f14: "/learning-track/first-14-days/day/",
};

const TRACK_LABELS: Record<HeadingTrack, string> = {
  f60: "First 60 Days",
  pm: "Product Mastery",
  n60: "Next 60 Days",
  f14: "First 14 Days",
};

const PRODUCT_LABEL_BY_SLUG = Object.fromEntries(
  PRODUCT_STUDY_PAGES.map((p) => [p.slug, p.title]),
);

interface QuestionHit {
  id: string;
  question: string;
  product_slug: string;
  bank_type: string;
}

/** Distinctive prefix of a question, used as the /review-all?q= deep link. */
function questionSnippet(question: string): string {
  const flat = question.replace(/\s+/g, " ").trim();
  if (flat.length <= 60) return flat;
  const cut = flat.slice(0, 60);
  const lastSpace = cut.lastIndexOf(" ");
  return lastSpace > 30 ? cut.slice(0, lastSpace) : cut;
}

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

/**
 * The global palette: one index over everything the signed-in user can open —
 * pages, all four learning tracks (down to individual lesson sections),
 * assignments, references, cheat sheets, products, scripts, playbooks, flows,
 * concept cards, cases, CMFAS modules and the question bank. Tier features and
 * day unlocks are respected via the same hooks the rest of the app uses, so
 * search never shows something the click would then block.
 */
export function GlobalSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 200);

  const { can, isAdminBypass } = useFeatureAccess();
  const { isAdmin } = useAdmin();
  const { isUnlocked: isF60Unlocked } = useFirst60DaysProgress();
  const { isUnlocked: isPmUnlocked } = useProductMasteryProgress();
  const { isUnlocked: isN60Unlocked } = useNext60DaysProgress();
  const { isUnlocked: isF14Unlocked } = useFirst14DaysProgress();

  const allow = useCallback(
    (features?: readonly FeatureKey[]) =>
      !features || features.length === 0 || isAdminBypass || features.some((f) => can(f)),
    [can, isAdminBypass],
  );

  // ---- async sources, loaded once the palette is first opened ----
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [n60Assignments, setN60Assignments] = useState<N60Assignment[] | null>(null);
  const [references, setReferences] = useState<ReferenceListItem[] | null>(null);
  const [cheatSheets, setCheatSheets] = useState<CheatSheetEntry[] | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    if (!assignments) {
      loadAllAssignments().then((all) => {
        if (!cancelled) setAssignments(all);
      });
    }
    if (!n60Assignments) {
      loadN60Assignments().then((all) => {
        if (!cancelled) setN60Assignments(all);
      });
    }
    if (!references) {
      listReferences().then((all) => {
        if (!cancelled) setReferences(all);
      });
    }
    if (!cheatSheets) {
      getAllSheets().then((all) => {
        if (!cancelled) setCheatSheets(all);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [open, assignments, n60Assignments, references, cheatSheets]);

  // DB-backed sources. These hooks fetch on mount; the dialog only mounts on
  // first open, and stays mounted, so each fetch happens once per session.
  const { scripts } = useScripts();
  const { playbooks } = usePlaybooks();
  const { flows } = useScriptFlows();
  const { cards } = useConceptCards();
  const { allProducts } = useAllProducts();

  // Question-bank deep search — server-side, debounced, only for real queries.
  const [questionHits, setQuestionHits] = useState<QuestionHit[]>([]);
  const canQuestions = allow([FEATURES.QUESTION_BANKS]);
  useEffect(() => {
    const term = debouncedQuery.trim().replace(/[^\w\s'%-]/g, " ").replace(/\s+/g, " ").trim();
    if (!open || !canQuestions || term.length < 3) {
      setQuestionHits([]);
      return;
    }
    let cancelled = false;
    supabase
      .from("question_bank_questions")
      .select("id, question, product_slug, bank_type")
      .ilike("question", `%${term.replace(/%/g, "")}%`)
      .limit(8)
      .then(({ data, error }) => {
        if (!cancelled && !error && data) setQuestionHits(data as QuestionHit[]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, canQuestions, debouncedQuery]);

  // ---- entry builders ----

  const pageEntries = useMemo<SearchEntry[]>(() => {
    const pages = PAGE_ENTRIES.filter((p) => (p.adminOnly ? isAdmin : allow(p.features))).map(
      (p) => ({
        value: `page-${p.href} ${p.title} ${p.meta}`,
        title: p.title,
        meta: p.meta,
        href: p.href,
        keywords: p.keywords,
      }),
    );
    const study = allow([FEATURES.QUESTION_BANKS])
      ? PRODUCT_STUDY_PAGES.flatMap((p) => [
          {
            value: `study-${p.slug} ${p.title} study guide`,
            title: `${p.title} — Study`,
            meta: "Product study guide",
            href: `/product/${p.slug}/study`,
            keywords: ["study", "guide", p.slug],
          },
          {
            value: `exam-${p.slug} ${p.title} exam simulation practice`,
            title: `${p.title} — Exam`,
            meta: "Practice & timed simulation",
            href: `/product/${p.slug}/exam`,
            keywords: ["exam", "simulation", "test", p.slug],
          },
        ])
      : [];
    return [...pages, ...study];
  }, [allow, isAdmin]);

  const f60Entries = useMemo<SearchEntry[]>(() => {
    if (!allow([FEATURES.PRE_RNF_TRACK])) return [];
    const lessons = getF60DaySummaries()
      .filter((d) => isF60Unlocked(d.dayNumber))
      .map((d) => {
        const week = F60_WEEK_META[d.week];
        return {
          value: `f60-day-${d.dayNumber} ${d.title} ${week?.title ?? ""}`,
          title: d.title,
          meta: `Day ${d.dayNumber} · Week ${d.week} — ${week?.title ?? ""} · ${d.duration} min`,
          href: `/learning-track/first-60-days/day/${d.dayNumber}`,
          keywords: [`day ${d.dayNumber}`, `week ${d.week}`, week?.tagline ?? ""],
          onWarm: () => prefetchF60Day(d.dayNumber),
        };
      });
    const summaries = getF60DaySummaries();
    const recaps = [...WEEKS_WITH_RECAP]
      .sort((a, b) => a - b)
      .filter((weekNumber) =>
        summaries.some((d) => d.week === weekNumber && isF60Unlocked(d.dayNumber)),
      )
      .map((weekNumber) => {
        const week = F60_WEEK_META[weekNumber];
        return {
          value: `f60-recap-${weekNumber} recap ${week?.title ?? ""}`,
          title: `Week ${weekNumber} Recap`,
          meta: week ? `${week.title} · video recap` : "Video recap",
          href: `/learning-track/first-60-days/recap/${weekNumber}`,
          keywords: ["recap", "video", `week ${weekNumber}`, week?.tagline ?? ""],
        };
      });
    return [...lessons, ...recaps];
  }, [allow, isF60Unlocked]);

  const pmEntries = useMemo<SearchEntry[]>(() => {
    if (!allow([FEATURES.PRE_RNF_TRACK])) return [];
    return getPmDaySummaries()
      .filter((d) => isPmUnlocked(d.dayNumber))
      .map((d) => {
        const week = PM_WEEK_META[d.week];
        return {
          value: `pm-day-${d.dayNumber} ${d.title} ${week?.title ?? ""}`,
          title: d.title,
          meta: `${week?.title ?? "Product Mastery"} · Day ${d.dayInWeek} of 5`,
          href: `/learning-track/product-mastery/day/${d.dayNumber}`,
          keywords: ["product", week?.productSlug ?? "", week?.tagline ?? ""],
          onWarm: () => prefetchPmDay(d.dayNumber),
        };
      });
  }, [allow, isPmUnlocked]);

  const n60Entries = useMemo<SearchEntry[]>(() => {
    if (!allow([FEATURES.POST_RNF_TRACK])) return [];
    return getN60DaySummaries()
      .filter((d) => isN60Unlocked(d.dayNumber))
      .map((d) => {
        const week = N60_WEEK_META[d.week];
        return {
          value: `n60-day-${d.dayNumber} ${d.title} ${week?.title ?? ""}`,
          title: d.title,
          meta: `Next 60 Days · Day ${d.dayNumber} · ${week?.title ?? ""}`,
          href: `/learning-track/next-60-days/day/${d.dayNumber}`,
          keywords: [`day ${d.dayNumber}`, week?.tagline ?? "", "post-rnf"],
        };
      });
  }, [allow, isN60Unlocked]);

  const f14Entries = useMemo<SearchEntry[]>(() => {
    if (!allow([FEATURES.EXPLORER_TRACK])) return [];
    return getF14DaySummaries()
      .filter((d) => isF14Unlocked(d.dayNumber))
      .map((d) => {
        const week = F14_WEEK_META[d.week];
        return {
          value: `f14-day-${d.dayNumber} ${d.title} ${d.bigIdea ?? ""}`,
          title: d.title,
          meta: `First 14 Days · Day ${d.dayNumber} · ${week?.title ?? ""}`,
          href: `/learning-track/first-14-days/day/${d.dayNumber}`,
          keywords: [`day ${d.dayNumber}`, d.bigIdea ?? "", "explorer"],
        };
      });
  }, [allow, isF14Unlocked]);

  const assignmentEntries = useMemo<SearchEntry[]>(() => {
    const f60 =
      allow([FEATURES.PRE_RNF_TRACK]) && assignments
        ? assignments.map((a) => ({
            value: `assignment-${a.slug} ${a.frontmatter.title} ${a.frontmatter.short}`,
            title: a.frontmatter.title,
            meta: [a.frontmatter.short, a.frontmatter.estimated_time].filter(Boolean).join(" · "),
            href: `/learning-track/pre-rnf/assignments/${a.frontmatter.url_slug ?? a.slug}`,
            keywords: ["assignment", a.frontmatter.deliverable],
          }))
        : [];
    const n60 =
      allow([FEATURES.POST_RNF_TRACK]) && n60Assignments
        ? n60Assignments.map((a) => ({
            value: `n60-assignment-${a.slug} ${a.frontmatter.title} ${a.frontmatter.short}`,
            title: a.frontmatter.title,
            meta: ["Next 60 Days assignment", a.frontmatter.estimated_time].filter(Boolean).join(" · "),
            href: `/learning-track/post-rnf/assignments/${a.slug}`,
            keywords: ["assignment", a.frontmatter.deliverable ?? ""],
          }))
        : [];
    return [...f60, ...n60];
  }, [allow, assignments, n60Assignments]);

  const referenceEntries = useMemo<SearchEntry[]>(() => {
    const refs =
      allow([FEATURES.PRE_RNF_TRACK]) && references
        ? references.map((r) => ({
            value: `reference-${r.slug} ${r.title} ${r.subtitle ?? ""}`,
            title: r.title,
            meta: r.subtitle ? `Reference · ${r.subtitle}` : "Reference document",
            href: `/learning-track/first-60-days/reference/${r.slug}`,
            keywords: ["reference", "supplementary"],
          }))
        : [];
    const sheets = cheatSheets
      ? cheatSheets.map((s) => ({
          value: `cheat-${s.section}-${s.slug} ${s.title} ${s.description}`,
          title: s.title,
          meta: `Cheat sheet · ${s.course ?? s.section}`,
          href: `/cheat-sheets/${s.section}/${s.slug}`,
          keywords: ["cheat sheet", "summary", ...s.tags],
        }))
      : [];
    return [...refs, ...sheets];
  }, [allow, references, cheatSheets]);

  const productEntries = useMemo<SearchEntry[]>(() => {
    if (!allow([FEATURES.PRODUCTS])) return [];
    return allProducts.map((p) => ({
      value: `product-${p.id} ${p.title} ${p.description ?? ""}`,
      title: p.title,
      meta: [
        (p as { categories?: { name?: string } }).categories?.name,
        "Product page",
      ]
        .filter(Boolean)
        .join(" · "),
      href: `/product/${p.id}`,
      keywords: [...(p.tags ?? []), ...(p.highlights ?? [])],
    }));
  }, [allow, allProducts]);

  const scriptEntries = useMemo<SearchEntry[]>(() => {
    const canScripts = allow([FEATURES.SCRIPTS]);
    const canObjections = allow([FEATURES.OBJECTIONS]);
    const canServicing = allow([FEATURES.SERVICING]);
    if (!canScripts && !canObjections && !canServicing) return [];
    return scripts
      .filter((s) => {
        if (s.category === "servicing") return canServicing;
        if (s.category === "objection-handling" || s.category === "faq") return canObjections;
        return canScripts;
      })
      .map((s) => {
        const v = s.versions?.[0];
        // `stage` is the human-facing script title in this schema (the
        // ScriptsDatabase list renders it as such); version titles are
        // per-variant labels and often absent.
        const title = s.stage || v?.title || `${s.category.replace(/-/g, " ")} script`;
        const isCourse = s.category === "tips";
        const isServicing = s.category === "servicing";
        return {
          value: `script-${s.id} ${title} ${s.category} ${s.stage}`,
          title,
          meta: isCourse
            ? "Scripts Fundamentals lesson"
            : `Script · ${s.category.replace(/-/g, " ")} · ${s.target_audience}`,
          href: isCourse
            ? `/scripts/course?lesson=${s.id}`
            : isServicing
              ? `/servicing/${s.id}`
              : `/scripts/${s.id}`,
          keywords: [...(s.tags ?? []), (v?.content ?? "").slice(0, 400)],
        };
      });
  }, [allow, scripts]);

  const playbookFlowEntries = useMemo<SearchEntry[]>(() => {
    const pb = allow([FEATURES.PLAYBOOKS])
      ? (playbooks ?? []).map((p) => ({
          value: `playbook-${p.id} ${p.title}`,
          title: p.title,
          meta: `Playbook${p.creator_name ? ` · by ${p.creator_name}` : ""}`,
          href: `/playbooks/${p.id}`,
          keywords: ["playbook"],
        }))
      : [];
    const fl = allow([FEATURES.FLOWS])
      ? (flows ?? []).map((f) => ({
          value: `flow-${f.id} ${f.title}`,
          title: f.title,
          meta: "Script flow",
          href: `/flows/${f.id}`,
          keywords: ["flow", "conversation"],
        }))
      : [];
    return [...pb, ...fl];
  }, [allow, playbooks, flows]);

  const conceptEntries = useMemo<SearchEntry[]>(() => {
    if (!allow([FEATURES.CONCEPT_CARDS])) return [];
    return (cards ?? []).map((c) => ({
      value: `concept-${c.id} ${c.title} ${c.description ?? ""}`,
      title: c.title,
      meta: `Concept card${c.product_type?.length ? ` · ${c.product_type.join(", ")}` : ""}`,
      href: `/concept-cards?q=${encodeURIComponent(c.title)}`,
      keywords: [...(c.tags ?? []), ...(c.audience ?? [])],
    }));
  }, [allow, cards]);

  const caseEntries = useMemo<SearchEntry[]>(() => {
    if (!allow([FEATURES.CASE_VAULT])) return [];
    return CASES.map((c) => ({
      value: `case-${c.id} ${c.title} ${c.headline}`,
      title: c.title,
      meta: `Case ${c.code} · ${c.prospect} · ${c.anchor}`,
      href: `/case-vault/${c.id}`,
      keywords: [...c.tags, c.play, c.headline],
    }));
  }, [allow]);

  const cmfasEntries = useMemo<SearchEntry[]>(() => {
    if (!allow([FEATURES.CMFAS])) return [];
    const modules: SearchEntry[] = CMFAS_MODULE_IDS.map((id) => ({
      value: `cmfas-module-${id} ${getCMFASModuleName(id)}`,
      title: getCMFASModuleName(id),
      meta: "CMFAS study module",
      href: `/cmfas/module/${id}`,
      keywords: ["cmfas", "exam", "paper", id],
    }));
    const videos: SearchEntry[] = CMFAS_MODULE_IDS.flatMap((id) =>
      (cmfasModuleVideos[id] ?? []).map((v) => ({
        value: `cmfas-video-${v.id} ${v.title}`,
        title: v.title,
        meta: `${getCMFASModuleName(id)} · video`,
        href: `/cmfas/module/${id}/video/${v.id}`,
        keywords: ["cmfas", "video", v.description ?? ""],
      })),
    );
    return [...modules, ...videos];
  }, [allow]);

  const questionEntries = useMemo<SearchEntry[]>(() => {
    return questionHits.map((qh) => {
      const flat = qh.question.replace(/\s+/g, " ").trim();
      return {
        value: `question-${qh.id} ${flat}`,
        title: flat.length > 90 ? `${flat.slice(0, 90)}…` : flat,
        meta: `${PRODUCT_LABEL_BY_SLUG[qh.product_slug] ?? qh.product_slug} · ${qh.bank_type} bank`,
        href: `/review-all?q=${encodeURIComponent(questionSnippet(qh.question))}`,
        keywords: [],
      };
    });
  }, [questionHits]);

  // Section-level hits inside lessons. Day titles give the meta line; the
  // track's unlock + tier gates decide visibility, same as the day entries.
  const headingEntries = useMemo<SearchEntry[]>(() => {
    const dayTitles: Record<HeadingTrack, Map<number, string>> = {
      f60: new Map(getF60DaySummaries().map((d) => [d.dayNumber, d.title])),
      pm: new Map(getPmDaySummaries().map((d) => [d.dayNumber, d.title])),
      n60: new Map(getN60DaySummaries().map((d) => [d.dayNumber, d.title])),
      f14: new Map(getF14DaySummaries().map((d) => [d.dayNumber, d.title])),
    };
    const trackAllowed: Record<HeadingTrack, boolean> = {
      f60: allow([FEATURES.PRE_RNF_TRACK]),
      pm: allow([FEATURES.PRE_RNF_TRACK]),
      n60: allow([FEATURES.POST_RNF_TRACK]),
      f14: allow([FEATURES.EXPLORER_TRACK]),
    };
    const trackUnlocked: Record<HeadingTrack, (day: number) => boolean> = {
      f60: isF60Unlocked,
      pm: isPmUnlocked,
      n60: isN60Unlocked,
      f14: isF14Unlocked,
    };
    const out: SearchEntry[] = [];
    for (const [track, day, , text, slug] of HEADING_INDEX) {
      if (!trackAllowed[track]) continue;
      if (!trackUnlocked[track](day)) continue;
      const dayTitle = dayTitles[track].get(day);
      out.push({
        value: `h-${track}-${day}-${slug} ${text}`,
        title: text,
        meta: `${TRACK_LABELS[track]} · Day ${day}${dayTitle ? ` — ${dayTitle}` : ""}`,
        href: `${TRACK_ROUTES[track]}${day}#${slug}`,
        keywords: dayTitle ? [dayTitle] : [],
        onWarm:
          track === "f60"
            ? () => prefetchF60Day(day)
            : track === "pm"
              ? () => prefetchPmDay(day)
              : undefined,
      });
    }
    return out;
  }, [allow, isF60Unlocked, isPmUnlocked, isN60Unlocked, isF14Unlocked]);

  // Escape hatches into the full-page searches, always at the bottom.
  const deeperEntries = useMemo<SearchEntry[]>(() => {
    const q = query.trim();
    if (!q) return [];
    const enc = encodeURIComponent(q);
    const out: SearchEntry[] = [];
    if (allow([FEATURES.SCRIPTS]))
      out.push({
        value: `deeper-scripts`,
        title: `Search the scripts database for “${q}”`,
        meta: "Full-text search across every script",
        href: `/scripts?q=${enc}`,
        keywords: [],
      });
    if (allow([FEATURES.OBJECTIONS]))
      out.push({
        value: `deeper-objections`,
        title: `Search objections & FAQ for “${q}”`,
        meta: "Objection handling scripts",
        href: `/objections?q=${enc}`,
        keywords: [],
      });
    if (canQuestions)
      out.push({
        value: `deeper-questions`,
        title: `Search all questions for “${q}”`,
        meta: "1,700+ study & exam questions",
        href: `/review-all?q=${enc}`,
        keywords: [],
      });
    if (allow([FEATURES.CONCEPT_CARDS]))
      out.push({
        value: `deeper-concepts`,
        title: `Search concept cards for “${q}”`,
        meta: "Visual selling concepts",
        href: `/concept-cards?q=${enc}`,
        keywords: [],
      });
    return out;
  }, [query, allow, canQuestions]);

  const groups = useMemo<GroupDef[]>(
    () => [
      { heading: "Pages & Tools", icon: Compass, entries: pageEntries },
      { heading: "Lessons — First 60 Days", icon: GraduationCap, entries: f60Entries },
      { heading: "Product Mastery", icon: Sparkles, entries: pmEntries },
      { heading: "Next 60 Days", icon: BookOpenCheck, entries: n60Entries },
      { heading: "First 14 Days", icon: Lightbulb, entries: f14Entries },
      { heading: "Assignments", icon: ClipboardList, entries: assignmentEntries },
      { heading: "References & Cheat Sheets", icon: FileText, entries: referenceEntries },
      { heading: "Products", icon: Package, entries: productEntries },
      { heading: "Scripts", icon: MessageSquare, entries: scriptEntries },
      { heading: "Playbooks & Flows", icon: Workflow, entries: playbookFlowEntries },
      { heading: "Concept Cards", icon: Layers, entries: conceptEntries },
      { heading: "Case Vault", icon: Vault, entries: caseEntries },
      { heading: "CMFAS Exams", icon: PlayCircle, entries: cmfasEntries },
      { heading: "Questions", icon: FileQuestion, entries: questionEntries },
      { heading: "Inside lessons", icon: ListTree, entries: headingEntries, cap: 8 },
    ],
    [
      pageEntries,
      f60Entries,
      pmEntries,
      n60Entries,
      f14Entries,
      assignmentEntries,
      referenceEntries,
      productEntries,
      scriptEntries,
      playbookFlowEntries,
      conceptEntries,
      caseEntries,
      cmfasEntries,
      questionEntries,
      headingEntries,
    ],
  );

  // Filtering + ranking happen here, not in cmdk (shouldFilter={false}) — the
  // deterministic scorer keeps literal matches above scattered fuzzy ones.
  const visibleGroups = useMemo(() => {
    // Pathological input guard: scoring is O(query × index). A pasted wall of
    // text would burn 1-2s of main thread per keystroke; nothing meaningful is
    // lost by scoring only the first 200 chars / 12 tokens.
    const q = query.trim().split(/\s+/).slice(0, 12).join(" ").slice(0, 200);
    if (!q) return [];
    const scored = groups
      .map((g) => {
        const hits = g.entries
          .map((entry) => ({ entry, score: scoreEntry(entry.value, q, entry.keywords) }))
          .filter((s) => s.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, g.cap ?? 6);
        return { ...g, entries: hits.map((s) => s.entry), best: hits[0]?.score ?? 0 };
      })
      .filter((g) => g.entries.length > 0)
      .sort((a, b) => b.best - a.best);
    return scored;
  }, [groups, query]);

  // Empty-query view: recents + the most useful destinations.
  const [recents, setRecents] = useState<string[]>([]);
  useEffect(() => {
    if (open) setRecents(readRecents());
  }, [open]);

  const quickNav = useMemo(() => pageEntries.slice(0, 9), [pageEntries]);

  const go = useCallback(
    (entry: SearchEntry) => {
      saveRecent(query);
      onOpenChange(false);
      navigate(entry.href);
    },
    [navigate, onOpenChange, query],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      onOpenChange(next);
      if (!next) setQuery("");
    },
    [onOpenChange],
  );

  const hasQuery = query.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0 shadow-lg">
        <DialogTitle className="sr-only">Search everything</DialogTitle>
        <Command
          shouldFilter={false}
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2.5 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        >
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search lessons, scripts, products, questions, anything…"
          />
          <CommandList className="max-h-[min(28rem,60vh)]">
            {!hasQuery && (
              <>
                {recents.length > 0 && (
                  <CommandGroup heading="Recent searches">
                    {recents.map((r) => (
                      <CommandItem
                        key={`recent-${r}`}
                        value={`recent-${r}`}
                        onSelect={() => setQuery(r)}
                        className="gap-3"
                      >
                        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm">{r}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                <CommandGroup heading="Go to">
                  {quickNav.map((entry) => (
                    <CommandItem
                      key={entry.value}
                      value={entry.value}
                      onSelect={() => go(entry)}
                      className="gap-3"
                    >
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{entry.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{entry.meta}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {hasQuery && visibleGroups.length === 0 && deeperEntries.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing matches “{query.trim()}”. Try fewer or different words.
              </p>
            )}

            {hasQuery &&
              visibleGroups.map((g, i) => (
                <div key={g.heading}>
                  {i > 0 && <CommandSeparator />}
                  <CommandGroup heading={g.heading}>
                    {g.entries.map((entry) => (
                      <CommandItem
                        key={entry.value}
                        value={entry.value}
                        onSelect={() => go(entry)}
                        onMouseEnter={entry.onWarm}
                        className="gap-3"
                      >
                        <g.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{entry.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{entry.meta}</p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </div>
              ))}

            {hasQuery && deeperEntries.length > 0 && (
              <>
                {visibleGroups.length > 0 && <CommandSeparator />}
                <CommandGroup heading="Search deeper">
                  {deeperEntries.map((entry) => (
                    <CommandItem
                      key={entry.value}
                      value={entry.value}
                      onSelect={() => go(entry)}
                      className="gap-3"
                    >
                      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{entry.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{entry.meta}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

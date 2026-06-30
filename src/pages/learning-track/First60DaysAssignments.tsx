import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Loader2,
  PlayCircle,
  Target,
  Upload,
  Users,
  Video,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { Input } from "@/components/ui/input";
import { assignmentMarkdownComponents } from "@/components/first-60-days/assignmentMarkdownComponents";
import PeerSubmissionsGallery from "@/components/learning-track/PeerSubmissionsGallery";
import {
  loadAllAssignments,
  type Assignment,
  type AssignmentFormField,
  type AssignmentResource,
} from "@/features/first-60-days/assignments";
import { DAY_SUMMARIES } from "@/features/first-60-days/summaries";
import { notifyAssignmentSubmitted } from "@/lib/notifyAssignmentSubmitted";

const PRODUCT_ID = "first-60-days-assignments";

// Assignments that show a cohort gallery of other students' submissions once
// the current student has submitted their own. "image" boards render as a photo
// grid; "text" submissions render their written answers. Cross-user reads depend
// on the cohort RLS policy documented in SUPABASE.md.
const PEER_GALLERY: Record<string, "image" | "text"> = {
  "assignment-06-vision-board": "image",
  "assignment-01-roleplay": "text",
  "assignment-07-100-whys": "text",
};

// Module-level so react-markdown's parse cache stays valid across renders —
// inline `[remarkGfm]` arrays bust the cache every time.
const REMARK_PLUGINS = [remarkGfm];

const NUMBER_WORDS = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve",
];

function countLabel(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

// Wording for the multi-submission append/history UI. Defaults preserve the
// original "observation" copy (Joint Field Observation); other assignments can
// override via the append_noun / append_noun_plural frontmatter fields.
function appendLabels(fm: Assignment["frontmatter"]) {
  const noun = fm.append_noun ?? "observation";
  const plural = fm.append_noun_plural ?? `${noun}s`;
  const article = /^[aeiou]/i.test(noun) ? "an" : "a";
  const cap = noun.charAt(0).toUpperCase() + noun.slice(1);
  return { noun, plural, article, cap };
}

const ICON_MAP: Record<string, typeof Video> = {
  video: Video,
  users: Users,
  eye: Eye,
  "book-open": BookOpen,
  clipboard: ClipboardList,
  target: Target,
};

type Submission = {
  id: string;
  file_name: string | null;
  file_url: string | null;
  submission_text: string | null;
  submitted_at: string | null;
};

function useAssignments() {
  return useQuery({
    queryKey: ["first60-assignments"],
    queryFn: loadAllAssignments,
    staleTime: Infinity,
  });
}

function useSubmissions(userId: string | undefined) {
  return useQuery({
    queryKey: ["first60-assignment-submissions", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [] as (Submission & { item_id: string })[];
      const { data, error } = await (supabase.from as any)("assignment_submissions")
        .select("id, item_id, file_name, file_url, submission_text, submitted_at")
        .eq("product_id", PRODUCT_ID)
        .eq("user_id", userId)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as (Submission & { item_id: string })[];
    },
  });
}

export default function First60DaysAssignments() {
  const { data: assignments, isLoading } = useAssignments();
  const { user } = useSimplifiedAuth();
  const { data: submissions, refetch: refetchSubmissions } = useSubmissions(user?.id);
  const { itemId } = useParams<{ itemId?: string }>();
  const navigate = useNavigate();

  const latestBySlug = useMemo(() => {
    const m: Record<string, Submission> = {};
    for (const s of submissions ?? []) {
      if (!m[s.item_id]) m[s.item_id] = s;
    }
    return m;
  }, [submissions]);

  // Full submission history per assignment, newest-first (the query already
  // orders by submitted_at desc). Only multi-submission assignments render it;
  // everything else still shows the single latest via latestBySlug.
  const allBySlug = useMemo(() => {
    const m: Record<string, (Submission & { item_id: string })[]> = {};
    for (const s of submissions ?? []) {
      (m[s.item_id] ??= []).push(s);
    }
    return m;
  }, [submissions]);

  // Memoized: was re-running this 14-item filter on every render. With
  // submissions changing via realtime + parent re-renders from other state,
  // this fired dozens of times during a normal session.
  const completedCount = useMemo(
    () => (assignments ?? []).filter((a) => !!latestBySlug[a.frontmatter.status_key]).length,
    [assignments, latestBySlug],
  );

  if (isLoading || !assignments) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Resolve by url_slug (preferred), then fall back to file slug for backward compatibility.
  // Old bookmarked links (e.g. /assignments/assignment-01) keep working.
  const active = itemId
    ? assignments.find((a) => a.frontmatter.url_slug === itemId)
      ?? assignments.find((a) => a.slug === itemId)
    : null;

  if (itemId && !active) {
    // Unknown slug — bounce back to grid.
    return (
      <div className="max-w-3xl mx-auto rounded-xl border border-dashed bg-muted/20 p-10 text-center">
        <p className="text-sm text-muted-foreground mb-4">Assignment not found.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/learning-track/pre-rnf/assignments")}>
          Back to all assignments
        </Button>
      </div>
    );
  }

  if (active) {
    return (
      <AssignmentDetail
        assignment={active}
        submission={latestBySlug[active.frontmatter.status_key]}
        history={allBySlug[active.frontmatter.status_key] ?? []}
        onSubmitted={() => refetchSubmissions()}
        userId={user?.id}
        totalCount={assignments.length}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 px-3 sm:space-y-6 sm:px-0">
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary mb-1.5">
              First 60 Days · Assignments
            </p>
            <h1 className="text-xl sm:text-3xl font-serif font-bold leading-tight text-foreground">
              {countLabel(assignments.length)} deliverables to prove you're ready for the field.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Each assignment turns study into a practical artifact. Link back to the day material any time.
            </p>
          </div>
          <div className="hidden sm:block rounded-full bg-background/80 backdrop-blur px-4 py-2 border text-center shrink-0">
            <div className="text-2xl font-serif font-bold tabular-nums text-foreground">
              {completedCount}/{assignments.length}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Submitted
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {assignments.map((a) => {
          const sub = latestBySlug[a.frontmatter.status_key];
          const Icon = ICON_MAP[a.frontmatter.icon] ?? ClipboardList;
          const submitted = !!sub;
          return (
            <Link
              key={a.slug}
              to={`/learning-track/pre-rnf/assignments/${a.frontmatter.url_slug ?? a.slug}`}
              className="block group"
            >
            <Card
              className={cn(
                "cursor-pointer relative overflow-hidden border transition-all hover:border-primary/40 hover:shadow-md",
                submitted && "border-green-500/30 bg-green-500/5",
              )}
            >
              <CardHeader className="p-5 pb-0 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  {submitted ? (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] font-semibold uppercase tracking-wide">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Submitted
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wide">
                      Assignment {a.frontmatter.order}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-lg sm:text-xl font-serif font-bold leading-snug">
                    {a.frontmatter.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed line-clamp-2">
                    {a.frontmatter.short}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-4 space-y-3">
                <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1">
                    <FileText className="h-3 w-3" />
                    {a.frontmatter.deliverable}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1">
                    <Clock className="h-3 w-3" />
                    {a.frontmatter.estimated_time}
                  </span>
                </div>
                <div
                  className={cn(
                    "inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                    submitted
                      ? "border bg-background text-foreground group-hover:bg-muted"
                      : "bg-primary text-primary-foreground group-hover:bg-primary/90",
                  )}
                >
                  {submitted ? "Review submission" : "Open assignment"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function AssignmentDetail({
  assignment,
  submission,
  history,
  onSubmitted,
  userId,
  totalCount,
}: {
  assignment: Assignment;
  submission: Submission | undefined;
  history: (Submission & { item_id: string })[];
  onSubmitted: () => void;
  userId: string | undefined;
  totalCount: number;
}) {
  const Icon = ICON_MAP[assignment.frontmatter.icon] ?? ClipboardList;
  const { isAdmin, isMasterAdmin } = usePermissions();
  // True role, independent of "view as student" mode — so an admin always sees
  // the all-submissions panel and their own submissions are auto-hidden.
  const admin = isAdmin() || isMasterAdmin();
  const labels = appendLabels(assignment.frontmatter);
  return (
    <div className="max-w-4xl mx-auto space-y-5 px-3 sm:space-y-6 sm:px-0">
      <Link
        to="/learning-track/pre-rnf/assignments"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all assignments
      </Link>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="relative p-4 sm:p-8 border-b bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary shrink-0">
              <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                Assignment {assignment.frontmatter.order} of {totalCount}
              </p>
              <h1 className="text-xl sm:text-3xl font-serif font-bold leading-tight text-foreground">
                {assignment.frontmatter.title}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {assignment.frontmatter.short}
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-5 flex flex-wrap gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur border px-3 py-1.5 font-medium">
              <FileText className="h-3 w-3 text-primary" />
              {assignment.frontmatter.deliverable}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur border px-3 py-1.5 font-medium">
              <Clock className="h-3 w-3 text-primary" />
              {assignment.frontmatter.estimated_time}
            </span>
            {submission && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 border border-green-500/40 px-3 py-1.5 font-medium text-green-700 dark:text-green-300">
                <CheckCircle2 className="h-3 w-3" />
                Submitted
              </span>
            )}
          </div>
        </div>

        {assignment.frontmatter.resources && assignment.frontmatter.resources.length > 0 && (
          <ResourceBar resources={assignment.frontmatter.resources} />
        )}

        <div className="p-4 sm:p-8 border-b space-y-3 sm:space-y-4">
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Prep days linked in this assignment
          </h2>
          <div className="flex flex-wrap gap-2">
            {assignment.frontmatter.related_days.map((d) => {
              const s = DAY_SUMMARIES.find((x) => x.dayNumber === d);
              return (
                <a
                  key={d}
                  href={`/learning-track/first-60-days/day/${d}`}
                  className="group inline-flex items-center gap-2 rounded-lg border bg-muted/40 hover:bg-primary/10 hover:border-primary/40 px-3 py-1.5 text-xs transition-colors"
                >
                  <span className="font-mono font-semibold text-primary">
                    D{String(d).padStart(2, "0")}
                  </span>
                  <span className="text-foreground/80 group-hover:text-foreground truncate max-w-[150px] sm:max-w-[180px]">
                    {s?.title ?? `Day ${d}`}
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        <div className="p-4 sm:p-8">
          <article className="prose prose-sm sm:prose-base prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={assignmentMarkdownComponents}>
              {assignment.markdown}
            </ReactMarkdown>
          </article>
        </div>
      </div>

      {assignment.frontmatter.multiple_submissions ? (
        <div className="space-y-4 sm:space-y-5">
          {history.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-serif text-lg font-bold">Your {labels.plural}</h3>
                <span className="text-xs text-muted-foreground">
                  {history.length} logged
                </span>
              </div>
              {history.map((s, i) => (
                <SubmittedSummary
                  key={s.id}
                  submission={s}
                  assignment={assignment}
                  label={`${labels.cap} ${history.length - i}`}
                />
              ))}
            </div>
          )}
          <SubmissionPanel
            assignment={assignment}
            submission={undefined}
            userId={userId}
            onSubmitted={onSubmitted}
            isAdmin={admin}
            appendMode
          />
        </div>
      ) : (
        <SubmissionPanel
          assignment={assignment}
          submission={submission}
          userId={userId}
          onSubmitted={onSubmitted}
          isAdmin={admin}
        />
      )}

      {admin ? (
        // Admins see every submission for the assignment, on every assignment
        // page, even while "viewing as" a student.
        <PeerSubmissionsGallery
          statusKey={assignment.frontmatter.status_key}
          userId={userId}
          variant={PEER_GALLERY[assignment.frontmatter.status_key] ?? "text"}
          admin
        />
      ) : (
        PEER_GALLERY[assignment.frontmatter.status_key] &&
        submission && (
          <PeerSubmissionsGallery
            statusKey={assignment.frontmatter.status_key}
            userId={userId}
            variant={PEER_GALLERY[assignment.frontmatter.status_key]}
          />
        )
      )}
    </div>
  );
}

const RESOURCE_META: Record<
  AssignmentResource["kind"],
  { icon: typeof FileText; tag: string }
> = {
  worksheet: { icon: FileSpreadsheet, tag: "Fill in online" },
  pdf: { icon: Download, tag: "Download PDF" },
  video: { icon: PlayCircle, tag: "Watch" },
  link: { icon: ArrowUpRight, tag: "Open" },
};

// Prominent, tappable action cards for an assignment's key templates, tutorials,
// and tools — so they aren't buried as inline links in the markdown body. Driven
// by the `resources` frontmatter list. Worksheet links route internally; the
// rest open in a new tab (downloads / videos / external pages).
function ResourceBar({ resources }: { resources: AssignmentResource[] }) {
  return (
    <div className="border-b bg-muted/20 p-4 sm:p-6">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Templates, tutorials &amp; tools
      </h2>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {resources.map((r) => {
          const meta = RESOURCE_META[r.kind];
          const Icon = meta.icon;
          // Only in-app routes use the router Link. PDFs live under /public as
          // static files — a <Link> would try to client-route to them and the
          // file would never load — so they use a plain <a download> instead.
          const useRouterLink = r.url.startsWith("/") && r.kind !== "pdf";
          const primary = r.kind === "worksheet";
          const inner = (
            <>
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  primary
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {r.label}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {r.note ?? meta.tag}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </>
          );
          const className = cn(
            "group flex items-center gap-3 rounded-xl border bg-card p-3 transition-all hover:shadow-sm",
            primary
              ? "border-primary/40 hover:border-primary/60 hover:bg-primary/5"
              : "hover:border-primary/40 hover:bg-muted/40",
          );
          return useRouterLink ? (
            <Link key={r.url} to={r.url} className={className}>
              {inner}
            </Link>
          ) : (
            <a
              key={r.url}
              href={r.url}
              // PDFs download to disk; videos/external links open in a new tab.
              {...(r.kind === "pdf"
                ? { download: "" }
                : { target: "_blank", rel: "noopener noreferrer" })}
              className={className}
            >
              {inner}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function parseFormValues(submissionText: string | null | undefined): Record<string, string> {
  if (!submissionText) return {};
  try {
    const parsed = JSON.parse(submissionText);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed).map(([k, v]) => [k, typeof v === "string" ? v : String(v ?? "")]),
      );
    }
  } catch {
    // Not JSON — probably free-text submission, ignore for form mode
  }
  return {};
}

// --- Local draft autosave -------------------------------------------------
// Heavy form assignments (Project 200 has 13 fields, some 10 rows tall) used to
// lose everything on an accidental refresh or back-navigation. We mirror the
// in-progress answers to localStorage so a student never retypes a playbook.
type Draft = { t?: string; f?: Record<string, string> };

const DRAFT_KEY = (userId: string, statusKey: string) =>
  `assignment-draft-${userId}-${statusKey}`;

function readDraft(userId: string | undefined, statusKey: string): Draft | null {
  if (!userId || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY(userId, statusKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Draft) : null;
  } catch {
    return null;
  }
}

function writeDraft(userId: string | undefined, statusKey: string, draft: Draft) {
  if (!userId || typeof window === "undefined") return;
  try {
    const hasContent =
      (draft.t && draft.t.trim().length > 0) ||
      Object.values(draft.f ?? {}).some((v) => v.trim().length > 0);
    if (hasContent) localStorage.setItem(DRAFT_KEY(userId, statusKey), JSON.stringify(draft));
    else localStorage.removeItem(DRAFT_KEY(userId, statusKey));
  } catch {
    // Quota / private-mode failures are non-fatal — the form still works.
  }
}

function clearDraft(userId: string | undefined, statusKey: string) {
  if (!userId || typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY(userId, statusKey));
  } catch {
    // Non-fatal.
  }
}

// Read-only render of one submitted assignment. Used for the single-submission
// "Submission received" state and, for multi-submission assignments, for each
// row in the history list (pass `label` to title it, omit `onEdit` to make it
// read-only).
function SubmittedSummary({
  submission,
  assignment,
  label,
  onEdit,
}: {
  submission: Submission;
  assignment: Assignment;
  label?: string;
  onEdit?: () => void;
}) {
  const isFormMode =
    assignment.frontmatter.submission_type === "form" &&
    !!assignment.frontmatter.form_fields?.length;
  const formFields = assignment.frontmatter.form_fields ?? [];
  const formValuesSnapshot = parseFormValues(submission.submission_text);
  const hasFormValues = Object.keys(formValuesSnapshot).length > 0;
  return (
    <div className="rounded-2xl border border-green-500/40 bg-green-500/5 p-4 sm:p-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shrink-0">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold">{label ?? "Submission received"}</h3>
          <p className="text-xs text-muted-foreground">
            Submitted {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : "recently"}
          </p>
        </div>
      </div>
      {submission.file_name && (
        <a
          href={submission.file_url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm hover:bg-muted/60 transition-colors"
        >
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate flex-1">{submission.file_name}</span>
        </a>
      )}
      {isFormMode && hasFormValues ? (
        <div className="space-y-3">
          {formFields.map((field) => {
            if (field.kind === "section") return null;
            const value = formValuesSnapshot[field.label];
            if (!value) return null;
            if (field.kind === "check") {
              return (
                <div
                  key={field.label}
                  className="flex items-center gap-2 rounded-lg border bg-background px-4 py-3"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                  <p className="text-sm font-medium">{field.label}</p>
                </div>
              );
            }
            if (field.kind === "file" && /^https?:\/\//.test(value.trim())) {
              return (
                <a
                  key={field.label}
                  href={value.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border bg-background px-4 py-3 text-sm hover:bg-muted/60 transition-colors"
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {field.label}
                    </span>
                    <span className="text-primary underline-offset-2 hover:underline">
                      View submitted file
                    </span>
                  </span>
                </a>
              );
            }
            return (
              <div key={field.label} className="rounded-lg border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {field.label}
                </p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{value}</p>
              </div>
            );
          })}
        </div>
      ) : submission.submission_text ? (
        <div className="rounded-lg border bg-background p-4 text-sm whitespace-pre-wrap">
          {submission.submission_text}
        </div>
      ) : null}
      {onEdit && (
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit & resubmit
        </Button>
      )}
    </div>
  );
}

function SubmissionPanel({
  assignment,
  submission,
  userId,
  onSubmitted,
  isAdmin = false,
  appendMode = false,
}: {
  assignment: Assignment;
  submission: Submission | undefined;
  userId: string | undefined;
  onSubmitted: () => void;
  isAdmin?: boolean;
  /** When true, the panel always shows a blank form (the prior submissions are
   *  rendered above it as history) and a successful submit resets the form so
   *  the learner can immediately log another. Used by multi-submission
   *  assignments — `submission` is passed undefined in this mode. */
  appendMode?: boolean;
}) {
  const isFormMode =
    assignment.frontmatter.submission_type === "form" &&
    !!assignment.frontmatter.form_fields?.length;
  const formFields = assignment.frontmatter.form_fields ?? [];
  // Labelled upload slots inside a form (e.g. the Business Plan wants one file
  // for the pledge sheet and one for the plan deck). Each uploads separately and
  // its public URL is stored in the submission JSON under the field label.
  const fileFields = formFields.filter((f) => f.kind === "file");
  const labels = appendLabels(assignment.frontmatter);

  const statusKey = assignment.frontmatter.status_key;
  const initialDraft = submission ? null : readDraft(userId, statusKey);
  const [text, setText] = useState(submission?.submission_text ?? initialDraft?.t ?? "");
  const [formValues, setFormValues] = useState<Record<string, string>>(() =>
    submission ? parseFormValues(submission?.submission_text) : initialDraft?.f ?? {},
  );
  const [file, setFile] = useState<File | null>(null);
  // Pending per-slot files, keyed by field label (not draft-persisted — File
  // objects can't be serialised to localStorage).
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(!submission);

  useEffect(() => {
    const parsed = parseFormValues(submission?.submission_text);
    const staleNonFormSubmission =
      isFormMode && submission && Object.keys(parsed).length === 0;
    setEditing(!submission || !!staleNonFormSubmission);
    // No server submission yet → restore any local draft so a refresh or
    // back-navigation never wipes in-progress answers.
    if (!submission) {
      const draft = readDraft(userId, statusKey);
      setText(draft?.t ?? "");
      setFormValues(draft?.f ?? {});
    } else {
      setText(submission.submission_text ?? "");
      setFormValues(parsed);
    }
    setFile(null);
    setPendingFiles({});
  }, [submission?.id, assignment.slug, isFormMode, userId, statusKey]);

  // Mirror in-progress answers to localStorage. Once a submission exists the
  // draft has served its purpose, so we stop writing (and editing a submission
  // again is backed by the server row, not the draft).
  useEffect(() => {
    if (submission) return;
    writeDraft(userId, statusKey, { t: text, f: formValues });
  }, [text, formValues, submission, userId, statusKey]);

  const MAX_MB = 500;

  if (submission && !editing && !appendMode) {
    return (
      <SubmittedSummary
        submission={submission}
        assignment={assignment}
        onEdit={() => setEditing(true)}
      />
    );
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`File exceeds ${MAX_MB}MB limit`);
      e.target.value = "";
      return;
    }
    setFile(f);
  };

  const submit = async () => {
    if (!userId) {
      toast.error("Please sign in to submit.");
      return;
    }

    if (isFormMode) {
      // Confirmation checkboxes are gates: a checklist assignment isn't done
      // until every box is ticked (e.g. "I've booked a call to review this").
      const missingCheck = formFields.find(
        (f) => f.kind === "check" && (formValues[f.label] ?? "") !== "yes",
      );
      if (missingCheck) {
        toast.error(`Tick to confirm: "${missingCheck.label}"`);
        return;
      }
      // Each labelled upload slot is required: no pending file and no file kept
      // from a previous submission means the deliverable is missing.
      const missingFile = fileFields.find(
        (f) => !pendingFiles[f.label] && !(formValues[f.label] ?? "").trim(),
      );
      if (missingFile) {
        toast.error(`Attach your ${missingFile.label}`);
        return;
      }
      const answerable = formFields.filter((f) => f.kind !== "section");
      const hasAny =
        answerable.some((f) => (formValues[f.label] ?? "").trim().length > 0) ||
        Object.keys(pendingFiles).length > 0 ||
        !!file;
      if (!hasAny) {
        toast.error("Fill in at least one field or attach a file before submitting.");
        return;
      }
    } else {
      if (!file && !text.trim()) {
        toast.error("Upload a file or paste a link / notes.");
        return;
      }
    }

    setSubmitting(true);
    const uploadedPaths: string[] = [];
    try {
      const uploadOne = async (f: File, tag: string) => {
        const ext = f.name.split(".").pop() ?? "bin";
        const safeTag = tag.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "file";
        const path = `${userId}/${PRODUCT_ID}/${assignment.frontmatter.status_key}/${safeTag}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("assignment-files")
          .upload(path, f);
        if (upErr) throw upErr;
        uploadedPaths.push(path);
        const { data: pub } = supabase.storage.from("assignment-files").getPublicUrl(path);
        return { url: pub.publicUrl, name: f.name };
      };

      let fileUrl: string | null = null;
      let fileName: string | null = null;
      // Per-slot uploaded deliverables — their URLs ride in the JSON payload
      // under each field label so each renders as its own download link.
      const urlByLabel: Record<string, string> = {};
      if (isFormMode) {
        for (const f of fileFields) {
          const pf = pendingFiles[f.label];
          if (!pf) continue;
          const up = await uploadOne(pf, f.label);
          urlByLabel[f.label] = up.url;
          // Light up the row's file column with the first deliverable so list /
          // gallery views that key off file_url still register a submission.
          if (!fileUrl) {
            fileUrl = up.url;
            fileName = up.name;
          }
        }
      }
      if (file) {
        const up = await uploadOne(file, "attachment");
        if (!fileUrl) {
          fileUrl = up.url;
          fileName = up.name;
        } else if (isFormMode) {
          urlByLabel["Attachment"] = up.url;
        }
      }

      let payloadText: string | null;
      if (isFormMode) {
        const answerable = formFields.filter((f) => f.kind !== "section");
        const merged: Record<string, string> = { ...formValues, ...urlByLabel };
        const entries = answerable
          .map((f) => [f.label, (merged[f.label] ?? "").trim()] as const)
          .filter(([, v]) => v.length > 0);
        payloadText = entries.length ? JSON.stringify(Object.fromEntries(entries)) : null;
      } else {
        payloadText = text.trim() || null;
      }

      const { error: insErr } = await (supabase.from as any)("assignment_submissions").insert({
        user_id: userId,
        product_id: PRODUCT_ID,
        item_id: assignment.frontmatter.status_key,
        submission_text: payloadText,
        file_url: fileUrl,
        file_name: fileName,
        // Admin/test submissions never surface in the student cohort gallery.
        hidden_from_gallery: isAdmin,
      });
      if (insErr) throw insErr;
      notifyAssignmentSubmitted({
        userId,
        productId: PRODUCT_ID,
        itemId: assignment.frontmatter.status_key,
        assignmentTitle: assignment.frontmatter.title,
        submissionExcerpt: payloadText,
        fileName,
      });
      toast.success(appendMode ? `${labels.cap} logged` : "Assignment submitted");
      clearDraft(userId, statusKey);
      onSubmitted();
      if (appendMode) {
        // Multi-submission: clear the form so the learner can log the next
        // observation right away. The just-saved entry appears in the history
        // list above once the refetch lands.
        setText("");
        setFormValues({});
      } else {
        setEditing(false);
      }
      setFile(null);
      setPendingFiles({});
      uploadedPaths.length = 0; // committed — leave the files in place
    } catch (err: any) {
      // If we uploaded files but the DB insert failed, roll them back so we
      // don't leave orphans in the bucket. Best-effort: a failed cleanup is
      // logged, not surfaced (the submit itself already toasted the error).
      if (uploadedPaths.length) {
        void supabase.storage.from("assignment-files").remove(uploadedPaths).catch(() => {});
      }
      toast.error(err?.message ?? "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary shrink-0">
          <Upload className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold">
            {appendMode
              ? `Log ${labels.article} ${labels.noun}`
              : isFormMode
                ? assignment.frontmatter.submit_heading ?? "Fill in your reflection"
                : "Submit your work"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isFormMode
              ? assignment.frontmatter.submit_intro ??
                "Short, specific answers beat long general ones. Submit directly here."
              : "Upload a file or paste a shareable link (Google Drive, Dropbox, Loom, etc.) in the notes."}
          </p>
        </div>
      </div>

      {assignment.frontmatter.booking_url && (
        <a
          href={assignment.frontmatter.booking_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary shrink-0">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Book your session with Leo</p>
            <p className="text-xs text-muted-foreground">
              Part of this assignment — pick a time, then tick the booking box below.
            </p>
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" />
        </a>
      )}

      {isFormMode ? (
        <div className="space-y-5">
          {formFields.map((field) => (
            <FormFieldRenderer
              key={field.label}
              field={field}
              value={formValues[field.label] ?? ""}
              onChange={(v) =>
                setFormValues((prev) => ({ ...prev, [field.label]: v }))
              }
              disabled={submitting}
              pendingFile={pendingFiles[field.label] ?? null}
              maxMb={MAX_MB}
              onFile={(f) =>
                setPendingFiles((prev) => {
                  const next = { ...prev };
                  if (f) next[field.label] = f;
                  else delete next[field.label];
                  return next;
                })
              }
            />
          ))}
          {assignment.frontmatter.file_upload !== false && (
            <AssignmentFileUpload
              file={file}
              onFile={handleFile}
              disabled={submitting}
              label="Attach a screenshot or file"
              sublabel={`(optional, max ${MAX_MB}MB)`}
            />
          )}
        </div>
      ) : (
        <>
          <AssignmentFileUpload
            file={file}
            onFile={handleFile}
            disabled={submitting}
            label="Upload file"
            sublabel={`(optional, max ${MAX_MB}MB)`}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Notes or shareable link <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste a Loom / Google Drive / Dropbox link, and any 2-3 sentence self-review."
              rows={4}
              disabled={submitting}
            />
          </div>
        </>
      )}

      {!submission && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          Your answers save automatically on this device — leave and come back any time.
        </p>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-3">
        {submission && (
          <Button variant="outline" onClick={() => setEditing(false)} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button onClick={submit} disabled={submitting} className="flex-1 gap-2">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {appendMode ? `Log this ${labels.noun}` : submission ? "Resubmit" : "Submit assignment"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function AssignmentFileUpload({
  file,
  onFile,
  disabled,
  label,
  sublabel,
}: {
  file: File | null;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  label: string;
  sublabel: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label} <span className="text-muted-foreground font-normal">{sublabel}</span>
      </label>
      <input
        ref={ref}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.mp4,.mov,.zip"
        onChange={onFile}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => ref.current?.click()}
        disabled={disabled}
        className="w-full border-dashed border-2 h-20 flex flex-col items-center justify-center gap-1"
      >
        {file ? (
          <span className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            {file.name}
          </span>
        ) : (
          <>
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Click to upload</span>
          </>
        )}
      </Button>
    </div>
  );
}

function FormFieldRenderer({
  field,
  value,
  onChange,
  disabled,
  pendingFile,
  onFile,
  maxMb,
}: {
  field: AssignmentFormField;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  pendingFile?: File | null;
  onFile?: (f: File | null) => void;
  maxMb?: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // A labelled upload slot — e.g. the Business Plan asks for one file for the
  // pledge sheet and one for the plan deck. `value` carries the URL of a file
  // kept from a previous submission so it shows as already-attached.
  if (field.kind === "file") {
    const existingUrl = value && /^https?:\/\//.test(value.trim()) ? value.trim() : null;
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">{field.label}</label>
        {field.hint && (
          <p className="text-xs text-muted-foreground whitespace-pre-wrap">{field.hint}</p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (maxMb && f.size > maxMb * 1024 * 1024) {
              toast.error(`File exceeds ${maxMb}MB limit`);
              e.target.value = "";
              return;
            }
            onFile?.(f);
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-full border-dashed border-2 h-16 flex items-center justify-center gap-2"
        >
          {pendingFile ? (
            <span className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              {pendingFile.name}
            </span>
          ) : (
            <>
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {existingUrl ? "Replace uploaded file" : "Click to upload a PDF"}
              </span>
            </>
          )}
        </Button>
        {existingUrl && !pendingFile && (
          <a
            href={existingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <FileText className="h-3.5 w-3.5" />
            View current upload
          </a>
        )}
      </div>
    );
  }

  // A "section" field is a non-input divider that breaks a long form into
  // labelled chunks (Part A / Part B / Part C) so it reads as steps, not a wall.
  if (field.kind === "section") {
    return (
      <div className="pt-4 first:pt-0">
        <div className="flex items-center gap-3">
          <h4 className="font-serif text-base font-bold text-foreground shrink-0">{field.label}</h4>
          <div className="h-px flex-1 bg-border" />
        </div>
        {field.hint && (
          <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">{field.hint}</p>
        )}
      </div>
    );
  }

  // A "check" field is a required confirmation the student ticks (e.g. "I've
  // booked a review call"). Tap toggles the stored value between "yes" and "".
  if (field.kind === "check") {
    const checked = value === "yes";
    return (
      <button
        type="button"
        onClick={() => onChange(checked ? "" : "yes")}
        disabled={disabled}
        aria-pressed={checked}
        className={cn(
          "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
          checked
            ? "border-green-500/40 bg-green-500/5"
            : "border-input bg-background hover:bg-muted/50",
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
            checked ? "border-green-600 bg-green-600 text-white" : "border-muted-foreground/40",
          )}
        >
          {checked && <Check className="h-3.5 w-3.5" />}
        </span>
        <span className="min-w-0">
          <span className="text-sm font-medium text-foreground">{field.label}</span>
          {field.hint && (
            <span className="mt-0.5 block text-xs text-muted-foreground whitespace-pre-wrap">
              {field.hint}
            </span>
          )}
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground">{field.label}</label>
      {field.hint && (
        <p className="text-xs text-muted-foreground whitespace-pre-wrap">{field.hint}</p>
      )}
      {field.kind === "text" ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={field.rows ?? 4}
          disabled={disabled}
        />
      )}
    </div>
  );
}

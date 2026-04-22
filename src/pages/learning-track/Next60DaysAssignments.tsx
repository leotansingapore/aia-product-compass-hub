import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  FileText,
  Loader2,
  Lock,
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
import { Input } from "@/components/ui/input";
import { assignmentMarkdownComponents } from "@/components/first-60-days/assignmentMarkdownComponents";
import {
  loadAllAssignments,
  FIRST_60_DAYS_REQUIRED_KEYS,
  type Assignment,
  type AssignmentFormField,
} from "@/features/next-60-days/assignments";

const PRODUCT_ID = "next-60-days-assignments";
const FIRST_60_PRODUCT_ID = "first-60-days-assignments";

const ICON_MAP: Record<string, typeof Video> = {
  video: Video,
  users: Users,
  eye: Eye,
  "book-open": BookOpen,
  clipboard: ClipboardList,
  target: Target,
};

const NUMBER_WORDS = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve",
];

function countLabel(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

type Submission = {
  id: string;
  file_name: string | null;
  file_url: string | null;
  submission_text: string | null;
  submitted_at: string | null;
};

function useAssignments() {
  return useQuery({
    queryKey: ["next60-assignments"],
    queryFn: loadAllAssignments,
    staleTime: Infinity,
  });
}

function useSubmissions(userId: string | undefined) {
  return useQuery({
    queryKey: ["next60-assignment-submissions", userId],
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

function useFirst60DaysCompletion(userId: string | undefined) {
  return useQuery({
    queryKey: ["first60-completion-gate", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return { completed: 0, total: FIRST_60_DAYS_REQUIRED_KEYS.length, locked: true };
      const { data, error } = await (supabase.from as any)("assignment_submissions")
        .select("item_id")
        .eq("product_id", FIRST_60_PRODUCT_ID)
        .eq("user_id", userId);
      if (error) throw error;
      const submittedKeys = new Set((data ?? []).map((r: any) => r.item_id as string));
      const completed = FIRST_60_DAYS_REQUIRED_KEYS.filter((k) => submittedKeys.has(k)).length;
      return {
        completed,
        total: FIRST_60_DAYS_REQUIRED_KEYS.length,
        locked: completed < FIRST_60_DAYS_REQUIRED_KEYS.length,
      };
    },
  });
}

export default function Next60DaysAssignments() {
  const { data: assignments, isLoading } = useAssignments();
  const { user } = useSimplifiedAuth();
  const { data: submissions, refetch: refetchSubmissions } = useSubmissions(user?.id);
  const { data: gate } = useFirst60DaysCompletion(user?.id);
  const { itemId } = useParams<{ itemId?: string }>();
  const navigate = useNavigate();

  const latestBySlug = useMemo(() => {
    const m: Record<string, Submission> = {};
    for (const s of submissions ?? []) {
      if (!m[s.item_id]) m[s.item_id] = s;
    }
    return m;
  }, [submissions]);

  if (isLoading || !assignments) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (gate?.locked) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400 mb-2">
            Locked
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold leading-tight text-foreground mb-4">
            Complete your First 60 Days assignments first
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Next 60 Days assignments build on the foundation of the First 60 Days. Submit all {gate?.total ?? 6} First-60-Days assignments before unlocking this track.
          </p>
          <div className="rounded-xl bg-background/80 backdrop-blur border px-4 py-3 inline-flex items-center gap-3 mb-6">
            <div className="text-3xl font-serif font-bold tabular-nums text-foreground">
              {gate?.completed ?? 0}/{gate?.total ?? 6}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-left">
              First 60 Days<br />submitted
            </div>
          </div>
          <div>
            <Button asChild>
              <Link to="/learning-track/pre-rnf/assignments">
                Go to First 60 Days assignments
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const active = itemId ? assignments.find((a) => a.slug === itemId) : null;

  if (itemId && !active) {
    return (
      <div className="max-w-3xl mx-auto rounded-xl border border-dashed bg-muted/20 p-10 text-center">
        <p className="text-sm text-muted-foreground mb-4">Assignment not found.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/learning-track/next-60-days/assignments")}>
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
        onSubmitted={() => refetchSubmissions()}
        userId={user?.id}
        totalCount={assignments.length}
      />
    );
  }

  const completedCount = assignments.filter(
    (a) => !!latestBySlug[a.frontmatter.status_key],
  ).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary mb-1.5">
              Next 60 Days · Assignments
            </p>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold leading-tight text-foreground">
              {countLabel(assignments.length)} deliverables to turn the first 60 days of your real business into a compounding practice.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Each assignment integrates multiple weeks of the module. Link back to day material any time.
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {assignments.map((a) => {
          const sub = latestBySlug[a.frontmatter.status_key];
          const Icon = ICON_MAP[a.frontmatter.icon] ?? ClipboardList;
          const submitted = !!sub;
          return (
            <Link
              key={a.slug}
              to={`/learning-track/next-60-days/assignments/${a.slug}`}
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
  onSubmitted,
  userId,
  totalCount,
}: {
  assignment: Assignment;
  submission: Submission | undefined;
  onSubmitted: () => void;
  userId: string | undefined;
  totalCount: number;
}) {
  const Icon = ICON_MAP[assignment.frontmatter.icon] ?? ClipboardList;
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/learning-track/next-60-days/assignments"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all assignments
      </Link>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="relative p-6 sm:p-8 border-b bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary shrink-0">
              <Icon className="h-7 w-7" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                Assignment {assignment.frontmatter.order} of {totalCount}
              </p>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold leading-tight text-foreground">
                {assignment.frontmatter.title}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {assignment.frontmatter.short}
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-[11px]">
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

        <div className="p-6 sm:p-8">
          <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={assignmentMarkdownComponents}>
              {assignment.markdown}
            </ReactMarkdown>
          </article>
        </div>
      </div>

      <SubmissionPanel
        assignment={assignment}
        submission={submission}
        userId={userId}
        onSubmitted={onSubmitted}
      />
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
    // Not JSON
  }
  return {};
}

function SubmissionPanel({
  assignment,
  submission,
  userId,
  onSubmitted,
}: {
  assignment: Assignment;
  submission: Submission | undefined;
  userId: string | undefined;
  onSubmitted: () => void;
}) {
  const isFormMode =
    assignment.frontmatter.submission_type === "form" &&
    !!assignment.frontmatter.form_fields?.length;
  const formFields = assignment.frontmatter.form_fields ?? [];

  const [text, setText] = useState(submission?.submission_text ?? "");
  const [formValues, setFormValues] = useState<Record<string, string>>(() =>
    parseFormValues(submission?.submission_text),
  );
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(!submission);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const parsed = parseFormValues(submission?.submission_text);
    const staleNonFormSubmission =
      isFormMode && submission && Object.keys(parsed).length === 0;
    setEditing(!submission || !!staleNonFormSubmission);
    setText(submission?.submission_text ?? "");
    setFormValues(parsed);
    setFile(null);
  }, [submission?.id, assignment.slug, isFormMode]);

  const MAX_MB = 500;

  if (submission && !editing) {
    const formValuesSnapshot = parseFormValues(submission.submission_text);
    const hasFormValues = Object.keys(formValuesSnapshot).length > 0;
    return (
      <div className="rounded-2xl border border-green-500/40 bg-green-500/5 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold">Submission received</h3>
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
              const value = formValuesSnapshot[field.label];
              if (!value) return null;
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
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          Edit & resubmit
        </Button>
      </div>
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

    let payloadText: string | null = null;
    if (isFormMode) {
      const filled = formFields.filter((f) => (formValues[f.label] ?? "").trim().length > 0);
      if (filled.length === 0) {
        toast.error("Fill in at least one field before submitting.");
        return;
      }
      payloadText = JSON.stringify(
        Object.fromEntries(
          formFields.map((f) => [f.label, (formValues[f.label] ?? "").trim()]),
        ),
      );
    } else {
      if (!file && !text.trim()) {
        toast.error("Upload a file or paste a link / notes.");
        return;
      }
      payloadText = text.trim() || null;
    }

    setSubmitting(true);
    try {
      let fileUrl: string | null = null;
      let fileName: string | null = null;
      if (!isFormMode && file) {
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${userId}/${PRODUCT_ID}/${assignment.frontmatter.status_key}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("assignment-files")
          .upload(path, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage
          .from("assignment-files")
          .getPublicUrl(path);
        fileUrl = pub.publicUrl;
        fileName = file.name;
      }
      const { error: insErr } = await (supabase.from as any)("assignment_submissions").insert({
        user_id: userId,
        product_id: PRODUCT_ID,
        item_id: assignment.frontmatter.status_key,
        submission_text: payloadText,
        file_url: fileUrl,
        file_name: fileName,
      });
      if (insErr) throw insErr;
      toast.success("Assignment submitted");
      onSubmitted();
      setEditing(false);
      setFile(null);
    } catch (err: any) {
      toast.error(err?.message ?? "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-6 sm:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary shrink-0">
          <Upload className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold">
            {isFormMode ? "Fill in your reflection" : "Submit your work"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isFormMode
              ? "Short, specific answers beat long general ones."
              : "Upload a file or paste a shareable link (Google Drive, Dropbox, Loom, etc.)."}
          </p>
        </div>
      </div>

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
            />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Upload file <span className="text-muted-foreground font-normal">(optional, max {MAX_MB}MB)</span>
            </label>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.mp4,.mov,.zip"
              onChange={handleFile}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={submitting}
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

      <div className="flex gap-3">
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
              {submission ? "Resubmit" : "Submit assignment"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function FormFieldRenderer({
  field,
  value,
  onChange,
  disabled,
}: {
  field: AssignmentFormField;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
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

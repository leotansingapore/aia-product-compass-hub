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
  type Assignment,
  type AssignmentFormField,
} from "@/features/first-60-days/assignments";
import { DAY_SUMMARIES } from "@/features/first-60-days/summaries";

const PRODUCT_ID = "first-60-days-assignments";

const ICON_MAP: Record<string, typeof Video> = {
  video: Video,
  users: Users,
  eye: Eye,
  "book-open": BookOpen,
  clipboard: ClipboardList,
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

  if (isLoading || !assignments) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const active = itemId ? assignments.find((a) => a.slug === itemId) : null;

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
        onSubmitted={() => refetchSubmissions()}
        userId={user?.id}
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
              First 60 Days · Assignments
            </p>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold leading-tight text-foreground">
              Four deliverables to prove you're ready for the field.
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {assignments.map((a) => {
          const sub = latestBySlug[a.frontmatter.status_key];
          const Icon = ICON_MAP[a.frontmatter.icon] ?? ClipboardList;
          const submitted = !!sub;
          return (
            <Link
              key={a.slug}
              to={`/learning-track/pre-rnf/assignments/${a.slug}`}
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
}: {
  assignment: Assignment;
  submission: Submission | undefined;
  onSubmitted: () => void;
  userId: string | undefined;
}) {
  const Icon = ICON_MAP[assignment.frontmatter.icon] ?? ClipboardList;
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/learning-track/pre-rnf/assignments"
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
                Assignment {assignment.frontmatter.order} of 4
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

        <div className="p-6 sm:p-8 border-b space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
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
                  <span className="text-foreground/80 group-hover:text-foreground truncate max-w-[180px]">
                    {s?.title ?? `Day ${d}`}
                  </span>
                </a>
              );
            })}
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
    // Not JSON — probably free-text submission, ignore for form mode
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
    setEditing(!submission);
    setText(submission?.submission_text ?? "");
    setFormValues(parseFormValues(submission?.submission_text));
    setFile(null);
  }, [submission?.id, assignment.slug]);

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
              ? "Short, specific answers beat long general ones. Submit directly here."
              : "Upload a file or paste a shareable link (Google Drive, Dropbox, Loom, etc.) in the notes."}
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
        <p className="text-xs text-muted-foreground">{field.hint}</p>
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

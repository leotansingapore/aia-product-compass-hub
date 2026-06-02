import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileText, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PRODUCT_ID = "first-60-days-assignments";

type PeerRow = {
  id: string;
  user_id: string;
  file_url: string | null;
  file_name: string | null;
  submission_text: string | null;
  submitted_at: string | null;
};

function isImage(url: string | null, name: string | null): boolean {
  const s = `${url ?? ""} ${name ?? ""}`.toLowerCase();
  return /\.(png|jpe?g|webp|gif|avif)(\?|$)/.test(s);
}

function looksLikeUrl(text: string | null): boolean {
  return !!text && /^https?:\/\/\S+$/i.test(text.trim());
}

/** Form submissions store a JSON map of {label: value}. Returns the readable
 *  text answers, dropping confirmation checkboxes (stored as "yes"). */
function parseFormAnswers(text: string | null): { label: string; value: string }[] | null {
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.entries(parsed)
        .map(([label, v]) => ({ label, value: typeof v === "string" ? v : String(v ?? "") }))
        .filter((e) => e.value.trim().length > 0 && e.value.trim() !== "yes");
    }
  } catch {
    // Not JSON — a plain-text / link submission.
  }
  return null;
}

function PeerCard({ row, variant }: { row: PeerRow; variant: "image" | "text" }) {
  const when = row.submitted_at ? new Date(row.submitted_at).toLocaleDateString() : null;
  const answers = parseFormAnswers(row.submission_text);

  // Vision-board style: prefer the uploaded image, then a PDF/link, then text.
  if (variant === "image") {
    if (isImage(row.file_url, row.file_name) && row.file_url) {
      return (
        <a
          href={row.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/40"
        >
          <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
            <img
              src={row.file_url}
              alt="A teammate's vision board"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
          <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
            <span>A teammate</span>
            {when && <span>{when}</span>}
          </div>
        </a>
      );
    }
    const link = row.file_url ?? (looksLikeUrl(row.submission_text) ? row.submission_text : null);
    if (link) {
      return (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-xl border bg-card p-4 text-center transition-colors hover:border-primary/40"
        >
          <ExternalLink className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium">A teammate's board</span>
          <span className="text-xs text-muted-foreground">Open the shared link</span>
        </a>
      );
    }
  }

  // Text style (CST roleplay): show the written answers.
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />A teammate
        </span>
        {when && <span>{when}</span>}
      </div>
      {answers && answers.length ? (
        <div className="space-y-2.5">
          {answers.map((a) => (
            <div key={a.label}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {a.label}
              </p>
              <p className="mt-0.5 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed">
                {a.value}
              </p>
            </div>
          ))}
        </div>
      ) : looksLikeUrl(row.submission_text) ? (
        <a
          href={row.submission_text ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          Open shared link
        </a>
      ) : (
        <p className="line-clamp-6 whitespace-pre-wrap text-sm leading-relaxed">
          {row.submission_text}
        </p>
      )}
    </div>
  );
}

/**
 * Shows other students' submissions for an assignment, once the current student
 * has submitted their own. Reads are owner-only by default — the cohort-visible
 * rows depend on the `assignment_submissions_cohort_select` RLS policy (see
 * SUPABASE.md); until that lands this renders the "first to share" empty state
 * for non-admins.
 */
export default function PeerSubmissionsGallery({
  statusKey,
  userId,
  variant,
}: {
  statusKey: string;
  userId: string | undefined;
  variant: "image" | "text";
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["peer-submissions", statusKey, userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("assignment_submissions")
        .select("id, user_id, file_url, file_name, submission_text, submitted_at")
        .eq("product_id", PRODUCT_ID)
        .eq("item_id", statusKey)
        .neq("user_id", userId)
        .order("submitted_at", { ascending: false })
        .limit(48);
      if (error) throw error;
      return (data ?? []) as PeerRow[];
    },
  });

  if (isLoading) return null;
  const rows = data ?? [];

  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary shrink-0">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold">What your cohort shared</h3>
          <p className="text-xs text-muted-foreground">
            {rows.length > 0
              ? `${rows.length} teammate${rows.length === 1 ? "" : "s"} have submitted theirs — see what they put down.`
              : "Unlocked because you submitted yours."}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
          You're one of the first to share here. Check back soon to see what your teammates put on theirs.
        </p>
      ) : (
        <div
          className={
            variant === "image"
              ? "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"
              : "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
          }
        >
          {rows.map((row) => (
            <PeerCard key={row.id} row={row} variant={variant} />
          ))}
        </div>
      )}
    </div>
  );
}

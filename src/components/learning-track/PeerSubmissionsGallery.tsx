import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PRODUCT_ID = "first-60-days-assignments";

type PeerRow = {
  id: string;
  user_id: string;
  file_url: string | null;
  file_name: string | null;
  submission_text: string | null;
  submitted_at: string | null;
  hidden_from_gallery?: boolean | null;
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

function PeerCard({
  row,
  variant,
  name,
}: {
  row: PeerRow;
  variant: "image" | "text";
  name: string;
}) {
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
              alt={`${name}'s vision board`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
          <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
            <span className="truncate font-medium text-foreground/80">{name}</span>
            {when && <span className="shrink-0 pl-2">{when}</span>}
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
          <span className="text-sm font-medium">{name}'s board</span>
          <span className="text-xs text-muted-foreground">Open the shared link</span>
        </a>
      );
    }
  }

  // Text style (CST roleplay / 100 whys): show the written answers.
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 truncate font-medium text-foreground/80">
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{name}</span>
        </span>
        {when && <span className="shrink-0 pl-2">{when}</span>}
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

/** Admin card: shows whatever the submission holds (image / file / link / text
 *  answers), the hidden state, and a one-tap hide/show toggle. Used on every
 *  assignment page when an admin is viewing — even in "view as student" mode. */
function AdminCard({
  row,
  name,
  busy,
  onToggle,
}: {
  row: PeerRow;
  name: string;
  busy: boolean;
  onToggle: () => void;
}) {
  const when = row.submitted_at ? new Date(row.submitted_at).toLocaleString() : null;
  const answers = parseFormAnswers(row.submission_text);
  const img = isImage(row.file_url, row.file_name) ? row.file_url : null;
  const fileLink = !img && row.file_url ? row.file_url : null;
  const textLink = looksLikeUrl(row.submission_text);
  const hidden = !!row.hidden_from_gallery;

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="truncate text-sm font-semibold text-foreground">{name}</span>
        <div className="flex shrink-0 items-center gap-2">
          {hidden && (
            <Badge variant="outline" className="text-[10px] font-semibold uppercase">
              Hidden
            </Badge>
          )}
          {when && <span className="text-[11px] text-muted-foreground">{when}</span>}
        </div>
      </div>

      {img && (
        <a href={img} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={img}
            alt={`${name}'s submission`}
            loading="lazy"
            className="max-h-64 w-full rounded-lg border bg-muted object-contain"
          />
        </a>
      )}
      {fileLink && (
        <a
          href={fileLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs hover:bg-muted/60"
        >
          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="truncate">{row.file_name ?? "Open file"}</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
        </a>
      )}

      {answers && answers.length ? (
        <div className="space-y-2.5">
          {answers.map((a) => (
            <div key={a.label}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {a.label}
              </p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed">{a.value}</p>
            </div>
          ))}
        </div>
      ) : textLink ? (
        <a
          href={row.submission_text ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          Open shared link
        </a>
      ) : row.submission_text && !img ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{row.submission_text}</p>
      ) : null}

      <Button
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={onToggle}
        className="mt-1 gap-1.5 self-start"
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : hidden ? (
          <Eye className="h-3.5 w-3.5" />
        ) : (
          <EyeOff className="h-3.5 w-3.5" />
        )}
        {hidden ? "Show to cohort" : "Hide from cohort"}
      </Button>
    </div>
  );
}

async function resolveNames(rows: PeerRow[]): Promise<Record<string, string>> {
  const names: Record<string, string> = {};
  const ids = Array.from(new Set(rows.map((r) => r.user_id)));
  if (!ids.length) return names;
  const { data: nameRows } = await (supabase.rpc as any)("get_cohort_display_names", {
    p_user_ids: ids,
  });
  if (Array.isArray(nameRows)) {
    for (const n of nameRows) {
      const nm = (n?.display_name ?? "").trim();
      if (nm) names[n.user_id] = nm;
    }
  }
  return names;
}

/**
 * Peer submissions for an assignment.
 *
 * - **Student mode** (default): shows other students' non-hidden submissions for
 *   the gallery assignments, once the viewer has submitted their own. Cross-user
 *   reads come from the `assignment_submissions_cohort_select` RLS policy; names
 *   from the `get_cohort_display_names` RPC (display_name only).
 * - **Admin mode** (`admin`): shows EVERY submission for the assignment (incl.
 *   hidden + the admin's own), on any assignment page, with a hide/show toggle.
 *   Backed by the `assignment_submissions_admin_select` / `_admin_update` policies.
 */
export default function PeerSubmissionsGallery({
  statusKey,
  userId,
  variant,
  admin = false,
}: {
  statusKey: string;
  userId: string | undefined;
  variant: "image" | "text";
  admin?: boolean;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["peer-submissions", statusKey, userId, admin],
    enabled: !!userId,
    queryFn: async () => {
      let q = (supabase.from as any)("assignment_submissions")
        .select("id, user_id, file_url, file_name, submission_text, submitted_at, hidden_from_gallery")
        .eq("product_id", PRODUCT_ID)
        .eq("item_id", statusKey)
        .order("submitted_at", { ascending: false })
        .limit(admin ? 300 : 48);
      // Students see everyone but themselves; admins see everyone incl. themselves.
      if (!admin) q = q.neq("user_id", userId);
      const { data, error } = await q;
      if (error) throw error;
      let rows = (data ?? []) as PeerRow[];
      // Students see one card per person (newest, since ordered desc). Admins
      // see every row, including resubmissions.
      if (!admin) {
        const seen = new Set<string>();
        rows = rows.filter((r) => (seen.has(r.user_id) ? false : (seen.add(r.user_id), true)));
      }
      const names = await resolveNames(rows);
      return { rows, names };
    },
  });

  if (isLoading) return null;
  const rows = data?.rows ?? [];
  const names = data?.names ?? {};

  const toggleHidden = async (row: PeerRow) => {
    const next = !row.hidden_from_gallery;
    setBusyId(row.id);
    const { error } = await (supabase.from as any)("assignment_submissions")
      .update({ hidden_from_gallery: next })
      .eq("id", row.id);
    setBusyId(null);
    if (error) {
      toast.error(`Couldn't update: ${error.message}`);
      return;
    }
    toast.success(next ? "Hidden from cohort" : "Shown to cohort");
    refetch();
  };

  // ---- Admin view: every submission on every assignment page ----
  if (admin) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold">All submissions · admin view</h3>
            <p className="text-xs text-muted-foreground">
              Only admins see this. {rows.length} submission{rows.length === 1 ? "" : "s"} for this
              assignment, including hidden ones. Students only ever see their cohort's non-hidden work.
            </p>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            No submissions for this assignment yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {rows.map((row) => (
              <AdminCard
                key={row.id}
                row={row}
                name={names[row.user_id] ?? row.user_id.slice(0, 8)}
                busy={busyId === row.id}
                onToggle={() => toggleHidden(row)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---- Student cohort gallery ----
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
            <PeerCard
              key={row.id}
              row={row}
              variant={variant}
              name={names[row.user_id] ?? "A teammate"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Loader2, ChevronRight } from "lucide-react";
import { useLearningTrackRoster } from "@/hooks/learning-track/useLearningTrackRoster";
import { cn } from "@/lib/utils";

function progressColor(pct: number) {
  if (pct === 0) return "bg-muted";
  if (pct < 33) return "bg-red-400";
  if (pct < 66) return "bg-amber-400";
  if (pct < 100) return "bg-green-500";
  return "bg-green-600";
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-16 shrink-0">{label}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full transition-all", progressColor(value))}
          style={{ width: `${Math.max(value, value > 0 ? 4 : 0)}%` }}
        />
      </div>
      <span className={cn("text-xs tabular-nums w-8 text-right", value === 0 ? "text-muted-foreground" : "font-medium")}>
        {value === 0 ? "—" : `${value}%`}
      </span>
    </div>
  );
}

function ProgressCell({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="relative h-2 w-24 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full transition-all", progressColor(value))}
          style={{ width: `${Math.max(value, value > 0 ? 4 : 0)}%` }}
        />
      </div>
      <span className={cn("text-xs tabular-nums", value === 0 ? "text-muted-foreground" : "font-medium")}>
        {value === 0 ? "—" : `${value}%`}
      </span>
    </div>
  );
}

export default function Roster() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useLearningTrackRoster();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load roster.
      </div>
    );
  }

  const recruits = data ?? [];
  const activeCount = recruits.filter((r) => (r.last_activity ?? null) !== null).length;
  const pendingTotal = recruits.reduce((sum, r) => sum + r.pending_submissions, 0);

  return (
    <div className="space-y-4" data-testid="admin-roster-page">
      <div className="grid gap-3 grid-cols-3">
        <StatCard label="Recruits" value={recruits.length.toString()} />
        <StatCard label="Active" value={activeCount.toString()} />
        <StatCard label="Pending" value={pendingTotal.toString()} accent={pendingTotal > 0} />
      </div>

      {recruits.length === 0 ? (
        <div className="rounded border border-dashed p-8 text-center text-sm text-muted-foreground">
          No recruits match the current filter.
        </div>
      ) : (
        <>
          {/* Mobile card layout */}
          <div className="space-y-2 md:hidden">
            {recruits.map((r) => (
              <button
                key={r.user_id}
                className="w-full rounded-lg border bg-card p-3 text-left hover:bg-muted/40 transition-colors"
                onClick={() => navigate(`/learning-track/admin/recruit/${r.user_id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm truncate mr-2">
                    {r.display_name || "(unnamed)"}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.pending_submissions > 0 && (
                      <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-900 dark:text-amber-200">
                        {r.pending_submissions} pending
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <ProgressBar value={r.pre_rnf_progress_pct} label="Pre-RNF" />
                  <ProgressBar value={r.post_rnf_progress_pct} label="Post-RNF" />
                </div>
                {r.last_activity && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Active {formatDistanceToNow(new Date(r.last_activity), { addSuffix: true })}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Desktop table layout */}
          <div className="hidden md:block overflow-x-auto rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-3 text-left font-medium w-[30%]">Name</th>
                  <th className="p-3 text-left font-medium">Pre-RNF</th>
                  <th className="p-3 text-left font-medium">Post-RNF</th>
                  <th className="p-3 text-left font-medium">Pending</th>
                  <th className="p-3 text-left font-medium">Last active</th>
                </tr>
              </thead>
              <tbody>
                {recruits.map((r) => (
                  <tr
                    key={r.user_id}
                    className="cursor-pointer border-b last:border-b-0 hover:bg-muted/40 transition-colors"
                    onClick={() => navigate(`/learning-track/admin/recruit/${r.user_id}`)}
                  >
                    <td className="p-3 font-medium truncate max-w-[220px]">
                      {r.display_name || "(unnamed)"}
                    </td>
                    <td className="p-3">
                      <ProgressCell value={r.pre_rnf_progress_pct} />
                    </td>
                    <td className="p-3">
                      <ProgressCell value={r.post_rnf_progress_pct} />
                    </td>
                    <td className="p-3">
                      {r.pending_submissions > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-900 dark:text-amber-200">
                          {r.pending_submissions}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">0</span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                      {r.last_activity
                        ? formatDistanceToNow(new Date(r.last_activity), { addSuffix: true })
                        : "Not started"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-lg border bg-card p-3 sm:p-4", accent && "border-amber-400/60")}>
      <div className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-xl sm:text-2xl font-bold", accent && "text-amber-600 dark:text-amber-400")}>
        {value}
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { useLearningTrackRoster } from "@/hooks/learning-track/useLearningTrackRoster";
import { Progress } from "@/components/ui/progress";

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

  return (
    <div className="overflow-x-auto rounded border" data-testid="admin-roster-page">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-left font-medium">Name</th>
            <th className="p-3 text-left font-medium">Pre-RNF</th>
            <th className="p-3 text-left font-medium">Post-RNF</th>
            <th className="p-3 text-left font-medium">Pending</th>
            <th className="p-3 text-left font-medium">Last active</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-muted-foreground">
                No recruits yet.
              </td>
            </tr>
          )}
          {(data ?? []).map((r) => (
            <tr
              key={r.user_id}
              className="cursor-pointer border-t hover:bg-muted/50"
              onClick={() => navigate(`/learning-track/admin/recruit/${r.user_id}`)}
            >
              <td className="p-3 font-medium">{r.display_name || "(unnamed)"}</td>
              <td className="p-3 w-40">
                <Progress value={r.pre_rnf_progress_pct} />
                <span className="text-xs text-muted-foreground">{r.pre_rnf_progress_pct}%</span>
              </td>
              <td className="p-3 w-40">
                <Progress value={r.post_rnf_progress_pct} />
                <span className="text-xs text-muted-foreground">{r.post_rnf_progress_pct}%</span>
              </td>
              <td className="p-3">{r.pending_submissions}</td>
              <td className="p-3">
                {r.last_activity
                  ? formatDistanceToNow(new Date(r.last_activity), { addSuffix: true })
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

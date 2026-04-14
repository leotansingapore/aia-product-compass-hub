import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ActivityRow {
  id: string;
  user_id: string;
  entity_type: "phase" | "item" | "content_block" | "submission";
  entity_id: string;
  action: "create" | "update" | "delete" | "duplicate" | "import";
  diff: any;
  track: string | null;
  created_at: string;
  profile?: { display_name: string | null; email: string | null } | null;
}

const ACTION_COLOR: Record<ActivityRow["action"], string> = {
  create: "text-green-600 dark:text-green-400",
  update: "text-blue-600 dark:text-blue-400",
  delete: "text-red-600 dark:text-red-400",
  duplicate: "text-purple-600 dark:text-purple-400",
  import: "text-amber-600 dark:text-amber-400",
};

function summarise(row: ActivityRow): string {
  const diff = row.diff;
  if (row.entity_type === "item") {
    const title = diff?.after?.title ?? diff?.before?.title ?? "item";
    return `${row.action} item: "${title}"`;
  }
  if (row.entity_type === "content_block") {
    const btype = diff?.after?.block_type ?? diff?.before?.block_type ?? "block";
    const title = diff?.after?.title ?? diff?.before?.title ?? "";
    return `${row.action} ${btype} block${title ? `: "${title}"` : ""}`;
  }
  return `${row.action} ${row.entity_type}`;
}

export default function Activity() {
  const { data, isLoading } = useQuery({
    queryKey: ["learning-track-activity"],
    queryFn: async (): Promise<ActivityRow[]> => {
      const { data, error } = await supabase
        .from("learning_track_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;

      const rows = (data ?? []) as ActivityRow[];
      const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, email")
          .in("id", userIds);
        const byId = new Map((profiles ?? []).map((p: any) => [p.id, p]));
        rows.forEach((r) => {
          r.profile = byId.get(r.user_id) ?? null;
        });
      }
      return rows;
    },
  });

  return (
    <div className="space-y-3" data-testid="admin-activity-page">
      <div>
        <h2 className="text-lg font-semibold">Activity log</h2>
        <p className="text-sm text-muted-foreground">
          Every edit to the learning track — who changed what, when. Latest 200 events.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : !data || data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <div className="rounded-lg border divide-y">
          {data.map((row) => (
            <div key={row.id} className="px-4 py-2.5 flex items-start gap-3 text-sm">
              <span
                className={`font-mono text-[11px] uppercase shrink-0 w-16 ${ACTION_COLOR[row.action]}`}
              >
                {row.action}
              </span>
              <div className="min-w-0 flex-1">
                <div>{summarise(row)}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {row.profile?.display_name ?? row.profile?.email ?? row.user_id.slice(0, 8)}
                  {row.track && <> · {row.track === "pre_rnf" ? "Pre-RNF" : "Post-RNF"}</>}
                  {" · "}
                  {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

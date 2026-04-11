import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useLearningTrackHeatmap, type HeatmapCell } from "@/hooks/learning-track/useLearningTrackHeatmap";
import { cn } from "@/lib/utils";

function cellColor(pct: number) {
  if (pct === 0) return "bg-muted/50 text-muted-foreground border-border";
  if (pct < 33) return "bg-red-200 dark:bg-red-950/40 text-red-900 dark:text-red-200 border-red-300";
  if (pct < 66) return "bg-amber-200 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-300";
  if (pct < 100) return "bg-green-200 dark:bg-green-950/40 text-green-900 dark:text-green-200 border-green-300";
  return "bg-green-600 text-white border-green-700";
}

interface Grid {
  phases: Array<[string, string]>;
  recruits: Array<[string, string]>;
  cells: HeatmapCell[];
}

export default function Heatmap() {
  const { data, isLoading } = useLearningTrackHeatmap();

  const grids = useMemo(() => {
    const make = (track: "pre_rnf" | "post_rnf"): Grid => {
      const cells = (data ?? []).filter((c) => c.track === track);
      const phases = Array.from(
        new Map(cells.map((c) => [c.phase_id, c.phase_title])).entries()
      );
      const recruits = Array.from(
        new Map(cells.map((c) => [c.user_id, c.display_name])).entries()
      );
      return { phases, recruits, cells };
    };
    return { pre: make("pre_rnf"), post: make("post_rnf") };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="admin-heatmap-page">
      <div className="rounded-lg border bg-card p-4 text-sm">
        <div className="font-medium mb-2">Legend</div>
        <div className="flex flex-wrap gap-3 text-xs">
          <LegendChip color="bg-muted/50 border-border text-muted-foreground" label="Not started" />
          <LegendChip color="bg-red-200 dark:bg-red-950/40 border-red-300" label="< 33%" />
          <LegendChip color="bg-amber-200 dark:bg-amber-950/40 border-amber-300" label="33–66%" />
          <LegendChip color="bg-green-200 dark:bg-green-950/40 border-green-300" label="66–99%" />
          <LegendChip color="bg-green-600 border-green-700 text-white" label="100%" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
      {(["pre", "post"] as const).map((key) => {
        const grid = grids[key];
        if (grid.recruits.length === 0) {
          return (
            <div key={key} className="rounded-lg border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold uppercase">
                {key === "pre" ? "Pre-RNF" : "Post-RNF"}
              </h3>
              <p className="text-sm text-muted-foreground">No recruits yet.</p>
            </div>
          );
        }
        return (
          <div key={key}>
            <h3 className="mb-2 text-sm font-semibold uppercase">
              {key === "pre" ? "Pre-RNF" : "Post-RNF"}
            </h3>
            <div className="overflow-x-auto rounded border">
              <table className="w-full border-collapse text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="border-b px-2 py-1 text-left">Recruit</th>
                    {grid.phases.map(([id, title], idx) => (
                      <th key={id} className="border-b px-2 py-1" title={title}>
                        P{idx + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grid.recruits.map(([uid, name]) => (
                    <tr key={uid}>
                      <td className="border-t px-2 py-1">
                        <Link
                          to={`/learning-track/admin/recruit/${uid}`}
                          className="hover:underline"
                        >
                          {name || "(unnamed)"}
                        </Link>
                      </td>
                      {grid.phases.map(([pid]) => {
                        const cell = grid.cells.find(
                          (c) => c.user_id === uid && c.phase_id === pid
                        );
                        const pct =
                          cell && cell.total_count > 0
                            ? Math.round((cell.completed_count / cell.total_count) * 100)
                            : 0;
                        return (
                          <td
                            key={pid}
                            className={cn("border-t px-2 py-1 text-center", cellColor(pct))}
                            title={cell ? `${cell.completed_count}/${cell.total_count}` : ""}
                          >
                            {pct}%
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("h-4 w-4 rounded border", color)} />
      <span>{label}</span>
    </div>
  );
}

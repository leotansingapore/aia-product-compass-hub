import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileSpreadsheet, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  WORKSHEETS,
  WORKSHEET_SLUGS,
  loadAllWorksheets,
  type WorksheetSlug,
  type WorksheetSummaryRow,
} from "@/features/pre-rnf-worksheets/worksheets";

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString();
}

export default function AdminWorksheetRoster({ enabled }: { enabled: boolean }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-worksheet-roster"],
    enabled,
    staleTime: 2 * 60_000,
    queryFn: async () => {
      const rows = await loadAllWorksheets();
      const ids = Array.from(new Set(rows.map((r) => r.userId)));
      const names: Record<string, string> = {};
      if (ids.length) {
        const { data: nameRows } = await (supabase.rpc as any)("get_cohort_display_names", {
          p_user_ids: ids,
        });
        if (Array.isArray(nameRows)) {
          for (const n of nameRows) {
            const nm = (n?.display_name ?? "").trim();
            if (nm) names[n.user_id] = nm;
          }
        }
      }
      return { rows, names };
    },
  });

  const bySlug = useMemo(() => {
    const m: Record<WorksheetSlug, WorksheetSummaryRow[]> = {
      "pledge-sheet": [],
      "business-plan": [],
    };
    for (const r of data?.rows ?? []) m[r.slug]?.push(r);
    return m;
  }, [data]);

  if (!enabled) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">In-app worksheets</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Learners who filled in the online Pledge Sheet / Business Plan. Click a name to open their
        saved worksheet (read-only).
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {WORKSHEET_SLUGS.map((slug) => {
            const rows = bySlug[slug];
            return (
              <div key={slug} className="rounded-lg border bg-card p-3">
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold">{WORKSHEETS[slug].title}</span>
                  <span className="text-[11px] text-muted-foreground">{rows.length} saved</span>
                </div>
                {rows.length === 0 ? (
                  <p className="text-xs italic text-muted-foreground">No one yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {rows.map((r) => (
                      <li key={r.userId}>
                        <Link
                          to={`/learning-track/pre-rnf/worksheets/${slug}?user=${r.userId}`}
                          className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                        >
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                            <span className="truncate">
                              {data?.names[r.userId] ?? `${r.userId.slice(0, 8)}…`}
                            </span>
                          </span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {r.filledCount} fields · {fmtDate(r.updatedAt)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

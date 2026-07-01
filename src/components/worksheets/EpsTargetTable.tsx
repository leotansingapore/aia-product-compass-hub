import { cn } from "@/lib/utils";
import { EPS_LEVELS, EPS_TABLE, money } from "@/features/pre-rnf-worksheets/recognition";
import type { WorksheetValues } from "@/features/pre-rnf-worksheets/worksheets";

// EPS target picker + the 24-month cumulative-FYC validation table for the level
// they're gunning for. The chosen level is stored under `eps_target`.
export default function EpsTargetTable({
  values,
  onChange,
  readOnly = false,
}: {
  values: WorksheetValues;
  onChange?: (id: string, value: string) => void;
  readOnly?: boolean;
}) {
  const level = values.eps_target ?? "";
  const arr = EPS_TABLE[level];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-medium text-foreground">EPS I'm gunning for:</label>
        <select
          value={level}
          disabled={readOnly}
          onChange={(e) => onChange?.("eps_target", e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Select…</option>
          {EPS_LEVELS.map((lv) => (
            <option key={lv} value={lv}>
              {money(Number(lv))} / month
            </option>
          ))}
        </select>
      </div>

      {arr && (
        <div>
          <p className="mb-1 text-xs text-muted-foreground">
            Cumulative FYC to validate {money(Number(level))}/month EPS, by month:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs" style={{ minWidth: 420 }}>
              <thead>
                <tr>
                  {["Mo", "Cumulative FYC", "Mo", "Cumulative FYC"].map((h, i) => (
                    <th
                      key={i}
                      className={cn(
                        "border bg-muted/50 px-2 py-1 text-left text-[11px] font-semibold",
                        i % 2 === 1 && "text-right",
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 12 }).map((_, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1 font-medium text-muted-foreground">{i + 1}</td>
                    <td className="border px-2 py-1 text-right tabular-nums">{money(arr[i])}</td>
                    <td className="border px-2 py-1 font-medium text-muted-foreground">{i + 13}</td>
                    <td className="border px-2 py-1 text-right tabular-nums">{money(arr[i + 12])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

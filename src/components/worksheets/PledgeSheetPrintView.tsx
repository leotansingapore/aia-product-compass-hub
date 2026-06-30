import { derivePledge, POINTS } from "@/features/pre-rnf-worksheets/pledgeCalc";
import type { WorksheetValues } from "@/features/pre-rnf-worksheets/worksheets";

// Template-styled print/PDF render of the Pledge Sheet calculator: the goals,
// the worked funnel, and the monthly / weekly point targets. Mirrors the look of
// the downloadable template PDFs (AIA red, bordered tables).
const RED = "#D31145";

export default function PledgeSheetPrintView({ values }: { values: WorksheetValues }) {
  const d = derivePledge(values);
  const g = (id: string) => (values[id] ?? "").trim();
  const money = (id: string) => {
    const n = Number(values[id] ?? "");
    return Number.isFinite(n) && n > 0 ? `S$${n.toLocaleString()}` : "—";
  };

  const strategy: Array<[string, string]> = [
    ["Target market / products focus", g("products_focus")],
    ["Methods (how I prospect)", g("methods")],
    ["Sales angles that work", g("angles_working")],
    ["Sales angles to try", g("angles_to_try")],
    ["Key touchpoints & events", g("touchpoints")],
    ["Focus strategies", g("focus_strategies")],
    ["My why", g("motivation_why")],
    ["Life better if achieved", g("life_better")],
  ].filter(([, v]) => v.length > 0) as Array<[string, string]>;

  return (
    <div className="pspv">
      <style>{`
        .pspv { font-family: "Helvetica Neue", Arial, sans-serif; color: #1a1a1a; font-size: 11px; line-height: 1.5; }
        .pspv * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
        .pspv-kicker { letter-spacing: 4px; font-size: 10px; font-weight: 700; color: ${RED}; text-transform: uppercase; }
        .pspv-title { font-size: 26px; font-weight: 800; margin: 6px 0 4px; }
        .pspv-sub { color: #444; font-size: 11.5px; margin: 0; }
        .pspv-rule { height: 3px; width: 60px; background: ${RED}; margin: 12px 0 16px; border-radius: 2px; }
        .pspv h3 { font-size: 14px; font-weight: 800; margin: 16px 0 6px; border-bottom: 2px solid ${RED}; padding-bottom: 4px; break-inside: avoid; }
        .pspv table { width: 100%; border-collapse: collapse; margin: 4px 0; break-inside: avoid; }
        .pspv th, .pspv td { border: 1px solid #c8c8c8; padding: 6px 8px; text-align: left; }
        .pspv th { background: #fbe7ec; color: #8a0c2e; font-size: 9.5px; text-transform: uppercase; letter-spacing: .4px; }
        .pspv td.lab { background: #fafafa; font-weight: 600; }
        .pspv .num { text-align: center; font-weight: 700; }
        .pspv .tot { background: #fff1f5; color: ${RED}; text-align: center; font-weight: 800; }
        .pspv .field { break-inside: avoid; margin: 6px 0; }
        .pspv .field .l { font-weight: 700; font-size: 11px; }
        .pspv .field .v { border-bottom: 1px solid #bbb; min-height: 15px; white-space: pre-wrap; padding: 1px 2px 3px; }
      `}</style>

      <div className="pspv-kicker">FINternship &middot; Pre-RNF</div>
      <div className="pspv-title">My Pledge Sheet</div>
      <p className="pspv-sub">Goals worked backwards into the weekly activity I pledge to hold.</p>
      <div className="pspv-rule" />

      <h3>Production goals</h3>
      <table>
        <thead>
          <tr>
            <th style={{ width: "34%" }}> </th>
            <th>Minimum</th>
            <th>Stretched</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="lab">Life FYC</td><td>{money("min_fyc")}</td><td>{money("stretch_fyc")}</td></tr>
          <tr><td className="lab">Avg case size</td><td>{money("min_case_size")}</td><td>{money("stretch_case_size")}</td></tr>
          <tr><td className="lab">Recognition (Clubs / MDRT)</td><td>{g("min_clubs") || "—"}</td><td>{g("stretch_clubs") || "—"}</td></tr>
        </tbody>
      </table>

      <h3>My target activities {d.hasGoal ? `(FYC S$${d.fycGoal.toLocaleString()} over ${d.months} months)` : ""}</h3>
      <table>
        <thead>
          <tr>
            <th>Funnel (annual)</th>
            <th style={{ width: "22%" }}>Conversion</th>
            <th style={{ width: "22%" }}>Target</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="lab">Life Cases</td><td>FYC ÷ {money("avg_case_size")}</td><td className="num">{d.hasGoal ? d.annual.cases : "—"}</td></tr>
          <tr><td className="lab">Closing Appts</td><td>× {d.closingRate} per sale</td><td className="num">{d.hasGoal ? d.annual.closings : "—"}</td></tr>
          <tr><td className="lab">Opening Appts</td><td>× {d.openingToClosing} per closing</td><td className="num">{d.hasGoal ? d.annual.openings : "—"}</td></tr>
          <tr><td className="lab">Appt Sets</td><td>× {d.setToOpening} per opening</td><td className="num">{d.hasGoal ? d.annual.sets : "—"}</td></tr>
        </tbody>
      </table>

      <h3>Pledge targets — over {d.months} months</h3>
      <table>
        <thead>
          <tr>
            <th>I must achieve…</th>
            <th>Sets ({POINTS.set}pt)</th>
            <th>Openings ({POINTS.opening}pts)</th>
            <th>Closings ({POINTS.closing}pts)</th>
            <th>Cases ({POINTS.closed}pts)</th>
            <th>Total Points</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="lab">Monthly</td>
            <td className="num">{d.hasGoal ? d.monthly.sets : "—"}</td>
            <td className="num">{d.hasGoal ? d.monthly.openings : "—"}</td>
            <td className="num">{d.hasGoal ? d.monthly.closings : "—"}</td>
            <td className="num">{d.hasGoal ? d.monthly.cases : "—"}</td>
            <td className="tot">{d.hasGoal ? d.monthlyPoints : "—"}</td>
          </tr>
          <tr>
            <td className="lab">Weekly</td>
            <td className="num">{d.hasGoal ? d.weekly.sets : "—"}</td>
            <td className="num">{d.hasGoal ? d.weekly.openings : "—"}</td>
            <td className="num">{d.hasGoal ? d.weekly.closings : "—"}</td>
            <td className="num">{d.hasGoal ? d.weekly.cases : "—"}</td>
            <td className="tot">{d.hasGoal ? d.weeklyPoints : "—"}</td>
          </tr>
        </tbody>
      </table>

      {(g("business_goal_1") || g("personal_goal_1")) && (
        <>
          <h3>Business &amp; personal goals</h3>
          <table>
            <thead>
              <tr><th>Top 3 business goals</th><th>Top 3 personal goals</th></tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i}>
                  <td>{g(`business_goal_${i}`) || "—"}</td>
                  <td>{g(`personal_goal_${i}`) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {strategy.length > 0 && (
        <>
          <h3>Strategy &amp; mindset</h3>
          {strategy.map(([label, v]) => (
            <div key={label} className="field">
              <div className="l">{label}</div>
              <div className="v">{v}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

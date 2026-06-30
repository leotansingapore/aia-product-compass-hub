import type { ReactNode } from "react";
import { derivePledge, POINTS } from "@/features/pre-rnf-worksheets/pledgeCalc";
import { personName, schemeFor } from "@/features/pre-rnf-worksheets/customize";
import type { WorksheetValues } from "@/features/pre-rnf-worksheets/worksheets";

// Print/PDF render of the Pledge Sheet, styled to match the official
// "MY PLEDGE SHEET" template: accent left-label blocks for the goals, black
// bands for the activity sections, bordered tables. Adds the calculator's
// Goals & Targets and Strategy fields; the redundant "Previous Year" section is
// dropped. Accent colour + name come from the learner's personalisation.
const INK = "#111111";

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export default function PledgeSheetPrintView({ values }: { values: WorksheetValues }) {
  const RED = schemeFor(values).accent;
  const name = personName(values);
  const d = derivePledge(values);
  const g = (id: string) => (values[id] ?? "").trim();
  const money = (id: string) => {
    const n = Number(values[id] ?? "");
    return Number.isFinite(n) && n > 0 ? `S$${n.toLocaleString()}` : "";
  };
  const lifeCases = (fycId: string, csId: string) => {
    const f = Number(values[fycId] ?? "");
    const c = Number(values[csId] ?? "");
    return f > 0 && c > 0 ? String(Math.round(f / c)) : "";
  };
  const daily = {
    sets: round1(d.weekly.sets / 5),
    openings: round1(d.weekly.openings / 5),
    closings: round1(d.weekly.closings / 5),
    cases: round1(d.weekly.cases / 5),
  };

  const strategy: Array<[string, string]> = (
    [
      ["Target market / products focus", g("products_focus")],
      ["Methods (how I prospect)", g("methods")],
      ["Sales angles that work", g("angles_working")],
      ["Sales angles to try", g("angles_to_try")],
      ["Key touchpoints & events", g("touchpoints")],
      ["Focus strategies", g("focus_strategies")],
      ["My motivation — why", g("motivation_why")],
      ["How life gets better", g("life_better")],
      ["Consequence if I don't", g("consequence")],
      ["New skills I need", g("new_skills")],
    ] as Array<[string, string]>
  ).filter(([, v]) => v.length > 0);

  const funnelRows: Array<{ text: ReactNode; num: string; label: string }> = [
    {
      text: (
        <>
          Based on an Average Case Size (FYC) of <b>{money("avg_case_size") || "S$____"}</b>, I must close
        </>
      ),
      num: d.hasGoal ? String(d.annual.cases) : "",
      label: "Life Cases",
    },
    {
      text: (
        <>
          Based on ONE Sale from <b>{d.closingRate}</b> Closing Interviews <span className="hint">(New FSC: 3, Club FSC: 2)</span>, I must have at least
        </>
      ),
      num: d.hasGoal ? String(d.annual.closings) : "",
      label: "Closing Interviews",
    },
    {
      text: (
        <>
          Based on ONE Closing from <b>{d.openingToClosing}</b> Opening Interviews <span className="hint">(New FSC: 2.5, Club FSC: 2)</span>, I must have at least
        </>
      ),
      num: d.hasGoal ? String(d.annual.openings) : "",
      label: "Opening Interviews",
    },
    {
      text: (
        <>
          Based on ONE Opening from <b>{d.setToOpening}</b> New Approaches <span className="hint">(Cold Leads: 5, New FSC: 3, Club FSC: 1.5)</span>, I must have at least
        </>
      ),
      num: d.hasGoal ? String(d.annual.sets) : "",
      label: "Approaches / Sets",
    },
  ];

  return (
    <div className="psv">
      <style>{`
        .psv { font-family: "Helvetica Neue", Arial, sans-serif; color: ${INK}; font-size: 14px; line-height: 1.45; }
        .psv * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
        .psv-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
        .psv-title { font-size: 36px; font-weight: 800; letter-spacing: 1px; }
        .psv-title .out { color: #9a9a9a; -webkit-text-stroke: 1.4px ${INK}; }
        .psv-title .red { color: ${RED}; }
        .psv-name { font-size: 15px; font-weight: 700; color: ${RED}; margin-top: 3px; }
        .psv-tag { text-align: right; font-weight: 800; font-size: 13px; line-height: 1.15; }
        .psv-tag .red { color: ${RED}; }
        .psv table { width: 100%; border-collapse: collapse; margin: 0 0 16px; break-inside: avoid; }
        .psv td, .psv th { border: 1px solid #222; padding: 7px 10px; vertical-align: middle; }
        .redlabel { background: ${RED}; color: #fff; font-weight: 800; font-size: 15px; width: 140px; text-align: center; vertical-align: middle; }
        .colhdr { background: #f0f0f0; font-weight: 800; text-align: center; text-transform: uppercase; font-size: 12px; letter-spacing: .5px; }
        .rowname { font-weight: 600; width: 38%; }
        .cell { height: 28px; text-align: center; }
        .auto { background: #fafafa; }
        .blackband { background: ${INK}; color: #fff; font-weight: 800; text-transform: uppercase; letter-spacing: .6px; font-size: 14px; padding: 8px 12px; margin: 16px 0 0; break-inside: avoid; }
        .funnel { margin-top: 0; }
        .funnel td.ftext { width: 70%; font-size: 14px; }
        .funnel td.ftext .hint { color: #777; font-size: 11px; }
        .funnel td.fnum { text-align: center; font-size: 28px; font-weight: 800; width: 13%; }
        .funnel td.flabel { text-align: center; font-weight: 700; font-size: 12px; color: #333; }
        .targets th { background: ${INK}; color: #fff; text-align: center; font-size: 11.5px; text-transform: uppercase; letter-spacing: .3px; }
        .targets td.num { text-align: center; font-weight: 800; font-size: 17px; }
        .targets td.rl { background: #f0f0f0; font-weight: 800; font-size: 13px; }
        .targets td.tot { text-align: center; font-weight: 800; color: ${RED}; font-size: 17px; background: #fff4f4; }
        .redband { background: ${RED}; color: #fff; font-weight: 800; text-transform: uppercase; letter-spacing: .6px; font-size: 14px; padding: 8px 12px; margin: 18px 0 9px; break-inside: avoid; }
        .strat { break-inside: avoid; margin: 9px 0; }
        .strat .l { font-weight: 800; font-size: 13px; }
        .strat .v { border-bottom: 1px solid #aaa; min-height: 18px; white-space: pre-wrap; padding: 2px 2px 4px; font-size: 13.5px; }
        .goalrow td { height: 28px; }
      `}</style>

      <div className="psv-head">
        <div>
          <div className="psv-title">
            <span>MY </span>
            <span className="out">PLEDGE </span>
            <span className="red">SHEET</span>
          </div>
          {name && <div className="psv-name">{name}</div>}
        </div>
        <div className="psv-tag">
          <div>TOGETHER</div>
          <div>WE ARE</div>
          <div className="red">POSSIBLE</div>
        </div>
      </div>

      {/* ── Production Goals ── */}
      <table>
        <tbody>
          <tr>
            <td className="redlabel" rowSpan={5}>My Current Year Production Goals</td>
            <td className="colhdr"> </td>
            <td className="colhdr">Minimum</td>
            <td className="colhdr">Stretched</td>
          </tr>
          <tr>
            <td className="rowname">Life FYC</td>
            <td className="cell">{money("min_fyc")}</td>
            <td className="cell">{money("stretch_fyc")}</td>
          </tr>
          <tr>
            <td className="rowname">Average Case Size (FYC)</td>
            <td className="cell">{money("min_case_size")}</td>
            <td className="cell">{money("stretch_case_size")}</td>
          </tr>
          <tr>
            <td className="rowname">Life Cases <span style={{ color: "#888", fontWeight: 400 }}>(auto)</span></td>
            <td className="cell auto">{lifeCases("min_fyc", "min_case_size")}</td>
            <td className="cell auto">{lifeCases("stretch_fyc", "stretch_case_size")}</td>
          </tr>
          <tr>
            <td className="rowname">Clubs / MDRT / Recognition</td>
            <td className="cell">{g("min_clubs")}</td>
            <td className="cell">{g("stretch_clubs")}</td>
          </tr>
        </tbody>
      </table>

      {/* ── Current Year Goals ── */}
      <table>
        <tbody>
          <tr>
            <td className="redlabel" rowSpan={4}>My Current Year Goals</td>
            <td className="colhdr" style={{ width: "8%" }}> </td>
            <td className="colhdr">Business</td>
            <td className="colhdr">Personal</td>
          </tr>
          {[1, 2, 3].map((i) => (
            <tr key={i} className="goalrow">
              <td className="cell" style={{ fontWeight: 700 }}>{i}</td>
              <td>{g(`business_goal_${i}`)}</td>
              <td>{g(`personal_goal_${i}`)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Targeted Activities ── */}
      <div className="blackband">
        My Targeted Activities Based on {d.hasGoal ? `S$${d.fycGoal.toLocaleString()} FYC` : "My Goal"}
      </div>
      <table className="funnel">
        <tbody>
          {funnelRows.map((r, i) => (
            <tr key={i}>
              <td className="ftext">{r.text}</td>
              <td className="fnum">{r.num || "—"}</td>
              <td className="flabel">{r.label}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Activity targets table ── */}
      <div className="blackband">
        I Target To Achieve The Following Over {d.months} Months
      </div>
      <table className="targets">
        <thead>
          <tr>
            <th style={{ width: "22%" }}>I MUST!!!</th>
            <th>Sets ({POINTS.set}pt)</th>
            <th>Openings ({POINTS.opening}pts)</th>
            <th>Closings ({POINTS.closing}pts)</th>
            <th>Cases ({POINTS.closed}pts)</th>
            <th>Total Points</th>
          </tr>
        </thead>
        <tbody>
          {([
            { label: "Targeted Monthly", t: d.monthly, p: d.monthlyPoints },
            { label: "Targeted Weekly", t: d.weekly, p: d.weeklyPoints },
            {
              label: "Targeted Daily",
              t: daily,
              p: round1(daily.sets * POINTS.set + daily.openings * POINTS.opening + daily.closings * POINTS.closing + daily.cases * POINTS.closed),
            },
          ] as const).map((row) => (
            <tr key={row.label}>
              <td className="rl">{row.label}</td>
              <td className="num">{d.hasGoal ? row.t.sets : "—"}</td>
              <td className="num">{d.hasGoal ? row.t.openings : "—"}</td>
              <td className="num">{d.hasGoal ? row.t.closings : "—"}</td>
              <td className="num">{d.hasGoal ? row.t.cases : "—"}</td>
              <td className="tot">{d.hasGoal ? row.p : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Strategy & mindset ── */}
      {strategy.length > 0 && (
        <>
          <div className="redband">My Strategy &amp; Mindset</div>
          {strategy.map(([label, v]) => (
            <div key={label} className="strat">
              <div className="l">{label}</div>
              <div className="v">{v}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// Pledge-sheet funnel maths, ported from engage-point-play's PledgeSheetContent.
// FYC goal works backwards through the conversion funnel to the annual and then
// monthly / weekly activity targets, and scores them on the points system.
import type { WorksheetValues } from "./worksheets";

export const POINTS = { set: 1, opening: 3, closing: 4, closed: 5 } as const;

export const PLEDGE_DEFAULTS = {
  closing_rate: 3, // closing interviews per sale
  opening_to_closing_rate: 2.5, // opening interviews per closing
  set_to_opening_rate: 5, // set appointments per opening
  months: 12,
};

export function num(values: WorksheetValues, id: string, fallback = 0): number {
  const raw = values[id];
  if (raw == null || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
function ceil(n: number) {
  return Math.ceil(n);
}

export type Funnel = { cases: number; closings: number; openings: number; sets: number };

export function calcFunnel(
  fycGoal: number,
  avgCaseSize: number,
  closingRate: number,
  openingToClosingRate: number,
  setToOpeningRate: number,
): Funnel {
  const cases = avgCaseSize > 0 ? fycGoal / avgCaseSize : 0;
  const closings = cases * closingRate;
  const openings = closings * openingToClosingRate;
  const sets = openings * setToOpeningRate;
  return { cases: ceil(cases), closings: ceil(closings), openings: ceil(openings), sets: ceil(sets) };
}

export function calcTargets(annual: Funnel, months: number) {
  const m = months > 0 ? months : 12;
  const monthly = (v: number) => round1(v / m);
  const weekly = (v: number) => round1(v / m / 4);
  return {
    monthly: {
      sets: monthly(annual.sets),
      openings: monthly(annual.openings),
      closings: monthly(annual.closings),
      cases: monthly(annual.cases),
    },
    weekly: {
      sets: weekly(annual.sets),
      openings: weekly(annual.openings),
      closings: weekly(annual.closings),
      cases: weekly(annual.cases),
    },
  };
}

export function calcPoints(sets: number, openings: number, closings: number, cases: number) {
  return round1(
    sets * POINTS.set + openings * POINTS.opening + closings * POINTS.closing + cases * POINTS.closed,
  );
}

/** Everything the calculator UI and the print view need, derived from values. */
export function derivePledge(values: WorksheetValues) {
  const fycGoal = num(values, "fyc_goal");
  const avgCaseSize = num(values, "avg_case_size");
  const months = num(values, "months", PLEDGE_DEFAULTS.months);
  const closingRate = num(values, "closing_rate", PLEDGE_DEFAULTS.closing_rate);
  const openingToClosing = num(values, "opening_to_closing_rate", PLEDGE_DEFAULTS.opening_to_closing_rate);
  const setToOpening = num(values, "set_to_opening_rate", PLEDGE_DEFAULTS.set_to_opening_rate);
  const hasGoal = fycGoal > 0 && avgCaseSize > 0;
  const annual = calcFunnel(fycGoal, avgCaseSize, closingRate, openingToClosing, setToOpening);
  const { monthly, weekly } = calcTargets(annual, months);
  return {
    fycGoal,
    avgCaseSize,
    months,
    closingRate,
    openingToClosing,
    setToOpening,
    hasGoal,
    annual,
    monthly,
    weekly,
    monthlyPoints: calcPoints(monthly.sets, monthly.openings, monthly.closings, monthly.cases),
    weeklyPoints: calcPoints(weekly.sets, weekly.openings, weekly.closings, weekly.cases),
  };
}

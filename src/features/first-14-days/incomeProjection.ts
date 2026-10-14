// Ported from growing-age-calculator src/pages/IncomeCalculatorPage.tsx (its
// /income-calculator), minus the per-cell overrides. Keep the rates in step
// with that file when AIA's schedule changes.

export interface IncomeInputs {
  averageFyc: number;
  annualPremium: number;
  monthlyEps: number;
  annualPaPremium: number;
  annualGrowthRate: number;
  years: number;
}

export interface YearIncome {
  year: number;
  fyc: number;
  eps: number;
  spi: number;
  ai: number;
  renewals: number;
  careerBenefit: number;
  apf: number;
  paCommission: number;
  active: number;
  passive: number;
  total: number;
}

export const DEFAULT_INCOME_INPUTS: IncomeInputs = {
  averageFyc: 36000,
  annualPremium: 2400,
  monthlyEps: 3000,
  annualPaPremium: 5000,
  annualGrowthRate: 0,
  years: 11,
};

const SPI_TIERS: [number, number][] = [
  [80000, 0.36], [70000, 0.355], [60000, 0.35], [50000, 0.34], [45000, 0.32], [40000, 0.3],
  [35000, 0.27], [30000, 0.23], [25000, 0.2], [20000, 0.17], [15000, 0.14],
];

export function spiRate(fyc: number, year: number): number {
  const tier = SPI_TIERS.find(([floor]) => fyc >= floor);
  if (tier) return tier[1];
  // New consultants (years 1-2) also get 8% on S$5,000-14,999.
  return year <= 2 && fyc >= 5000 ? 0.08 : 0;
}

const RENEWAL_RATES = [0.15, 0.08, 0.05, 0.05, 0.015]; // 1 to 5 years back

function careerBonusRate(year: number): number {
  if (year >= 11) return 1;
  if (year >= 9) return 0.95;
  if (year >= 6) return 0.9;
  if (year >= 3) return 0.8;
  return 0;
}

export function projectIncome(inputs: IncomeInputs): YearIncome[] {
  const { averageFyc, annualPremium, monthlyEps, annualPaPremium, annualGrowthRate, years } = inputs;
  const fycIn = (year: number) => averageFyc * Math.pow(1 + annualGrowthRate / 100, year - 1);
  // FYC is 35% of first-year premium, so FYC / (premium x 35%) is policies sold.
  const policiesIn = (year: number) => (annualPremium > 0 ? fycIn(year) / (annualPremium * 0.35) : 0);

  return Array.from({ length: years }, (_, i) => {
    const year = i + 1;
    const fyc = fycIn(year);
    const spi = fyc * spiRate(fyc, year);
    const ai = fyc * 0.05;
    const eps = year <= 2 ? monthlyEps * 12 : 0;
    const renewals = RENEWAL_RATES.reduce(
      (sum, rate, back) => (year > back + 1 ? sum + rate * annualPremium * policiesIn(year - back - 1) : sum),
      0,
    );
    const careerBenefit = renewals * careerBonusRate(year);
    let apf = 0;
    for (let past = 1; past <= year - 6; past++) apf += 0.02 * annualPremium * policiesIn(past);
    const paCommission = annualPaPremium * 0.3 * year;
    const active = fyc + eps + spi + ai;
    const passive = renewals + careerBenefit + apf + paCommission;
    return { year, fyc, eps, spi, ai, renewals, careerBenefit, apf, paCommission, active, passive, total: active + passive };
  });
}

import { describe, expect, it } from "vitest";
import { DEFAULT_INCOME_INPUTS, projectIncome, spiRate } from "./incomeProjection";

// Figures worked by hand from growing-age-calculator's IncomeCalculatorPage formulas.
describe("projectIncome", () => {
  const rows = projectIncome(DEFAULT_INCOME_INPUTS);

  it("year 1 is all new business plus one year of PA commission", () => {
    expect(rows[0]).toMatchObject({ fyc: 36000, eps: 36000, spi: 9720, ai: 1800, renewals: 0, paCommission: 1500 });
    expect(rows[0].total).toBeCloseTo(85020);
  });

  it("renewals start in year 2, EPS stops after year 2, career benefit from year 3", () => {
    expect(rows[1].renewals).toBeCloseTo(15428.57, 1);
    expect(rows[1].careerBenefit).toBe(0);
    expect(rows[2].eps).toBe(0);
    expect(rows[2].careerBenefit).toBeCloseTo(rows[2].renewals * 0.8);
  });

  it("year 7 has all five renewal years, 90% career benefit and the first APF", () => {
    const y7 = rows[6];
    expect(y7.renewals).toBeCloseTo(35485.71, 1);
    expect(y7.careerBenefit).toBeCloseTo(31937.14, 1);
    expect(y7.apf).toBeCloseTo(2057.14, 1);
    expect(y7.passive).toBeCloseTo(y7.renewals + y7.careerBenefit + y7.apf + 10500);
  });

  it("gives new consultants 8% SPI on small FYC, later years nothing", () => {
    expect(spiRate(10000, 1)).toBe(0.08);
    expect(spiRate(10000, 3)).toBe(0);
    expect(spiRate(4999, 1)).toBe(0);
    expect(spiRate(80000, 5)).toBe(0.36);
  });

  it("returns one row per year asked for", () => {
    expect(projectIncome({ ...DEFAULT_INCOME_INPUTS, years: 20 })).toHaveLength(20);
  });
});

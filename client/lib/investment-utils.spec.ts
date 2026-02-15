import { describe, it, expect } from "vitest";
import { calculateCompoundInterest, calculateROI } from "./investment-utils";

describe("calculateCompoundInterest", () => {
  it("returns initial data point at year 0", () => {
    const result = calculateCompoundInterest({
      initialAmount: 1000,
      monthlyContribution: 0,
      annualReturn: 0,
      inflationRate: 0,
      years: 0,
    });
    expect(result).toHaveLength(1);
    expect(result[0].year).toBe(0);
    expect(result[0].total).toBe(1000);
    expect(result[0].principal).toBe(1000);
    expect(result[0].interest).toBe(0);
  });

  it("calculates with initial amount only (no contributions)", () => {
    const result = calculateCompoundInterest({
      initialAmount: 10000,
      monthlyContribution: 0,
      annualReturn: 10,
      inflationRate: 0,
      years: 1,
    });
    const final = result[result.length - 1];
    expect(final.total).toBeGreaterThan(10000);
    expect(final.principal).toBe(10000);
    expect(final.interest).toBeGreaterThan(0);
  });

  it("calculates with contributions only (no initial)", () => {
    const result = calculateCompoundInterest({
      initialAmount: 0,
      monthlyContribution: 100,
      annualReturn: 0,
      inflationRate: 0,
      years: 1,
    });
    const final = result[result.length - 1];
    expect(final.principal).toBe(1200);
    expect(final.total).toBe(1200);
  });

  it("calculates with both initial and contributions", () => {
    const result = calculateCompoundInterest({
      initialAmount: 5000,
      monthlyContribution: 200,
      annualReturn: 7,
      inflationRate: 0,
      years: 5,
    });
    const final = result[result.length - 1];
    expect(final.total).toBeGreaterThan(5000 + 200 * 60);
    expect(final.interest).toBeGreaterThan(0);
  });

  it("verifies known compound interest formula", () => {
    // $10,000 at 12% annual (1% monthly) for 1 year, no contributions
    const result = calculateCompoundInterest({
      initialAmount: 10000,
      monthlyContribution: 0,
      annualReturn: 12,
      inflationRate: 0,
      years: 1,
    });
    const final = result[result.length - 1];
    const expected = 10000 * Math.pow(1 + 0.01, 12);
    expect(final.total).toBeCloseTo(expected, 0);
  });

  it("calculates inflation-adjusted real value", () => {
    const result = calculateCompoundInterest({
      initialAmount: 10000,
      monthlyContribution: 0,
      annualReturn: 10,
      inflationRate: 3,
      years: 10,
    });
    const final = result[result.length - 1];
    expect(final.realValue).toBeLessThan(final.total);
    expect(final.realValue).toBeGreaterThan(0);
  });

  it("handles zero return rate", () => {
    const result = calculateCompoundInterest({
      initialAmount: 1000,
      monthlyContribution: 100,
      annualReturn: 0,
      inflationRate: 0,
      years: 2,
    });
    const final = result[result.length - 1];
    expect(final.total).toBe(1000 + 100 * 24);
    expect(final.interest).toBe(0);
  });

  it("returns correct number of data points", () => {
    const result = calculateCompoundInterest({
      initialAmount: 1000,
      monthlyContribution: 100,
      annualReturn: 7,
      inflationRate: 2,
      years: 10,
    });
    // Year 0 through year 10 = 11 data points
    expect(result).toHaveLength(11);
  });

  it("data points have correct year values", () => {
    const result = calculateCompoundInterest({
      initialAmount: 1000,
      monthlyContribution: 0,
      annualReturn: 5,
      inflationRate: 0,
      years: 5,
    });
    expect(result.map((d) => d.year)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("rounds to 2 decimal places", () => {
    const result = calculateCompoundInterest({
      initialAmount: 1000,
      monthlyContribution: 33.33,
      annualReturn: 7.5,
      inflationRate: 2.5,
      years: 3,
    });
    for (const point of result) {
      expect(point.total).toBe(Math.round(point.total * 100) / 100);
      expect(point.principal).toBe(Math.round(point.principal * 100) / 100);
      expect(point.interest).toBe(Math.round(point.interest * 100) / 100);
      expect(point.realValue).toBe(Math.round(point.realValue * 100) / 100);
    }
  });

  it("interest is never negative", () => {
    const result = calculateCompoundInterest({
      initialAmount: 1000,
      monthlyContribution: 100,
      annualReturn: 7,
      inflationRate: 0,
      years: 5,
    });
    for (const point of result) {
      expect(point.interest).toBeGreaterThanOrEqual(0);
    }
  });

  it("handles 30 years", () => {
    const result = calculateCompoundInterest({
      initialAmount: 10000,
      monthlyContribution: 500,
      annualReturn: 8,
      inflationRate: 2.5,
      years: 30,
    });
    expect(result).toHaveLength(31);
    const final = result[result.length - 1];
    expect(final.total).toBeGreaterThan(500000);
  });

  it("real value equals total when inflation is zero", () => {
    const result = calculateCompoundInterest({
      initialAmount: 5000,
      monthlyContribution: 100,
      annualReturn: 7,
      inflationRate: 0,
      years: 5,
    });
    for (const point of result) {
      expect(point.realValue).toBe(point.total);
    }
  });
});

describe("calculateROI", () => {
  it("calculates normal ROI", () => {
    expect(calculateROI(10000, 5000)).toBeCloseTo(50);
  });

  it("returns 0 when principal is zero (div-by-zero guard)", () => {
    expect(calculateROI(0, 1000)).toBe(0);
  });

  it("handles 100% ROI", () => {
    expect(calculateROI(5000, 5000)).toBeCloseTo(100);
  });

  it("handles very high ROI", () => {
    expect(calculateROI(1000, 50000)).toBeCloseTo(5000);
  });

  it("handles zero interest", () => {
    expect(calculateROI(10000, 0)).toBe(0);
  });
});

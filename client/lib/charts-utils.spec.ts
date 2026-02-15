import { describe, it, expect } from "vitest";
import {
  calculateShortTermProjection,
  calculateLongTermProjection,
  groupExpensesByCategory,
} from "./charts-utils";
import type { Expense } from "@/types/finance";

describe("calculateShortTermProjection", () => {
  it("returns correct number of data points", () => {
    expect(calculateShortTermProjection(500, 3)).toHaveLength(3);
    expect(calculateShortTermProjection(500, 6)).toHaveLength(6);
  });

  it("calculates linear accumulation", () => {
    const result = calculateShortTermProjection(1000, 3);
    expect(result[0].cumulative).toBe(1000);
    expect(result[1].cumulative).toBe(2000);
    expect(result[2].cumulative).toBe(3000);
  });

  it("handles zero savings", () => {
    const result = calculateShortTermProjection(0, 3);
    expect(result[0].cumulative).toBe(0);
    expect(result[1].cumulative).toBe(0);
    expect(result[2].cumulative).toBe(0);
  });

  it("month numbers start at 1", () => {
    const result = calculateShortTermProjection(500, 3);
    expect(result.map((d) => d.month)).toEqual([1, 2, 3]);
  });

  it("savings equals cumulative (linear)", () => {
    const result = calculateShortTermProjection(750, 4);
    for (const point of result) {
      expect(point.savings).toBe(point.cumulative);
    }
  });
});

describe("calculateLongTermProjection", () => {
  it("returns correct number of data points", () => {
    expect(calculateLongTermProjection(500, 12, 2.5)).toHaveLength(12);
  });

  it("applies inflation formula correctly", () => {
    const result = calculateLongTermProjection(1000, 12, 2.5);
    for (const point of result) {
      const expectedNominal = 1000 * point.month;
      const inflationFactor = Math.pow(1 + 2.5 / 100, point.month / 12);
      const expectedReal = Math.round((expectedNominal / inflationFactor) * 100) / 100;
      expect(point.cumulative).toBe(expectedNominal);
      expect(point.realValue).toBe(expectedReal);
    }
  });

  it("real value is less than nominal when inflation > 0", () => {
    const result = calculateLongTermProjection(1000, 12, 3);
    for (const point of result) {
      expect(point.realValue).toBeLessThanOrEqual(point.cumulative);
    }
  });

  it("real value equals nominal when inflation is zero", () => {
    const result = calculateLongTermProjection(1000, 6, 0);
    for (const point of result) {
      expect(point.realValue).toBe(point.cumulative);
    }
  });

  it("rounds realValue to 2 decimal places", () => {
    const result = calculateLongTermProjection(333, 12, 2.7);
    for (const point of result) {
      expect(point.realValue).toBe(Math.round(point.realValue * 100) / 100);
    }
  });

  it("handles zero savings", () => {
    const result = calculateLongTermProjection(0, 12, 2.5);
    for (const point of result) {
      expect(point.cumulative).toBe(0);
      expect(point.realValue).toBe(0);
    }
  });
});

describe("groupExpensesByCategory", () => {
  const makeExpense = (
    category: Expense["category"],
    amount: number,
    frequency: Expense["frequency"] = "monthly",
  ): Expense => ({
    id: "1",
    name: "Test",
    amount,
    category,
    frequency,
    type: "need",
  });

  it("groups same category together", () => {
    const expenses = [makeExpense("food", 200), makeExpense("food", 300)];
    const result = groupExpensesByCategory(expenses);
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("food");
    expect(result[0].value).toBe(500);
  });

  it("separates different categories", () => {
    const expenses = [makeExpense("food", 200), makeExpense("housing", 1500)];
    const result = groupExpensesByCategory(expenses);
    expect(result).toHaveLength(2);
  });

  it("returns empty array for empty expenses", () => {
    expect(groupExpensesByCategory([])).toEqual([]);
  });

  it("converts frequencies when grouping", () => {
    const expenses = [
      makeExpense("food", 1200, "annual"),
      makeExpense("food", 50, "weekly"),
    ];
    const result = groupExpensesByCategory(expenses);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBeCloseTo(1200 / 12 + (50 * 52) / 12);
  });

  it("handles multiple categories", () => {
    const expenses = [
      makeExpense("food", 300),
      makeExpense("housing", 1500),
      makeExpense("entertainment", 100),
      makeExpense("food", 200),
    ];
    const result = groupExpensesByCategory(expenses);
    expect(result).toHaveLength(3);
    const food = result.find((g) => g.category === "food");
    expect(food?.value).toBe(500);
  });
});

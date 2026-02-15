import { describe, it, expect } from "vitest";
import {
  convertToMonthly,
  calculateTotalMonthlyIncome,
  calculateTotalMonthlyExpenses,
  calculateTotalMonthlyDebtPayment,
  calculateAvailableSavings,
  calculateSavingsRate,
  calculateActualAllocation,
  calculateRecommendedAmounts,
  parseNum,
} from "./financial-utils";
import type { Income, Expense, Debt } from "@/types/finance";

describe("convertToMonthly", () => {
  it("returns monthly amount unchanged", () => {
    expect(convertToMonthly(1000, "monthly")).toBe(1000);
  });

  it("converts annual to monthly", () => {
    expect(convertToMonthly(12000, "annual")).toBe(1000);
  });

  it("converts weekly to monthly", () => {
    expect(convertToMonthly(100, "weekly")).toBeCloseTo((100 * 52) / 12);
  });

  it("converts biweekly to monthly", () => {
    expect(convertToMonthly(200, "biweekly")).toBeCloseTo((200 * 26) / 12);
  });

  it("handles zero amount", () => {
    expect(convertToMonthly(0, "annual")).toBe(0);
    expect(convertToMonthly(0, "weekly")).toBe(0);
  });

  it("handles decimal amounts", () => {
    expect(convertToMonthly(99.99, "annual")).toBeCloseTo(99.99 / 12);
  });

  it("handles large numbers", () => {
    expect(convertToMonthly(1_000_000, "annual")).toBeCloseTo(1_000_000 / 12);
  });

  it("treats unknown frequency as monthly", () => {
    expect(convertToMonthly(500, "daily")).toBe(500);
    expect(convertToMonthly(500, "")).toBe(500);
  });
});

describe("calculateTotalMonthlyIncome", () => {
  it("returns 0 for empty array", () => {
    expect(calculateTotalMonthlyIncome([])).toBe(0);
  });

  it("handles single income", () => {
    const incomes: Income[] = [{ id: "1", name: "Salary", amount: 5000, frequency: "monthly" }];
    expect(calculateTotalMonthlyIncome(incomes)).toBe(5000);
  });

  it("sums multiple incomes", () => {
    const incomes: Income[] = [
      { id: "1", name: "Salary", amount: 5000, frequency: "monthly" },
      { id: "2", name: "Freelance", amount: 1200, frequency: "monthly" },
    ];
    expect(calculateTotalMonthlyIncome(incomes)).toBe(6200);
  });

  it("converts mixed frequencies", () => {
    const incomes: Income[] = [
      { id: "1", name: "Salary", amount: 60000, frequency: "annual" },
      { id: "2", name: "Side job", amount: 500, frequency: "weekly" },
    ];
    expect(calculateTotalMonthlyIncome(incomes)).toBeCloseTo(60000 / 12 + (500 * 52) / 12);
  });
});

describe("calculateTotalMonthlyExpenses", () => {
  it("returns 0 for empty array", () => {
    expect(calculateTotalMonthlyExpenses([])).toBe(0);
  });

  it("handles single expense", () => {
    const expenses: Expense[] = [
      { id: "1", name: "Rent", amount: 1500, category: "housing", frequency: "monthly", type: "need" },
    ];
    expect(calculateTotalMonthlyExpenses(expenses)).toBe(1500);
  });

  it("sums multiple expenses with mixed frequencies", () => {
    const expenses: Expense[] = [
      { id: "1", name: "Rent", amount: 1500, category: "housing", frequency: "monthly", type: "need" },
      { id: "2", name: "Insurance", amount: 2400, category: "insurance", frequency: "annual", type: "need" },
    ];
    expect(calculateTotalMonthlyExpenses(expenses)).toBeCloseTo(1500 + 200);
  });
});

describe("calculateTotalMonthlyDebtPayment", () => {
  it("returns 0 for empty array", () => {
    expect(calculateTotalMonthlyDebtPayment([])).toBe(0);
  });

  it("sums debt payments", () => {
    const debts: Debt[] = [
      { id: "1", name: "Car", principal: 20000, interestRate: 5, monthlyPayment: 400, remainingMonths: 48 },
      { id: "2", name: "Student", principal: 30000, interestRate: 4, monthlyPayment: 300, remainingMonths: 120 },
    ];
    expect(calculateTotalMonthlyDebtPayment(debts)).toBe(700);
  });
});

describe("calculateAvailableSavings", () => {
  it("calculates positive savings", () => {
    expect(calculateAvailableSavings(5000, 3000, 500)).toBe(1500);
  });

  it("calculates negative savings (deficit)", () => {
    expect(calculateAvailableSavings(3000, 3500, 500)).toBe(-1000);
  });

  it("calculates zero savings", () => {
    expect(calculateAvailableSavings(5000, 4000, 1000)).toBe(0);
  });
});

describe("calculateSavingsRate", () => {
  it("calculates normal savings rate", () => {
    expect(calculateSavingsRate(1000, 5000)).toBeCloseTo(20);
  });

  it("returns 0 when income is zero (div-by-zero guard)", () => {
    expect(calculateSavingsRate(1000, 0)).toBe(0);
  });

  it("calculates 100% savings rate", () => {
    expect(calculateSavingsRate(5000, 5000)).toBeCloseTo(100);
  });

  it("handles negative savings (deficit)", () => {
    expect(calculateSavingsRate(-1000, 5000)).toBeCloseTo(-20);
  });
});

describe("calculateActualAllocation", () => {
  const makeExpense = (type: "need" | "want" | "savings", amount: number): Expense => ({
    id: "1",
    name: "Test",
    amount,
    category: "other",
    frequency: "monthly",
    type,
  });

  it("calculates allocation by type", () => {
    const expenses: Expense[] = [
      makeExpense("need", 2000),
      makeExpense("want", 500),
      makeExpense("savings", 300),
    ];
    const result = calculateActualAllocation(expenses, 5000, 2800);
    expect(result.needsAmount).toBe(2000);
    expect(result.wantsAmount).toBe(500);
    expect(result.savingsExpenseAmount).toBe(300);
    expect(result.actualSavings).toBe(300 + (5000 - 2800));
  });

  it("calculates percentages correctly", () => {
    const expenses: Expense[] = [makeExpense("need", 2500), makeExpense("want", 2500)];
    const result = calculateActualAllocation(expenses, 10000, 5000);
    expect(result.needsPercent).toBeCloseTo(25);
    expect(result.wantsPercent).toBeCloseTo(25);
    expect(result.savingsPercent).toBeCloseTo(50);
  });

  it("handles zero income (div-by-zero guard)", () => {
    const expenses: Expense[] = [makeExpense("need", 100)];
    const result = calculateActualAllocation(expenses, 0, 100);
    expect(result.needsPercent).toBe(0);
    expect(result.wantsPercent).toBe(0);
    expect(result.savingsPercent).toBe(0);
  });

  it("handles empty expenses", () => {
    const result = calculateActualAllocation([], 5000, 0);
    expect(result.needsAmount).toBe(0);
    expect(result.wantsAmount).toBe(0);
    expect(result.actualSavings).toBe(5000);
    expect(result.savingsPercent).toBeCloseTo(100);
  });

  it("filters by type correctly with mixed types", () => {
    const expenses: Expense[] = [
      makeExpense("need", 1000),
      makeExpense("need", 500),
      makeExpense("want", 300),
      makeExpense("savings", 200),
    ];
    const result = calculateActualAllocation(expenses, 5000, 2000);
    expect(result.needsAmount).toBe(1500);
    expect(result.wantsAmount).toBe(300);
    expect(result.savingsExpenseAmount).toBe(200);
  });
});

describe("calculateRecommendedAmounts", () => {
  it("calculates recommended amounts from breakdown", () => {
    const result = calculateRecommendedAmounts(5000, { needs: 50, wants: 30, savings: 20 });
    expect(result.needs).toBe(2500);
    expect(result.wants).toBe(1500);
    expect(result.savings).toBe(1000);
  });

  it("handles zero income", () => {
    const result = calculateRecommendedAmounts(0, { needs: 50, wants: 30, savings: 20 });
    expect(result.needs).toBe(0);
    expect(result.wants).toBe(0);
    expect(result.savings).toBe(0);
  });

  it("handles custom percentages", () => {
    const result = calculateRecommendedAmounts(10000, { needs: 40, wants: 20, savings: 40 });
    expect(result.needs).toBe(4000);
    expect(result.wants).toBe(2000);
    expect(result.savings).toBe(4000);
  });
});

describe("parseNum", () => {
  it("parses string numbers", () => {
    expect(parseNum("42")).toBe(42);
    expect(parseNum("3.14")).toBeCloseTo(3.14);
  });

  it("returns numbers unchanged", () => {
    expect(parseNum(42)).toBe(42);
    expect(parseNum(0)).toBe(0);
  });

  it("returns 0 for NaN", () => {
    expect(parseNum(NaN)).toBe(0);
  });

  it("returns 0 for empty string", () => {
    expect(parseNum("")).toBe(0);
  });

  it("returns 0 for non-numeric strings", () => {
    expect(parseNum("abc")).toBe(0);
  });

  it("parses strings with leading numbers", () => {
    expect(parseNum("42abc")).toBe(42);
  });
});

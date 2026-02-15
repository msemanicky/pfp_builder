import type { Expense } from "@/types/finance";
import { convertToMonthly } from "./financial-utils";

export interface ShortTermDataPoint {
  month: number;
  savings: number;
  cumulative: number;
}

export function calculateShortTermProjection(
  monthlySavings: number,
  months: number,
): ShortTermDataPoint[] {
  return Array.from({ length: months }, (_, i) => ({
    month: i + 1,
    savings: monthlySavings * (i + 1),
    cumulative: monthlySavings * (i + 1),
  }));
}

export interface LongTermDataPoint {
  month: number;
  savings: number;
  cumulative: number;
  realValue: number;
}

export function calculateLongTermProjection(
  monthlySavings: number,
  months: number,
  inflationRate: number,
): LongTermDataPoint[] {
  return Array.from({ length: months }, (_, i) => {
    const monthNumber = i + 1;
    const nominalValue = monthlySavings * monthNumber;
    const inflationFactor = Math.pow(1 + inflationRate / 100, monthNumber / 12);
    const realValue = nominalValue / inflationFactor;
    return {
      month: monthNumber,
      savings: monthlySavings,
      cumulative: nominalValue,
      realValue: Math.round(realValue * 100) / 100,
    };
  });
}

export interface CategoryGroup {
  category: string;
  value: number;
}

export function groupExpensesByCategory(expenses: Expense[]): CategoryGroup[] {
  return expenses.reduce<CategoryGroup[]>((acc, expense) => {
    const monthly = convertToMonthly(expense.amount, expense.frequency);
    const existing = acc.find((e) => e.category === expense.category);
    if (existing) {
      existing.value += monthly;
    } else {
      acc.push({ category: expense.category, value: monthly });
    }
    return acc;
  }, []);
}

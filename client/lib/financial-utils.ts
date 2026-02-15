import type { Income, Expense, Debt } from "@/types/finance";

export function convertToMonthly(amount: number, frequency: string): number {
  switch (frequency) {
    case "annual":
      return amount / 12;
    case "weekly":
      return (amount * 52) / 12;
    case "biweekly":
      return (amount * 26) / 12;
    default:
      return amount;
  }
}

export function calculateTotalMonthlyIncome(incomes: Income[]): number {
  return incomes.reduce(
    (sum, income) => sum + convertToMonthly(income.amount, income.frequency),
    0,
  );
}

export function calculateTotalMonthlyExpenses(expenses: Expense[]): number {
  return expenses.reduce(
    (sum, expense) => sum + convertToMonthly(expense.amount, expense.frequency),
    0,
  );
}

export function calculateTotalMonthlyDebtPayment(debts: Debt[]): number {
  return debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);
}

export function calculateAvailableSavings(
  totalIncome: number,
  totalExpenses: number,
  totalDebt: number,
): number {
  return totalIncome - totalExpenses - totalDebt;
}

export function calculateSavingsRate(
  availableSavings: number,
  totalIncome: number,
): number {
  return totalIncome > 0 ? (availableSavings / totalIncome) * 100 : 0;
}

export interface ActualAllocation {
  needsAmount: number;
  wantsAmount: number;
  savingsExpenseAmount: number;
  actualSavings: number;
  needsPercent: number;
  wantsPercent: number;
  savingsPercent: number;
}

export function calculateActualAllocation(
  expenses: Expense[],
  totalIncome: number,
  totalExpenses: number,
): ActualAllocation {
  const needsAmount = expenses
    .filter((e) => e.type === "need")
    .reduce((sum, e) => sum + convertToMonthly(e.amount, e.frequency), 0);
  const wantsAmount = expenses
    .filter((e) => e.type === "want")
    .reduce((sum, e) => sum + convertToMonthly(e.amount, e.frequency), 0);
  const savingsExpenseAmount = expenses
    .filter((e) => e.type === "savings")
    .reduce((sum, e) => sum + convertToMonthly(e.amount, e.frequency), 0);
  const actualSavings = savingsExpenseAmount + (totalIncome - totalExpenses);

  return {
    needsAmount,
    wantsAmount,
    savingsExpenseAmount,
    actualSavings,
    needsPercent: totalIncome > 0 ? (needsAmount / totalIncome) * 100 : 0,
    wantsPercent: totalIncome > 0 ? (wantsAmount / totalIncome) * 100 : 0,
    savingsPercent: totalIncome > 0 ? (actualSavings / totalIncome) * 100 : 0,
  };
}

export interface RecommendedAmounts {
  needs: number;
  wants: number;
  savings: number;
}

export function calculateRecommendedAmounts(
  totalIncome: number,
  breakdown: { needs: number; wants: number; savings: number },
): RecommendedAmounts {
  return {
    needs: (totalIncome * breakdown.needs) / 100,
    wants: (totalIncome * breakdown.wants) / 100,
    savings: (totalIncome * breakdown.savings) / 100,
  };
}

export function parseNum(val: string | number): number {
  const n = typeof val === "string" ? parseFloat(val) : val;
  return isNaN(n) ? 0 : n;
}

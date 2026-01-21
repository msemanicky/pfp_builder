export interface Income {
  id: string;
  name: string;
  amount: number;
  frequency: "monthly" | "annual" | "weekly" | "biweekly";
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: "housing" | "food" | "transportation" | "utilities" | "entertainment" | "healthcare" | "education" | "insurance" | "debt" | "other";
  frequency: "monthly" | "annual" | "weekly" | "biweekly";
}

export interface Debt {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  monthlyPayment: number;
  remainingMonths: number;
}

export interface SavingsStrategy {
  id: string;
  name: string;
  description: string;
  breakdown: {
    needs: number;
    wants: number;
    savings: number;
  };
}

export interface FinanceData {
  incomes: Income[];
  expenses: Expense[];
  debts: Debt[];
  selectedStrategy: string | null;
  language: "en" | "es" | "fr" | "de";
}

export interface MonthlyBreakdown {
  totalIncome: number;
  totalExpenses: number;
  totalDebtPayment: number;
  availableSavings: number;
  savingsRate: number;
}

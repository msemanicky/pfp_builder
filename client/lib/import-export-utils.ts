import type { Expense, FinanceData } from "@/types/finance";

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateExpenses(expenses: any[]): Expense[] {
  return expenses.map((expense) => ({
    ...expense,
    type: expense.type || "need",
  })) as Expense[];
}

export function validateAndMigrateImportData(
  jsonString: string,
): { success: true; data: FinanceData } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(jsonString);

    if (
      !Array.isArray(parsed.incomes) ||
      !Array.isArray(parsed.expenses) ||
      !Array.isArray(parsed.debts) ||
      typeof parsed.language !== "string"
    ) {
      return { success: false, error: "Invalid data structure" };
    }

    const migratedExpenses = migrateExpenses(parsed.expenses);

    const migratedData: FinanceData = {
      ...parsed,
      expenses: migratedExpenses,
      selectedStrategy: parsed.selectedStrategy ?? null,
      customStrategy: parsed.customStrategy ?? {
        needs: 50,
        wants: 30,
        savings: 20,
      },
    };

    return { success: true, data: migratedData };
  } catch {
    return { success: false, error: "Invalid JSON" };
  }
}

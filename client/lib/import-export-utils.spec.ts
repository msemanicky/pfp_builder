import { describe, it, expect } from "vitest";
import {
  generateId,
  migrateExpenses,
  validateAndMigrateImportData,
} from "./import-export-utils";

describe("generateId", () => {
  it("returns a non-empty string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("migrateExpenses", () => {
  it("adds default type 'need' when missing", () => {
    const expenses = [
      { id: "1", name: "Rent", amount: 1500, category: "housing", frequency: "monthly" },
    ];
    const result = migrateExpenses(expenses);
    expect(result[0].type).toBe("need");
  });

  it("preserves existing type", () => {
    const expenses = [
      { id: "1", name: "Netflix", amount: 15, category: "entertainment", frequency: "monthly", type: "want" },
    ];
    const result = migrateExpenses(expenses);
    expect(result[0].type).toBe("want");
  });

  it("preserves savings type", () => {
    const expenses = [
      { id: "1", name: "401k", amount: 500, category: "other", frequency: "monthly", type: "savings" },
    ];
    const result = migrateExpenses(expenses);
    expect(result[0].type).toBe("savings");
  });

  it("handles empty array", () => {
    expect(migrateExpenses([])).toEqual([]);
  });

  it("migrates mixed expenses", () => {
    const expenses = [
      { id: "1", name: "Rent", amount: 1500, category: "housing", frequency: "monthly" },
      { id: "2", name: "Netflix", amount: 15, category: "entertainment", frequency: "monthly", type: "want" },
    ];
    const result = migrateExpenses(expenses);
    expect(result[0].type).toBe("need");
    expect(result[1].type).toBe("want");
  });
});

describe("validateAndMigrateImportData", () => {
  const validData = {
    incomes: [{ id: "1", name: "Salary", amount: 5000, frequency: "monthly" }],
    expenses: [{ id: "2", name: "Rent", amount: 1500, category: "housing", frequency: "monthly", type: "need" }],
    debts: [],
    selectedStrategy: "50_30_20",
    customStrategy: { needs: 50, wants: 30, savings: 20 },
    language: "en",
  };

  it("accepts valid data", () => {
    const result = validateAndMigrateImportData(JSON.stringify(validData));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.incomes).toHaveLength(1);
      expect(result.data.expenses).toHaveLength(1);
    }
  });

  it("rejects invalid JSON", () => {
    const result = validateAndMigrateImportData("not json");
    expect(result.success).toBe(false);
  });

  it("rejects non-array incomes", () => {
    const invalid = { ...validData, incomes: "not array" };
    const result = validateAndMigrateImportData(JSON.stringify(invalid));
    expect(result.success).toBe(false);
  });

  it("rejects non-array expenses", () => {
    const invalid = { ...validData, expenses: 42 };
    const result = validateAndMigrateImportData(JSON.stringify(invalid));
    expect(result.success).toBe(false);
  });

  it("rejects non-array debts", () => {
    const invalid = { ...validData, debts: null };
    const result = validateAndMigrateImportData(JSON.stringify(invalid));
    expect(result.success).toBe(false);
  });

  it("rejects missing language", () => {
    const { language, ...noLang } = validData;
    const result = validateAndMigrateImportData(JSON.stringify(noLang));
    expect(result.success).toBe(false);
  });

  it("migrates expenses missing type field", () => {
    const data = {
      ...validData,
      expenses: [{ id: "1", name: "Rent", amount: 1500, category: "housing", frequency: "monthly" }],
    };
    const result = validateAndMigrateImportData(JSON.stringify(data));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.expenses[0].type).toBe("need");
    }
  });

  it("defaults selectedStrategy to null when missing", () => {
    const { selectedStrategy, ...noStrategy } = validData;
    const data = { ...noStrategy, language: "en" };
    const result = validateAndMigrateImportData(JSON.stringify(data));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.selectedStrategy).toBeNull();
    }
  });

  it("defaults customStrategy when missing", () => {
    const { customStrategy, ...noCustom } = validData;
    const data = { ...noCustom, language: "en" };
    const result = validateAndMigrateImportData(JSON.stringify(data));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customStrategy).toEqual({ needs: 50, wants: 30, savings: 20 });
    }
  });

  it("preserves existing selectedStrategy", () => {
    const result = validateAndMigrateImportData(JSON.stringify(validData));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.selectedStrategy).toBe("50_30_20");
    }
  });

  it("preserves existing customStrategy", () => {
    const data = { ...validData, customStrategy: { needs: 40, wants: 20, savings: 40 } };
    const result = validateAndMigrateImportData(JSON.stringify(data));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customStrategy).toEqual({ needs: 40, wants: 20, savings: 40 });
    }
  });
});

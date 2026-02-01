import React, { createContext, useContext, useState, useEffect } from "react";
import { FinanceData, Income, Expense, Debt } from "@/types/finance";

interface FinanceContextType {
  data: FinanceData;
  setLanguage: (lang: "en" | "es" | "fr" | "de") => void;
  
  // Income operations
  addIncome: (income: Omit<Income, "id">) => void;
  updateIncome: (id: string, income: Omit<Income, "id">) => void;
  removeIncome: (id: string) => void;
  
  // Expense operations
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, expense: Omit<Expense, "id">) => void;
  removeExpense: (id: string) => void;
  
  // Debt operations
  addDebt: (debt: Omit<Debt, "id">) => void;
  updateDebt: (id: string, debt: Omit<Debt, "id">) => void;
  removeDebt: (id: string) => void;
  
  // Strategy operations
  setSelectedStrategy: (strategyId: string | null) => void;
  setCustomStrategy: (breakdown: { needs: number; wants: number; savings: number }) => void;
  
  // Data persistence
  exportData: () => string;
  importData: (jsonString: string) => boolean;
  clearData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = "financeData";

const defaultData: FinanceData = {
  incomes: [],
  expenses: [],
  debts: [],
  selectedStrategy: null,
  customStrategy: {
    needs: 50,
    wants: 30,
    savings: 20,
  },
  language: "en",
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<FinanceData>(defaultData);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as FinanceData;
        setData(parsed);
      } catch (e) {
        console.error("Failed to load finance data from session", e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to sessionStorage whenever data changes
  useEffect(() => {
    if (isHydrated) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isHydrated]);

  const setLanguage = (lang: "en" | "es" | "fr" | "de") => {
    setData((prev) => ({ ...prev, language: lang }));
  };

  const addIncome = (income: Omit<Income, "id">) => {
    setData((prev) => ({
      ...prev,
      incomes: [...prev.incomes, { ...income, id: generateId() }],
    }));
  };

  const updateIncome = (id: string, income: Omit<Income, "id">) => {
    setData((prev) => ({
      ...prev,
      incomes: prev.incomes.map((inc) => (inc.id === id ? { ...income, id } : inc)),
    }));
  };

  const removeIncome = (id: string) => {
    setData((prev) => ({
      ...prev,
      incomes: prev.incomes.filter((inc) => inc.id !== id),
    }));
  };

  const addExpense = (expense: Omit<Expense, "id">) => {
    setData((prev) => ({
      ...prev,
      expenses: [...prev.expenses, { ...expense, id: generateId() }],
    }));
  };

  const updateExpense = (id: string, expense: Omit<Expense, "id">) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((exp) => (exp.id === id ? { ...expense, id } : exp)),
    }));
  };

  const removeExpense = (id: string) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((exp) => exp.id !== id),
    }));
  };

  const addDebt = (debt: Omit<Debt, "id">) => {
    setData((prev) => ({
      ...prev,
      debts: [...prev.debts, { ...debt, id: generateId() }],
    }));
  };

  const updateDebt = (id: string, debt: Omit<Debt, "id">) => {
    setData((prev) => ({
      ...prev,
      debts: prev.debts.map((d) => (d.id === id ? { ...debt, id } : d)),
    }));
  };

  const removeDebt = (id: string) => {
    setData((prev) => ({
      ...prev,
      debts: prev.debts.filter((d) => d.id !== id),
    }));
  };

  const setSelectedStrategy = (strategyId: string | null) => {
    setData((prev) => ({ ...prev, selectedStrategy: strategyId }));
  };

  const setCustomStrategy = (breakdown: { needs: number; wants: number; savings: number }) => {
    setData((prev) => ({ ...prev, customStrategy: breakdown }));
  };

  const exportData = (): string => {
    return JSON.stringify(data, null, 2);
  };

  const importData = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString) as FinanceData;
      // Basic validation
      if (
        Array.isArray(parsed.incomes) &&
        Array.isArray(parsed.expenses) &&
        Array.isArray(parsed.debts) &&
        typeof parsed.language === "string"
      ) {
        setData(parsed);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to import data", e);
      return false;
    }
  };

  const clearData = () => {
    setData(defaultData);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const value: FinanceContextType = {
    data,
    setLanguage,
    addIncome,
    updateIncome,
    removeIncome,
    addExpense,
    updateExpense,
    removeExpense,
    addDebt,
    updateDebt,
    removeDebt,
    setSelectedStrategy,
    setCustomStrategy,
    exportData,
    importData,
    clearData,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};

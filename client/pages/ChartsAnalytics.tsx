import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFinance } from "@/context/FinanceContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const convertToMonthly = (amount: number, frequency: string): number => {
  switch (frequency) {
    case "annual":
      return amount / 12;
    case "weekly":
      return amount * 52 / 12;
    case "biweekly":
      return amount * 26 / 12;
    default:
      return amount;
  }
};

const COLORS = ["#0F7173", "#F4A460", "#FFD700", "#90EE90", "#FF6B6B", "#4ECDC4", "#95E1D3"];

const ChartsAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useFinance();

  const totalMonthlyIncome = useMemo(() => {
    return data.incomes.reduce((sum, income) => sum + convertToMonthly(income.amount, income.frequency), 0);
  }, [data.incomes]);

  const totalMonthlyExpenses = useMemo(() => {
    return data.expenses.reduce((sum, expense) => sum + convertToMonthly(expense.amount, expense.frequency), 0);
  }, [data.expenses]);

  const totalMonthlyDebtPayment = useMemo(() => {
    return data.debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);
  }, [data.debts]);

  const monthlyAvailableSavings = totalMonthlyIncome - totalMonthlyExpenses - totalMonthlyDebtPayment;

  // Income vs Expenses Chart Data
  const incomeVsExpensesData = [
    {
      name: t("nav.home"),
      [t("home.total_income")]: totalMonthlyIncome,
      [t("home.total_expenses")]: totalMonthlyExpenses,
      [t("charts.debt_payoff")]: totalMonthlyDebtPayment,
    },
  ];

  // Monthly Breakdown Data
  const monthlyBreakdownData = [
    {
      name: t("home.total_income"),
      value: totalMonthlyIncome,
    },
    {
      name: t("home.total_expenses"),
      value: totalMonthlyExpenses,
    },
    {
      name: "Debt Payment",
      value: totalMonthlyDebtPayment,
    },
    {
      name: t("home.total_savings"),
      value: Math.max(0, monthlyAvailableSavings),
    },
  ];

  // Short-term savings projection (3 months)
  const shortTermData = Array.from({ length: 3 }, (_, i) => ({
    month: `Month ${i + 1}`,
    savings: monthlyAvailableSavings * (i + 1),
    cumulative: monthlyAvailableSavings * (i + 1),
  }));

  // Long-term savings projection (12 months)
  const longTermData = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    savings: monthlyAvailableSavings,
    cumulative: monthlyAvailableSavings * (i + 1),
  }));

  // Debt payoff timeline
  const debtPayoffData = data.debts.map((debt) => ({
    name: debt.name,
    remaining: debt.remainingMonths,
    payment: debt.monthlyPayment,
  }));

  // Expense breakdown by category
  const expenseByCategory = data.expenses.reduce((acc, expense) => {
    const monthly = convertToMonthly(expense.amount, expense.frequency);
    const existing = acc.find((e) => e.category === expense.category);
    if (existing) {
      existing.value += monthly;
    } else {
      acc.push({ category: expense.category, value: monthly });
    }
    return acc;
  }, [] as Array<{ category: string; value: number }>);

  const hasData = data.incomes.length > 0;

  if (!hasData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{t("charts.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("charts.subtitle")}</p>
        </div>

        <Card className="bg-muted/50 border-0">
          <CardHeader>
            <CardTitle>{t("home.no_data")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Add your financial information to see charts and analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">{t("charts.title")}</h1>
        <p className="text-lg text-muted-foreground">{t("charts.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Income vs Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>{t("charts.income_vs_expenses")}</CardTitle>
            <CardDescription>Monthly breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeVsExpensesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={t("home.total_income")} fill="#0F7173" />
                <Bar dataKey={t("home.total_expenses")} fill="#FF6B6B" />
                <Bar dataKey={t("charts.debt_payoff")} fill="#FFD700" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Breakdown Pie */}
        <Card>
          <CardHeader>
            <CardTitle>{t("charts.monthly_breakdown")}</CardTitle>
            <CardDescription>Proportion of income allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={monthlyBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {monthlyBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Short-term Savings Projection */}
        <Card>
          <CardHeader>
            <CardTitle>{t("charts.short_term_savings")}</CardTitle>
            <CardDescription>Next 3 months projection</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={shortTermData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="cumulative" stroke="#0F7173" strokeWidth={2} name="Cumulative Savings" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Long-term Savings Projection */}
        <Card>
          <CardHeader>
            <CardTitle>{t("charts.long_term_savings")}</CardTitle>
            <CardDescription>Next 12 months projection</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={longTermData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="cumulative" stroke="#0F7173" strokeWidth={2} name="Cumulative Savings" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {debtPayoffData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Debt Payoff Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>{t("charts.debt_payoff")}</CardTitle>
              <CardDescription>Months remaining for each debt</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={debtPayoffData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="remaining" fill="#FFD700" name="Months Remaining" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {expenseByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("charts.expense_breakdown")}</CardTitle>
            <CardDescription>Monthly expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, value }) => `${t(`category.${category}`)}: $${value.toFixed(0)}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChartsAnalytics;

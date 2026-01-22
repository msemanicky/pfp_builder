import React from "react";
import { Link } from "react-router-dom";
import { useFinance } from "@/context/FinanceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, PieChart, TrendingUp } from "lucide-react";

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

const Index: React.FC = () => {
  const { data } = useFinance();

  const totalMonthlyIncome = data.incomes.reduce((sum, income) => sum + convertToMonthly(income.amount, income.frequency), 0);
  const totalMonthlyExpenses = data.expenses.reduce((sum, expense) => sum + convertToMonthly(expense.amount, expense.frequency), 0);
  const totalMonthlyDebtPayment = data.debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);
  const availableSavings = totalMonthlyIncome - totalMonthlyExpenses - totalMonthlyDebtPayment;
  const savingsRate = totalMonthlyIncome > 0 ? (availableSavings / totalMonthlyIncome) * 100 : 0;

  const hasData = data.incomes.length > 0 || data.expenses.length > 0 || data.debts.length > 0;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-2">Financial Dashboard</h1>
        <p className="text-lg text-muted-foreground">Welcome to your financial planner</p>
      </div>

      {!hasData ? (
        // No Data State
        <div className="max-w-md mx-auto text-center">
          <div className="bg-muted/50 rounded-lg p-8 mb-6">
            <PieChart className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No financial data yet. Start by adding your income and expenses.</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Get Started
            </p>
            <Link to="/financial-input">
              <Button size="lg" className="w-full">
                Add Income
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  Total Income
                  <ArrowUpRight className="w-4 h-4 text-success" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  ${totalMonthlyIncome.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Per month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  Total Expenses
                  <ArrowDownLeft className="w-4 h-4 text-destructive" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  ${totalMonthlyExpenses.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Per month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  {t("home.total_savings")}
                  <TrendingUp className="w-4 h-4 text-warning" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${availableSavings >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ${Math.abs(availableSavings).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">After expenses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("home.savings_rate")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {savingsRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Of income</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <Link to="/financial-input">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("home.quick_insights")}</CardTitle>
                  <CardDescription>Manage your data</CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <Link to="/savings-strategies">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("savings_strategies.title")}</CardTitle>
                  <CardDescription>Choose a strategy</CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <Link to="/charts">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("charts.title")}</CardTitle>
                  <CardDescription>View analytics</CardDescription>
                </CardHeader>
              </Link>
            </Card>
          </div>

          {/* Summary Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("home.quick_insights")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Monthly Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{t("home.total_income")}</span>
                      <span className="font-semibold text-success">${totalMonthlyIncome.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t("home.total_expenses")}</span>
                      <span className="font-semibold text-destructive">-${totalMonthlyExpenses.toFixed(2)}</span>
                    </div>
                    {totalMonthlyDebtPayment > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Debt Payments</span>
                        <span className="font-semibold text-warning">-${totalMonthlyDebtPayment.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 flex justify-between">
                      <span className="text-sm font-medium">{t("home.total_savings")}</span>
                      <span className={`font-bold text-lg ${availableSavings >= 0 ? 'text-success' : 'text-destructive'}`}>
                        ${availableSavings.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {data.incomes.length === 0 && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3">Get started by adding your first income:</p>
                    <Link to="/financial-input" className="w-full block">
                      <Button variant="outline" className="w-full">
                        {t("financial_input.add_income")}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Index;

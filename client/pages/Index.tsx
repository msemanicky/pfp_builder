import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFinance } from "@/context/FinanceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, PieChart, TrendingUp } from "lucide-react";
import {
  calculateTotalMonthlyIncome,
  calculateTotalMonthlyExpenses,
  calculateTotalMonthlyDebtPayment,
  calculateAvailableSavings,
  calculateSavingsRate,
} from "@/lib/financial-utils";

const Index: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useFinance();

  const totalMonthlyIncome = calculateTotalMonthlyIncome(data.incomes);
  const totalMonthlyExpenses = calculateTotalMonthlyExpenses(data.expenses);
  const totalMonthlyDebtPayment = calculateTotalMonthlyDebtPayment(data.debts);
  const availableSavings = calculateAvailableSavings(totalMonthlyIncome, totalMonthlyExpenses, totalMonthlyDebtPayment);
  const savingsRate = calculateSavingsRate(availableSavings, totalMonthlyIncome);

  const hasData = data.incomes.length > 0 || data.expenses.length > 0 || data.debts.length > 0;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-2">{t('home.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('home.welcome')}</p>
      </div>

      {!hasData ? (
        // No Data State
        <div className="max-w-md mx-auto text-center">
          <div className="bg-muted/50 rounded-lg p-8 mb-6">
            <PieChart className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-foreground mb-2">{t('home.no_data')}</h2>
            <p className="text-muted-foreground text-sm mb-6">
              {t('home.get_started')}
            </p>
            <Link to="/financial-input">
              <Button size="lg" className="w-full">
                {t('home.add_income_button')}
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
                  {t('home.total_income')}
                  <ArrowUpRight className="w-4 h-4 text-success" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  ${totalMonthlyIncome.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t('home.per_month')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  {t('home.total_expenses')}
                  <ArrowDownLeft className="w-4 h-4 text-destructive" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  ${totalMonthlyExpenses.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t('home.per_month')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  {t('home.total_savings')}
                  <TrendingUp className="w-4 h-4 text-warning" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${availableSavings >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ${Math.abs(availableSavings).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t('home.after_expenses')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('home.savings_rate')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {savingsRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t('home.of_income')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <Link to="/financial-input">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t('financial_input.title')}</CardTitle>
                  <CardDescription>{t('financial_input.subtitle')}</CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <Link to="/savings-strategies">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t('savings_strategies.title')}</CardTitle>
                  <CardDescription>{t('savings_strategies.subtitle')}</CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <Link to="/charts">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t('charts.title')}</CardTitle>
                  <CardDescription>{t('charts.subtitle')}</CardDescription>
                </CardHeader>
              </Link>
            </Card>
          </div>

          {/* Summary Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('home.quick_insights')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('home.monthly_summary')}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{t('home.total_income')}</span>
                      <span className="font-semibold text-success">${totalMonthlyIncome.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t('home.total_expenses')}</span>
                      <span className="font-semibold text-destructive">-${totalMonthlyExpenses.toFixed(2)}</span>
                    </div>
                    {totalMonthlyDebtPayment > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">{t('financial_input.monthly_payment')}</span>
                        <span className="font-semibold text-warning">-${totalMonthlyDebtPayment.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 flex justify-between">
                      <span className="text-sm font-medium">{t('home.total_savings')}</span>
                      <span className={`font-bold text-lg ${availableSavings >= 0 ? 'text-success' : 'text-destructive'}`}>
                        ${availableSavings.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {data.incomes.length === 0 && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3">{t('home.get_started')}</p>
                    <Link to="/financial-input" className="w-full block">
                      <Button variant="outline" className="w-full">
                        {t('button.add')} {t('home.total_income')}
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

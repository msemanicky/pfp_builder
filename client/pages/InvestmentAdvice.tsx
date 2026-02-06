import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFinance } from "@/context/FinanceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, Award, Zap, Shield, DollarSign } from "lucide-react";

const STRATEGY_SAVINGS_PERCENT: Record<string, number> = {
  "50_30_20": 20,
  pay_yourself_first: 20,
  aggressive_saving: 40,
  balanced: 30,
  debt_payoff: 10,
};

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

const InvestmentAdvice: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useFinance();

  // Get available savings
  const totalMonthlyIncome = data.incomes.reduce((sum, income) => sum + convertToMonthly(income.amount, income.frequency), 0);
  const totalMonthlyExpenses = data.expenses.reduce((sum, expense) => sum + convertToMonthly(expense.amount, expense.frequency), 0);
  const totalMonthlyDebtPayment = data.debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);
  const monthlyAvailableSavings = totalMonthlyIncome - totalMonthlyExpenses - totalMonthlyDebtPayment;
  const selectedSavingsPercent = data.selectedStrategy === "custom"
    ? data.customStrategy.savings
    : data.selectedStrategy
    ? STRATEGY_SAVINGS_PERCENT[data.selectedStrategy]
    : undefined;
  const strategyMonthlySavings = selectedSavingsPercent !== undefined
    ? (totalMonthlyIncome * selectedSavingsPercent) / 100
    : monthlyAvailableSavings;

  // Compound Interest Calculator State
  const [calculator, setCalculator] = useState({
    initialAmount: 0,
    monthlyContribution: Math.max(0, strategyMonthlySavings),
    annualReturn: 7,
    inflationRate: 2.5,
    years: 10,
  });

  // Calculate compound interest
  const compoundInterestData = useMemo(() => {
    const data: Array<{
      year: number;
      total: number;
      principal: number;
      interest: number;
      realValue: number;
    }> = [];
    const monthlyRate = calculator.annualReturn / 100 / 12;
    const monthlyInflation = calculator.inflationRate / 100 / 12;
    let total = calculator.initialAmount;

    for (let month = 0; month <= calculator.years * 12; month++) {
      const year = Math.floor(month / 12);
      
      // Only add data for year boundaries and initial
      if (month % 12 === 0 || month === calculator.years * 12) {
        const principalInvested = calculator.initialAmount + calculator.monthlyContribution * month;
        const interest = Math.max(0, total - principalInvested);
        // Calculate real value (adjusted for inflation)
        const inflationFactor = Math.pow(1 + calculator.inflationRate / 100, year);
        const realValue = total / inflationFactor;
        
        data.push({
          year,
          total: Math.round(total * 100) / 100,
          principal: Math.round(principalInvested * 100) / 100,
          interest: Math.round(interest * 100) / 100,
          realValue: Math.round(realValue * 100) / 100,
        });
      }

      // Calculate compound interest with monthly contribution
      total = total * (1 + monthlyRate) + calculator.monthlyContribution;
    }

    return data;
  }, [calculator.initialAmount, calculator.monthlyContribution, calculator.annualReturn, calculator.inflationRate, calculator.years]);

  const finalData = compoundInterestData[compoundInterestData.length - 1] || {
    total: 0,
    principal: 0,
    interest: 0,
  };

  const principles = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: t('investment.principle_1'),
      description: t("investment.principle_1_desc"),
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: t('investment.principle_2'),
      description: t("investment.principle_2_desc"),
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: t('investment.principle_3'),
      description: t("investment.principle_3_desc"),
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: t('investment.principle_4'),
      description: t("investment.principle_4_desc"),
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: t('investment.principle_5'),
      description: t("investment.principle_5_desc"),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">{t('investment.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('investment.subtitle')}</p>
      </div>

      {/* Investment Principles */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">{t('investment.general_principles')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {principles.map((principle, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="text-primary mb-2">{principle.icon}</div>
                <CardTitle className="text-base">{principle.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{principle.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Compound Interest Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t('investment.compound_interest')}</CardTitle>
            <CardDescription>{t("investment.compound_interest_desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('investment.initial_amount')}</Label>
              <Input
                type="number"
                value={calculator.initialAmount}
                onChange={(e) => setCalculator({ ...calculator, initialAmount: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>{t('investment.monthly_contribution')}</Label>
              <Input
                type="number"
                value={calculator.monthlyContribution}
                onChange={(e) => setCalculator({ ...calculator, monthlyContribution: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>{t('investment.annual_return')}</Label>
              <Input
                type="number"
                value={calculator.annualReturn}
                onChange={(e) => setCalculator({ ...calculator, annualReturn: parseFloat(e.target.value) || 0 })}
                placeholder="7"
                step="0.1"
              />
            </div>
            <div>
              <Label>{t("investment.inflation_rate")}</Label>
              <Input
                type="number"
                value={calculator.inflationRate}
                onChange={(e) => setCalculator({ ...calculator, inflationRate: parseFloat(e.target.value) || 0 })}
                placeholder="2.5"
                step="0.1"
              />
            </div>
            <div>
              <Label>{t('investment.years')}</Label>
              <Input
                type="number"
                value={calculator.years}
                onChange={(e) => setCalculator({ ...calculator, years: parseInt(e.target.value) || 0 })}
                placeholder="10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-gradient-to-br from-success/10 to-success/5">
            <CardHeader>
              <CardTitle className="text-lg">{t('investment.projected_amount')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-success">
                ${finalData.total.toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {calculator.years === 1
                  ? t("investment.after_years_singular", { years: calculator.years })
                  : t("investment.after_years_plural", { years: calculator.years })}
              </p>
              {calculator.inflationRate > 0 && (
                <>
                  <p className="text-2xl font-semibold text-success/80 mt-4">
                    ${finalData.realValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("investment.real_value", { rate: calculator.inflationRate })}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("investment.breakdown.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("investment.breakdown.total_principal")}:</span>
                <span className="font-semibold">${finalData.principal.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-muted-foreground">{t('investment.interest_earned')}:</span>
                <span className="font-semibold text-success">${finalData.interest.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="font-medium">{t("investment.breakdown.total_value")}:</span>
                <span className="font-bold text-primary text-lg">${finalData.total.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
              </div>

              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">{t("investment.breakdown.roi_label")}</p>
                <p className="text-xl font-bold text-primary">
                  {finalData.principal > 0 ? ((finalData.interest / finalData.principal) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Compound Interest Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t("investment.chart.title")}</CardTitle>
          <CardDescription>{t("investment.chart.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={compoundInterestData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" label={{ value: t("investment.chart.years"), position: "insideBottomRight", offset: -5 }} />
              <YAxis label={{ value: t("investment.chart.amount"), angle: -90, position: "insideLeft" }} />
              <Tooltip
                formatter={(value: any) => `$${(value as number).toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
              />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#0F7173" strokeWidth={2} name={t("investment.chart.total_value")} />
              <Line type="monotone" dataKey="principal" stroke="#FFD700" strokeWidth={2} name={t("investment.chart.principal_invested")} />
              <Line type="monotone" dataKey="interest" stroke="#90EE90" strokeWidth={2} name={t("investment.chart.interest_earned")} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Investment Tips Card */}
      <Card className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle>{t("investment.tips.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-primary font-bold">1.</span>
              <span>{t("investment.tips.item_1")}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">2.</span>
              <span>{t("investment.tips.item_2")}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">3.</span>
              <span>{t("investment.tips.item_3")}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">4.</span>
              <span>{t("investment.tips.item_4")}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">5.</span>
              <span>{t("investment.tips.item_5")}</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentAdvice;

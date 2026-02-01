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

const STRATEGY_BREAKDOWN: Record<string, { needs: number; wants: number; savings: number }> = {
  "50_30_20": { needs: 50, wants: 30, savings: 20 },
  pay_yourself_first: { needs: 70, wants: 10, savings: 20 },
  aggressive_saving: { needs: 40, wants: 20, savings: 40 },
  balanced: { needs: 40, wants: 30, savings: 30 },
  debt_payoff: { needs: 55, wants: 35, savings: 10 },
};

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
  const selectedBreakdown = data.selectedStrategy === "custom"
    ? data.customStrategy
    : data.selectedStrategy
    ? STRATEGY_BREAKDOWN[data.selectedStrategy]
    : undefined;
  const strategyMonthlySavings = selectedBreakdown
    ? (totalMonthlyIncome * selectedBreakdown.savings) / 100
    : monthlyAvailableSavings;
  const projectedMonthlySavings = Math.max(0, strategyMonthlySavings);

  // Income vs Expenses Chart Data
  const incomeVsExpensesData = [
    {
      name: t('nav.home'),
      [t('home.total_income')]: totalMonthlyIncome,
      [t('home.total_expenses')]: totalMonthlyExpenses,
      [t('charts.debt_payoff')]: totalMonthlyDebtPayment,
    },
  ];

  const monthlyBreakdownData = selectedBreakdown
    ? [
        {
          name: t('home.total_income'),
          value: totalMonthlyIncome,
        },
        {
          name: t('home.total_expenses'),
          value: totalMonthlyExpenses,
        },
        {
          name: t('financial_input.monthly_payment'),
          value: totalMonthlyDebtPayment,
        },
        {
          name: "Needs",
          value: (totalMonthlyIncome * selectedBreakdown.needs) / 100,
        },
        {
          name: "Wants",
          value: (totalMonthlyIncome * selectedBreakdown.wants) / 100,
        },
        {
          name: "Savings",
          value: Math.max(0, strategyMonthlySavings),
        },
      ]
    : [
        {
          name: t('home.total_income'),
          value: totalMonthlyIncome,
        },
        {
          name: t('home.total_expenses'),
          value: totalMonthlyExpenses,
        },
        {
          name: t('financial_input.monthly_payment'),
          value: totalMonthlyDebtPayment,
        },
        {
          name: t('home.total_savings'),
          value: Math.max(0, monthlyAvailableSavings),
        },
      ];

  // Short-term savings projection (3 months)
  const shortTermData = Array.from({ length: 3 }, (_, i) => ({
    month: `Month ${i + 1}`,
    savings: projectedMonthlySavings * (i + 1),
    cumulative: projectedMonthlySavings * (i + 1),
  }));

  // Long-term savings projection (12 months) with inflation adjustment
  const inflationRate = 2.5; // Default inflation rate
  const longTermData = Array.from({ length: 12 }, (_, i) => {
    const monthNumber = i + 1;
    const nominalValue = projectedMonthlySavings * monthNumber;
    const inflationFactor = Math.pow(1 + inflationRate / 100, monthNumber / 12);
    const realValue = nominalValue / inflationFactor;
    return {
      month: `M${monthNumber}`,
      savings: projectedMonthlySavings,
      cumulative: nominalValue,
      realValue: Math.round(realValue * 100) / 100,
    };
  });

  // Debt calculation helpers
  const calculateAmortization = (principal: number, rate: number, payment: number) => {
    const schedule: Array<{ month: number; principal: number; interest: number; balance: number }> = [];
    let balance = principal;
    let month = 0;
    const monthlyRate = rate / 100 / 12;

    while (balance > 0 && month < 600) { // Max 50 years to prevent infinite loops
      month++;
      const interest = balance * monthlyRate;
      const principalPayment = Math.min(payment - interest, balance);
      balance -= principalPayment;

      if (balance < 0.01) balance = 0; // Handle floating point

      schedule.push({
        month,
        principal: principalPayment,
        interest,
        balance: Math.round(balance * 100) / 100,
      });

      if (principalPayment <= 0) break; // Payment too small
    }

    return schedule;
  };

  // 1. Payoff Progression Chart - Total debt over time
  const debtProgressionData = (() => {
    const maxMonths = Math.max(...data.debts.map(d => d.remainingMonths), 1);
    const progression: Array<{ month: string; totalDebt: number; [key: string]: any }> = [];

    for (let month = 0; month <= maxMonths; month++) {
      const dataPoint: { month: string; totalDebt: number; [key: string]: any } = {
        month: month === 0 ? t('debt_analytics.now') : `M${month}`,
        totalDebt: 0,
      };

      data.debts.forEach(debt => {
        const schedule = calculateAmortization(debt.principal, debt.interestRate, debt.monthlyPayment);
        const balance = month < schedule.length ? schedule[month].balance : 0;
        dataPoint.totalDebt += balance;
        dataPoint[debt.name] = balance;
      });

      progression.push(dataPoint);
    }

    return progression;
  })();

  // 2. Interest vs Principal breakdown
  const interestVsPrincipalData = data.debts.map(debt => {
    const schedule = calculateAmortization(debt.principal, debt.interestRate, debt.monthlyPayment);
    const totalInterest = schedule.reduce((sum, month) => sum + month.interest, 0);
    const totalPrincipal = schedule.reduce((sum, month) => sum + month.principal, 0);

    return {
      name: debt.name,
      principal: Math.round(totalPrincipal * 100) / 100,
      interest: Math.round(totalInterest * 100) / 100,
      totalCost: Math.round((totalPrincipal + totalInterest) * 100) / 100,
    };
  });

  // 3. Strategy Comparison - Avalanche vs Snowball
  const strategyComparisonData = (() => {
    if (data.debts.length === 0) return [];

    const totalMinPayment = data.debts.reduce((sum, d) => sum + d.monthlyPayment, 0);

    // Avalanche: Highest interest rate first
    const avalancheDebts = [...data.debts].sort((a, b) => b.interestRate - a.interestRate);
    let avalancheMonths = 0;
    let avalancheTotalInterest = 0;
    let remainingDebts = avalancheDebts.map(d => ({ ...d, balance: d.principal }));

    while (remainingDebts.length > 0 && avalancheMonths < 600) {
      avalancheMonths++;
      let availablePayment = totalMinPayment;

      remainingDebts = remainingDebts.filter(debt => {
        const monthlyRate = debt.interestRate / 100 / 12;
        const interest = debt.balance * monthlyRate;
        avalancheTotalInterest += interest;

        const payment = Math.min(availablePayment, debt.monthlyPayment + (availablePayment - totalMinPayment));
        const principal = Math.min(payment - interest, debt.balance);
        debt.balance -= principal;
        availablePayment -= payment;

        return debt.balance > 0.01;
      });
    }

    // Snowball: Lowest balance first
    const snowballDebts = [...data.debts].sort((a, b) => a.principal - b.principal);
    let snowballMonths = 0;
    let snowballTotalInterest = 0;
    remainingDebts = snowballDebts.map(d => ({ ...d, balance: d.principal }));

    while (remainingDebts.length > 0 && snowballMonths < 600) {
      snowballMonths++;
      let availablePayment = totalMinPayment;

      remainingDebts = remainingDebts.filter(debt => {
        const monthlyRate = debt.interestRate / 100 / 12;
        const interest = debt.balance * monthlyRate;
        snowballTotalInterest += interest;

        const payment = Math.min(availablePayment, debt.monthlyPayment + (availablePayment - totalMinPayment));
        const principal = Math.min(payment - interest, debt.balance);
        debt.balance -= principal;
        availablePayment -= payment;

        return debt.balance > 0.01;
      });
    }

    return [
      {
        strategy: t('debt_analytics.avalanche'),
        months: avalancheMonths,
        totalInterest: Math.round(avalancheTotalInterest * 100) / 100,
      },
      {
        strategy: t('debt_analytics.snowball'),
        months: snowballMonths,
        totalInterest: Math.round(snowballTotalInterest * 100) / 100,
      },
    ];
  })();

  // 4. Impact of Extra Payments
  const extraPaymentImpact = (() => {
    if (data.debts.length === 0) return [];

    const scenarios = [0, 50, 100, 200, 500];

    return scenarios.map(extraPayment => {
      let totalMonths = 0;
      let totalInterest = 0;

      data.debts.forEach(debt => {
        const newPayment = debt.monthlyPayment + (extraPayment / data.debts.length);
        const schedule = calculateAmortization(debt.principal, debt.interestRate, newPayment);
        totalMonths = Math.max(totalMonths, schedule.length);
        totalInterest += schedule.reduce((sum, m) => sum + m.interest, 0);
      });

      return {
        extra: `+$${extraPayment}`,
        months: totalMonths,
        totalInterest: Math.round(totalInterest * 100) / 100,
        monthlySavings: extraPayment,
      };
    });
  })();

  // 5. Total Cost Visualization (current data showing total amounts)
  const totalCostData = data.debts.map(debt => ({
    name: debt.name,
    principal: debt.principal,
    interestRate: debt.interestRate,
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
        <h1 className="text-4xl font-bold text-foreground mb-2">{t('charts.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('charts.subtitle')}</p>
      </div>

        <Card className="bg-muted/50 border-0">
          <CardHeader>
            <CardTitle>{t('home.no_data')}</CardTitle>
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
        <h1 className="text-4xl font-bold text-foreground mb-2">{t('charts.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('charts.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Income vs Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>{t('charts.income_vs_expenses')}</CardTitle>
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
                <Bar dataKey={t('home.total_income')} fill="#0F7173" />
                <Bar dataKey={t('home.total_expenses')} fill="#FF6B6B" />
                <Bar dataKey={t('charts.debt_payoff')} fill="#FFD700" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Breakdown Pie */}
        <Card>
          <CardHeader>
            <CardTitle>{t('charts.monthly_breakdown')}</CardTitle>
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
            <CardTitle>{t('charts.short_term_savings')}</CardTitle>
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
            <CardTitle>{t('charts.long_term_savings')}</CardTitle>
            <CardDescription>Next 12 months projection (with inflation adjustment)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={longTermData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="cumulative" stroke="#0F7173" strokeWidth={2} name="Nominal Value" />
                <Line type="monotone" dataKey="realValue" stroke="#FFD700" strokeWidth={2} name="Real Value (Inflation Adjusted)" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {data.debts.length > 0 && (
        <>
          {/* Debt Analytics Section Header */}
          <div className="mt-12 mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">{t('debt_analytics.title')}</h2>
            <p className="text-muted-foreground">{t('debt_analytics.subtitle')}</p>
          </div>

          {/* 1. Debt Payoff Progression Over Time */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('debt_analytics.progression_title')}</CardTitle>
              <CardDescription>{t('debt_analytics.progression_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={debtProgressionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="totalDebt" stroke="#FF6B6B" strokeWidth={3} name={t('debt_analytics.total_debt')} />
                  {data.debts.map((debt, idx) => (
                    <Line
                      key={debt.id}
                      type="monotone"
                      dataKey={debt.name}
                      stroke={COLORS[idx % COLORS.length]}
                      strokeWidth={2}
                      strokeDasharray="3 3"
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 2. Interest vs Principal Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>{t('debt_analytics.interest_vs_principal_title')}</CardTitle>
                <CardDescription>{t('debt_analytics.interest_vs_principal_desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={interestVsPrincipalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="principal" stackId="a" fill="#0F7173" name={t('debt_analytics.principal')} />
                    <Bar dataKey="interest" stackId="a" fill="#FF6B6B" name={t('debt_analytics.interest_paid')} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p className="font-semibold">{t('debt_analytics.total_interest')}: ${interestVsPrincipalData.reduce((sum, d) => sum + d.interest, 0).toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            {/* 3. Strategy Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>{t('debt_analytics.strategy_comparison_title')}</CardTitle>
                <CardDescription>{t('debt_analytics.strategy_comparison_desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={strategyComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="strategy" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="months" fill="#4ECDC4" name={t('debt_analytics.months_to_payoff')} />
                    <Bar yAxisId="right" dataKey="totalInterest" fill="#FFD700" name={t('debt_analytics.total_interest_dollars')} />
                  </BarChart>
                </ResponsiveContainer>
                {strategyComparisonData.length === 2 && (
                  <div className="mt-4 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{t('debt_analytics.savings_with_best')}:</span> {' '}
                      ${Math.abs(strategyComparisonData[0].totalInterest - strategyComparisonData[1].totalInterest).toFixed(2)} {t('debt_analytics.in_interest')}, {' '}
                      {Math.abs(strategyComparisonData[0].months - strategyComparisonData[1].months)} {t('debt_analytics.months_faster')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 4. Impact of Extra Payments */}
            <Card>
              <CardHeader>
                <CardTitle>{t('debt_analytics.extra_payments_title')}</CardTitle>
                <CardDescription>{t('debt_analytics.extra_payments_desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={extraPaymentImpact}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="extra" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="months" stroke="#0F7173" strokeWidth={2} name={t('debt_analytics.months_to_payoff')} />
                    <Line yAxisId="right" type="monotone" dataKey="totalInterest" stroke="#FF6B6B" strokeWidth={2} name={t('debt_analytics.total_interest_dollars')} />
                  </LineChart>
                </ResponsiveContainer>
                {extraPaymentImpact.length > 1 && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>
                      <span className="font-semibold text-foreground">{t('debt_analytics.with_extra')}:</span> {t('debt_analytics.save')} ${(extraPaymentImpact[0].totalInterest - extraPaymentImpact[2].totalInterest).toFixed(2)} {t('debt_analytics.in_interest')},
                      {' '}{t('debt_analytics.finish')} {extraPaymentImpact[0].months - extraPaymentImpact[2].months} {t('debt_analytics.months_earlier')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 5. Total Cost Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>{t('debt_analytics.total_cost_title')}</CardTitle>
                <CardDescription>{t('debt_analytics.total_cost_desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={totalCostData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" label={{ value: t('debt_analytics.principal_label'), angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: t('debt_analytics.interest_rate_label'), angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="principal" fill="#0F7173" name={t('debt_analytics.principal_balance')} />
                    <Bar yAxisId="right" dataKey="interestRate" fill="#F4A460" name={t('debt_analytics.interest_rate_percent')} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {totalCostData.map((debt, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{debt.name}:</span>
                      <span className="font-semibold">${debt.principal.toFixed(2)} @ {debt.interestRate}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {expenseByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('charts.expense_breakdown')}</CardTitle>
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

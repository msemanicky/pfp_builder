import React from "react";
import { useFinance } from "@/context/FinanceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { SavingsStrategy } from "@/types/finance";

const strategies: SavingsStrategy[] = [
  {
    id: "50_30_20",
    name: "50/30/20 Rule",
    description: "50% needs, 30% wants, 20% savings",
    breakdown: {
      needs: 50,
      wants: 30,
      savings: 20,
    },
  },
  {
    id: "pay_yourself_first",
    name: "Pay Yourself First",
    description: "Save 20% first, then spend the rest",
    breakdown: {
      needs: 70,
      wants: 10,
      savings: 20,
    },
  },
  {
    id: "aggressive_saving",
    name: "Aggressive Saving",
    description: "Save 40% or more, minimum expenses",
    breakdown: {
      needs: 40,
      wants: 20,
      savings: 40,
    },
  },
  {
    id: "balanced",
    name: "Balanced Approach",
    description: "40% needs, 30% wants, 30% savings",
    breakdown: {
      needs: 40,
      wants: 30,
      savings: 30,
    },
  },
  {
    id: "debt_payoff",
    name: "Debt Payoff Focus",
    description: "Prioritize debt repayment, save 10%",
    breakdown: {
      needs: 55,
      wants: 35,
      savings: 10,
    },
  },
];

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

const SavingsStrategies: React.FC = () => {
  const { t } = useTranslation();
  const { data, setSelectedStrategy } = useFinance();

  const totalMonthlyIncome = data.incomes.reduce((sum, income) => sum + convertToMonthly(income.amount, income.frequency), 0);
  const totalMonthlyExpenses = data.expenses.reduce((sum, expense) => sum + convertToMonthly(expense.amount, expense.frequency), 0);

  const hasData = data.incomes.length > 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">{t("savings_strategies.title")}</h1>
        <p className="text-lg text-muted-foreground">{t("savings_strategies.subtitle")}</p>
      </div>

      {!hasData ? (
        <div className="max-w-md mx-auto text-center">
          <Card className="bg-muted/50 border-0">
            <CardHeader>
              <CardTitle>{t("home.no_data")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Add your income and expenses to see personalized strategy recommendations.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Strategy Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies.map((strategy) => (
              <Card
                key={strategy.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  data.selectedStrategy === strategy.id
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{t(`strategy.${strategy.id}.name`)}</CardTitle>
                      <CardDescription className="mt-1">{t(`strategy.${strategy.id}.description`)}</CardDescription>
                    </div>
                    {data.selectedStrategy === strategy.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Breakdown Visualization */}
                  <div className="space-y-2">
                    <div className="flex gap-2 h-8 rounded-lg overflow-hidden bg-muted">
                      <div
                        className="bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground"
                        style={{ width: `${strategy.breakdown.needs}%` }}
                      >
                        {strategy.breakdown.needs > 15 && `${strategy.breakdown.needs}%`}
                      </div>
                      <div
                        className="bg-warning flex items-center justify-center text-xs font-semibold text-warning-foreground"
                        style={{ width: `${strategy.breakdown.wants}%` }}
                      >
                        {strategy.breakdown.wants > 15 && `${strategy.breakdown.wants}%`}
                      </div>
                      <div
                        className="bg-success flex items-center justify-center text-xs font-semibold text-success-foreground"
                        style={{ width: `${strategy.breakdown.savings}%` }}
                      >
                        {strategy.breakdown.savings > 15 && `${strategy.breakdown.savings}%`}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-semibold text-primary">{strategy.breakdown.needs}%</div>
                        <div className="text-muted-foreground">Needs</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-warning">{strategy.breakdown.wants}%</div>
                        <div className="text-muted-foreground">Wants</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-success">{strategy.breakdown.savings}%</div>
                        <div className="text-muted-foreground">Savings</div>
                      </div>
                    </div>
                  </div>

                  {/* Dollar Amounts (if income exists) */}
                  {totalMonthlyIncome > 0 && (
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Needs ({strategy.breakdown.needs}%):</span>
                        <span className="font-semibold">${((totalMonthlyIncome * strategy.breakdown.needs) / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Wants ({strategy.breakdown.wants}%):</span>
                        <span className="font-semibold">${((totalMonthlyIncome * strategy.breakdown.wants) / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2">
                        <span className="text-muted-foreground font-medium">Savings ({strategy.breakdown.savings}%):</span>
                        <span className="font-bold text-success">${((totalMonthlyIncome * strategy.breakdown.savings) / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Select Button */}
                  <Button
                    onClick={() => setSelectedStrategy(strategy.id)}
                    variant={data.selectedStrategy === strategy.id ? "default" : "outline"}
                    className="w-full"
                  >
                    {data.selectedStrategy === strategy.id ? t("savings_strategies.selected") : t("savings_strategies.select")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Current Situation Analysis */}
          {totalMonthlyIncome > 0 && (
            <Card className="mt-8 bg-gradient-to-br from-muted/50 to-muted/30">
              <CardHeader>
                <CardTitle>Your Current Financial Situation</CardTitle>
                <CardDescription>Based on your income and expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Monthly Income</p>
                    <p className="text-2xl font-bold text-foreground">${totalMonthlyIncome.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Monthly Expenses</p>
                    <p className="text-2xl font-bold text-foreground">${totalMonthlyExpenses.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Available for Savings</p>
                    <p className={`text-2xl font-bold ${(totalMonthlyIncome - totalMonthlyExpenses) >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ${(totalMonthlyIncome - totalMonthlyExpenses).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-background rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Strategy Recommendation:</p>
                  {data.selectedStrategy ? (
                    <p className="text-foreground font-medium">
                      You've selected <span className="text-primary">{t(`strategy.${data.selectedStrategy}.name`)}</span>. This strategy suggests saving {strategies.find(s => s.id === data.selectedStrategy)?.breakdown.savings}% of your income monthly.
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      Select a strategy above to get personalized recommendations based on your financial situation.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default SavingsStrategies;

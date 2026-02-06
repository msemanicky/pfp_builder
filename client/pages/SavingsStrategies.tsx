import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFinance } from "@/context/FinanceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

const strategies = [
  {
    id: "50_30_20",
    nameKey: "strategy.50_30_20.name",
    descriptionKey: "strategy.50_30_20.description",
    breakdown: {
      needs: 50,
      wants: 30,
      savings: 20,
    },
  },
  {
    id: "pay_yourself_first",
    nameKey: "strategy.pay_yourself_first.name",
    descriptionKey: "strategy.pay_yourself_first.description",
    breakdown: {
      needs: 70,
      wants: 10,
      savings: 20,
    },
  },
  {
    id: "aggressive_saving",
    nameKey: "strategy.aggressive_saving.name",
    descriptionKey: "strategy.aggressive_saving.description",
    breakdown: {
      needs: 40,
      wants: 20,
      savings: 40,
    },
  },
  {
    id: "balanced",
    nameKey: "strategy.balanced.name",
    descriptionKey: "strategy.balanced.description",
    breakdown: {
      needs: 40,
      wants: 30,
      savings: 30,
    },
  },
  {
    id: "debt_payoff",
    nameKey: "strategy.debt_payoff.name",
    descriptionKey: "strategy.debt_payoff.description",
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
  const { data, setSelectedStrategy, setCustomStrategy } = useFinance();
  
  const [customBreakdown, setCustomBreakdown] = useState(data.customStrategy);

  const totalMonthlyIncome = data.incomes.reduce((sum, income) => sum + convertToMonthly(income.amount, income.frequency), 0);
  const totalMonthlyExpenses = data.expenses.reduce((sum, expense) => sum + convertToMonthly(expense.amount, expense.frequency), 0);
  const totalCustomPercent = customBreakdown.needs + customBreakdown.wants + customBreakdown.savings;
  const selectedStrategyData = strategies.find((strategy) => strategy.id === data.selectedStrategy);
  const selectedStrategyName = data.selectedStrategy === "custom"
    ? t("savings_strategies.custom.title")
    : selectedStrategyData
      ? t(selectedStrategyData.nameKey)
      : null;
  const selectedStrategySavings = data.selectedStrategy === "custom"
    ? data.customStrategy.savings
    : selectedStrategyData?.breakdown.savings;

  const hasData = data.incomes.length > 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">{t('savings_strategies.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('savings_strategies.subtitle')}</p>
      </div>

      {!hasData ? (
        <div className="max-w-md mx-auto text-center">
          <Card className="bg-muted/50 border-0">
            <CardHeader>
              <CardTitle>{t('home.no_data')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t("savings_strategies.no_data_hint")}
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
                      <CardTitle className="text-lg">{t(strategy.nameKey)}</CardTitle>
                      <CardDescription className="mt-1">{t(strategy.descriptionKey)}</CardDescription>
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
                        <div className="text-muted-foreground">{t("savings_strategies.needs")}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-warning">{strategy.breakdown.wants}%</div>
                        <div className="text-muted-foreground">{t("savings_strategies.wants")}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-success">{strategy.breakdown.savings}%</div>
                        <div className="text-muted-foreground">{t("savings_strategies.savings")}</div>
                      </div>
                    </div>
                  </div>

                  {/* Dollar Amounts (if income exists) */}
                  {totalMonthlyIncome > 0 && (
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t("savings_strategies.amount_label", {
                            label: t("savings_strategies.needs"),
                            percent: strategy.breakdown.needs,
                          })}
                        </span>
                        <span className="font-semibold">${((totalMonthlyIncome * strategy.breakdown.needs) / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t("savings_strategies.amount_label", {
                            label: t("savings_strategies.wants"),
                            percent: strategy.breakdown.wants,
                          })}
                        </span>
                        <span className="font-semibold">${((totalMonthlyIncome * strategy.breakdown.wants) / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2">
                        <span className="text-muted-foreground font-medium">
                          {t("savings_strategies.amount_label", {
                            label: t("savings_strategies.savings"),
                            percent: strategy.breakdown.savings,
                          })}
                        </span>
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
                    {data.selectedStrategy === strategy.id ? t('savings_strategies.selected') : t('savings_strategies.select')}
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            {/* Custom Strategy Card */}
            <Card
              className={`transition-all hover:shadow-lg ${
                data.selectedStrategy === "custom"
                  ? "ring-2 ring-primary border-primary"
                  : "hover:border-primary"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{t("savings_strategies.custom.title")}</CardTitle>
                    <CardDescription className="mt-1">{t("savings_strategies.custom.description")}</CardDescription>
                  </div>
                  {data.selectedStrategy === "custom" && (
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Custom Input Fields */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">{t("savings_strategies.custom.needs_label")}</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={customBreakdown.needs}
                      onChange={(e) => {
                        const needs = parseInt(e.target.value) || 0;
                        setCustomBreakdown({ ...customBreakdown, needs });
                      }}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t("savings_strategies.custom.wants_label")}</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={customBreakdown.wants}
                      onChange={(e) => {
                        const wants = parseInt(e.target.value) || 0;
                        setCustomBreakdown({ ...customBreakdown, wants });
                      }}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t("savings_strategies.custom.savings_label")}</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={customBreakdown.savings}
                      onChange={(e) => {
                        const savings = parseInt(e.target.value) || 0;
                        setCustomBreakdown({ ...customBreakdown, savings });
                      }}
                      className="h-8"
                    />
                  </div>
                  
                  {/* Total Validation */}
                  <div className="text-xs">
                    <span className={`font-medium ${
                      totalCustomPercent === 100
                        ? "text-success"
                        : "text-destructive"
                    }`}>
                      {t("savings_strategies.custom.total_label", { total: totalCustomPercent })}
                    </span>
                    {totalCustomPercent !== 100 && (
                      <span className="text-muted-foreground ml-2">{t("savings_strategies.custom.total_hint")}</span>
                    )}
                  </div>
                </div>

                {/* Breakdown Visualization */}
                <div className="space-y-2">
                  <div className="flex gap-2 h-8 rounded-lg overflow-hidden bg-muted">
                    <div
                      className="bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground"
                      style={{ width: `${customBreakdown.needs}%` }}
                    >
                      {customBreakdown.needs > 15 && `${customBreakdown.needs}%`}
                    </div>
                    <div
                      className="bg-warning flex items-center justify-center text-xs font-semibold text-warning-foreground"
                      style={{ width: `${customBreakdown.wants}%` }}
                    >
                      {customBreakdown.wants > 15 && `${customBreakdown.wants}%`}
                    </div>
                    <div
                      className="bg-success flex items-center justify-center text-xs font-semibold text-success-foreground"
                      style={{ width: `${customBreakdown.savings}%` }}
                    >
                      {customBreakdown.savings > 15 && `${customBreakdown.savings}%`}
                    </div>
                  </div>
                </div>

                {/* Dollar Amounts */}
                {totalMonthlyIncome > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("savings_strategies.amount_label", {
                          label: t("savings_strategies.needs"),
                          percent: customBreakdown.needs,
                        })}
                      </span>
                      <span className="font-semibold">${((totalMonthlyIncome * customBreakdown.needs) / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("savings_strategies.amount_label", {
                          label: t("savings_strategies.wants"),
                          percent: customBreakdown.wants,
                        })}
                      </span>
                      <span className="font-semibold">${((totalMonthlyIncome * customBreakdown.wants) / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2">
                      <span className="text-muted-foreground font-medium">
                        {t("savings_strategies.amount_label", {
                          label: t("savings_strategies.savings"),
                          percent: customBreakdown.savings,
                        })}
                      </span>
                      <span className="font-bold text-success">${((totalMonthlyIncome * customBreakdown.savings) / 100).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Apply Button */}
                <Button
                  onClick={() => {
                    if (totalCustomPercent === 100) {
                      setCustomStrategy(customBreakdown);
                      setSelectedStrategy("custom");
                    }
                  }}
                  variant={data.selectedStrategy === "custom" ? "default" : "outline"}
                  className="w-full"
                  disabled={totalCustomPercent !== 100}
                >
                  {data.selectedStrategy === "custom"
                    ? t("savings_strategies.selected_button")
                    : t("savings_strategies.custom.apply")}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Current Situation Analysis */}
          {totalMonthlyIncome > 0 && (
            <Card className="mt-8 bg-gradient-to-br from-muted/50 to-muted/30">
              <CardHeader>
                <CardTitle>{t("savings_strategies.current.title")}</CardTitle>
                <CardDescription>{t("savings_strategies.current.subtitle")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t("savings_strategies.current.monthly_income")}</p>
                    <p className="text-2xl font-bold text-foreground">${totalMonthlyIncome.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t("savings_strategies.current.monthly_expenses")}</p>
                    <p className="text-2xl font-bold text-foreground">${totalMonthlyExpenses.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t("savings_strategies.current.available_savings")}</p>
                    <p className={`text-2xl font-bold ${(totalMonthlyIncome - totalMonthlyExpenses) >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ${(totalMonthlyIncome - totalMonthlyExpenses).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-background rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-2">{t("savings_strategies.recommendation.title")}</p>
                  {data.selectedStrategy && selectedStrategyName && typeof selectedStrategySavings === "number" ? (
                    <p className="text-foreground font-medium">
                      {t("savings_strategies.recommendation.with_selection", {
                        strategy: selectedStrategyName,
                        percent: selectedStrategySavings,
                      })}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      {t("savings_strategies.recommendation.no_selection")}
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

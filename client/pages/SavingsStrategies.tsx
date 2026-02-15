import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFinance } from "@/context/FinanceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Info } from "lucide-react";
import InteractiveSplitBar from "@/components/InteractiveSplitBar";

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

  // Calculate actual allocation based on categorized expenses
  const actualNeedsExpenses = data.expenses
    .filter(expense => expense.type === "need")
    .reduce((sum, expense) => sum + convertToMonthly(expense.amount, expense.frequency), 0);
  const actualWantsExpenses = data.expenses
    .filter(expense => expense.type === "want")
    .reduce((sum, expense) => sum + convertToMonthly(expense.amount, expense.frequency), 0);
  const actualSavingsExpenses = data.expenses
    .filter(expense => expense.type === "savings")
    .reduce((sum, expense) => sum + convertToMonthly(expense.amount, expense.frequency), 0);
  // Actual savings includes both savings-type expenses and leftover income
  const actualSavings = actualSavingsExpenses + (totalMonthlyIncome - totalMonthlyExpenses);

  // Calculate actual percentages
  const actualNeedsPercent = totalMonthlyIncome > 0 ? (actualNeedsExpenses / totalMonthlyIncome) * 100 : 0;
  const actualWantsPercent = totalMonthlyIncome > 0 ? (actualWantsExpenses / totalMonthlyIncome) * 100 : 0;
  const actualSavingsPercent = totalMonthlyIncome > 0 ? (actualSavings / totalMonthlyIncome) * 100 : 0;

  const selectedStrategyData = strategies.find((strategy) => strategy.id === data.selectedStrategy);
  const selectedStrategyName = data.selectedStrategy === "custom"
    ? t("savings_strategies.custom.title")
    : selectedStrategyData
      ? t(selectedStrategyData.nameKey)
      : null;
  const selectedStrategySavings = data.selectedStrategy === "custom"
    ? data.customStrategy.savings
    : selectedStrategyData?.breakdown.savings;

  const selectedStrategyBreakdown = data.selectedStrategy === "custom"
    ? data.customStrategy
    : selectedStrategyData?.breakdown;

  const hasData = data.incomes.length > 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">{t('savings_strategies.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('savings_strategies.subtitle')}</p>
      </div>

      {/* Terms Explanation Card */}
      <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">{t('savings_strategies.terms_explanation')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <h3 className="font-semibold text-primary">{t('savings_strategies.needs')}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t('savings_strategies.needs_desc')}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <h3 className="font-semibold text-warning">{t('savings_strategies.wants')}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t('savings_strategies.wants_desc')}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <h3 className="font-semibold text-success">{t('savings_strategies.savings')}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t('savings_strategies.savings_desc')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                {/* Interactive Split Bar */}
                <InteractiveSplitBar
                  needs={customBreakdown.needs}
                  wants={customBreakdown.wants}
                  savings={customBreakdown.savings}
                  onChange={(values) => setCustomBreakdown(values)}
                  labels={{
                    needs: t("savings_strategies.needs"),
                    wants: t("savings_strategies.wants"),
                    savings: t("savings_strategies.savings"),
                  }}
                />

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
                    setCustomStrategy(customBreakdown);
                    setSelectedStrategy("custom");
                  }}
                  variant={data.selectedStrategy === "custom" ? "default" : "outline"}
                  className="w-full"
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

          {/* Actual vs Recommended Comparison */}
          {totalMonthlyIncome > 0 && data.selectedStrategy && selectedStrategyBreakdown && data.expenses.length > 0 && (
            <Card className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-900">
              <CardHeader>
                <CardTitle>{t("savings_strategies.actual_allocation.title")}</CardTitle>
                <CardDescription>{t("savings_strategies.actual_allocation.subtitle")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Needs Comparison */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="font-semibold text-primary">{t("savings_strategies.needs")}</span>
                      </div>
                      <div className="text-sm">
                        {actualNeedsPercent > selectedStrategyBreakdown.needs ? (
                          <span className="text-destructive font-medium">
                            {t("savings_strategies.comparison.over", { amount: (actualNeedsPercent - selectedStrategyBreakdown.needs).toFixed(1) })}
                          </span>
                        ) : actualNeedsPercent < selectedStrategyBreakdown.needs ? (
                          <span className="text-success font-medium">
                            {t("savings_strategies.comparison.under", { amount: (selectedStrategyBreakdown.needs - actualNeedsPercent).toFixed(1) })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{t("savings_strategies.comparison.on_target")}</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">{t("savings_strategies.comparison.recommended")}</p>
                        <p className="text-lg font-bold text-primary">{selectedStrategyBreakdown.needs}%</p>
                        <p className="text-xs text-muted-foreground">${((totalMonthlyIncome * selectedStrategyBreakdown.needs) / 100).toFixed(2)}</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">{t("savings_strategies.comparison.actual")}</p>
                        <p className="text-lg font-bold text-primary">{actualNeedsPercent.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">${actualNeedsExpenses.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Wants Comparison */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-warning"></div>
                        <span className="font-semibold text-warning">{t("savings_strategies.wants")}</span>
                      </div>
                      <div className="text-sm">
                        {actualWantsPercent > selectedStrategyBreakdown.wants ? (
                          <span className="text-destructive font-medium">
                            {t("savings_strategies.comparison.over", { amount: (actualWantsPercent - selectedStrategyBreakdown.wants).toFixed(1) })}
                          </span>
                        ) : actualWantsPercent < selectedStrategyBreakdown.wants ? (
                          <span className="text-success font-medium">
                            {t("savings_strategies.comparison.under", { amount: (selectedStrategyBreakdown.wants - actualWantsPercent).toFixed(1) })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{t("savings_strategies.comparison.on_target")}</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">{t("savings_strategies.comparison.recommended")}</p>
                        <p className="text-lg font-bold text-warning">{selectedStrategyBreakdown.wants}%</p>
                        <p className="text-xs text-muted-foreground">${((totalMonthlyIncome * selectedStrategyBreakdown.wants) / 100).toFixed(2)}</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">{t("savings_strategies.comparison.actual")}</p>
                        <p className="text-lg font-bold text-warning">{actualWantsPercent.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">${actualWantsExpenses.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Savings Comparison */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-success"></div>
                        <span className="font-semibold text-success">{t("savings_strategies.savings")}</span>
                      </div>
                      <div className="text-sm">
                        {actualSavingsPercent < selectedStrategyBreakdown.savings ? (
                          <span className="text-destructive font-medium">
                            {t("savings_strategies.comparison.under", { amount: (selectedStrategyBreakdown.savings - actualSavingsPercent).toFixed(1) })}
                          </span>
                        ) : actualSavingsPercent > selectedStrategyBreakdown.savings ? (
                          <span className="text-success font-medium">
                            {t("savings_strategies.comparison.over", { amount: (actualSavingsPercent - selectedStrategyBreakdown.savings).toFixed(1) })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{t("savings_strategies.comparison.on_target")}</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">{t("savings_strategies.comparison.recommended")}</p>
                        <p className="text-lg font-bold text-success">{selectedStrategyBreakdown.savings}%</p>
                        <p className="text-xs text-muted-foreground">${((totalMonthlyIncome * selectedStrategyBreakdown.savings) / 100).toFixed(2)}</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">{t("savings_strategies.comparison.actual")}</p>
                        <p className="text-lg font-bold text-success">{actualSavingsPercent.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">${actualSavings.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
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

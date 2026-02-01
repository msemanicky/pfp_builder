import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFinance } from "@/context/FinanceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const { data, setSelectedStrategy, setCustomStrategy } = useFinance();

  const [customBreakdown, setCustomBreakdown] = useState(data.customStrategy);
  const [isDragging, setIsDragging] = useState<'needs-wants' | 'wants-savings' | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Auto-adjust to maintain 100% total
  const adjustBreakdown = (field: 'needs' | 'wants' | 'savings', value: number) => {
    const clampedValue = Math.max(0, Math.min(100, value));

    if (field === 'needs') {
      const remaining = 100 - clampedValue;
      const currentOthers = customBreakdown.wants + customBreakdown.savings;
      const ratio = currentOthers > 0 ? remaining / currentOthers : 0.5;

      setCustomBreakdown({
        needs: Math.round(clampedValue),
        wants: currentOthers > 0 ? Math.round(customBreakdown.wants * ratio) : Math.round(remaining * 0.5),
        savings: currentOthers > 0 ? Math.round(customBreakdown.savings * ratio) : Math.round(remaining * 0.5),
      });
    } else if (field === 'wants') {
      const remaining = 100 - clampedValue;
      const currentOthers = customBreakdown.needs + customBreakdown.savings;
      const ratio = currentOthers > 0 ? remaining / currentOthers : 0.5;

      setCustomBreakdown({
        needs: currentOthers > 0 ? Math.round(customBreakdown.needs * ratio) : Math.round(remaining * 0.5),
        wants: Math.round(clampedValue),
        savings: currentOthers > 0 ? Math.round(customBreakdown.savings * ratio) : Math.round(remaining * 0.5),
      });
    } else {
      const remaining = 100 - clampedValue;
      const currentOthers = customBreakdown.needs + customBreakdown.wants;
      const ratio = currentOthers > 0 ? remaining / currentOthers : 0.5;

      setCustomBreakdown({
        needs: currentOthers > 0 ? Math.round(customBreakdown.needs * ratio) : Math.round(remaining * 0.5),
        wants: currentOthers > 0 ? Math.round(customBreakdown.wants * ratio) : Math.round(remaining * 0.5),
        savings: Math.round(clampedValue),
      });
    }
  };

  // Handle dragging on the progress bar
  const handleDragStart = (boundary: 'needs-wants' | 'wants-savings') => {
    setIsDragging(boundary);
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !barRef.current) return;

    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

    if (isDragging === 'needs-wants') {
      // Dragging the boundary between needs and wants
      const newNeeds = Math.round(percentage);
      const remaining = 100 - newNeeds;
      const currentOthers = customBreakdown.wants + customBreakdown.savings;
      const ratio = currentOthers > 0 ? remaining / currentOthers : 0.5;

      setCustomBreakdown({
        needs: newNeeds,
        wants: Math.round(customBreakdown.wants * ratio),
        savings: Math.round(customBreakdown.savings * ratio),
      });
    } else if (isDragging === 'wants-savings') {
      // Dragging the boundary between wants and savings
      const needsWants = Math.round(percentage);
      const newWants = needsWants - customBreakdown.needs;
      const newSavings = 100 - needsWants;

      if (newWants >= 0 && newSavings >= 0) {
        setCustomBreakdown({
          needs: customBreakdown.needs,
          wants: newWants,
          savings: newSavings,
        });
      }
    }
  };

  const handleDragEnd = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        if (!barRef.current) return;

        const rect = barRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

        if (isDragging === 'needs-wants') {
          const newNeeds = Math.round(percentage);
          const remaining = 100 - newNeeds;
          const currentOthers = customBreakdown.wants + customBreakdown.savings;
          const ratio = currentOthers > 0 ? remaining / currentOthers : 0.5;

          setCustomBreakdown({
            needs: newNeeds,
            wants: Math.round(customBreakdown.wants * ratio),
            savings: Math.round(customBreakdown.savings * ratio),
          });
        } else if (isDragging === 'wants-savings') {
          const needsWants = Math.round(percentage);
          const newWants = needsWants - customBreakdown.needs;
          const newSavings = 100 - needsWants;

          if (newWants >= 0 && newSavings >= 0) {
            setCustomBreakdown({
              needs: customBreakdown.needs,
              wants: newWants,
              savings: newSavings,
            });
          }
        }
      };

      const handleMouseUp = () => {
        setIsDragging(null);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, customBreakdown]);

  const totalMonthlyIncome = data.incomes.reduce((sum, income) => sum + convertToMonthly(income.amount, income.frequency), 0);
  const totalMonthlyExpenses = data.expenses.reduce((sum, expense) => sum + convertToMonthly(expense.amount, expense.frequency), 0);

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
                      <CardTitle className="text-lg">{strategy.name}</CardTitle>
                      <CardDescription className="mt-1">{strategy.description}</CardDescription>
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
                    <CardTitle className="text-lg">Custom Strategy</CardTitle>
                    <CardDescription className="mt-1">Create your own allocation</CardDescription>
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
                    <Label className="text-xs">Needs (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={customBreakdown.needs}
                      onChange={(e) => {
                        const needs = parseInt(e.target.value) || 0;
                        adjustBreakdown('needs', needs);
                      }}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Wants (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={customBreakdown.wants}
                      onChange={(e) => {
                        const wants = parseInt(e.target.value) || 0;
                        adjustBreakdown('wants', wants);
                      }}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Savings (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={customBreakdown.savings}
                      onChange={(e) => {
                        const savings = parseInt(e.target.value) || 0;
                        adjustBreakdown('savings', savings);
                      }}
                      className="h-8"
                    />
                  </div>

                  {/* Total Validation */}
                  <div className="text-xs">
                    <span className="font-medium text-success">
                      Total: {customBreakdown.needs + customBreakdown.wants + customBreakdown.savings}%
                    </span>
                    <span className="text-muted-foreground ml-2">(auto-adjusted)</span>
                  </div>
                </div>

                {/* Interactive Breakdown Visualization */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Drag the dividers to adjust</Label>
                  <div
                    ref={barRef}
                    className="relative h-12 rounded-lg overflow-hidden bg-muted select-none"
                    style={{ cursor: isDragging ? 'col-resize' : 'default' }}
                  >
                    {/* Needs section */}
                    <div
                      className="absolute top-0 left-0 h-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground transition-all"
                      style={{ width: `${customBreakdown.needs}%` }}
                    >
                      <span>Needs {customBreakdown.needs}%</span>
                    </div>

                    {/* Wants section */}
                    <div
                      className="absolute top-0 h-full bg-warning flex items-center justify-center text-xs font-semibold text-warning-foreground transition-all"
                      style={{
                        left: `${customBreakdown.needs}%`,
                        width: `${customBreakdown.wants}%`,
                      }}
                    >
                      <span>Wants {customBreakdown.wants}%</span>
                    </div>

                    {/* Savings section */}
                    <div
                      className="absolute top-0 right-0 h-full bg-success flex items-center justify-center text-xs font-semibold text-success-foreground transition-all"
                      style={{ width: `${customBreakdown.savings}%` }}
                    >
                      <span>Savings {customBreakdown.savings}%</span>
                    </div>

                    {/* Draggable handle between Needs and Wants */}
                    <div
                      className="absolute top-0 h-full w-1 bg-background cursor-col-resize hover:w-2 hover:bg-primary/50 transition-all z-10 group"
                      style={{ left: `${customBreakdown.needs}%`, transform: 'translateX(-50%)' }}
                      onMouseDown={() => handleDragStart('needs-wants')}
                    >
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-background border-2 border-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-0.5 h-4 bg-primary"></div>
                      </div>
                    </div>

                    {/* Draggable handle between Wants and Savings */}
                    <div
                      className="absolute top-0 h-full w-1 bg-background cursor-col-resize hover:w-2 hover:bg-primary/50 transition-all z-10 group"
                      style={{ left: `${customBreakdown.needs + customBreakdown.wants}%`, transform: 'translateX(-50%)' }}
                      onMouseDown={() => handleDragStart('wants-savings')}
                    >
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-background border-2 border-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-0.5 h-4 bg-primary"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dollar Amounts */}
                {totalMonthlyIncome > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Needs ({customBreakdown.needs}%):</span>
                      <span className="font-semibold">${((totalMonthlyIncome * customBreakdown.needs) / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wants ({customBreakdown.wants}%):</span>
                      <span className="font-semibold">${((totalMonthlyIncome * customBreakdown.wants) / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2">
                      <span className="text-muted-foreground font-medium">Savings ({customBreakdown.savings}%):</span>
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
                  {data.selectedStrategy === "custom" ? "✓ Selected" : "Apply Custom Strategy"}
                </Button>
              </CardContent>
            </Card>
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
                      {t('savings_strategies.select')} <span className="text-primary">{strategies.find(s => s.id === data.selectedStrategy)?.name}</span>. This strategy suggests saving {strategies.find(s => s.id === data.selectedStrategy)?.breakdown.savings}% of your income monthly.
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

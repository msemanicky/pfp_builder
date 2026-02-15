export interface StrategyDefinition {
  id: string;
  nameKey: string;
  descriptionKey: string;
  breakdown: {
    needs: number;
    wants: number;
    savings: number;
  };
}

export const STRATEGIES: StrategyDefinition[] = [
  {
    id: "50_30_20",
    nameKey: "strategy.50_30_20.name",
    descriptionKey: "strategy.50_30_20.description",
    breakdown: { needs: 50, wants: 30, savings: 20 },
  },
  {
    id: "pay_yourself_first",
    nameKey: "strategy.pay_yourself_first.name",
    descriptionKey: "strategy.pay_yourself_first.description",
    breakdown: { needs: 70, wants: 10, savings: 20 },
  },
  {
    id: "aggressive_saving",
    nameKey: "strategy.aggressive_saving.name",
    descriptionKey: "strategy.aggressive_saving.description",
    breakdown: { needs: 40, wants: 20, savings: 40 },
  },
  {
    id: "balanced",
    nameKey: "strategy.balanced.name",
    descriptionKey: "strategy.balanced.description",
    breakdown: { needs: 40, wants: 30, savings: 30 },
  },
  {
    id: "debt_payoff",
    nameKey: "strategy.debt_payoff.name",
    descriptionKey: "strategy.debt_payoff.description",
    breakdown: { needs: 55, wants: 35, savings: 10 },
  },
];

export const STRATEGY_BREAKDOWN: Record<
  string,
  { needs: number; wants: number; savings: number }
> = Object.fromEntries(STRATEGIES.map((s) => [s.id, s.breakdown]));

export const STRATEGY_SAVINGS_PERCENT: Record<string, number> = Object.fromEntries(
  STRATEGIES.map((s) => [s.id, s.breakdown.savings]),
);

export const DEFAULT_CUSTOM_STRATEGY = {
  needs: 50,
  wants: 30,
  savings: 20,
};

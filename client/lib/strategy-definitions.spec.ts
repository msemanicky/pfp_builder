import { describe, it, expect } from "vitest";
import {
  STRATEGIES,
  STRATEGY_BREAKDOWN,
  STRATEGY_SAVINGS_PERCENT,
  DEFAULT_CUSTOM_STRATEGY,
} from "./strategy-definitions";

describe("STRATEGIES", () => {
  it("all strategies have breakdowns summing to 100", () => {
    for (const strategy of STRATEGIES) {
      const { needs, wants, savings } = strategy.breakdown;
      expect(needs + wants + savings).toBe(100);
    }
  });

  it("all strategy percentages are non-negative", () => {
    for (const strategy of STRATEGIES) {
      expect(strategy.breakdown.needs).toBeGreaterThanOrEqual(0);
      expect(strategy.breakdown.wants).toBeGreaterThanOrEqual(0);
      expect(strategy.breakdown.savings).toBeGreaterThanOrEqual(0);
    }
  });

  it("all strategies have required fields", () => {
    for (const strategy of STRATEGIES) {
      expect(strategy.id).toBeTruthy();
      expect(strategy.nameKey).toBeTruthy();
      expect(strategy.descriptionKey).toBeTruthy();
      expect(strategy.breakdown).toBeDefined();
    }
  });
});

describe("STRATEGY_SAVINGS_PERCENT", () => {
  it("matches STRATEGIES savings values", () => {
    for (const strategy of STRATEGIES) {
      expect(STRATEGY_SAVINGS_PERCENT[strategy.id]).toBe(strategy.breakdown.savings);
    }
  });
});

describe("STRATEGY_BREAKDOWN", () => {
  it("matches STRATEGIES breakdown values", () => {
    for (const strategy of STRATEGIES) {
      expect(STRATEGY_BREAKDOWN[strategy.id]).toEqual(strategy.breakdown);
    }
  });
});

describe("DEFAULT_CUSTOM_STRATEGY", () => {
  it("sums to 100", () => {
    const { needs, wants, savings } = DEFAULT_CUSTOM_STRATEGY;
    expect(needs + wants + savings).toBe(100);
  });
});

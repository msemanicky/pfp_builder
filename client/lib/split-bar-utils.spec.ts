import { describe, it, expect } from "vitest";
import {
  normalizeSplit,
  calculateSplitFromDivider,
  calculateSplitFromKeyboard,
  type SplitValues,
} from "./split-bar-utils";

function sumsTo100(v: SplitValues) {
  expect(v.needs + v.wants + v.savings).toBe(100);
}

describe("normalizeSplit", () => {
  it("returns unchanged when already summing to 100", () => {
    const result = normalizeSplit(50, 30, 20);
    expect(result).toEqual({ needs: 50, wants: 30, savings: 20 });
  });

  it("scales up when sum is less than 100", () => {
    const result = normalizeSplit(25, 15, 10);
    expect(result.needs).toBe(50);
    expect(result.wants).toBe(30);
    expect(result.savings).toBe(20);
    sumsTo100(result);
  });

  it("scales down when sum is greater than 100", () => {
    const result = normalizeSplit(100, 60, 40);
    expect(result.needs).toBe(50);
    expect(result.wants).toBe(30);
    expect(result.savings).toBe(20);
  });

  it("handles all zeros", () => {
    const result = normalizeSplit(0, 0, 0);
    expect(result).toEqual({ needs: 0, wants: 0, savings: 0 });
  });

  it("handles single non-zero value", () => {
    const result = normalizeSplit(50, 0, 0);
    expect(result.needs).toBe(100);
    expect(result.wants).toBe(0);
    expect(result.savings).toBe(0);
  });
});

describe("calculateSplitFromDivider - divider1 (needs↔wants)", () => {
  it("adjusts needs and wants keeping savings fixed", () => {
    const result = calculateSplitFromDivider(60, "divider1", { needs: 50, wants: 30, savings: 20 });
    expect(result.needs).toBe(60);
    expect(result.wants).toBe(20);
    expect(result.savings).toBe(20);
    sumsTo100(result);
  });

  it("clamps needs to minimum 1", () => {
    const result = calculateSplitFromDivider(-10, "divider1", { needs: 50, wants: 30, savings: 20 });
    expect(result.needs).toBe(1);
    expect(result.savings).toBe(20);
    sumsTo100(result);
  });

  it("clamps needs so wants stays >= 1", () => {
    const result = calculateSplitFromDivider(95, "divider1", { needs: 50, wants: 30, savings: 20 });
    expect(result.needs).toBe(79); // 100 - 20 - 1 = 79
    expect(result.wants).toBe(1);
    expect(result.savings).toBe(20);
    sumsTo100(result);
  });

  it("always sums to 100", () => {
    for (let p = -10; p <= 110; p += 5) {
      const result = calculateSplitFromDivider(p, "divider1", { needs: 40, wants: 30, savings: 30 });
      sumsTo100(result);
    }
  });
});

describe("calculateSplitFromDivider - divider2 (wants↔savings)", () => {
  it("adjusts wants and savings keeping needs fixed", () => {
    const result = calculateSplitFromDivider(70, "divider2", { needs: 50, wants: 30, savings: 20 });
    expect(result.needs).toBe(50);
    expect(result.wants).toBe(20);
    expect(result.savings).toBe(30);
    sumsTo100(result);
  });

  it("clamps so savings >= 1", () => {
    const result = calculateSplitFromDivider(100, "divider2", { needs: 50, wants: 30, savings: 20 });
    expect(result.savings).toBe(1);
    expect(result.needs).toBe(50);
    sumsTo100(result);
  });

  it("clamps so wants >= 1", () => {
    const result = calculateSplitFromDivider(40, "divider2", { needs: 50, wants: 30, savings: 20 });
    expect(result.needs).toBe(50);
    expect(result.wants).toBe(1);
    expect(result.savings).toBe(49);
    sumsTo100(result);
  });

  it("always sums to 100", () => {
    for (let p = -10; p <= 110; p += 5) {
      const result = calculateSplitFromDivider(p, "divider2", { needs: 40, wants: 30, savings: 30 });
      sumsTo100(result);
    }
  });
});

describe("calculateSplitFromKeyboard - divider1", () => {
  it("increments needs by +1", () => {
    const result = calculateSplitFromKeyboard(1, "divider1", { needs: 50, wants: 30, savings: 20 });
    expect(result.needs).toBe(51);
    expect(result.wants).toBe(29);
    expect(result.savings).toBe(20);
    sumsTo100(result);
  });

  it("decrements needs by -1", () => {
    const result = calculateSplitFromKeyboard(-1, "divider1", { needs: 50, wants: 30, savings: 20 });
    expect(result.needs).toBe(49);
    expect(result.wants).toBe(31);
    expect(result.savings).toBe(20);
    sumsTo100(result);
  });

  it("respects minimum boundary", () => {
    const result = calculateSplitFromKeyboard(-1, "divider1", { needs: 1, wants: 79, savings: 20 });
    expect(result.needs).toBe(1);
    sumsTo100(result);
  });

  it("respects maximum boundary", () => {
    const result = calculateSplitFromKeyboard(1, "divider1", { needs: 79, wants: 1, savings: 20 });
    expect(result.needs).toBe(79);
    expect(result.wants).toBe(1);
    sumsTo100(result);
  });
});

describe("calculateSplitFromKeyboard - divider2", () => {
  it("increments divider position (wants grows, savings shrinks)", () => {
    const result = calculateSplitFromKeyboard(1, "divider2", { needs: 50, wants: 30, savings: 20 });
    expect(result.needs).toBe(50);
    expect(result.wants).toBe(31);
    expect(result.savings).toBe(19);
    sumsTo100(result);
  });

  it("decrements divider position (wants shrinks, savings grows)", () => {
    const result = calculateSplitFromKeyboard(-1, "divider2", { needs: 50, wants: 30, savings: 20 });
    expect(result.needs).toBe(50);
    expect(result.wants).toBe(29);
    expect(result.savings).toBe(21);
    sumsTo100(result);
  });

  it("respects maximum boundary (savings can't go below 1)", () => {
    const result = calculateSplitFromKeyboard(1, "divider2", { needs: 50, wants: 49, savings: 1 });
    expect(result.savings).toBe(1);
    sumsTo100(result);
  });

  it("respects minimum boundary (wants can't go below 1)", () => {
    const result = calculateSplitFromKeyboard(-1, "divider2", { needs: 50, wants: 1, savings: 49 });
    expect(result.wants).toBe(1);
    sumsTo100(result);
  });

  it("always sums to 100 with repeated operations", () => {
    let current: SplitValues = { needs: 40, wants: 30, savings: 30 };
    for (let i = 0; i < 50; i++) {
      current = calculateSplitFromKeyboard(1, "divider2", current);
      sumsTo100(current);
    }
  });
});

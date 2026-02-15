export interface SplitValues {
  needs: number;
  wants: number;
  savings: number;
}

export function normalizeSplit(needs: number, wants: number, savings: number): SplitValues {
  const total = needs + wants + savings;
  if (total === 0) {
    return { needs: 0, wants: 0, savings: 0 };
  }
  const factor = 100 / total;
  return {
    needs: Math.round(needs * factor),
    wants: Math.round(wants * factor),
    savings: Math.round(savings * factor),
  };
}

export function calculateSplitFromDivider(
  percent: number,
  divider: "divider1" | "divider2",
  current: SplitValues,
): SplitValues {
  if (divider === "divider1") {
    const clampedNeeds = Math.max(1, Math.min(100 - current.savings - 1, percent));
    const newWants = 100 - clampedNeeds - current.savings;
    return { needs: clampedNeeds, wants: newWants, savings: current.savings };
  } else {
    const clampedPercent = Math.max(current.needs + 1, Math.min(99, percent));
    const newSavings = 100 - clampedPercent;
    const newWants = 100 - current.needs - newSavings;
    return { needs: current.needs, wants: newWants, savings: newSavings };
  }
}

export function calculateSplitFromKeyboard(
  delta: number,
  divider: "divider1" | "divider2",
  current: SplitValues,
): SplitValues {
  if (divider === "divider1") {
    const newNeeds = Math.max(1, Math.min(100 - current.savings - 1, current.needs + delta));
    const newWants = 100 - newNeeds - current.savings;
    return { needs: newNeeds, wants: newWants, savings: current.savings };
  } else {
    const currentDividerPos = current.needs + current.wants;
    const newDividerPos = Math.max(current.needs + 1, Math.min(99, currentDividerPos + delta));
    const newSavings = 100 - newDividerPos;
    const newWants = 100 - current.needs - newSavings;
    return { needs: current.needs, wants: newWants, savings: newSavings };
  }
}

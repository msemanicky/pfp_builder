export interface CompoundInterestParams {
  initialAmount: number;
  monthlyContribution: number;
  annualReturn: number;
  inflationRate: number;
  years: number;
}

export interface CompoundInterestDataPoint {
  year: number;
  total: number;
  principal: number;
  interest: number;
  realValue: number;
}

export function calculateCompoundInterest(
  params: CompoundInterestParams,
): CompoundInterestDataPoint[] {
  const { initialAmount, monthlyContribution, annualReturn, inflationRate, years } = params;

  const data: CompoundInterestDataPoint[] = [];
  const monthlyRate = annualReturn / 100 / 12;
  let total = initialAmount;

  for (let month = 0; month <= years * 12; month++) {
    const year = Math.floor(month / 12);

    if (month % 12 === 0 || month === years * 12) {
      const principalInvested = initialAmount + monthlyContribution * month;
      const interest = Math.max(0, total - principalInvested);
      const inflationFactor = Math.pow(1 + inflationRate / 100, year);
      const realValue = total / inflationFactor;

      data.push({
        year,
        total: Math.round(total * 100) / 100,
        principal: Math.round(principalInvested * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        realValue: Math.round(realValue * 100) / 100,
      });
    }

    total = total * (1 + monthlyRate) + monthlyContribution;
  }

  return data;
}

export function calculateROI(principal: number, interest: number): number {
  return principal > 0 ? (interest / principal) * 100 : 0;
}

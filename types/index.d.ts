export interface financeMathInput {
  begin: string;
  end: string;
  interestCalculation: string;
  interestRate?: number[];
  startValue?: number;
  reductionFactor?: number;
  dynamicSavingRateFactor?: number;
  savingPlanBegin?: string;
  savingPlanEnd?: string;
  oneTimeInvestment?: number[];
  oneTimeInvestmentDate?: string[];
  savingRate?: number;
  endValue?: number;
  endpoint: string;
}

export interface financeMathResult {
  capitalResult?: {
    capitalAmount: number,
    savingRate: number,
    startInvestment: number,
    interestRate: number,
    end: string,
  };
  capitalSeries?: number[];
  begin?: string;
  end?: string;
  startValue?: number;
  interestRate?: number;
  compoundInterest?: number;
  capitalAmount?: number;
  savingRate?: number;
  startInvestment?: number;
  interestRate?: number;
  end?: string;
}

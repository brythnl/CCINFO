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
  oneTimeInvestmentDate?: string;
  savingRate?: number;
  endValue?: number;
}

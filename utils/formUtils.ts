import type { financeMathInput} from "~/types/index.d.ts"
function formatDate(date: Date) {
  return date.toISOString().split('T')[0].toString().replace('/T/','');
}

export const todayDate = formatDate(new Date())

export interface Input{
  begin: string,
  end: string,
  interestCalculation: string,
  interestRate: number,
  reductionFactor: number,
  dynamicSavingRateFactor: number,
  savingPlanBegin: string,
  savingPlanEnd: string,
  oneTimeInvestment: number[],
  oneTimeInvestmentDate: string[],
  savingRate: number,
  endValue: number,
  endpoint: string
}


const date = new Date();
date.setFullYear(date.getFullYear() + 10);
export const inTenYears = formatDate(date)
date.setFullYear(date.getFullYear() + 10);
export const inTwentyYears = formatDate(date)

export const formatNumber = (num: number): number => {
  return Number(num
    .toString()
    .replace(',', '.')
  );
}

export const findSmallestDate = (dates: string[]): string => {
  dates.sort((a: string, b: string) => new Date(a).valueOf() - new Date(b).valueOf())
  return dates[0];
}

export const findBiggestDate = (dates: string[]): string => {
  dates.sort((a: string, b: string) => new Date(b).valueOf()- new Date(a).valueOf())
  return dates[0];
}

export const validateInput = (userInput:financeMathInput): void => {
     // Set decimal separator to dot and make numbers to integer
     userInput.endValue = Math.round(formatNumber(userInput.endValue));
     userInput.savingRate = Math.round(formatNumber(userInput.savingRate));
     userInput.interestRate= formatNumber(userInput.interestRate) * 0.01;
     userInput.dynamicSavingRateFactor = formatNumber(userInput.dynamicSavingRateFactor) * 0.01;
     userInput.oneTimeInvestment= userInput.oneTimeInvestment.map(investment => Math.round(formatNumber(investment) * 100))
      // Date validation
      let tmp: string[] = (JSON.parse(JSON.stringify(userInput.oneTimeInvestmentDate)))
      tmp.push(userInput.savingPlanBegin)
      userInput.begin = findSmallestDate(tmp)
 }

export const setEndDateToBiggestDate = (userInput:financeMathInput): void => {
  if (userInput.endpoint == 'end-date') return;
  let tmp: string[] = (JSON.parse(JSON.stringify(userInput.oneTimeInvestmentDate)))
  tmp.push(JSON.parse(JSON.stringify(userInput.savingPlanEnd)))
  userInput.end = findBiggestDate(tmp)
}

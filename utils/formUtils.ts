import type { financeMathInput } from "~/types/index.d.ts"

// Date constants for form default values (todayDate, inTenYears, inTwentyYears)
export const todayDate = formatDate(new Date())

function formatDate(date: Date) {
  return date.toISOString().split('T')[0].toString().replace('/T/','');
}

const date = new Date();
date.setFullYear(date.getFullYear() + 10);
export const inTenYears = formatDate(date)
date.setFullYear(date.getFullYear() + 10);
export const inTwentyYears = formatDate(date)

// format the decimal point of a number into a comma
export const formatNumber = (num: number): number => {
  return Number(num
    .toString()
    .replace(',', '.')
  );
}

// find the earliest date in an array
export const findSmallestDate = (dates: string[]): string => {
  dates.sort((a: string, b: string) => new Date(a).valueOf() - new Date(b).valueOf())
  return dates[0];
}

// find the latest date in an array
export const findBiggestDate = (dates: string[]): string => {
  dates.sort((a: string, b: string) => new Date(b).valueOf()- new Date(a).valueOf())
  return dates[0];
}

// modify user input to follow API parameter requirements
export const validateInput = (userInput: financeMathInput): void => {
     // Set decimal separator to dot and make numbers to integer
     userInput.endValue = Math.round(formatNumber(userInput.endValue));
     userInput.savingRate = Math.round(formatNumber(userInput.savingRate));
     userInput.interestRate= formatNumber(userInput.interestRate) * 0.01;
     userInput.dynamicSavingRateFactor = formatNumber(userInput.dynamicSavingRateFactor) * 0.01;
     userInput.oneTimeInvestment= userInput.oneTimeInvestment.map(investment => Math.round(formatNumber(investment)))
      // Date validation
      let tmp: string[] = (JSON.parse(JSON.stringify(userInput.oneTimeInvestmentDate)))
      tmp.push(userInput.savingPlanBegin)
      userInput.begin = findSmallestDate(tmp)
 }

// set end date value as the latest date found from all date inputs (oneTimeInvestmentDate, savingPlanEnd, end)
export const setEndDateToBiggestDate = (userInput: financeMathInput): void => {
  if (userInput.endpoint == 'end-date') return;
  let tmp: string[] = (JSON.parse(JSON.stringify(userInput.oneTimeInvestmentDate)))
  tmp.push(JSON.parse(JSON.stringify(userInput.savingPlanEnd)))
  tmp.push(JSON.parse(JSON.stringify(userInput.end)))
  userInput.end = findBiggestDate(tmp)
}

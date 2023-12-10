import type { financeMathInput,financeMathResult } from "~/types/index.d.ts";

// Date constants for form default values (todayDate, inTenYears, inTwentyYears)
export const todayDate = formatDate(new Date());
export const nextMonthFirstDay = calculateNextMonthFirstDay();

function formatDate(date: Date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  return `${year}-${month}-${day}`;
}
function calculateNextMonthFirstDay() {
  const currentDate = new Date();
  const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  return formatDate(nextMonth);
}

const date = new Date(nextMonthFirstDay);
date.setFullYear(date.getFullYear() + 10);
export const inTenYears = formatDate(date);
date.setFullYear(date.getFullYear() + 10);
export const inTwentyYears = formatDate(date);

// format the decimal point of a number into a comma
export const formatNumber = (num: number): number => {
  return Number(num.toString().replace(",", "."));
};

// find the earliest date in an array
export const findSmallestDate = (dates: string[]): string => {
  dates.sort(
    (a: string, b: string) => new Date(a).valueOf() - new Date(b).valueOf(),
  );
  return dates[0];
};

// find the latest date in an array
export const findBiggestDate = (dates: string[]): string => {
  dates.sort(
    (a: string, b: string) => new Date(b).valueOf() - new Date(a).valueOf(),
  );
  return dates[0];
};

// modify user input to follow API parameter requirements
export const validateInput = (userInput: financeMathInput): void => {
  // Set decimal separator to dot and make numbers to integer
  userInput.endValue = Math.round(formatNumber(userInput.endValue) * 100);
  userInput.savingRate = Math.round(formatNumber(userInput.savingRate) * 100);
  userInput.interestRate = formatNumber(userInput.interestRate) * 0.01;
  userInput.dynamicSavingRateFactor =
    formatNumber(userInput.dynamicSavingRateFactor) * 0.01;
  userInput.oneTimeInvestment = userInput.oneTimeInvestment.map((investment) =>
    Math.round(formatNumber(investment) * 100),
  );
  // Date validation
  const tmp: string[] = JSON.parse(
    JSON.stringify(userInput.oneTimeInvestmentDate),
  );
  tmp.push(userInput.savingPlanBegin);
  userInput.begin = findSmallestDate(tmp);
};

// set end date value as the latest date found from all date inputs (oneTimeInvestmentDate, savingPlanEnd, end)
export const setEndDateToBiggestDate = (userInput: financeMathInput): void => {
  if (userInput.endpoint === "end-date") return;
  const tmp: string[] = JSON.parse(
    JSON.stringify(userInput.oneTimeInvestmentDate),
  );
  tmp.push(JSON.parse(JSON.stringify(userInput.savingPlanEnd)));
  tmp.push(JSON.parse(JSON.stringify(userInput.end)));
  userInput.end = findBiggestDate(tmp);
};

export const revertOutput = (responseOutput:financeMathResult):financeMathResult =>{
  let apiOutput = JSON.parse(JSON.stringify(responseOutput));
  if(apiOutput.capitalResult){
    apiOutput.capitalResult.capitalAmount=Math.round(apiOutput.capitalResult.capitalAmount/100);
    apiOutput.capitalResult.savingRate=Math.ceil(apiOutput.capitalResult.savingRate/100);
    apiOutput.capitalResult.startInvestment=Math.round(apiOutput.capitalResult.startInvestment/100);
    apiOutput.capitalResult.interestRate=Math.round(apiOutput.capitalResult.interestRate*100);
  }
  if(apiOutput.capitalSeries){
    apiOutput.capitalSeries = apiOutput.capitalSeries.map((investment)=>Math.round(investment/100));}
  if(apiOutput.interestRate){
    apiOutput.interestRate = Math.round(apiOutput.interestRate*100); }
  if(apiOutput.startValue){
    apiOutput.startValue = Math.round(apiOutput.startValue/100);  }
  if(apiOutput.compoundInterest){
    apiOutput.compoundInterest = Math.round(apiOutput.compoundInterest*100);  }
  if(apiOutput.capitalAmount){
    apiOutput.capitalAmount = Math.round(apiOutput.capitalAmount/100);  }
  if(apiOutput.savingRate){
    apiOutput.savingRate = Math.ceil(apiOutput.savingRate/100);  }
  if(apiOutput.startInvestment){
    apiOutput.startInvestment = Math.round(apiOutput.startInvestment/100);  }
  return apiOutput;
}

/**
 * Remove searched API endpoint from the input
 * @param {financeMathInput} formInput - User data for API query parameters
 * @return {financeMathInput}
 */
export const removeSearchedEndpointFromInput = (formInput: financeMathInput): financeMathInput => {
  const processedFormInput = formInput;

  switch (processedFormInput.endpoint) {
    case "capital":
      delete processedFormInput.endValue;
      break;
    case "end-date":
      delete processedFormInput.end;
      break;
    case "interest-rate":
      delete processedFormInput.interestRate;
      break;
    case "saving-rate":
      delete processedFormInput.savingRate;
      break;
    case "saving-start-value":
      delete processedFormInput.startInvestment;
      break;
  }

  return processedFormInput;
}

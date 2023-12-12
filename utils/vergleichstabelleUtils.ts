import type { financeMathInput, financeMathResult } from '~/types/index.d.ts'

import { useDayjs } from '#dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

const dayjs = useDayjs()
dayjs.extend(customParseFormat)

interface differenceAndUnit {
  difference: string | number;
  unit: string;
}

const names = {
  "begin": "Startdatum",
  "end": "Enddatum",
  "interestCalculation": "interestCalculation",
  "interestRate": "Zinssatz",
  "dynamicSavingRateFactor": "Dynamischer Sparplanfaktor",
  "savingPlanBegin": "Startdatum Sparplan",
  "savingPlanEnd": "Enddatum Sparplan",
  "oneTimeInvestment": "Einmalzahlung",
  "oneTimeInvestmentDate": "Datum Einmalzahlung",
  "savingRate": "Sparrate",
  "endValue": "Endkapital",
  "reductionFactor": "reductionFactor",
  "capitalAmount": "Endkapital",
  "startInvestment": "Startkapital"
}

const calculateDifference = (oldValue: number | Date, newValue: number | Date): differenceAndUnit => {
  if (typeof oldValue === "number" && typeof newValue === "number") {
    const difference = newValue - oldValue;
    return { difference, unit: '' };
  }

  // calculate difference for date values
  else if (dayjs(oldValue).isValid()) {
    let old_date = dayjs(oldValue);
    let new_date = dayjs(newValue);
    let diff = new_date.diff(old_date, 'month');
    if (diff >= 12 || diff <= -12) {
      return { difference: new_date.diff(old_date, 'year'), unit: 'Jahre' };
    } else {
      return { difference: diff, unit: 'Monate' };
    }
  }
  else {
    return { difference: "", unit: '' };
  }
}

const formatValue = (value: number | Date, key: string): string | typeof value => {
  if (typeof value === 'number') {
    return key === "interestRate" ?
      `${(value * 100).toFixed(2)} %`
      : `${(value / 100).toFixed(2)} €`;
  }
  else if (dayjs(value).isValid()) {
    return dayjs(value).format('DD.MM.YYYY');
  }
  return value;
};

const formatDifference = (difference: string | number , unit: string, key: string): differenceAndUnit => {
  if (unit == '' && typeof difference === 'number') {
    return key === "interestRate" ?
      { difference: `${(difference * 100).toFixed(2)} %`, unit: unit }
      : { difference: `${(difference / 100).toFixed(2)} €`, unit: unit }
  }
  return { difference: difference, unit: unit };
};

export const createCombinedArray = (oldObj: financeMathInput | financeMathResult, newObj: financeMathInput | financeMathResult): any[] => {
  const combinedArray = [];

  for (const key in oldObj) {
    const oldValue = oldObj[key];
    const newValue = newObj[key];
    const { difference, unit } = calculateDifference(oldValue, newValue);

    if (difference !== 0 && difference !== ""){
      combinedArray.push({
        name: names[key],
        oldValue: formatValue(oldValue, key),
        newValue: formatValue(newValue, key),
        difference: formatDifference(difference, unit, key),
        unit: unit
      });
    }
  }

  return combinedArray;
}

export const filterCombinedArrayResp = (comparisonArray: any[], requestEndpoint: string): any[] => {
  let selectedEndpoint: string;
  switch (requestEndpoint) {
    case "capital":
      selectedEndpoint = names["capitalAmount"];
      break;
    case "end-date":
      selectedEndpoint = names["end"];
      break;
    case "interest-rate":
      selectedEndpoint = names["interestRate"];
      break;
    case "saving-rate":
      selectedEndpoint = names["savingRate"];
      break;
    case "saving-start-value":
      selectedEndpoint = names["startInvestment"];
      break;
  }

  return comparisonArray.filter(item => item && item.name === selectedEndpoint);
};


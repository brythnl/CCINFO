import type { financeMathInput, financeMathResult } from '~/types/index.d.ts'

import { useDayjs } from '#dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

const dayjs = useDayjs()
dayjs.extend(customParseFormat)

interface difference {
  sign: string;
  value: string | number;
  unit: string;
}

export interface combinedData {
  name: string;
  previousValue: string | string[];
  currentValue: string | string[];
  valueDifference: difference;
}

const fieldNames = {
  "begin": "Startdatum",
  "end": "Enddatum",
  "interestRate": "Zinssatz",
  "oneTimeInvestment": "Einmalzahlung",
  "oneTimeInvestmentDate": "Einmalzahlungsdatum",
  "savingRate": "Sparrate",
  "endValue": "Endkapital",
  "interestCalculation": "",
  "dynamicSavingRateFactor": "",
  "reductionFactor": "",
  "savingPlanBegin": "",
  "savingPlanEnd": "",
  "capitalAmount": "Endkapital",
  "startInvestment": "Startkapital"
}

const formatValue = (
  value: string | number | Array<string | number>,
  key: string,
  currency: string
): string | string[] => {
  const formatSingleValue = (value: string | number): string => {
    if (typeof value === 'string' && dayjs(value).isValid()) {
      return dayjs(value).format('DD.MM.YYYY');
    }

    if (typeof value === 'number') {
      return key === "interestRate" ?
        `${(value * 100).toFixed(2)} %`
      : `${(value / 100).toFixed(2)} ${currency}`;
    }

    return value;
  }

  if (Array.isArray(value)) {
    if (value.length === 1) {
      return formatSingleValue(value[0] as string | number);
    }

    return value.map(formatSingleValue);
  }

  return formatSingleValue(value as string | number);
};

const calculateDifference = (
  previousValue: string | number | Array<string | number>,
  currentValue: string | number | Array<string | number>,
  key: string,
  currency: string
): difference => {
  const calculateSingleDifference = (previousValue: string | number, currentValue: string | number): difference  => {
    if (typeof previousValue === "number" && typeof currentValue === "number") {
      let difference: number = currentValue - previousValue;
      let unit: string;

      if (key === "interestRate") {
        difference *= 100;
        unit = '%';
      } else {
        difference /= 100;
        unit = currency;
      }

      return {
        sign: difference > 0 ? '+' : '',
        value: difference,
        unit: unit,
      };
    }

    if (typeof previousValue === 'string' && dayjs(previousValue).isValid()) {
      const previousDate = dayjs(previousValue);
      const currentDate = dayjs(currentValue);
      const monthDifference = currentDate.diff(previousDate, 'month');
      const sign = monthDifference > 0 ? '+' : '-';

      if (monthDifference >= 12 || monthDifference <= -12) {
        return {
          sign,
          value: currentDate.diff(previousDate, 'year'),
          unit: 'Jahre'
        };
      } else {
        return {
          sign,
          value: monthDifference,
          unit: 'Monate',
        };
      }
    }

    return {
      sign: '',
      value: '',
      unit: ''
    }
  }

  if (Array.isArray(previousValue) && Array.isArray(currentValue)) {
    if (previousValue.length === 1 && currentValue.length === 1) {
      return calculateSingleDifference(previousValue[0] as string | number, currentValue[0] as string | number)
    }

    // This is a placeholder. Real solution for finding the difference for Startkapital (Array) not yet found.
    return {
      sign: '',
      value: 'array',
      unit: '',
    }
  }

  return calculateSingleDifference(previousValue as string | number, currentValue as string | number);
}

export const createCombinedArray = (
  previousData: financeMathInput | financeMathResult,
  currentData: financeMathInput | financeMathResult
): combinedData[] => {
  const combinedArray = [];

  for (const key in previousData) {
    const previousValue = formatValue(previousData[key], key, '€');
    const currentValue = formatValue(currentData[key], key, '€');
    const valueDifference = calculateDifference(previousData[key], currentData[key], key, '€');

    if (valueDifference.value !== 0 && valueDifference.value !== ""){
      // Round numbers to 2 decimal points
      if (typeof valueDifference.value === 'number') valueDifference.value = valueDifference.value.toFixed(2);

      combinedArray.push({
        name: fieldNames[key],
        previousValue: previousValue,
        currentValue: currentValue,
        valueDifference: valueDifference,
      });
    }
  }

  return combinedArray;
}

export const filterCombinedArrayResp = (
  comparisonArray: combinedData[],
  requestEndpoint: string,
): combinedData[] => {
  let selectedEndpoint: string;

  switch (requestEndpoint) {
    case "capital":
      selectedEndpoint = fieldNames["capitalAmount"];
      break;
    case "end-date":
      selectedEndpoint = fieldNames["end"];
      break;
    case "interest-rate":
      selectedEndpoint = fieldNames["interestRate"];
      break;
    case "saving-rate":
      selectedEndpoint = fieldNames["savingRate"];
      break;
    case "saving-start-value":
      selectedEndpoint = fieldNames["startInvestment"];
      break;
  }

  return comparisonArray.filter(item => item && item.name === selectedEndpoint);
};


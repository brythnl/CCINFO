import { useDayjs } from '#dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

const dayjs = useDayjs()
dayjs.extend(customParseFormat)

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

const calculateDifference = (oldValue, newValue) => {
  if (typeof oldValue === "number" && typeof newValue === "number") {
    const difference = newValue - oldValue;
    return { difference, unit: '' };
  }

  // überprüft, ob Werte Daten sind
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

const formatValue = (value, key) => {
  if (typeof value === 'number') {
    return key === "interestRate" ?
      `${value * 100} %`
      : `${(value / 100).toFixed(2)} €`;
  }
  else if (dayjs(value).isValid()) {
    return dayjs(value).format('DD.MM.YYYY');
  }
  return value;
};

const formatDifference = (difference, unit, key) => {
  if (unit == '' && typeof difference === 'number') {
    return key === "interestRate" ?
      { difference: `${difference * 100} %`, unit: unit }
      : { difference: `${(difference / 100).toFixed(2)} €`, unit: unit }
  }
  return { difference: difference, unit: unit };
};

export const createCombinedArray = (oldObj, newObj) => {
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

export const filterCombinedArrayResp = (comparisonArray: any[], requestEndpoint: string) => {
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

const formatNumberWithThousandSeparator = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

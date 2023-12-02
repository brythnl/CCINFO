import { useDayjs } from '#dayjs' // not need if you are using auto import
import customParseFormat from 'dayjs/plugin/customParseFormat'

const dayjs = useDayjs()
dayjs.extend(customParseFormat)

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

const formatValue = (value) => {
  if (typeof value === 'number'){
    return value.toFixed(2);
  }
  else if (dayjs(value).isValid()) {
    return dayjs(value).format('DD.MM.YYYY');
  }
  return value;
};

const formatDifference = (difference, unit) => {
  if(unit == '' && typeof difference === 'number'){
    return { difference: difference.toFixed(2), unit:unit };
  }
  return { difference: difference, unit: unit };
};

export const createCombinedArray = (names, oldObj, newObj) => {
  const combinedArray = [];

  for (const key in oldObj) {
    const oldValue = oldObj[key];
    const newValue = newObj[key];
    const { difference, unit } = calculateDifference(oldValue, newValue);

    if (difference !== 0 && difference !== ""){
      combinedArray.push({
        name: names[key],
        oldValue: formatValue(oldValue),
        newValue: formatValue(newValue),
        difference: formatDifference(difference, unit),
        unit: unit
      });
    }
  }

  return combinedArray;
}

// Funktion zum Filtern des combinedArray_resp nach dem Namen "capitalAmount"
export const filterCombinedArrayResp = (names, dataArray, targetName) => {
  const translation = names[targetName];
  return dataArray.filter(item => item && item.name === translation);
};

const formatNumberWithThousandSeparator = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

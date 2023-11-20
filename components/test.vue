<template>
  <div class="pb-10">
    <h4 class="font-bold pb-3"><v-icon>mdi-swap-horizontal</v-icon> Ihre Änderungen</h4>
    <v-table class="border-2 rounded-lg">
      <thead>
      <tr>
        <th>Feld</th>
        <th>Vorher</th>
        <th>Aktuell</th>
        <th>Differenz</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in combinedArray_req">
        <td>{{ item.name }}</td>
        <td>{{ item.oldValue }}</td>
        <td>{{ item.newValue }}</td>
        <td :class="{ 'red-text': item.difference.difference < 0 }">{{ item.difference.difference > 0 ? '+' : '' }}{{ item.difference.difference }} {{ item.difference.unit}}</td>
      </tr>
      </tbody>
    </v-table>
  </div>
  <div>
    <h4 class="font-bold pb-3"><v-icon>mdi-equal-box</v-icon> Ergebnis</h4>
    <v-table class="border-2 rounded-lg">
      <thead>
      <tr>
        <th>Feld</th>
        <th>Vorher</th>
        <th>Aktuell</th>
        <th>Differenz</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in filteredCombinedArrayResp">
        <td>{{ item.name }}</td>
        <td>{{ item.oldValue }}</td>
        <td>{{ item.newValue }}</td>
        <td :class="{ 'red-text': item.difference.difference < 0, 'green-text': item.difference.difference > 0 }">{{ item.difference.difference > 0 ? '+' : '' }}{{ item.difference.difference }} {{ item.difference.unit}}</td>
      </tr>
      </tbody>
    </v-table>
  </div>
</template>

<style scoped>
.red-text {
  color: red;
}
.green-text {
  color: green;
}
</style>

<script lang="ts" setup>
import { useDayjs } from '#dayjs' // not need if you are using auto import
const dayjs = useDayjs()
import customParseFormat from 'dayjs/plugin/customParseFormat'
import {inTenYears, todayDate} from "../utils/formUtils";
import {watch} from "vue";
dayjs.extend(customParseFormat)


const frage = "capitalAmount";

function createCombinedArray (oldObj, newObj){
  const combinedArray = [];

  for (const key in oldObj) {
    const oldValue = oldObj[key];
    const newValue = newObj[key];
    const { difference, unit } = calculateDifference(oldValue, newValue);

    if(difference !== 0 && difference !== ""){
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

const formatValue = (value) => {
  if (typeof value === 'number'){
    return value.toFixed(2);
  }
  else if (dayjs(value).isValid()) {
    return dayjs(value).format('DD.MM.YYYY');
  }
  return value;
};

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

const formatDifference = (difference, unit) => {
  if(unit == '' && typeof difference === 'number'){
    return { difference: difference.toFixed(2), unit:unit };
  }
  return { difference: difference, unit: unit };
};

// Funktion zum Filtern des combinedArray_resp nach dem Namen "capitalAmount"
const filterCombinedArrayResp = (dataArray, targetName) => {
  const translation = names[targetName];
  return dataArray.filter(item => item && item.name === translation);
};

const formatNumberWithThousandSeparator = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Dummy Daten

const old_req = {
  begin: "2023-01-01",
  end: "2033-01-01",
  interestCalculation: "YEARLY",
  interestRate: 0.02,
  reductionFactor: 0,
  dynamicSavingRateFactor: 0,
  savingPlanBegin: "2023-01-01",
  savingPlanEnd: "2033-01-01",
  oneTimeInvestment: [10000],
  oneTimeInvestmentDate: ["2023-01-01"],
  savingRate: 200,
  endValue: 0
};

const new_req = {
  begin: "2023-01-01",
  end: "2032-01-01",
  interestCalculation: "YEARLY",
  interestRate: 0.03,
  reductionFactor: 0,
  dynamicSavingRateFactor: 0,
  savingPlanBegin: "2023-01-01",
  savingPlanEnd: "2033-01-01",
  oneTimeInvestment: [10000],
  oneTimeInvestmentDate: ["2023-01-01"],
  savingRate: 300,
  endValue: 0
};

const old_resp = {
  "capitalResult": {
    "capitalAmount": 38469.27459931843,
    "savingRate": 200,
    "startInvestment": 10000,
    "interestRate": 0.019999999999999997,
    "end": "2033-01-01"
  },
  "capitalSeries": [
    12600,
    15252,
    17957.04,
    20716.180800000002,
    23530.504416000003,
    26401.114504320005,
    29329.136794406404,
    32315.719530294533,
    35362.03392090042,
    38469.27459931843
  ]
};

const new_resp = {
  "capitalResult": {
    "capitalAmount": 49620.51389780178,
    "savingRate": 300,
    "startInvestment": 10000,
    "interestRate": 0.030000000000000002,
    "end": "2032-01-01"
  },
  "capitalSeries": [
    13900,
    17917,
    22054.51,
    26316.145299999996,
    30705.629658999995,
    35226.79854876999,
    39883.60250523309,
    44680.11058039008,
    49620.51389780178
  ]
};

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


const combinedArray_req = createCombinedArray(old_req, new_req);
const combinedArray_resp = createCombinedArray(old_resp.capitalResult, new_resp.capitalResult);
// Gefiltertes Array erstellen
const filteredCombinedArrayResp = filterCombinedArrayResp(combinedArray_resp, frage);

// Test
console.log("Combined Array for old_req and new_req:", combinedArray_req);
console.log("Combined Array for old_resp and new_resp:", combinedArray_resp);
console.log("Filtered Combined Array for old_resp and new_resp:", filteredCombinedArrayResp);

</script>
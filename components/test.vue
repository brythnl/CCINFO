<template>
  <div class="pa-5">
    <h4 class="font-bold">Änderungen</h4>
    <v-table >
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
        <td :class="{ 'red-text': item.difference < 0 }">{{ item.difference }}</td>
      </tr>
      </tbody>
    </v-table>
  </div>
  <div class="pa-5">
    <h4 class="font-bold">Ergebnis</h4>
    <v-table >
      <thead>
      <tr>
        <th>Feld</th>
        <th>Vorher</th>
        <th>Aktuell</th>
        <th>Differenz</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in combinedArray_resp">
        <td>{{ item.name }}</td>
        <td>{{ item.oldValue }}</td>
        <td>{{ item.newValue }}</td>
        <td :class="{ 'red-text': item.difference < 0 }">{{ item.difference }}</td>
      </tr>
      </tbody>
    </v-table>
  </div>
</template>

<style scoped>
.red-text {
  color: red;
}
</style>

<script lang="ts" setup>
import { useDayjs } from '#dayjs' // not need if you are using auto import
const dayjs = useDayjs()
import customParseFormat from 'dayjs/plugin/customParseFormat'
import {inTenYears, todayDate} from "../utils/formUtils";
import {watch} from "vue";
dayjs.extend(customParseFormat)

/*
const props = defineProps<{
  apiRequest: financeMathInput,
  apiResponse: financeMathResult
}>()
*/

const frage = "capitalAmount";
/*
watch(() => props.apiRequest.endpoint, () => {
  switch (props.apiRequest.endpoint) {
    case "saving-start-value":
      frage.value = "startValue";
      break;
    case "saving-rate":
      frage.value = "savingRate";
      break;
    case "interest-rate":
      frage.value = "interestRate";
      break;
    case "end-date":
      frage.value = "end";
      break;
    case "capital":
      frage.value = "capitalAmount";
      break;
  }
})
*/


function createCombinedArray (oldObj, newObj){
  const combinedArray = [];

  for (const key in oldObj) {
    const oldValue = oldObj[key];
    const newValue = newObj[key];
    const difference = calculateDifference(oldValue, newValue);

    if(difference !== 0 && difference !== ""){
      combinedArray.push({
        name: names[key],
        oldValue: formatValue(oldValue),
        newValue: formatValue(newValue),
        difference: formatValue(difference)
      });
    }
  }

  return combinedArray;
}

const formatValue = (value) => {
  if (value === 'date') {
    return dayjs(value).format('YYYY-MM-DD');
  }
  return value;
};

const calculateDifference = (oldValue, newValue) => {
  if (typeof oldValue === "number" && typeof newValue === "number") {
    return newValue - oldValue;
  }
  // überprüft, ob Werte Daten sind
  else if (dayjs(oldValue).isValid()) {
    let old_date = dayjs(oldValue);
    let new_date = dayjs(newValue);
    let diff = new_date.diff(old_date, 'month');
    if (diff >= 12 || diff <= -12) {
      return new_date.diff(old_date, 'year');
    } else {
      return diff;
    }
  }
  else {
    return "";
  }
}

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

console.log("Combined Array for old_req and new_req:", combinedArray_req);
console.log("Combined Array for old_resp and new_resp:", combinedArray_resp);

</script>
<script lang="ts" setup>
import {watch} from 'vue'
import { useDayjs } from '#dayjs' // not need if you are using auto import
const dayjs = useDayjs()
import customParseFormat from 'dayjs/plugin/customParseFormat'
import {inTenYears, todayDate} from "../utils/formUtils";
dayjs.extend(customParseFormat)




//Dummy Data

const names = {
  "begin": "Startdatum",
  "end": "Enddatum",
  "interestRate": "Zinssatz",
  "dynamicSavingRateFactor": "Dynamischer Sparplanfaktor",
  "savingPlanBegin": "Startdatum Sparplan",
  "savingPlanEnd": "Enddatum Sparplan",
  "oneTimeInvestment": "Einmalzahlung",
  "oneTimeInvestmentDate": "Datum Einmalzahlung",
  "savingRate": "Sparrate",
  "endValue": "Endkapital"
}

const old_req = ref({
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
})

const new_req = ref({
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
})

const old_resp = ref({
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
})

const new_resp = ref({
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
})


export default {
  data() {
    return {
      items: [
        {
          name: "Endkapital",
          vorher: old_resp.value.capitalResult.capitalAmount,
          nachher: new_resp.value.capitalResult.capitalAmount,
        },
        {
          name: "Sparrate",
          vorher: old_resp.value.capitalResult.savingRate,
          nachher: new_resp.value.capitalResult.savingRate,
        },
        {
          name: "Startkapital",
          vorher: old_resp.value.capitalResult.startInvestment,
          nachher: new_resp.value.capitalResult.startInvestment,
        },
        {
          name: "Zins",
          vorher: old_resp.value.capitalResult.interestRate,
          nachher: new_resp.value.capitalResult.interestRate,
        },
        {
          name: "Enddatum",
          vorher: new Date(old_resp.value.capitalResult.end),
          nachher: new Date(new_resp.value.capitalResult.end),
        }
      ],
    }
  },
  computed: {
    calculateDifference() {
      return (item) => {
        if (item.nachher instanceof Date && item.vorher instanceof Date) {
          let date1 = dayjs(item.vorher);
          let date2 = dayjs(item.nachher);
          let diff = date2.diff(date1, 'month');
          if(diff >= 12 || diff <= -12){
            return date2.diff(date1, 'year') + " Jahre";
          }
          else{
            return diff + " Monate";
          }
        } else {
          return (item.nachher - item.vorher).toFixed(2);
        }
      };
    },

    itemsWithNonZeroDifference() {
      return this.items.filter(item => item.nachher - item.vorher !== 0);
    },

    format() {
      return (item) => {
        if (item instanceof Date && item instanceof Date) {
          let date = dayjs(item);
          return dayjs(date).format('DD.MM.YYYY');
        } else {
          return item.toFixed(2);
        }
      };
    },
  },
}

</script>

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
      <tr v-for="item in itemsWithNonZeroDifference">
        <td>{{ item.name }}</td>
        <td>{{ format(item.vorher) }}</td>
        <td>{{ format(item.nachher) }}</td>
        <td :class="{ 'red-text': calculateDifference(item) < 0 }">{{ calculateDifference(item) }}</td>
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
      <tr v-for="item in itemsWithNonZeroDifference">
        <td>{{ item.name }}</td>
        <td>{{ format(item.vorher) }}</td>
        <td>{{ format(item.nachher) }}</td>
        <td :class="{ 'red-text': calculateDifference(item) < 0 }">{{ calculateDifference(item) }}</td>
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
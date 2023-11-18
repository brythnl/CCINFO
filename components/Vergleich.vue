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
</template>

<script>
import { useDayjs } from '#dayjs' // not need if you are using auto import
const dayjs = useDayjs()
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

//Dummy Data

const req_1 = ref()

const req_2 = ref()

const resp_1 = ref({
  "capitalResult": {
    "capitalAmount": 184614.61619490074,
    "savingRate": 200,
    "startInvestment": 10000,
    "interestRate": 0.02,
    "end": "2066-01-01"
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
    38469.27459931843,
    41638.660091304795,
    44871.43329313089,
    48168.861958993504,
    51532.239198173374,
    54962.883982136846,
    58462.141661779584,
    62031.384495015176,
    65672.01218491548,
    69385.45242861379,
    73173.16147718606,
    77036.62470672978,
    80977.35720086438,
    84996.90434488167,
    89096.8424317793,
    93278.77928041488,
    97544.35486602318,
    101895.24196334364,
    106333.14680261051,
    110859.80973866272,
    115477.00593343597,
    120186.54605210469,
    124990.27697314679,
    129890.08251260972,
    134887.8841628619,
    139985.64184611916,
    145185.35468304154,
    150489.06177670238,
    155898.84301223644,
    161416.81987248117,
    167045.1562699308,
    172786.05939532942,
    178641.78058323602,
    184614.61619490074
  ]
})

const resp_2 = ref({
  "capitalResult": {
    "capitalAmount": 144308.43056180998,
    "savingRate": 300,
    "startInvestment": 10000,
    "interestRate": 0.02,
    "end": "2050-01-01"
  },
  "capitalSeries": [
    13800,
    17676,
    21629.52,
    25662.1104,
    29775.352608,
    33970.85966016,
    38250.2768533632,
    42615.28239043046,
    47067.58803823907,
    51608.93979900385,
    56241.11859498393,
    60965.94096688361,
    65785.25978622129,
    70700.96498194571,
    75714.98428158462,
    80829.28396721631,
    86045.86964656063,
    91366.78703949184,
    96794.12278028169,
    102330.00523588732,
    107976.60534060506,
    113736.13744741716,
    119610.86019636551,
    125603.07740029282,
    131715.1389482987,
    137949.44172726467,
    144308.43056180998
  ]
})


export default {
  data() {
    return {
      items: [
        {
          name: "Endkapital",
          vorher: resp_1.value.capitalResult.capitalAmount,
          nachher: resp_2.value.capitalResult.capitalAmount,
        },
        {
          name: "Sparrate",
          vorher: resp_1.value.capitalResult.savingRate,
          nachher: resp_2.value.capitalResult.savingRate,
        },
        {
          name: "Startkapital",
          vorher: resp_1.value.capitalResult.startInvestment,
          nachher: resp_2.value.capitalResult.startInvestment,
        },
        {
          name: "Zins",
          vorher: resp_1.value.capitalResult.interestRate,
          nachher: resp_2.value.capitalResult.interestRate,
        },
        {
          name: "Enddatum",
          vorher: new Date(resp_1.value.capitalResult.end),
          nachher: new Date(resp_2.value.capitalResult.end),
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

<style scoped>
.red-text {
  color: red;
}
</style>
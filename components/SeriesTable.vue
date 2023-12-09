<script lang="ts" setup>
import { watch } from "vue";


const props = defineProps<{
  apiRequest: financeMathInput;
  apiRequest2: financeMathInput;
  apiResponse: financeMathResult;
  apiResponse2: financeMathResult;
  form
}>();

console.log(props.apiResponse.capitalSeries);
console.log(new Intl.NumberFormat().format(1000))

function numberFormat(number){
  const fixed = (number / 100).toFixed(0);
  return new Intl.NumberFormat().format(fixed);
}


</script>

<template>
  <h1 class="flex justify-center pt-5 text-lg font-bold">Vermögens-Entwicklung</h1>
  <v-table class="ma-5 border-2 rounded-lg overflow-y-auto " max-height="650" height="600">
    <thead>
      <tr>
        <th>Jahr</th>
        <th>Vermögen</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in props.apiResponse.capitalSeries" :key="index">
        <td>{{ parseInt(props.apiRequest.begin.substring(0, 4)) + index +1 }}</td>
        <td>{{ numberFormat(item) }}</td>
      </tr>
      <tr v-if="props.apiResponse2!=null" v-for="(item, index) in props.apiResponse2.capitalSeries" :key="index">
        <td>{{ parseInt(props.apiRequest.begin.substring(0, 4)) + index +1 }}</td>
        <td>{{ numberFormat(item) }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<style scoped>
</style>
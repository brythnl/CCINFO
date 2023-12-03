<script lang="ts" setup>
import { watch } from "vue";


const props = defineProps<{
  apiRequest: financeMathInput;
  apiRequest2: financeMathInput;
  apiResponse: financeMathResult;
  apiResponse2: financeMathResult;
}>();

console.log(props.apiResponse.capitalSeries);
console.log(new Intl.NumberFormat().format(1000))

function numberFormat(number){
  return new Intl.NumberFormat().format(number);
}


</script>

<template>
  <v-table>
    <thead>
      <tr>
        <th>Jahr</th>
        <th>Guthaben zu<br>Jahresbeginn</th>
        <th>Einzahlungen</th>
        <th>Zinsgutschriften</th>
        <th>Neues Guthaben</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in props.apiResponse.capitalSeries" :key="index">
        <td>{{ parseInt(props.apiRequest.begin.substring(0, 4)) + index }}</td>
        <td>test</td>
        <td>test</td>
        <td>test</td>
        <td>{{ numberFormat((item / 100).toFixed(0)) }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<style scoped>
</style>
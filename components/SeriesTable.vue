<script lang="ts" setup>
import { watch } from "vue";


const props = defineProps<{
  apiRequest: financeMathInput;
  apiResponse;
}>();
</script>

<template>
  <h1 class="flex justify-center my-5 font-bold">Vermögens-Entwicklung</h1>
  <v-table class="ma-2 border-2 rounded-lg overflow-y-auto " max-height="650" height="600">
    <thead>
      <tr>
        <th>Jahr</th>
        <th>Vermögen</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in props.apiResponse.capitalSeries" :key="index">
        <td>{{ parseInt(props.apiRequest.begin.substring(0, 4)) + index +1 }}</td>
        <td>{{ new Intl.NumberFormat().format(item) }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<style scoped>
</style>
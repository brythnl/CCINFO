<script lang="ts" setup>
import type { financeMathInput, financeMathResult } from '~/types/index.d.ts'
import {
  createCombinedArray,
  filterCombinedArrayResp
} from '~/utils/vergleichstabelleUtils'

const props = defineProps<{
  oldRequest?: financeMathInput;
  newRequest?: financeMathInput;
  oldResponse?: financeMathResult;
  newResponse?: financeMathResult;
}>()

const frage = "capitalAmount";

const requestComparisonArray: any[] = computed(() => createCombinedArray(
  JSON.parse(JSON.stringify(props.oldRequest)),
  JSON.parse(JSON.stringify(props.newRequest)),
));

const responseFilteredComparisonArray: any[] = computed(() => {
  return filterCombinedArrayResp(
    createCombinedArray(
      JSON.parse(JSON.stringify(props.oldResponse)),
      JSON.parse(JSON.stringify(props.newResponse))
    ),
    frage
  )
});

</script>

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
      <tr v-for="item in requestComparisonArray">
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
      <tr v-for="item in responseFilteredComparisonArray">
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

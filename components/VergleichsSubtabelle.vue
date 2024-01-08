<script setup lang="ts">
import type { combinedData } from '../utils/vergleichstabelleUtils';

const props = defineProps<{
  combinedArray?: combinedData[];
}>()

</script>

<template>
  <v-table class="border-2 rounded-lg">
    <thead>
      <tr>
        <th>{{ $t("vergleichstabelle.feld") }}</th>
        <th>{{ $t("vergleichstabelle.vorher") }}</th>
        <th>{{ $t("vergleichstabelle.aktuell") }}</th>
        <th>{{ $t("vergleichstabelle.differenz") }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in props.combinedArray">
        <td>{{ item.name }}</td>
        <td v-if="!Array.isArray(item.previousValue)">{{ item.previousValue }}</td>
        <td v-else>
          <tr v-for="(element, index) in item.previousValue">
            <td>{{ index + 1 }} : {{ element }}</td>
          </tr>
        </td>
        <td v-if="!Array.isArray(item.currentValue)">{{ item.currentValue }}</td>
        <td v-else>
          <tr v-for="(element, index) in item.currentValue">
            <td>{{ index + 1 }} : {{ element }}</td>
          </tr>
        </td>
        <td
          :class="{
            'red-text': item.valueDifference.value as number < 0,
            'green-text': item.valueDifference.value as number > 0,
          }"
          v-if="item.valueDifference.value !== 'array'"
        >
          {{ item.valueDifference.sign }}{{ item.valueDifference.unit === '%' ? item.valueDifference.value : $n(item.valueDifference.value, 'currency') }} {{ item.valueDifference.unit }}
        </td>
        <td v-else></td>
      </tr>
    </tbody>
  </v-table>
</template>

<style scoped>
.red-text {
  color: red;
}
.green-text {
  color: green;
}
</style>

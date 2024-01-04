<script lang="ts" setup>
import { watch } from "vue";
const { t } = useI18n();

const props = defineProps<{
  apiRequest: financeMathInput;
  apiResponse;
}>();
</script>

<template>
  <h1 class="flex justify-center pt-5 pb-3 font-bold">{{ $t("seriesTable.entwicklung") }}</h1>
  <v-table class="border rounded-lg overflow-y-auto h-100" max-height="545" height="545">
    <thead>
      <tr>
        <th>{{ test }}</th>
        <th>{{ $t("seriesTable.kapital") }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in props.apiResponse.capitalSeries" :key="index">
        <td>{{ parseInt(props.apiRequest.begin.substring(0, 4)) + index +1 }}</td>
        <td>{{ $n(item, "currency") }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<style scoped>
</style>
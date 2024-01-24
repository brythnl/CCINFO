<script lang="ts" setup>
import { watch } from "vue";
const { t } = useI18n();

const props = defineProps<{
  apiRequest: financeMathInput;
  apiResponse;
}>();

function copyTable() {
  // Get the table element from the DOM
  const tableElement = document.getElementById("table");

  // Convert the table element to an HTML string
  const tableHTMLString = tableElement.outerHTML;

  // Convert the table element to plain text string
  const plainTextString = tableElement.innerText;

  navigator.clipboard.write([
    new ClipboardItem({
      "text/html": new Blob([tableHTMLString], {
        type: "text/html",
      }),
      "text/plain": new Blob([plainTextString], {
        type: "text/plain",
      }),
    }),
  ]);

  alert("Copied!");
}
</script>

<template>
  <div class="flex justify-center pt-5 pb-3">
    <h1 class="px-auto pe-2 font-bold text-lg">
      {{ $t("seriesTable.entwicklung") }}
    </h1>
    <v-btn
      prepend-icon="mdi-content-copy"
      variant="tonal"
      slim
      size="small"
      class="text-none"
      @click="copyTable"
      >Copy
    </v-btn>
  </div>
  <v-table
    id="table"
    class="border rounded-lg overflow-y-auto h-100"
    max-height="545"
    height="545"
  >
    <thead>
      <tr>
        <th>{{ $t("seriesTable.jahr") }}</th>
        <th>{{ $t("seriesTable.kapital") }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in props.apiResponse.capitalSeries" :key="index">
        <td>
          {{ parseInt(props.apiRequest.begin.substring(0, 4)) + index + 1 }}
        </td>
        <td>{{ $n(item, "currency") }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<style scoped></style>

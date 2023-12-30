<script lang="ts" setup>
import type { financeMathInput, financeMathResult } from '~/types/index.d.ts'
import type { combinedData } from '../utils/vergleichstabelleUtils';
import {
  createCombinedArray,
  filterCombinedArrayResp
} from '~/utils/vergleichstabelleUtils'

const props = defineProps<{
  oldRequest?: financeMathInput;
  newRequest?: financeMathInput;
  oldRequestEntnahme?: financeMathInput;
  newRequestEntnahme?: financeMathInput;
  oldResponse?: financeMathResult;
  newResponse?: financeMathResult;
  endpoint?: string;
  isKombiplan?: boolean;
}>()

const requestComparisonArray: combinedData[] = computed(() => {
  if (props.oldRequest && props.newRequest) {
    return createCombinedArray(
      JSON.parse(JSON.stringify(props.oldRequest)),
      JSON.parse(JSON.stringify(props.newRequest)),
    );
  } else return [];
});

const requestComparisonArrayEntnahme: combinedData[] = computed(() => {
  if (props.oldRequestEntnahme && props.newRequestEntnahme) {
    return createCombinedArray(
      JSON.parse(JSON.stringify(props.oldRequestEntnahme)),
      JSON.parse(JSON.stringify(props.newRequestEntnahme)),
    );
  } else return [];
});

const responseFilteredComparisonArray: combinedData[] = computed(() => {
  if (props.oldResponse && props.newResponse) {
    return filterCombinedArrayResp(
      createCombinedArray(
        JSON.parse(JSON.stringify(props.oldResponse)),
        JSON.parse(JSON.stringify(props.newResponse))
      ),
      props.endpoint
    );
  } else return [];
});

</script>

<template>
  <div class="pb-10">
    <h4 class="font-bold pb-3 mt-5"><v-icon>mdi-swap-horizontal</v-icon> Ihre Änderungen</h4>
    <div>
      <v-sheet
        class="rounded-lg elevation-0 bg-primary py-2 mb-3"
        v-if="isKombiplan"
      >
        <h1 class="text-white ps-5 font-bold">Sparphase</h1>
      </v-sheet>
      <VergleichsSubtabelle :combinedArray="requestComparisonArray" />
    </div>
    <div v-if="isKombiplan">
      <v-sheet
        class="rounded-lg elevation-0 bg-primary py-2 mt-5 mb-3"
      >
        <h1 class="text-white ps-5 font-bold">Entnahmephase</h1>
      </v-sheet>
      <VergleichsSubtabelle :combinedArray="requestComparisonArrayEntnahme" />
    </div>
  </div>
  <div>
    <h4 class="font-bold pb-3"><v-icon>mdi-equal-box</v-icon> Ergebnis</h4>
    <VergleichsSubtabelle :combinedArray="responseFilteredComparisonArray" />
  </div>
</template>

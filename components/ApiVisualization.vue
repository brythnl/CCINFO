<script lang="ts" setup>
import {watch} from "vue";

const props = defineProps<{
  apiRequest: financeMathInput;
  apiRequest2: financeMathInput;
  apiResponse: financeMathResult;
  apiResponse2: financeMathResult;
  endPoint: String;
}>();

const find = ref("a");
watch(
    () => props.endPoint,
    () => {
      switch (props.endPoint) {
        case "saving-start-value":
          find.value = "startInvestment";
          break;
        case "saving-rate":
          find.value = "savingRate";
          break;
        case "interest-rate":
          find.value = "interestRate";
          break;
        case "end-date":
          find.value = "end";
          break;
        case "capital":
          find.value = "capitalAmount";
          break;
      }
    },
);
</script>

<template>
  <v-tabs
      v-model="find"
      density="compact"
      grow
      stacked
      hide-slider
      center-active
      class="rounded-lg blue-border text-primary"
      selected-class="bg-primary"
  >
    <v-tab value="startInvestment">Startkapital</v-tab>
    <v-tab value="capitalAmount">Endkapital</v-tab>
    <v-tab value="savingRate">Sparrate</v-tab>
    <v-tab value="interestRate">Zinssatz</v-tab>
    <v-tab value="end">Enddatum</v-tab>
    <v-tab value="begin">Startdatum</v-tab>
    <v-tab value="oneTimeInvestment">Einmal-<br>zahlungen</v-tab>
    <v-tab value="oneTimeInvestmentDate">Datum<br>Enmalzahlungen</v-tab>
    <v-tab value="dynamicSavingRateFactor">Dynamik</v-tab>
    <v-tab value="interestCalculation">Zins<br>berechnung</v-tab>
    <v-tab value="savingPlanBegin">Sparplan-<br>Start</v-tab>
    <v-tab value="savingPlanEnd">Sparplan-<br>Ende</v-tab>
    <v-tab value="capitalSeries">Kapitalserie</v-tab>
  </v-tabs>

  <h1 class="flex justify-center pt-5 pb-3 font-bold">API Aufruf</h1>

  <v-card class="overflow-y-auto bg-grey-lighten-4 elevation-0 rounded-lg" max-height="545" height="545">
    <v-card-item>
      <v-card-text>
        <code>Request {</code>
        <div v-for="(item, index) in props.apiRequest">
          <code
              v-if="item != 0 || item != ''"
              class="ps-5"
              :class="index == find ? 'bg-red-accent-2' : ''"
          >
            "{{ index }}": {{ item }} <br
          /></code>
        </div>
        <code>} <br/><br/></code>

        <code>Response {</code>
        <div v-for="(item, index) in props.apiResponse">
          <div v-if="index == 'capitalResult'">
            <code class="ps-5" :class="index == find ? 'bg-red-accent-2' : ''">
              "{{ index }}": { <br
            /></code>
            <code
                v-for="(subitem, subindex) in item"
                class="ps-10"
                :class="subindex == find ? 'bg-red-accent-2' : ''"
            >
              "{{ subindex }}": {{ subitem }},<br/>
            </code>
            <code class="ps-5">} <br/></code>
          </div>
          <div v-else-if="index == 'capitalSeries'">
            <code class="ps-5" :class="index == find ? 'bg-red-accent-2' : ''">
              "{{ index }}": [ <br
            /></code>
            <code
                v-for="(subitem, subindex) in item"
                class="ps-10"
                :class="subindex == find ? 'bg-red-accent-2' : ''"
            >
              {{ subitem }},<br/>
            </code>
            <code class="ps-5">] <br/></code>
          </div>

          <code
              v-else
              class="ps-5"
              :class="index == find ? 'bg-red-accent-2' : ''"
          >"{{ index }}": {{ item }},</code
          >
        </div>
        <code>}<br/><br/></code>

        <div v-if="props.apiRequest2 && props.apiResponse2">
          <code>Request {</code>
          <div v-for="(item, index) in props.apiRequest2">
            <code
                v-if="item != 0 || item != ''"
                class="ps-5"
                :class="index == find ? 'bg-red-accent-2' : ''"
            >
              "{{ index }}": {{ item }} <br
            /></code>
          </div>
          <code>} <br/><br/></code>

          <code>Response {</code>
          <div v-for="(item, index) in props.apiResponse2">
            <div v-if="index == 'capitalResult'">
              <code
                  class="ps-5"
                  :class="index == find ? 'bg-red-accent-2' : ''"
              >
                "{{ index }}": { <br
              /></code>
              <code
                  v-for="(subitem, subindex) in item"
                  class="ps-10"
                  :class="subindex == find ? 'bg-red-accent-2' : ''"
              >
                "{{ subindex }}": {{ subitem }},<br/>
              </code>
              <code class="ps-5">} <br/></code>
            </div>
            <div v-else-if="index == 'capitalSeries'">
              <code
                  class="ps-5"
                  :class="index == find ? 'bg-red-accent-2' : ''"
              >
                "{{ index }}": [ <br
              /></code>
              <code
                  v-for="(subitem, subindex) in item"
                  class="ps-10"
                  :class="subindex == find ? 'bg-red-accent-2' : ''"
              >
                {{ subitem }},<br/>
              </code>
              <code class="ps-5">] <br/></code>
            </div>

            <code
                v-else
                class="ps-5"
                :class="index == find ? 'bg-red-accent-2' : ''"
            >"{{ index }}": {{ item }},</code
            >
          </div>
          <code>}</code>
        </div>
      </v-card-text>
    </v-card-item>
  </v-card>
</template>

<style scoped>
.v-tab {
  text-transform: none !important;
}

.blue-border {
  border: 1px solid #4195AC;
}

.aixigo {
  background-color: #29788B;
}
</style>
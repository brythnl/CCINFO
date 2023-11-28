<script lang="ts" setup>
import { watch } from "vue";

const props = defineProps<{
  apiRequest: financeMathInput;
  apiRequest2: financeMathInput;
  apiResponse: financeMathResult;
  apiResponse2: financeMathResult;
}>();

const find = ref("a");
watch(
  () => props.apiRequest.endpoint,
  () => {
    switch (props.apiRequest.endpoint) {
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
  <div>
    <h1 class="font-bold text-lg text-center">API</h1>
  </div>
  <v-divider></v-divider>
  <div>
    <h4 class="font-bold">Suchbegriffe:</h4>
    <v-sheet>
      <v-chip-group v-model="find" selected-class="text-blue">
        <v-slide-group center-active>
          <v-chip value="startInvestment" size="small">Startkapital</v-chip>
          <v-chip value="capitalAmount" size="small">Endkapital</v-chip>
          <v-chip value="savingRate" size="small">Sparrate</v-chip>
          <v-chip value="interestRate" size="small">Zinssatz</v-chip>
          <v-chip value="capitalSeries" size="small">Kapitalserien</v-chip>
          <v-chip value="end" size="small">Enddatum</v-chip>
          <v-chip value="begin" size="small">Begindatum</v-chip>
          <v-chip value="oneTimeInvestment" size="small"
            >Einmalzahlungen</v-chip
          >
          <v-chip value="oneTimeInvestmentDate" size="small"
            >Datum der Enmalzahlungen</v-chip
          >
          <v-chip value="dynamicSavingRateFactor" size="small">Dynamik</v-chip>
          <v-chip value="interestCalculation" size="small"
            >Zinsberechnung</v-chip
          >
          <v-chip value="savingPlanBegin" size="small">Sparplansstart</v-chip>
          <v-chip value="savingPlanEnd" size="small">Sparplansend</v-chip>
        </v-slide-group>
      </v-chip-group>
    </v-sheet>
    <v-divider></v-divider>
  </div>
  <v-card
    class="overflow-y-auto bg-grey-darken-4 h-100 rounded-lg"
    max-height="700"
    height="700"
    variant="outlined"
  >
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
        <code>} <br /><br /></code>

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
              "{{ subindex }}": {{ subitem }},<br />
            </code>
            <code class="ps-5">} <br /></code>
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
              {{ subitem }},<br />
            </code>
            <code class="ps-5">] <br /></code>
          </div>

          <code
            v-else
            class="ps-5"
            :class="index == find ? 'bg-red-accent-2' : ''"
            >"{{ index }}": {{ item }},</code
          >
        </div>
        <code>}<br /><br /></code>

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
          <code>} <br /><br /></code>

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
                "{{ subindex }}": {{ subitem }},<br />
              </code>
              <code class="ps-5">} <br /></code>
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
                {{ subitem }},<br />
              </code>
              <code class="ps-5">] <br /></code>
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

<style scoped></style>

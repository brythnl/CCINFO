<script setup lang="ts">
export interface CapitalData {
  capitalResult: {
    capitalAmount: number;
    savingRate: number;
    startInvestment: number;
    interestRate: number;
    end: string;
  };
  capitalSeries: number[];
}

const capitalData = ref({
  capitalResult: {
    capitalAmount: 0,
    savingRate: 0,
    startInvestment: 0,
    interestRate: 0,
    end: "2020-01-01",
  },
  capitalSeries: [0],
});

function storeCapitalData(fetchedCapitalData: CapitalData){
  capitalData.value = fetchedCapitalData
}

</script>

<template>
  <v-container class="h-100 ma-10">
    <v-row class="h-100">
      <v-col cols="3" class="h-100 rounded-lg bg-cyan-darken-3 ma-2">
    <div class="w-100 h-100">
      <capital-form @calculated="calculateForm"/>
    </div>
  </v-col>
  <v-col class="h-100 rounded-lg bg-cyan-darken-3 ma-2">
    <div class="w-100 h-100">
      <capital-graph/>
    </div>
  </v-col>
    <v-col class="h-100 rounded-lg bg-cyan-darken-3 ma-2">
    <div class="w-100 h-100">
      <capital-output :data="newResult"/>
    </div>
  </v-col>
  </v-row>
</v-container>
</template>

<style scoped></style>

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

function storeCapitalData(fetchedCapitalData: CapitalData) {
  capitalData.value = fetchedCapitalData;
}
const formTab = ref("");
</script>

<template>
  <v-container class="h-100 ma-10">
    <v-row class="h-100">
      <v-col cols="3" class="h-100 rounded-lg bg-cyan-darken-3 ma-2">
        <v-card flat>
          <div>
            <form-tabs @tabUpdate="(n)=>formTab=n"/>
          </div>
          <div class="w-100">
            <v-card-text class="bg-cyan-darken-3">
              <v-window v-model="formTab">
                <v-window-item value="saving"><saving-form/></v-window-item>
                <v-window-item value="withdraw"><withdraw-form/></v-window-item>
                <v-window-item value="comb"><combo-form/></v-window-item>
              </v-window>
            </v-card-text>
          </div>
        </v-card>
      </v-col>
      <v-col class="h-100 rounded-lg bg-cyan-darken-3 ma-2">
        <div class="w-100 h-100">
          <capital-graph />
        </div>
      </v-col>
      <v-col class="h-100 rounded-lg bg-cyan-darken-3 ma-2">
        <div class="w-100 h-100">
          <capital-output :capital-data="capitalData" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>

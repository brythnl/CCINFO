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
function onScroll(){
}
const formTab = ref("");
</script>

<template>
  <v-container fluid="false">
    <v-row class="h-100">
      <v-col cols="4" ld="4">
        <div class="h-100 rounded-lg" style="background-color: #F1F9FF;">
            <div>
              <form-tabs @tabUpdate="(n)=>formTab=n"/>
            </div>
            <v-card v-scroll.self="onScroll" class="overflow-y-auto" max-height="850" style="background-color: #F1F9FF;border: solid 3px;">
            <div class="">
              <v-card-text>
                <v-window v-model="formTab">
                  <v-window-item value="saving"><sparplan-form/></v-window-item>
                  <v-window-item value="withdraw"><entnahme-form/></v-window-item>
                  <v-window-item value="comb"><kombi-form/></v-window-item>
                </v-window>
              </v-card-text>
            </div>
          </v-card>
        </div>
      </v-col >
      <v-col cols="4" md="4">
        <div class="h-100 bg-cyan-darken-3 px-4 rounded-lg">
          <capital-graph />
        </div>
      </v-col>
      <v-col cols="4" md="4">
        <div class="h-100 bg-cyan-darken-3 rounded-lg">
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>

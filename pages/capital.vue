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
  <v-container class="h-100">
    <v-row class="h-100">
      <v-col cols="4" ld="4" class="h-100">
        <div class="h-100 bg-cyan-darken-3 rounded-lg">
          <v-card flat>
            <div>
              <form-tabs @tabUpdate="(n)=>formTab=n"/>
            </div>
            <div class="w-100">
              <v-card-text class="bg-cyan-darken-3">
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
      <v-col cols="4" md="4" class="h-100">
        <div class="h-100 bg-cyan-darken-3 px-4 rounded-lg">
          <capital-graph />
        </div>
      </v-col>
      <v-col cols="4" md="4" class="h-100">
        <div class="h-100 bg-cyan-darken-3 rounded-lg">
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>

<script setup lang="ts">
import type { financeMathInput, financeMathResult } from "~/types/index.d.ts"
import { useFinanceMathFetch } from "~/composables/useFinanceMathFetch"

const formTab = ref("");
const API_TOKEN = ""

const financeMathResult: financeMathResult = ref({
// default values here
})

async function fetchFinanceMathAPI(formInput: financeMathInput) {
  const { data } = await useFinanceMathFetch<financeMathResult>(formInput.endpoint, formInput, API_TOKEN)
  financeMathResult.value = data
}

//test
const sparplanInput= ref({
  begin: "2020-01-01",
  end: "2040-01-01",
  interestCalculation: "YEARLY",
  interestRate: 0.05,
  reductionFactor: 0,
  dynamicSavingRateFactor: 0,
  savingPlanBegin: "",
  savingPlanEnd: "",
  oneTimeInvestment: [0],
  oneTimeInvestmentDate: [""],
  savingRate: 200,
  endValue: 0,
  endpoint: ""
})
const response= ref({
  capitalResult: {
    "capitalAmount": 79358.28984693218,
    "savingRate": 200,
    "startInvestment": 0,
    "interestRate": 0.05,
    "end": "2040-01-01"
  },
  capitalSeries: [
    2400,
    4920,
    7566,
    10344.3,
    13261.515,
    16324.59075,
    19540.8202875,
    22917.861301875,
    26463.75436696875,
    30186.94208531719,
    34096.289189583054,
    38201.10364906221,
    42511.15883151532,
    47036.71677309109,
    51788.55261174564,
    56777.980242332924,
    62016.879254449566,
    67517.72321717205,
    73293.60937803065,
    79358.28984693218
  ]
})
</script>

<template>
  <v-container class="h-100" fluid>
    <v-row class="h-100" >
      <v-col class="px-1" cols="4">
        <div class="h-100 rounded-lg" style="background-color: #F1F9FF;border: solid 3px;">
            <div>
              <form-tabs @tabUpdate="(n: string) => formTab = n"/>
            </div>
            <v-card class="overflow-y-auto" max-height="850" style="background-color: #F1F9FF;" elevation="0">
            <div class="">
              <v-card-text>
                <v-window v-model="formTab">
                  <v-window-item value="saving"><sparplan-form @calculateInput="fetchFinanceMathAPI"/></v-window-item>
                  <v-window-item value="withdraw">entnahmeForm</v-window-item>
                  <v-window-item value="comb">kombiForm</v-window-item>
                </v-window>
              </v-card-text>
            </div>
          </v-card>
        </div>
      </v-col>
      <v-col class="px-1" cols="4">
        <div class="h-100 bg-cyan-darken-3 px-4 rounded-lg">
        </div>
      </v-col>
      <v-col class="px-1" cols="4">
          <div class="h-100 rounded-lg" style="background-color: #F1F9FF;border: solid 3px;">
            <api-visualization :apiRequest="sparplanInput" :apiResponse="response"/>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>

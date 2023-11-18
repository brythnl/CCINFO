<script setup lang="ts">

import type { financeMathInput, financeMathResult } from "~/types/index.d.ts"
import { useFinanceMathFetch } from "~/composables/useFinanceMathFetch"
import { getAPIToken } from "../utils/auth";

const grafikTabs = ref("");
const formTab = ref("");

const API_TOKEN = ref("")

const financeMathResult: financeMathResult = ref({
// default values here
})
const financeMathInput: financeMathInput = ref({
// default values here
})

async function fetchFinanceMathAPI(formInput: financeMathInput) {
  financeMathInput.value = formInput
  const { data } = await useFinanceMathFetch<financeMathResult>(formInput.endpoint, formInput, API_TOKEN.value)
  financeMathResult.value = data

  if (formInput.endpoint !== "capital") {
    const result = toRaw(financeMathResult.value.value)
    const { endValue, ...capitalSeriesInput }: financeMathInput = formInput

    switch (formInput.endpoint) {
      case "end-date":
        capitalSeriesInput.end = result.end
        break
      case "interest-rate":
        capitalSeriesInput.interestRate = result.interestRate
        break
      case "saving-rate":
        capitalSeriesInput.savingRate = Math.round(result.savingRate)
        break
      case "saving-start-value":
        capitalSeriesInput.oneTimeInvestment = [Math.round(result.startInvestment)]
        capitalSeriesInput.oneTimeInvestmentDate = [capitalSeriesInput.begin]
        break
    }

    const { data } = await useFinanceMathFetch<financeMathResult>("capital", capitalSeriesInput, API_TOKEN.value)
    console.log(toRaw(data.value))
  }
}

onBeforeMount(async () => {
  API_TOKEN.value = await getAPIToken()
})
</script>

<template>
  <h1 class="font-bold text-3xl text-center py-5">Aixigo Finanzplaner</h1>

  <v-container class="h-100" fluid>
    <v-row class="h-100">
      <v-col class="px-1" cols="4">
        <div>
          <v-card class="h-100 rounded-xl elevation-6">
            <div>
              <v-card-text>
                <div>
                  <form-tabs @tabUpdate="(n: string) => formTab = n"/>
                </div>
                <v-window v-model="formTab">
                  <v-window-item value="saving">
                    <sparplan-form @calculateInput="fetchFinanceMathAPI"/>
                  </v-window-item>
                  <v-window-item value="withdraw">entnahmeForm</v-window-item>
                  <v-window-item value="comb">kombiForm</v-window-item>
                </v-window>
              </v-card-text>
            </div>
          </v-card>
        </div>
      </v-col>
      <v-col class="px-1" cols="4">
        <div>
          <grafik-tab @grafikUpdate="(m:string)=> grafikTabs = m"/>
            <v-card class="h-500 rounded-xl elevation-6">
            <div>
              <v-card-text>
                <v-window v-model="grafikTabs">
                  <v-window-item value="aktuell">Grafik aktuell</v-window-item>
                  <v-window-item value="vorher">Grafik vorher</v-window-item>
                  <v-window-item value="vergleich">Vergleich</v-window-item>
                  <v-window-item value="tabelle">Tabelle</v-window-item>
                </v-window>
              </v-card-text>
            </div>
          </v-card>
        </div>
      </v-col>
      <v-col class="px-1" cols="4">
        <div>
          <v-card class="h-100 rounded-xl elevation-6">
            <v-card-text>
              <api-visualization :apiRequest="financeMathInput" :apiResponse="financeMathResult.value"/>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>

</style>

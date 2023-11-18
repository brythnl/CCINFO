<script setup lang="ts">
import type { financeMathInput, financeMathResult } from "~/types/index.d.ts"
import { useFinanceMathFetch } from "~/composables/useFinanceMathFetch"

const grafikTabs = ref("");
const formTab = ref("");

const API_TOKEN = ""

const financeMathResult: financeMathResult = ref({
// default values here
})
const financeMathInput: financeMathInput = ref({
// default values here
})

async function fetchFinanceMathAPI(formInput: financeMathInput) {
  financeMathInput.value = formInput
  const { data } = await useFinanceMathFetch<financeMathResult>(formInput.endpoint, formInput, API_TOKEN)
  financeMathResult.value = data
}

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
            <div>
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
        <div class="h-100 rounded-lg" style="background-color: #F1F9FF;border: solid 3px;">
          <grafik-tab @grafikUpdate="(m:string)=> grafikTabs = m"/>
            <v-card class="overflow-y-auto" max-height="850" style="background-color: #F1F9FF;" elevation="0">
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
          <div class="h-100 rounded-lg" style="background-color: #F1F9FF;border: solid 3px;">
            <api-visualization :apiRequest="financeMathInput" :apiResponse="financeMathResult.value"/>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>

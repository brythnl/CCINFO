<script setup lang="ts">
import type { financeMathInput, financeMathResult } from "~/types/index.d.ts"
import { useFinanceMathFetch } from "~/composables/useFinanceMathFetch"
import { getAPIToken } from "../utils/auth";

const formTab = ref("")
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
}

onBeforeMount(async () => {
  API_TOKEN.value = await getAPIToken()
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
            <api-visualization :apiRequest="financeMathInput" :apiResponse="financeMathResult.value"/>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>

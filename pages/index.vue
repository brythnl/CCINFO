<script setup lang="ts">
import type {financeMathInput, financeMathResult} from "~/types/index.d.ts"
import {useFinanceMathFetch} from "~/composables/useFinanceMathFetch"

const formTab = ref("");
const API_TOKEN = "";

const financeMathResult: financeMathResult = ref({
// default values here
})
const financeMathInput: financeMathInput = ref({
// default values here
})

async function fetchFinanceMathAPI(formInput: financeMathInput) {
  financeMathInput.value = formInput
  const {data} = await useFinanceMathFetch<financeMathResult>(formInput.endpoint, formInput, API_TOKEN)
  financeMathResult.value = data
}

</script>

<template>
  <h1 class="font-bold text-3xl text-center py-5">Aixigo Finanzplaner</h1>

  <v-container fluid fill-height >
    <v-row>
      <v-col class="px-1" cols="4">
        <div>
          <v-card class="rounded-xl elevation-6">
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
          <v-card class="rounded-xl elevation-6" >
            <v-card-text>
              <vergleichstabelle
                :oldRequest="financeMathInput"
                :newRequest="financeMathInput"
                :oldResponse="financeMathResult.value"
                :newResponse="financeMathResult.value"
              ></vergleichstabelle>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
      <v-col class="px-1" cols="4">
        <div>
          <v-card class="rounded-xl elevation-6">
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

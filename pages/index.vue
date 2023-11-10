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
</script>

<template>
  <v-container class="h-100" fluid>
    <v-row class="h-100">
      <v-col style="border: solid 3px;" class="mx-2 pa-0">
        <div class="h-100 rounded-lg" style="background-color: #F1F9FF;">
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
      <v-col class="mx-2 pa-0">
        <div class="h-100 bg-cyan-darken-3 px-4 rounded-lg">
        </div>
      </v-col>
      <v-col class="mx-2 pa-0">
          <div class="h-100 bg-cyan-darken-3 rounded-lg">
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>

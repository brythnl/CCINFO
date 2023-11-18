<script setup lang="ts">
import type {financeMathInput, financeMathResult} from "~/types/index.d.ts"
import {useFinanceMathFetch} from "~/composables/useFinanceMathFetch"

const formTab = ref("");
const API_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI4ZksxTW95NkVidjktcjNEQ3IwMXJtemVsY3FkMUpUbVJDaGh6YkxRblpnIn0.eyJleHAiOjE3MDAyNDQ1NTgsImlhdCI6MTcwMDI0MDk1OCwiYXV0aF90aW1lIjoxNzAwMjQwOTUxLCJqdGkiOiI3YTNjZGY0NC00N2NiLTQyZjEtOTYyZi05YTRiYmUwMTQxNjQiLCJpc3MiOiJodHRwczovL2xvZ2luLnBvcnRhbC5haXhpZ28uY2xvdWQvcmVhbG1zL2FwcHMiLCJhdWQiOlsid2Vic2l0ZSIsImRlbW8iXSwic3ViIjoiY2xhdWRpYS5zdHJlaGxlLW1heW9AYWx1bW5pLmZoLWFhY2hlbi5kZSIsInR5cCI6IklEIiwiYXpwIjoid2Vic2l0ZSIsInNlc3Npb25fc3RhdGUiOiJjOTZmOTkyZi02M2UyLTQxMmMtYjMzMy04MzEyMDY2ZmUwYWYiLCJhdF9oYXNoIjoiQ2VjUHA3Qno0d0NBMmtVSGdWbEdvQSIsImFjciI6IjAiLCJzaWQiOiJjOTZmOTkyZi02M2UyLTQxMmMtYjMzMy04MzEyMDY2ZmUwYWYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiR1VFU1QiXSwibmFtZSI6IkNsYXVkaWEgU3RyZWhsZSBNYXlvIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiY2xhdWRpYS5zdHJlaGxlLW1heW9AYWx1bW5pLmZoLWFhY2hlbi5kZSIsImdpdmVuX25hbWUiOiJDbGF1ZGlhIiwiZmFtaWx5X25hbWUiOiJTdHJlaGxlIE1heW8iLCJ0ZW5hbnQiOiJndWVzdCIsImVtYWlsIjoiY2xhdWRpYS5zdHJlaGxlLW1heW9AYWx1bW5pLmZoLWFhY2hlbi5kZSJ9.R77_rhVSapgSm13kGx0cC6_j4DJN37GL824n0PnTonxaxCAbkxuhExbDo5SqDcrYkYWco0EpVFXNQ5nclikg3oN0So9pbrwpJbITTVNo5ZQZxzWv8fKo9x_-HXu6Gbeugrv0x7P14O-gaItcFGJC4lTsnoQpYdJMyhBxwv5ovuwJAvwaDLFkXZlj0IhAsfD6Gk6HyolSSxfaBwuDlxgiyL4aZb3iM3i6UPfL1XSv5FCj-njaTLMJ7vGqKuQtTaVJqsJNAqou2sOkaAHHEJ1Egei_uOf248BBff43I7__ESL61wBh8Y1W3_GhoD_y50XZD4NEoFJ_l7Olt20G4M3fpw"

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
          <v-card class="h-500 rounded-xl elevation-6"></v-card>
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

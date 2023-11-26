<script setup lang="ts">
import type {financeMathInput, financeMathResult} from "~/types/index.d.ts"
import {useFinanceMathFetch} from "~/composables/useFinanceMathFetch"

const formTab = ref("");
const API_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI4ZksxTW95NkVidjktcjNEQ3IwMXJtemVsY3FkMUpUbVJDaGh6YkxRblpnIn0.eyJleHAiOjE3MDA0Mjk2NTIsImlhdCI6MTcwMDQyNjA1MiwiYXV0aF90aW1lIjoxNzAwNDI2MDQzLCJqdGkiOiIzMjBhZDc1Ni0xNjliLTQyMzYtOWUwNy04ZjZiNGQ5NDVmNjAiLCJpc3MiOiJodHRwczovL2xvZ2luLnBvcnRhbC5haXhpZ28uY2xvdWQvcmVhbG1zL2FwcHMiLCJhdWQiOlsid2Vic2l0ZSIsImRlbW8iXSwic3ViIjoiY2xhdWRpYS5zdHJlaGxlLW1heW9AYWx1bW5pLmZoLWFhY2hlbi5kZSIsInR5cCI6IklEIiwiYXpwIjoid2Vic2l0ZSIsInNlc3Npb25fc3RhdGUiOiIwMTg1MmQxOC1hYzhmLTQ1ZGUtOTlkZi1lYmU5YmUxM2Y0OTMiLCJhdF9oYXNoIjoiUkkzOHlLVmF0QTJQMGUwWkI4X0xkQSIsImFjciI6IjAiLCJzaWQiOiIwMTg1MmQxOC1hYzhmLTQ1ZGUtOTlkZi1lYmU5YmUxM2Y0OTMiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiR1VFU1QiXSwibmFtZSI6IkNsYXVkaWEgU3RyZWhsZSBNYXlvIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiY2xhdWRpYS5zdHJlaGxlLW1heW9AYWx1bW5pLmZoLWFhY2hlbi5kZSIsImdpdmVuX25hbWUiOiJDbGF1ZGlhIiwiZmFtaWx5X25hbWUiOiJTdHJlaGxlIE1heW8iLCJ0ZW5hbnQiOiJndWVzdCIsImVtYWlsIjoiY2xhdWRpYS5zdHJlaGxlLW1heW9AYWx1bW5pLmZoLWFhY2hlbi5kZSJ9.K8hosvHeN7-CEDtsykjte1dinGZbc1Xj3FNdflMAiQ3t7XaPYl9Fm0AeNpaTU4XTKskUVZyAuN06L8dVnWOqVKJaWEqFOKQtm8694qcMd9uwEcPi_hvOxfl0M2S_J6HZnISBiq5iYVfBBTw6N8nSYeh5sSpPNJnM7XcQopcO9IfjTaRJWctaRuQPgOzv12OlmOkpeJdrp7ekjizoRZiX4xHj4DdgNT0YeYnGRrDt1qWlG6LYeRQJCwECeNIKgltRLkOFROVXYR5d61Ia5J_ZZhh9jLNjhi9Kwes9bJ6L09xrnZ1vcPoiyMXUtUlQvaQNs2YeP-1QScZlWW37iorwWw";

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
              <vergleichstabelle></vergleichstabelle>
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

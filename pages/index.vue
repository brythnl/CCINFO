<script setup lang="ts">
import type {financeMathInput, financeMathResult} from "~/types/index.d.ts"
import {useFinanceMathFetch} from "~/composables/useFinanceMathFetch"

const formTab = ref("");
const API_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI4ZksxTW95NkVidjktcjNEQ3IwMXJtemVsY3FkMUpUbVJDaGh6YkxRblpnIn0.eyJleHAiOjE3MDAzMTk2NzIsImlhdCI6MTcwMDMxNjA3MiwiYXV0aF90aW1lIjoxNzAwMzE2MDY4LCJqdGkiOiJjM2JkMjk2NS02ODVhLTQ4ZmEtYjBiNy02ZjdmYzQwNjgzOWUiLCJpc3MiOiJodHRwczovL2xvZ2luLnBvcnRhbC5haXhpZ28uY2xvdWQvcmVhbG1zL2FwcHMiLCJhdWQiOlsid2Vic2l0ZSIsImRlbW8iXSwic3ViIjoiY2xhdWRpYS5zdHJlaGxlLW1heW9AYWx1bW5pLmZoLWFhY2hlbi5kZSIsInR5cCI6IklEIiwiYXpwIjoid2Vic2l0ZSIsInNlc3Npb25fc3RhdGUiOiI3NDk1ZjM2NC1kZWRhLTRiNzAtYmJjOC03MGQ2MDI0MzQ2NmEiLCJhdF9oYXNoIjoiSHNxNDdfdnk5Y0tSemhsU29TQy1zUSIsImFjciI6IjAiLCJzaWQiOiI3NDk1ZjM2NC1kZWRhLTRiNzAtYmJjOC03MGQ2MDI0MzQ2NmEiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicm9sZXMiOlsiR1VFU1QiXSwibmFtZSI6IkNsYXVkaWEgU3RyZWhsZSBNYXlvIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiY2xhdWRpYS5zdHJlaGxlLW1heW9AYWx1bW5pLmZoLWFhY2hlbi5kZSIsImdpdmVuX25hbWUiOiJDbGF1ZGlhIiwiZmFtaWx5X25hbWUiOiJTdHJlaGxlIE1heW8iLCJ0ZW5hbnQiOiJndWVzdCIsImVtYWlsIjoiY2xhdWRpYS5zdHJlaGxlLW1heW9AYWx1bW5pLmZoLWFhY2hlbi5kZSJ9.VI8G6Qe1PIDYsmhImObI3_jBKuFP9OQqn4QeoBSnvTCB08QYp7f3aYZwLYIXAfoUuarTrSdEakhYEFnW9x3C_5mDxnQjRctoknqNfFpobUm7s4_iV_A1YiH8JwR50aPxCuJiBP_ccS2CVbSYsZ9-vk8G7tv85DLfVvWRKhlixIESwcWY22J2tDFceiJMzQ3mPmxrd7lY5MH5-D7xO8mMf4e8X964cJPno4pbIOX_Fjw8Y4cKCeLyiN2eJ__vJkglY80gkM3sE0cgW74lpPhl-G7IkfG-2YEJsz74oUF_CveLbqZuGHqBOOTbLen9RSfsg93zczl4jzz3QTMBfuZwrg"

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
          <v-card class="h-500 rounded-xl elevation-6">
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

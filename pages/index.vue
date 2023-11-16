<script setup lang="ts">
import type { financeMathInput, financeMathResult } from "~/types/index.d.ts"
import { useFinanceMathFetch } from "~/composables/useFinanceMathFetch"

const formTab = ref("");
const API_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI4ZksxTW95NkVidjktcjNEQ3IwMXJtemVsY3FkMUpUbVJDaGh6YkxRblpnIn0.eyJleHAiOjE3MDAxNjg1NzUsImlhdCI6MTcwMDE2NDk3NSwiYXV0aF90aW1lIjoxNzAwMTY0OTY4LCJqdGkiOiJjMWM1ZDlhMC0xMmRjLTQ5ZWQtOTliNy03Y2Q3ZWEyNWVjNjciLCJpc3MiOiJodHRwczovL2xvZ2luLnBvcnRhbC5haXhpZ28uY2xvdWQvcmVhbG1zL2FwcHMiLCJhdWQiOlsid2Vic2l0ZSIsImRlbW8iXSwic3ViIjoiam9lc3Rpbi5icnlhbkBnbWFpbC5jb20iLCJ0eXAiOiJJRCIsImF6cCI6IndlYnNpdGUiLCJzZXNzaW9uX3N0YXRlIjoiYjg3NGRmMWMtZmVlMC00Yjk4LWIxOGQtY2NmNzY5ZDE4M2MyIiwiYXRfaGFzaCI6InFhdmpmc05jTExibkZQRTVPZ0NnMFEiLCJhY3IiOiIwIiwic2lkIjoiYjg3NGRmMWMtZmVlMC00Yjk4LWIxOGQtY2NmNzY5ZDE4M2MyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInJvbGVzIjpbIkdVRVNUIl0sIm5hbWUiOiJCcnlhbiBOYXRoYW5hZWwgSm9lc3RpbiIsInByZWZlcnJlZF91c2VybmFtZSI6ImpvZXN0aW4uYnJ5YW5AZ21haWwuY29tIiwiZ2l2ZW5fbmFtZSI6IkJyeWFuIE5hdGhhbmFlbCIsImZhbWlseV9uYW1lIjoiSm9lc3RpbiIsInRlbmFudCI6Imd1ZXN0IiwiZW1haWwiOiJqb2VzdGluLmJyeWFuQGdtYWlsLmNvbSJ9.HSZTmJKiHAKxuXfBCqgEOkGNyexucf4cE8QB-u4zoHdHzNa6BeN5zIMX_RdItNSUK_AjZLwbdNPecFfHi9xmifE5nysx9csnOE2qEODk1fSNfS2SGq00nlPHjstRygS8YetJ6ZI6uWqMbjpM3NhSLBBL2PNTNIP7nyIG-pa5GElC-7VSeKMubxnWrK_zSYYJhy6Hy5D7LvB1e5cAZt9NRpXlLe4CvWoZ9FgZ6ORdzqMWrjoPqbZfc_PG1ENx5dO-A2kHjYxc9OXvQk1GMyaqOKB7jOTCbaHjQhWPUv-n9ik5oUboYRtutcYWlkANoOVs_PFEBSfjOcevYNUuZ5_O0g"

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
        capitalSeriesInput.savingRate = Math.round(result.savingRate * 100)
        break
      case "saving-start-value":
        capitalSeriesInput.oneTimeInvestment = [Math.round(result.startInvestment * 100)]
        capitalSeriesInput.oneTimeInvestmentDate = [capitalSeriesInput.begin]
        break
    }

    const { data } = await useFinanceMathFetch<financeMathResult>("capital", capitalSeriesInput, API_TOKEN)
    console.log(toRaw(data.value))
  }
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

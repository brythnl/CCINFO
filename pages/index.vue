<script setup lang="ts">
import type { financeMathInput, financeMathResult } from "~/types/index.d.ts"
import { useFinanceMathFetch } from "~/composables/useFinanceMathFetch"

const formTab = ref("");
const API_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI4ZksxTW95NkVidjktcjNEQ3IwMXJtemVsY3FkMUpUbVJDaGh6YkxRblpnIn0.eyJleHAiOjE2OTk3MzMwNTYsImlhdCI6MTY5OTcyOTQ1NiwiYXV0aF90aW1lIjoxNjk5Njk2MDI0LCJqdGkiOiIyMzRiYWNhZC02Yjg5LTRiYzUtODRhZi0wYWExYjhmMGIyY2MiLCJpc3MiOiJodHRwczovL2xvZ2luLnBvcnRhbC5haXhpZ28uY2xvdWQvcmVhbG1zL2FwcHMiLCJhdWQiOlsid2Vic2l0ZSIsImRlbW8iXSwic3ViIjoiZmFjaHJpYWwucGVyZGFuYUBhbHVtbmkuZmgtYWFjaGVuLmRlIiwidHlwIjoiSUQiLCJhenAiOiJ3ZWJzaXRlIiwic2Vzc2lvbl9zdGF0ZSI6IjM5MjU2NWIyLTQzNzgtNGFjNS05OTViLTU5ZDgwMmQ4NjRkYyIsImF0X2hhc2giOiIxMFdHV3huMmd4WFlFTzBPaTdWRWlBIiwiYWNyIjoiMCIsInNpZCI6IjM5MjU2NWIyLTQzNzgtNGFjNS05OTViLTU5ZDgwMmQ4NjRkYyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJyb2xlcyI6WyJHVUVTVCJdLCJuYW1lIjoiRmFjaHJpYWwgRGltYXMgUHV0cmEgUGVyZGFuYSIsInByZWZlcnJlZF91c2VybmFtZSI6ImZhY2hyaWFsLnBlcmRhbmFAYWx1bW5pLmZoLWFhY2hlbi5kZSIsImdpdmVuX25hbWUiOiJGYWNocmlhbCBEaW1hcyBQdXRyYSIsImZhbWlseV9uYW1lIjoiUGVyZGFuYSIsInRlbmFudCI6Imd1ZXN0IiwiZW1haWwiOiJmYWNocmlhbC5wZXJkYW5hQGFsdW1uaS5maC1hYWNoZW4uZGUifQ.eZdEnrQv5fCIh3NsYUtlSnrY685AXVAeVKjGvFmJpCU920M0wuMJV94MnC8mfcQVfS51ARytoldCgpjOVsNVfAM4aBT5uXfMS8nqdPyA2CCnSIhr7vNtVuPf7DhMIwCNIhunsREKiuMEdpwNQKnFhqnZ0k9J_l1_8TCYqpQHIqb_papIQEEsxWp7cG6i0Dz0Be1avqJtqvEaTJaFjNOzbB1kR-6c789LnYaKRdjjRlGLi_OYjcnZZRRd8rDtqgvwj8f22kJAzcLzojIYf5q4Xm3NMjJJ1cgaYb9Ac8Hz49pfNWmxfadseEPwLUis00U72t1SAs2VegxUy6dD8_dxcA"

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

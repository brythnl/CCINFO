<script setup lang="ts">
import type { EmitData } from '~/components/SparplanForm.vue';

export interface CapitalData {
  capitalResult: {
    capitalAmount: number;
    savingRate: number;
    startInvestment: number;
    interestRate: number;
    end: string;
  };
  capitalSeries: number[];
}

const capitalData = ref({
  capitalResult: {
    capitalAmount: 0,
    savingRate: 0,
    startInvestment: 0,
    interestRate: 0,
    end: "2020-01-01",
  },
  capitalSeries: [0],
});

function storeCapitalData(fetchedCapitalData: CapitalData) {
  capitalData.value = fetchedCapitalData;
}

const API_TOKEN= "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI4ZksxTW95NkVidjktcjNEQ3IwMXJtemVsY3FkMUpUbVJDaGh6YkxRblpnIn0.eyJleHAiOjE2OTg5MzUyMjYsImlhdCI6MTY5ODkzMTYyNiwiYXV0aF90aW1lIjoxNjk4OTE3MzkyLCJqdGkiOiJhYmRhMzQyYS1mYWQzLTQ5NDEtYTg4MC01YzE4OGZmYzhhYzMiLCJpc3MiOiJodHRwczovL2xvZ2luLnBvcnRhbC5haXhpZ28uY2xvdWQvcmVhbG1zL2FwcHMiLCJhdWQiOlsid2Vic2l0ZSIsImRlbW8iXSwic3ViIjoiam9oYW5uZXNzY2huMkBnbWFpbC5jb20iLCJ0eXAiOiJJRCIsImF6cCI6IndlYnNpdGUiLCJzZXNzaW9uX3N0YXRlIjoiNDVlYWJmN2MtZDJlMy00ODAzLTliYmItY2UzYTUwZmFlOTk5IiwiYXRfaGFzaCI6IjJzTTZTWEZ6MlFVSUlPbVFMOGZ6WXciLCJhY3IiOiIwIiwic2lkIjoiNDVlYWJmN2MtZDJlMy00ODAzLTliYmItY2UzYTUwZmFlOTk5IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInJvbGVzIjpbIkdVRVNUIl0sIm5hbWUiOiJKb2hhbm5lcyBTY2huZWlkZXdpbmQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJqb2hhbm5lc3NjaG4yQGdtYWlsLmNvbSIsImdpdmVuX25hbWUiOiJKb2hhbm5lcyIsImZhbWlseV9uYW1lIjoiU2NobmVpZGV3aW5kIiwidGVuYW50IjoiZ3Vlc3QiLCJlbWFpbCI6ImpvaGFubmVzc2NobjJAZ21haWwuY29tIn0.L0FmiIHQ8IBoomoAWBfagHySH6GQk3gS3rYY7o9qmvSIdCVbwf9CALFq0l0IYIx49m2U8WFvL1fnwnqUJYV_-dgTWyToKCMmzPVdiAWGIPTed1NNaaWI3lj9q39YXPgMI7cKLt5EdSvLjJ4hTGpI1ZaxtggccPnasdpE1NnQn0JUX5T5EClSw_nrPwapfig2QaCDgUumo7WYTo0Fr4CUXFKl2i_jaK15IE3T26runirkkMWrm9tt9yHKjNUZG94T705p_y0k9f9f3gRljcPKzH-DaV0gjD6_-jZuRrtUJFtRoqyR7GTyCyUoEVbxZK2ZCI008fGqAloButcU1aRIpA"

async function fetchSavingApi(input: EmitData){
  console.log(input);
  switch(input.endpoint){
    case '/capital':{
      const { data, error } = await useFetch<CapitalData>(
        "https://demo.portal.aixigo.cloud:443/finance-math/capital",
        {
          query: {
            begin: input.beginDate,
            end: input.endDate,
            interestRate: input.interestRate,
            interestCalculation: input.interestCalculation,
            savingRate: input.savingRate,
          },
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      console.log(toRaw(data.value));
      console.log(toRaw(error.value));
      break;
    }
    case '/saving-rate':{
      
      break;
    }
    case '/interest-rate':{
      
      break;
    }
    case '/end-date':{
      
      break;
    }
    case '/capital':{
      
      break;
    }
    default:{

    }
    
  }
}
function onScroll(){}
const formTab = ref("");
</script>

<template>
  <v-container class="h-100" fluid>
    <v-row class="h-100">
      <v-col style="border: solid 3px;" class="mx-2 pa-0">
        <div class="h-100 rounded-lg" style="background-color: #F1F9FF;">
            <div>
              <form-tabs @tabUpdate="(n: string)=>formTab=n"/>
            </div>
            <v-card v-scroll.self="onScroll" class="overflow-y-auto" max-height="850" style="background-color: #F1F9FF;" elevation="0">
            <div class="">
              <v-card-text>
                <v-window v-model="formTab">
                  <v-window-item value="saving"><sparplan-form @passInputData="fetchSavingApi"/></v-window-item>
                  <v-window-item value="withdraw"><entnahme-form/></v-window-item>
                  <v-window-item value="comb"><kombi-form/></v-window-item>
                </v-window>
              </v-card-text>
            </div>
          </v-card>
        </div>
      </v-col>
      <v-col class="mx-2 pa-0">
        <div class="h-100 bg-cyan-darken-3 px-4 rounded-lg">
          <capital-graph />
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

<script setup lang="ts">

const formTab = ref("");
const API_TOKEN = ""

async function fetchSavingApi(formInput) { // add parameter type (financeMathInput)
  console.log(formInput)
  // fetch API to formInput.endpoint with formInput
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
                  <v-window-item value="saving"><sparplan-form @calculateInput="fetchSavingApi"/></v-window-item>
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

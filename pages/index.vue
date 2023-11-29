<script setup lang="ts">
import type { financeMathInput, financeMathResult } from "~/types/index.d.ts";
import { useFinanceMathFetch } from "~/composables/useFinanceMathFetch";
import { getAPIToken } from "~/utils/auth";

const grafikTabs = ref("");
const formTab = ref("");

const API_TOKEN = ref("");

const financeMathInput: financeMathInput = ref({});
// Const and Functions for Savingplan and Entnahmeplan
const financeMathResult: financeMathResult = ref({});
const graphData: financeMathResult = ref({
  capitalSeries: [],
  capitalResult: {},
});

async function fetchFinanceMathAPI(formInput: financeMathInput) {
  financeMathInput.value = formInput;
  const { data } = await useFinanceMathFetch<financeMathResult>(
    formInput.endpoint,
    formInput,
    API_TOKEN.value,
  );
  financeMathResult.value = data;


  if (formInput.endpoint !== "capital") {
    const result = toRaw(financeMathResult.value.value);
    const { endValue, ...capitalSeriesInput }: financeMathInput = formInput;

    switch (formInput.endpoint) {
      case "end-date":
        capitalSeriesInput.end = result.end;
        break;
      case "interest-rate":
        capitalSeriesInput.interestRate = result.interestRate;
        break;
      case "saving-rate":
        capitalSeriesInput.savingRate = Math.round(result.savingRate);
        break;
      case "saving-start-value":
        capitalSeriesInput.oneTimeInvestment = [
          Math.round(result.startInvestment),
        ];
        capitalSeriesInput.oneTimeInvestmentDate = [capitalSeriesInput.begin];
        break;
    }

    const { data } = await useFinanceMathFetch<financeMathResult>(
      "capital",
      capitalSeriesInput,
      API_TOKEN.value,
    );

    graphData.value.capitalResult = financeMathResult.value.value;
    graphData.value.capitalSeries = data.value.capitalSeries;

  } else {
    graphData.value.capitalResult = financeMathResult.value.value.capitalResult;
    graphData.value.capitalSeries = financeMathResult.value.value.capitalSeries;
  }
}

// For Kombiplan
const financeMathResultSparen: financeMathResult = ref({});
const financeMathResultEntnahme: financeMathResult = ref({});
const financeMathInputSparen: financeMathInput = ref({});
const financeMathInputEntnahme: financeMathInput = ref({});

/*
 *function fetchKombiPlan
 *sparForm is Parameter to save savingPlan part of the combi-plan
 *entnahmeForm is Parameter to save withdrawPlan part of the combi-plan
 *
 * this function send several API-calls related to combi-form
 * if the wanted variable is part of the savingPlan, API calls will be sent for the withdrawPlan to find the startInvestment of withdrawPlan
 * from the result of the API call, the startInvestment variable will be assigned as endValue of the savingPlan input and another API call will be made using the savingPlan input
 *
 * if the wanted variable is part of the withdrawPlan, API calls will be sent for the savingPlan to find the endValue of savingPlan
 * from the result of the API call, the endValue variable will be assigned as startInvestment of the withdrawPlan input and another API call will be made using the withdrawPlan input
 *
 * in each case API call for endPoint capital for both plan will be sent for the Graph, when if it has'nt been sent yet.
 */
async function fetchKombiPlan({ sparForm, entnahmeForm }) {
  financeMathInputSparen.value = sparForm;
  financeMathInputEntnahme.value = entnahmeForm;

  // Endpoint Property: [sparen/entnahme]/<API endpoint>
  const endpointType = sparForm.endpoint.split("/");

  if (endpointType[0] === "sparen") {
    // assign endpoint for each plan
    financeMathInputSparen.value.endpoint = endpointType[1];
    financeMathInputEntnahme.value.endpoint = "saving-start-value";

    // fetch start capital from entnahmeplan for the end capital of sparplan
    const { data: entnahmeStartCapitalData } =
      await useFinanceMathFetch<financeMathResult>(
        financeMathInputEntnahme.value.endpoint,
        financeMathInputEntnahme.value,
        API_TOKEN.value,
      );
    financeMathResultEntnahme.value = entnahmeStartCapitalData;

    // set sparplan end capital as entnahmeplan start capital
    financeMathInputSparen.value.endValue = Math.round(
      financeMathResultEntnahme.value.value.startInvestment,
    );
    financeMathInputEntnahme.value.oneTimeInvestment[0] = Math.round(
      financeMathResultEntnahme.value.value.startInvestment,
    );

    // fetch data for sparplan to selected endpoint
    const { data: sparplanData } = await useFinanceMathFetch<financeMathResult>(
      financeMathInputSparen.value.endpoint,
      financeMathInputSparen.value,
      API_TOKEN.value,
    );
    financeMathResultSparen.value = sparplanData;

    // fetch capital series for entnahmeplan
    const { data: entnahmeSeriesData } =
      await useFinanceMathFetch<financeMathResult>(
        "capital",
        financeMathInputEntnahme.value,
        API_TOKEN.value,
      );
    graphData.value.capitalResult =
      entnahmeSeriesData.value.capitalResult;

    // fetch capital series for sparplan
    const result = toRaw(financeMathResultSparen.value.value);
    const { endValue, ...capitalSeriesInput }: financeMathInput =
      financeMathInputSparen.value;

    // assign the value from the result from previous API call in capitalSeriesInput
    switch (endpointType[1]) {
      case "end-date":
        capitalSeriesInput.end = result.end;
        break;
      case "interest-rate":
        capitalSeriesInput.interestRate = result.interestRate;
        break;
      case "saving-rate":
        capitalSeriesInput.savingRate = Math.round(result.savingRate);
        break;
      case "saving-start-value":
        capitalSeriesInput.oneTimeInvestment = [
          Math.round(result.startInvestment),
        ];
        capitalSeriesInput.oneTimeInvestmentDate = [capitalSeriesInput.begin];
        break;
    }

    // API call for the capitalSeries of Sparplan for the graph
    const { data: sparenSeriesData } =
      await useFinanceMathFetch<financeMathResult>(
        "capital",
        capitalSeriesInput,
        API_TOKEN.value,
      );

    // Merge the 2 capitalSeries form Spar- and Entnahmeplan for graph
    graphData.value.capitalSeries =
      sparenSeriesData.value.capitalSeries.concat(
        entnahmeSeriesData.value.capitalSeries,
      );

    // Assign needed variables for the capitalResult value for graph
    graphData.value.capitalResult.start =
      sparenSeriesData.value.capitalResult.start;
    graphData.value.capitalResult.startInvestment =
      sparenSeriesData.value.capitalResult.startInvestment;

  } else if (endpointType[0] === "entnahme") {
    // assign endpoint each plan
    financeMathInputSparen.value.endpoint = "capital";
    financeMathInputEntnahme.value.endpoint = endpointType[1];

    // fetch end capital of sparplan for startInvestment of entnahmeplan
    const { data: sparEndCapitalData } =
      await useFinanceMathFetch<financeMathResult>(
        financeMathInputSparen.value.endpoint,
        financeMathInputSparen.value,
        API_TOKEN.value,
      );
    financeMathResultSparen.value = sparEndCapitalData;

    // set entnahmeplan start capital as sparplan end capital
    financeMathInputEntnahme.value.oneTimeInvestment[0] = Math.round(
      financeMathResultSparen.value.value.capitalResult.capitalAmount,
    );

    // fetch data for entnahmeplan to selected endpoint
    const { data: entnahmeData } = await useFinanceMathFetch<financeMathResult>(
      financeMathInputEntnahme.value.endpoint,
      financeMathInputEntnahme.value,
      API_TOKEN.value,
    );
    financeMathResultEntnahme.value = entnahmeData;

    // if the endpoint is not capital
    if (financeMathInputEntnahme.value.endpoint !== "capital") {
      const result = toRaw(financeMathResultEntnahme.value.value);
      const { endValue, ...capitalSeriesInput }: financeMathInput =
        financeMathInputEntnahme.value;

      // assign the value from the result from previous API call in capitalSeriesInput
      switch (financeMathInputEntnahme.value.endpoint.endpoint) {
        case "end-date":
          capitalSeriesInput.end = result.end;
          break;
        case "interest-rate":
          capitalSeriesInput.interestRate = result.interestRate;
          break;
        case "saving-rate":
          capitalSeriesInput.savingRate = Math.round(result.savingRate);
          break;
        case "saving-start-value":
          capitalSeriesInput.oneTimeInvestment = [
            Math.round(result.startInvestment),
          ];
          capitalSeriesInput.oneTimeInvestmentDate = [capitalSeriesInput.begin];
          break;
      }

      // API call for the capitalSeries of the Entnahmeplan for the graph
      const { data: entnahmeSeriesData } =
        await useFinanceMathFetch<financeMathResult>(
          "capital",
          financeMathInputEntnahme.value,
          API_TOKEN.value,
        );

      // Merge the 2 capitalSeries form Spar- and Entnahmeplan for graph
      graphData.value.capitalSeries =
        sparEndCapitalData.value.capitalSeries.concat(
          entnahmeSeriesData.value.capitalSeries,
        );

      // Assign needed variables for the capitalResult value for graph
      graphData.value.capitalResult =
        entnahmeSeriesData.value.capitalResult;
      graphData.value.capitalResult.start =
        sparEndCapitalData.value.capitalResult.start;
      graphData.value.capitalResult.startInvestment =
        sparEndCapitalData.value.capitalResult.startInvestment;
    } else {
      // if the endpoint is /capital
      // Merge the 2 capitalSeries form Spar- and Entnahmeplan for graph
      graphData.value.capitalSeries =
        sparEndCapitalData.value.capitalSeries.concat(
          entnahmeData.value.capitalSeries,
        );

      // Assign needed variables for the capitalResult value for graph
      graphData.value.capitalResult =
        entnahmeData.value.capitalResult;
      graphData.value.capitalResult.start =
        sparEndCapitalData.value.capitalResult.start;
      graphData.value.capitalResult.startInvestment =
        sparEndCapitalData.value.capitalResult.startInvestment;
    }
  }
}

onBeforeMount(async () => {
  API_TOKEN.value = await getAPIToken();
});
</script>

<template>
  <h1 class="font-bold text-3xl text-center py-5">Aixigo Finanzplaner</h1>

  <v-container fluid>
    <v-row class="h-lg-100">
      <v-col :cols="12" :sm="12" :md="6" :lg="4" class="px-1 h-100">
        <div class="h-100">
          <v-card class="h-100 rounded-xl elevation-6 pb-5">
            <div>
              <v-card-text>
                <div>
                  <form-tabs @tabUpdate="(n: string) => (formTab = n)" />
                </div>
                <v-window v-model="formTab">
                  <v-window-item value="saving">
                    <sparplan-form
                      @calculateInput="fetchFinanceMathAPI"
                      :apiResponse="financeMathResult.value"
                    />
                  </v-window-item>
                  <v-window-item value="withdraw"
                    ><entnahme-form
                      @calculateInput="fetchFinanceMathAPI"
                      :apiResponse="financeMathResult.value"
                  /></v-window-item>
                  <v-window-item value="comb">
                    <kombi-form
                      @calculateInput="fetchKombiPlan"
                      :apiResponseSparen="financeMathResultSparen.value"
                      :apiResponseEntnahme="financeMathResultEntnahme.value"
                    />
                  </v-window-item>
                </v-window>
              </v-card-text>
            </div>
          </v-card>
        </div>
      </v-col>
      <v-col :cols="12" :sm="12" :md="6" :lg="4" class="px-1 h-100">
        <div class="h-100">
          <v-card class="h-100 rounded-xl elevation-6 pb-5">
            <div>
              <v-card-text>
                <grafik-tab @grafikUpdate="(m: string) => (grafikTabs = m)" />
                <v-window v-model="grafikTabs">
                  <v-window-item value="aktuell">
                    <graph
                      :series="graphData.capitalSeries"
                      :result="graphData.capitalResult"
                    />
                  </v-window-item>
                  <v-window-item value="vorher">Grafik vorher</v-window-item>
                  <v-window-item value="vergleich">Vergleich</v-window-item>
                  <v-window-item value="tabelle">Tabelle</v-window-item>
                </v-window>
              </v-card-text>
            </div>
          </v-card>
        </div>
      </v-col>
      <v-col :cols="12" :sm="12" :md="12" :lg="4" class="px-1 h-100">
        <div class="h-100">
          <v-card class="h-100 rounded-xl elevation-6 pb-5">
            <v-card-text>
              <api-visualization
                v-if="formTab == 'comb'"
                :apiRequest="financeMathInputSparen"
                :apiRequest2="financeMathInputEntnahme"
                :apiResponse="financeMathResultSparen.value"
                :apiResponse2="financeMathResultEntnahme.value"
              />
              <api-visualization
                v-else
                :apiRequest="financeMathInput"
                :apiResponse="financeMathResult.value"
                :apiRequest2="null"
                :apiResponse2="null"
              />
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
@media (min-width: 1280px) {
  .h-lg-100 {
    height: 100%;
  }
}
@media (min-width: 960px) {
  .h-md-100 {
    height: 100%;
  }
}
@media (min-width: 600px) {
  .h-sm-100 {
    height: 100%;
  }
}
</style>

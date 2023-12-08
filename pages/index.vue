<script setup lang="ts">
import type { financeMathInput, financeMathResult } from "~/types/index.d.ts";
import { useFinanceMathFetch } from "~/composables/useFinanceMathFetch";
import { getAPIToken } from "~/utils/auth";

const API_TOKEN = ref("");
const grafikTabs = ref("");
const formTab = ref("");
const api = ref(true);
// Check if there are already two API calls to the same endpoint
const callsTwoSameEndpoints = ref(false);

/* Query parameters of:
* Index 0 => current API call
* Index 1 => previous API call
*/
const financeMathInputs: financeMathInput[] = ref([{}, {}])
/* Response results of:
* Index 0 => current API call
* Index 1 => previous API call
*/
const financeMathResults: financeMathResult[] = ref([{}, {}])

// Processed data to pass in to graph component
const previousGraphData: financeMathResult = ref({
  capitalSeries: [],
  capitalResult: {},
});
const graphData: financeMathResult = ref({
  capitalSeries: [],
  capitalResult: {},
});

// Reverted API response results (from Cent to Euro)
const revertedWithdrawResult: financeMathResult = ref({});
const revertedSavingResult: financeMathResult = ref({});

// Fetch response from Finance Math API based on user data from form
async function fetchFinanceMathAPI(formInput: financeMathInput) {
  // Save current query parameters on index 0 and push back previous parameters to index 1
  financeMathInputs.value.unshift(formInput);
  // Remove query parameters of API call before previous API call
  if (financeMathInputs.value.length > 2) financeMathInputs.value.pop()
  // Check if there is a previous API call and both API calls are directed to the same endpoint
  if (financeMathInputs.value.length === 2
    && financeMathInputs.value[0].endpoint === financeMathInputs.value[1].endpoint) {
    callsTwoSameEndpoints.value = true;
  } else callsTwoSameEndpoints.value = false;

  // API call to selected endpoint
  const { data } = await useFinanceMathFetch<financeMathResult>(
    formInput.endpoint,
    formInput,
    API_TOKEN.value,
  );

  // Save current API response result on index 0 and push back previous result to index 1
  financeMathResults.value.unshift(data)
  // Remove response before previous response
  if (financeMathResults.value.length > 2) financeMathResults.value.pop()

  if (formTab.value === 'saving') {
    revertedSavingResult.value = revertOutput(financeMathResults.value[0].value);
  } else if (formTab.value === 'withdraw') {
    revertedWithdrawResult.value = revertOutput(financeMathResults.value[0].value);
    revertedWithdrawResult.value.savingRate = -revertedWithdrawResult.value.savingRate;
  }

  // Save previous graph data
  previousGraphData.value.capitalResult = graphData.value.capitalResult
  previousGraphData.value.capitalSeries = graphData.value.capitalSeries

  // Fetch capital series for the graph for other selected endpoints (doesn't return capital series) outside /capital
  if (formInput.endpoint !== "capital") {
    const result = toRaw(financeMathResults.value[0].value);
    const { endValue, ...capitalSeriesInput }: financeMathInput = formInput;

    // Input preprocessing, so that it can be passed to /capital API call as query parameters
    switch (formInput.endpoint) {
      case "end-date":
        if(formTab.value==="withdraw"){
          capitalSeriesInput.savingRate=-capitalSeriesInput.savingRate;
          capitalSeriesInput.oneTimeInvestment = capitalSeriesInput.oneTimeInvestment.map((investment)=>-investment);
        }
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

    // API call to /capital
    const { data } = await useFinanceMathFetch<financeMathResult>(
      "capital",
      capitalSeriesInput,
      API_TOKEN.value,
    );

    // Assign result from first endpoint call as graph data
    graphData.value.capitalResult = revertOutput(financeMathResults.value[0].value);
    if (formTab.value === "withdraw" && formInput.endpoint === "end-date") {
      graphData.value.capitalResult.startInvestment = -graphData.value.capitalResult.startInvestment;
    }
    // Assign result from second call to /capital to get capital series as graph data
    graphData.value.capitalSeries = revertOutput(data.value).capitalSeries;

  } else { // Assign results from /capital API fetch as graph data
    graphData.value.capitalResult = revertOutput(financeMathResults.value[0].value).capitalResult;
    graphData.value.capitalSeries = revertOutput(financeMathResults.value[0].value).capitalSeries;
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
    revertedWithdrawResult.value= revertOutput(entnahmeStartCapitalData.value);
    revertedWithdrawResult.value.savingRate=-revertedWithdrawResult.value.savingRate;

    // set entnahmeplan start capital as sparplan end capital
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
    revertedSavingResult.value= revertOutput(financeMathResultSparen.value.value);


    // fetch capital series for entnahmeplan
    const { data: entnahmeSeriesData } =
      await useFinanceMathFetch<financeMathResult>(
        "capital",
        financeMathInputEntnahme.value,
        API_TOKEN.value,
      );
      entnahmeSeriesData.value = revertOutput(entnahmeSeriesData.value);
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
      sparenSeriesData.value = revertOutput(sparenSeriesData.value);
    // Merge the 2 capitalSeries form Spar- and Entnahmeplan for graph
    graphData.value.capitalSeries =
      sparenSeriesData.value.capitalSeries.concat(
        entnahmeSeriesData.value.capitalSeries,
      );
    graphData.value.capitalResult = entnahmeSeriesData.value.capitalResult;
    // Assign needed variables for the capitalResult value for graph
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
    revertedSavingResult.value = revertOutput(sparEndCapitalData.value);

    // set sparplan end capital as entnahmeplan start capital
    if(financeMathInputEntnahme.value.endpoint==="end-date"){
      financeMathInputEntnahme.value.oneTimeInvestment[0] = -Math.round(
        financeMathResultSparen.value.value.capitalResult.capitalAmount,
      );
      if(financeMathInputEntnahme.endValue<=0){
        financeMathInputEntnahme.endValue=1;
        }
    }else{
      financeMathInputEntnahme.value.oneTimeInvestment[0] = Math.round(
        financeMathResultSparen.value.value.capitalResult.capitalAmount,
      );
    }
    // fetch data for entnahmeplan to selected endpoint
    const { data: entnahmeData } = await useFinanceMathFetch<financeMathResult>(
      financeMathInputEntnahme.value.endpoint,
      financeMathInputEntnahme.value,
      API_TOKEN.value,
    );
    financeMathResultEntnahme.value = entnahmeData;
    revertedWithdrawResult.value = revertOutput(entnahmeData.value);
    revertedWithdrawResult.value.savingRate=-revertedWithdrawResult.value.savingRate;

    // if the endpoint is not capital
    if (financeMathInputEntnahme.value.endpoint !== "capital") {
      const result = toRaw(financeMathResultEntnahme.value.value);
      const { endValue, ...capitalSeriesInput }: financeMathInput =
        financeMathInputEntnahme.value;

      // assign the value from the result from previous API call in capitalSeriesInput
      switch (financeMathInputEntnahme.value.endpoint) {
        case "end-date":
          capitalSeriesInput.savingRate=-capitalSeriesInput.savingRate;
          capitalSeriesInput.oneTimeInvestment = capitalSeriesInput.oneTimeInvestment.map((investment)=>-investment);
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
          capitalSeriesInput,
          API_TOKEN.value,
        );
        entnahmeSeriesData.value = revertOutput(entnahmeSeriesData.value);
      // Merge the 2 capitalSeries form Spar- and Entnahmeplan for graph
      graphData.value.capitalSeries =
        revertedSavingResult.value.capitalSeries.concat(
          entnahmeSeriesData.value.capitalSeries,
        );

      // Assign needed variables for the capitalResult value for graph
      graphData.value.capitalResult =
        entnahmeSeriesData.value.capitalResult;
      graphData.value.capitalResult.startInvestment =
      revertedSavingResult.value.capitalResult.startInvestment;
    } else {
      // if the endpoint is /capital
      // Merge the 2 capitalSeries form Spar- and Entnahmeplan for graph
      graphData.value.capitalSeries =
      revertedSavingResult.value.capitalSeries.concat(
        revertedWithdrawResult.value.capitalSeries,
        );

      // Assign needed variables for the capitalResult value for graph
      graphData.value.capitalResult =
      revertedWithdrawResult.value.capitalResult;
      graphData.value.capitalResult.startInvestment =
      revertedSavingResult.value.capitalResult.startInvestment;
    }
  }
}

onBeforeMount(async () => {
  API_TOKEN.value = await getAPIToken();
});
</script>

<template>
  <header class="bg-white">
    <v-row class="custom-row">
      <v-col cols="auto" class="flex align-center">
        <img class="pa-5 pe-0"
             src="https://assets-global.website-files.com/60d5bca841056859df8738f0/60dec34edc0691ce3efed5f1_Logo.svg"
             alt="logo">
      </v-col>
      <v-spacer></v-spacer>
      <v-col cols="auto" class="flex align-center me-2 me-md-10">
        <v-switch
            v-model="api"
            hide-details
            inset
            color="primary"
            label="API"
            width="auto"
        ></v-switch>
      </v-col>
    </v-row>
  </header>
  <v-container fluid>
    <v-row class="h-lg-100 justify-center">
      <v-col :cols="12" :sm="12" :md="6" :lg="4" class="px-1 h-100">
        <div class="h-100">
          <v-card class="h-100 rounded-xl elevation-6 pb-5">
            <div>
              <v-card-text>
                <div>
                  <form-tabs @tabUpdate="(n: string) => (formTab = n)"/>
                </div>
                <v-window v-model="formTab">
                  <v-window-item value="saving">
                    <sparplan-form
                      @calculateInput="fetchFinanceMathAPI"
                      :apiResponse="revertedSavingResult"
                    />
                  </v-window-item>
                  <v-window-item value="withdraw"
                    ><entnahme-form
                      @calculateInput="fetchFinanceMathAPI"
                      :apiResponse="revertedWithdrawResult"
                  /></v-window-item>
                  <v-window-item value="comb">
                    <kombi-form
                      @calculateInput="fetchKombiPlan"
                      :apiResponseSparen="revertedSavingResult"
                      :apiResponseEntnahme="revertedWithdrawResult"
                    />
                  </v-window-item>
                </v-window>
              </v-card-text>
            </div>
          </v-card>
        </div>
      </v-col>
      <v-col :cols="12" :sm="12" :md="6" :lg="api ? 4 : 6" class="px-1 h-100">
        <div class="h-100">
          <v-card class="h-100 rounded-xl elevation-6 pb-5">
            <div>
              <v-card-text>
                <grafik-tab @grafikUpdate="(m: string) => (grafikTabs = m)"/>
                <v-window v-model="grafikTabs">
                  <v-window-item value="aktuell">
                    <graph
                      :series="graphData.capitalSeries"
                      :result="graphData.capitalResult"
                    />
                  </v-window-item>
                  <v-window-item value="vorher">Grafik vorher</v-window-item>
                  <v-window-item value="vergleich">
                    <vergleichstabelle
                      :oldRequest="financeMathInputs[1]"
                      :newRequest="financeMathInputs[0]"
                      :oldResponse="financeMathResults[1].value"
                      :newResponse="financeMathResults[0].value"
                    ></vergleichstabelle>
                  </v-window-item>
                  <v-window-item value="tabelle">Tabelle</v-window-item>
                </v-window>
              </v-card-text>
            </div>
          </v-card>
        </div>
      </v-col>
      <v-col v-if="api" :cols="12" :sm="12" :md="12" :lg="4" class="px-1 h-100">
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

.custom-row{
  height: 120px;
}
</style>

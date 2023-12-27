<script setup lang="ts">
import type { financeMathInput, financeMathResult } from "~/types/index.d.ts";
import { useFinanceMathFetch } from "~/composables/useFinanceMathFetch";
import { getAPIToken } from "~/utils/auth";
import {
  removeSearchedEndpointFromInput,
  revertOutput,
} from "../utils/formUtils";
import AnswerSentence from "../components/AnswerSentence.vue";

const API_TOKEN = ref("");
const grafikTabs = ref("");
const formTab = ref("");
const api = ref(true);
// Check if there are already two API calls to the same endpoint
const callsTwoSameEndpoints = ref(false);

//Maximal y-axis value of graph for both, to avoid inconsistency
const graphMaxYAxis= ref(0);
//visibiliti of previos graph in actual graph


/* Query parameters of:
 * Index 0 => current API call
 * Index 1 => previous API call
 */
const financeMathInputs: financeMathInput[] = ref([{}, {}]);
/* Response results of:
 * Index 0 => current API call
 * Index 1 => previous API call
 */
const financeMathResults: financeMathResult[] = ref([{}, {}]);

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
const endpoint: string = ref('')
const startDate: string = ref('')

// Fetch response from Finance Math API based on user data from form
async function fetchFinanceMathAPI(formInput: financeMathInput) {
  endpoint.value = formInput.endpoint;
  startDate.value = formInput.begin;

  // Remove searched property from input/request
  formInput = removeSearchedEndpointFromInput(formInput);

  // Save current query parameters on index 0 and push back previous parameters to index 1
  financeMathInputs.value.unshift(formInput);
  // Remove query parameters of API call before previous API call
  if (financeMathInputs.value.length > 2) financeMathInputs.value.pop();

  // Check if both API calls are directed to the same endpoint
  if (
    financeMathInputs.value[0].endpoint === financeMathInputs.value[1].endpoint
  ) {
    callsTwoSameEndpoints.value = true;
  } else callsTwoSameEndpoints.value = false;

  // API call to selected endpoint
  const { data } = await useFinanceMathFetch<financeMathResult>(
    formInput.endpoint,
    formInput,
    API_TOKEN.value
  );

  // Save current API response result on index 0 and push back previous result to index 1
  financeMathResults.value.unshift(data);
  // Remove response before previous response
  if (financeMathResults.value.length > 2) financeMathResults.value.pop();

  if (formTab.value === "saving") {
    revertedSavingResult.value = revertOutput(
      financeMathResults.value[0].value
    );
  } else if (formTab.value === "withdraw") {
    revertedWithdrawResult.value = revertOutput(
      financeMathResults.value[0].value
    );
    revertedWithdrawResult.value.savingRate =
      -revertedWithdrawResult.value.savingRate;
  }

  // Save previous graph data
  previousGraphData.value.capitalResult = graphData.value.capitalResult;
  previousGraphData.value.capitalSeries = graphData.value.capitalSeries;

  // Fetch capital series for the graph for other selected endpoints (doesn't return capital series) outside /capital
  if (formInput.endpoint !== "capital") {
    const result = toRaw(financeMathResults.value[0].value);
    const { endValue, ...capitalSeriesInput }: financeMathInput = formInput;

    // Input preprocessing, so that it can be passed to /capital API call as query parameters
    switch (formInput.endpoint) {
      case "end-date":
        if (formTab.value === "withdraw") {
          capitalSeriesInput.savingRate = -capitalSeriesInput.savingRate;
          capitalSeriesInput.oneTimeInvestment =
            capitalSeriesInput.oneTimeInvestment.map(
              (investment) => -investment
            );
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
      API_TOKEN.value
    );

    // Assign result from first endpoint call as graph data
    graphData.value.capitalResult = revertOutput(
      financeMathResults.value[0].value
    );
    if (formTab.value === "withdraw" && formInput.endpoint === "end-date") {
      graphData.value.capitalResult.startInvestment =
        -graphData.value.capitalResult.startInvestment;
    }
    // Assign result from second call to /capital to get capital series as graph data
    graphData.value.capitalSeries = revertOutput(data.value).capitalSeries;
  } else {
    // Assign results from /capital API fetch as graph data
    graphData.value.capitalResult = revertOutput(
      financeMathResults.value[0].value
    ).capitalResult;
    graphData.value.capitalSeries = revertOutput(
      financeMathResults.value[0].value
    ).capitalSeries;
  }
  const max = Math.max(...graphData.value.capitalSeries);
  if(Math.max(max,graphData.value.capitalResult.startInvestment)>graphMaxYAxis.value){
    graphMaxYAxis.value = Math.max(max,graphData.value.capitalResult.startInvestment);
  }
}

// For Kombiplan
const financeMathResultsSparen: financeMathResult[] = ref([{}, {}]);
const financeMathResultsEntnahme: financeMathResult[] = ref([{}, {}]);
const financeMathInputsSparen: financeMathInput[] = ref([{}, {}]);
const financeMathInputsEntnahme: financeMathInput[] = ref([{}, {}]);

/*
 * sparFormInput is Parameter to save savingPlan part of the combi-plan
 * entnahmeFormInput is Parameter to save withdrawPlan part of the combi-plan
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
async function fetchKombiPlan({ sparFormInput, entnahmeFormInput }) {
  // Save current query parameters on index 0 and push back previous parameters to index 1
  financeMathInputsSparen.value.unshift(sparFormInput);
  financeMathInputsEntnahme.value.unshift(entnahmeFormInput);
  // Remove query parameters of API call before previous API call
  if (financeMathInputsSparen.value.length > 2) financeMathInputsSparen.value.pop();
  if (financeMathInputsEntnahme.value.length > 2) financeMathInputsEntnahme.value.pop();

  // Endpoint Property: [sparen/entnahme]/<API endpoint>
  const endpointType = sparFormInput.endpoint.split("/");

  if (endpointType[0] === "sparen") {
    // assign endpoint for each plan
    financeMathInputsSparen.value[0].endpoint = endpointType[1];
    financeMathInputsEntnahme.value[0].endpoint = "saving-start-value";

    // Check if both API calls are directed to the same endpoint
    if (
      financeMathInputsSparen.value[0].endpoint === financeMathInputsSparen.value[1].endpoint
    ) {
      callsTwoSameEndpoints.value = true;
    } else callsTwoSameEndpoints.value = false;

    // fetch start capital from entnahmeplan for the end capital of sparplan
    const { data: entnahmeStartCapitalData } =
      await useFinanceMathFetch<financeMathResult>(
        financeMathInputsEntnahme.value[0].endpoint,
        financeMathInputsEntnahme.value[0],
        API_TOKEN.value
      );

    // Save current API response result on index 0 and push back previous result to index 1
    financeMathResultsEntnahme.value.unshift(entnahmeStartCapitalData);
    // Remove response before previous response
    if (financeMathResultsEntnahme.value.length > 2) financeMathResultsEntnahme.value.pop();

    revertedWithdrawResult.value = revertOutput(entnahmeStartCapitalData.value);
    revertedWithdrawResult.value.savingRate =
      -revertedWithdrawResult.value.savingRate;

    // set entnahmeplan start capital as sparplan end capital
    financeMathInputsSparen.value[0].endValue = Math.round(
      financeMathResultsEntnahme.value[0].value.startInvestment
    );
    financeMathInputsEntnahme.value[0].oneTimeInvestment[0] = Math.round(
      financeMathResultsEntnahme.value[0].value.startInvestment
    );

    // fetch data for sparplan to selected endpoint
    const { data: sparplanData } = await useFinanceMathFetch<financeMathResult>(
      financeMathInputsSparen.value[0].endpoint,
      financeMathInputsSparen.value[0],
      API_TOKEN.value
    );

    // Save current API response result on index 0 and push back previous result to index 1
    financeMathResultsSparen.value.unshift(sparplanData);
    // Remove response before previous response
    if (financeMathResultsSparen.value.length > 2) financeMathResultsSparen.value.pop();

    revertedSavingResult.value = revertOutput(
      financeMathResultsSparen.value[0].value
    );

    // fetch capital series for entnahmeplan
    const { data: entnahmeSeriesData } =
      await useFinanceMathFetch<financeMathResult>(
        "capital",
        financeMathInputsEntnahme.value[0],
        API_TOKEN.value
      );
    entnahmeSeriesData.value = revertOutput(entnahmeSeriesData.value);

    // fetch capital series for sparplan
    const result = toRaw(financeMathResultsSparen.value[0].value);
    const { endValue, ...capitalSeriesInput }: financeMathInput =
      financeMathInputsSparen.value[0];

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
        API_TOKEN.value
      );
    sparenSeriesData.value = revertOutput(sparenSeriesData.value);

    // Save previous graph data
    previousGraphData.value.capitalResult = graphData.value.capitalResult;
    previousGraphData.value.capitalSeries = graphData.value.capitalSeries;

    // Merge the 2 capitalSeries form Spar- and Entnahmeplan for graph
    graphData.value.capitalSeries = sparenSeriesData.value.capitalSeries.concat(
      entnahmeSeriesData.value.capitalSeries
    );
    graphData.value.capitalResult = entnahmeSeriesData.value.capitalResult;
    // Assign needed variables for the capitalResult value for graph
    graphData.value.capitalResult.startInvestment =
      sparenSeriesData.value.capitalResult.startInvestment;

  } else if (endpointType[0] === "entnahme") {
    // assign endpoint each plan
    financeMathInputsSparen.value[0].endpoint = "capital";
    financeMathInputsEntnahme.value[0].endpoint = endpointType[1];

    // Check if both API calls are directed to the same endpoint
    if (
      financeMathInputsEntnahme.value[0].endpoint === financeMathInputsEntnahme.value[1].endpoint
    ) {
      callsTwoSameEndpoints.value = true;
    } else callsTwoSameEndpoints.value = false;

    // fetch end capital of sparplan for startInvestment of entnahmeplan
    const { data: sparEndCapitalData } =
      await useFinanceMathFetch<financeMathResult>(
        financeMathInputsSparen.value[0].endpoint,
        financeMathInputsSparen.value[0],
        API_TOKEN.value
      );
    financeMathResultsSparen.value[0] = sparEndCapitalData;
    revertedSavingResult.value = revertOutput(sparEndCapitalData.value);

    // set sparplan end capital as entnahmeplan start capital
    if (financeMathInputsEntnahme.value[0].endpoint === "end-date") {
      financeMathInputsEntnahme.value[0].oneTimeInvestment[0] = -Math.round(
        financeMathResultsSparen.value[0].value.capitalResult.capitalAmount
      );
      if (financeMathInputsEntnahme.value[0].endValue <= 0) {
        financeMathInputsEntnahme.value[0].endValue = 1;
      }
    } else {
      financeMathInputsEntnahme.value[0].oneTimeInvestment[0] = Math.round(
        financeMathResultsSparen.value[0].value.capitalResult.capitalAmount
      );
    }
    // fetch data for entnahmeplan to selected endpoint
    const { data: entnahmeData } = await useFinanceMathFetch<financeMathResult>(
      financeMathInputsEntnahme.value[0].endpoint,
      financeMathInputsEntnahme.value[0],
      API_TOKEN.value
    );
    financeMathResultsEntnahme.value[0] = entnahmeData;
    revertedWithdrawResult.value = revertOutput(entnahmeData.value);
    revertedWithdrawResult.value.savingRate =
      -revertedWithdrawResult.value.savingRate;

    // Save previous graph data
    previousGraphData.value.capitalResult = graphData.value.capitalResult;
    previousGraphData.value.capitalSeries = graphData.value.capitalSeries;

    // if the endpoint is not capital
    if (financeMathInputsEntnahme.value[0].endpoint !== "capital") {
      const result = toRaw(financeMathResultsEntnahme.value[0].value);
      const { endValue, ...capitalSeriesInput }: financeMathInput =
        financeMathInputsEntnahme.value[0];

      // assign the value from the result from previous API call in capitalSeriesInput
      switch (financeMathInputsEntnahme.value[0].endpoint) {
        case "end-date":
          capitalSeriesInput.savingRate = -capitalSeriesInput.savingRate;
          capitalSeriesInput.oneTimeInvestment =
            capitalSeriesInput.oneTimeInvestment.map(
              (investment) => -investment
            );
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
          API_TOKEN.value
        );
      entnahmeSeriesData.value = revertOutput(entnahmeSeriesData.value);

      // Merge the 2 capitalSeries form Spar- and Entnahmeplan for graph
      graphData.value.capitalSeries =
        revertedSavingResult.value.capitalSeries.concat(
          entnahmeSeriesData.value.capitalSeries
        );

      // Assign needed variables for the capitalResult value for graph
      graphData.value.capitalResult = entnahmeSeriesData.value.capitalResult;
      graphData.value.capitalResult.startInvestment =
        revertedSavingResult.value.capitalResult.startInvestment;
    } else {
      // if the endpoint is /capital
      // Merge the 2 capitalSeries form Spar- and Entnahmeplan for graph
      graphData.value.capitalSeries =
        revertedSavingResult.value.capitalSeries.concat(
          revertedWithdrawResult.value.capitalSeries
        );

      // Assign needed variables for the capitalResult value for graph
      graphData.value.capitalResult =
        revertedWithdrawResult.value.capitalResult;
      graphData.value.capitalResult.startInvestment =
        revertedSavingResult.value.capitalResult.startInvestment;
    }
  }

  // Remove searched property from input/request for API visualization
  financeMathInputsSparen.value[0] = removeSearchedEndpointFromInput(financeMathInputsSparen.value[0]);

  const max = Math.max(...graphData.value.capitalSeries);
  if(Math.max(max,graphData.value.capitalResult.startInvestment)>graphMaxYAxis.value){
    graphMaxYAxis.value = Math.max(max,graphData.value.capitalResult.startInvestment);
  }
}
watch(formTab =>{
  console.log(formTab)
})
onBeforeMount(async () => {
  API_TOKEN.value = await getAPIToken();
});
</script>

<template>
  <header class="bg-white">
    <v-row class="custom-row">
      <v-col cols="auto" class="flex align-center">
        <img
          class="pa-5 pe-0"
          src="https://assets-global.website-files.com/60d5bca841056859df8738f0/60dec34edc0691ce3efed5f1_Logo.svg"
          alt="logo"
        />
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
  <v-container fluid class="font-display">
    <v-row class="h-lg-100 justify-center">
      <v-col :cols="12" :sm="12" :md="6" :lg="4" class="px-1 h-100">
        <div class="h-100">
          <v-card class="h-100 rounded-xl elevation-6 pb-5">
            <div>
              <v-card-text>
                <div>
                  <form-tabs @tabUpdate="(n: string) => (formTab = n)" />
                </div>
                <v-window v-model="formTab">
                  <v-window-item value="saving" transition="false" reverse-transition="false" >
                    <sparplan-form
                      @calculateInput="fetchFinanceMathAPI"
                      :apiResponse="revertedSavingResult"
                    />
                  </v-window-item>
                  <v-window-item value="withdraw" transition="false" reverse-transition="false"
                    ><entnahme-form
                      @calculateInput="fetchFinanceMathAPI"
                      :apiResponse="revertedWithdrawResult"
                  /></v-window-item>
                  <v-window-item value="comb" transition="false" reverse-transition="false">
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
                <grafik-tab
                  @grafikUpdate="(m: string) => (grafikTabs = m)"
                  :callsTwoSameEndpoints="callsTwoSameEndpoints"
                />
                <v-window v-model="grafikTabs">
                  <v-window-item value="aktuell">
                    <AnswerSentence :output="graphData.capitalResult" :currency="'€'" :endpoint="endpoint" :scenario="formTab" :startDate="startDate" :seperator="'.'"></AnswerSentence>
                    <graph
                      :series="graphData.capitalSeries"
                      :result="graphData.capitalResult"
                      :prevSeries="previousGraphData.capitalSeries"
                      :prevResult="previousGraphData.capitalResult"
                      :maxYaxis="graphMaxYAxis"
                    />
                  </v-window-item>
                  <v-window-item value="vergleich">
                    <h2 v-if="formTab === 'comb'" class="font-bold pt-3 pb-3 text-lg"> Sparen</h2>
                    <vergleichstabelle
                      :oldRequest="formTab === 'comb' ? financeMathInputsSparen[1] : financeMathInputs[1]"
                      :newRequest="formTab === 'comb' ? financeMathInputsSparen[0] : financeMathInputs[0]"
                      :oldResponse="formTab === 'comb' ? financeMathResultsSparen[1].value : financeMathResults[1].value"
                      :newResponse="formTab === 'comb' ? financeMathResultsSparen[0].value : financeMathResults[0].value"
                    ></vergleichstabelle>

                    <h2 v-if="formTab === 'comb'" class="font-bold pt-3 pb-3 text-lg border-solid border-gray-300 border-t-4"> Entnahme</h2>
                    <vergleichstabelle
                      v-if="formTab === 'comb'"
                      :oldRequest="financeMathInputsEntnahme[1]"
                      :newRequest="financeMathInputsEntnahme[0]"
                      :oldResponse="financeMathResultsEntnahme[1].value"
                      :newResponse="financeMathResultsEntnahme[0].value"
                    ></vergleichstabelle>
                  </v-window-item>
                  <v-window-item value="tabelle" transition="false" reverse-transition="false">
                    <series-table
                    :apiRequest="formTab==='comb'?financeMathInputsSparen[0]:financeMathInputs[0]"
                    :apiResponse="graphData"/>
                  </v-window-item>
                </v-window>
              </v-card-text>
            </div>
          </v-card>
        </div>
      </v-col>
      <v-slide-x-reverse-transition leave-absolute>
        <v-col
          :cols="12"
          :sm="12"
          :md="12"
          :lg="4"
          class="px-1 h-100"
          v-if="api"
        >
          <div class="h-100">
            <v-card class="h-100 rounded-xl elevation-6 pb-5">
              <v-card-text>
                <api-visualization
                  v-if="formTab == 'comb'"
                  :apiRequest="financeMathInputsSparen[0]"
                  :apiRequest2="financeMathInputsEntnahme[0]"
                  :apiResponse="financeMathResultsSparen[0].value"
                  :apiResponse2="financeMathResultsEntnahme[0].value"
                />
                <api-visualization
                  v-else
                  :apiRequest="financeMathInputs[0]"
                  :apiResponse="financeMathResults[0].value"
                  :apiRequest2="null"
                  :apiResponse2="null"
                />
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-slide-x-reverse-transition>
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

.custom-row {
  height: 120px;
}

.font-display {
  font-family: 'Poppins', 'sans-serif';
}
</style>

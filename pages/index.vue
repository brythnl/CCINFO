<script setup lang="ts">
/* -------------------------------------------------------------------------- */
/*                                Imports                                     */
/* -------------------------------------------------------------------------- */
import type { financeMathInput, financeMathResult } from "~/types/index.d.ts";
import { useFinanceMathFetch } from "~/composables/useFinanceMathFetch";
import { getAPIToken } from "~/utils/auth";
import {
  inTenYears,
  nextMonthFirstDay,
  removeSearchedEndpointFromInput,
  revertOutput,
} from "../utils/formUtils";
import AnswerSentence from "../components/AnswerSentence.vue";
import {defineI18nConfig, defineI18nLocale} from "../.nuxt/imports";

/* -------------------------------------------------------------------------- */
/*                                Composables                                 */
/* -------------------------------------------------------------------------- */
const switchLocalePath = useSwitchLocalePath();

/* -------------------------------------------------------------------------- */
/*                                Reactive State                              */
/* -------------------------------------------------------------------------- */
const API_TOKEN = ref(""); // Authenticate access to aixigo's API
const grafikTabs = ref(""); // Toggle between displays (middle component): Grafik aktuell, Grafik vorher, Vergleich, Tabelle
const formTab = ref(""); // Toggle between forms (leftmost component) for different plans: Sparplan, Entnahmeplan, Kombiplan
const api = ref(false); // Toggle API Visualization display
const endpoint: Ref<string | string[]> = ref("") // Current selected endpoint
const startDate = ref("") // Current start date
const callsTwoSameEndpoints = ref(false); // Check if there are already two API calls to the same endpoint
const graphMaxYAxis = ref(0); // Maximal y-axis value of graph for both, to avoid inconsistency
// Visibility of previous graph in current graph

/* Query parameters of:
 * current API call => Index 0
 * previous API call => Index 1
 */
// For Sparplan and Entnahmeplan
const financeMathInputs: Ref<financeMathInput[]> = ref([{}, {}]);
// For Kombiplan
const financeMathInputsSparen: Ref<financeMathInput[]> = ref([{}, {}]);
const financeMathInputsEntnahme: Ref<financeMathInput[]> = ref([{}, {}]);

/* Response results of:
 * current API call => Index 0
 * previous API call => Index 1
 */
// For Sparplan and Entnahmeplan
const financeMathResults: Ref<financeMathResult[]> = ref([{}, {}]);
// For Kombiplan
const financeMathResultsSparen: Ref<financeMathResult[]> = ref([{}, {}]);
const financeMathResultsEntnahme: Ref<financeMathResult[]> = ref([{}, {}]);

// Processed data to pass in to graph component
const previousGraphData: Ref<financeMathResult> = ref({
  capitalSeries: [],
  capitalResult: {},
});
const graphData: Ref<financeMathResult> = ref({
  capitalSeries: [],
  capitalResult: {},
});

// Reverted API response results (from Cent to Euro)
const revertedWithdrawResult: Ref<financeMathResult> = ref({});
const revertedSavingResult: Ref<financeMathResult> = ref({});


/* -------------------------------------------------------------------------- */
/*                                Handler Functions                           */
/* -------------------------------------------------------------------------- */

/**
 * Handler for Spar- and Entnahmeplan
 * @param {financeMathInput} formInput - User data for API query parameters
*/
async function fetchFinanceMathAPI(formInput: financeMathInput) {
  endpoint.value = formInput.endpoint;
  startDate.value = formInput.begin;

  formInput = removeSearchedEndpointFromInput(formInput);
  shiftStoredData(financeMathInputs, formInput);
  checkTwoSameEndpoints(financeMathInputs);

  // Fetch result for selected endpoint
  const { data } = await useFinanceMathFetch<financeMathResult>(
    formInput.endpoint,
    formInput,
    API_TOKEN.value
  );
  shiftStoredData(financeMathResults, data)
  revertAPIResult();

  savePreviousGraphData();
  await getGraphData(financeMathResults, formInput);

  findMaxOfLastTwoGraphs();
}


/**
 * Handler for Kombiplan
 *
 * If selected endpoint part of Sparplan:
 *   1. Fetch start capital of Entnahmeplan to assign it as end capital input of Sparplan
 *   2. Fetch Sparplan results
 * If selected endpoint part of Entnahmeplan:
 *   1. Fetch end capital of Sparplan to assign it as start capital input of Entnahmeplan
 *   2. Fetch Entnahmeplan results
 * @param {financeMathInput} sparFormInput - User data for API query parameters from Sparplan part of Kombiplan
 * @param {financeMathInput} entnahmeFormInput - User data for API query parameters from Entnahmeplan part of Kombiplan
 */
async function fetchKombiPlan({ sparFormInput, entnahmeFormInput }) {
  shiftStoredData(financeMathInputsSparen, sparFormInput);
  shiftStoredData(financeMathInputsEntnahme, entnahmeFormInput)

  // Get "pure" endpoint from Endpoint property: [sparen/entnahme]/<API endpoint>
  const endpointType = sparFormInput.endpoint.split("/");
  endpoint.value = endpointType;

  if (endpointType[0] === "sparen") {
    // Assign endpoint for each plan
    financeMathInputsSparen.value[0].endpoint = endpointType[1];
    financeMathInputsEntnahme.value[0].endpoint = "saving-start-value";

    checkTwoSameEndpoints(financeMathInputsSparen)

    // Fetch start capital of Entnahmeplan for the end capital of Sparplan
    const { data: entnahmeStartCapitalData } = await useFinanceMathFetch<financeMathResult>(
      financeMathInputsEntnahme.value[0].endpoint,
      financeMathInputsEntnahme.value[0],
      API_TOKEN.value
    );
    shiftStoredData(financeMathResultsEntnahme, entnahmeStartCapitalData)
    revertAPIResult(true, entnahmeStartCapitalData)

    setEntnahmeStartAsSparEnd();

    // Fetch results for Sparplan to selected endpoint
    const { data: sparplanData } = await useFinanceMathFetch<financeMathResult>(
      financeMathInputsSparen.value[0].endpoint,
      financeMathInputsSparen.value[0],
      API_TOKEN.value
    );
    shiftStoredData(financeMathResultsSparen, sparplanData);
    revertAPIResult(false, financeMathResultsSparen.value[0]);

    // Fetch capital series for Entnahmeplan (for graph)
    const { data: entnahmeSeriesData } = await useFinanceMathFetch<financeMathResult>(
      "capital",
      financeMathInputsEntnahme.value[0],
      API_TOKEN.value
    );
    entnahmeSeriesData.value = revertOutput(entnahmeSeriesData.value);

    // Fetch capital series for Sparplan (for graph)
    const { data: sparenSeriesData } =
      await useFinanceMathFetch<financeMathResult>(
        "capital",
        getCapitalSeriesInput(
          financeMathResultsSparen,
          financeMathInputsSparen.value[0],
          endpointType[1]
        ),
        API_TOKEN.value
      );
    sparenSeriesData.value = revertOutput(sparenSeriesData.value);

    savePreviousGraphData();
    assignGraphDataKombi(sparenSeriesData, entnahmeSeriesData)

  } else if (endpointType[0] === "entnahme") {
    // Assign endpoint for each plan
    financeMathInputsSparen.value[0].endpoint = "capital";
    financeMathInputsEntnahme.value[0].endpoint = endpointType[1];

    checkTwoSameEndpoints(financeMathInputsEntnahme);

    // Fetch end capital of Sparplan for start capital of Entnahmeplan
    const { data: sparEndCapitalData } = await useFinanceMathFetch<financeMathResult>(
      financeMathInputsSparen.value[0].endpoint,
      financeMathInputsSparen.value[0],
      API_TOKEN.value
    );
    financeMathResultsSparen.value[0] = sparEndCapitalData;
    revertAPIResult(false, sparEndCapitalData);

    setSparEndAsEntnahmeStart();

    // Fetch results for Entnahmeplan to selected endpoint
    const { data: entnahmeData } = await useFinanceMathFetch<financeMathResult>(
      financeMathInputsEntnahme.value[0].endpoint,
      financeMathInputsEntnahme.value[0],
      API_TOKEN.value
    );
    shiftStoredData(financeMathResultsEntnahme, entnahmeData);
    revertAPIResult(true, entnahmeData);

    savePreviousGraphData();
    await getGraphData(financeMathResultsEntnahme, financeMathInputsEntnahme.value[0]);
  }

  // Remove searched property from input/request for API visualization
  financeMathInputsSparen.value[0] = removeSearchedEndpointFromInput(financeMathInputsSparen.value[0]);

  findMaxOfLastTwoGraphs();
}


/* -------------------------------------------------------------------------- */
/*                                Helper Functions                           */
/* -------------------------------------------------------------------------- */

/** Save current input/result and remove input/result before previous input/result
* @param {Ref<financeMathInput[] | financeMathResult[]>} dataQueue - Queue to store last two inputs/results
* @param {Ref<financeMathInput | financeMathResult>} data - New/current input/result
*/
function shiftStoredData(dataQueue: Ref<financeMathInput[] | financeMathResult[]>, data: Ref<financeMathInput | financeMathResult>) {
  // Save current data on index 0 and push back previous data to index 1
  dataQueue.value.unshift(data);
  // Remove data before previous data (only save last two)
  if (dataQueue.value.length > 2) dataQueue.value.pop();
}

/** Revert result from Cent to Euro and assign to respective states
* @param {boolean} kombiWithdraw - false: for Entnahme part of Kombiplan, true: for Sparplan part of Kombiplan
* @param {Ref<financeMathResult>} kombiAPIResult - Result to revert
*/
function revertAPIResult(kombiWithdraw?: boolean, kombiAPIResult?: Ref<financeMathResult>) {
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
  } else if (formTab.value === "comb") {
    if (kombiWithdraw) {
      revertedWithdrawResult.value = revertOutput(kombiAPIResult.value);
      revertedWithdrawResult.value.savingRate =
        -revertedWithdrawResult.value.savingRate;
    } else {
      revertedSavingResult.value = revertOutput(kombiAPIResult.value);
    }
  }
}

/** Check if both API calls are directed to the same endpoint
* @param {Ref<financeMathInput[]>} inputsQueue - Queue with last two inputs
*/
function checkTwoSameEndpoints(inputsQueue: Ref<financeMathInput[]>) {
  if (
    inputsQueue.value[0].endpoint === inputsQueue.value[1].endpoint
  ) {
    callsTwoSameEndpoints.value = true;
  } else callsTwoSameEndpoints.value = false;
}

/** Set start capital of Entnahmeplan as end capital of Sparplan
*/
function setEntnahmeStartAsSparEnd() {
  financeMathInputsSparen.value[0].endValue = Math.round(
    financeMathResultsEntnahme.value[0].value.startInvestment
  );
  financeMathInputsEntnahme.value[0].oneTimeInvestment[0] = Math.round(
    financeMathResultsEntnahme.value[0].value.startInvestment
  );
}

/** Set end capital of Sparplan as start capital of Entnahmeplan
*/
function setSparEndAsEntnahmeStart() {
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
}

/* ---------------------------- Graph-related ----------------------------------- */

/** Fetch capital series from a call to /endpoint
* @param {Ref<financeMathResult[]>} apiResult - result of call to current selected endpoint
* @param {financeMathInput} input - input for current selected endpoint
* @param {string} endpoint - current selected endpoint
*/
function getCapitalSeriesInput(apiResult: Ref<financeMathResult[]>, input: financeMathInput, endpoint: string): financeMathInput {
  const result = toRaw(apiResult.value[0].value);
  const { endValue, ...capitalSeriesInput }: financeMathInput = input;

  // Input preprocessing, so that it can be passed to /capital API call as query parameters
  switch (endpoint) {
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

  return capitalSeriesInput;
}

/** Store graph data from previous calculation
*/
function savePreviousGraphData() {
  previousGraphData.value.capitalResult = graphData.value.capitalResult;
  previousGraphData.value.capitalSeries = graphData.value.capitalSeries;
}

/** Process of getting graph data
* @param {Ref<financeMathResult[]>} apiResult - result of call to current selected endpoint
* @param {financeMathInput} input - input for current selected endpoint
*/
async function getGraphData(apiResult: Ref<financeMathResult[]>, input: financeMathInput) {
  // When selected endpoint is not capital (thus doesn't return capital series)
  if (input.endpoint !== "capital") {
    // Fetch capital series (for graph)
    const { data } = await useFinanceMathFetch<financeMathResult>(
      "capital",
      getCapitalSeriesInput(
        apiResult,
        input,
        input.endpoint,
      ),
      API_TOKEN.value
    );

    if (formTab.value === "comb") {
      // In Kombiplan, data is capital series of Entnahmeplan
      data.value = revertOutput(data.value);

      assignGraphDataKombi(revertedSavingResult, data);

    } else {
      assignGraphData(false, data);
    }

  } else { // when selected endpoint is /capital
    if (formTab.value === "comb") assignGraphDataKombi(revertedSavingResult, revertedWithdrawResult);
    else assignGraphData(true);
  }
}

/** Assign graph data to respective states
* @param {boolean} isCapitalEndpoint - false: current endpoint is NOT /capital, true: current endpoint is /capital
* @param {Ref<financeMathResult>} capitalSeriesResult - result of fetched capital series
*/
function assignGraphData(isCapitalEndpoint: boolean, capitalSeriesResult?: Ref<financeMathResult>) {
  // Assign result from initial endpoint call as graph data
  graphData.value.capitalResult = revertOutput(
    financeMathResults.value[0].value
  );

  if (isCapitalEndpoint) {
    // Set ONLY the capital result property into graph data's capital result
    graphData.value.capitalResult = graphData.value.capitalResult.capitalResult
    // Assign series from initial endpoint call as graph data
    graphData.value.capitalSeries = revertOutput(
      financeMathResults.value[0].value
    ).capitalSeries;
  } else { // when selected endpoint is not /capital
    if (formTab.value === "withdraw" && endpoint === "end-date") {
      graphData.value.capitalResult.startInvestment =
        -graphData.value.capitalResult.startInvestment;
    }

    // Assign result from second call to /capital to get capital series as graph data
    graphData.value.capitalSeries = revertOutput(capitalSeriesResult.value).capitalSeries;
  }
}

/** Assign graph data to respective states for Kombiplan
* @param {Ref<financeMathResult>} sparenData - result of API call
* @param {Ref<financeMathResult>} entnahmeData - result of API call
*/
function assignGraphDataKombi(sparenData: Ref<financeMathResult>, entnahmeData: Ref<financeMathResult>) {
  // Combine capital series for graph
  graphData.value.capitalSeries = sparenData.value.capitalSeries
    .concat(
      entnahmeData.value.capitalSeries
    );

  // Assign needed variables for the capital result of graph
  graphData.value.capitalResult = entnahmeData.value.capitalResult;
  graphData.value.capitalResult.startInvestment =
    sparenData.value.capitalResult.startInvestment;
}

/** Find the maximum between last two graphs
*/
function findMaxOfLastTwoGraphs() {
  const max = Math.max(...graphData.value.capitalSeries);

  if (Math.max(max, graphData.value.capitalResult.startInvestment) > graphMaxYAxis.value) {
    graphMaxYAxis.value = Math.max(max, graphData.value.capitalResult.startInvestment);
  }
}

/* -------------------------------------------------------------------------- */
/*                                Lifecycle Hooks                             */
/* -------------------------------------------------------------------------- */
onBeforeMount(async () => {
  API_TOKEN.value = await getAPIToken();
});

/* -------------------------------------------------------------------------- */
/*                                     I18n                                   */
/* -------------------------------------------------------------------------- */
const { locale, setLocale } = useI18n();

const languages = ref([
  { name: "Deutsch - DE", path: "de-DE" },
  { name: "English - GB", path: "en-GB" }
]);

// Finds the language object based on the current value of locale.value
const findLanguageByPath = (path) => {
  return languages.value.find(lang => lang.path === path);
};

const selectedLanguage = ref(findLanguageByPath(locale.value));

// Watcher to update the i18n locale when the selected language changes
watch(selectedLanguage, (newValue, oldValue) => {
  if (newValue.path !== oldValue?.path) {
    setLocale(newValue.path);
  }
});

// Generates a list of objects for v-select
const languageItems = computed(() => languages.value);

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
      <v-col cols="2" class="flex align-center">
        <v-select
            :label="$t('label_language')"
            density="compact"
            variant="outlined"
            hide-details
            v-model="selectedLanguage"
            :items="languageItems"
            item-title="name"
            item-value="path"
            return-object
        >
        </v-select>
      </v-col>

      <v-col cols="auto" class="flex align-center me-2 me-md-10">
        <v-switch
          v-model="api"
          hide-details
          inset
          color="primary"
          label="API"
        ></v-switch>
      </v-col>
    </v-row>
  </header>
  <v-container fluid class="font-display">
    <v-row class="justify-center">
      <v-col :cols="12" :sm="12" :md="6" :lg="4" class="px-1">
          <v-card class="h-100 rounded-xl elevation-6 pb-5">
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
          </v-card>
      </v-col>
      <v-col :cols="12" :sm="12" :md="6" :lg="api ? 4 : 6" class="px-1">
          <v-card class="h-100 rounded-xl elevation-6 pb-5">
            <div>
              <v-card-text>
                <grafik-tab
                  @grafikUpdate="(m: string) => (grafikTabs = m)"
                  :callsTwoSameEndpoints="callsTwoSameEndpoints"
                />
                <v-window v-model="grafikTabs">
                  <v-window-item value="aktuell">
                    <AnswerSentence :output="graphData.capitalResult" :currency="$t('currency')" :endpoint="endpoint" :scenario="formTab" :startDate="startDate" :seperator="$t('seperator')"></AnswerSentence>
                    <graph
                      :series="graphData.capitalSeries"
                      :result="graphData.capitalResult"
                      :prevSeries="previousGraphData.capitalSeries"
                      :prevResult="previousGraphData.capitalResult"
                      :maxYaxis="graphMaxYAxis"
                    />
                  </v-window-item>
                  <v-window-item value="vergleich">
                    <vergleichstabelle v-if="formTab === 'comb'"
                      :oldRequest="financeMathInputsSparen[1]"
                      :newRequest="financeMathInputsSparen[0]"
                      :oldRequestEntnahme="financeMathInputsEntnahme[1]"
                      :newRequestEntnahme="financeMathInputsEntnahme[0]"
                     :oldResponse="endpoint[0] === 'sparen' ? financeMathResultsSparen[1].value : financeMathResultsEntnahme[1].value"
                      :newResponse="endpoint[0] === 'sparen' ? financeMathResultsSparen[0].value : financeMathResultsEntnahme[0].value"
                      :endpoint="endpoint[1]"
                      :isKombiplan="true"
                    ></vergleichstabelle>
                    <vergleichstabelle v-else
                      :oldRequest="financeMathInputs[1]"
                      :newRequest="financeMathInputs[0]"
                      :oldResponse="financeMathResults[1].value"
                      :newResponse="financeMathResults[0].value"
                      :endpoint="endpoint"
                      :isKombiplan="false"
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
      </v-col>
      <!--hide on leave to solve transition issue -->
      <v-slide-x-reverse-transition leave-absolute hide-on-leave="">
        <v-col
          :cols="12"
          :sm="12"
          :md="12"
          :lg="4"
          class="px-1"
          v-if="api"
        >
            <v-card class="h-100 rounded-xl elevation-6 pb-5">
              <v-card-text>
                <api-visualization
                  v-if="formTab == 'comb'"
                  :apiRequest="financeMathInputsSparen[0]"
                  :apiRequest2="financeMathInputsEntnahme[0]"
                  :apiResponse="financeMathResultsSparen[0].value"
                  :apiResponse2="financeMathResultsEntnahme[0].value"
                  :endPoint="endpoint[1]"
                />
                <api-visualization
                  v-else
                  :apiRequest="financeMathInputs[0]"
                  :apiResponse="financeMathResults[0].value"
                  :apiRequest2="null"
                  :apiResponse2="null"
                  :endPoint="endpoint"
                />
              </v-card-text>
            </v-card>
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
  height: 90px;
}

.font-display {
  font-family: 'Poppins', 'sans-serif';
}
</style>

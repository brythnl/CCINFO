<script lang="ts" setup>
import { watch } from "vue";
import {
  todayDate,
  nextMonthFirstDay,
  inTenYears,
  validateInput,
  setEndDateToBiggestDate,
} from "~/utils/formUtils";

const emit = defineEmits<{
  (e: "calculateInput", sparplanInput: {}): void;
}>();

// Amount of oneTimeInvestment(s)
const einmalZahlung = ref(0);
// Dynamic status
const dynamik = ref(false);
const startkapitalDetails = ref(false);
const sparplanDetails = ref(false);
const iconStartkapital = ref("mdi-chevron-down");
const iconSparplan = ref("mdi-chevron-down");

//prop to show the result of selected field
const props = defineProps<{
  apiResponse: financeMathResult;
}>();

// form data (user input)
const sparplanInput = reactive({
  begin: nextMonthFirstDay,
  end: inTenYears,
  interestCalculation: "YEARLY",
  interestRate: 0,
  reductionFactor: 0,
  dynamicSavingRateFactor: 0,
  savingPlanBegin: "",
  savingPlanEnd: "",
  oneTimeInvestment: [0],
  oneTimeInvestmentDate: [nextMonthFirstDay],
  savingRate: 0,
  endValue: 0,
  endpoint: "",
});

function toggleStartkapital() {
  if (startkapitalDetails.value === false) {
    startkapitalDetails.value = true;
    iconStartkapital.value = "mdi-chevron-up";
  } else {
    startkapitalDetails.value = false;
    iconStartkapital.value = "mdi-chevron-down";
  }
}

function toggleSparplan() {
  if (sparplanDetails.value === false) {
    sparplanDetails.value = true;
    iconSparplan.value = "mdi-chevron-up";
  } else {
    sparplanDetails.value = false;
    iconSparplan.value = "mdi-chevron-down";
  }
}

// change endpoint
function changeEndpoint() {
  if (sparplanInput.endpoint === "saving-start-value") {
    if (startkapitalDetails.value === true) {
      toggleStartkapital();
    }
  }
}


// get form data (user input)
function emitData() {
  const toSend = JSON.parse(JSON.stringify(sparplanInput));
  validateInput(toSend);
  emit("calculateInput", toSend);
}

watch(
  () => sparplanInput.oneTimeInvestmentDate,
  () => {
    setEndDateToBiggestDate(sparplanInput);
  },
  { deep: true },
);

watch(
  () => sparplanInput.savingPlanEnd,
  () => {
    setEndDateToBiggestDate(sparplanInput);
    if (
      new Date(sparplanInput.savingPlanEnd) <
      new Date(sparplanInput.savingPlanStart)
    )
      sparplanInput.savingPlanEnd = sparplanInput.savingPlanStart;
  },
);
watch(
  () => props.apiResponse,
  () => {
    switch (sparplanInput.endpoint) {
      case "saving-start-value":
        sparplanInput.oneTimeInvestment[0] = props.apiResponse.startInvestment;
        break;
      case "saving-rate":
        sparplanInput.savingRate = props.apiResponse.savingRate;
        break;
      case "interest-rate":
        sparplanInput.InterestRate =  props.apiResponse.InterestRate;
        break;
      case "end-date":
        sparplanInput.end = props.apiResponse.end;
        break;
      case "capital":
        sparplanInput.endValue = props.apiResponse.capitalResult.capitalAmount;
        break;
    }
  },
);

console.log(sparplanInput)
</script>

<template>
  <h3 class="font-bold pb-5 mt-5">Was möchten Sie berechnen?</h3>
  <v-form>
    <div>
      <v-card class="overflow-y-auto" elevation="0" max-height="580">
        <v-radio-group
          v-model="sparplanInput.endpoint"
          @update:model-value="changeEndpoint"
        >
          <v-container class="px-0 py-0">
            <!-- Startkapital Radio Button -->
            <v-row class="mt-0 ps-5">
              <v-col cols="12" class="flex px-0 py-0">
                <v-radio
                  label="Startkapital"
                  value="saving-start-value"
                  density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!-- Startkapital Form -->
            
            <v-row class="px-5">
              <v-col cols="1" class="px-0">
                <v-icon v-if="sparplanInput.endpoint!='saving-start-value'" size="large" @click="toggleStartkapital">{{ iconStartkapital }}</v-icon>
              </v-col>
              <v-col
                :cols="einmalZahlung == 0 ? 11 : 10"
                :sm="startkapitalDetails ? (einmalZahlung == 0 ? 6 : 5) : 11"
                class="flex ps-2 px-0"
              >
                <!--Startkapital response slot-->
                <v-text-field
                    v-if="sparplanInput.endpoint=='saving-start-value'"
                    label="1. Einmalzahlung"
                    variant="outlined"
                    density="compact"
                    prefix="€"
                    v-model="sparplanInput.oneTimeInvestment[0]"
                    :value="props.apiResponse ? props.apiResponse.startInvestment : ''"
                    hide-details
                    type="number"
                    readonly
                ></v-text-field>
                <v-text-field
                    v-else
                    label="1. Einmalzahlung"
                    variant="outlined"
                    density="compact"
                    prefix="€"
                    v-model="sparplanInput.oneTimeInvestment[0]"
                    required
                    hide-details
                    type="number"
                    step="1000"
                    :disabled="sparplanInput.endpoint==''"
                ></v-text-field>
                <v-btn
                  icon
                  elevation="0"
                  variant="plain"
                  height="auto"
                  width="auto"
                  class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    This parameter defines any number of one-time cash in- and
                    outflows. Positive investment amounts are interpreted as
                    cash inflows and negative investment amounts as cash
                    outflows. Default date for first cash inflow (start capital)
                    is today.
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col
                v-if="startkapitalDetails"
                offset="1"
                offset-sm="0"
                :cols="einmalZahlung == 0 ? 11 : 10"
                sm="5"
                class="flex ps-2 px-0"
              >
                <v-text-field
                  label="Startdatum"
                  variant="outlined"
                  density="compact"
                  v-model="sparplanInput.oneTimeInvestmentDate[0]"
                  hide-details
                  type="date"
                  :disabled="
                    sparplanInput.endpoint == '' ||
                    sparplanInput.endpoint == 'saving-start-value'
                  "
                ></v-text-field>
                <v-btn
                  icon
                  elevation="0"
                  variant="plain"
                  height="auto"
                  width="auto"
                  class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    This parameter defines any number of one-time cash in- and
                    outflows. Positive investment amounts are interpreted as
                    cash inflows and negative investment amounts as cash
                    outflows. Default date for first cash inflow (start capital)
                    is today.
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1" class="px-0 py-0"> </v-col>
            </v-row>

            <!-- Startkapital Detail-Ansicht -->
            <v-row
              v-if="startkapitalDetails"
              v-for="n in einmalZahlung"
              class="px-5"
            >
              <v-col offset="1" cols="10" sm="5" class="flex ps-2 px-0">
                <v-text-field
                  prefix="€"
                  :label="`${n + 1}. Einmalzahlung`"
                  variant="outlined"
                  density="compact"
                  v-model="sparplanInput.oneTimeInvestment[n]"
                  hide-details
                  placeholder="weitere Einmalzahlung"
                  type="number"
                  step="1000"
                  :disabled="sparplanInput.endpoint == '' ||
                  sparplanInput.endpoint == 'saving-start-value'"
                ></v-text-field>
                <v-btn
                  icon
                  elevation="0"
                  variant="plain"
                  height="auto"
                  width="auto"
                  class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    This parameter defines any number of one-time cash in- and
                    outflows. Positive investment amounts are interpreted as
                    cash inflows and negative investment amounts as cash
                    outflows. Default date for first cash inflow (start capital)
                    is today.
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col
                offset="1"
                offset-sm="0"
                cols="10"
                sm="5"
                class="flex ps-2 px-0"
              >
                <v-text-field
                  :label="`${n + 1}. Datum`"
                  variant="outlined"
                  density="compact"
                  v-model="sparplanInput.oneTimeInvestmentDate[n]"
                  hide-details
                  type="date"
                  :disabled="
                    sparplanInput.endpoint == '' ||
                    sparplanInput.endpoint == 'saving-start-value'
                  "
                ></v-text-field>
                <v-btn
                  icon
                  elevation="0"
                  variant="plain"
                  height="auto"
                  width="auto"
                  class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    This parameter defines any number of one-time cash in- and
                    outflows. Positive investment amounts are interpreted as
                    cash inflows and negative investment amounts as cash
                    outflows. Default date for first cash inflow (start capital)
                    is today.
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col
                cols="1"
                class="ps-2 px-0 d-flex align-center justify-start"
              >
                <v-icon
                  @click="
                    () => {
                      einmalZahlung > 0 ? einmalZahlung-- : (einmalZahlung = 0);
                      sparplanInput.oneTimeInvestment.pop();
                      sparplanInput.oneTimeInvestmentDate.pop();
                    }
                  "
                  :disabled="
                    sparplanInput.endpoint == '' ||
                    sparplanInput.endpoint == 'saving-start-value' ||
                    einmalZahlung <= 0
                  "
                >
                  mdi-trash-can-outline
                </v-icon>
              </v-col>
            </v-row>

            <!-- Button Neue Einmalzahlung -->
            <v-row v-if="startkapitalDetails" class="px-5">
              <v-col offset="1" cols="auto" class="ps-2 py-0">
                <v-btn
                  @click="() => einmalZahlung++"
                  :disabled="
                    sparplanInput.endpoint == '' ||
                    sparplanInput.endpoint == 'saving-start-value'
                  "
                  rounded="lg"
                  variant="tonal"
                  color="#4195AC"
                  text="Neue Einmalzahlung"
                  prepend-icon="mdi-plus-circle-outline"
                  class="text-none"
                >
                </v-btn>
              </v-col>
            </v-row>

            <!-- Sparrate Radio Button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-radio
                  label="Sparrate"
                  value="saving-rate"
                  density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!-- Sparrate Form -->

            <v-row class="px-5">
              <v-col cols="1" class="px-0">
                <v-icon v-if="sparplanInput.endpoint!='saving-rate'" size="large" @click="toggleSparplan">{{ iconSparplan }}</v-icon>
              </v-col>
              <v-col cols="11" class="flex ps-2 px-0">
                <v-text-field
                    v-if="sparplanInput.endpoint=='saving-rate'"
                    variant="outlined"
                    prefix="€"
                    density="compact"
                    v-model="sparplanInput.savingRate"
                    :value="props.apiResponse ? props.apiResponse.savingRate : ''"
                    readonly
                    required
                    hide-details
                    type="number"
                ></v-text-field>
                <v-text-field
                    v-else
                    variant="outlined"
                    prefix="€"
                    density="compact"
                    v-model="sparplanInput.savingRate"
                    required
                    hide-details
                    placeholder="Sparrate"
                    type="number"
                    step="50"
                    :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='saving-rate'"
                ></v-text-field>
                <v-btn
                  icon
                  elevation="0"
                  variant="plain"
                  height="auto"
                  width="auto"
                  class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    This parameter specifies the monthly savings rate.
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1" class="px-0 py-0"> </v-col>
            </v-row>

            <!-- Sparrate Detail-Ansicht -->
            <v-row class="px-5" v-if="sparplanDetails">
              <v-col offset="1" cols="11" sm="5" class="flex ps-2 px-0">
                <v-text-field
                  label="Startdatum"
                  variant="outlined"
                  density="compact"
                  v-model="sparplanInput.savingPlanBegin"
                  hide-details
                  type="date"
                  :disabled="
                    sparplanInput.endpoint == '' ||
                    sparplanInput.endpoint == 'saving-rate'
                  "
                ></v-text-field>
                <v-btn
                  icon
                  elevation="0"
                  variant="plain"
                  height="auto"
                  width="auto"
                  class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    This parameter defines the begin of the optional savings
                    plan. If no date is specified, the savings rate is applied
                    for the total investment period.
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-spacer></v-spacer>
              <v-col
                offset="1"
                offset-sm="0"
                cols="11"
                sm="5"
                class="flex ps-2 px-0"
              >
                <v-text-field
                  label="Enddatum"
                  variant="outlined"
                  density="compact"
                  v-model="sparplanInput.savingPlanEnd"
                  hide-details
                  type="date"
                  min="sparplan"
                  :disabled="
                    sparplanInput.endpoint == '' ||
                    sparplanInput.endpoint == 'saving-rate'
                  "
                ></v-text-field>
                <v-btn
                  icon
                  elevation="0"
                  variant="plain"
                  height="auto"
                  width="auto"
                  class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    This parameter defines the end of the optional savings plan.
                    If no date is specified, the savings rate is applied for the
                    total investment period.
                  </v-tooltip>
                </v-btn>
              </v-col>
            </v-row>

            <v-row class="px-5" v-if="sparplanDetails">
              <v-col offset="1" cols="auto" class="flex ps-2 px-0 align-center">
                <v-radio-group v-model="dynamik" hide-details>
                  <v-checkbox
                    label="Dynamik"
                    density="compact"
                    hide-details=""
                    :disabled="
                    sparplanInput.endpoint == '' ||
                    sparplanInput.endpoint == 'saving-rate'
                  "
                  ></v-checkbox>
                </v-radio-group>
              </v-col>
              <v-col v-if="dynamik" class="flex pe-0">
                <v-text-field
                  variant="outlined"
                  prefix="%"
                  density="compact"
                  v-model="sparplanInput.dynamicSavingRateFactor"
                  hide-details
                  type="number"
                  step="0.5"
                ></v-text-field>
                <v-btn
                  icon
                  elevation="0"
                  variant="plain"
                  height="auto"
                  width="auto"
                  class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    This parameter defines the percentage by which the monthly
                    savings rate annually increases.
                  </v-tooltip>
                </v-btn>
              </v-col>
            </v-row>

            <!-- Sparzins Radio Button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-radio
                  label="Verzinsung"
                  value="interest-rate"
                  density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!--Sparzins response slot
            <v-row v-if="sparplanInput.endpoint=='interest-rate'" class="px-5">
              <v-col cols="1" class="px-0"></v-col>
              <v-col cols="11" class="flex ps-2 px-0">
                <v-card
                  v-if="sparplanInput.endpoint == 'interest-rate'"
                  width="100%"
                  height="44"
                  variant="outlined"
                  :color="props.apiResponse ? '#4195AC' : ''"
                >
                  <v-card-item class="py-0">
                    <v-card-title
                      >{{
                        props.apiResponse ? props.apiResponse.interestRate : ""
                      }}%</v-card-title
                    >
                  </v-card-item>
                </v-card>
                <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
                  <v-icon size="small">mdi-information-outline</v-icon>
                </v-btn>
              </v-col>
            </v-row>-->

            <!-- Sparzins Form -->
            <v-row class="px-5">
              <v-col class="flex ps-2 px-0" offset="1">
                <v-text-field
                    v-if="sparplanInput.endpoint=='interest-rate'"
                    prefix="%"
                    variant="outlined"
                    density="compact"
                    v-model="sparplanInput.interestRate"
                    :value="props.apiResponse ? props.apiResponse.interestRate : ''"
                    required
                    readonly
                    hide-details
                    type="number"
                ></v-text-field>
                <v-text-field
                    v-else
                    prefix="%"
                    variant="outlined"
                    density="compact"
                    v-model="sparplanInput.interestRate"
                    required
                    hide-details
                    placeholder="Sparzins"
                    type="number"
                    step="0.5"
                    :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='interest-rate'"
                ></v-text-field>
                <v-btn
                  icon
                  elevation="0"
                  variant="plain"
                  height="auto"
                  width="auto"
                  class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    This parameter determines the interest rate for calculations
                    in financial mathematics.
                  </v-tooltip>
                </v-btn>
              </v-col>
            </v-row>

            <!-- Enddatum Radio Button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-radio
                  label="Enddatum"
                  value="end-date"
                  density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!--Enddate response slot
            <v-row v-if="sparplanInput.endpoint=='end-date'" class="px-5">
              <v-col cols="1" class="px-0"></v-col>
              <v-col cols="11" class="flex ps-2 px-0">
                <v-card
                  v-if="sparplanInput.endpoint == 'end-date'"
                  width="100%"
                  height="44"
                  variant="outlined"
                  :color="props.apiResponse ? '#4195AC' : ''"
                >
                  <v-card-item class="py-0">
                    <v-card-title>{{
                      props.apiResponse ? props.apiResponse.end : ""
                    }}</v-card-title>
                  </v-card-item>
                </v-card>
                <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
                  <v-icon size="small">mdi-information-outline</v-icon>
                </v-btn>
              </v-col>
            </v-row>-->

            <!--Enddate input field-->
            <v-row class="px-5">
              <v-col class="flex ps-2 px-0" offset="1">
                <v-text-field
                    v-if="sparplanInput.endpoint=='end-date'"
                    variant="outlined"
                    density="compact"
                    :value="props.apiResponse ? props.apiResponse.end : ''"
                    v-model="sparplanInput.end"
                    readonly
                    required
                    hide-details
                    type="date"
                ></v-text-field>
                <v-text-field
                    v-else
                    variant="outlined"
                    density="compact"
                    v-model="sparplanInput.end"
                    required
                    hide-details
                    type="date"
                    :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='end-date'"
                ></v-text-field>
                <v-btn
                  icon
                  elevation="0"
                  variant="plain"
                  height="auto"
                  width="auto"
                  class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    This parameter defines the end of the investment period.
                  </v-tooltip>
                </v-btn>
              </v-col>
            </v-row>

            <!-- Endkapital Radio Button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-radio
                  label="Endkapital"
                  value="capital"
                  density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!-- Endkapital Form -->

            <!--Endkapital response slot
            <v-row v-if="sparplanInput.endpoint=='capital'" class="px-5">
              <v-col cols="1" class="px-0"></v-col>
              <v-col cols="11" class="flex ps-2 px-0">
                <v-card
                  v-if="sparplanInput.endpoint == 'capital'"
                  width="100%"
                  height="44"
                  variant="outlined"
                  :color="props.apiResponse ? '#4195AC' : ''"
                >
                  <v-card-item class="py-0">
                    <v-card-title
                      >{{
                        props.apiResponse
                          ? props.apiResponse.capitalResult
                            ? props.apiResponse.capitalResult.capitalAmount
                            : ""
                          : ""
                      }} €
                    </v-card-title>
                  </v-card-item>
                </v-card>
                <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    This parameter defines any number of one-time cash in- and outflows.
                    Positive investment amounts are interpreted as cash inflows and negative investment amounts as
                    cash
                    outflows.
                    Default date for first cash inflow (start capital) is today.
                  </v-tooltip>
                </v-btn>
              </v-col>
            </v-row>-->

            <!--Endkapital input field-->
            <v-row class="px-5">
              <v-col class="flex ps-2 px-0" offset="1" cols="11">
                <v-text-field
                    v-if="sparplanInput.endpoint==='capital'"
                    variant="outlined"
                    prefix="€"
                    density="compact"
                    v-model="sparplanInput.endValue"
                    :value="props.apiResponse ? props.apiResponse.capitalResult ? props.apiResponse.capitalResult.capitalAmount : '' : ''"
                    readonly
                    hide-details
                    type="number"
                ></v-text-field>
                <v-text-field
                    v-else
                    variant="outlined"
                    prefix="€"
                    density="compact"
                    v-model="sparplanInput.endValue"
                    hide-details
                    type="number"
                    step="1000"
                    :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='capital'"
                ></v-text-field>
                <v-btn
                  icon
                  elevation="0"
                  variant="plain"
                  height="auto"
                  width="auto"
                  class="ps-2"
                >
                  <v-icon size="small">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="end" class="w-50">
                    This parameter specifies the desired capital that should be
                    available at the end of the investment period.
                  </v-tooltip>
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-radio-group>
      </v-card>

      <!-- Berechnen Button -->
      <v-btn
        block
        class="text-none"
        color="#16486B"
        size="x-large"
        variant="flat"
        @click="emitData"
      >
        Berechnen
      </v-btn>
    </div>
  </v-form>
</template>

<!-- Zahl- und Datumsfeld gleiche Größe -->
<style scoped>
/*.v-input {
  line-height: unset;
}*/

</style>

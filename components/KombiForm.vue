<script lang="ts" setup>
import type { financeMathResult } from "~/types/index.d.ts";
import {
  todayDate,
  inTenYears,
  inTwentyYears,
  validateInput,
  setEndDateToBiggestDate,
} from "~/utils/formUtils";

const emit = defineEmits<{
  (e: "calculateInput", sparplanInput: {}): void;
}>();

const einmalZahlung = ref(0);
const dynamik = ref(false);
const startkapitalDetails = ref(false);
const sparplanDetails = ref(false);
const entnahmeplanDetails = ref(false);
const iconStartkapital = ref("mdi-chevron-down");
const iconSparplan = ref("mdi-chevron-down");
const iconEntnahmeplan = ref("mdi-chevron-down");

const props = defineProps<{
  apiResponseSparen?: financeMathResult;
  apiResponseEntnahme?: financeMathResult;
}>();

const sparInput = reactive({
  begin: todayDate,
  end: inTenYears,
  interestCalculation: "YEARLY",
  interestRate: 0,
  reductionFactor: 0,
  dynamicSavingRateFactor: 0,
  savingPlanBegin: todayDate,
  savingPlanEnd: inTenYears,
  oneTimeInvestment: [0],
  oneTimeInvestmentDate: [todayDate],
  savingRate: 0,
  endValue: 0,
  endpoint: "",
});

const entnahmeInput = reactive({
  begin: sparInput.end,
  end: inTwentyYears,
  interestCalculation: "YEARLY",
  interestRate: 0,
  reductionFactor: 0,
  dynamicSavingRateFactor: 0,
  savingPlanBegin: sparInput.end,
  savingPlanEnd: inTwentyYears,
  oneTimeInvestment: [0],
  oneTimeInvestmentDate: [sparInput.end],
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

function toggleEntnahmeplan() {
  if (entnahmeplanDetails.value === false) {
    entnahmeplanDetails.value = true;
    iconEntnahmeplan.value = "mdi-chevron-up";
  } else {
    entnahmeplanDetails.value = false;
    iconEntnahmeplan.value = "mdi-chevron-down";
  }
}

// set variable when endpoint is changed, so both variables have the same endpoint
function changeEndpoint() {
  entnahmeInput.endpoint = sparInput.endpoint;
  if (sparInput.endpoint === "sparen/saving-start-value") {
    if (startkapitalDetails.value === true) {
      toggleStartkapital();
    }
  }
}

function emitData() {
  entnahmeInput.begin = sparInput.end;
  entnahmeInput.oneTimeInvestmentDate = [sparInput.end];

  const sparen = JSON.parse(JSON.stringify(sparInput));
  const entnahme = JSON.parse(JSON.stringify(entnahmeInput));
  for (let key = 0; key < sparen.oneTimeInvestmentDate.length; key++) {
    if (new Date(sparen.oneTimeInvestmentDate[key]) > new Date(sparen.end)) {
      entnahme.oneTimeInvestment.push(sparen.oneTimeInvestment[key]);
      entnahme.oneTimeInvestmentDate.push(sparen.oneTimeInvestmentDate[key]);
      sparen.oneTimeInvestment.splice(key, 1);
      sparen.oneTimeInvestmentDate.splice(key, 1);
    }
  }

  if (sparInput.endpoint !== "entnahme/end-date") {
    entnahme.savingRate = -entnahme.savingRate;
  }

  validateInput(sparen);
  validateInput(entnahme);
  emit("calculateInput", { sparForm: sparen, entnahmeForm: entnahme });
}
watch(
  () => sparInput.savingPlanEnd,
  () => {
    setEndDateToBiggestDate(sparInput);
    if (new Date(sparInput.savingPlanEnd) < new Date(sparInput.savingPlanStart))
      sparInput.savingPlanEnd = sparInput.savingPlanStart;
  },
);
watch(
  () => entnahmeInput.savingPlanEnd,
  () => {
    setEndDateToBiggestDate(entnahmeInput);
    if (
      new Date(entnahmeInput.savingPlanEnd) <
      new Date(entnahmeInput.savingPlanStart)
    )
      entnahmeInput.savingPlanEnd = entnahmeInput.savingPlanStart;
  },
);
watch(
  () => props.apiResponseSparen,
  () => {
    switch (sparInput.endpoint) {
      case "sparen/saving-start-value":
        sparInput.oneTimeInvestment[0] = props.apiResponseSparen.startInvestment;
        break;
      case "sparen/saving-rate":
        sparInput.savingRate = props.apiResponseSparen.savingRate;
        break;
      case "sparen/interest-rate":
        sparInput.InterestRate =  props.apiResponseSparen.InterestRate;
        break;
      case "sparen/end-date":
        sparInput.end = props.apiResponseSparen.end;
        break;
      case "entnahme/saving-rate":
        entnahmeInput.savingRate = props.apiResponseEntnahme.savingRate;
        break;
      case "entnahme/interest-rate":
        entnahmeInput.InterestRate =  props.apiResponseEntnahme.InterestRate;
        break;
      case "entnahme/end-date":
        entnahmeInput.end = props.apiResponseEntnahme.end;
        break;
      case "entnahme/capital":
        entnahmeInput.endValue = props.apiResponseEntnahme.capitalResult.capitalAmount;
        break;
    }
  },
);
</script>

<template>
  <h3 class="font-bold pb-5 py-3">Was möchten Sie berechnen?</h3>
  <v-form>
    <div>
      <v-card class="overflow-y-auto" max-height="550">
        <v-radio-group
          v-model="sparInput.endpoint"
          @update:model-value="changeEndpoint"
        >
          <v-container class="px-0 py-0">
            <!-- Startkapital Radio Button -->
            <v-row class="mt-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-radio
                  label="Startkapital"
                  value="sparen/saving-start-value"
                  density="compact"
                >
                </v-radio>
              </v-col>
            </v-row>

            <!--Startkapital response slot-->
            <v-row
              v-if="sparInput.endpoint == 'sparen/saving-start-value'"
              class="px-5"
            >
              <v-col cols="1" class="px-0"></v-col>
              <v-col cols="11" class="flex ps-2 px-0">
                <v-card
                  width="100%"
                  height="44"
                  variant="outlined"
                  :color="props.apiResponseSparen ? '#4195AC' : ''"
                >
                  <v-card-item class="py-0">
                    <v-card-title
                      >{{
                        props.apiResponseSparen
                          ? props.apiResponseSparen.startInvestment
                          : ""
                      }} €</v-card-title
                    >
                  </v-card-item>
                </v-card>
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
            <!-- Startkapital Form -->
            <v-row v-else class="px-5">
              <v-col cols="1" class="px-0">
                <v-icon size="large" @click="toggleStartkapital">{{
                  iconStartkapital
                }}</v-icon>
              </v-col>
              <v-col
                :cols="einmalZahlung == 0 ? 11 : 10"
                :sm="startkapitalDetails ? (einmalZahlung == 0 ? 6 : 5) : 11"
                class="flex ps-2 px-0"
              >
                <v-text-field
                  label="1. Einmalzahlung"
                  variant="outlined"
                  density="compact"
                  suffix="€"
                  v-model="sparInput.oneTimeInvestment[0]"
                  required
                  hide-details
                  type="number"
                  step="0.01"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'sparen/saving-start-value'
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
                  v-model="sparInput.oneTimeInvestmentDate[0]"
                  hide-details
                  type="date"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'sparen/saving-start-value'
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
                    This parameter specifies the investment dates of the
                    one-time cash in- or outflow (see oneTimeInvestments
                    parameter). If the date of a cash flow is outside of the
                    investment period, it will not be included in the
                    calculation.
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
                  suffix="€"
                  :label="`${n + 1}. Einmalzahlung`"
                  variant="outlined"
                  density="compact"
                  v-model="sparInput.oneTimeInvestment[n]"
                  hide-details
                  required
                  placeholder="weitere Einmalzahlung"
                  type="number"
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
                    outflows.
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
                  v-model="sparInput.oneTimeInvestmentDate[n]"
                  hide-details
                  required
                  type="date"
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
                    This parameter specifies the investment dates of the
                    one-time cash in- or outflow (see oneTimeInvestments
                    parameter). If the date of a cash flow is outside of the
                    investment period, it will not be included in the
                    calculation.
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
                      sparInput.oneTimeInvestment.pop();
                      sparInput.oneTimeInvestmentDate.pop();
                    }
                  "
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'saving-start-value' ||
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
                  rounded="lg"
                  variant="tonal"
                  color="#4195AC"
                  text="Neue Einmalzahlung"
                  prepend-icon="mdi-plus-circle-outline"
                  class="text-none"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'sparen/saving-start-value'
                  "
                >
                </v-btn>
              </v-col>
            </v-row>

            <!-- Sparrate Radio Button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-radio
                  label="Sparrate"
                  value="sparen/saving-rate"
                  density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!-- Sparrate Form -->

            <v-row class="px-5">
              <v-col cols="1" class="px-0">
                <v-icon size="large" @click="toggleSparplan">{{
                  iconSparplan
                }}</v-icon>
              </v-col>

              <v-col cols="11" class="flex ps-2 px-0">
                <!--Sparrate response slot-->
                <v-card
                  v-if="sparInput.endpoint == 'sparen/saving-rate'"
                  width="100%"
                  height="44"
                  variant="outlined"
                  :color="props.apiResponseSparen ? '#4195AC' : ''"
                >
                  <v-card-item class="py-0">
                    <v-card-title
                      >{{
                        props.apiResponseSparen
                          ? props.apiResponseSparen.savingRate
                          : ""
                      }} €</v-card-title
                    >
                  </v-card-item>
                </v-card>

                <!--Sparrate input field-->
                <v-text-field
                  v-else
                  variant="outlined"
                  suffix="€"
                  density="compact"
                  v-model="sparInput.savingRate"
                  required
                  hide-details
                  placeholder="Sparrate"
                  type="number"
                  step="0.01"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'sparen/saving-rate'
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
                  v-model="sparInput.savingPlanBegin"
                  hide-details
                  type="date"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'sparen/saving-rate'
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
                  v-model="sparInput.savingPlanEnd"
                  hide-details
                  type="date"
                  min="sparplan"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'sparen/saving-rate'
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
            <!--Dynamik Feld -->
            <v-row class="px-5" v-if="sparplanDetails">
              <v-col offset="1" cols="auto" class="flex ps-2 px-0 align-center">
                <v-radio-group v-model="dynamik" hide-details>
                  <v-checkbox
                    label="Dynamik"
                    density="compact"
                    hide-details=""
                    :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'sparen/saving-rate'
                  "
                  ></v-checkbox>
                </v-radio-group>
              </v-col>
              <v-col v-if="dynamik" class="flex pe-0">
                <v-text-field
                  variant="outlined"
                  suffix="%"
                  density="compact"
                  v-model="sparInput.dynamicSavingRateFactor"
                  hide-details
                  type="number"
                  step="1"
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
                  label="Sparzins"
                  value="sparen/interest-rate"
                  density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!-- Sparzins Form -->

            <v-row class="px-5">
              <v-col class="flex ps-2 px-0" offset="1">
                <!--Sparzins response slot-->
                <v-card
                  v-if="sparInput.endpoint == 'sparen/interest-rate'"
                  width="100%"
                  height="44"
                  variant="outlined"
                  :color="props.apiResponseSparen ? '#4195AC' : ''"
                >
                  <v-card-item class="py-0">
                    <v-card-title
                      >{{
                        props.apiResponseSparen
                          ? props.apiResponseSparen.interestRate
                          : ""
                      }}%</v-card-title
                    >
                  </v-card-item>
                </v-card>
                <!--Sparzins input field-->
                <v-text-field
                  v-else
                  suffix="%"
                  variant="outlined"
                  density="compact"
                  v-model="sparInput.interestRate"
                  required
                  hide-details
                  placeholder="Sparzins"
                  type="number"
                  step="1"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'sparen/interest-rate'
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
                    This parameter determines the interest rate for calculations
                    in financial mathematics.
                  </v-tooltip>
                </v-btn>
              </v-col>
            </v-row>

            <!--Withdraw Form Start-->

            <!-- Switchdate/Withdrawbegin Radio Button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-radio
                  disabled
                  label="Entnahmebeginn"
                  value="sparen/end-date"
                  density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!--Withdraw begin Form -->
            <v-row class="px-5">
              <v-col class="flex ps-2 px-0" offset="1">
                <!--Withdraw begin response slot-->
                <v-card
                  v-if="sparInput.endpoint == 'sparen/end-date'"
                  width="100%"
                  height="44"
                  variant="outlined"
                  :color="props.apiResponseSparen ? '#4195AC' : ''"
                >
                  <v-card-item class="py-0">
                    <v-card-title>{{
                      props.apiResponseSparen ? props.apiResponseSparen.end : ""
                    }}</v-card-title>
                  </v-card-item>
                </v-card>
                <!--Withdraw begin input field-->
                <v-text-field
                  v-else
                  variant="outlined"
                  density="compact"
                  v-model="sparInput.end"
                  required
                  hide-details
                  type="date"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'sparen/end-date'
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
                    This parameter defines the end of the saving period and the
                    start of the withdraw period.
                  </v-tooltip>
                </v-btn>
              </v-col>
            </v-row>
            <!-- Withdraws rate Radio Button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-radio
                  label="Entnahmerate"
                  value="entnahme/saving-rate"
                  density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!-- Withdraws rate Form -->

            <v-row class="px-5">
              <v-col cols="1" class="px-0">
                <v-icon size="large" @click="toggleEntnahmeplan">{{
                  iconEntnahmeplan
                }}</v-icon>
              </v-col>

              <!--Withdraws rate input field-->
              <v-col class="flex ps-2 px-0">
                <!--Withdraws rate response slot-->
                <v-card
                  v-if="sparInput.endpoint == 'entnahme/saving-rate'"
                  width="100%"
                  height="44"
                  variant="outlined"
                  :color="props.apiResponseSparen ? '#4195AC' : ''"
                >
                  <v-card-item class="py-0">
                    <v-card-title
                      >{{
                        props.apiResponseEntnahme
                          ? props.apiResponseEntnahme.savingRate
                          : ""
                      }} €</v-card-title
                    >
                  </v-card-item>
                </v-card>

                <!--Withdraws rate response slot-->
                <v-text-field
                  v-else
                  variant="outlined"
                  suffix="€"
                  density="compact"
                  v-model="entnahmeInput.savingRate"
                  required
                  hide-details
                  placeholder="Entnahmerate"
                  type="number"
                  step="0.01"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'entnahme/saving-rate'
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
                    This parameter specifies the monthly withdraws rate.
                  </v-tooltip>
                </v-btn>
              </v-col>
            </v-row>

            <!-- Withdraws rate Detail-Ansicht -->

            <v-row class="px-5" v-if="entnahmeplanDetails">
              <v-col offset="1" cols="11" sm="5" class="flex ps-2 px-0">
                <v-text-field
                  label="Startdatum"
                  variant="outlined"
                  density="compact"
                  v-model="entnahmeInput.savingPlanBegin"
                  hide-details
                  type="date"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'entnahme/saving-rate'
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
                    This parameter defines the begin of the optional withdraws
                    plan. If no date is specified, the withdraws rate is applied
                    for the total investment period.
                  </v-tooltip>
                </v-btn>
              </v-col>
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
                  v-model="entnahmeInput.savingPlanEnd"
                  hide-details
                  type="date"
                  min="sparplan"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'entnahme/saving-rate'
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
                    This parameter defines the end of the optional withdraws
                    plan. If no date is specified, the withdraws rate is applied
                    for the total investment period.
                  </v-tooltip>
                </v-btn>
              </v-col>
            </v-row>

            <v-row class="px-5" v-if="sparplanDetails">
              <v-col offset="1" cols="auto" class="flex ps-2 px-0 align-center">
                <div class="flex">
                  <v-radio-group v-model="dynamik" hide-details>
                    <v-checkbox
                      label="Dynamik"
                      density="compact"
                      hide-details=""
                      :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'entnahme/saving-rate'
                  "
                    ></v-checkbox>
                  </v-radio-group>
                </div>
              </v-col>
              <v-col v-if="dynamik" class="flex pe-0">
                <v-text-field
                  v-if="dynamik"
                  variant="outlined"
                  suffix="%"
                  density="compact"
                  v-model="entnahmeInput.dynamicSavingRateFactor"
                  hide-details
                  type="number"
                  step="1"
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
                    withdraws rate annually increases. Using this parameter, it
                    is possible to simulate a dynamic withdraws rate, for
                    instance, to compensatethe inflation rate between 1% and 3%.
                    If no withdraws rate is specified, this field will be
                    irrelevant for the outcome of the calculation.
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1" class="px-0 py-0"> </v-col>
            </v-row>

            <!-- Withdraw interest Radio Button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-radio
                  disabled
                  label="Entnahmezins"
                  value="entnahme/interest-rate"
                  density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!-- Withdraw interest Form -->

            <v-row class="px-5">
              <v-col class="flex ps-2 px-0" offset="1">
                <!--Withdraw interest response slot-->
                <v-card
                  v-if="sparInput.endpoint == 'entnahme/interest-rate'"
                  width="100%"
                  height="44"
                  variant="outlined"
                  :color="props.apiResponseSparen ? '#4195AC' : ''"
                >
                  <v-card-item class="py-0">
                    <v-card-title
                      >{{
                        props.apiResponseEntnahme
                          ? props.apiResponseEntnahme.interestRate
                          : ""
                      }}%</v-card-title
                    >
                  </v-card-item>
                </v-card>

                <!--Withdraw interest input field-->
                <v-text-field
                  v-else
                  suffix="%"
                  variant="outlined"
                  density="compact"
                  v-model="entnahmeInput.interestRate"
                  required
                  hide-details
                  placeholder="Entnahmezins"
                  type="number"
                  step="1"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'entnahme/interest-rate'
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
                    This parameter determines the interest rate for calculations
                    in financial mathematics.
                  </v-tooltip>
                </v-btn>
              </v-col>
            </v-row>

            <!-- End date Radio Button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-radio
                  label="Enddatum"
                  value="entnahme/end-date"
                  density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!-- End date Form -->
            <v-row class="px-5">
              <v-col class="flex ps-2 px-0" offset="1">
                <!--End date response slot-->
                <v-card
                  v-if="sparInput.endpoint == 'entnahme/end-date'"
                  width="100%"
                  height="44"
                  variant="outlined"
                  :color="props.apiResponseSparen ? '#4195AC' : ''"
                >
                  <v-card-item class="py-0">
                    <v-card-title>{{
                      props.apiResponseEntnahme
                        ? props.apiResponseEntnahme.end
                        : ""
                    }}</v-card-title>
                  </v-card-item>
                </v-card>

                <!--End date response slot-->
                <v-text-field
                  v-else
                  variant="outlined"
                  density="compact"
                  v-model="entnahmeInput.end"
                  required
                  hide-details
                  type="date"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'entnahme/end-date'
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
                    This parameter defines the end of the investment period.
                  </v-tooltip>
                </v-btn>
              </v-col>
            </v-row>

            <!-- End capital Radio Button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-radio
                  label="Endkapital"
                  value="entnahme/capital"
                  density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!-- End capital Form -->

            <v-row class="px-5 pb-2">
              <v-col class="flex ps-2 px-0" offset="1">
                <!--End capital response slot-->
                <v-card
                  v-if="sparInput.endpoint == 'entnahme/capital'"
                  width="100%"
                  height="44"
                  variant="outlined"
                  :color="props.apiResponseSparen ? '#4195AC' : ''"
                >
                  <v-card-item class="py-0">
                    <v-card-title
                      >{{
                        props.apiResponseEntnahme
                          ? props.apiResponseEntnahme.capitalResult
                            ? props.apiResponseEntnahme.capitalResult
                                .capitalAmount
                            : ""
                          : ""
                      }} €</v-card-title
                    >
                  </v-card-item>
                </v-card>

                <!--End capital input field-->
                <v-text-field
                  v-else
                  variant="outlined"
                  suffix="€"
                  density="compact"
                  v-model="entnahmeInput.endValue"
                  hide-details
                  placeholder="Endkapital"
                  type="number"
                  step="0.01"
                  :disabled="
                    sparInput.endpoint == '' || sparInput.endpoint == 'capital'
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

<style scoped>
.v-input {
  line-height: unset;
}
</style>

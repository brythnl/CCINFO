<script lang="ts" setup>
import { watch } from "vue";
import {
  todayDate,
  inTenYears,
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
const iconStartkapital = ref("mdi-chevron-down");
const iconSparplan = ref("mdi-chevron-down");

const props = defineProps<{
  apiResponse: financeMathResult;
}>();

const entnahmeplaninput = reactive({
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
  if (entnahmeplaninput.endpoint === "saving-start-value") {
    if (startkapitalDetails.value === true) {
      toggleStartkapital();
    }
  }
}

// get form data (user input)
function emitData() {
  const toSend = JSON.parse(JSON.stringify(entnahmeplaninput));
  if (toSend.endpoint === "interest-rate" || toSend.endpoint === "end-date") {
    toSend.oneTimeInvestment = toSend.oneTimeInvestment.map(
      (investment) => -investment,
    );
    toSend.endValue === 0 ? (toSend.endValue = 1) : "";
  } else {
    toSend.savingRate = -toSend.savingRate;
  }
  validateInput(toSend);
  emit("calculateInput", toSend);
}

watch(
  () => entnahmeplaninput.oneTimeInvestmentDate,
  () => {
    setEndDateToBiggestDate(entnahmeplaninput);
  },
  { deep: true },
);

watch(
  () => entnahmeplaninput.savingPlanEnd,
  () => {
    setEndDateToBiggestDate(entnahmeplaninput);
    if (
      new Date(entnahmeplaninput.savingPlanEnd) <
      new Date(entnahmeplaninput.savingPlanStart)
    )
      entnahmeplaninput.savingPlanEnd = entnahmeplaninput.savingPlanStart;
  },
);
</script>

<template>
  <h3 class="font-bold pb-5 py-3">Was möchten Sie berechnen?</h3>
  <v-form>
    <div>
      <v-card class="overflow-y-auto" max-height="550">
        <v-radio-group
          v-model="entnahmeplaninput.endpoint"
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

            <!--Startkapital response slot-->
            <v-row
              v-if="entnahmeplaninput.endpoint == 'saving-start-value'"
              class="px-5"
            >
              <v-col cols="1" class="px-0"></v-col>
              <v-col cols="11" class="flex ps-2 px-0">
                <v-card
                  width="100%"
                  height="44"
                  variant="outlined"
                  :color="props.apiResponse ? '#4195AC' : ''"
                >
                  <v-card-item class="py-0">
                    <v-card-title
                      >{{
                        props.apiResponse
                          ? props.apiResponse.startInvestment
                          : ""
                      }}€</v-card-title
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
                  v-model="entnahmeplaninput.oneTimeInvestment[0]"
                  required
                  hide-details
                  type="number"
                  step="0.01"
                  :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-start-value'
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
                  v-model="entnahmeplaninput.oneTimeInvestmentDate[0]"
                  hide-details
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
                  suffix="€"
                  :label="`${n + 1}. Einmalzahlung`"
                  variant="outlined"
                  density="compact"
                  v-model="entnahmeplaninput.oneTimeInvestment[n]"
                  hide-details
                  placeholder="weitere Einmalzahlung"
                  type="number"
                  :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-start-value'
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
                  v-model="entnahmeplaninput.oneTimeInvestmentDate[n]"
                  hide-details
                  type="date"
                  :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-start-value'
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
                      entnahmeplaninput.oneTimeInvestment.pop();
                      sparplanInput.oneTimeInvestmentDate.pop();
                    }
                  "
                  :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-start-value' ||
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
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-start-value'
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

            <!-- Entnahmerate Radio Button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-radio
                  label="Entnahmerate"
                  value="saving-rate"
                  density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!-- Entnahmerate Form -->

            <v-row class="px-5">
              <v-col cols="1" class="px-0">
                <v-icon size="large" @click="toggleSparplan">{{
                  iconSparplan
                }}</v-icon>
              </v-col>
              <v-col class="flex ps-2 px-0">
                <!--Entnahmerate response slot-->
                <v-card
                  v-if="entnahmeplaninput.endpoint == 'saving-rate'"
                  width="100%"
                  height="44"
                  variant="outlined"
                  :color="props.apiResponse ? '#4195AC' : ''"
                >
                  <v-card-item class="py-0">
                    <v-card-title
                      >{{
                        props.apiResponse ? props.apiResponse.savingRate : ""
                      }}€</v-card-title
                    >
                  </v-card-item>
                </v-card>

                <!-- Entnahmerate input field -->
                <v-text-field
                  v-else
                  variant="outlined"
                  suffix="€"
                  density="compact"
                  v-model="entnahmeplaninput.savingRate"
                  required
                  hide-details
                  placeholder="Sparrate"
                  type="number"
                  step="0.01"
                  :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-rate'
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

            <!-- Sparrate Detail-Ansicht -->
            <v-row class="px-5" v-if="sparplanDetails">
              <v-col offset="1" cols="11" sm="5" class="flex ps-2 px-0">
                <v-text-field
                  label="Startdatum"
                  variant="outlined"
                  density="compact"
                  v-model="entnahmeplaninput.savingPlanBegin"
                  hide-details
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
                    This parameter defines the begin of the optional withdraws
                    plan. If no date is specified, the withdraws rate is applied
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
                  v-model="entnahmeplaninput.savingPlanEnd"
                  hide-details
                  type="date"
                  min="sparplan"
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
                <v-radio-group v-model="dynamik" hide-details>
                  <v-checkbox
                    label="Dynamik"
                    density="compact"
                    hide-details=""
                  ></v-checkbox>
                </v-radio-group>
              </v-col>
              <v-col v-if="dynamik" class="flex pe-0">
                <v-text-field
                  variant="outlined"
                  suffix="%"
                  density="compact"
                  v-model="entnahmeplaninput.dynamicSavingRateFactor"
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
                    withdraws rate annually increases.
                  </v-tooltip>
                </v-btn>
              </v-col>
            </v-row>

            <!-- Sparzins Radio Button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-radio
                  disabled
                  label="Entnahmezins"
                  value="interest-rate"
                  density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!-- Sparzins Form -->

            <v-row class="px-5">
              <v-col class="flex ps-2 px-0" offset="1">
                <!--Interestrate response slot-->
                <v-card
                  v-if="entnahmeplaninput.endpoint == 'interest-rate'"
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

                <!-- Interestrate input field -->
                <v-text-field
                  v-else
                  suffix="%"
                  variant="outlined"
                  density="compact"
                  v-model="entnahmeplaninput.interestRate"
                  required
                  hide-details
                  placeholder="Sparzins"
                  type="number"
                  step="1"
                  :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'interest-rate'
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

            <!-- Enddatum Form -->
            <v-row class="px-5">
              <v-col class="flex ps-2 px-0" offset="1">
                <!--Enddate response slot-->
                <v-card
                  v-if="entnahmeplaninput.endpoint == 'end-date'"
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
                <!-- Enddate input field -->
                <v-text-field
                  v-else
                  variant="outlined"
                  density="compact"
                  v-model="entnahmeplaninput.end"
                  required
                  hide-details
                  type="date"
                  :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'end-date'
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

            <v-row class="px-5">
              <v-col class="flex ps-2 px-0" offset="1">
                <!--Endkapital response slot-->
                <v-card
                  v-if="entnahmeplaninput.endpoint == 'capital'"
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
                      }}€</v-card-title
                    >
                  </v-card-item>
                </v-card>

                <!-- Endkapital input field -->
                <v-text-field
                  v-else
                  variant="outlined"
                  suffix="€"
                  density="compact"
                  v-model="entnahmeplaninput.endValue"
                  hide-details
                  placeholder="Endkapital"
                  type="number"
                  step="0.01"
                  :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'capital'
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

<!-- Zahl- und Datumsfeld gleiche Größe -->
<style scoped>
.v-input {
  line-height: unset;
}
</style>

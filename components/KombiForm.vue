<script lang="ts" setup>
import type { financeMathResult } from "~/types/index.d.ts";
import {
  nextMonthFirstDay,
  inTenYears,
  inTwentyYears,
  validateInput,
  setEndDateToBiggestDate,
  todayDate,
} from "~/utils/formUtils";

const emit = defineEmits<{
  (e: "calculateInput", kombiplanInput: {}): void;
  (e: "inputChange"): void;
}>();

//dialog for error inputs
const dialog = ref(false);
const dialogText = ref("");

//amount of oneTimeInvestment
const einmalZahlung = ref(0);

//dynamic status
const dynamik = ref(false);

//details status for start capital and withdraw rate
const startkapitalDetails = ref(false);
const sparplanDetails = ref(false);
const entnahmeplanDetails = ref(false);
const iconStartkapital = ref("mdi-chevron-down");
const iconSparplan = ref("mdi-chevron-down");
const iconEntnahmeplan = ref("mdi-chevron-down");

//I18n Locale
const { t } = useI18n();

const props = defineProps<{
  apiResponseSparen?: financeMathResult;
  apiResponseEntnahme?: financeMathResult;
}>();

const sparInput = reactive({
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

const entnahmeInput = reactive({
  begin: sparInput.end,
  end: inTwentyYears,
  interestCalculation: "YEARLY",
  interestRate: 0,
  reductionFactor: 0,
  dynamicSavingRateFactor: 0,
  savingPlanBegin: "",
  savingPlanEnd: "",
  oneTimeInvestment: [0],
  oneTimeInvestmentDate: [sparInput.end],
  savingRate: 0,
  endValue: 0,
  endpoint: "",
});
//function to show or hide details for start capital
function toggleStartkapital() {
  if (startkapitalDetails.value === false) {
    startkapitalDetails.value = true;
    iconStartkapital.value = "mdi-chevron-up";
  } else {
    startkapitalDetails.value = false;
    iconStartkapital.value = "mdi-chevron-down";
  }
}
//function to show or hide details for savingplan
function toggleSparplan() {
  if (sparplanDetails.value === false) {
    sparplanDetails.value = true;
    iconSparplan.value = "mdi-chevron-up";
  } else {
    sparplanDetails.value = false;
    iconSparplan.value = "mdi-chevron-down";
  }
}
//function to show or hide details for withdrawplan
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
  if (sparInput.endpoint === "saving/saving-start-value") {
    if (startkapitalDetails.value === true) {
      toggleStartkapital();
    }
  }
}

//validate input and get form data (user input)
function emitData() {
  entnahmeInput.begin = sparInput.end;
  entnahmeInput.oneTimeInvestmentDate = [sparInput.end];
  if (
    sparInput.endpoint !== "saving/saving-start-value" &&
    sparInput.oneTimeInvestmentDate.find(
      (element) => new Date(element) < new Date(todayDate),
    )
  ) {
    dialog.value = true;
    dialogText.value = t("error-message.oneTimeInvestmentDate-in-the-past");
  } else if (new Date(sparInput.savingPlanBegin) < new Date(todayDate)) {
    dialog.value = true;
    dialogText.value = t(
      "error-message.savingplan.savingPlanStart-in-the-past",
    );
  } else if (new Date(entnahmeInput.savingPlanBegin) < new Date(todayDate)) {
    dialog.value = true;
    dialogText.value = t(
      "error-message.withdrawplan.savingPlanStart-in-the-past",
    );
  } else {
    if (sparInput.endpoint !== "saving/saving-start-value") {
      for (let i = 0; i <= einmalZahlung.value; i++) {
        if (
          i > 0 &&
          (sparInput.oneTimeInvestment[i] === undefined ||
            [0, "0", ""].includes(sparInput.oneTimeInvestment[i]))
        ) {
          dialog.value = true;
          dialogText.value = t(
            "error-message.oneTimeInvestment-is-not-completed",
          );
          break;
        }
        if (
          sparInput.oneTimeInvestmentDate[i] === undefined ||
          sparInput.oneTimeInvestmentDate[i] === ""
        ) {
          dialog.value = true;
          dialogText.value = t(
            "error-message.oneTimeInvestment-is-not-completed",
          );
          break;
        }
      }
    }
    if (!dialog.value) {
      const saving = JSON.parse(JSON.stringify(sparInput));
      const withdraw = JSON.parse(JSON.stringify(entnahmeInput));
      for (let key = 0; key < saving.oneTimeInvestmentDate.length; key++) {
        if (
          new Date(saving.oneTimeInvestmentDate[key]) > new Date(saving.end)
        ) {
          withdraw.oneTimeInvestment.push(saving.oneTimeInvestment[key]);
          withdraw.oneTimeInvestmentDate.push(
            saving.oneTimeInvestmentDate[key],
          );
          saving.oneTimeInvestment.splice(key, 1);
          saving.oneTimeInvestmentDate.splice(key, 1);
        }
      }

      if (sparInput.endpoint !== "withdraw/end-date") {
        withdraw.savingRate = -withdraw.savingRate;
      }

      validateInput(saving);
      validateInput(withdraw);
      emit("calculateInput", {
        sparFormInput: saving,
        entnahmeFormInput: withdraw,
      });
    }
  }
}

// send signal that input or chip is changed
function inputChangeWarn() {
  emit("inputChange");
}

function validateEndDate() {
  if (
    new Date(sparInput.savingPlanEnd) < new Date(sparInput.savingPlanStart) ||
    sparInput.savingPlanEnd < todayDate
  ) {
    sparInput.savingPlanEnd = sparInput.savingPlanStart;
    dialog.value = true;
    dialogText.value = t(
      "error-message.savingplan.savingEnd-earlier-than-savingStart",
    );
  }
  if (
    new Date(entnahmeInput.savingPlanEnd) <
      new Date(entnahmeInput.savingPlanStart) ||
    entnahmeInput.savingPlanEnd < todayDate
  ) {
    entnahmeInput.savingPlanEnd = entnahmeInput.savingPlanStart;
    dialog.value = true;
    dialogText.value = t(
      "error-message.savingplan.savingEnd-earlier-than-savingStart",
    );
  }
}

watch(
  () => [
    sparInput.oneTimeInvestmentDate,
    sparInput.savingPlanEnd,
    entnahmeInput.savingPlanEnd,
  ],
  () => {
    setEndDateToBiggestDate(sparInput);
    entnahmeInput.begin = sparInput.end;
    entnahmeInput.oneTimeInvestmentDate = [sparInput.end];
    setEndDateToBiggestDate(entnahmeInput);
  },
  {
    deep: true,
  },
);
watch(
  () => [props.apiResponseEntnahme, props.apiResponseSparen],
  () => {
    switch (sparInput.endpoint) {
      case "saving/saving-start-value":
        sparInput.oneTimeInvestment[0] =
          props.apiResponseSparen.startInvestment;
        break;
      case "saving/saving-rate":
        sparInput.savingRate = props.apiResponseSparen.savingRate;
        break;
      case "saving/interest-rate":
        sparInput.interestRate = props.apiResponseSparen.interestRate;
        break;
      case "saving/end-date":
        sparInput.end = props.apiResponseSparen.end;
        break;
      case "withdraw/saving-rate":
        entnahmeInput.savingRate = props.apiResponseEntnahme.savingRate;
        break;
      case "withdraw/interest-rate":
        entnahmeInput.interestRate = props.apiResponseEntnahme.interestRate;
        break;
      case "withdraw/end-date":
        entnahmeInput.end = props.apiResponseEntnahme.end;
        break;
      case "withdraw/capital":
        entnahmeInput.endValue =
          props.apiResponseEntnahme.capitalResult.capitalAmount;
        break;
    }
  },
);
watch([sparInput, entnahmeInput], () => {
  inputChangeWarn();
});
</script>

<template>
  <!-- headline -->
  <h1 class="flex justify-center pt-5 pb-2 font-bold text-lg">
    {{ $t("fieldNames.title") }}
  </h1>
  <v-form>
    <div>
      <v-card class="overflow-y-auto" elevation="0" max-height="504">
        <v-chip-group
          v-model="sparInput.endpoint"
          @update:model-value="changeEndpoint"
          selected-class="bg-primary"
          class="overflow-hidden"
          mandatory
        >
          <!-- form container -->
          <v-container class="px-0 py-0">
            <v-row class="py-0">
              <v-col class="pb-5">
                <v-sheet class="rounded-lg elevation-0 bg-primary py-2">
                  <h1 class="text-white ps-5 font-bold">
                    {{ $t("fieldNames.savingPhase") }}
                  </h1>
                </v-sheet>
              </v-col>
            </v-row>

            <!-- starting value radio button -->
            <v-row class="mt-0 ps-5 pt-2">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip value="saving/saving-start-value" density="compact"
                  >{{ $t("fieldNames.startInvestment") }}
                </v-chip>
              </v-col>
            </v-row>

            <!-- starting value form -->
            <v-row class="ps-5 pe-2">
              <v-col
                cols="11"
                :sm="startkapitalDetails ? 6 : 11"
                class="flex pe-2 px-0 order-1"
              >
                <!-- starting value response slot -->
                <v-text-field
                  v-if="sparInput.endpoint == 'saving/saving-start-value'"
                  variant="outlined"
                  density="compact"
                  :prefix="$t('currency')"
                  v-model="sparInput.oneTimeInvestment[0]"
                  :value="
                    props.apiResponseSparen
                      ? props.apiResponseSparen.startInvestment
                      : ''
                  "
                  hide-details
                  readonly
                  bg-color="#E3F1F4"
                  color="primary"
                  base-color="primary"
                ></v-text-field>
                <!-- starting value input field -->
                <v-text-field
                  v-else
                  :label="'1. ' + $t('fieldNames.oneTimeInvestment')"
                  variant="outlined"
                  density="compact"
                  :prefix="$t('currency')"
                  v-model="sparInput.oneTimeInvestment[0]"
                  required
                  hide-details
                  type="number"
                  step="1000"
                  :disabled="sparInput.endpoint == ''"
                ></v-text-field>
                <!-- starting value info button -->
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
                    {{ $t("fieldInfosSaving.startCapital") }}
                  </v-tooltip>
                </v-btn>
              </v-col>

              <!-- starting value date -->
              <v-col
                v-if="startkapitalDetails"
                cols="11"
                sm="5"
                class="flex ps-0 pe-2 order-3 order-sm-2"
              >
                <!-- starting value date input field -->
                <v-text-field
                  :label="'1. ' + $t('fieldNames.oneTimeInvestmentDate')"
                  variant="outlined"
                  density="compact"
                  v-model="sparInput.oneTimeInvestmentDate[0]"
                  hide-details
                  type="date"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'saving/saving-start-value'
                  "
                ></v-text-field>
                <!-- info button for starting value date -->
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
                    {{ $t("fieldInfosSaving.startDate") }}
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col
                cols="1"
                class="px-0 flex justify-start align-center order-2 order-sm-3"
              >
                <!-- button to toggle starting value details form -->
                <v-icon
                  v-if="sparInput.endpoint != 'saving/saving-start-value'"
                  size="large"
                  @click="toggleStartkapital"
                >
                  {{ iconStartkapital }}
                </v-icon>
              </v-col>
            </v-row>

            <!-- starting value details form -->
            <v-row
              v-if="startkapitalDetails"
              v-for="n in einmalZahlung"
              class="ps-5 pe-2"
            >
              <v-col cols="11" sm="6" class="flex pe-2 px-0">
                <!-- one time investment input field -->
                <v-text-field
                  :prefix="$t('currency')"
                  :label="`${n + 1}. ` + $t('fieldNames.oneTimeInvestment')"
                  variant="outlined"
                  density="compact"
                  v-model="sparInput.oneTimeInvestment[n]"
                  hide-details
                  required
                  type="number"
                  step="1000"
                ></v-text-field>
                <!-- info button for one time investment -->
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
                    {{ $t("fieldInfosSaving.oneTimeInvestment") }}
                  </v-tooltip>
                </v-btn>
              </v-col>

              <v-col cols="11" sm="5" class="flex ps-0 pe-2">
                <!-- one time investment date input field  -->
                <v-text-field
                  :label="`${n + 1}. ` + $t('fieldNames.oneTimeInvestmentDate')"
                  variant="outlined"
                  density="compact"
                  v-model="sparInput.oneTimeInvestmentDate[n]"
                  hide-details
                  required
                  type="date"
                ></v-text-field>

                <!-- info button for one time investment date -->
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
                    {{ $t("fieldInfosSaving.oneTimeInvestmentDate") }}
                  </v-tooltip>
                </v-btn>
              </v-col>

              <v-col cols="1" class="px-0 flex align-center justify-start">
                <!-- button to delete one time investment -->
                <v-icon
                  size="large"
                  @click="
                    () => {
                      einmalZahlung > 0 ? einmalZahlung-- : (einmalZahlung = 0);
                      sparInput.oneTimeInvestment.splice(n, 1);
                      sparInput.oneTimeInvestmentDate.splice(n, 1);
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

            <!-- button to add new one time investment -->
            <v-row v-if="startkapitalDetails" class="ps-5 pe-2 pb-2">
              <v-col cols="auto" class="px-0 py-0">
                <v-btn
                  @click="() => einmalZahlung++"
                  rounded="lg"
                  variant="tonal"
                  color="#4195AC"
                  :text="$t('fieldNames.newOneTimeInvestment')"
                  prepend-icon="mdi-plus-circle-outline"
                  class="text-none"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'saving/saving-start-value'
                  "
                >
                </v-btn>
              </v-col>
            </v-row>

            <!-- saving rate radio button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip value="saving/saving-rate" density="compact"
                  >{{ $t("fieldNames.savingRate") }}
                </v-chip>
              </v-col>
            </v-row>

            <!-- saving rate form -->

            <v-row class="ps-5 pe-2">
              <v-col cols="11" class="flex pe-2 px-0">
                <!-- saving rate response slot -->
                <v-text-field
                  v-if="sparInput.endpoint == 'saving/saving-rate'"
                  variant="outlined"
                  :prefix="$t('currency')"
                  density="compact"
                  v-model="sparInput.savingRate"
                  :value="
                    props.apiResponseSparen
                      ? props.apiResponseSparen.savingRate
                      : ''
                  "
                  required
                  readonly
                  hide-details
                  bg-color="#E3F1F4"
                  color="primary"
                  base-color="primary"
                ></v-text-field>

                <!-- saving rate input field -->
                <v-text-field
                  v-else
                  variant="outlined"
                  :prefix="$t('currency')"
                  density="compact"
                  v-model="sparInput.savingRate"
                  required
                  hide-details
                  :placeholder="$t('fieldNames.savingRate')"
                  type="number"
                  step="50"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'saving/saving-rate'
                  "
                ></v-text-field>

                <!-- saving rate info button -->
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
                    {{ $t("fieldInfosSaving.savingRate") }}
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1" class="px-0 flex justify-start align-center">
                <!-- toggle for saving rate details -->
                <v-icon size="large" @click="toggleSparplan"
                  >{{ iconSparplan }}
                </v-icon>
              </v-col>
            </v-row>

            <!-- saving rate details form  -->
            <v-row class="ps-5 pe-2" v-if="sparplanDetails">
              <v-col cols="11" sm="6" class="flex pe-2 px-0">
                <!-- saving rate begin date -->
                <v-text-field
                  :label="$t('fieldNames.begin')"
                  variant="outlined"
                  density="compact"
                  v-model="sparInput.savingPlanBegin"
                  hide-details
                  type="date"
                  :disabled="sparInput.endpoint == ''"
                ></v-text-field>

                <!-- info button for saving rate begin date -->
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
                    {{ $t("fieldInfosSaving.savingPlanStart") }}
                  </v-tooltip>
                </v-btn>
              </v-col>

              <v-col cols="11" sm="5" class="flex ps-0 pe-2">
                <!-- saving rate end date input field -->
                <v-text-field
                  :label="$t('fieldNames.end')"
                  variant="outlined"
                  density="compact"
                  v-model="sparInput.savingPlanEnd"
                  hide-details
                  type="date"
                  min="sparplan"
                  :disabled="sparInput.endpoint == ''"
                  @blur="validateEndDate()"
                ></v-text-field>

                <!-- info button for saving rate end date -->
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
                    {{ $t("fieldInfosSaving.savingPlanEnd") }}
                  </v-tooltip>
                </v-btn>
              </v-col>
            </v-row>

            <!-- checkbox for dynamic saving rate factor -->
            <v-row class="ps-5 pe-2" v-if="sparplanDetails">
              <v-col cols="auto" class="flex px-0 align-center">
                <v-radio-group v-model="dynamik" hide-details>
                  <v-checkbox
                    :label="$t('fieldNames.dynamicSavingRateFactor')"
                    density="compact"
                    hide-details=""
                    :disabled="sparInput.endpoint == ''"
                  ></v-checkbox>
                </v-radio-group>
              </v-col>

              <v-col v-if="dynamik" class="flex px-2">
                <!-- input field for dynamic saving rate factor -->
                <v-text-field
                  variant="outlined"
                  prefix="%"
                  density="compact"
                  v-model="sparInput.dynamicSavingRateFactor"
                  hide-details
                  type="number"
                  step="0.5"
                ></v-text-field>

                <!-- info button for dynamic saving rate factor -->
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
                    {{ $t("fieldInfosSaving.dynamicFactor") }}
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1"></v-col>
            </v-row>

            <!-- radio button for interest rate during saving period -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip value="saving/interest-rate" density="compact"
                  >{{ $t("fieldNames.interestRate") }}
                </v-chip>
              </v-col>
            </v-row>

            <!-- form for interest rate during saving period -->

            <v-row class="ps-5 pe-2">
              <v-col class="flex pe-2 px-0">
                <!-- interest rate response slot -->
                <v-text-field
                  v-if="sparInput.endpoint == 'saving/interest-rate'"
                  prefix="%"
                  variant="outlined"
                  density="compact"
                  v-model="sparInput.interestRate"
                  :value="
                    props.apiResponseSparen
                      ? props.apiResponseSparen.interestRate
                      : ''
                  "
                  required
                  readonly
                  hide-details
                  bg-color="#E3F1F4"
                  color="primary"
                  base-color="primary"
                ></v-text-field>

                <!-- interest rate input field -->
                <v-text-field
                  v-else
                  prefix="%"
                  variant="outlined"
                  density="compact"
                  v-model="sparInput.interestRate"
                  required
                  hide-details
                  :placeholder="$t('fieldNames.interestRate')"
                  type="number"
                  step="0.5"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'saving/interest-rate'
                  "
                ></v-text-field>

                <!-- info button for interest rate -->
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
                    {{ $t("fieldInfosSaving.interestRate") }}
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1"></v-col>
            </v-row>

            <!-- Withdrawal Form Start -->

            <v-row class="py-0">
              <v-col class="pt-2 pb-5">
                <v-sheet class="rounded-lg elevation-0 bg-primary py-2">
                  <h1 class="text-white ps-5 font-bold">
                    {{ $t("fieldNames.withdrawPhase") }}
                  </h1>
                </v-sheet>
              </v-col>
            </v-row>

            <!-- Switch date Radio Button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip disabled value="saving/end-date" density="compact"
                  >{{ $t("fieldNames.withdrawBegin") }}
                </v-chip>
              </v-col>
            </v-row>

            <!-- Withdrawal begin Form -->
            <v-row class="ps-5 pe-2">
              <v-col class="flex pe-2 px-0">
                <!-- switch date response slot -->
                <v-text-field
                  v-if="sparInput.endpoint == 'saving/end-date'"
                  variant="outlined"
                  density="compact"
                  v-model="sparInput.end"
                  :value="
                    props.apiResponseSparen ? props.apiResponseSparen.end : ''
                  "
                  required
                  readonly
                  hide-details
                  type="date"
                  bg-color="#E3F1F4"
                  color="primary"
                  base-color="primary"
                ></v-text-field>

                <!-- switch date input field -->
                <v-text-field
                  @blur="
                    setEndDateToBiggestDate(sparInput);
                    entnahmeInput.begin = sparInput.end;
                    entnahmeInput.oneTimeInvestmentDate = [sparInput.end];
                    setEndDateToBiggestDate(entnahmeInput);
                  "
                  v-else
                  variant="outlined"
                  density="compact"
                  v-model="sparInput.end"
                  required
                  hide-details
                  type="date"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'saving/end-date'
                  "
                ></v-text-field>

                <!-- info button for switch date -->
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
                    {{ $t("fieldInfosCombo.withdrawBegin") }}
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1"></v-col>
            </v-row>

            <!-- withdrawal rate Radio Button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip value="withdraw/saving-rate" density="compact"
                  >{{ $t("fieldNames.withdrawRate") }}
                </v-chip>
              </v-col>
            </v-row>

            <!-- Withdrawal rate form -->

            <v-row class="ps-5 pe-2">
              <v-col cols="11" class="flex pe-2 px-0">
                <!--withdrawal rate response slot-->
                <v-text-field
                  v-if="sparInput.endpoint == 'withdraw/saving-rate'"
                  variant="outlined"
                  :prefix="$t('currency')"
                  density="compact"
                  v-model="entnahmeInput.savingRate"
                  :value="
                    props.apiResponseEntnahme
                      ? props.apiResponseEntnahme.savingRate
                      : ''
                  "
                  hide-details
                  readonly
                  bg-color="#E3F1F4"
                  color="primary"
                  base-color="primary"
                ></v-text-field>

                <!-- withdrawal rate input field -->
                <v-text-field
                  v-else
                  variant="outlined"
                  :prefix="$t('currency')"
                  density="compact"
                  v-model="entnahmeInput.savingRate"
                  required
                  hide-details
                  :placeholder="$t('fieldNames.withdrawRate')"
                  type="number"
                  step="50"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'withdraw/saving-rate'
                  "
                ></v-text-field>

                <!-- withdrawal rate info button -->
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
                    {{ $t("fieldInfosWithdraw.savingRate") }}
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1" class="px-0 flex align-center justify-start">
                <!-- toggle for withdrawal rate details -->
                <v-icon size="large" @click="toggleEntnahmeplan">
                  {{ iconEntnahmeplan }}
                </v-icon>
              </v-col>
            </v-row>

            <!-- withdrawal rate details form -->

            <v-row class="ps-5 pe-2" v-if="entnahmeplanDetails">
              <v-col cols="11" sm="6" class="flex pe-2 px-0">
                <!-- withdrawal rate begin date -->
                <v-text-field
                  :label="$t('fieldNames.begin')"
                  variant="outlined"
                  density="compact"
                  v-model="entnahmeInput.savingPlanBegin"
                  hide-details
                  type="date"
                  :disabled="sparInput.endpoint == ''"
                ></v-text-field>

                <!-- info button for withdrawal rate begin date -->
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
                    {{ $t("fieldInfosWithdraw.savingPlanStart") }}
                  </v-tooltip>
                </v-btn>
              </v-col>

              <v-col cols="11" sm="5" class="flex ps-0 pe-2">
                <!-- withdrawal rate end date -->
                <v-text-field
                  :label="$t('fieldNames.end')"
                  variant="outlined"
                  density="compact"
                  v-model="entnahmeInput.savingPlanEnd"
                  hide-details
                  type="date"
                  min="sparplan"
                  :disabled="sparInput.endpoint == ''"
                  @blur="validateEndDate()"
                ></v-text-field>

                <!-- info button for withdrawal rate end date -->
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
                    {{ $t("fieldInfosWithdraw.savingPlanEnd") }}
                  </v-tooltip>
                </v-btn>
              </v-col>
            </v-row>

            <!-- dynamic withrawal rate factor ??? -->
            <v-row class="ps-5 pe-2" v-if="entnahmeplanDetails">
              <v-col cols="auto" class="flex px-0 align-center">
                <!-- checkbox for dynamic withdrawal rate factor -->
                <v-radio-group v-model="dynamik" hide-details>
                  <v-checkbox
                    :label="$t('fieldNames.dynamicSavingRateFactor')"
                    density="compact"
                    hide-details=""
                    :disabled="sparInput.endpoint == ''"
                  ></v-checkbox>
                </v-radio-group>
              </v-col>

              <v-col v-if="dynamik" class="flex px-2">
                <!-- input field for dynamic withdrawal rate factor -->
                <v-text-field
                  v-if="dynamik"
                  variant="outlined"
                  prefix="%"
                  density="compact"
                  v-model="entnahmeInput.dynamicSavingRateFactor"
                  hide-details
                  type="number"
                  step="0.5"
                ></v-text-field>

                <!-- info button for dynamic withdrawal rate factor -->
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
                    {{ $t("fieldInfosWithdraw.dynamicFactor") }}
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1"></v-col>
            </v-row>

            <!-- radio button for interest rate during withrawal period -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip
                  disabled
                  value="withdraw/interest-rate"
                  density="compact"
                  >{{ $t("fieldNames.interestRate") }}
                </v-chip>
              </v-col>
            </v-row>

            <!-- interest rate form -->

            <v-row class="ps-5 pe-2">
              <v-col class="flex pe-2 px-0">
                <!-- interest rate response slot (withdrawal period) -->
                <v-text-field
                  v-if="sparInput.endpoint == 'withdraw/interest-rate'"
                  prefix="%"
                  variant="outlined"
                  density="compact"
                  v-model="entnahmeInput.interestRate"
                  :value="
                    props.apiResponseEntnahme
                      ? props.apiResponseEntnahme.interestRate
                      : ''
                  "
                  hide-details
                  readonly
                  bg-color="#E3F1F4"
                  color="primary"
                  base-color="primary"
                ></v-text-field>

                <!-- interest rate input field (withdrawal period) -->
                <v-text-field
                  v-else
                  prefix="%"
                  variant="outlined"
                  density="compact"
                  v-model="entnahmeInput.interestRate"
                  required
                  hide-details
                  :placeholder="$t('fieldNames.interestRate')"
                  type="number"
                  step="0.5"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'withdraw/interest-rate'
                  "
                ></v-text-field>

                <!-- info button for interest rate (withdrawal period) -->
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
                    {{ $t("fieldInfosWithdraw.interestRate") }}
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1"></v-col>
            </v-row>

            <!-- end date radio button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip value="withdraw/end-date" density="compact"
                  >{{ $t("fieldNames.end") }}
                </v-chip>
              </v-col>
            </v-row>

            <!-- End date Form -->
            <v-row class="ps-5 pe-2">
              <v-col class="flex pe-2 px-0">
                <!--End date response slot-->
                <v-text-field
                  v-if="sparInput.endpoint == 'withdraw/end-date'"
                  variant="outlined"
                  density="compact"
                  v-model="entnahmeInput.end"
                  :value="
                    props.apiResponseEntnahme
                      ? props.apiResponseEntnahme.end
                      : ''
                  "
                  hide-details
                  readonly
                  type="date"
                  bg-color="#E3F1F4"
                  color="primary"
                  base-color="primary"
                ></v-text-field>

                <!-- end date input field -->
                <v-text-field
                  @blur="setEndDateToBiggestDate(entnahmeInput)"
                  v-else
                  variant="outlined"
                  density="compact"
                  v-model="entnahmeInput.end"
                  required
                  hide-details
                  type="date"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'withdraw/end-date'
                  "
                ></v-text-field>

                <!-- end date info button -->
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
                    {{ $t("fieldInfosWithdraw.endDate") }}
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1"></v-col>
            </v-row>

            <!-- final capital radio button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip value="withdraw/capital" density="compact"
                  >{{ $t("fieldNames.capitalAmount") }}
                </v-chip>
              </v-col>
            </v-row>

            <!-- final capital Form -->

            <v-row class="ps-5 pe-2 pb-5">
              <v-col class="flex pe-2 px-0">
                <!-- final capital response slot -->
                <v-text-field
                  v-if="sparInput.endpoint == 'withdraw/capital'"
                  variant="outlined"
                  :prefix="$t('currency')"
                  density="compact"
                  v-model="entnahmeInput.endValue"
                  :value="
                    props.apiResponseEntnahme
                      ? props.apiResponseEntnahme.capitalResult
                        ? props.apiResponseEntnahme.capitalResult.capitalAmount
                        : ''
                      : ''
                  "
                  hide-details
                  readonly
                  bg-color="#E3F1F4"
                  color="primary"
                  base-color="primary"
                ></v-text-field>

                <!-- final capital input field -->
                <v-text-field
                  v-else
                  variant="outlined"
                  :prefix="$t('currency')"
                  density="compact"
                  v-model="entnahmeInput.endValue"
                  hide-details
                  placeholder="Endkapital"
                  type="number"
                  step="1000"
                  :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'withdraw/capital'
                  "
                ></v-text-field>

                <!-- final capital info button -->
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
                    {{ $t("fieldInfosWithdraw.endValue") }}
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1"></v-col>
            </v-row>
          </v-container>
        </v-chip-group>
      </v-card>

      <!-- calculate button -->
      <v-btn
        block
        class="text-none rounded-lg"
        color="#16486B"
        size="x-large"
        variant="flat"
        @click="emitData"
      >
        {{ $t("fieldNames.calculate") }}
      </v-btn>
    </div>
  </v-form>
  <v-dialog v-model="dialog" width="auto">
    <v-card>
      <v-card-title>
        {{ $t("dialog.message") }}
      </v-card-title>
      <v-card-text v-text="dialogText"></v-card-text>
      <v-card-actions>
        <v-btn color="primary" block @click="dialog = false">{{
          $t("dialog.close")
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>

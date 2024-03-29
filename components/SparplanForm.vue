<script lang="ts" setup>
import { watch } from "vue";
import {
  nextMonthFirstDay,
  inTenYears,
  validateInput,
  setEndDateToBiggestDate,
  todayDate,
} from "~/utils/formUtils";

const emit = defineEmits<{
  (e: "calculateInput", sparplanInput: {}): void;
  (e: "inputChange"): void;
}>();

//dialog for error inputs
const dialog = ref(false);
const dialogText = ref("");

// Amount of oneTimeInvestment(s)
const einmalZahlung = ref(0);

// Dynamic status
const dynamik = ref(false);

//details status for start capital and saving
const startkapitalDetails = ref(false);
const sparplanDetails = ref(false);
const iconStartkapital = ref("mdi-chevron-down");
const iconSparplan = ref("mdi-chevron-down");

//I18n Locale
const { t } = useI18n();

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
//function to show or hide details for saving plan
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

// validate input and get form data (user input)
function emitData() {
  if (
    (parseInt(sparplanInput.endValue) <= 0 ||
      [0, "", "0"].includes(sparplanInput.endValue)) &&
    sparplanInput.endpoint != "capital"
  ) {
    dialog.value = true;
    dialogText.value = t("error-message.savingplan.no-endcapital");
  } else if (
    parseInt(sparplanInput.endValue) <=
      parseInt(sparplanInput.oneTimeInvestment[0]) &&
    sparplanInput.endpoint !== "capital" &&
    sparplanInput.endpoint !== "saving-start-value"
  ) {
    dialog.value = true;
    dialogText.value = t(
      "error-message.savingplan.startcapital-bigger-than-endcapital",
    );
  } else if (
    sparplanInput.endpoint !== "saving-start-value" &&
    sparplanInput.oneTimeInvestmentDate.find(
      (element) => new Date(element) < new Date(todayDate),
    )
  ) {
    dialog.value = true;
    dialogText.value = t("error-message.oneTimeInvestmentDate-in-the-past");
  } else if (new Date(sparplanInput.savingPlanBegin) < new Date(todayDate)) {
    dialog.value = true;
    dialogText.value = t(
      "error-message.savingplan.savingPlanStart-in-the-past",
    );
  } else {
    if (sparplanInput.endpoint !== "saving-start-value") {
      for (let i = 0; i <= einmalZahlung.value; i++) {
        if (
          i > 0 &&
          (sparplanInput.oneTimeInvestment[i] === undefined ||
            [0, "0", ""].includes(sparplanInput.oneTimeInvestment[i]))
        ) {
          dialog.value = true;
          dialogText.value = t(
            "error-message.oneTimeInvestment-is-not-completed",
          );
          break;
        }
        if (
          sparplanInput.oneTimeInvestmentDate[i] === undefined ||
          sparplanInput.oneTimeInvestmentDate[i] === ""
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
      const toSend = JSON.parse(JSON.stringify(sparplanInput));
      validateInput(toSend);
      emit("calculateInput", toSend);
    }
  }
}

// send signal that input or chip is changed
function inputChangeWarn() {
  emit("inputChange");
}

function checkEnddateForErrorMessage() {
  if (setEndDateToBiggestDate(sparplanInput)) {
    dialog.value = true;
    dialogText.value = t("error-message.savingplan.endDateToEarly");
  }
  // if (
  //         new Date(sparplanInput.savingPlanEnd) <
  //         new Date(sparplanInput.savingPlanBegin) ||
  //         sparplanInput.savingPlanEnd < todayDate
  //     ){
  //       sparplanInput.savingPlanEnd = sparplanInput.savingPlanBegin;
  //       dialog.value=true;
  //       dialogText.value = t('error-message.savingplan.savingEnd-earlier-than-savingStart')
  //     }
}

//watch to validate input
watch(
  () => sparplanInput,
  () => {
    setEndDateToBiggestDate(sparplanInput);
    inputChangeWarn();
  },
  { deep: true },
);
//watch to take over respon to input
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
        sparplanInput.interestRate = props.apiResponse.interestRate;
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
</script>

<template>
  <h1 class="flex justify-center pt-5 pb-2 font-bold">
    {{ $t("fieldNames.title") }}
  </h1>
  <v-form>
    <div>
      <v-hover>
        <v-card elevation="0" class="overflow-y-auto" max-height="504">
          <v-chip-group
            v-model="sparplanInput.endpoint"
            @update:model-value="changeEndpoint"
            selected-class="bg-primary"
            class="overflow-hidden"
            mandatory
          >
            <v-container class="px-0 py-0">
              <!-- starting value radio button -->
              <v-row class="ps-5 mt-0">
                <v-col cols="12" class="flex px-0 py-0">
                  <v-chip value="saving-start-value" density="compact">{{
                    $t("fieldNames.startInvestment")
                  }}</v-chip>
                </v-col>
              </v-row>

              <!-- starting value form -->

              <v-row class="ps-5 pe-2">
                <v-col
                  cols="11"
                  :sm="startkapitalDetails ? 6 : 11"
                  class="flex pe-2 px-0 order-1"
                >
                  <!-- starting value response slot-->
                  <v-text-field
                    v-if="sparplanInput.endpoint == 'saving-start-value'"
                    variant="outlined"
                    density="compact"
                    :prefix="$t('currency')"
                    v-model="sparplanInput.oneTimeInvestment[0]"
                    :value="
                      props.apiResponse ? props.apiResponse.startInvestment : ''
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
                    v-model="sparplanInput.oneTimeInvestment[0]"
                    required
                    hide-details
                    type="number"
                    step="1000"
                    :disabled="sparplanInput.endpoint == ''"
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
                <v-col
                  cols="1"
                  class="px-0 flex align-center justify-center order-2 order-sm-3"
                >
                  <v-icon
                    v-if="sparplanInput.endpoint != 'saving-start-value'"
                    size="large"
                    @click="toggleStartkapital"
                  >
                    {{ iconStartkapital }}
                  </v-icon>
                </v-col>

                <!-- starting value date field -->
                <v-col
                  v-if="startkapitalDetails"
                  cols="11"
                  sm="5"
                  class="flex ps-0 pe-2 order-3 order-sm-2"
                >
                  <v-text-field
                    :label="'1. ' + $t('fieldNames.oneTimeInvestmentDate')"
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
                  <!-- starting value date info button -->
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
                    v-model="sparplanInput.oneTimeInvestment[n]"
                    hide-details
                    placeholder="weitere Einmalzahlung"
                    type="number"
                    step="1000"
                    :disabled="
                      sparplanInput.endpoint == '' ||
                      sparplanInput.endpoint == 'saving-start-value'
                    "
                  ></v-text-field>

                  <!-- one time ivestment info button -->
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
                  <!-- one time investment date field -->
                  <v-text-field
                    :label="
                      `${n + 1}. ` + $t('fieldNames.oneTimeInvestmentDate')
                    "
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

                  <!-- one time investment date info button -->
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

                <!-- button to delete one time investment -->
                <v-col cols="1" class="px-0 flex align-center justify-center">
                  <v-icon
                    @click="
                      () => {
                        einmalZahlung > 0
                          ? einmalZahlung--
                          : (einmalZahlung = 0);
                        sparplanInput.oneTimeInvestment.splice(n, 1);
                        sparplanInput.oneTimeInvestmentDate.splice(n, 1);
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

              <!-- Button New one time investment -->
              <v-row v-if="startkapitalDetails" class="ps-5 pe-2 pb-2">
                <v-col cols="auto" class="px-0 py-0">
                  <v-btn
                    @click="() => einmalZahlung++"
                    :disabled="
                      sparplanInput.endpoint == '' ||
                      sparplanInput.endpoint == 'saving-start-value'
                    "
                    rounded="lg"
                    variant="tonal"
                    color="#4195AC"
                    :text="$t('fieldNames.newOneTimeInvestment')"
                    prepend-icon="mdi-plus-circle-outline"
                    class="text-none"
                  >
                  </v-btn>
                </v-col>
              </v-row>

              <!-- saving rate radio button -->

              <v-row class="py-0 ps-5 pe-2">
                <v-col cols="auto" class="flex px-0 py-0">
                  <v-chip value="saving-rate" density="compact">{{
                    $t("fieldNames.savingRate")
                  }}</v-chip>
                </v-col>
              </v-row>

              <!-- saving rate form -->

              <v-row class="ps-5 pe-2">
                <v-col cols="11" class="flex pe-2 px-0">
                  <!-- saving rate response slot -->
                  <v-text-field
                    v-if="sparplanInput.endpoint == 'saving-rate'"
                    variant="outlined"
                    :prefix="$t('currency')"
                    density="compact"
                    v-model="sparplanInput.savingRate"
                    :value="
                      props.apiResponse ? props.apiResponse.savingRate : ''
                    "
                    readonly
                    required
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
                    v-model="sparplanInput.savingRate"
                    required
                    hide-details
                    :placeholder="$t('fieldNames.savingRate')"
                    type="number"
                    step="50"
                    :disabled="
                      sparplanInput.endpoint == '' ||
                      sparplanInput.endpoint == 'saving-rate'
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
                <!-- saving rate toggle button -->
                <v-col cols="1" class="px-0 flex justify-center align-center">
                  <v-icon size="large" @click="toggleSparplan">
                    {{ iconSparplan }}
                  </v-icon>
                </v-col>
              </v-row>

              <!-- saving rate details form -->

              <v-row class="ps-5 pe-2" v-if="sparplanDetails">
                <v-col cols="11" sm="6" class="flex pe-2 px-0">
                  <!-- saving rate begin date field -->
                  <v-text-field
                    :label="$t('fieldNames.begin')"
                    variant="outlined"
                    density="compact"
                    v-model="sparplanInput.savingPlanBegin"
                    hide-details
                    type="date"
                    :disabled="sparplanInput.endpoint == ''"
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
                  <!-- saving rate end date field -->
                  <v-text-field
                    :label="$t('fieldNames.end')"
                    variant="outlined"
                    density="compact"
                    v-model="sparplanInput.savingPlanEnd"
                    hide-details
                    type="date"
                    min="sparplan"
                    :disabled="sparplanInput.endpoint == ''"
                    @blur="checkEnddateForErrorMessage()"
                  ></v-text-field>

                  <!--info button for saving rate end date -->
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

              <!-- dynamic saving rate factor -->
              <v-row class="ps-5 pe-2" v-if="sparplanDetails">
                <v-col cols="auto" class="flex px-0 align-center">
                  <!-- checkbox for dynamic saving rate factor -->
                  <v-radio-group v-model="dynamik" hide-details>
                    <v-checkbox
                      :label="$t('fieldNames.dynamicSavingRateFactor')"
                      density="compact"
                      hide-details=""
                      :disabled="sparplanInput.endpoint == ''"
                    ></v-checkbox>
                  </v-radio-group>
                </v-col>
                <!-- input field for dynamic saving rate factor -->
                <v-col v-if="dynamik" class="flex px-2">
                  <v-text-field
                    variant="outlined"
                    prefix="%"
                    density="compact"
                    v-model="sparplanInput.dynamicSavingRateFactor"
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
                <v-col cols="1"> </v-col>
              </v-row>

              <!-- interest rate radio button -->

              <v-row class="py-0 ps-5 pe-2">
                <v-col cols="auto" class="flex px-0 py-0">
                  <v-chip value="interest-rate" density="compact">{{
                    $t("fieldNames.interestRate")
                  }}</v-chip>
                </v-col>
              </v-row>

              <!-- interest rate form -->
              <v-row class="ps-5 pe-2">
                <v-col class="flex pe-2 px-0">
                  <!-- interest rate response slot -->
                  <v-text-field
                    v-if="sparplanInput.endpoint == 'interest-rate'"
                    prefix="%"
                    variant="outlined"
                    density="compact"
                    v-model="sparplanInput.interestRate"
                    :value="
                      props.apiResponse ? props.apiResponse.interestRate : ''
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
                    v-model="sparplanInput.interestRate"
                    required
                    hide-details
                    :placeholder="$t('fieldNames.interestRate')"
                    type="number"
                    step="0.5"
                    :disabled="
                      sparplanInput.endpoint == '' ||
                      sparplanInput.endpoint == 'interest-rate'
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
                <v-col cols="1  "></v-col>
              </v-row>

              <!-- end date radio button -->

              <v-row class="py-0 ps-5 pe-2">
                <v-col cols="auto" class="flex px-0 py-0">
                  <v-chip value="end-date" density="compact">{{
                    $t("fieldNames.end")
                  }}</v-chip>
                </v-col>
              </v-row>

              <!--end date form -->
              <v-row class="ps-5 pe-2">
                <v-col class="flex pe-2 px-0">
                  <!-- end date response slot -->
                  <v-text-field
                    v-if="sparplanInput.endpoint == 'end-date'"
                    variant="outlined"
                    density="compact"
                    :value="props.apiResponse ? props.apiResponse.end : ''"
                    v-model="sparplanInput.end"
                    readonly
                    required
                    hide-details
                    type="date"
                    bg-color="#E3F1F4"
                    color="primary"
                    base-color="primary"
                  ></v-text-field>
                  <!-- end date input field -->
                  <v-text-field
                    @blur="checkEnddateForErrorMessage()"
                    v-else
                    variant="outlined"
                    density="compact"
                    v-model="sparplanInput.end"
                    required
                    hide-details
                    type="date"
                    :disabled="
                      sparplanInput.endpoint == '' ||
                      sparplanInput.endpoint == 'end-date'
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
                      {{ $t("fieldInfosSaving.endDate") }}
                    </v-tooltip>
                  </v-btn>
                </v-col>
                <v-col cols="1"></v-col>
              </v-row>

              <!-- capital radio button -->

              <v-row class="py-0 ps-5 pe-2">
                <v-col cols="auto" class="flex px-0 py-0">
                  <v-chip value="capital" density="compact">{{
                    $t("fieldNames.capitalAmount")
                  }}</v-chip>
                </v-col>
              </v-row>

              <!-- capital form -->

              <v-row class="ps-5 pe-2 pb-5">
                <v-col class="flex pe-2 px-0" cols="11">
                  <!-- capital response slot -->
                  <v-text-field
                    v-if="sparplanInput.endpoint === 'capital'"
                    variant="outlined"
                    :prefix="$t('currency')"
                    density="compact"
                    v-model="sparplanInput.endValue"
                    :value="
                      props.apiResponse
                        ? props.apiResponse.capitalResult
                          ? props.apiResponse.capitalResult.capitalAmount
                          : ''
                        : ''
                    "
                    readonly
                    hide-details
                    bg-color="#E3F1F4"
                    color="primary"
                    base-color="primary"
                  ></v-text-field>
                  <!-- capital input field -->
                  <v-text-field
                    ref="capital"
                    v-else
                    variant="outlined"
                    :prefix="$t('currency')"
                    density="compact"
                    v-model="sparplanInput.endValue"
                    type="number"
                    step="1000"
                    :disabled="
                      sparplanInput.endpoint == '' ||
                      sparplanInput.endpoint == 'capital'
                    "
                    hide-details
                  ></v-text-field>
                  <!-- capital info button -->
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
                      {{ $t("fieldInfosSaving.endValue") }}
                    </v-tooltip>
                  </v-btn>
                </v-col>
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
      </v-hover>
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

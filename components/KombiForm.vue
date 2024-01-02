<script lang="ts" setup>
import type {financeMathResult} from "~/types/index.d.ts";
import {
  nextMonthFirstDay,
  inTenYears,
  inTwentyYears,
  validateInput,
  setEndDateToBiggestDate,
} from "~/utils/formUtils";

const emit = defineEmits<{
  (e: "calculateInput", kombiplanInput: {}): void;
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
  emit("calculateInput", { sparFormInput: sparen, entnahmeFormInput: entnahme });
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
    () => [props.apiResponseEntnahme, props.apiResponseSparen],
    () => {
      switch (sparInput.endpoint) {
        case "sparen/saving-start-value":
          sparInput.oneTimeInvestment[0] = props.apiResponseSparen.startInvestment;
          break;
        case "sparen/saving-rate":
          sparInput.savingRate = props.apiResponseSparen.savingRate;
          break;
        case "sparen/interest-rate":
          sparInput.interestRate = props.apiResponseSparen.interestRate;
          break;
        case "sparen/end-date":
          sparInput.end = props.apiResponseSparen.end;
          break;
        case "entnahme/saving-rate":
          entnahmeInput.savingRate = props.apiResponseEntnahme.savingRate;
          break;
        case "entnahme/interest-rate":
          entnahmeInput.interestRate = props.apiResponseEntnahme.interestRate;
          break;
        case "entnahme/end-date":
          entnahmeInput.end = props.apiResponseEntnahme.end;
          break;
        case "entnahme/capital":
          entnahmeInput.endValue = props.apiResponseEntnahme.capitalResult.capitalAmount
          break;
      }
    },
);
</script>

<template>
  <!-- headline -->
  <h1 class="flex justify-center pt-5 pb-2 font-bold">Definieren Sie die Spar- und Entnahmephase:</h1>
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
                  <h1 class="text-white ps-5 font-bold">Sparphase</h1>
                </v-sheet>
              </v-col>
            </v-row>

            <!-- starting value radio button -->
            <v-row class="mt-0 ps-5 pt-2">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip
                    value="sparen/saving-start-value"
                    density="compact"
                >Startkapital
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
                    v-if="sparInput.endpoint == 'sparen/saving-start-value'"
                    variant="outlined"
                    density="compact"
                    prefix="€"
                    v-model="sparInput.oneTimeInvestment[0]"
                    :value="props.apiResponseSparen
                          ? props.apiResponseSparen.startInvestment
                          : ''"
                    hide-details
                    readonly
                    bg-color="#E3F1F4"
                    color="primary"
                    base-color="primary"
                ></v-text-field>
                <!-- starting value input field -->
                <v-text-field
                    v-else
                    label="1. Einmalzahlung"
                    variant="outlined"
                    density="compact"
                    prefix="€"
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
                    Trage den Betrag ein, den du zu Beginn investieren möchtest.<br>Der Standardwert für das Datum der
                    1. Investition ist der 1. des nächsten Monats.<br>Über
                    das Aufklapp-Symbol kannst du zusätzliche Optionen für Einmalzahlungen festlegen.
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
                    Gib das Datum ein, an dem du das Startkapital in deinen Sparplan investieren möchtest. Standardmäßig
                    ist dieses der 1. des nächsten Monats.
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1" class="px-0 flex justify-start align-center order-2 order-sm-3">
                <!-- button to toggle starting value details form -->
                <v-icon v-if="sparInput.endpoint!='sparen/saving-start-value'" size="large" @click="toggleStartkapital">
                  {{
                    iconStartkapital
                  }}
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
                    prefix="€"
                    :label="`${n + 1}. Einmalzahlung`"
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
                    Gib hier den Betrag der zusätzlichen Einmalzahlung ein.
                  </v-tooltip>
                </v-btn>
              </v-col>


              <v-col
                  cols="11"
                  sm="5"
                  class="flex ps-0 pe-2"
              >
                <!-- one time investment date input field  -->
                <v-text-field
                    :label="`${n + 1}. Datum`"
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
                    Gib hier das Datum der zusätzlichen Einmalzahlung ein.
                  </v-tooltip>
                </v-btn>
              </v-col>


              <v-col
                  cols="1"
                  class="px-0 flex align-center justify-start"
              >

                <!-- button to delete one time investment -->
                <v-icon
                    size="large"
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

            <!-- button to add new one time investment -->
            <v-row v-if="startkapitalDetails" class="ps-5 pe-2 pb-2">
              <v-col cols="auto" class="px-0 py-0">
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

            <!-- saving rate radio button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip
                    value="sparen/saving-rate"
                    density="compact"
                >Sparrate
                </v-chip>
              </v-col>
            </v-row>

            <!-- saving rate form -->

            <v-row class="ps-5 pe-2">

              <v-col cols="11" class="flex pe-2 px-0">

                <!-- saving rate response slot -->
                <v-text-field
                    v-if="sparInput.endpoint == 'sparen/saving-rate'"
                    variant="outlined"
                    prefix="€"
                    density="compact"
                    v-model="sparInput.savingRate"
                    :value="props.apiResponseSparen
                          ? props.apiResponseSparen.savingRate
                          : ''"
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
                    prefix="€"
                    density="compact"
                    v-model="sparInput.savingRate"
                    required
                    hide-details
                    placeholder="Sparrate"
                    type="number"
                    step="50"
                    :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'sparen/saving-rate'
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
                    Trage den monatlichen Betrag ein, den du regelmäßig in deinen Sparplan investieren möchtest.<br>Über
                    das Aufklapp-Symbol kannst du zusätzliche Optionen für die Sparrate festlegen.
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1" class="px-0 flex justify-start align-center">

                <!-- toggle for saving rate details -->
                <v-icon v-if="sparInput.endpoint!='sparen/saving-rate'" size="large" @click="toggleSparplan">{{
                    iconSparplan
                  }}
                </v-icon>
              </v-col>
            </v-row>

            <!-- saving rate details form  -->
            <v-row class="ps-5 pe-2" v-if="sparplanDetails">
              <v-col cols="11" sm="6" class="flex pe-2 px-0">

                <!-- saving rate begin date -->
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
                    Wähle das Datum aus, an dem du mit deinen monatlichen Sparraten beginnen möchtest. Standardmäßig ist
                    dieser auf den 1. des nächsten Monats eingestellt.
                  </v-tooltip>
                </v-btn>
              </v-col>


              <v-col
                  cols="11"
                  sm="5"
                  class="flex ps-0 pe-2"
              >
                <!-- saving rate end date input field -->
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
                    Wähle das Datum aus, an dem du deine monatlichen Sparraten beenden möchtest. Standardmäßig ist
                    dieses auf den 1. des nächsten Monats eingestellt.
                  </v-tooltip>
                </v-btn>
              </v-col>


            </v-row>

            <!-- checkbox for dynamic saving rate factor -->
            <v-row class="ps-5 pe-2" v-if="sparplanDetails">
              <v-col cols="auto" class="flex px-0 align-center">
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
                    Trage einen Faktor ein, der die dynamische Anpassung der Sparrate beeinflusst. Beispiel: Bei einer
                    monatlichen Sparrate von 50€ und einem Faktor von 150% sparst du plötzlich 75€ pro Monat.
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1"></v-col>
            </v-row>

            <!-- radio button for interest rate during saving period -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip
                    value="sparen/interest-rate"
                    density="compact"
                >Zins
                </v-chip>
              </v-col>
            </v-row>

            <!-- form for interest rate during saving period -->

            <v-row class="ps-5 pe-2">
              <v-col class="flex pe-2 px-0">

                <!-- interest rate response slot -->
                <v-text-field
                    v-if="sparInput.endpoint == 'sparen/interest-rate'"
                    prefix="%"
                    variant="outlined"
                    density="compact"
                    v-model="sparInput.interestRate"
                    :value="props.apiResponseSparen
                          ? props.apiResponseSparen.interestRate
                          : ''"
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
                    placeholder="Sparzins"
                    type="number"
                    step="0.5"
                    :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'sparen/interest-rate'
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
                    Trage hier den Zinssatz in Prozent ein, den du für deine Ersparnisse erwartest. Zinsen sind
                    zusätzliches Geld, das du bekommst, wenn du Geld sparst.
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1"></v-col>
            </v-row>

            <!-- Withdrawal Form Start -->

            <v-row class="py-0">
              <v-col class="pt-2 pb-5">
                <v-sheet class="rounded-lg elevation-0 bg-primary py-2">
                  <h1 class="text-white ps-5 font-bold">Entnahmephase</h1>
                </v-sheet>
              </v-col>
            </v-row>

            <!-- Switch date Radio Button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip
                    disabled
                    value="sparen/end-date"
                    density="compact"
                >Entnahmebeginn
                </v-chip>
              </v-col>
            </v-row>

            <!-- Withdrawal begin Form -->
            <v-row class="ps-5 pe-2">
              <v-col class="flex pe-2 px-0">

                <!-- switch date response slot -->
                <v-text-field
                    v-if="sparInput.endpoint == 'sparen/end-date'"
                    variant="outlined"
                    density="compact"
                    v-model="sparInput.end"
                    :value="props.apiResponseSparen ? props.apiResponseSparen.end : ''"
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
                    Trage hier das Datum ein, an dem dein Sparplan enden und dein Entnahmeplan starten soll.
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1"></v-col>
            </v-row>


            <!-- withdrawal rate Radio Button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip
                    value="entnahme/saving-rate"
                    density="compact"
                >Entnahmerate
                </v-chip>
              </v-col>
            </v-row>

            <!-- Withdrawal rate form -->

            <v-row class="ps-5 pe-2">


              <v-col cols="11" class="flex pe-2 px-0">

                <!--withdrawal rate response slot-->
                <v-text-field
                    v-if="sparInput.endpoint == 'entnahme/saving-rate'"
                    variant="outlined"
                    prefix="€"
                    density="compact"
                    v-model="entnahmeInput.savingRate"
                    :value="props.apiResponseEntnahme
                            ? props.apiResponseEntnahme.savingRate
                            : ''"
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
                    prefix="€"
                    density="compact"
                    v-model="entnahmeInput.savingRate"
                    required
                    hide-details
                    placeholder="Entnahmerate"
                    type="number"
                    step="50"
                    :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'entnahme/saving-rate'
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
                    Gib hier den monatlichen Betrag ein, den du regelmäßig von deinem angesparten Kapital entnehmen
                    möchtest. Über das Aufklapp-Symbol kannst du zusätzliche Optionen für die Entnahmerate einstellen.
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1" class="px-0 flex align-center justify-start">

                <!-- toggle for withdrawal rate details -->
                <v-icon v-if="entnahmeInput.endpoint!='entnahme/saving-rate'" size="large" @click="toggleEntnahmeplan">
                  {{
                    iconEntnahmeplan
                  }}
                </v-icon>
              </v-col>
            </v-row>

            <!-- withdrawal rate details form -->

            <v-row class="ps-5 pe-2" v-if="entnahmeplanDetails">
              <v-col cols="11" sm="6" class="flex pe-2 px-0">

                <!-- withdrawal rate begin date -->
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
                    Wähle hier das Datum aus, an dem du mit den regelmäßigen Entnahmen beginnen möchtest. Standardmäßig
                    ist dieser Wert auf den 1. des nächsten Monats gesetzt.
                  </v-tooltip>
                </v-btn>
              </v-col>

              <v-col

                  cols="11"
                  sm="5"
                  class="flex ps-0 pe-2"
              >

                <!-- withdrawal rate end date -->
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
                    Wähle hier das Datum aus, an dem du die regelmäßigen Entnahmen beenden möchtest. Standardmäßig ist
                    dieser Wert auf 10 Jahre ab heute gesetzt.
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
                      label="Dynamik"
                      density="compact"
                      hide-details=""
                      :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'entnahme/saving-rate'
                  "
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
                    Trage einen Faktor ein, der die dynamische Anpassung der Sparrate beeinflusst. Beispiel: Bei einer monatlichen Sparrate von 50€ und einem Faktor von 150% sparst du plötzlich 75€ pro Monat.
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
                    value="entnahme/interest-rate"
                    density="compact"
                >Zins
                </v-chip>
              </v-col>
            </v-row>

            <!-- interest rate form -->

            <v-row class="ps-5 pe-2">
              <v-col class="flex pe-2 px-0">

                <!-- interest rate response slot (withdrawal period) -->
                <v-text-field
                    v-if="sparInput.endpoint == 'entnahme/interest-rate'"
                    prefix="%"
                    variant="outlined"
                    density="compact"
                    v-model="entnahmeInput.interestRate"
                    :value="props.apiResponseEntnahme
                            ? props.apiResponseEntnahme.interestRate
                            : ''"
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
                    placeholder="Entnahmezins"
                    type="number"
                    step="0.5"
                    :disabled="
                    sparInput.endpoint == '' ||
                    sparInput.endpoint == 'entnahme/interest-rate'
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
                    Trage hier den Zinssatz in Prozent ein, den du für deine Ersparnisse während der Entnahmephase
                    erwartest. Zinsen sind zusätzliches Geld, das du bekommst, wenn du Geld sparst.
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1"></v-col>
            </v-row>


            <!-- end date radio button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip
                    value="entnahme/end-date"
                    density="compact"
                >Enddatum
                </v-chip>
              </v-col>
            </v-row>

            <!-- End date Form -->
            <v-row class="ps-5 pe-2">
              <v-col class="flex pe-2 px-0">

                <!--End date response slot-->
                <v-text-field
                    v-if="sparInput.endpoint == 'entnahme/end-date'"
                    variant="outlined"
                    density="compact"
                    v-model="entnahmeInput.end"
                    :value="props.apiResponseEntnahme
                            ? props.apiResponseEntnahme.end
                            : ''"
                    hide-details
                    readonly
                    type="date"
                    bg-color="#E3F1F4"
                    color="primary"
                    base-color="primary"
                ></v-text-field>

                <!-- end date input field -->
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
                    Trage hier das Datum ein, an dem dein Entnahmeplan enden soll. Standardmäßig ist dieses auf 10 Jahre
                    von heute eingestellt.
                  </v-tooltip>
                </v-btn>
              </v-col>
              <v-col cols="1"></v-col>
            </v-row>

            <!-- final capital radio button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-chip
                    value="entnahme/capital"
                    density="compact"
                >Endkapital
                </v-chip>
              </v-col>
            </v-row>

            <!-- final capital Form -->

            <v-row class="ps-5 pe-2 pb-5">
              <v-col class="flex pe-2 px-0">

                <!-- final capital response slot -->
                <v-text-field
                    v-if="sparInput.endpoint == 'entnahme/capital'"
                    variant="outlined"
                    prefix="€"
                    density="compact"
                    v-model="entnahmeInput.endValue"
                    :value="props.apiResponseEntnahme
                            ? props.apiResponseEntnahme.capitalResult
                                ? props.apiResponseEntnahme.capitalResult
                                    .capitalAmount
                                : '' : ''"
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
                    prefix="€"
                    density="compact"
                    v-model="entnahmeInput.endValue"
                    hide-details
                    placeholder="Endkapital"
                    type="number"
                    step="1000"
                    :disabled="
                    sparInput.endpoint == '' || sparInput.endpoint == 'entnahme/capital'
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
                    Trage hier den gewünschten Betrag ein, den du am Ende deines Entnahmeplans übrig haben möchtest.
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
        Berechnen
      </v-btn>
    </div>
  </v-form>
</template>

<style scoped>
</style>

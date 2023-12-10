<script lang="ts" setup>
import {watch} from "vue";
import {
  nextMonthFirstDay,
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
    toSend.endValue === 0 ? (toSend.endValue = 0.01) : "";
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
    {deep: true},
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
watch(
    () => props.apiResponse,
    () => {
      switch (entnahmeplaninput.endpoint) {
        case "saving-start-value":
          entnahmeplaninput.oneTimeInvestment[0] = props.apiResponse.startInvestment;
          break;
        case "saving-rate":
          entnahmeplaninput.savingRate = props.apiResponse.savingRate;
          break;
        case "interest-rate":
          entnahmeplaninput.InterestRate = props.apiResponse.InterestRate;
          break;
        case "end-date":
          entnahmeplaninput.end = props.apiResponse.end;
          break;
        case "capital":
          entnahmeplaninput.endValue = props.apiResponse.capitalResult.capitalAmount;
          break;
      }
    },
);

watch(entnahmeplaninput.end,
()=>{
  if(new Date(entnahmeplaninput.end)<new Date(entnahmeplaninput.savingPlanEnd)){
    entnahmeplaninput.savingPlanEnd=entnahmeplaninput.end;
  }else{
    if(entnahmeplaninput.savingPlanEnd===inTenYears){

    }
  }
}
)
</script>

<template>
  <!-- headline -->
  <h3 class="font-bold pb-5 mt-5">Wählen Sie Ihr Berechnungsziel:</h3>
  <!-- form container -->
  <v-form>
    <div>
      <v-card class="overflow-y-auto" elevation="0" max-height="580">
        <v-radio-group
            v-model="entnahmeplaninput.endpoint"
            @update:model-value="changeEndpoint"
        >
          <v-container class="px-0 py-0">

            <!-- starting value radio button -->

            <v-row class="mt-0 ps-5">
              <v-col cols="12" class="flex px-0 py-0">
                <v-radio
                    label="Startkapital"
                    value="saving-start-value"
                    density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!-- starting value form -->
            <v-row class="px-5">
              <v-col cols="1" class="px-0">
                <!-- starting value toggle button -->
                <v-icon v-if="entnahmeplaninput.endpoint!='saving-start-value'" size="large"
                        @click="toggleStartkapital">{{
                    iconStartkapital
                  }}
                </v-icon>
              </v-col>
              <v-col
                  :cols="einmalZahlung == 0 ? 11 : 10"
                  :sm="startkapitalDetails ? (einmalZahlung == 0 ? 6 : 5) : 11"
                  class="flex ps-2 px-0"
              >
                <!-- starting value response slot -->
                <v-text-field
                    v-if="entnahmeplaninput.endpoint == 'saving-start-value'"
                    label="1. Einmalzahlung"
                    variant="outlined"
                    density="compact"
                    prefix="€"
                    v-model="entnahmeplaninput.oneTimeInvestment[0]"
                    :value="props.apiResponse ? props.apiResponse.startInvestment : ''"
                    hide-details
                    type="number"
                    readonly
                ></v-text-field>
                <!-- starting value input field -->
                <v-text-field
                    v-else
                    label="1. Einmalzahlung"
                    variant="outlined"
                    density="compact"
                    prefix="€"
                    v-model="entnahmeplaninput.oneTimeInvestment[0]"
                    required
                    hide-details
                    type="number"
                    step="1000"
                    :disabled="entnahmeplaninput.endpoint == ''"
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

              <!-- starting value date input field -->
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
                    :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-start-value'
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
              <v-col cols="1" class="px-0 py-0"></v-col>
            </v-row>

            <!-- starting value details form -->
            <v-row
                v-if="startkapitalDetails"
                v-for="n in einmalZahlung"
                class="px-5"
            >
              <v-col offset="1" cols="10" sm="5" class="flex ps-2 px-0">

                <!-- one time investment input field -->
                <v-text-field
                    prefix="€"
                    :label="`${n + 1}. Einmalzahlung`"
                    variant="outlined"
                    density="compact"
                    v-model="entnahmeplaninput.oneTimeInvestment[n]"
                    hide-details
                    placeholder="weitere Einmalzahlung"
                    type="number"
                    step="1000"
                    :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-start-value'
                  "
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

              <!-- one time investment date input field -->
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

              <!-- button to delete one time investment -->
              <v-col
                  cols="1"
                  class="ps-2 px-0 d-flex align-center justify-start"
              >
                <v-icon
                    @click="
                    () => {
                      einmalZahlung > 0 ? einmalZahlung-- : (einmalZahlung = 0);
                      entnahmeplaninput.oneTimeInvestment.pop();
                      entnahmeplaninput.oneTimeInvestmentDate.pop();
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

            <!-- button for new one time investment -->
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

            <!-- withdrawal rate radio button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-radio
                    label="Entnahmerate"
                    value="saving-rate"
                    density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!-- withdrawal rate form -->

            <v-row class="px-5">

              <v-col cols="1" class="px-0">
                <!-- toggle for withdrawal rate details -->
                <v-icon v-if="entnahmeplaninput.endpoint!='saving-rate'" size="large" @click="toggleSparplan">{{
                    iconSparplan
                  }}
                </v-icon>
              </v-col>

              <v-col class="flex ps-2 px-0">
                <!-- withdrawal rate response slot -->
                <v-text-field
                    v-if="entnahmeplaninput.endpoint == 'saving-rate'"
                    variant="outlined"
                    prefix="€"
                    density="compact"
                    v-model="entnahmeplaninput.savingRate"
                    :value="props.apiResponse ? props.apiResponse.savingRate : ''"
                    readonly
                    required
                    hide-details
                    type="number"
                ></v-text-field>
                <!-- withdrawal rate input field -->
                <v-text-field
                    v-else
                    variant="outlined"
                    prefix="€"
                    density="compact"
                    v-model="entnahmeplaninput.savingRate"
                    required
                    hide-details
                    placeholder="Sparrate"
                    type="number"
                    step="50"
                    :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-rate'
                  "
                ></v-text-field>
                <!-- info button for withdrawal rate -->
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
            </v-row>

            <!-- withdrawal rate details form -->
            <v-row class="px-5" v-if="sparplanDetails">
              <v-col offset="1" cols="11" sm="5" class="flex ps-2 px-0">

                <!-- starting date of withdrawal input field -->
                <v-text-field
                    label="Startdatum"
                    variant="outlined"
                    density="compact"
                    v-model="entnahmeplaninput.savingPlanBegin"
                    hide-details
                    type="date"
                    :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-rate'
                  "
                ></v-text-field>
                <!-- info button for starting date of withdrawal -->
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
                    Wähle hier das Datum aus, an dem du mit den regelmäßigen Entnahmen beginnen möchtest. Standardmäßig ist dieser Wert auf den 1. des nächsten Monats gesetzt.
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
                <!-- input field for end date of withdrawal rate -->
                <v-text-field
                    label="Enddatum"
                    variant="outlined"
                    density="compact"
                    v-model="entnahmeplaninput.savingPlanEnd"
                    hide-details
                    type="date"
                    min="sparplan"
                    :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-rate'
                  "
                ></v-text-field>
                <!-- info button for end date of withdrawal rate -->
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
                    Wähle hier das Datum aus, an dem du die regelmäßigen Entnahmen beenden möchtest. Standardmäßig ist dieser Wert auf 10 Jahre ab heute gesetzt.
                  </v-tooltip>
                </v-btn>
              </v-col>

              <!-- dynamic withdrawal rate factor -->
            </v-row>
            <v-row class="px-5" v-if="sparplanDetails">
              <v-col offset="1" cols="auto" class="flex ps-2 px-0 align-center">
                <!-- checkbox for dynamic rate factor -->
                <v-radio-group v-model="dynamik" hide-details>
                  <v-checkbox
                      label="Dynamik"
                      density="compact"
                      hide-details=""
                      :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'saving-rate'
                  "
                  ></v-checkbox>
                </v-radio-group>
              </v-col>

              <!-- input field for dynamic rate factor -->
              <v-col v-if="dynamik" class="flex pe-0">
                <v-text-field
                    variant="outlined"
                    suffix="%"
                    density="compact"
                    v-model="entnahmeplaninput.dynamicSavingRateFactor"
                    hide-details
                    type="number"
                    step="0.5"
                ></v-text-field>
                <!-- info button for dynamic rate factor -->
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
                    ???
                  </v-tooltip>
                </v-btn>
              </v-col>
            </v-row>

            <!-- interest rate radio button -->
            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-radio
                    disabled
                    label="Verzinsung"
                    value="interest-rate"
                    density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!-- interest rate Form -->

            <v-row class="px-5">
              <v-col class="flex ps-2 px-0" offset="1">

                <!-- interest rate response slot -->
                <v-text-field
                    v-if="entnahmeplaninput.endpoint == 'interest-rate'"
                    prefix="%"
                    variant="outlined"
                    density="compact"
                    v-model="entnahmeplaninput.interestRate"
                    :value="props.apiResponse ? props.apiResponse.interestRate : ''"
                    required
                    readonly
                    hide-details
                    type="number"
                ></v-text-field>

                <!-- interest rater input field -->
                <v-text-field
                    v-else
                    prefix="%"
                    variant="outlined"
                    density="compact"
                    v-model="entnahmeplaninput.interestRate"
                    required
                    hide-details
                    placeholder="Zins"
                    type="number"
                    step="0.5"
                    :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'interest-rate'
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
                    Trage hier den Zinssatz in Prozent ein, den du für deine Ersparnisse erwartest. Zinsen sind zusätzliches Geld, das du bekommst, wenn du Geld sparst.
                  </v-tooltip>
                </v-btn>
              </v-col>
            </v-row>


            <!-- end date radio button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-radio
                    label="Enddatum"
                    value="end-date"
                    density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!-- end date Form -->
            <v-row class="px-5">
              <v-col class="flex ps-2 px-0" offset="1">

                <!-- end date response slot -->
                <v-text-field
                    v-if="entnahmeplaninput.endpoint == 'end-date'"
                    variant="outlined"
                    density="compact"
                    v-model="entnahmeplaninput.end"
                    :value="props.apiResponse ? props.apiResponse.end : ''"
                    required
                    readonly
                    hide-details
                    type="date"
                ></v-text-field>

                <!-- end date input field -->
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

                <!-- info button for end date -->
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
                    Trage hier das Datum ein, an dem dein Entnahmeplan enden soll. Standardmäßig ist dieses auf 10 Jahre von heute eingestellt.
                  </v-tooltip>
                </v-btn>
              </v-col>
            </v-row>

            <!-- capital radio button -->

            <v-row class="py-0 ps-5">
              <v-col cols="auto" class="flex px-0 py-0">
                <v-radio
                    label="Endkapital"
                    value="capital"
                    density="compact"
                ></v-radio>
              </v-col>
            </v-row>

            <!-- capital form -->

            <v-row class="px-5">
              <v-col class="flex ps-2 px-0" offset="1">

                <!-- capital response slot -->
                <v-text-field
                    v-if="entnahmeplaninput.endpoint == 'capital'"
                    variant="outlined"
                    prefix="€"
                    density="compact"
                    v-model="entnahmeplaninput.endValue"
                    :value="props.apiResponse
                            ? props.apiResponse.capitalResult
                                ? props.apiResponse.capitalResult.capitalAmount
                                : '' : ''"
                    readonly
                    hide-details
                    type="number"
                ></v-text-field>

                <!-- capital input field -->
                <v-text-field
                    v-else
                    variant="outlined"
                    prefix="€"
                    density="compact"
                    v-model="entnahmeplaninput.endValue"
                    hide-details
                    type="number"
                    step="1000"
                    :disabled="
                    entnahmeplaninput.endpoint == '' ||
                    entnahmeplaninput.endpoint == 'capital'
                  "
                ></v-text-field>

                <!-- info button for capital -->
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
            </v-row>
          </v-container>
        </v-radio-group>
      </v-card>

      <!-- calculate button -->
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


<style scoped></style>

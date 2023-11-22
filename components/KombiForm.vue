<script lang="ts" setup>
import type { financeMathResult } from "~/types/index.d.ts"
import {
  todayDate,
  inTenYears,
  inTwentyYears,
  validateInput,
  setEndDateToBiggestDate
} from '~/utils/formUtils'

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
  apiResponseSparen: financeMathResult,
  apiResponseEntnahme: financeMathResult
}>()

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
  endpoint: ""
})

const entnahmeInput = reactive({
  begin: sparInput.end,
  end: "",
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
  endpoint:""
})

function toggleStartkapital(){
  if (startkapitalDetails.value == false){
    startkapitalDetails.value = true;
    iconStartkapital.value = "mdi-chevron-up";
  } else {
    startkapitalDetails.value = false;
    iconStartkapital.value = "mdi-chevron-down";
  }
}

function toggleSparplan() {
  if (sparplanDetails.value == false){
    sparplanDetails.value = true;
    iconSparplan.value = "mdi-chevron-up";
  } else {
    sparplanDetails.value = false;
    iconSparplan.value = "mdi-chevron-down";
  }
}

function toggleEntnahmeplan() {
  if (entnahmeplanDetails.value == false){
    entnahmeplanDetails.value = true;
    iconEntnahmeplan.value = "mdi-chevron-up";
  } else {
    entnahmeplanDetails.value = false;
    iconEntnahmeplan.value = "mdi-chevron-down";
  }
}

function changeEndpoint() {
  entnahmeInput.endpoint = sparInput.endpoint
  //resetting inputs due to change of endpoint
  sparInput.oneTimeInvestment = [0];
  sparInput.oneTimeInvestmentDate = [todayDate];

  sparInput.end = (sparInput.endpoint === "sparen/end-date") ? "" : inTenYears;
  sparInput.savingPlanBegin = sparInput.begin;
  sparInput.savingPlanEnd = sparInput.end;

  sparInput.interestRate = 0;
  sparInput.savingRate = 0;



  entnahmeInput.begin = sparInput.end
  entnahmeInput.end = (sparInput.endpoint === "entnahme/end-date") ? "" : inTwentyYears;
  entnahmeInput.savingPlanBegin = entnahmeInput.begin;
  entnahmeInput.savingPlanEnd = entnahmeInput.end;
  entnahmeInput.oneTimeInvestment = [0];
  entnahmeInput.oneTimeInvestmentDate = [entnahmeInput.begin];

  entnahmeInput.savingRate = 0;
  entnahmeInput.interestRate = 0;
  entnahmeInput.endValue = 0;

  einmalZahlung.value = 0;
  dynamik.value = false;
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
      sparen.oneTimeInvestment.splice(key,1);
      sparen.oneTimeInvestmentDate.splice(key,1);
    }
  }

  if (sparInput.endpoint!='entnahme/end-date') {
    entnahme.savingRate = -entnahme.savingRate;
  }

  validateInput(sparen);
  validateInput(entnahme);
  emit("calculateInput", { sparrForm: sparen, entnahmeForm: entnahme });

}
watch(() => sparInput.savingPlanEnd, () => {
  setEndDateToBiggestDate(sparInput)
  if (new Date(sparInput.savingPlanEnd) < new Date(sparInput.savingPlanStart))
  sparInput.savingPlanEnd = sparInput.savingPlanStart
})
watch(() => entnahmeInput.savingPlanEnd, () => {
  setEndDateToBiggestDate(entnahmeInput)
  if (new Date(entnahmeInput.savingPlanEnd) < new Date(entnahmeInput.savingPlanStart))
  entnahmeInput.savingPlanEnd = entnahmeInput.savingPlanStart
})

</script>

<template>

  <h3 class="font-bold pb-5 py-3">Was möchten Sie berechnen?</h3>
  <v-form>
    <div>
      <v-card class="overflow-y-auto" max-height="580">
      <v-radio-group
          v-model="sparInput.endpoint"
          @update:model-value="changeEndpoint">

        <v-container class="px-0 py-0">
          <!-- Startkapital Radio Button -->
          <v-row class="mt-0 ps-5">
            <v-col cols="auto" class="flex px-0 py-0">
                <v-radio label="Startkapital" value="sparen/saving-start-value" density="compact"></v-radio>
            </v-col>
          </v-row>

          <!--Startkapital response slot-->
          <v-row v-if="sparInput.endpoint=='sparen/saving-start-value'" class="px-5">
            <v-card 
            v-text="props.apiResponseSparen?props.apiResponseSparen.startInvestment:''" 
            class="text-center w-75 ma-auto" 
            height="40"
            variant="outlined"
            :color="props.apiResponseSparen?'#4195AC':''"></v-card>
          </v-row>
        <!-- Startkapital Form -->
          <v-row v-else class="px-5">
            <v-col cols="1" class="px-0">
              <v-icon size="large" @click="toggleStartkapital">{{ iconStartkapital }}</v-icon>
            </v-col>
            <v-col  class="flex ps-2 px-0">
              <v-text-field
                  label="1. Einmalzahlung"
                  variant="outlined"
                  density="compact"
                  prefix="€"
                  v-model="sparInput.oneTimeInvestment[0]"
                  required
                  hide-details
                  type="number"
                  step="0.01"
                  :disabled="sparInput.endpoint==''||sparInput.endpoint=='sparen/saving-start-value'"
              ></v-text-field>
              <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
                <v-icon size="small">mdi-information-outline</v-icon>
                <v-tooltip activator="parent" location="end" class="w-50">
                  This parameter defines any number of one-time cash in- and outflows.
                  Positive investment amounts are interpreted as cash inflows and negative investment amounts as cash
                  outflows.
                  Default date for first cash inflow (start capital) is today.
                </v-tooltip>
              </v-btn>
            </v-col>
            <v-col class="flex ps-2 px-0">
              <v-text-field
                  v-if="startkapitalDetails"
                  label="Startdatum"
                  variant="outlined"
                  density="compact"
                  v-model="sparInput.oneTimeInvestmentDate[0]"
                  hide-details
                  type="date"
                  :disabled="sparInput.endpoint==''||sparInput.endpoint=='sparen/saving-start-value'"
              ></v-text-field>
              <v-btn
                  v-if="startkapitalDetails"
                  icon elevation="0"
                  variant="plain"
                  height="auto"
                  width="auto"
                  class="ps-2">
                <v-icon size="small">mdi-information-outline</v-icon>
                <v-tooltip activator="parent" location="end" class="w-50">
                  This parameter specifies the investment dates of the one-time cash in- or outflow (see oneTimeInvestments parameter).
                   If the date of a cash flow is outside of the investment period, it will not be included in the calculation.
                </v-tooltip>
              </v-btn>
            </v-col>
            <v-col cols="1" class="px-0 py-0">

            </v-col>
          </v-row>

          <!-- Startkapital Detail-Ansicht -->
          <v-row v-if="startkapitalDetails" v-for="n in einmalZahlung" class="px-5">
            <v-col cols="1">

            </v-col>
            <v-col class="flex ps-2 px-0">
              <v-text-field
                  prefix="€"
                  :label="`${n + 1}. Einmalzahlung`"
                  variant="outlined"
                  density="compact"
                  v-model="sparInput.oneTimeInvestment[n]"
                  hide-details
                  required
                  placeholder="weitere Einmalzahlung"
                  type="number"
                  :disabled="sparInput.endpoint==''||sparInput.endpoint=='sparen/saving-start-value'"
              ></v-text-field>
              <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
                <v-icon size="small">mdi-information-outline</v-icon>
                <v-tooltip activator="parent" location="end" class="w-50">
                  This parameter defines any number of one-time cash in- and outflows.
                  Positive investment amounts are interpreted as cash inflows and negative investment amounts as cash
                  outflows.
                </v-tooltip>
              </v-btn>
            </v-col>
            <v-col class="flex ps-2 px-0">
              <v-text-field
                  :label="`${n + 1}. Datum`"
                  variant="outlined"
                  density="compact"
                  v-model="sparInput.oneTimeInvestmentDate[n]"
                  hide-details
                  required
                  type="date"
                  :disabled="sparInput.endpoint==''||sparInput.endpoint=='sparen/saving-start-value'"
              ></v-text-field>
              <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
                <v-icon size="small">mdi-information-outline</v-icon>
                <v-tooltip activator="parent" location="end" class="w-50">
                  This parameter specifies the investment dates of the one-time cash in- or outflow (see oneTimeInvestments parameter).
                   If the date of a cash flow is outside of the investment period, it will not be included in the calculation.
                </v-tooltip>
              </v-btn>
            </v-col>
            <v-col cols="1" class="ps-2 px-0 d-flex align-center justify-start">
              <v-icon
                  @click="()=>{einmalZahlung>0?einmalZahlung--:einmalZahlung=0;sparInput.oneTimeInvestment.pop();sparInput.oneTimeInvestmentDate.pop()}"
                  :disabled="sparInput.endpoint==''||sparInput.endpoint=='saving-start-value'||einmalZahlung<=0"
              >
                mdi-trash-can-outline
              </v-icon>
            </v-col>
          </v-row>

          <!-- Button Neue Einmalzahlung -->
          <v-row v-if="startkapitalDetails" class="px-5">
            <v-col cols="1">

            </v-col>
            <v-col cols="auto" class="ps-2 py-0">
              <v-btn
                  @click="()=>einmalZahlung++"
                  :disabled="sparInput.endpoint==''||sparInput.endpoint=='sparen/saving-start-value'"
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
              <v-radio label="Sparrate" value="sparen/saving-rate" density="compact"></v-radio>
            </v-col>
          </v-row>


        <!-- Sparrate Form -->

          <v-row class="px-5">
            <v-col cols="1" class="px-0">
              <v-icon size="large" @click="toggleSparplan">{{ iconSparplan }}</v-icon>
            </v-col>

            <!--Sparrate response slot-->
            <v-col v-if="sparInput.endpoint=='sparen/saving-rate'" class="flex ps-2 pa-0">
            <v-card 
            v-text="props.apiResponseSparen?props.apiResponseSparen.savingRate:''" 
            class="text-center w-100 ma-auto" 
            height="40"
            variant="outlined"
            :color="props.apiResponseSparen?'#4195AC?':''"></v-card>
          </v-col>

          <!--Sparrate input field-->
            <v-col v-else class="flex ps-2 px-0">
              <v-text-field
                  variant="outlined"
                  prefix="€"
                  density="compact"
                  v-model="sparInput.savingRate"
                  required
                  hide-details
                  placeholder="Sparrate"
                  type="number"
                  step="0.01"
                  :disabled="sparInput.endpoint==''||sparInput.endpoint=='sparen/saving-rate'"
              ></v-text-field>
              <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
                <v-icon size="small">mdi-information-outline</v-icon>
                <v-tooltip activator="parent" location="end" class="w-50">
                 	This parameter specifies the monthly savings rate.
                </v-tooltip>
              </v-btn>
            </v-col>
            <v-col cols="1" class="px-0 py-0">

            </v-col>
          </v-row>

        <!-- Sparrate Detail-Ansicht -->
        <v-row class="px-5" v-if="sparplanDetails">
          <v-col cols="1">

          </v-col>
          <v-col class="flex ps-2 px-0">
            <v-text-field
                label="Startdatum"
                variant="outlined"
                density="compact"
                v-model="sparInput.savingPlanBegin"
                hide-details
                type="date"
            ></v-text-field>
            <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
              <v-icon size="small">mdi-information-outline</v-icon>
              <v-tooltip activator="parent" location="end" class="w-50">
                This parameter defines the begin of the optional savings plan. If no date is specified, the savings rate is applied for the total investment period.
              </v-tooltip>
            </v-btn>
          </v-col>
          <v-col class="flex ps-2 px-0">
            <v-text-field
                label="Enddatum"
                variant="outlined"
                density="compact"
                v-model="sparInput.savingPlanEnd"
                hide-details
                type="date"
                min="sparplan"
            ></v-text-field>
            <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
              <v-icon size="small">mdi-information-outline</v-icon>
              <v-tooltip activator="parent" location="end" class="w-50">
                This parameter defines the end of the optional savings plan. If no date is specified, the savings rate is applied for the total investment period.
              </v-tooltip>
            </v-btn>
          </v-col>
          <v-col cols="3" class="ps-2 px-0 py-0">
            <div class="flex">
              <v-radio-group v-model="dynamik" hide-details >
                <v-checkbox label="Dynamik" density="compact" hide-details=""></v-checkbox>
              </v-radio-group>
              <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
                <v-icon size="small">mdi-information-outline</v-icon>
                <v-tooltip activator="parent" location="end" class="w-50">
                  This parameter defines the percentage by which the monthly savings rate annually increases.

                  Using this parameter, it is possible to simulate a dynamic savings rate, for instance, to compensatethe inflation rate between 1% and 3%. 
                  If no savings rate is specified, this field will be irrelevant for the outcome of the calculation.
                </v-tooltip>
              </v-btn>
            </div>
            <v-text-field
                v-if="dynamik"
                variant="outlined"
                suffix="%"
                density="compact"
                v-model="sparInput.dynamicSavingRateFactor"
                hide-details
                type="number"
                step="1"
            ></v-text-field>
          </v-col>
          <v-col cols="1" class="px-0 py-0">

          </v-col>
        </v-row>

        <!-- Sparzins Radio Button -->

          <v-row class="py-0 ps-5">
            <v-col cols="auto" class="flex px-0 py-0">
              <v-radio label="Sparzins" value="sparen/interest-rate" density="compact"></v-radio>
            </v-col>
          </v-row>

        <!-- Sparzins Form -->

          <v-row class="px-5">
             <!--Sparzins response slot-->
            <v-col v-if="sparInput.endpoint=='sparen/interest-rate'" class="flex ps-2 px-0"  offset="1">
            <v-card 
            v-text="props.apiResponseSparen?props.apiResponseSparen.interestRate:''" 
            class="text-center w-100 ma-auto" 
            height="40"
            variant="outlined"
            :color="props.apiResponseSparen?'#4195AC?':''"></v-card>
            </v-col>
            <!--Sparzins input field-->
            <v-col v-else class="flex ps-2 px-0" offset="1">
              <v-text-field
                  suffix="%"
                  variant="outlined"
                  density="compact"
                  v-model="sparInput.interestRate"
                  required
                  hide-details
                  placeholder="Sparzins"
                  type="number"
                  step="1"
                  :disabled="sparInput.endpoint==''||sparInput.endpoint=='sparen/interest-rate'"
              ></v-text-field>
              <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
                <v-icon size="small">mdi-information-outline</v-icon>
                <v-tooltip activator="parent" location="end" class="w-50">
                  This parameter determines the interest rate for calculations in financial mathematics.
                </v-tooltip>
              </v-btn>
            </v-col>
            <v-col cols="1" class="px-0 py-0">

            </v-col>
          </v-row>

        <!--Entnahme Form Start-->

        <!-- Switchdate Radio Button -->

        <v-row class="py-0 ps-5">
            <v-col cols="auto" class="flex px-0 py-0">
              <v-radio disabled label="Entnahmebeginn" value="sparen/end-date" density="compact"></v-radio>
            </v-col>
          </v-row>


        <!-- Switchdate Form -->
          <v-row class="px-5">
            <!--Switchdate response slot-->
            <v-col v-if="sparInput.endpoint=='sparen/end-date'" class="flex ps-2 px-0"  offset="1">
            <v-card 
            v-text="props.apiResponseSparen?props.apiResponseSparen.end:''" 
            class="text-center w-100 ma-auto" 
            height="40"
            variant="outlined"
            :color="props.apiResponseSparen?'#4195AC?':''"></v-card>
            </v-col>
            <!--Switchdate input field-->
            <v-col v-else class="flex ps-2 px-0" offset="1">
              <v-text-field
                  variant="outlined"
                  density="compact"
                  v-model="sparInput.end"
                  required
                  hide-details
                  type="date"
                  :disabled="sparInput.endpoint==''||sparInput.endpoint=='sparen/end-date'"
              ></v-text-field>
              <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
                <v-icon size="small">mdi-information-outline</v-icon>
                <v-tooltip activator="parent" location="end" class="w-50">
                  This parameter defines the end of the saving period and the start of the withdraw period.
                </v-tooltip>
              </v-btn>
            </v-col>
            <v-col cols="1" class="px-0 py-0">

            </v-col>
          </v-row>
        <!-- Entnahmerate Radio Button -->

        <v-row class="py-0 ps-5">
            <v-col cols="auto" class="flex px-0 py-0">
              <v-radio label="Entnahmerate" value="entnahme/saving-rate" density="compact"></v-radio>
            </v-col>
          </v-row>


        <!-- Entnahmerate Form -->

          <v-row class="px-5">
            <v-col cols="1" class="px-0">
              <v-icon size="large" @click="toggleEntnahmeplan">{{ iconEntnahmeplan }}</v-icon>
            </v-col>

            <!--Entnahmerate response slot-->
            <v-col v-if="sparInput.endpoint=='entnahme/saving-rate'" class="flex ps-2 pa-0">
            <v-card 
            v-text="props.apiResponseSparen?props.apiResponseSparen.savingRate:''" 
            class="text-center w-100 ma-auto" 
            height="40"
            variant="outlined"
            :color="props.apiResponseSparen?'#4195AC?':''"></v-card>
          </v-col>

          <!--Entnahmerate input field-->
            <v-col v-else class="flex ps-2 px-0">
              <v-text-field
                  variant="outlined"
                  prefix="€"
                  density="compact"
                  v-model="entnahmeInput.savingRate"
                  required
                  hide-details
                  placeholder="Entnahmerate"
                  type="number"
                  step="0.01"
                  :disabled="sparInput.endpoint==''||sparInput.endpoint=='entnahme/saving-rate'"
              ></v-text-field>
              <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
                <v-icon size="small">mdi-information-outline</v-icon>
                <v-tooltip activator="parent" location="end" class="w-50">
                  This parameter specifies the monthly withdraws rate.
                </v-tooltip>
              </v-btn>
            </v-col>
            <v-col cols="1" class="px-0 py-0">

            </v-col>
          </v-row>

        <!-- Entnahmerate Detail-Ansicht -->

        <v-row class="px-5" v-if="entnahmeplanDetails">
          <v-col cols="1">

          </v-col>
          <v-col class="flex ps-2 px-0">
            <v-text-field
                label="Startdatum"
                variant="outlined"
                density="compact"
                v-model="entnahmeInput.savingPlanBegin"
                hide-details
                type="date"
            ></v-text-field>
            <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
              <v-icon size="small">mdi-information-outline</v-icon>
              <v-tooltip activator="parent" location="end" class="w-50">
                This parameter defines the begin of the optional withdraws plan. If no date is specified, the withdraws rate is applied for the total investment period.
              </v-tooltip>
            </v-btn>
          </v-col>
          <v-col class="flex ps-2 px-0">
            <v-text-field
                label="Enddatum"
                variant="outlined"
                density="compact"
                v-model="entnahmeInput.savingPlanEnd"
                hide-details
                type="date"
                min="sparplan"
            ></v-text-field>
            <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
              <v-icon size="small">mdi-information-outline</v-icon>
              <v-tooltip activator="parent" location="end" class="w-50">
                This parameter defines the end of the optional withdraws plan. If no date is specified, the withdraws rate is applied for the total investment period.
              </v-tooltip>
            </v-btn>
          </v-col>
          <v-col cols="3" class="ps-2 px-0 py-0">
            <div class="flex">
              <v-radio-group v-model="dynamik" hide-details >
                <v-checkbox label="Dynamik" density="compact" hide-details=""></v-checkbox>
              </v-radio-group>
              <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
                <v-icon size="small">mdi-information-outline</v-icon>
                <v-tooltip activator="parent" location="end" class="w-50">
                  This parameter defines the percentage by which the monthly withdraws rate annually increases.

                  Using this parameter, it is possible to simulate a dynamic withdraws rate, for instance, to compensatethe inflation rate between 1% and 3%. 
                  If no withdraws rate is specified, this field will be irrelevant for the outcome of the calculation.
                </v-tooltip>
              </v-btn>
            </div>
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
          </v-col>
          <v-col cols="1" class="px-0 py-0">

          </v-col>
        </v-row>

        <!-- Entnahmezins Radio Button -->

          <v-row class="py-0 ps-5">
            <v-col cols="auto" class="flex px-0 py-0">
              <v-radio disabled label="Entnahmezins" value="entnahme/interest-rate" density="compact"></v-radio>
            </v-col>
          </v-row>

        <!-- Entnahmezins Form -->

          <v-row class="px-5">
             <!--Entnahmezins response slot-->
            <v-col v-if="sparInput.endpoint=='entnahme/interest-rate'" class="flex ps-2 px-0"  offset="1">
            <v-card 
            v-text="props.apiResponseSparen?props.apiResponseSparen.interestRate:''" 
            class="text-center w-100 ma-auto" 
            height="40"
            variant="outlined"
            :color="props.apiResponseSparen?'#4195AC?':''"></v-card>
            </v-col>
            <!--Entnahmezins input field-->
            <v-col v-else class="flex ps-2 px-0" offset="1">
              <v-text-field
                  suffix="%"
                  variant="outlined"
                  density="compact"
                  v-model="entnahmeInput.interestRate"
                  required
                  hide-details
                  placeholder="Entnahmezins"
                  type="number"
                  step="1"
                  :disabled="sparInput.endpoint==''||sparInput.endpoint=='entnahme/interest-rate'"
              ></v-text-field>
              <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
                <v-icon size="small">mdi-information-outline</v-icon>
                <v-tooltip activator="parent" location="end" class="w-50">
                  This parameter determines the interest rate for calculations in financial mathematics.
                </v-tooltip>
              </v-btn>
            </v-col>
            <v-col cols="1" class="px-0 py-0">

            </v-col>
          </v-row>

        <!-- Enddatum Radio Button -->

          <v-row class="py-0 ps-5">
            <v-col cols="auto" class="flex px-0 py-0">
              <v-radio label="Enddatum" value="entnahme/end-date" density="compact"></v-radio>
            </v-col>
          </v-row>


        <!-- Enddatum Form -->
          <v-row class="px-5">
            <!--Enddate response slot-->
            <v-col v-if="sparInput.endpoint=='entnahme/end-date'" class="flex ps-2 px-0"  offset="1">
            <v-card 
            v-text="props.apiResponseSparen?props.apiResponseSparen.end:''" 
            class="text-center w-100 ma-auto" 
            height="40"
            variant="outlined"
            :color="props.apiResponseSparen?'#4195AC?':''"></v-card>
            </v-col>
            <!--Enddate input field-->
            <v-col v-else class="flex ps-2 px-0" offset="1">
              <v-text-field
                  variant="outlined"
                  density="compact"
                  v-model="entnahmeInput.end"
                  required
                  hide-details
                  type="date"
                  :disabled="sparInput.endpoint==''||sparInput.endpoint=='entnahme/end-date'"
              ></v-text-field>
              <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
                <v-icon size="small">mdi-information-outline</v-icon>
                <v-tooltip activator="parent" location="end" class="w-50">
                  This parameter defines the end of the investment period.
                </v-tooltip>
              </v-btn>
            </v-col>
            <v-col cols="1" class="px-0 py-0">

            </v-col>
          </v-row>

        <!-- Endkapital Radio Button -->

          <v-row class="py-0 ps-5">
            <v-col cols="auto" class="flex px-0 py-0">
              <v-radio label="Endkapital" value="entnahme/capital" density="compact"></v-radio>
            </v-col>
          </v-row>

        <!-- Endkapital Form -->

          <v-row class="px-5 pb-2">
            <!--Endkapital response slot-->
            <v-col v-if="sparInput.endpoint=='entnahme/capital'" class="flex ps-2 px-0"  offset="1">
            <v-card 
            v-text="props.apiResponseSparen?props.apiResponseSparen.capitalResult.capitalAmount:''" 
            class="text-center w-100 ma-auto justify-center" 
            height="40"
            variant="outlined"
            :color="props.apiResponseSparen?'#4195AC?':''"></v-card>
            </v-col>
            <!--Endkapital input field-->
            <v-col v-else class="flex ps-2 px-0" offset="1">
              <v-text-field
                  variant="outlined"
                  prefix="€"
                  density="compact"
                  v-model="entnahmeInput.endValue"
                  hide-details
                  placeholder="Endkapital"
                  type="number"
                  step="0.01"
                  :disabled="sparInput.endpoint==''||sparInput.endpoint=='capital'"
              ></v-text-field>
              <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
                <v-icon size="small">mdi-information-outline</v-icon>
                <v-tooltip activator="parent" location="end" class="w-50">
                  This parameter specifies the desired capital that should be available at the end of the investment period.
                </v-tooltip>
              </v-btn>
            </v-col>
            <v-col cols="1" class="px-0 py-0">

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
            @click="emitData">
          Berechnen
        </v-btn>


    </div>
  </v-form>
</template>

<style scoped>
.v-input{
  line-height: unset;
}
</style>

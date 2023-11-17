<script lang="ts" setup>
import {watch} from 'vue';
import {
  todayDate,
  inTenYears,
  validateInput,
  setEndDateToBiggestDate
} from '~/utils/formUtils'

const emit = defineEmits<{
  (e: "calculateInput", sparplanInput: {}): void;
}>();

const einmalZahlung = ref(0);
const dynamik = ref(false);


// form data (user input)
const sparplanInput = reactive({
  begin: todayDate,
  end: "",
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

// change endpoint
function changeEndpoint() {
  // reset fields
  sparplanInput.oneTimeInvestment = [0];
  sparplanInput.oneTimeInvestmentDate = [todayDate];

  sparplanInput.end = (sparplanInput.endpoint === "end-date") ? "" : inTenYears;
  sparplanInput.savingPlanBegin = sparplanInput.begin
  sparplanInput.savingPlanEnd = sparplanInput.end;

  sparplanInput.interestRate = 0;
  sparplanInput.savingRate = 0;
  sparplanInput.endValue = 0;

  einmalZahlung.value = 0;
  dynamik.value = false;
}

// get form data (user input)
function emitData() {
  const toSend = JSON.parse(JSON.stringify(sparplanInput))
  validateInput(toSend);
  emit("calculateInput", toSend);
}

watch(() => sparplanInput.oneTimeInvestmentDate, () => {
  setEndDateToBiggestDate(sparplanInput)
}, {deep: true})

watch(() => sparplanInput.end, () => {
  setEndDateToBiggestDate(sparplanInput)
})

watch(() => sparplanInput.savingPlanEnd, () => {
  setEndDateToBiggestDate(sparplanInput)
  if (new Date(sparplanInput.savingPlanEnd) < new Date(sparplanInput.savingPlanStart))
    sparplanInput.savingPlanEnd = sparplanInput.savingPlanStart
})
</script>

<template>

  <h3 class="font-bold py-3">Was möchten Sie berechnen?</h3>
  <v-form>
    <div>
      <v-radio-group
          v-model="sparplanInput.endpoint"
          @update:model-value="changeEndpoint">

        <!-- Startkapital Radio Button -->
        <div class="d-flex flex-row">
          <v-radio label="Startkapital" value="saving-start-value" density="compact"></v-radio>
          <v-btn icon elevation="0" flat>
            <v-icon>mdi-information</v-icon>
            <v-tooltip activator="parent" location="top" class="w-50">
              This parameter defines any number of one-time cash in- and outflows.
              Positive investment amounts are interpreted as cash inflows and negative investment amounts as cash
              outflows.
              Default date for first cash inflow (start capital) is today.
            </v-tooltip>
          </v-btn>
        </div>

        <!-- Startkapital Form -->
        <v-container class="px-0 py-0">
          <v-row class="gap-x-3 ps-5">
            <v-col cols="5" class="px-0">
              <v-text-field
                  label="1. Einmalzahlung"
                  variant="outlined"
                  prefix="€"
                  v-model="sparplanInput.oneTimeInvestment[0]"
                  required
                  hide-details
                  type="number"
                  step="0.01"
                  :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='saving-start-value'"
              ></v-text-field>
            </v-col>
            <v-col cols="5" class="px-0">
              <v-text-field
                  label="Startdatum"
                  variant="outlined"
                  v-model="sparplanInput.oneTimeInvestmentDate[0]"
                  hide-details
                  type="date"
                  :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='saving-start-value'"
              ></v-text-field>
            </v-col>
            <v-col cols="1" class="px-0">

            </v-col>
          </v-row>

          <!-- Startkapital Detail-Ansicht -->
          <v-row v-for="n in einmalZahlung" class="gap-x-3 ps-5">
            <v-col cols="5" class="px-0">
              <v-text-field
                  prefix="€"
                  :label="`${n + 1}. Einmalzahlung`"
                  variant="outlined"
                  density="compact"
                  v-model="sparplanInput.oneTimeInvestment[n]"
                  hide-details
                  placeholder="weitere Einmalzahlung"
                  type="number"
                  :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='saving-start-value'"
              ></v-text-field>
            </v-col>
            <v-col cols="5" class="px-0">
              <v-text-field
                  :label="`${n + 1}. Datum`"
                  variant="outlined"
                  density="compact"
                  v-model="sparplanInput.oneTimeInvestmentDate[n]"
                  hide-details
                  type="date"
                  :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='saving-start-value'"
              ></v-text-field>
            </v-col>
            <v-col cols="1" class="px-0 d-flex align-center justify-start">
              <v-icon
                  @click="()=>{einmalZahlung>0?einmalZahlung--:einmalZahlung=0;sparplanInput.oneTimeInvestment.pop();sparplanInput.oneTimeInvestmentDate.pop()}"
                  :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='saving-start-value'||einmalZahlung<=0"
              >
                mdi-trash-can-outline
              </v-icon>
            </v-col>
          </v-row>

          <!-- Button Neue Einmalzahlung -->
          <v-row class="ps-5 py-2 my-0">
            <v-btn
                @click="()=>einmalZahlung++"
                :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='saving-start-value'"
                rounded="lg"
                variant="tonal"
                color="#4195AC"
                text="Neue Einmalzahlung"
                prepend-icon="mdi-plus-circle-outline"
                class="text-none"
            >
            </v-btn>
          </v-row>
        </v-container>

        <!-- Startkapital Radio Button -->
        <div class="d-flex flex-row">
          <v-radio label="Sparrate" value="saving-rate" density="compact"></v-radio>
          <v-btn icon elevation="0" flat>
            <v-icon>mdi-information</v-icon>
            <v-tooltip activator="parent" location="end" class="w-50">
              This parameter specifies the monthly savings rate.
            </v-tooltip>
          </v-btn>
        </div>

        <!-- Sparrate Form -->

        <v-container class="px-0 py-0">
          <v-row class="gap-x-3 ps-5">
            <v-col cols="5" class="px-0">
              <v-text-field
                  variant="outlined"
                  prefix="€"
                  density="compact"
                  v-model="sparplanInput.savingRate"
                  required
                  hide-details
                  placeholder="Sparrate"
                  type="number"
                  step="0.01"
                  :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='saving-rate'"
              ></v-text-field>
            </v-col>
            <v-col cols="5" class="px-0">

            </v-col>
            <v-col cols="1" class="px-0">

            </v-col>
          </v-row>

        <!-- Sparrate Detail-Ansicht -->
        <v-row class="gap-x-3 ps-5">
          <v-col cols="auto" class="px-0">
            <v-text-field
                label="Startdatum"
                variant="outlined"
                density="compact"
                v-model="sparplanInput.savingPlanBegin"
                hide-details
                type="date"
                :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='saving-rate'"
            ></v-text-field>
          </v-col>
          <v-col cols="auto" class="px-0">
            <v-text-field
                label="Enddatum"
                variant="outlined"
                density="compact"
                v-model="sparplanInput.savingPlanEnd"
                hide-details
                type="date"
                min="sparplan"
                :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='saving-rate'"
            ></v-text-field>
          </v-col>
          <v-col cols="auto" class="px-0">
            <v-radio-group v-model="dynamik" class="pa-0 ma-0" hide-details
                           :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='saving-rate'">
              <v-checkbox label="Dynamik" hide-details=""></v-checkbox>
            </v-radio-group>
            <v-text-field
                v-if="dynamik"
                suffix="%"
                density="compact"
                v-model="sparplanInput.dynamicSavingRateFactor"
                hide-details
                placeholder="Dynamik"
                type="number"
                step="1"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row class="my-0">
          <v-col cols="1" class="pa-0">
          </v-col>
          <v-col class="pa-0">

          </v-col>
        </v-row>
        </v-container>

        <!-- Sparzins Radio Button -->
        <div class="d-flex flex-row">
          <v-radio label="Sparzins" value="interest-rate" density="compact"></v-radio>
          <v-btn icon elevation="0" flat>
            <v-icon>mdi-information</v-icon>
            <v-tooltip activator="parent" location="end" class="w-50">
              This parameter determines the interest rate or interest rates for calculations in financial mathematics.
              Either a constant interest rate over the entire investment period or interest rates that vary annually
              can be used.
              If several interest rates are entered, the first rate applies to the first year, the second to the
              second year, etc. For example,
              if three interest rates are specified for an investment period of five years, the third interest rate
              applies from the third year of the investment period onward.
            </v-tooltip>
          </v-btn>
        </div>

        <!-- Sparzins Form -->

        <v-container class="px-0 py-0">
          <v-row class="gap-x-3 ps-5">
            <v-col cols="11" class="px-0">
              <v-text-field
                  suffix="%"
                  variant="outlined"
                  density="compact"
                  v-model="sparplanInput.interestRate"
                  required
                  hide-details
                  placeholder="Sparzins"
                  type="number"
                  step="1"
                  :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='interest-rate'"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>

        <!-- Enddatum Radio Button -->

        <div class="d-flex flex-row">
          <v-radio label="Enddatum" value="end-date" density="compact"></v-radio>
          <v-btn icon elevation="0" flat>
            <v-icon>mdi-information</v-icon>
            <v-tooltip activator="parent" location="end" class="w-50">
              This parameter defines the end of the investment period.
              Default is 10 years from today.
            </v-tooltip>
          </v-btn>
        </div>

        <!-- Enddatum Form -->
        <v-container class="px-0 py-0">
          <v-row class="gap-x-3 ps-5">
            <v-col cols="11" class="px-0">
              <v-text-field
                  variant="outlined"
                  density="compact"
                  v-model="sparplanInput.end"
                  required
                  hide-details
                  type="date"
                  :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='end-date'"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>

        <!-- Endkapital Radio Button -->

        <div class="d-flex flex-row">
          <v-radio label="Endkapital" value="capital" density="compact"></v-radio>
          <v-btn icon elevation="0" flat>
            <v-icon>mdi-information</v-icon>
            <v-tooltip activator="parent" location="end" class="w-50">
              This parameter specifies the desired capital that should be available at the end of the investment
              period.
            </v-tooltip>
          </v-btn>
        </div>

        <!-- Endkapital Form -->

        <v-container class="px-0 py-0">
          <v-row class="gap-x-3 ps-5 pb-2">
            <v-col cols="11" class="px-0">
              <v-text-field
                  variant="outlined"
                  prefix="€"
                  density="compact"
                  v-model="sparplanInput.endValue"
                  hide-details
                  placeholder="Endkapital"
                  type="number"
                  step="0.01"
                  :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='capital'"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-radio-group>

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

<!-- Zahl- und Datumsfeld gleiche Größe -->
<style scoped>
.v-input{
  line-height: unset;
}
</style>

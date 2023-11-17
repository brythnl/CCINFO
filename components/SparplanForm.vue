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
const startkapitalDetails = ref(false);
const sparplanDetails = ref(false);
const toggleIcon = ref("mdi-chevron-down");


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

function toggleStartkapital(){
  if(startkapitalDetails.value==false){
    startkapitalDetails.value = true;
    toggleIcon.value = "mdi-chevron-up";
  }
  else{
    startkapitalDetails.value = false;
    toggleIcon.value = "mdi-chevron-down";
  }
}

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

  <h3 class="font-bold pb-5">Was möchten Sie berechnen?</h3>
  <v-form>
    <div>
      <v-radio-group
          v-model="sparplanInput.endpoint"
          @update:model-value="changeEndpoint">

        <v-container class="px-0 py-0">
          <!-- Startkapital Radio Button -->
          <v-row class="py-0 ps-5">
            <v-col cols="auto" class="flex px-0 py-0">
                <v-radio label="Startkapital" value="saving-start-value" density="compact"></v-radio>
            </v-col>
          </v-row>


        <!-- Startkapital Form -->
          <v-row class="gap-x-3 ps-5">
            <v-col cols="auto" class="px-0">
              <v-icon @click="toggleStartkapital">{{ toggleIcon }}</v-icon>
            </v-col>
            <v-col cols="5" class="flex px-0">
              <v-text-field
                  label="1. Einmalzahlung"
                  variant="outlined"
                  density="compact"
                  prefix="€"
                  v-model="sparplanInput.oneTimeInvestment[0]"
                  required
                  hide-details
                  type="number"
                  step="0.01"
                  :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='saving-start-value'"
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
            <v-col v-if="startkapitalDetails" cols="5" class="flex px-0">
              <v-text-field
                  label="Startdatum"
                  variant="outlined"
                  density="compact"
                  v-model="sparplanInput.oneTimeInvestmentDate[0]"
                  hide-details
                  type="date"
                  :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='saving-start-value'"
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
          </v-row>

          <!-- Startkapital Detail-Ansicht -->
          <v-row v-if="startkapitalDetails" v-for="n in einmalZahlung" class="gap-x-3 ps-5">
            <v-col cols="5" class="flex px-0">
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
            <v-col cols="5" class="flex px-0">
              <v-text-field
                  :label="`${n + 1}. Datum`"
                  variant="outlined"
                  density="compact"
                  v-model="sparplanInput.oneTimeInvestmentDate[n]"
                  hide-details
                  type="date"
                  :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='saving-start-value'"
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
          <v-row v-if="startkapitalDetails" class="ps-5 py-2 my-0">
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

        <!-- Sparrate Radio Button -->

          <v-row class="py-0 ps-5">
            <v-col cols="auto" class="flex px-0 py-0">
              <v-radio label="Sparrate" value="saving-rate" density="compact"></v-radio>
            </v-col>
          </v-row>


        <!-- Sparrate Form -->

          <v-row class="gap-x-3 ps-5">
            <v-col cols="5" class="flex px-0">
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
            <v-col cols="5" class="px-0">

            </v-col>
            <v-col cols="1" class="px-0">

            </v-col>
          </v-row>

        <!-- Sparrate Detail-Ansicht -->
        <v-row class="gap-x-3 ps-5">
          <v-col cols="auto" class="flex px-0">
            <v-text-field
                label="Startdatum"
                variant="outlined"
                density="compact"
                v-model="sparplanInput.savingPlanBegin"
                hide-details
                type="date"
                :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='saving-rate'"
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
          <v-col cols="auto" class="flex px-0">
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
          <v-col cols="auto" class="flex px-0">
            <v-radio-group v-model="dynamik" class="pa-0 ma-0" hide-details
                           :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='saving-rate'">
              <v-checkbox label="Dynamik" hide-details=""></v-checkbox>
            </v-radio-group>
            <v-btn icon elevation="0" variant="plain" height="auto" width="auto" class="ps-2">
              <v-icon size="small">mdi-information-outline</v-icon>
              <v-tooltip activator="parent" location="end" class="w-50">
                This parameter defines any number of one-time cash in- and outflows.
                Positive investment amounts are interpreted as cash inflows and negative investment amounts as cash
                outflows.
                Default date for first cash inflow (start capital) is today.
              </v-tooltip>
            </v-btn>
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

        <!-- Sparzins Radio Button -->

          <v-row class="py-0 ps-5">
            <v-col cols="auto" class="flex px-0 py-0">
              <v-radio label="Sparzins" value="interest-rate" density="compact"></v-radio>
            </v-col>
          </v-row>

        <!-- Sparzins Form -->

          <v-row class="gap-x-3 ps-5">
            <v-col cols="11" class="flex px-0">
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
          </v-row>

        <!-- Enddatum Radio Button -->

          <v-row class="py-0 ps-5">
            <v-col cols="auto" class="flex px-0 py-0">
              <v-radio label="Enddatum" value="end-date" density="compact"></v-radio>
            </v-col>
          </v-row>


        <!-- Enddatum Form -->
          <v-row class="gap-x-3 ps-5">
            <v-col cols="11" class="flex px-0">
              <v-text-field
                  variant="outlined"
                  density="compact"
                  v-model="sparplanInput.end"
                  required
                  hide-details
                  type="date"
                  :disabled="sparplanInput.endpoint==''||sparplanInput.endpoint=='end-date'"
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
          </v-row>

        <!-- Endkapital Radio Button -->

          <v-row class="py-0 ps-5">
            <v-col cols="auto" class="flex px-0 py-0">
              <v-radio label="Endkapital" value="capital" density="compact"></v-radio>
            </v-col>
          </v-row>

        <!-- Endkapital Form -->

          <v-row class="gap-x-3 ps-5 pb-2">
            <v-col cols="11" class="flex px-0">
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

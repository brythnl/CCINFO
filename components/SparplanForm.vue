<script lang="ts" setup>
import {
  todayDate,
  inTenYears,
  formatNumber,
  findSmallestDate,
  findBiggestDate
} from '~/utils/formUtils'

const emit = defineEmits<{
  (e: "calculateInput", sparplanInput: {}): void;
}>();

const selectedEndpoint = ref("")
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
function changeEndpoint(){
  sparplanInput.endpoint = selectedEndpoint.value;

  // reset fields
  sparplanInput.oneTimeInvestment = [0];
  sparplanInput.oneTimeInvestmentDate = [todayDate];

  sparplanInput.end = (sparplanInput.endpoint === "enddate") ? "" : inTenYears;
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
  validateInput();
  emit("calculateInput", sparplanInput);
}

function validateInput(): void {
  // Set decimal separator to dot and make numbers to integer
  sparplanInput.endValue = Math.round(formatNumber(sparplanInput.endValue) * 100);
  sparplanInput.savingRate = Math.round(formatNumber(sparplanInput.savingRate) * 100);
  sparplanInput.interestRate= formatNumber(sparplanInput.interestRate) * 0.01;
  sparplanInput.dynamicSavingRateFactor = formatNumber(sparplanInput.dynamicSavingRateFactor) * 0.01;
  sparplanInput.oneTimeInvestment= sparplanInput.oneTimeInvestment.map(investment => Math.round(formatNumber(investment) * 100))
  // Date validation
  sparplanInput.begin = findSmallestDate(sparplanInput.oneTimeInvestmentDate)
}

function setEndDateToBiggestDate(): void {
  if (sparplanInput.endpoint == 'enddate') return;
  let tmp: string[] = (JSON.parse(JSON.stringify(sparplanInput.oneTimeInvestmentDate)))
  tmp.push(JSON.parse(JSON.stringify(sparplanInput.savingPlanEnd)))
  sparplanInput.end = findBiggestDate(tmp)
}

watch(() => sparplanInput.oneTimeInvestmentDate, () => {
    setEndDateToBiggestDate()
}, { deep:true })

watch(() => sparplanInput.end, () => {
    let tmp: string[] = (JSON.parse(JSON.stringify(sparplanInput.oneTimeInvestmentDate)))
    tmp.push(JSON.parse(JSON.stringify(sparplanInput.savingPlanEnd)))
    let biggestDate: string = findBiggestDate(tmp);
    if(new Date(sparplanInput.end) < new Date(biggestDate) && sparplanInput.end[0]!=='0'){
      sparplanInput.end = biggestDate;
    }
})
</script>

<template>
  <p>Was möchten Sie berechnen ?</p>
  <v-form>
    <v-container>
      <v-radio-group
        v-model="selectedEndpoint"
        @update:model-value="changeEndpoint">

        <v-expansion-panels>

          <v-expansion-panel
          elevation="0"
          bg-color="#F1F9FF">
                <v-row class="ma-0">
                  <v-col cols="6">
                    <v-radio label="1. Einmalzahlung (Startkapital)" value="startcapital"></v-radio>
                  </v-col>
                  <v-col>
                    <v-btn style="background-color: inherit;" flat>
                    <v-avatar>
                        <v-img src="~/assets/Information-Icon.png"></v-img>
                    </v-avatar>
                    <v-tooltip activator="parent" location="end" class="w-50">
                      This parameter defines any number of one-time cash in- and outflows.
                      Positive investment amounts are interpreted as cash inflows and negative investment amounts as cash outflows.
                      Default date for first cash inflow (start capital) is today.
                    </v-tooltip>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row class="my-0">
                  <v-col cols="1" class="pa-0">
                    <v-expansion-panel-title class="pa-0">
                    </v-expansion-panel-title>
                  </v-col>
                  <v-col class="pa-0" cols="6">
                    <v-text-field
                      prefix="€"
                      style="border: 3px solid #00476B;"
                      density="compact"
                      v-model="sparplanInput.oneTimeInvestment[0]"
                      required
                      hide-details
                      placeholder="Startkapital"
                      type="number"
                      step="0.01"
                      class="bg-white rounded"
                      :disabled="selectedEndpoint==''||selectedEndpoint=='startcapital'"
                    ></v-text-field>
                  </v-col>
                  <v-col class="pa-0 ms-2">
                    <v-text-field
                      style="border: 3px solid #00476B;"
                      density="compact"
                      v-model="sparplanInput.oneTimeInvestmentDate[0]"
                      hide-details
                      type="date"
                      class="bg-white rounded"
                      :disabled="selectedEndpoint==''||selectedEndpoint=='startcapital'"
                    ></v-text-field>
                  </v-col>
                </v-row>
            <v-expansion-panel-text>
              <v-row v-for="n in einmalZahlung" class="ma-0">
                <v-row class="ma-0">
                  <v-col class="pa-0">
                    <v-label>{{ n+1 }}.te Einmalzahlung</v-label>
                  </v-col>
                  <v-col class="pa-0">
                    <v-label>Datum</v-label>
                  </v-col>
                </v-row>
                <v-row class="my-0">
                  <v-col class="pa-0">
                    <v-text-field
                      prefix="€"
                      style="border: 3px solid #00476B;"
                      density="compact"
                      v-model="sparplanInput.oneTimeInvestment[n]"
                      hide-details
                      placeholder="weitere Einmalzahlung"
                      type="number"
                      class="bg-white rounded"
                      :disabled="selectedEndpoint==''||selectedEndpoint=='startcapital'"
                    ></v-text-field>
                  </v-col>
                  <v-col class="pa-0">
                    <v-text-field
                      style="border: 3px solid #00476B;"
                      density="compact"
                      v-model="sparplanInput.oneTimeInvestmentDate[n]"
                      hide-details
                      type="date"
                      class="bg-white rounded"
                      :disabled="selectedEndpoint==''||selectedEndpoint=='startcapital'"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-row>
                <v-btn-group
                density="compact"
                variant="tonal"
                class="w-100 mt-2"
                divided>
                  <v-btn
                  style="border: solid 2px black;"
                  @click="()=>einmalZahlung++"
                  :disabled="selectedEndpoint==''||selectedEndpoint=='startcapital'"
                  variant="flat"
                  width="200"
                  stacked
                  class="pa-0"
                  text="Neue Einmalzahlung hinzufügen"
                  color="#1B7694">

                  </v-btn>
                  <v-btn
                  style="border: solid 2px black;"
                  @click="()=>{einmalZahlung>0?einmalZahlung--:einmalZahlung=0;sparplanInput.oneTimeInvestment.pop();sparplanInput.oneTimeInvestmentDate.pop()}"
                  :disabled="selectedEndpoint==''||selectedEndpoint=='startcapital'||einmalZahlung<=0"
                  variant="flat"
                  width="200"
                  stacked
                  class="pa-0 mx-5"
                  text=" Einmalzahlung entfernen"
                  color="#B2B2B2">
                  </v-btn>
                </v-btn-group>
              </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-expansion-panels>
          <v-expansion-panel
          elevation="0"
          bg-color="#F1F9FF">
                <v-row class="ma-0">
                  <v-col>
                    <v-radio label="Sparrate" value="savingrate">
                    </v-radio>
                  </v-col>
                  <v-col>
                    <v-btn style="background-color: inherit;" flat>
                      <v-avatar class="ma-auto">
                          <v-img src="~/assets/Information-Icon.png"></v-img>
                      </v-avatar>
                      <v-tooltip activator="parent" location="end" class="w-50">
                        This parameter specifies the monthly savings rate.
                      </v-tooltip>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row class="my-0">
                  <v-col cols="1" class="pa-0">
                    <v-expansion-panel-title class="pa-0">
                    </v-expansion-panel-title>
                  </v-col>
                  <v-col class="pa-0">
                    <v-text-field
                      prefix="€"
                      style="border: 3px solid #00476B;"
                      density="compact"
                      v-model="sparplanInput.savingRate"
                      required
                      hide-details
                      placeholder="Sparrate"
                      type="number"
                      step="0.01"
                      class="bg-white rounded"
                      :disabled="selectedEndpoint==''||selectedEndpoint=='savingrate'"
                    ></v-text-field>
                  </v-col>
                </v-row>
            <v-expansion-panel-text>
              <v-row>
                <v-col class="pa-0 my-auto ">
                  <v-row>
                    <v-col>
                      <v-label>Startdatum</v-label>
                    </v-col>
                    <v-col class="pa-0">
                      <v-btn style="background-color: inherit;" flat size="20">
                        <v-avatar class="ma-auto">
                            <v-img src="~/assets/Information-Icon.png"></v-img>
                        </v-avatar>
                        <v-tooltip activator="parent" location="end" class="w-50">
                          This parameter defines the begin of the optional savings plan. If no date is specified, the savings rate is applied for the total investment period.
                        </v-tooltip>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col class="pa-0 my-auto">
                  <v-row>
                    <v-col>
                      <v-label>Enddatum</v-label>
                    </v-col>
                    <v-col class="pa-0">
                    <v-btn style="background-color: inherit;" flat size="20">
                      <v-avatar class="ma-auto">
                          <v-img src="~/assets/Information-Icon.png"></v-img>
                      </v-avatar>
                      <v-tooltip activator="parent" location="end" class="w-50">
                        This parameter defines the end of the optional savings plan. If no date is specified, the savings rate is applied for the total investment period.
                      </v-tooltip>
                    </v-btn>
                  </v-col>
                  </v-row>
                </v-col>
                <v-col class="pa-0 my-auto">
                  <v-row class="ma-0">
                    <v-col class="pa-0" cols="9">
                      <v-radio-group v-model="dynamik" class="pa-0 ma-0" hide-details :disabled="selectedEndpoint==''||selectedEndpoint=='savingrate'">
                        <v-checkbox label="Dynamik" hide-details=""></v-checkbox>
                      </v-radio-group>
                    </v-col>
                    <v-col class="pa-0">
                      <v-btn style="background-color: inherit;" flat class="pa-0 mt-1" size="30">
                        <v-avatar class="ma-auto">
                            <v-img src="~/assets/Information-Icon.png"></v-img>
                        </v-avatar>
                        <v-tooltip activator="parent" location="end" class="w-50">
                          This parameter defines the percentage by which the monthly savings rate annually increases.

                            Using this parameter, it is possible to simulate a dynamic savings rate, for instance,
                            to compensatethe inflation rate between 1% and 3%. If no savings rate is specified,
                            this field will be irrelevant for the outcome of the calculation.
                        </v-tooltip>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row class="my-0">
                <v-col class="pa-0" cols="4">
                    <v-text-field
                      style="border: 3px solid #00476B;"
                      density="compact"
                      v-model="sparplanInput.savingPlanBegin"
                      hide-details
                      type="date"
                      class="bg-white rounded"
                      :disabled="selectedEndpoint==''||selectedEndpoint=='savingrate'"
                    ></v-text-field>
                  </v-col>
                  <v-col class="pa-0" cols="4">
                      <v-text-field
                        style="border: 3px solid #00476B;"
                        density="compact"
                        v-model="sparplanInput.savingPlanEnd"
                        hide-details
                        type="date"
                        class="bg-white rounded"
                        :disabled="selectedEndpoint==''||selectedEndpoint=='savingrate'"
                      ></v-text-field>
                  </v-col>
                  <v-col class="pa-0" cols="4">
                      <v-text-field
                        v-if="dynamik"
                        suffix="%"
                        style="border: 3px solid #00476B;"
                        density="compact"
                        v-model="sparplanInput.dynamicSavingRateFactor"
                        hide-details
                        placeholder="Dynamik"
                        type="number"
                        step="1"
                        class="bg-white rounded"
                      ></v-text-field>
                  </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-row class="ma-0">
          <v-col>
          <v-radio label="Sparzins" value="interestrate"></v-radio>
          </v-col>
          <v-col>
            <v-btn style="background-color: inherit;" flat>
              <v-avatar class="ma-auto">
                  <v-img src="~/assets/Information-Icon.png"></v-img>
              </v-avatar>
              <v-tooltip activator="parent" location="end" class="w-50">
                This parameter determines the interest rate or interest rates for calculations in financial mathematics.
                Either a constant interest rate over the entire investment period or interest rates that vary annually can be used.
                If several interest rates are entered, the first rate applies to the first year, the second to the second year, etc. For example,
                if three interest rates are specified for an investment period of five years, the third interest rate applies from the third year of the investment period onward.
              </v-tooltip>
            </v-btn>
          </v-col>
        </v-row>
      <v-row class="ma-0">
        <v-col class="pa-0">
          <v-text-field
            suffix="%"
            style="border: 3px solid #00476B;"
            density="compact"
            v-model="sparplanInput.interestRate"
            required
            hide-details
            placeholder="Sparzins"
            type="number"
            step="1"
            class="bg-white rounded"
            :disabled="selectedEndpoint==''||selectedEndpoint=='interestrate'"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row class="ma-0">
        <v-col>
          <v-radio label="Enddatum" value="enddate"></v-radio>
        </v-col>
        <v-col class="ma-auto">
          <v-btn style="background-color: inherit;" flat>
            <v-avatar class="ma-auto">
                <v-img src="~/assets/Information-Icon.png"></v-img>
            </v-avatar>
            <v-tooltip activator="parent" location="end" class="w-50">
              This parameter defines the end of the investment period.
              Default is 10 years from today.
            </v-tooltip>
          </v-btn>
        </v-col></v-row>
      <v-row class="mx-0">
        <v-col class="pa-0">
          <v-text-field
            style="border: 3px solid #00476B;"
            density="compact"
            v-model="sparplanInput.end"
            required
            hide-details
            type="date"
            class="bg-white rounded"
            :disabled="selectedEndpoint==''||selectedEndpoint=='enddate'"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row class="mx-0">
        <v-col>
          <v-radio label="Endkapital" value="endcapital"></v-radio>
        </v-col>
        <v-col class="ma-auto">
          <v-btn style="background-color: inherit;" flat>
            <v-avatar class="ma-auto">
                <v-img src="~/assets/Information-Icon.png"></v-img>
            </v-avatar>
            <v-tooltip activator="parent" location="end" class="w-50">
              This parameter specifies the desired capital that should be available at the end of the investment period.
            </v-tooltip>
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            prefix="€"
            style="border: 3px solid #00476B;"
            density="compact"
            v-model="sparplanInput.endValue"
            hide-details
            placeholder="Endkapital"
            type="number"
            step="0.01"
            class="bg-white rounded"
            :disabled="selectedEndpoint==''||selectedEndpoint=='endcapital'"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-radio-group>
      <v-row>
        <v-col>
          <v-btn
            block
            class="text-none mb-4"
            color="#00476B"
            size="x-large"
            variant="flat"
            @click="emitData">
            Calculate
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>
<style scoped></style>
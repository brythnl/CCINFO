<script lang="ts" setup>
import { watch } from 'vue';
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

const props=defineProps<{
  apiResponseSparren:financeMathResult,
  apiResponseEntnahme:financeMathResult
}>()

const sparrInput = reactive({
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
  begin: sparrInput.end,
  end: "",
  interestCalculation: "YEARLY",
  interestRate: 0,
  reductionFactor: 0,
  dynamicSavingRateFactor: 0,
  savingPlanBegin: sparrInput.end,
  savingPlanEnd: inTwentyYears,
  oneTimeInvestment: [0],
  oneTimeInvestmentDate: [""],
  savingRate: 0,
  endValue: 0,
  endpoint:""
})


function endPointChange(){
  entnahmeInput.endpoint=sparrInput.endpoint
  //resetting inputs due to change of endpoint
  sparrInput.oneTimeInvestment=[0];
  sparrInput.oneTimeInvestmentDate=[todayDate];
  
  sparrInput.end = (sparrInput.endpoint==="switch-date")?"":inTenYears;
  sparrInput.savingPlanBegin=sparrInput.begin;
  sparrInput.savingPlanEnd= sparrInput.end;
  
  sparrInput.interestRate=0;
  sparrInput.savingRate=0;

  entnahmeInput.oneTimeInvestment=[0];
  entnahmeInput.oneTimeInvestmentDate=[""];

  entnahmeInput.begin = sparrInput.end
  entnahmeInput.end = (sparrInput.endpoint==="end-date")?"":inTwentyYears;
  entnahmeInput.savingPlanBegin=entnahmeInput.begin;
  entnahmeInput.savingPlanEnd= entnahmeInput.end;

  entnahmeInput.savingRate=0;
  entnahmeInput.interestRate=0;
  entnahmeInput.endValue=0;

  einmalZahlung.value=0;
  dynamik.value=false;
}
function emitData() {
  entnahmeInput.begin = sparrInput.end;
  /*
  const sparren = JSON.parse(JSON.stringify(sparrInput));
  const entnahme = JSON.parse(JSON.stringify(entnahmeInput));
  validateInput(sparren);
  validateInput(entnahme);
  emit("calculateInput", [sparren,entnahme]);
  */
  console.log(sparrInput);
 console.log(entnahmeInput);
}

watch(() => sparrInput.oneTimeInvestmentDate, () => {
    setEndDateToBiggestDate(sparrInput)
}, { deep:true })
watch(() => sparrInput.oneTimeInvestmentDate, () => {
    setEndDateToBiggestDate(entnahmeInput)
}, { deep:true })

watch(()=>sparrInput.savingPlanEnd, () =>{
  setEndDateToBiggestDate(sparrInput)
  if(new Date(sparrInput.savingPlanEnd)<new Date(sparrInput.savingPlanStart))
  sparrInput.savingPlanEnd=sparrInput.savingPlanStart
})
watch(()=>entnahmeInput.savingPlanEnd, () =>{
  setEndDateToBiggestDate(entnahmeInput)
  if(new Date(entnahmeInput.savingPlanEnd)<new Date(entnahmeInput.savingPlanStart))
  entnahmeInput.savingPlanEnd=entnahmeInput.savingPlanStart
})

</script>

<template>
  <p>Was möchten Sie berechnen ?</p>
  <v-form>
    <v-container>
      <v-radio-group
        v-model="sparrInput.endpoint"
        @update:model-value="endPointChange">

        <v-expansion-panels>

          <v-expansion-panel 
          elevation="0" 
          bg-color="#F1F9FF">
                <v-row class="ma-0">
                  <v-col cols="6">
                    <v-radio label="1. Einmalzahlung (Startkapital)" value="saving-start-value"></v-radio>
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
                <v-row v-if="sparrInput.endpoint=='saving-start-value'" class="my-0">
                  <v-card v-text="props.apiResponseSparren?props.apiResponseSparren.investmentStart:''" :color="props.apiResponseSparren?'#81C994':''"></v-card>
                </v-row>
                <v-row v-else class="my-0">
                  <v-col cols="1" class="pa-0">
                    <v-expansion-panel-title class="pa-0">
                    </v-expansion-panel-title>
                  </v-col>
                  <v-col class="pa-0" cols="6">
                    <v-text-field
                      prefix="€"
                      style="border: 3px solid #00476B;"
                      density="compact"
                      v-model="sparrInput.oneTimeInvestment[0]"
                      required
                      hide-details
                      placeholder="Startkapital"
                      type="number"
                      step="0.01"
                      class="bg-white rounded"
                      :disabled="sparrInput.endpoint==''||sparrInput.endpoint=='saving-start-value'"
                    ></v-text-field>
                  </v-col>

                  <v-col class="pa-0 ms-2">
                    <v-text-field
                      style="border: 3px solid #00476B;"
                      density="compact"
                      v-model="sparrInput.oneTimeInvestmentDate[0]"
                      hide-details
                      type="date"
                      class="bg-white rounded"
                      :disabled="sparrInput.endpoint==''||sparrInput.endpoint=='saving-start-value'"
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
                      v-model="sparrInput.oneTimeInvestment[n]"
                      hide-details
                      placeholder="weitere Einmalzahlung"
                      type="number"
                      class="bg-white rounded"
                      :disabled="sparrInput.endpoint==''||sparrInput.endpoint=='saving-start-value'"
                    ></v-text-field>
                  </v-col>

                  <v-col class="pa-0">
                    <v-text-field
                      style="border: 3px solid #00476B;"
                      density="compact"
                      v-model="sparrInput.oneTimeInvestmentDate[n]"
                      hide-details
                      type="date"
                      class="bg-white rounded"
                      :disabled="sparrInput.endpoint==''||sparrInput.endpoint=='saving-start-value'"
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
                  :disabled="sparrInput.endpoint==''||sparrInput.endpoint=='saving-start-value'"
                  variant="flat"
                  width="200"
                  stacked
                  class="pa-0"
                  text="Neue Einmalzahlung hinzufügen"
                  color="#1B7694">

                  </v-btn>
                  <v-btn 
                  style="border: solid 2px black;" 
                  @click="()=>{einmalZahlung>0?einmalZahlung--:einmalZahlung=0;sparrInput.oneTimeInvestment.pop();sparrInput.oneTimeInvestmentDate.pop()}" 
                  :disabled="sparrInput.endpoint==''||sparrInput.endpoint=='saving-start-value'||einmalZahlung<=0"
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
                    <v-radio label="Sparrate" value="saving-rate">
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
                  <v-col v-if="sparrInput.endpoint=='saving-rate'" class="pa-0">
                    <v-card v-text="props.apiResponseSparren?props.apiResponseSparren.savingRate:''" :color="props.apiResponseSparren?'#81C994':''"></v-card>
                  </v-col>
                  <v-col v-else class="pa-0">
                    <v-text-field
                      prefix="€"
                      style="border: 3px solid #00476B;"
                      density="compact"
                      v-model="sparrInput.savingRate"
                      required
                      hide-details
                      placeholder="Sparrate"
                      type="number"
                      step="0.01"
                      class="bg-white rounded"
                      :disabled="sparrInput.endpoint==''||sparrInput.endpoint=='saving-rate'"
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
                          This parameter defines the begin of the optional saving plan. If no date is specified, the withdraws rate is applied for the total investment period.
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
                        This parameter defines the end of the optional saving plan. If no date is specified, the saving rate is applied for the total investment period.
                      </v-tooltip>
                    </v-btn>
                  </v-col>
                  </v-row>
                </v-col>
                <v-col class="pa-0 my-auto">
                  <v-row class="ma-0">
                    <v-col class="pa-0" cols="9">
                      <v-radio-group v-model="dynamik" class="pa-0 ma-0" hide-details>
                        <v-checkbox label="Dynamik" hide-details=""></v-checkbox>
                      </v-radio-group>
                    </v-col>
                    <v-col class="pa-0">
                      <v-btn style="background-color: inherit;" flat class="pa-0 mt-1" size="30">
                        <v-avatar class="ma-auto">
                            <v-img src="~/assets/Information-Icon.png"></v-img>
                        </v-avatar>
                        <v-tooltip activator="parent" location="end" class="w-50">
                            This parameter defines the percentage by which the monthly saving rate annually increases.

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
                      v-model="sparrInput.savingPlanBegin"
                      hide-details
                      type="date"
                      class="bg-white rounded"
                    ></v-text-field>
                  </v-col>
                  <v-col class="pa-0" cols="4">
                      <v-text-field
                        style="border: 3px solid #00476B;"
                        density="compact"
                        v-model="sparrInput.savingPlanEnd"
                        hide-details
                        type="date"
                        class="bg-white rounded"
                      ></v-text-field>
                  </v-col>
                  <v-col class="pa-0" cols="4">
                      <v-text-field
                        v-if="dynamik"
                        suffix="%"
                        style="border: 3px solid #00476B;"
                        density="compact"
                        v-model="sparrInput.dynamicSavingRateFactor"
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
          <v-radio label="Sparzins" value="interest-rate"></v-radio>
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
          <v-col v-if="sparrInput.endpoint=='interest-rate'" class="pa-0">
            <v-card v-text="props.apiResponseSparren?props.apiResponseSparren.interestRate:''" :color="props.apiResponseSparren?'#81C994':''"></v-card>
          </v-col>
          <v-col v-else class="pa-0">
            <v-text-field
              suffix="%"
              style="border: 3px solid #00476B;"
              density="compact"
              v-model="sparrInput.interestRate"
              required
              hide-details
              placeholder="Sparzins"
              type="number"
              step="1"
              class="bg-white rounded"
              :disabled="sparrInput.endpoint==''||sparrInput.endpoint=='interest-rate'"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row class="ma-0">
          <v-col>
            <v-radio label="Entnahmebeginn" value="switch-date"></v-radio>
          </v-col>
          <v-col class="ma-auto">
            <v-btn style="background-color: inherit;" flat>
              <v-avatar class="ma-auto">
                  <v-img src="~/assets/Information-Icon.png"></v-img>
              </v-avatar>
              <v-tooltip activator="parent" location="end" class="w-50">
                This parameter defines the end of the investment period
                and the start of the withdrawals period.
                Default is 10 years from today.
              </v-tooltip>
            </v-btn>
          </v-col>
        </v-row>
        <v-row class="ma-0">
          <v-col v-if="sparrInput.endpoint=='switch-date'" class="pa-0">
            <v-card v-text="props.apiResponseSparren?props.apiResponseSparren.end:''" :color="props.apiResponseSparren?'#81C994':''"></v-card>
          </v-col>
          <v-col v-else class="pa-0">      
            <v-text-field
              style="border: 3px solid #00476B;"
              density="compact"
              v-model="sparrInput.end"
              required
              hide-details
              type="date"
              class="bg-white rounded"
              :disabled="sparrInput.endpoint==''||sparrInput.endpoint=='switch-date'"
            ></v-text-field>
          </v-col>
          </v-row>
          
          <v-expansion-panels>
            <v-expansion-panel
            elevation="0" 
            bg-color="#F1F9FF">
                  <v-row class="ma-0">
                    <v-col>
                      <v-radio label="Entnahmerate" value="withdraw-rate">
                      </v-radio>
                    </v-col>
                    <v-col>
                      <v-btn style="background-color: inherit;" flat>
                        <v-avatar class="ma-auto">
                            <v-img src="~/assets/Information-Icon.png"></v-img>
                        </v-avatar>
                        <v-tooltip activator="parent" location="end" class="w-50">
                          This parameter specifies the monthly withdraws rate.
                        </v-tooltip>
                      </v-btn>
                    </v-col>
                  </v-row>

                  <v-row class="my-0">
                    <v-col cols="1" class="pa-0">
                      <v-expansion-panel-title class="pa-0">
                      </v-expansion-panel-title>
                    </v-col>
                    <v-col v-if="sparrInput.endpoint=='withdraw-rate'" class="pa-0">
                      <v-card v-text="props.apiResponseEntnahme?props.apiResponseEntnahme.savingRate:''" :color="props.apiResponseEntnahme?'#81C994':''"></v-card>
                    </v-col>
                    <v-col v-else class="pa-0">
                      <v-text-field
                        prefix="€"
                        style="border: 3px solid #00476B;"
                        density="compact"
                        v-model="entnahmeInput.savingRate"
                        required
                        hide-details
                        placeholder="Entnahmerate"
                        type="number"
                        step="0.01"
                        class="bg-white rounded"
                        :disabled="entnahmeInput.endpoint==''||entnahmeInput.endpoint=='withdraw-rate'"
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
                            This parameter defines the begin of the optional withdraws plan. If no date is specified, the withdraws rate is applied for the total investment period.
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
                          This parameter defines the end of the optional withdraws plan. If no date is specified, the withdraws rate is applied for the total investment period.
                        </v-tooltip>
                      </v-btn>
                    </v-col>
                    </v-row>
                  </v-col>
                  <v-col class="pa-0 my-auto">
                    <v-row class="ma-0">
                      <v-col class="pa-0" cols="9">
                        <v-radio-group v-model="dynamik" class="pa-0 ma-0" hide-details :disabled="entnahmeInput.endpoint==''||entnahmeInput.endpoint=='withdraw-rate'">
                          <v-checkbox label="Dynamik" hide-details=""></v-checkbox>
                        </v-radio-group>
                      </v-col>
                      <v-col class="pa-0">
                        <v-btn style="background-color: inherit;" flat class="pa-0 mt-1" size="30">
                          <v-avatar class="ma-auto">
                              <v-img src="~/assets/Information-Icon.png"></v-img>
                          </v-avatar>
                          <v-tooltip activator="parent" location="end" class="w-50">
                              This parameter defines the percentage by which the monthly withdraws rate annually increases.

                              Using this parameter, it is possible to simulate a dynamic withdraws rate, for instance, 
                              to compensatethe inflation rate between 1% and 3%. If no withdraws rate is specified, 
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
                        v-model="entnahmeInput.savingPlanBegin"
                        hide-details
                        type="date"
                        class="bg-white rounded"
                        :disabled="entnahmeInput.endpoint==''||entnahmeInput.endpoint=='withdraw-rate'"
                      ></v-text-field>
                    </v-col>
                    <v-col class="pa-0" cols="4">
                        <v-text-field
                          style="border: 3px solid #00476B;"
                          density="compact"
                        v-model="entnahmeInput.savingPlanEnd"
                          hide-details
                          type="date"
                          class="bg-white rounded"
                          :disabled="entnahmeInput.endpoint==''||entnahmeInput.endpoint=='withdraw-rate'"
                        ></v-text-field>
                    </v-col>
                    <v-col class="pa-0" cols="4">
                        <v-text-field
                          v-if="dynamik"
                          suffix="%"
                          style="border: 3px solid #00476B;"
                          density="compact"
                          v-model="entnahmeInput.dynamicSavingRateFactor"
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
            <v-radio disabled label="Entnahmezins" value="withdraws-interest-rate"></v-radio>
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
          <v-col v-if="sparrInput.endpoint=='withdraws-interest-rate'" class="pa-0">
            <v-card v-text="props.apiResponseEntnahme?props.apiResponseEntnahme.interestRate:''" :color="props.apiResponseEntnahme?'#81C994':''"></v-card>
          </v-col>
          <v-col v-else class="pa-0">
            <v-text-field
              suffix="%"
              style="border: 3px solid #00476B;"
              density="compact"
              v-model="entnahmeInput.interestRate"
              required
              hide-details
              placeholder="Sparzins"
              type="number"
              step="1"
              class="bg-white rounded"
              :disabled="entnahmeInput.endpoint==''||entnahmeInput.endpoint=='withdraws-interest-rate'"
            ></v-text-field>
          </v-col>
        </v-row>

          <v-row class="ma-0">
          <v-col>
            <v-radio disabled label="Enddatum" value="end-date"></v-radio>
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
          <v-col v-if="sparrInput.endpoint=='end-date'" class="pa-0">
            <v-card v-text="props.apiResponseEntnahme?props.apiResponseEntnahme.end:''" :color="props.apiResponseEntnahme?'#81C994':''"></v-card>
          </v-col>
          <v-col class="pa-0">      
            <v-text-field
              style="border: 3px solid #00476B;"
              density="compact"
              v-model="entnahmeInput.end"
              required
              hide-details
              type="date"
              class="bg-white rounded"
              :disabled="entnahmeInput.endpoint==''||entnahmeInput.endpoint=='end-date'"
            ></v-text-field>
          </v-col>

        </v-row>
        <v-row class="mx-0">
          <v-col>
            <v-radio label="Endkapital" value="capital"></v-radio>
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
          <v-col v-if="sparrInput.endpoint=='capital'">
              <v-card v-text="props.apiResponseEntnahme?props.apiResponseEntnahme.capitalResult.capitalAmount:''" :color="props.apiResponseEntnahme?'#81C994':''"></v-card>
            </v-col>
          <v-col v-else>
            <v-text-field
              prefix="€"
              style="border: 3px solid #00476B;"
              density="compact"
              v-model="entnahmeInput.endValue"
              hide-details
              placeholder="Endkapital"
              type="number"
              step="0.01"
              class="bg-white rounded"
              :disabled="entnahmeInput.endpoint==''||entnahmeInput.endpoint=='capital'"
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
            @click="getData">
            Calculate
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form> 
</template>

<style scoped></style>

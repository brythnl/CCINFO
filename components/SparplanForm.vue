<script lang="ts" setup>
const toFind = ref("")
const einmalZahlung = ref(0);
const dynamik = ref(false);

const dateTime = new Date().toISOString().split('T')[0].toString().replace('/T/','');
const date = new Date();
const todayDate = date.toISOString().split('T')[0].toString().replace('/T/','');
date.setFullYear(date.getFullYear()+10);
const inTenYears = date.toISOString().split('T')[0].toString().replace('/T/','');


const emit = defineEmits<{
  (e: "passInputData", savingPlanInputData:{}): void;
}>();

export interface EmitData{
  beginDate:string,
  endDate:string,
  interestRate: number,
  interestCalculation: string,
  reductionFactor: number,
  dynamicSavingRateFactor: number,
  savingPlanBegin: string,
  savingPlanEnd: string,
  oneTimeInvestment:[],
  oneTimeInvestmentDate: string[],
  savingRate: number,
  endCapital: number,
  endpoint: string,
  emitable: boolean
}

const emitData = {
  beginDate:todayDate,
  endDate: "",
  interestRate:0,
  interestCalculation: "YEARLY",
  reductionFactor:0,
  dynamicSavingRateFactor:0,
  savingPlanBegin:"",
  savingPlanEnd:"",
  oneTimeInvestment:[0],
  oneTimeInvestmentDate:[todayDate],
  savingRate:0,
  endCapital:0,
  endpoint:"",
}

const savingInput=reactive({
  beginDate:todayDate,
  endDate:"",
  interestRate:0,
  interestCalculation: "YEARLY",
  reductionFactor:0,
  dynamicSavingRateFactor:0,
  savingPlanBegin:todayDate,
  savingPlanEnd: inTenYears,
  oneTimeInvestment:[0],
  oneTimeInvestmentDate:[""],
  savingRate:0,
  savingCycle:"MONTHLY",
  endCapital:0,
})

function reset(){
  emitData.endpoint=toFind.value;
  savingInput.oneTimeInvestment=[0];
  savingInput.oneTimeInvestmentDate=[todayDate];
  savingInput.savingRate=0;
  savingInput.savingPlanBegin=todayDate
  savingInput.savingPlanEnd= inTenYears;
  savingInput.interestRate=0;
  savingInput.endDate="";
  savingInput.endCapital=0;
  einmalZahlung.value=0;
  dynamik.value=false;
}

function getData(){
  //console.log(savingInput);
  let validation = inputValidation(JSON.parse(JSON.stringify(savingInput)));
  //emit("passInputData", emitData);
  console.log(emitData);
}

function inputValidation(input:EmitData){
  //console.log(input)
  //Set decimalseperator to dot and and make numbers to integer
  emitData.endCapital = Math.round(formatizeNumbers(input.endCapital) *100);
  emitData.savingRate = Math.round(formatizeNumbers(input.savingRate) *100);
  emitData.interestRate= formatizeNumbers(input.interestRate)*0.01;
  emitData.dynamicSavingRateFactor = formatizeNumbers(input.dynamicSavingRateFactor)*0.01;
  emitData.oneTimeInvestment= input.oneTimeInvestment.map((investement)=>{
    return Math.round((formatizeNumbers(investement))*100);
  })
  //Datevalidation
  emitData.oneTimeInvestmentDate = input.oneTimeInvestmentDate;
  //input.oneTimeInvestmentDate.push(input.savingPlanBegin)
  emitData.beginDate=input.beginDate= findSmallestDate(input.oneTimeInvestmentDate)
  emitData.endDate=input.endDate;
}

function formatizeNumbers(num: number){
  let str:string = num.toString().replace(',', '.');
  return Number(str)
}

function findSmallestDate(dates: string[]){
  dates.sort((a: string, b: string)=>{
    return new Date(a).valueOf()- new Date(b).valueOf();
  })
  return dates[0];
}

function findBiggestDate(dates: string[]){
  dates.sort((a: string, b: string)=>{
    return new Date(b).valueOf()- new Date(a).valueOf();
  })
  return dates[0];
}


function setEndDateToBiggestDate(){
  if(emitData.endpoint=='enddate'){return};
  let tmp: string[] = (JSON.parse(JSON.stringify(savingInput.oneTimeInvestmentDate)))
  tmp.push(JSON.parse(JSON.stringify(savingInput.savingPlanEnd)))
  savingInput.endDate = findBiggestDate(tmp)
}

watch(() =>savingInput.oneTimeInvestmentDate,()=>{
    setEndDateToBiggestDate()
  
}, { deep:true })

watch(()=> savingInput.endDate, ()=>{
  
    let tmp: string[] = (JSON.parse(JSON.stringify(savingInput.oneTimeInvestmentDate)))
    tmp.push(JSON.parse(JSON.stringify(savingInput.savingPlanEnd)))
    let biggestDate: string = findBiggestDate(tmp);
    if(new Date(savingInput.endDate) < new Date(biggestDate) && savingInput.endDate[0]!=='0'){
      savingInput.endDate = biggestDate;
    }
  
})
</script>

<template>
  <p>Was möchten Sie berechnen ?</p>
  <v-form>
    <v-container>
      <v-radio-group
        v-model="toFind"
        @update:model-value="reset">

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
                      v-model="savingInput.oneTimeInvestment[0]"
                      required
                      hide-details
                      placeholder="Startkapital"
                      type="number"
                      step="0.01"
                      class="bg-white rounded"
                      :disabled="toFind==''||toFind=='startcapital'"
                    ></v-text-field>
                  </v-col>

                  <v-col class="pa-0 ms-2">
                    <v-text-field
                      style="border: 3px solid #00476B;"
                      density="compact"
                      v-model="savingInput.oneTimeInvestmentDate[0]"
                      hide-details
                      type="date"
                      class="bg-white rounded"
                      :disabled="toFind==''||toFind=='startcapital'"
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
                      v-model="savingInput.oneTimeInvestment[n]"
                      hide-details
                      placeholder="weitere Einmalzahlung"
                      type="number"
                      class="bg-white rounded"
                      :disabled="toFind==''||toFind=='startcapital'"
                    ></v-text-field>
                  </v-col>

                  <v-col class="pa-0">
                    <v-text-field
                      style="border: 3px solid #00476B;"
                      density="compact"
                      v-model="savingInput.oneTimeInvestmentDate[n]"
                      hide-details
                      type="date"
                      class="bg-white rounded"
                      :disabled="toFind==''||toFind=='startcapital'"
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
                  :disabled="toFind==''||toFind=='startcapital'"
                  variant="flat"
                  width="200"
                  stacked
                  class="pa-0"
                  text="Neue Einmalzahlung hinzufügen"
                  color="#1B7694">

                  </v-btn>
                  <v-btn 
                  style="border: solid 2px black;" 
                  @click="()=>{einmalZahlung>0?einmalZahlung--:einmalZahlung=0;savingInput.oneTimeInvestment.pop();savingInput.oneTimeInvestmentDate.pop()}" 
                  :disabled="toFind==''||toFind=='startcapital'||einmalZahlung<=0"
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
                      v-model="savingInput.savingRate"
                      required
                      hide-details
                      placeholder="Sparrate"
                      type="number"
                      step="0.01"
                      class="bg-white rounded"
                      :disabled="toFind==''||toFind=='savingrate'"
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
                      <v-radio-group v-model="dynamik" class="pa-0 ma-0" hide-details :disabled="toFind==''||toFind=='savingrate'">
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
                      v-model="savingInput.savingPlanBegin"
                      hide-details
                      type="date"
                      class="bg-white rounded"
                      :disabled="toFind==''||toFind=='savingrate'"
                    ></v-text-field>
                  </v-col>
                  <v-col class="pa-0" cols="4">
                      <v-text-field
                        style="border: 3px solid #00476B;"
                        density="compact"
                        v-model="savingInput.savingPlanEnd"
                        hide-details
                        type="date"
                        class="bg-white rounded"
                        :disabled="toFind==''||toFind=='savingrate'"
                      ></v-text-field>
                  </v-col>
                  <v-col class="pa-0" cols="4">
                      <v-text-field
                        v-if="dynamik"
                        suffix="%"
                        style="border: 3px solid #00476B;"
                        density="compact"
                        v-model="savingInput.dynamicSavingRateFactor"
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
            v-model="savingInput.interestRate"
            required
            hide-details
            placeholder="Sparzins"
            type="number"
            step="1"
            class="bg-white rounded"
            :disabled="toFind==''||toFind=='interestrate'"
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
            v-model="savingInput.endDate"
            required
            hide-details
            type="date"
            class="bg-white rounded"
            :disabled="toFind==''||toFind=='enddate'"
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
            v-model="savingInput.endCapital"
            hide-details
            placeholder="Endkapital"
            type="number"
            step="0.01"
            class="bg-white rounded"
            :disabled="toFind==''||toFind=='endcapital'"
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

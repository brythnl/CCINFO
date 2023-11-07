<script lang="ts" setup>
const toFind = ref("")
const einmalZahlung = ref(0);
const sparrate = ref(0);
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
  endDate: inTenYears,
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
  endpoint:'',
}

const savingInput=reactive({
  beginDate:todayDate,
  endDate:inTenYears,
  interestRate:0,
  interestCalculation: "YEARLY",
  reductionFactor:0,
  dynamicSavingRateFactor:0,
  savingPlanBegin:todayDate,
  savingPlanEnd: inTenYears,
  oneTimeInvestment:[0],
  oneTimeInvestmentDate:[todayDate],
  savingRate:0,
  savingCycle:"MONTHLY",
  endCapital:0,
})

function reset(){
  savingInput.oneTimeInvestment=[0];
  savingInput.oneTimeInvestmentDate=[todayDate];
  savingInput.savingRate=0;
  savingInput.savingPlanBegin=todayDate
  savingInput.savingPlanEnd= inTenYears;
  savingInput.interestRate=0;
  savingInput.endDate='';
  savingInput.endCapital=0;
  einmalZahlung.value=0;
  sparrate.value=0
}
function getData(){
  let validation = inputValidation(JSON.parse(JSON.stringify(savingInput)));
  //emit("passInputData", emitData);
  console.log(emitData);
}

function inputValidation(input:EmitData){
  console.log(input)
  //Set decimalseperator to dot and and make nummers to integer
  emitData.endCapital = Math.round(formatizeNumbers(input.endCapital) *100);
  emitData.savingRate = Math.round(formatizeNumbers(input.savingRate) *100);
  emitData.interestRate= formatizeNumbers(input.interestRate)*0.01;
  emitData.oneTimeInvestment= input.oneTimeInvestment.map((investement)=>{
    return Math.round((formatizeNumbers(investement))*100);
  })
  //Datevalidation
  emitData.oneTimeInvestmentDate = input.oneTimeInvestmentDate;
  input.oneTimeInvestmentDate.push(input.savingPlanBegin)
  emitData.beginDate=input.beginDate= findSmallestDate(input.oneTimeInvestmentDate)
  emitData.endDate=input.endDate
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

function setEnpoint(item: string){
  emitData.endpoint= item; 
  console.log(emitData.endpoint)
}

function setEndDateToBiggestDate(){
  if(emitData.endpoint==('/end-date')){return};
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
                  <v-col class="pa-0" cols="6">
                    <v-radio label="1. Einmalzahlung (Startkapital)" value="startkapital" @click="setEnpoint('/saving-start-value')"></v-radio>
                  </v-col>
                </v-row>
                <v-row class="ma-0">
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
                      :disabled="toFind==''||toFind=='startkapital'"
                    ></v-text-field>
                  </v-col>
                  <v-col class="pa-0">
                    <v-btn style="background-color: inherit;" flat>
                    <v-avatar>
                        <v-img src="~/assets/Information-Icon.png"></v-img>
                    </v-avatar>

                    <v-tooltip activator="parent" location="end" class="w-50">
                      <v-text-field
                      style="border: 3px solid #00476B;"
                      density="compact"
                      v-model="savingInput.oneTimeInvestmentDate[0]"
                      hide-details
                      type="date"
                      class="bg-white rounded"
                      :disabled="toFind==''||toFind=='startkapital'">
                    </v-text-field>
                    </v-tooltip>
                    </v-btn>
                  </v-col>
                  <v-col class="pa-0 ms-2">
                 </v-col>
              </v-row>
            <v-expansion-panel-text>
              <v-row class="ma-0">
                <v-col cols="4" v-if="einmalZahlung==0">
                   <v-row><h5>weitere Einmalzahlung</h5></v-row>
                   <v-row>
                   <v-btn-group 
                   density="compact"
                   variant="tonal"
                   color="#00476B" >
                     <v-btn style="border: solid 1px black;" @click="()=>einmalZahlung++" :disabled="toFind==''||toFind=='startkapital'">+</v-btn>
                     <v-btn style="border: solid 1px black;" @click="()=>{einmalZahlung>0?einmalZahlung--:einmalZahlung=0;}" :disabled="toFind==''||toFind=='startkapital'">-</v-btn>
                   </v-btn-group>
                 </v-row>
                 </v-col>
              </v-row>
              <v-row v-for="n in einmalZahlung" class="ma-0">
                <v-row class="ma-0">
                  <v-col class="pa-1">
                    <v-label>{{ n+1 }}.te Einmalzahlung</v-label>
                  </v-col>
                  <v-col class="pa-0">
                    <v-label>Datum</v-label>
                  </v-col>
                </v-row>
                <v-row class="ma-0">
                  <v-col class="pa-0">
                    <v-text-field
                      prefix="€"
                      style="border: 3px solid #00476B;"
                      density="compact"
                      v-model="savingInput.oneTimeInvestment[n+1]"
                      hide-details
                      placeholder="weitere Einmalzahlung"
                      type="number"
                      class="bg-white rounded"
                      :disabled="toFind==''||toFind=='startkapital'"
                    ></v-text-field>
                  </v-col>
                  
                  <v-col class="pa-0">
                    <v-text-field
                      style="border: 3px solid #00476B;"
                      density="compact"
                      v-model="savingInput.oneTimeInvestmentDate[n+1]"
                      hide-details
                      type="date"
                      class="bg-white rounded"
                      :disabled="toFind==''||toFind=='startkapital'"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                   <v-row><h5>weitere Einmalzahlung</h5></v-row>
                   <v-row>
                   <v-btn-group 
                   density="compact"
                   variant="tonal"
                   color="#00476B" >
                     <v-btn v-if="einmalZahlung==n" style="border: solid 1px black;" @click="()=>einmalZahlung++" :disabled="toFind==''||toFind=='startkapital'">+</v-btn>
                     <v-btn v-bind:id="n" style="border: solid 1px black;" @click="()=>{einmalZahlung>0?einmalZahlung--:einmalZahlung=0; savingInput.oneTimeInvestmentDate.splice(n +1, 1); savingInput.oneTimeInvestment.splice(n +1, 1);}" :disabled="toFind==''||toFind=='startkapital'">-</v-btn>
                   </v-btn-group>
                 </v-row>
                 </v-col>
                </v-row>
              </v-row>
              </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      <v-row>
        <v-radio label="Sparrate" value="sparrate" @click="setEnpoint('/saving-rate')"></v-radio></v-row>
      <v-row>
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
            :disabled="toFind==''||toFind=='sparrate'"
          ></v-text-field>
        </v-col>
        <v-col cols="3" class="ma-auto">
          <v-btn style="background-color: inherit;" flat>
            <v-avatar class="ma-auto">
                <v-img src="~/assets/Information-Icon.png"></v-img>
            </v-avatar>
            <v-tooltip activator="parent" location="end" class="w-50">
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
               sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
            </v-tooltip>
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-radio label="Sparzins" value="sparzins" @click="setEnpoint('/interest-rate')"></v-radio></v-row>
      <v-row>
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
            :disabled="toFind==''||toFind=='sparzins'"
          ></v-text-field>
        </v-col>
        <v-col cols="3" class="ma-auto">
          <v-btn style="background-color: inherit;" flat>
            <v-avatar class="ma-auto">
                <v-img src="~/assets/Information-Icon.png"></v-img>
            </v-avatar>
            <v-tooltip activator="parent" location="end" class="w-50">
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
               sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
            </v-tooltip>
          </v-btn>
        </v-col>
      </v-row>
      <v-row><v-radio label="Enddatum" value="enddatum" @click="setEnpoint('/end-date')"></v-radio></v-row>
      <v-row>
        <v-col class="pa-0">      
          <v-text-field
            style="border: 3px solid #00476B;"
            density="compact"
            v-model="savingInput.endDate"
            required
            hide-details
            type="date"
            class="bg-white rounded"
            :disabled="toFind==''||toFind=='enddatum'"
          ></v-text-field>
        </v-col>
        
      </v-row>
      <v-row class="ma-0">
        <v-col class="pa-0">
        <v-radio label="Endkapital" value="endkapital" @click="determineEndpoint('endcapital')"></v-radio>
      </v-col>
        <v-col class="pa-0">
          <v-btn style="background-color: inherit;" flat>
            <v-avatar class="ma-auto">
                <v-img src="~/assets/Information-Icon.png"></v-img>
            </v-avatar>
            <v-tooltip activator="parent" location="end" class="w-50">
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
               sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
            </v-tooltip>
          </v-btn>
        </v-col>
      </v-row>
      <v-row><v-radio label="Endkapital" value="endkapital" @click="setEnpoint('/capital')"></v-radio></v-row>
      <v-row>
        <v-col class="pa-0">
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
            :disabled="toFind==''||toFind=='endkapital'"
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

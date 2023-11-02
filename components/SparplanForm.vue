<script lang="ts" setup>
const toFind = ref("")
const einmalZahlung = ref(0);
const dateTime = new Date().toISOString().split('T')[0].toString().replace('/T/','');

const emit = defineEmits<{
  (e: "passInputData", savingPlanInputData:{}): void;
}>();

export interface EmitData{
  startCapital: number,
  savingRate: number,
  interestRate: number,
  startDate:string,
  endDate:string,
  interestCalculation: string,
  endCapital: number,
  endpoint: string
}

const emitData = {
  startCapital:0,
  savingRate:0,
  interestRate:0,
  startDate:dateTime,
  endDate:"",
  interestCalculation: "YEARLY",
  endCapital:0,
  endpoint:''
}

const date = new Date();
const todayDate = date.toISOString().split('T')[0].toString().replace('/T/','');
date.setFullYear(date.getFullYear()+10);
const inTenYears = date.toISOString().split('T')[0].toString().replace('/T/','');


const savingInput=reactive({
  beginDate:todayDate,
  endDate:inTenYears,
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
})

function reset(){
  savingInput.oneTimeInvestment=[0];
  oneTimeInvestmentDate:[todayDate];
  savingInput.savingRate=0;
  savingInput.interestRate=0;
  savingInput.endDate=inTenYears;
  savingInput.endCapital=0;
  einmalZahlung.value=0;
}
function getData(){
  inputValidation(JSON.parse(JSON.stringify(savingInput)))
  emit("passInputData", emitData);
  
}

function inputValidation(input:EmitData){
  emitData.startCapital = formatizeNumbers(input.startCapital) * 100;
  emitData.endCapital = formatizeNumbers(input.endCapital) *100;
  emitData.savingRate = formatizeNumbers(input.savingRate) * 100;
  emitData.interestRate= formatizeNumbers(input.interestRate)*0.01;
  emitData.endDate = input.endDate || '2023-12-12';
  return input;
}

function formatizeNumbers(num: number){
  let str:string = num.toString();
  str = str.replace(',', '.');
  if(str.split('.').length > 1){
    str = (str.split('.'))[0] + '.' +(str.split('.'))[1].substring(0, 2);
  }
  return Number(str)
}
function determineEndpoint(item: string){
  switch(item){
    case 'startcapital':{
      emitData.endpoint = '/saving-start-value';
      break;
    }
    case 'savingrate':{
      emitData.endpoint = '/saving-rate';
      break;
    }
    case 'interestrate':{
      emitData.endpoint = '/interest-rate';
      break;
    }
    case 'enddate':{
      emitData.endpoint = '/end-date';
      break;
    }
    case 'endcapital':{
      emitData.endpoint = '/capital';
      break;
    }
    
  }
}
</script>

<template>
  <p>Was möchten Sie berechnen ?</p>
  
  <v-form>
    <v-container>
      <v-radio-group 
      v-model="toFind"
      @update:model-value="reset">
        <v-row >
          <v-radio label="Startkapital" value="startkapital" @click="determineEndpoint('startcapital')"></v-radio>
        </v-row>
        <v-row>
        <v-col class="pa-0">
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
        <v-col cols="2" class="pa-0">
          <v-btn style="background-color: inherit;" flat>
            <v-avatar>
                <v-img src="~/assets/Information-Icon.png"></v-img>
            </v-avatar>
            <v-tooltip activator="parent" location="end" class="w-50">
              This parameter defines any number of one-time cash inflows.
            </v-tooltip>
          </v-btn>
        </v-col>
        <v-col cols="4">
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
      <v-row v-for="n in einmalZahlung">
        <v-col class="pa-0">
          <v-text-field
            prefix="€"
            style="border: 3px solid #00476B;"
            density="compact"
            v-model="savingInput.oneTimeInvestment[n]"
            hide-details
            placeholder="weitere Einmalzahlung"
            type="number"
            class="bg-white rounded ma-3"
            :disabled="toFind==''||toFind=='startkapital'"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field
            style="border: 3px solid #00476B;"
            density="compact"
            v-model="savingInput.oneTimeInvestmentDate[n]"
            hide-details
            type="date"
            class="bg-white rounded"
            :disabled="toFind==''||toFind=='startkapital'"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-radio label="Sparrate" value="sparrate" @click="determineEndpoint('savingrate')"></v-radio></v-row>
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
        <v-radio label="Sparzins" value="sparzins" @click="determineEndpoint('interestrate')"></v-radio></v-row>
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
      <v-row><v-radio label="Enddatum" value="enddatum" @click="determineEndpoint('enddate')"></v-radio></v-row>
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
      <v-row><v-radio label="Endkapital" value="endkapital" @click="determineEndpoint('endcapital')"></v-radio></v-row>
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
    </v-radio-group>
      <v-row>
        <v-col>
          <v-btn
            block
            class="text-none mb-4"
            color="#00476B"
            size="x-large"
            variant="flat"
            @click="getData"
          >
            Calculate
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<style scoped></style>

<script lang="ts" setup>
const toFind = ref("")
const dateTime = new Date().toISOString().split('T')[0].toString().replace('/T/','');
const savingInput=reactive({
  startCapital:0,
  savingRate:0,
  interestRate:0,
  startDate:dateTime,
  endDate:"",
  interestCalculation: "YEARLY",
  endCapital:0,
})
function reset(){
  savingInput.startCapital=0;
  savingInput.savingRate=0;
  savingInput.interestRate=0;
  savingInput.endDate="";
  savingInput.endCapital=0;
}
function getData(){
  savingInput.interestRate = savingInput.interestRate/100;
  console.log(savingInput);
}

function determineEndpoint(item: string){
  let endpoint: string ='';
  switch(item){
    case 'startcapital':{
      endpoint = '/saving-start-value';
      break;
    }
    case 'savingrate':{
      endpoint = '/saving-rate';
      break;
    }
    case 'interestrate':{
      endpoint = '/interest-rate';
      break;
    }
    case 'enddate':{
      endpoint = '/end-date';
      break;
    }
    case 'endcapital':{
      endpoint = '/capital';
      break;
    }
    
  }
  console.log(`Es wird ${endpoint} aufgerufen`)
}

</script>

<template>
  <p>Was möchten Sie berechnen ?</p>
  
  <v-form>
    <v-container>
      <v-radio-group 
      v-model="toFind"
      @update:model-value="reset">
        <v-row>
          <v-radio label="Startkapital (€)" value="startkapital" @click="determineEndpoint('startcapital')"></v-radio>
        </v-row>
        <v-row>
        <v-col>
          <v-text-field
            v-model="savingInput.startCapital"
            required
            hide-details
            placeholder="Startkapital (€)"
            type="number"
            step="0.01"
            class="bg-white rounded"
            :disabled="toFind==''||toFind=='startkapital'"
          ></v-text-field>
        </v-col>
        <v-col cols="3" class="ma-auto">
          <v-btn style="background-color: inherit;" flat>
            <v-avatar class="ma-auto">
                <v-img src="~/assets/Information-Icon.png"></v-img>
            </v-avatar>
              Details
            <v-tooltip activator="parent" location="end" class="w-50">
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
               sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
            </v-tooltip>
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-radio label="Sparrate (€)" value="sparrate" @click="determineEndpoint('savingrate')"></v-radio></v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="savingInput.savingRate"
            required
            hide-details
            placeholder="Sparrate (€)"
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
              Details
            <v-tooltip activator="parent" location="end" class="w-50">
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
               sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
            </v-tooltip>
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-radio label="Sparzins (%)" value="sparzins" @click="determineEndpoint('interestrate')"></v-radio></v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="savingInput.interestRate"
            required
            hide-details
            placeholder="Sparzins (%)"
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
              Details
            <v-tooltip activator="parent" location="end" class="w-50">
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
               sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
            </v-tooltip>
          </v-btn>
        </v-col>
      </v-row>
      <v-row><v-radio label="Enddatum" value="enddatum" @click="determineEndpoint('enddate')"></v-radio></v-row>
      <v-row>
        <v-col>      
          <v-text-field
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
              Details
            <v-tooltip activator="parent" location="end" class="w-50">
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
               sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
            </v-tooltip>
          </v-btn>
        </v-col>
      </v-row>
      <v-row><v-radio label="Endkapital (€)" value="endkapital" @click="determineEndpoint('endcapital')"></v-radio></v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="savingInput.endCapital"
            hide-details
            placeholder="Endkapital (€)"
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
              Details
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
            color="indigo-darken-3"
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

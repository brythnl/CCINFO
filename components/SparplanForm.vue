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

</script>

<template>
  <p>Was möchten Sie berechnen ?</p>
  
  <v-form>
    <v-container>
      <v-radio-group 
      v-model="toFind"
      @update:model-value="reset">
        <v-row>
        <v-col>
          <v-radio label="Startkapital (€)" value="startkapital"></v-radio>
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
      </v-row>
      <v-row>
        <v-col>
          <v-radio label="Sparrate (€)" value="sparrate"></v-radio>
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
      </v-row>
      <v-row>
        <v-col>
          <v-radio label="Sparzins (%)" value="sparzins"></v-radio>
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
      </v-row>
      <v-row>
        <v-col>
          <v-radio label="Enddatum" value="enddatum"></v-radio>
          <v-text-field
            v-model="savingInput.endDate"
            required
            hide-details
            type="date"
            class="bg-white rounded"
            :disabled="toFind==''||toFind=='enddatum'"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-radio label="Endkapital (€)" value="endkapital"></v-radio>
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

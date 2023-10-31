<script lang="ts" setup>
const toFind = ref("")
const withdrawInput=reactive({
  startCapital:0,
  withdrawRate:0,
  interestRate:0,
  endDate:"",
  interestCalculation: "YEARLY",
  endCapital:0,
})
function reset(){
  withdrawInput.startCapital=0;
  withdrawInput.withdrawRate=0;
  withdrawInput.interestRate=0;
  withdrawInput.endDate="";
  withdrawInput.endCapital=0;
}
function getData(){
  withdrawInput.interestRate = withdrawInput.interestRate/100;
  console.log(withdrawInput);
}
</script>

<template>
  <div>
    <p>Was möchten Sie berechnen ?</p>
  
  <v-form>
    <v-container>
      <v-radio-group 
      v-model="toFind"
      @update:model-value="reset">
        <v-row><v-radio label="Startkapital (€)" value="startkapital"></v-radio></v-row>
        <v-row>
        <v-col>
          <v-text-field
            v-model="withdrawInput.startCapital"
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
      <v-row><v-radio label="Entnahmerate (€)" value="entnahmerate"></v-radio></v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="withdrawInput.withdrawRate"
            required
            hide-details
            placeholder="Entnahmerate (€)"
            type="number"
            step="0.01"
            class="bg-white rounded"
            :disabled="toFind==''||toFind=='entnahmerate'"
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
      <v-row><v-radio label="Sparzins (%)" value="entnahmezins"></v-radio></v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="withdrawInput.interestRate"
            required
            hide-details
            placeholder="Sparzins (%)"
            type="number"
            step="1"
            class="bg-white rounded"
            :disabled="toFind==''||toFind=='entnahmezins'"
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
      <v-row><v-radio label="Enddatum" value="enddatum"></v-radio></v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="withdrawInput.endDate"
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
      <v-row><v-radio label="Endkapital (€)" value="endkapital"></v-radio></v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="withdrawInput.endCapital"
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
  </div>
</template>

<style scoped></style>

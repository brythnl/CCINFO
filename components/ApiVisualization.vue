<script lang="ts" setup>

//Dummy Data
const req = ref({
  "end": "2030-01-01",
  "savingRate":100,
  "oneTimeInvestment":[1000],
  "oneTimeInvestmentDate":["2020-01-01"],
  "interestRate":0.05
})

const data = ref({
  "capitalResult": {
    "capitalAmount": 42332.44262861051,
    "savingRate": 100,
    "startInvestment": 1000,
    "interestRate": 0.05,
    "end": "2040-01-01"
  },
  "capitalSeries": [
    2250,
    3562.5,
    4940.625,
    6387.65625,
    7907.0390625,
    9502.391015625,
    11177.51056640625,
    12936.386094726562,
    14783.20539946289,
    16722.365669436032,
    18758.483952907834,
    20896.408150553227,
    23141.22855808089,
    25498.289985984935,
    27973.204485284183,
    30571.86470954839,
    33300.45794502581,
    36165.4808422771,
    39173.75488439096,
    42332.44262861051
  ]
})
const find = ref("a");

</script>

<template>
  <div>
    <h1 class="text-center">API</h1>
  </div>
  <v-divider></v-divider>
  <div>
    <h4>Suchbegriffe: </h4>
    <v-divider></v-divider>
    <v-sheet>
      <v-btn-toggle v-model="find" divided color="#1B7694" rounded="100">
        <v-slide-group show-arrows>
          <v-slide-group-item>
          <v-btn value="startInvestment" rounded="100"><v-chip size="small">Startkapital</v-chip></v-btn>
          <v-btn value="startValue"><v-chip size="small">Startbetrag</v-chip></v-btn>
          <v-btn value="capitalAmount" ><v-chip size="small">Endkapital</v-chip></v-btn>
          <v-btn value="savingRate"><v-chip size="small">Sparrate</v-chip></v-btn>
          <v-btn value="interestRate"><v-chip size="small">Zinssatz</v-chip></v-btn>
          <v-btn value="compoundInterest" ><v-chip size="small">Zinseszins</v-chip></v-btn>
          <v-btn value="capitalSeries" ><v-chip size="small">Kapitalserien</v-chip></v-btn>
          <v-btn value="end" ><v-chip size="small">Enddatum</v-chip></v-btn>
          <v-btn value="begin" ><v-chip size="small">Begindatum</v-chip></v-btn>
          <v-btn value="oneTimeInvestment" ><v-chip size="small">Einmalzahlungen</v-chip></v-btn>
          <v-btn value="oneTimeInvestmentDate" ><v-chip size="small">Datum der Enmalzahlungen</v-chip></v-btn>
          <v-btn value="dynamicSavingRateFactor" ><v-chip size="small">Dynamik</v-chip></v-btn>
          <v-btn value="interestCalculation" ><v-chip size="small">Zinsberechnung</v-chip></v-btn>
          <v-btn value="savingPlanBegin" ><v-chip size="small">Sparplansstart</v-chip></v-btn>
          <v-btn value="savingPlanEnd" ><v-chip size="small">Sparplansend</v-chip></v-btn>
          </v-slide-group-item>
        </v-slide-group>
      </v-btn-toggle>
    </v-sheet>
    <v-divider></v-divider>
  </div>
  <v-card class="overflow-y-auto bg-grey-darken-4" max-height="800" variant="outlined">
    <v-card-item>
      <v-card-text>
        <code>Request {</code>
        <div v-for="(item,index) in req">
          <code class="ps-5" :class="index==find?'bg-green-accent-2':''"> "{{ index }}": {{ item }} <br></code>
        </div>
        <code>} <br><br></code>

        <code>Response {</code>
        <div v-for="(item,index) in data">
          <div v-if="index=='capitalResult'">
            <code class="ps-5" :class="index==find?'bg-green-accent-2':''"> "{{ index }}": { <br></code>
            <code v-for="(subitem,subindex) in item" class="ps-10" :class="subindex==find?'bg-green-accent-2':''">
              "{{ subindex }}": {{ subitem }},<br>
            </code>
            <code class="ps-5">} <br></code>
          </div>
          <div v-else-if="index=='capitalSeries'">
            <code class="ps-5" :class="index==find?'bg-green-accent-2':''"> "{{ index }}": [ <br></code>
            <code v-for="(subitem,subindex) in item" class="ps-10" :class="subindex==find?'bg-green-accent-2':''">
              {{ subitem }},<br>
            </code>
            <code class="ps-5">] <br></code>
          </div>

          <code v-else class="ps-5" :class="index==find?'bg-green-accent-2':''">"{{index}}": {{ item }},</code>
        </div>
        <code>}</code>
      </v-card-text>
    </v-card-item>
  </v-card>
</template>

<style scoped></style>

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
    <h1>API</h1>
  </div>
  <div>
    <v-btn-toggle v-model="find">
      <v-btn value="startInvestment"><v-chip>Startkapital</v-chip></v-btn>
      <v-btn value="savingRate"><v-chip>Sparrate</v-chip></v-btn>
      <v-btn value="interestRate"><v-chip>Sparzins</v-chip></v-btn>
      <v-btn value="end"><v-chip>Enddatum</v-chip></v-btn>
      <v-btn value="capitalAmount"><v-chip>Endkapital</v-chip></v-btn>
    </v-btn-toggle>
  </div>
  <v-card class="overflow-y-auto bg-grey-darken-4" max-height="800" variant="outlined">
    <v-card-item>
      <v-card-text>
        <code>Request {</code>
        <div v-for="(item,index) in req">
          <code class="ps-5" :class="index==find?'bg-green-accent-2':''">{{ index }}": {{ item }} <br></code>
        </div>
        <code>}</code>
        <code>Response {</code>
        <div v-for="(item,index) in data">
          <code class="ps-5" :class="index==find?'bg-green-accent-2':''">{{ index }}": { <br></code>
          <code v-for="(subitem,subindex) in item" class="ps-10" :class="subindex==find?'bg-green-accent-2':''">
            "{{ subindex }}": {{ subitem }},<br>
          </code>
          <code class="ps-5">} <br></code>
          <code>}</code>
        </div>
      </v-card-text>
    </v-card-item>
  </v-card>
</template>

<style scoped></style>

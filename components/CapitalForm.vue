<script lang="ts" setup>

const API_TOKEN = ""

const capitalInput = reactive({
  beginDate: "",
  endDate: "",
  interestRate: 0,
  interestCalculation: "",
  savingRate: 0
})

async function getEndCapital() {
  const { data } = await useFetch('https://demo.portal.aixigo.cloud:443/finance-math/capital', {
    query: { begin: capitalInput.beginDate, end: capitalInput.endDate, interestRate: capitalInput.interestRate, interestCalculation: capitalInput.interestCalculation, savingRate: capitalInput.savingRate },
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${API_TOKEN}`
    }
  })
  console.log(toRaw(data.value))
}

</script>

<template>
  <v-form>
    <v-container>
      <v-row>
        <v-col cols="12" md="4">
          <input
            type="date"
            v-model="capitalInput.beginDate"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4">
          <input
            type="date"
            v-model="capitalInput.endDate"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="capitalInput.interestRate"
            label="Interest rate"
            required
            hide-details
            type="number"
            step="0.01"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            v-model="capitalInput.interestCalculation"
            clearable
            label="Interest calculation"
            :items="['YEARLY', 'MONTHLY', 'DAILY']"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="capitalInput.savingRate"
            label="Saving rate"
            required
            hide-details
            type="number"
            step="0.01"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4">
          <v-btn
            :disabled="loading"
            :loading="loading"
            block
            class="text-none mb-4"
            color="indigo-darken-3"
            size="x-large"
            variant="flat"
            @click="getEndCapital"
          >
            Get end capital
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<style scoped></style>

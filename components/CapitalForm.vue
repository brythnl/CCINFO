<script setup lang="ts">
import type { CapitalData } from "~/pages/capital.vue";

const emit = defineEmits<{
  (e: "fetch", capitalData: CapitalData): void;
}>();

const capitalInput = reactive({
  beginDate: "",
  endDate: "",
  interestRate: 0,
  interestCalculation: "",
  savingRate: 0,
});

const API_TOKEN = "";

async function fetchCapitalData() {
  const { data, error } = await useFetch<CapitalData>(
    "https://demo.portal.aixigo.cloud:443/finance-math/capital",
    {
      query: {
        begin: capitalInput.beginDate,
        end: capitalInput.endDate,
        interestRate: capitalInput.interestRate,
        interestCalculation: capitalInput.interestCalculation,
        savingRate: capitalInput.savingRate,
      },
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
    }
  );

  console.log(toRaw(data.value));
  console.log(toRaw(error.value));

  emit("fetch", toRaw(data.value));
}
</script>

<template>
  <h1>Capital Calculation</h1>
  <v-form>
    <v-container>
      <v-row>
        <v-col>
          <v-text-field
            v-model="capitalInput.beginDate"
            label="Begin Date"
            required
            hide-details
            type="date"
            class="bg-white rounded"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="capitalInput.endDate"
            label="End Date"
            required
            hide-details
            type="date"
            class="bg-white rounded"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="capitalInput.interestRate"
            label="Interest Rate"
            required
            hide-details
            type="number"
            step="0.01"
            class="bg-white rounded"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-select
            v-model="capitalInput.interestCalculation"
            clearable
            label="Interest Calculation"
            :items="['YEARLY', 'MONTHLY', 'DAILY']"
            class="bg-white rounded"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="capitalInput.savingRate"
            label="Saving Rate"
            required
            hide-details
            type="number"
            step="0.01"
            class="bg-white rounded"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn
            block
            class="text-none mb-4"
            color="indigo-darken-3"
            size="x-large"
            variant="flat"
            @click="fetchCapitalData"
          >
            Calculate
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<style scoped></style>

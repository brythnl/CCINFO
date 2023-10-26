<script lang="ts" setup>
const beginDate = ref("");
const endDate = ref("");
const interestRate = ref(0);
const interestCalculation = ref("");
const savingRate = ref(0);

function getEndCapital() {}
</script>

<template>
  <v-form>
    <v-container>
      <v-row>
        <v-col cols="12" md="4">
          <v-date-picker
            v-model="beginDate"
            input-text="Begin date"
            input-mode="keyboard"
            hide-actions
          ></v-date-picker>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4">
          <v-date-picker
            v-model="endDate"
            input-text="End date"
            input-mode="keyboard"
            hide-actions
          ></v-date-picker>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="interestRate"
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
            v-model="interestCalculation"
            clearable
            label="Interest calculation"
            :items="['YEARLY', 'MONTHLY', 'DAILY']"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="savingRate"
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

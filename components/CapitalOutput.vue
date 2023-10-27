<script setup lang="ts">
import type { CapitalData } from "~/pages/capital.vue";

defineProps<{
  capitalData: CapitalData;
}>();
</script>

<template>
  <div>
    <h1 v-if="!capitalData">API Visualization</h1>
    <v-expansion-panels v-else>
      <v-expansion-panel>
        <v-expansion-panel-title>API Visualization</v-expansion-panel-title>
        <v-expansion-panel-text>
          <div v-for="(values, property) in capitalData">
            <h2>{{ property }}</h2>
            <ul>
              <li v-for="(value, valueType) in values">
                {{ valueType }} = {{ value }}
              </li>
            </ul>
          </div></v-expansion-panel-text
        >
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<style scoped></style>

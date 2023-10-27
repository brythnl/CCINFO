<script lang="ts" setup>
const props = defineProps({
  data:[]
});
</script>

<template>
  <div>
    <h1 v-if="!$data">API Visualization</h1>
    <v-expansion-panels v-else>
      <v-expansion-panel>
      <v-expansion-panel-title>API Visualization</v-expansion-panel-title>
      <v-expansion-panel-text>
        <div v-for="(items,index) in data">
          <h2>{{index}}</h2>
          <ul>
            <li v-for="(item,i) in items"> {{ i }} = {{ item }}</li>
          </ul>
        </div></v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    
  </div>
</template>

<style scoped></style>

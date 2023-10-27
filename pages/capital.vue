<script lang="ts" setup>
import { ref } from 'vue'
//const result = ref();
const newResult = ref();
function calculateForm(res:[]){
  newResult.value=res;
  //console.log(newResult.value[]);
}
</script>

<template>
  <v-container class="h-100 ma-10">
    <v-row class="h-100">
      <v-col cols="3" class="h-100 rounded-lg bg-cyan-darken-3 ma-2">
    <div class="w-100 h-100">
      <capital-form @calculated="calculateForm"/>
    </div>
  </v-col>
  <v-col class="h-100 rounded-lg bg-cyan-darken-3 ma-2">
    <div class="w-100 h-100">
      <capital-graph/>
    </div>
  </v-col>
    <v-col class="h-100 rounded-lg bg-cyan-darken-3 ma-2">
    <div class="w-100 h-100">
      <capital-output :data="newResult"/>
    </div>
  </v-col>
  </v-row>
</v-container>
</template>

<style scoped></style>

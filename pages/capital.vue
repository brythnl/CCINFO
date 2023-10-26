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
  <div>
    <div>
      <capital-form @calculated="calculateForm"/>
    </div>
    <div>
      <capital-output :data="newResult"/>
    </div>
  </div>
</template>

<style scoped></style>

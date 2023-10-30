<script lang="ts" setup>
const planSelect = ref("saving")
const emit = defineEmits(['tabUpdate'])
function tabUpdate(){
  console.log(planSelect.value)
  emit('tabUpdate',planSelect.value);
}
</script>

<template>
  <div>
    <v-tabs v-model="planSelect" @update:model-value="tabUpdate" class="bg-cyan-darken-3">
      <v-tab value="saving">Sparen</v-tab>
      <v-tab value="withdraw">Entnahme</v-tab>
      <v-tab value="comb">Kombi</v-tab>
    </v-tabs>
  </div>
</template>

<style scoped></style>

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
    <v-tabs
        v-model="planSelect"
        height="70"
        @update:model-value="tabUpdate"
        grow
        stacked
        bg-color="#4195AC"
        class="rounded-lg"
    >
      <v-tab value="saving">
        <v-icon size="x-large">mdi-plus</v-icon>
        Sparen
      </v-tab>
      <v-tab value="withdraw">
        <v-icon size="x-large">mdi-minus</v-icon>
        Entnahme
        </v-tab>
      <v-tab value="comb">
        <v-icon size="x-large">mdi-plus-minus</v-icon>
        Kombi
        </v-tab>
    </v-tabs>
  </div>
</template>

<style scoped></style>

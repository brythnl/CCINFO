<script lang="ts" setup>
const planSelect = ref("saving")
const emit = defineEmits(['tabUpdate'])
function tabUpdate(){
  emit('tabUpdate',planSelect.value);
}
</script>

<template>
  <div>
    <v-tabs
        v-model="planSelect"
        @update:model-value="tabUpdate"
        grow
        hide-slider
        stacked
        class="rounded-lg black-border text-primary"
        selected-class="bg-primary"
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

<style scoped>
.black-border {
  border: 1px solid #4195AC;
}
</style>

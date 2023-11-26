<script lang="ts" setup>
const planSelect = ref("aktuell")
const emit = defineEmits(['grafikUpdate'])
function grafikUpdate(){
  emit('grafikUpdate',planSelect.value);
}
</script>

<template>

  <v-tabs
      v-model="planSelect"
      @update:model-value="grafikUpdate"
      density="compact"
      grow
      stacked
      hide-slider
      class="rounded-lg black-border text-primary"
      selected-class="bg-primary"
  >
    <v-tab value="aktuell">Grafik<br>aktuell</v-tab>
    <v-tab value="vorher">Grafik<br>vorher</v-tab>
    <v-tab value="vergleich">Vergleich</v-tab>
    <v-tab value="tabelle">Tabelle</v-tab>
  </v-tabs>
</template>

<style scoped>
.v-tab {
  text-transform: none !important;
}

.black-border {
  border: 1px solid #4195AC;
}
</style>

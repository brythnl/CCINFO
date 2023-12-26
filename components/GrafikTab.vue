<script lang="ts" setup>
const planSelect = ref("aktuell");

const props = defineProps(["callsTwoSameEndpoints"])

const emit = defineEmits(["grafikUpdate"]);

function grafikUpdate() {
  emit("grafikUpdate", planSelect.value);
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
    class="rounded-lg blue-border text-primary"
    selected-class="bg-primary"
  >
    <v-tab value="aktuell">Grafik</v-tab>
    <v-tab value="vergleich" :disabled="!callsTwoSameEndpoints">Vergleich</v-tab>
    <v-tab value="tabelle">Tabelle</v-tab>
  </v-tabs>
</template>

<style scoped>
.v-tab {
  text-transform: none !important;
}

.blue-border {
  border: 1px solid #4195AC;
}


</style>

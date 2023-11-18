<script lang="ts" setup>
const planSelect = ref("aktuell")
const emit = defineEmits(['grafikUpdate'])
function grafikUpdate(){
  emit('grafikUpdate',planSelect.value);
}
</script>

<template>
  <div
  class="d-flex align-center flex-column">
    <v-btn-toggle
    v-model="planSelect"
    @update:model-value="grafikUpdate"
    rounded="xl"
    divided
    density="compact"
    class="justify-center"
    color="#4195AC"
    mandatory>
      <v-btn value="aktuell">Grafik aktuell</v-btn>
      <v-btn value="vorher">Grafik vorher</v-btn>
      <v-btn value="vergleich">Vergleich</v-btn>
      <v-btn value="tabelle">Tabelle</v-btn>
    </v-btn-toggle>
  </div>
</template>

<style scoped></style>

<script lang="ts" setup>
const planSelect = ref("aktuell")
const emit = defineEmits(['grafikUpdate'])
function grafikUpdate(){
  emit('grafikUpdate',planSelect.value);
}
</script>

<template>
  <div>
    <v-tabs
    v-model="planSelect"
    @update:model-value="grafikUpdate"
    color="#B2B2B2" bg-color="#00476B"
    align-tabs="center">
      <v-tab value="aktuell" elevation="5">
        <h3>Grafik aktuell</h3>
      </v-tab>
      
      <v-tab value="vorher" elevation="5">
        <h3>Grafik vorher</h3>
      </v-tab>

      <v-tab value="vergleich" elevation="5">
        <h3>Vergleich</h3>
      </v-tab>

      <v-tab value="tabelle" elevation="5">
        <h3>Tabelle</h3>
      </v-tab>

    </v-tabs>
  </div>
</template>

<style scoped></style>

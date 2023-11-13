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
    <v-tabs v-model="planSelect" height="100" @update:model-value="tabUpdate" grow color="#B2B2B2" bg-color="#00476B">
      <v-tab value="saving" elevation="5">
        <v-container>
          <v-row>
            <v-avatar rounded="0" size="50" class="ma-auto">
              <v-img src="~/assets/Sparen-Grafik.png" alt="Sparen-Icon"></v-img>
            </v-avatar>
          </v-row>
          <v-row>
            <h4>Sparen</h4>
          </v-row>
      </v-container>
      </v-tab>
      <v-tab value="withdraw" elevation="5">
        <v-container>
          <v-row>
            <v-avatar rounded="0" size="50" class="ma-auto">
              <v-img src="~/assets/Entnahme-Grafik.png" alt="Sparen-Icon"></v-img>
            </v-avatar>
          </v-row>
          <v-row>
            <h4>Entnahme</h4>
          </v-row>
        </v-container>
        </v-tab>
      <v-tab value="comb" elevation="5">
        <v-container>
          <v-row>
            <v-avatar rounded="0" size="50" class="ma-auto">
              <v-img src="~/assets/Kombi-Grafik.png" alt="Sparen-Icon"></v-img>
            </v-avatar>
          </v-row>
          <v-row>
            <h4>Kombi</h4>
          </v-row>
        </v-container>
        </v-tab>
    </v-tabs>
  </div>
</template>

<style scoped></style>

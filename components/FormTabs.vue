<script lang="ts" setup>
const emit = defineEmits(["tabUpdate"]);

const planSelect = ref("saving");

function tabUpdate() {
  emit("tabUpdate", planSelect.value);
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
      density="compact"
      class="rounded-lg blue-border text-primary"
      selected-class="bg-primary"
    >
      <v-tab value="saving">
        <v-icon size="x-large">mdi-plus</v-icon>
        {{ $t('tabs.saving') }}
      </v-tab>
      <v-tab value="withdraw">
        <v-icon size="x-large">mdi-minus</v-icon>
        {{ $t('tabs.withdraw') }}
      </v-tab>
      <v-tab value="comb">
        <v-icon size="x-large">mdi-plus-minus</v-icon>
        {{ $t('tabs.combination') }}
      </v-tab>
    </v-tabs>
  </div>
</template>

<style scoped>

.v-tab {
  text-transform: none !important;
}

.blue-border {
  border: 1px solid #4195AC;
}
</style>

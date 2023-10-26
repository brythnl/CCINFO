<script lang="ts" setup>
const props = defineProps({
  data:[]
});
</script>

<template>
  <div>
    <div v-for="(items,index) in data">
    <h2>{{index}}</h2>
    <ul>
      <li v-for="(item,i) in items"> {{ i }} = {{ item }}</li>
    </ul>
    </div>
  </div>
</template>

<style scoped></style>

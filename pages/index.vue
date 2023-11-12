<script setup lang="ts"></script>

<template>
  <ClientOnly>
    <graph
      :series="[
        0, 2400, 4824, 7272.24, 9744.9624, 12242.412024000001,
        14764.836144240002, 17312.4845056824,
      ]"
    />
  </ClientOnly>
</template>

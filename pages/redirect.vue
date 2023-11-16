<script setup>
  import { getUserManager } from '../utils/auth';

  const userManager = getUserManager();
  await userManager.signinRedirectCallback();

  navigateTo('/')
</script>
<template>
</template>

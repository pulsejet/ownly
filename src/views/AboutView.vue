<script setup lang="ts">
import AboutComponent from '@/components/landing/AboutComponent.vue';
import { formTabName } from '@/utils';
import { onMounted } from 'vue';

onMounted(() => {
  // Update tab name
  document.title = formTabName('About');
});
</script>

<template>
  <main class="has-background-primary p-2 soft-if-dark">
    <h1 class="title">About Ownly</h1>
    <AboutComponent class="about" />
  </main>
</template>

<style scoped lang="scss">
main {
  overflow-y: auto;
}

.title {
  color: white;
  text-align: center;
  margin-top: 20px;
}
</style>

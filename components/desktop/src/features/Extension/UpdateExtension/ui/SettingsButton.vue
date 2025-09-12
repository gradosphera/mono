<template lang="pug">
q-btn.full-width(color='teal', @click='openSettings') настройки
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const openSettings = () => {
  router.push({ name: 'extension-settings' });
};
</script>

<template lang="pug">
q-btn.full-width(@click='cancel', flat, icon='fas fa-arrow-left') назад
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const cancel = () => {
  router.push({ name: 'one-extension' });
};
</script>

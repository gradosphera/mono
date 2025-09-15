<template lang="pug">
// Основной контент: список проектов или задачи проекта
router-view
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Автоматический редирект на список проектов при заходе на базовый маршрут
watch(
  () => route.name,
  (newRouteName) => {
    if (newRouteName === 'projects') {
      router.replace({ name: 'projects-list' });
    }
  },
  { immediate: true },
);
</script>

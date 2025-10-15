<template lang="pug">
div
  // Заголовок страницы
  h4.q-mb-md Требования проекта

  // Виджет историй (требований)
  StoriesWidget(
    :filter='storiesFilter',
    :canCreate='true',
    :maxItems='50',
    :emptyMessage='"Требований проекта пока нет"'
  )
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { StoriesWidget } from 'app/extensions/capital/widgets/StoryWidget';

const route = useRoute();

// Получаем hash проекта из параметров маршрута
const projectHash = computed(() => route.params.project_hash as string);

// Фильтр для историй проекта
const storiesFilter = computed(() => ({
  project_hash: projectHash.value,
  issue_id: undefined, // Только истории проекта, не задач
}));
</script>

<style lang="scss" scoped>
</style>

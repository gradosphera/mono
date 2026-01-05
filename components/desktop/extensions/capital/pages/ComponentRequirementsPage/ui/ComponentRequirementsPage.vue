<template lang="pug">
div
  // Виджет списка требований в виде таблицы
  RequirementsListWidget(
    :filter='requirementsFilter',
    :maxItems='50'
  )
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { RequirementsListWidget } from 'app/extensions/capital/widgets/RequirementsListWidget';

const route = useRoute();

// Получаем hash проекта из параметров маршрута
const projectHash = computed(() => route.params.project_hash as string);

// Фильтр для требований компонента (включая задачи компонента)
const requirementsFilter = computed(() => ({
  project_hash: projectHash.value,
  show_components_requirements: true,
  show_issues_requirements: true,
}));
</script>

<style lang="scss" scoped>
</style>
